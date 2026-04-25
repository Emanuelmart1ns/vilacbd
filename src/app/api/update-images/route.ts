import { NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";
import { products as staticProducts } from "@/data/products";

export async function GET() {
  try {
    const db = getAdminDb();

    // Atualizar produtos existentes com o campo images dos dados estáticos
    const batch = db.batch();
    let updatedCount = 0;

    for (const product of staticProducts) {
      if (product.images && product.images.length > 0) {
        const docRef = db.collection("products").doc(product.id);
        batch.update(docRef, { 
          images: product.images,
          image: product.image // Atualizar também a imagem principal
        });
        updatedCount++;
      }
    }

    await batch.commit();

    return NextResponse.json({ 
      message: `${updatedCount} produtos atualizados com imagens secundárias!`,
      details: staticProducts
        .filter(p => p.images && p.images.length > 0)
        .map(p => ({ id: p.id, name: p.name, imageCount: p.images?.length || 0 }))
    }, { status: 200 });
  } catch (error) {
    console.error("Erro ao atualizar imagens:", error);
    return NextResponse.json({ error: "Erro ao atualizar imagens: " + (error as Error).message }, { status: 500 });
  }
}
