import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";

export async function POST(request: NextRequest) {
  try {
    const update = await request.json();
    console.log("Telegram Webhook Update:", JSON.stringify(update));

    const message = update.message;
    if (!message || !message.text) {
      return NextResponse.json({ ok: true });
    }

    // Verificar se é uma resposta a uma mensagem anterior do bot
    const replyTo = message.reply_to_message;
    if (!replyTo) {
      // Se não for uma resposta, ignoramos por agora (ou poderíamos enviar para um chat geral)
      return NextResponse.json({ ok: true });
    }

    const db = getAdminDb();
    const telegramMessageId = replyTo.message_id.toString();

    // Procurar a sessão associada a esta mensagem
    const sessionDoc = await db.collection("telegram_sessions").doc(telegramMessageId).get();
    
    if (!sessionDoc.exists) {
      console.warn("Nenhuma sessão encontrada para telegramMessageId:", telegramMessageId);
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
