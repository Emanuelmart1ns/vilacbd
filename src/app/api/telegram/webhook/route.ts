import { NextRequest, NextResponse } from "next/server";
import { getAdminDb, getAdminBucket } from "@/lib/firebase-admin";
import { revalidatePath } from "next/cache";
import { Product } from "@/data/products";

async function uploadTelegramPhotoToFirebase(fileId: string): Promise<string> {
  const settingsDoc = await getAdminDb().collection("settings").doc("global").get();
  const botToken = settingsDoc.data()?.socials?.telegramToken;
  if (!botToken) throw new Error("TELEGRAM_BOT_TOKEN não configurada.");
  
  const fileInfoResp = await fetch(`https://api.telegram.org/bot${botToken}/getFile?file_id=${fileId}`);
  const fileInfo = await fileInfoResp.json();
  if (!fileInfo.ok) throw new Error("Erro ao obter info do ficheiro no Telegram.");

  const filePath = fileInfo.result.file_path;
  const downloadUrl = `https://api.telegram.org/file/bot${botToken}/${filePath}`;

  const response = await fetch(downloadUrl);
  const buffer = Buffer.from(await response.arrayBuffer());

  const bucket = getAdminBucket();
  const destination = `bot-uploads/${Date.now()}-${fileId}.jpg`;
  const file = bucket.file(destination);

  await file.save(buffer, {
    metadata: { contentType: "image/jpeg" },
  });
  await file.makePublic();

  return `https://storage.googleapis.com/${bucket.name}/${destination}`;
}

export async function POST(request: NextRequest) {
  let aiResponse: any;
  const db = getAdminDb();
  let chatId = "unknown";
  let text = "";

  try {
    const secretToken = request.headers.get("X-Telegram-Bot-Api-Secret-Token");
    const expectedSecret = process.env.TELEGRAM_WEBHOOK_SECRET;

    if (expectedSecret && secretToken !== expectedSecret) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const update = await request.json();
    const message = update.message;
    if (!message) return NextResponse.json({ ok: true });

    text = (message.text || message.caption || "").trim();
    const photos = message.photo || [];
    const photoIds = photos.length > 0 ? [photos[photos.length - 1].file_id] : [];
    chatId = message.chat.id.toString();

    if (text.toLowerCase().includes("vila")) {
      const settingsDoc = await db.collection("settings").doc("global").get();
      const settings = settingsDoc.data();
      const authorizedId = settings?.socials?.telegramChatId;
      const botToken = settings?.socials?.telegramToken;

      const sendReply = async (replyText: string) => {
        if (!botToken) return;
        await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ chat_id: chatId, text: replyText, parse_mode: "Markdown" })
        });
      };

      if (chatId !== authorizedId) {
        await sendReply("⚠️ Olá. Apenas o administrador autorizado pode interagir com o sistema Vila.");
        return NextResponse.json({ ok: true });
      }

      const historySnap = await db.collection("bot_history").where("chatId", "==", chatId).limit(20).get();
      const history = (historySnap.docs || []).map(doc => {
        const d = doc.data();
        return {
          role: d.role || "user",
          content: d.content || "",
          timestamp: d.timestamp ? (d.timestamp.toDate ? d.timestamp.toDate() : new Date(d.timestamp)) : new Date()
        };
      }).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).slice(0, 15).reverse();

      const [productsSnap, ordersSnap, suppliersSnap, usersSnap] = await Promise.all([
        db.collection("products").get(),
        db.collection("orders").limit(10).get(),
        db.collection("suppliers").get(),
        db.collection("users").get()
      ]);
      
      const products = productsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Product[];
      const orders = ordersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const suppliers = suppliersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const users = usersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      const publicPhotoUrls = [];
      for (const fId of photoIds) {
        try {
          const url = await uploadTelegramPhotoToFirebase(fId);
          publicPhotoUrls.push(url);
        } catch (uploadError) {
          console.error("Erro upload Firebase:", uploadError);
        }
      }

      try {
        const { askAI } = await import("@/lib/ai");
        aiResponse = await askAI(text, { products, history, orders, publicPhotoUrls, settings, suppliers, users });

        await db.collection("bot_history").add({ chatId, role: "user", content: text, timestamp: new Date() });
        await db.collection("bot_history").add({ chatId, role: "assistant", content: aiResponse.message || "", timestamp: new Date() });

        const reasoning = aiResponse.reasoning ? `\n\n*Raciocínio:* _${aiResponse.reasoning}_` : "";

        if (aiResponse.action === "update_product") {
          const { productId, updates } = aiResponse.data;
          if (!productId || !updates) throw new Error("Dados de update_product incompletos.");
          await db.collection("products").doc(productId).update(updates);
          revalidatePath("/loja", "layout");
          await sendReply(`✅ *Produto Atualizado!* \n${aiResponse.message}${reasoning}`);
        }
        else if (aiResponse.action === "update_settings") {
          const { updates } = aiResponse.data;
          await db.collection("settings").doc("global").update(updates);
          revalidatePath("/", "layout");
          revalidatePath("/loja", "layout");
          await sendReply(`⚙️ *Definições Atualizadas!*${reasoning}`);
        }
        else if (aiResponse.action === "bulk_update") {
          const { bulkUpdates } = aiResponse.data;
          if (!bulkUpdates || !Array.isArray(bulkUpdates)) {
             // Fallback: se a IA mandou o objeto no sítio errado, tentar corrigir
             const possibleBulk = aiResponse.data.updates?.bulkUpdates || aiResponse.bulkUpdates;
             if (possibleBulk && Array.isArray(possibleBulk)) {
                aiResponse.data.bulkUpdates = possibleBulk;
             } else {
                throw new Error("Dados de bulk_update inválidos (Array não encontrado).");
             }
          }

          let count = 0;
          for (const item of aiResponse.data.bulkUpdates) {
            if (item.productId && item.updates) {
              await db.collection("products").doc(item.productId).update(item.updates);
              count++;
            }
          }
          revalidatePath("/loja", "layout");
          await sendReply(`✅ *${count} Produtos Atualizados!*${reasoning}`);
        }
        else if (aiResponse.action === "create_product") {
          const { newProduct } = aiResponse.data;
          const ref = `VCBD${Math.floor(100000 + Math.random() * 900000)}`;
          await db.collection("products").add({ ...newProduct, reference: ref, createdAt: new Date() });
          revalidatePath("/loja", "layout");
          await sendReply(`✨ *Novo Produto Criado!* \nSKU: ${ref}${reasoning}`);
        }
        else if (aiResponse.action === "report") {
          const ordersSnap = await db.collection("orders").limit(50).get();
          const paid = ordersSnap.docs.filter(d => d.data().paymentStatus === "pago");
          const total = paid.reduce((acc, d) => acc + (d.data().total || 0), 0);
          await sendReply(`📊 *Relatório Vila CBD* \nTotal Pago: € ${total.toFixed(2)}${reasoning}`);
        }
        else {
          await sendReply(aiResponse.message || "Pedido processado.");
        }
      } catch (err: any) {
        console.error("Erro IA:", err);
        await db.collection("webhook_logs").add({
          timestamp: new Date(),
          type: "error",
          chatId,
          error: err.message,
          userText: text,
          aiRawResponse: aiResponse || "Sem resposta da IA"
        });
        await sendReply(`🔥 *Erro Vila:* ${err.message}`);
      }
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error("Erro Webhook:", error);
    return NextResponse.json({ ok: true });
  }
}

export async function GET() {
  return new NextResponse("Vila Webhook Active.");
}
