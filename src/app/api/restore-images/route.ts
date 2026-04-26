import { NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";
import { products as staticProducts } from "@/data/products";

export async function GET() {
  try {
    const db = getAdminDb();
    const batch = db.batch();

    for (const p of staticProducts) {
      const ref = db.collection("products").doc(p.id);
      batch.update(ref, {
        image: p.image || null,
        images: p.images || [],
      });
    }

    await batch.commit();
    return NextResponse.json({ success: true, restored: staticProducts.length });
  } catch (error) {
    console.error("Restore error:", error);
    return NextResponse.json({ error: "Failed", details: String(error) }, { status: 500 });
  }
}
