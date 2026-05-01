import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";
import { verifyAdminToken } from "@/lib/auth-guard";

export async function GET(request: NextRequest) {
  const auth = await verifyAdminToken(request);
  if ("error" in auth) return auth.error;

  try {
    const db = getAdminDb();
    
    // 1. Total de Encomendas e Vendas
    const ordersSnapshot = await db.collection("orders").get();
    const totalOrders = ordersSnapshot.size;
    let totalSales = 0;
    ordersSnapshot.docs.forEach(doc => {
      const data = doc.data();
      if (data.paymentStatus === "pago") {
        totalSales += data.total || 0;
      }
    });

    // 2. Produtos com Baixo Stock
    const productsSnapshot = await db.collection("products").where("stock", "<=", 2).get();
    const lowStockCount = productsSnapshot.size;

    // 3. Comentários Pendentes
    const reviewsSnapshot = await db.collection("reviews").where("approved", "==", false).get();
    const pendingReviewsCount = reviewsSnapshot.size;

    return NextResponse.json({
      totalOrders,
      totalSales,
      lowStockCount,
      pendingReviewsCount,
      catalogCount: (await db.collection("products").get()).size
    });
  } catch (error: any) {
    console.error("Erro ao carregar estatísticas:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
