import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getAdminDb } from "@/lib/firebase-admin";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-12-18.preview",
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(request: NextRequest) {
  const payload = await request.text();
  const signature = request.headers.get("stripe-signature")!;

  let event: Stripe.Event;

  try {
    if (!webhookSecret) {
      throw new Error("STRIPE_WEBHOOK_SECRET não configurado.");
    }
    event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  } catch (err: any) {
    console.error(`Webhook Signature verification failed: ${err.message}`);
    return NextResponse.json({ error: err.message }, { status: 400 });
  }

  // Lógica para quando o pagamento é concluído com sucesso
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const db = getAdminDb();

    try {
      const customerEmail = session.customer_details?.email;
      const total = session.amount_total ? session.amount_total / 100 : 0;
      const metadata = session.metadata;
      
      // Criar a encomenda oficial na base de dados
      const orderRef = db.collection("orders").doc();
      await orderRef.set({
        id: orderRef.id,
        email: customerEmail,
        total: total,
        paymentStatus: "pago",
        paymentId: session.id,
        shippingStatus: "pendente",
        shippingInfo: session.shipping_details || {},
        items: JSON.parse(metadata?.orderItems || "[]"),
        createdAt: new Date().toISOString(),
        source: "stripe_webhook"
      });

      console.log(`Encomenda ${orderRef.id} criada via Webhook Stripe.`);
      
      // Aqui poderíamos também chamar o Vila Bot para notificar o Admin
      const { sendTelegramNotification } = require("@/lib/telegram");
      await sendTelegramNotification(`💰 *PAGAMENTO CONFIRMADO!*\n\n✅ Encomenda via Stripe concluída.\n📧 Cliente: ${customerEmail}\n💵 Valor: ${total.toFixed(2)}€\n\n_Vila Bot Intelligence_ 🤖`);

    } catch (dbError) {
      console.error("Erro ao processar webhook no Firestore:", dbError);
    }
  }

  return NextResponse.json({ received: true });
}
