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
      const name = product.name.toLowerCase();
      
      // Se o nome contém "Flor", "Moonrocks", "Trim" ou "Bud" e NÃO está na categoria de flores
      if (
        (name.includes("flor") || name.includes("moonrocks") || name.includes("trim") || name.includes("bud")) && 
        product.category !== "Flores de Cânhamo"
      ) {
        console.log(`Fixing category for: ${product.name} (Old category: ${product.category})`);
        batch.update(doc.ref, { category: "Flores de Cânhamo" });
        fixCount++;
      }
    });

    await batch.commit();

    return NextResponse.json({ 
      success: true, 
      message: `${fixCount} produtos tiveram a categoria corrigida para "Flores de Cânhamo".`,
      details: "Execute o import de imagens agora para atualizar as fotos."
    });
  } catch (error) {
    console.error("Fix categories error:", error);
    return NextResponse.json({ error: "Failed to fix categories" }, { status: 500 });
  }
}
