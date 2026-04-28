import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getAdminDb } from "@/lib/firebase-admin";

export async function POST(request: NextRequest) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2026-04-22.dahlia",
  });

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
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
      const orderItems = JSON.parse(metadata?.orderItems || "[]");
      
      await orderRef.set({
        id: orderRef.id,
        email: customerEmail,
        total: total,
        paymentStatus: "pago",
        paymentId: session.id,
        shippingStatus: "pendente",
        shippingInfo: (session as any).shipping_details || {},
        items: orderItems,
        createdAt: new Date().toISOString(),
        source: "stripe_webhook"
      });

      console.log(`Encomenda ${orderRef.id} criada via Webhook Stripe.`);
      
      // --- VILA BOT INTELLIGENCE: Stock e Notificações ---
      let stockAlerts: string[] = [];
      
      for (const item of orderItems) {
        const productRef = db.collection("products").doc(item.id);
        const productDoc = await productRef.get();
        
        if (productDoc.exists) {
          const currentStock = productDoc.data()?.stock || 0;
          const newStock = Math.max(0, currentStock - item.quantity);
          await productRef.update({ stock: newStock });
          
          if (newStock <= 2) {
            stockAlerts.push(`⚠️ *${item.name}* está com stock crítico (${newStock} un.)`);
          }
        }
      }

      // Notificar Admin via Telegram
      const { sendTelegramNotification } = require("@/lib/telegram");
      let notificationMsg = `💰 *PAGAMENTO CONFIRMADO!*\n\n`;
      notificationMsg += `✅ Encomenda via Stripe concluída.\n`;
      notificationMsg += `📧 *Cliente:* ${customerEmail}\n`;
      notificationMsg += `💵 *Valor:* ${total.toFixed(2)}€\n\n`;
      
      if (stockAlerts.length > 0) {
        notificationMsg += `🚨 *ALERTAS DE STOCK:*\n${stockAlerts.join("\n")}\n\n`;
      }
      
      notificationMsg += `_Vila Bot Intelligence_ 🤖`;
      
      await sendTelegramNotification(notificationMsg);

    } catch (dbError) {
      console.error("Erro ao processar webhook no Firestore:", dbError);
    }
  }

  return NextResponse.json({ received: true });
}
