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

    return NextResponse.json({ success: true, orderId: orderRef.id }, { status: 201 });
  } catch (error) {
    console.error("Erro ao processar encomenda:", error);
    return NextResponse.json({ error: "Erro interno." }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    // Apenas admins devem aceder a isto (simplificado para este exemplo)
    const db = getAdminDb();
    const snapshot = await db.collection("orders").orderBy("createdAt", "desc").get();
    const orders = snapshot.docs.map(doc => doc.data());
    return NextResponse.json({ orders }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Erro ao carregar encomendas." }, { status: 500 });
  }
}
