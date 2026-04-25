import { NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";
import { products as staticProducts } from "@/data/products";

export async function GET() {
  try {
    const db = getAdminDb();

    // Verificar quais produtos existem no Firebase
    const snapshot = await db.collection("products").get();
    const existingIds = new Set(snapshot.docs.map(doc => doc.id));

    if (existingIds.size === 0) {
      return NextResponse.json({ 
        error: "Nenhum produto encontrado no Firebase. Execute /api/seed primeiro." 
      }, { status: 400 });
    }

    // Atualizar produtos existentes com o campo images dos dados estáticos
    const batch = db.batch();
    let updatedCount = 0;
    const updates: any[] = [];

    for (const product of staticProducts) {
      // Só atualizar se o produto existir no Firebase E tiver imagens
      if (existingIds.has(product.id) && product.images && product.images.length > 0) {
        const docRef = db.collection("products").doc(product.id);
        batch.update(docRef, { 
          images: product.images,
          image: product.image // Atualizar também a imagem principal
        });
        updatedCount++;
        updates.push({ 
          id: product.id, 
          name: product.name, 
          imageCount: product.images.length 
        });
      }
    }

    if (updatedCount === 0) {
      return NextResponse.json({ 
        message: "Nenhum produto com múltiplas imagens encontrado para atualizar.",
        existingProducts: existingIds.size
      }, { status: 200 });
    }

    await batch.commit();

    return NextResponse.json({ 
      message: `${updatedCount} produtos atualizados com imagens secundárias!`,
      totalProducts: existingIds.size,
      details: updates
    }, { status: 200 });
  } catch (error) {
    console.error("Erro ao atualizar imagens:", error);
    return NextResponse.json({ 
      error: "Erro ao atualizar imagens: " + (error as Error).message,
      stack: (error as Error).stack
    }, { status: 500 });
  }
}
