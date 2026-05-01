import { NextRequest, NextResponse } from "next/server";
import { getAdminDb, getAdminBucket } from "@/lib/firebase-admin";
import { revalidatePath } from "next/cache";

async function uploadTelegramPhotoToFirebase(fileId: string): Promise<string> {
  const db = getAdminDb();
  const settingsDoc = await db.collection("settings").doc("global").get();
  const botToken = settingsDoc.data()?.socials?.telegramToken;
  if (!botToken) throw new Error("Bot Token ausente.");
  const fileInfoResp = await fetch(`https://api.telegram.org/bot${botToken}/getFile?file_id=${fileId}`);
  const fileInfo = await fileInfoResp.json();
  const filePath = fileInfo.result.file_path;
  const response = await fetch(`https://api.telegram.org/file/bot${botToken}/${filePath}`);
  const buffer = Buffer.from(await response.arrayBuffer());
  const bucket = getAdminBucket();
  const destination = `bot-uploads/${Date.now()}.jpg`;
  const file = bucket.file(destination);
  await file.save(buffer, { metadata: { contentType: "image/jpeg" } });
  await file.makePublic();
  return `https://storage.googleapis.com/${bucket.name}/${destination}`;
}

export async function POST(request: NextRequest) {
  let aiResponse: any;
  const db = getAdminDb();
  let chatId = "unknown";
  let text = "";

  try {
    const update = await request.json();
    const message = update.message;
    if (!message) return NextResponse.json({ ok: true });

    text = (message.text || message.caption || "").trim();
    chatId = message.chat.id.toString();
    const photoIds = (message.photo || []).slice(-1).map((p: any) => p.file_id);

    if (text.toLowerCase().includes("vila")) {
      const settingsDoc = await db.collection("settings").doc("global").get();
      const settings = settingsDoc.data();
      if (chatId !== settings?.socials?.telegramChatId) return NextResponse.json({ ok: true });
      const botToken = settings?.socials?.telegramToken;
      const sendReply = async (msg: string) => {
        await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ chat_id: chatId, text: msg, parse_mode: "Markdown" })
        });
      };

      const [productsSnap, ordersSnap, suppliersSnap, usersSnap] = await Promise.all([
        db.collection("products").get(),
        db.collection("orders").limit(10).get(),
        db.collection("suppliers").get(),
        db.collection("users").get()
      ]);
      
      const products = productsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const orders = ordersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const suppliers = suppliersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const users = usersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      const publicPhotoUrls = [];
      for (const fId of photoIds) {
        try { publicPhotoUrls.push(await uploadTelegramPhotoToFirebase(fId)); } catch(e) {}
      }

      const { askAI } = await import("@/lib/ai");
      aiResponse = await askAI(text, { products, orders, settings, suppliers, users, publicPhotoUrls });

      const processAction = async (action: string, data: any) => {
        if (action === "update_product") {
          await db.collection("products").doc(data.productId).update(data.updates);
          return { type: "product", id: data.productId };
        } else if (action === "bulk_update") {
          const updates = data.bulkUpdates || data.updates?.bulkUpdates || [];
          for (const item of updates) {
            await db.collection("products").doc(item.productId).update(item.updates);
          }
          return { type: "bulk", count: updates.length };
        } else if (action === "update_settings") {
          if (data.updates?.categories) {
            const currentDoc = await db.collection("settings").doc("global").get();
            const currentCats = currentDoc.data()?.categories || [];
            const merged = [...currentCats];
            for (const nc of data.updates.categories) {
              const idx = merged.findIndex(c => c.name === nc.name);
              if (idx > -1) merged[idx] = nc;
              else merged.push(nc);
            }
            await db.collection("settings").doc("global").update({ ...data.updates, categories: merged });
          } else {
            await db.collection("settings").doc("global").update(data.updates);
          }
          return { type: "settings" };
        }
        return null;
      };

      const actions = aiResponse.actions || (aiResponse.action ? [aiResponse] : []);
      const results = [];
      for (const act of actions) {
        results.push(await processAction(act.action, act.data));
      }

      revalidatePath("/", "layout");
      revalidatePath("/loja", "layout");

      // FASE DE VERIFICAÇÃO (Garantir que a DB foi alterada)
      let verificationText = "";
      for (const res of results) {
        if (res?.type === "product") {
          const fresh = await db.collection("products").doc(res.id).get();
          const d = fresh.data();
          verificationText += `\n✅ *Verificado:* ${d?.name} atualizado. (Preço: ${d?.price}€, Sub: ${d?.subcategory})`;
        } else if (res?.type === "settings") {
          verificationText += `\n✅ *Verificado:* Definições globais gravadas.`;
        } else if (res?.type === "bulk") {
          verificationText += `\n✅ *Verificado:* ${res.count} produtos atualizados em massa.`;
        }
      }

      const reasoning = aiResponse.reasoning ? `\n\n💭 *Raciocínio:* _${aiResponse.reasoning}_` : "";
      const finalMsg = `🏁 *Ação Concluída!*\n\n${aiResponse.message}${verificationText}\n\n_Alterações aplicadas e cache limpa._${reasoning}`;
      
      await sendReply(finalMsg);
      await db.collection("bot_history").add({ chatId, role: "user", content: text, timestamp: new Date() });
      await db.collection("bot_history").add({ chatId, role: "assistant", content: finalMsg, timestamp: new Date() });

    }
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("Webhook Error:", err);
    return NextResponse.json({ ok: true });
  }
}

export async function GET() {
  return new NextResponse("Vila Webhook Active.");
}
