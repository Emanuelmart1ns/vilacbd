import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";

export async function POST(request: NextRequest) {
  try {
    const { text, customerId } = await request.json();
    
    // Buscar credenciais da Meta no Firestore
    const db = getAdminDb();
    const settingsDoc = await db.collection("settings").doc("global").get();
    const settings = settingsDoc.data();
    const socials = settings?.socials;

    const TOKEN = socials?.whatsappToken;
    const INSTANCE_ID = socials?.whatsappPhoneId; // Usado como Instance ID nos serviços de QR Code
    const OWNER_NUMBER = socials?.whatsapp;

    if (!TOKEN || !INSTANCE_ID || !OWNER_NUMBER) {
      return NextResponse.json({ error: "Configurações de WhatsApp incompletas no Admin" }, { status: 400 });
    }

    // Formato UltraMsg: https://api.ultramsg.com/instanceXXXX/messages/chat
    const url = `https://api.ultramsg.com/${INSTANCE_ID}/messages/chat`;
    
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        token: TOKEN,
        to: OWNER_NUMBER.replace(/\s/g, ''),
        body: `[SITE CHAT] Novo cliente: ${text}`
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error("Erro ao enviar para Meta:", result);
      return NextResponse.json({ error: "Erro na API da Meta", details: result }, { status: 500 });
    }

    // Guardar no histórico do chat
    await db.collection("support_chats").add({
      from: "customer",
      customerId: customerId || "anon",
      text: text,
      timestamp: new Date(),
      type: "sent_to_whatsapp"
    });

    return NextResponse.json({ status: "sent", result });
  } catch (error) {
    console.error("Erro ao enviar mensagem WhatsApp:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
