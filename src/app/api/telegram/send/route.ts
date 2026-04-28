import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";

export async function POST(request: NextRequest) {
  try {
    const { name, text, customerId } = await request.json();
    
    const db = getAdminDb();
    const settingsDoc = await db.collection("settings").doc("global").get();
    const settings = settingsDoc.data();
    const socials = settings?.socials;

    const BOT_TOKEN = socials?.telegramToken;
    const CHAT_ID = socials?.telegramChatId;

    if (!BOT_TOKEN || !CHAT_ID) {
      return NextResponse.json({ error: "Configurações de Telegram incompletas no Admin" }, { status: 400 });
    }

    // Formatar mensagem para o Telegram (suporta Markdown)
    const telegramMsg = `🤖 *VILA BOT - NOVO CHAT*\n\n👤 *Cliente:* ${name || "Anónimo"}\n💬 *Mensagem:* ${text}\n\n---`;

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

    if (!response.ok) {
      console.error("Erro ao enviar para Telegram:", result);
      return NextResponse.json({ error: "Erro na API do Telegram", details: result }, { status: 500 });
    }

    // Guardar no histórico do chat
    await db.collection("support_chats").add({
      from: "customer",
      customerId: customerId || "anon",
      name: name || "Anónimo",
      text: text,
      timestamp: new Date(),
      type: "telegram_bot"
    });

    return NextResponse.json({ status: "sent", result });
  } catch (error) {
    console.error("Erro ao enviar mensagem Telegram:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
