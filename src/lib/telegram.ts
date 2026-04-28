import { getAdminDb } from "./firebase-admin";

export async function sendTelegramNotification(text: string) {
  try {
    const db = getAdminDb();
    const settingsDoc = await db.collection("settings").doc("global").get();
    const settings = settingsDoc.data();
    const socials = settings?.socials;

    const BOT_TOKEN = socials?.telegramToken;
    const CHAT_ID = socials?.telegramChatId;

    if (!BOT_TOKEN || !CHAT_ID) {
      console.warn("Telegram: Configurações ausentes. Notificação não enviada.");
      return null;
    }

    const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
    
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text: text,
        parse_mode: "Markdown"
      }),
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Erro ao enviar notificação Telegram:", error);
    return null;
  }
}
