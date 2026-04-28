import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, webhookUrl, name, text, sessionId } = body;
    
    const db = getAdminDb();
    const settingsDoc = await db.collection("settings").doc("global").get();
    const settings = settingsDoc.data();
    const socials = settings?.socials;

    const BOT_TOKEN = socials?.telegramToken;
    const CHAT_ID = socials?.telegramChatId;

    if (!BOT_TOKEN || !CHAT_ID) {
      return NextResponse.json({ error: "Configurações de Telegram incompletas no Admin" }, { status: 400 });
    }

    // Ação para ativar o Webhook (Respostas do Bot)
    if (action === "set_webhook") {
      const setWebhookUrl = `https://api.telegram.org/bot${BOT_TOKEN}/setWebhook?url=${webhookUrl}`;
      const whRes = await fetch(setWebhookUrl);
      const whData = await whRes.json();
      
      if (whData.ok) {
        return NextResponse.json({ status: "webhook_set", result: whData });
      } else {
        return NextResponse.json({ error: "Erro ao ativar Webhook", details: whData }, { status: 500 });
      }
    }

    // Formatar mensagem para o Telegram
    const telegramMsg = `🤖 *VILA BOT - MENSAGEM*\n\n👤 *Cliente:* ${name || "Anónimo"}\n💬 *Mensagem:* ${text}\n\n_Responda a esta mensagem para enviar ao cliente._`;

    const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
    
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text: telegramMsg,
        parse_mode: "Markdown"
      }),
    });

    const result = await response.json();

    if (response.ok && result.ok) {
      const telegramMessageId = result.result.message_id;
      
      // Mapear este ID de mensagem para a sessão do utilizador
      // Assim, quando o admin responder a esta mensagem, saberemos para que chat vai
      await db.collection("telegram_sessions").doc(telegramMessageId.toString()).set({
        sessionId,
        lastUpdate: new Date(),
      });

      return NextResponse.json({ status: "sent", result });
    }

    return NextResponse.json({ error: "Erro na API do Telegram", details: result }, { status: 500 });
  } catch (error) {
    console.error("Erro ao enviar mensagem Telegram:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
