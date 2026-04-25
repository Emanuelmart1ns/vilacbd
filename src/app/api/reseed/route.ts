import { NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";
import { products as staticProducts } from "@/data/products";

export async function GET() {
  try {
    const db = getAdminDb();

    // Recriar todos os produtos com os dados estáticos (incluindo imagens)
    const batch = db.batch();
    
    staticProducts.forEach((product) => {
      const docRef = db.collection("products").doc(product.id);
      // Usar set com merge para atualizar ou criar
      batch.set(docRef, product, { merge: true });
    });

    await batch.commit();

    const productsWithImages = staticProducts.filter(p => p.images && p.images.length > 0);

    return NextResponse.json({ 
      message: `${staticProducts.length} produtos sincronizados com sucesso!`,
      productsWithMultipleImages: productsWithImages.length,
      details: productsWithImages.map(p => ({ 
        id: p.id, 
        name: p.name, 
        imageCount: (p.images?.length || 0) + 1 // +1 para incluir a imagem principal
      }))
    }, { status: 200 });
  } catch (error) {
    console.error("Erro ao sincronizar produtos:", error);
    return NextResponse.json({ 
      error: "Erro ao sincronizar produtos: " + (error as Error).message,
      stack: process.env.NODE_ENV === 'development' ? (error as Error).stack : undefined
    }, { status: 500 });
  }
}
