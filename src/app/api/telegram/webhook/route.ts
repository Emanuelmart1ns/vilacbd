import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";
import { revalidatePath } from "next/cache";
import { Product } from "@/data/products";

export async function POST(request: NextRequest) {
  try {
    const secretToken = request.headers.get("X-Telegram-Bot-Api-Secret-Token");
    const expectedSecret = process.env.TELEGRAM_WEBHOOK_SECRET;

    // Se houver um segredo configurado, validar.
    if (expectedSecret && secretToken !== expectedSecret) {
      console.warn("🚫 Tentativa de webhook não autorizada detectada.");
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const update = await request.json();
    const db = getAdminDb();
    
    // Log sanitizado para depuração (evitar guardar dados sensíveis em excesso)
    await db.collection("webhook_logs").add({
      timestamp: new Date(),
      type: update.message ? "message" : "other",
      chatId: update.message?.chat?.id?.toString() || "unknown"
    });

    const message = update.message;
    if (!message || !message.text) {
      return NextResponse.json({ ok: true });
    }

    const text = message.text.trim();
    const chatId = message.chat.id.toString();

    // 1. Obter definições para verificar o Admin ID e Token
    const settingsDoc = await db.collection("settings").doc("global").get();
    const settings = settingsDoc.data();
    const authorizedId = settings?.socials?.telegramChatId;
    const botToken = settings?.socials?.telegramToken;

    // Função para responder no Telegram
    const sendReply = async (replyText: string) => {
      if (!botToken) return;
      await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: replyText,
          parse_mode: "Markdown"
        })
      });
    };

    // 2. Verificar se a mensagem começa por "Bot" e se o utilizador é autorizado
    if (text.toLowerCase().startsWith("bot")) {
      if (chatId !== authorizedId) {
        await sendReply("⚠️ Desculpe, não tenho autorização para receber ordens deste ID.");
        return NextResponse.json({ ok: true });
      }

      // 2. Obter Histórico Expandido (Memória de Longo Prazo)
      // Nota: Removemos o orderBy no servidor para evitar a necessidade de índices compostos
      const historySnap = await db.collection("bot_history")
        .where("chatId", "==", chatId)
        .limit(20) // Buscamos um pouco mais para garantir contexto
        .get();
      
      const history = (historySnap.docs || [])
        .map(doc => {
          const d = doc.data();
          return {
            role: d.role || "user",
            content: d.content || "",
            timestamp: d.timestamp ? (d.timestamp.toDate ? d.timestamp.toDate() : new Date(d.timestamp)) : new Date()
          };
        })
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
        .slice(0, 10)
        .reverse();

      // Obter lista de produtos para dar contexto à IA
      const productsSnap = await db.collection("products").get();
      const products = productsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Product[];

      try {
        const { askAI } = await import("@/lib/ai");
        const aiResponse = await askAI(text, { products, history });

        // Guardar a interação no histórico
        await db.collection("bot_history").add({
          chatId,
          role: "user",
          content: text,
          timestamp: new Date()
        });
        await db.collection("bot_history").add({
          chatId,
          role: "assistant",
          content: aiResponse.message || "",
          timestamp: new Date()
        });

        console.log("IA Response:", aiResponse);

        const reasoning = aiResponse.reasoning ? `\n\n*Raciocínio:* _${aiResponse.reasoning}_` : "";

        if (aiResponse.action === "update_product") {
          const { productId, updates } = aiResponse.data;
          
          const cleanUpdates = updates ? Object.fromEntries(
            Object.entries(updates).filter(([_, v]) => v != null && v !== "")
          ) : {};

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
          revalidatePath("/loja", "layout");

          const changeLines = Object.entries(cleanUpdates).map(([key, val]) => {
            const fieldNames: Record<string, string> = { name: "Nome", price: "Preço", stock: "Stock" };
            return `• *${fieldNames[key] || key}*: _${productBefore[key]}_ → *${val}*`;
          }).join("\n");

          const humanMessage = aiResponse.message ? `\n\n${aiResponse.message}` : "";
          await sendReply(`✅ *Atualizado!*\n\n📦 *${productBefore.name}*\n${changeLines}${humanMessage}${reasoning}`);
        }
        else if (aiResponse.action === "create_order") {
          const { productId, quantity, customer } = aiResponse.data;
          
          const product = products.find(p => p.id === productId);
          if (!product) throw new Error("Produto não encontrado");

          const newOrder = {
            customerName: customer || "Cliente Manual",
            items: [{
              id: productId,
              name: product.name,
              price: product.price,
              quantity: quantity || 1
            }],
            total: product.price * (quantity || 1),
            status: "pendente",
            paymentStatus: "pendente",
            createdAt: new Date(),
            source: "telegram_bot"
          };

          await db.collection("orders").add(newOrder);
          await sendReply(`📦 *Encomenda Criada!* \n${aiResponse.message}`);
        }
        else if (aiResponse.action === "report") {
          // Relatório rápido via Bot
          const ordersSnap = await db.collection("orders").get();
          const paidOrders = ordersSnap.docs.filter(d => d.data().paymentStatus === "pago");
          const totalRevenue = paidOrders.reduce((acc, d) => acc + (d.data().total || 0), 0);
          
          await sendReply(`📊 *Relatório Rápido Vila Cãnhamo* \n\n*Vendas Totais:* € ${totalRevenue.toFixed(2)}\n*Encomendas Pagas:* ${paidOrders.length}\n\n${aiResponse.message}`);
        }
        else {
          await sendReply(aiResponse.message || "🤔 Não tenho a certeza de como processar esse pedido.");
        }

      } catch (err) {
        console.error("Erro no Agente de IA:", err);
        await sendReply("🔥 Ocorreu um erro ao processar o seu pedido com a IA.");
      }

      return NextResponse.json({ ok: true });
    }

    // Verificar se é uma resposta a uma mensagem anterior do bot (Chat de Suporte)
    const replyTo = message.reply_to_message;
    if (!replyTo) {
      return NextResponse.json({ ok: true });
    }

    const telegramMessageId = replyTo.message_id.toString();

    // Procurar a sessão associada a esta mensagem
    const sessionDoc = await db.collection("telegram_sessions").doc(telegramMessageId).get();
    
    if (!sessionDoc.exists) {
      await db.collection("webhook_logs").add({
        timestamp: new Date(),
        error: "Sessão não encontrada",
        msgId: telegramMessageId
      });
      return NextResponse.json({ ok: true });
    }

    const { sessionId } = sessionDoc.data()!;

    // Adicionar a resposta do Admin ao chat do utilizador
    await db.collection("support_chats").add({
      sessionId,
      from: "admin",
      name: "Suporte Vila Cãnhamo",
      text: message.text,
      timestamp: new Date(),
      type: "telegram_reply"
    });


    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error("Erro no Webhook do Telegram:", error);
    try {
      // Tentar avisar o admin do erro via Telegram
      const db = getAdminDb();
      const settingsSnap = await db.collection("settings").doc("global").get();
      const settings = settingsSnap.data();
      const botToken = settings?.socials?.telegramToken;
      const adminChatId = settings?.socials?.telegramChatId;

      if (botToken && adminChatId) {
        await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: adminChatId,
            text: `🔥 *Erro no Webhook:* ${error.message}\n\nO bot crashou ao processar a última mensagem.`,
            parse_mode: "Markdown"
          })
        });
      }
    } catch (e) {
      console.error("Falha ao enviar aviso de erro:", e);
    }
    return NextResponse.json({ ok: true });
  }
}

// O Telegram às vezes faz GET para testar
export async function GET() {
  return new NextResponse("Telegram Webhook is active.");
}
