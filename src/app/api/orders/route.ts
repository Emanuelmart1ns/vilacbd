import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";
import { getAuth } from "firebase-admin/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { idToken, items, total, shippingInfo, paymentMethod } = body;

    const db = getAdminDb();
    let uid = "anonymous";
    let userEmail = shippingInfo.email;

    if (idToken) {
      try {
        const adminAuth = getAuth();
        const decodedToken = await adminAuth.verifyIdToken(idToken);
        uid = decodedToken.uid;
        userEmail = decodedToken.email;

        // Atualizar o perfil do utilizador com os dados de envio (CRM)
        const userRef = db.collection("users").doc(uid);
        const userDoc = await userRef.get();
        const userData = userDoc.data() || {};
        
        await userRef.set({
          shippingInfo,
          lastPurchase: new Date().toISOString(),
          totalSpent: (userData.totalSpent || 0) + total,
          orderCount: (userData.orderCount || 0) + 1,
        }, { merge: true });
      } catch (e) {
        console.error("Erro ao verificar token no checkout:", e);
      }
    }

    // Criar a encomenda
    const orderRef = db.collection("orders").doc();
    const orderData = {
      id: orderRef.id,
      uid,
      email: userEmail,
      items,
      total,
      shippingInfo,
      paymentMethod,
      paymentStatus: "pendente",
      shippingStatus: "pendente",
      createdAt: new Date().toISOString(),
    };

    await orderRef.set(orderData);

    // --- AGENTE DE AUTOMAÇÃO (Vila Bot Admin) ---
    try {
      const { sendTelegramNotification } = require("@/lib/telegram");
      let stockAlerts = [];
      
      // 1. Atualizar Stock e Verificar Baixo Stock
      for (const item of items) {
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

      // 2. Contar Pendências
      const pendingSnapshot = await db.collection("orders").where("shippingStatus", "==", "pendente").get();
      const pendingCount = pendingSnapshot.size;

      // 3. Notificar Admin
      let notificationMsg = `📦 *NOVA ENCOMENDA REFEITA!*\n\n`;
      notificationMsg += `💰 *Valor:* ${total.toFixed(2)}€\n`;
      notificationMsg += `👤 *Cliente:* ${shippingInfo.firstName} ${shippingInfo.lastName}\n`;
      notificationMsg += `🚚 *Pendências Atuais:* ${pendingCount} envios aguardam processamento.\n\n`;
      
      if (stockAlerts.length > 0) {
        notificationMsg += `🚨 *ALERTAS DE STOCK:*\n${stockAlerts.join("\n")}\n\n`;
      }
      
      notificationMsg += `_Vila Bot Intelligence_ 🤖`;
      
      await sendTelegramNotification(notificationMsg);
    } catch (botError) {
      console.error("Erro no Agente de Notificação:", botError);
    }

    return NextResponse.json({ success: true, orderId: orderRef.id }, { status: 201 });
  } catch (error) {
    console.error("Erro ao processar encomenda:", error);
    return NextResponse.json({ error: "Erro interno." }, { status: 500 });
  }
}

import { verifyAdminToken } from "@/lib/auth-guard";

export async function GET(request: NextRequest) {
  const auth = await verifyAdminToken(request);
  if ("error" in auth) return auth.error;

  try {
    const db = getAdminDb();
    const snapshot = await db.collection("orders").orderBy("createdAt", "desc").get();
    const orders = snapshot.docs.map(doc => doc.data());
    return NextResponse.json({ orders }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Erro ao carregar encomendas." }, { status: 500 });
  }
}
