import { NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";

export async function GET() {
  try {
    const db = getAdminDb();
    let deletedReviews = 0;
    let deletedOrders = 0;

    const reviewsSnapshot = await db.collection("reviews").get();
    if (!reviewsSnapshot.empty) {
      const batch = db.batch();
      reviewsSnapshot.forEach((doc) => batch.delete(doc.ref));
      await batch.commit();
      deletedReviews = reviewsSnapshot.size;
    }

    const ordersSnapshot = await db.collection("orders").get();
    if (!ordersSnapshot.empty) {
      const batch = db.batch();
      ordersSnapshot.forEach((doc) => batch.delete(doc.ref));
      await batch.commit();
      deletedOrders = ordersSnapshot.size;
    }

    return NextResponse.json({
      message: `Limpo: ${deletedReviews} reviews, ${deletedOrders} encomendas.`
    }, { status: 200 });
  } catch (error) {
    console.error("Erro ao limpar dados:", error);
    return NextResponse.json({ error: "Erro ao limpar dados" }, { status: 500 });
  }
}
