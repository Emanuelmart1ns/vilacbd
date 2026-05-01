import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";
import { revalidatePath } from "next/cache";
import { Product } from "@/data/products";

export async function POST(request: NextRequest) {
  try {
    const update = await request.json();
    console.log("Telegram Webhook Update:", JSON.stringify(update));

    const db = getAdminDb();
    
    // Log para depuração
    await db.collection("webhook_logs").add({
      timestamp: new Date(),
      update: update
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

      // Obter lista de produtos para dar contexto à IA
      const productsSnap = await db.collection("products").get();
      const products = productsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Product[];

      try {
        const { askAI } = await import("@/lib/ai");
        const aiResponse = await askAI(text, { products });

        console.log("IA Response:", aiResponse);

        if (aiResponse.action === "update_product") {
          const { productId, updates } = aiResponse.data;
          if (!productId || !updates || Object.keys(updates).length === 0) {
             throw new Error("Dados de atualização insuficientes. Seja mais específico, ex: 'Bot, muda o nome do Óleo Premium Cânhamo 5% para Óleo Premium Cânhamo 6%'");
          }

          // Remover campos nulos ou indefinidos
          const cleanUpdates = Object.fromEntries(
            Object.entries(updates).filter(([_, v]) => v != null && v !== "")
          );

          if (Object.keys(cleanUpdates).length === 0) {
            await sendReply("⚠️ *Não percebi o que alterar.* Seja mais específico, ex:\n_\"Bot, muda o nome do Óleo Premium Cânhamo 5% para Óleo Premium Cânhamo 6%\"_");
            return NextResponse.json({ ok: true });
          }

          // Verificar que o produto existe antes de atualizar
          const productDoc = await db.collection("products").doc(productId).get();
          if (!productDoc.exists) {
            await sendReply(`⚠️ Produto com ID \`${productId}\` não encontrado na base de dados. Use o SKU (ex: VCBD123456) para mais precisão.`);
            return NextResponse.json({ ok: true });
          }

          const productBefore = productDoc.data() as any;
          await db.collection("products").doc(productId).update(cleanUpdates);
          revalidatePath("/loja", "layout");

          // Construir mensagem detalhada do que foi alterado
          const changeLines = Object.entries(cleanUpdates).map(([key, val]) => {
            const fieldNames: Record<string, string> = {
              name: "Nome", price: "Preço", stock: "Stock",
              description: "Descrição", supplierId: "Fornecedor"
            };
            const fieldLabel = fieldNames[key] || key;
            const before = productBefore[key] !== undefined ? `_${productBefore[key]}_` : "_(vazio)_";
            return `• *${fieldLabel}*: ${before} → *${val}*`;
          }).join("\n");

          await sendReply(`✅ *Produto Atualizado!*\n\n📦 *${productBefore.name || productId}*\n\n${changeLines}`);
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
  } catch (error) {
    console.error("Erro no Webhook do Telegram:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

// O Telegram às vezes faz GET para testar
export async function GET() {
  return new NextResponse("Telegram Webhook is active.");
}
