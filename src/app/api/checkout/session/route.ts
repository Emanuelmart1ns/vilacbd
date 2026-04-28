import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

export async function POST(request: NextRequest) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2026-04-22.dahlia",
  });
  
  try {
    const { items, successUrl, cancelUrl, customerEmail } = await request.json();

    if (!items || items.length === 0) {
      return NextResponse.json({ error: "Carrinho vazio" }, { status: 400 });
    }

    // Criar a sessão do Stripe Checkout
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card", "mb_way"], 
      line_items: items.map((item: any) => ({
        price_data: {
          currency: "eur",
          product_data: {
            name: item.name,
            images: item.image ? [`${process.env.NEXT_PUBLIC_URL || ""}${item.image}`] : [],
          },
          unit_amount: Math.round(item.price * 100), // Stripe usa cêntimos
        },
        quantity: item.quantity,
      })),
      mode: "payment",
      success_url: successUrl,
      cancel_url: cancelUrl,
      customer_email: customerEmail,
      shipping_address_collection: {
        allowed_countries: ["PT", "ES", "FR", "DE", "GB"], // Países permitidos
      },
      // Adicionar metadados para o webhook processar depois
      metadata: {
        orderItems: JSON.stringify(items.map((i: any) => ({ 
          id: i.id, 
          name: i.name, 
          quantity: i.quantity,
          price: i.price
        }))),
      },
    });

    return NextResponse.json({ sessionId: session.id, url: session.url });
  } catch (error: any) {
    console.error("Erro ao criar sessão Stripe:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
