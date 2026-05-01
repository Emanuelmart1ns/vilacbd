import { NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";

export async function GET() {
  try {
    const db = getAdminDb();
    const productsSnapshot = await db.collection("products").get();
    
    const batch = db.batch();
    let fixCount = 0;

    productsSnapshot.docs.forEach((doc) => {
      const product = doc.data();
      
      // Se o produto não tiver referência ou for o formato antigo
      if (!product.reference || !product.reference.startsWith("VCBD")) {
        const randomRef = "VCBD" + Math.floor(100000 + Math.random() * 900000).toString();
        batch.update(doc.ref, { reference: randomRef });
        fixCount++;
      }
    });

    await batch.commit();

    return NextResponse.json({ 
      success: true, 
      message: `${fixCount} produtos receberam uma referência VCBD única.`
    });
  } catch (error) {
    console.error("Fix references error:", error);
    return NextResponse.json({ error: "Failed to fix references" }, { status: 500 });
  }
}
