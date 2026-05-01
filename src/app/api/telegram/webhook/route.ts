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
  try {
    const secretToken = request.headers.get("X-Telegram-Bot-Api-Secret-Token");
    const expectedSecret = process.env.TELEGRAM_WEBHOOK_SECRET;

    if (expectedSecret && secretToken !== expectedSecret) {
      console.warn("🚫 Tentativa de webhook não autorizada detectada.");
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const update = await request.json();
    const db = getAdminDb();
    
    const message = update.message;
    if (!message) return NextResponse.json({ ok: true });

    const text = (message.text || message.caption || "").trim();
    const photos = message.photo || [];
    const photoIds = photos.length > 0 ? [photos[photos.length - 1].file_id] : [];
    const chatId = message.chat.id.toString();

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

      const [productsSnap, ordersSnap] = await Promise.all([
        db.collection("products").get(),
        db.collection("orders").limit(10).get()
      ]);
      
      const products = productsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Product[];
      const orders = ordersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      const publicPhotoUrls = [];
      for (const fId of photoIds) {
        try {
          const url = await uploadTelegramPhotoToFirebase(fId);
          publicPhotoUrls.push(url);
        } catch (uploadError) {
          console.error("Erro no upload para Firebase:", uploadError);
        }
      }

      try {
        const { askAI } = await import("@/lib/ai");
        const aiResponse = await askAI(text, { products, history, orders, publicPhotoUrls });

        await db.collection("bot_history").add({ chatId, role: "user", content: text, timestamp: new Date() });
        await db.collection("bot_history").add({ chatId, role: "assistant", content: aiResponse.message || "", timestamp: new Date() });

        const reasoning = aiResponse.reasoning ? `\n\n*Raciocínio:* _${aiResponse.reasoning}_` : "";

        if (aiResponse.action === "update_product") {
          const { productId, updates } = aiResponse.data;
          const cleanUpdates = updates ? Object.fromEntries(Object.entries(updates).filter(([_, v]) => v != null && v !== "")) : {};
          if (Object.keys(cleanUpdates).length === 0 || !productId) {
            await sendReply(`${aiResponse.message || "🤔 Não percebi o que alterar."}${reasoning}`);
            return NextResponse.json({ ok: true });
          }

          const productDoc = await db.collection("products").doc(productId).get();
          if (!productDoc.exists) {
            await sendReply(`⚠️ Produto não encontrado.${reasoning}`);
            return NextResponse.json({ ok: true });
          }

          const productBefore = productDoc.data() as any;
          await db.collection("products").doc(productId).update(cleanUpdates);
          const productAfterSnap = await db.collection("products").doc(productId).get();
          const productAfter = productAfterSnap.data() as any;
          
          revalidatePath("/loja", "layout");
          revalidatePath("/", "layout");

          const changeLines = Object.entries(cleanUpdates).map(([key, val]) => {
            const fieldNames: Record<string, string> = { name: "Nome", price: "Preço", stock: "Stock", subcategory: "Subcategoria" };
            const verified = productAfter[key];
            return `• *${fieldNames[key] || key}*: _${productBefore[key]}_ → *${verified}* (Confirmado no DB ✅)`;
          }).join("\n");

          const humanMessage = aiResponse.message ? `\n\n${aiResponse.message}` : "";
          await sendReply(`✅ *Alteração Gravada com Sucesso!*\n\n📦 *${productAfter.name}*\n${changeLines}${humanMessage}${reasoning}\n\n_O site foi atualizado e a cache limpa._`);
        }
        else if (aiResponse.action === "bulk_update") {
          const { bulkUpdates } = aiResponse.data;
          if (!bulkUpdates || !Array.isArray(bulkUpdates)) throw new Error("Dados de bulk_update inválidos.");

          let count = 0;
          for (const updateItem of bulkUpdates) {
            const { productId, updates } = updateItem;
            if (productId && updates) {
              await db.collection("products").doc(productId).update(updates);
              count++;
            }
          }

          revalidatePath("/loja", "layout");
          revalidatePath("/", "layout");
          await sendReply(`✅ *${count} Produtos Atualizados com Sucesso!*\n\n${aiResponse.message}${reasoning}`);
        }
        else if (aiResponse.action === "delete_product") {
          const { productId } = aiResponse.data;
          if (!productId) throw new Error("ID do produto ausente.");
          await db.collection("products").doc(productId).delete();
          revalidatePath("/loja", "layout");
          await sendReply(`🗑️ *Produto Removido!* \nO produto foi eliminado permanentemente do catálogo.${reasoning}`);
        }
        else if (aiResponse.action === "create_product") {
          const { newProduct } = aiResponse.data;
          const finalProduct = {
            ...newProduct,
            reference: `VCBD${Math.floor(100000 + Math.random() * 900000)}`,
            createdAt: new Date(),
            stock: newProduct.stock || 0
          };
          const docRef = await db.collection("products").add(finalProduct);
          revalidatePath("/loja", "layout");
          await sendReply(`✨ *Novo Produto Criado!* \nID: ${docRef.id} \nNome: ${finalProduct.name}\nSKU: ${finalProduct.reference}${reasoning}`);
        }
        else if (aiResponse.action === "update_order") {
          const { orderId, updates } = aiResponse.data;
          if (!orderId) throw new Error("ID da encomenda ausente.");
          await db.collection("orders").doc(orderId).update(updates);
          await sendReply(`📋 *Encomenda Atualizada!* \nEstado: ${updates.status || "Alterado"}${reasoning}`);
        }
        else if (aiResponse.action === "create_order") {
          const { productId, quantity, customer } = aiResponse.data;
          const product = products.find(p => p.id === productId);
          if (!product) throw new Error("Produto não encontrado");
          const newOrder = {
            customerName: customer || "Cliente Manual",
            items: [{ id: productId, name: product.name, price: product.price, quantity: quantity || 1 }],
            total: product.price * (quantity || 1),
            status: "pendente", paymentStatus: "pendente", createdAt: new Date(), source: "telegram_bot"
          };
          await db.collection("orders").add(newOrder);
          await sendReply(`📦 *Encomenda Criada!* \n${aiResponse.message}`);
        }
        else if (aiResponse.action === "report") {
          const ordersSnap = await db.collection("orders").limit(50).get();
          const paidOrders = ordersSnap.docs.filter(d => d.data().paymentStatus === "pago");
          const totalRevenue = paidOrders.reduce((acc, d) => acc + (d.data().total || 0), 0);
          await sendReply(`📊 *Relatório Rápido Vila CBD* \n\n*Vendas Totais:* € ${totalRevenue.toFixed(2)}\n*Encomendas Pagas:* ${paidOrders.length}\n\n${aiResponse.message}`);
        }
        else {
          await sendReply(aiResponse.message || "🤔 Não tenho a certeza de como processar esse pedido.");
        }
      } catch (err: any) {
        console.error("Erro no Agente de IA:", err);
        await db.collection("webhook_logs").add({
          timestamp: new Date(),
          type: "error",
          chatId,
          error: err.message,
          stack: err.stack,
          userText: text
        });
        await sendReply("🔥 Ocorreu um erro ao processar o seu pedido com a IA.");
      }
      return NextResponse.json({ ok: true });
    }

    const replyTo = message.reply_to_message;
    if (replyTo) {
      const telegramMessageId = replyTo.message_id.toString();
      const sessionDoc = await db.collection("telegram_sessions").doc(telegramMessageId).get();
      if (sessionDoc.exists) {
        const { sessionId } = sessionDoc.data()!;
        await db.collection("support_chats").add({
          sessionId, from: "admin", name: "Suporte Vila CBD", text: message.text, timestamp: new Date(), type: "telegram_reply"
        });
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error("Erro no Webhook do Telegram:", error);
    return NextResponse.json({ ok: true });
  }
}

export async function GET() {
  return new NextResponse("Telegram Webhook is active.");
}
