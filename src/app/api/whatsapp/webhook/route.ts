import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";

// Verificação do Webhook pela Meta (GET)
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  // Buscar o Verify Token das configurações no Firestore
  const db = getAdminDb();
  const settingsDoc = await db.collection("settings").doc("global").get();
  const settings = settingsDoc.data();
  const expectedToken = settings?.socials?.whatsappVerifyToken || "vilacbd_secret_token";

  if (mode === "subscribe" && token === expectedToken) {
    console.log("Webhook verificado com sucesso!");
    return new Response(challenge, { status: 200 });
  } else {
    return new Response("Forbidden", { status: 403 });
  }
}

// Receber mensagens da Meta (POST)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log("Mensagem recebida do WhatsApp (QR Code Service):", JSON.stringify(body, null, 2));

    // Formato UltraMsg: body.data[0].body
    const messageData = body.data?.[0];
    const text = messageData?.body;
    const from = messageData?.from;

    if (text && from) {
      const db = getAdminDb();

      // Guardar a resposta no Firestore
      await db.collection("support_chats").add({
        from: "admin",
        text: text,
        whatsappNumber: from,
        timestamp: new Date(),
        type: "incoming_from_third_party"
      });
    }

    return NextResponse.json({ status: "ok" });
  } catch (error) {
    console.error("Erro no Webhook do WhatsApp:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
