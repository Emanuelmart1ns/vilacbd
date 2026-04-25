import { NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";
import { products as initialProducts } from "@/data/products";

export async function GET() {
  try {
    const db = getAdminDb();

    // Verificar se já existem produtos para evitar duplicação acidental
    const snapshot = await db.collection("products").limit(1).get();
    
    if (!snapshot.empty) {
      return NextResponse.json({ message: "Base de dados já contém produtos." }, { status: 200 });
    }

    // Adicionar todos os produtos do ficheiro estático ao Firestore
    const batch = db.batch();
    initialProducts.forEach((product) => {
      const docRef = db.collection("products").doc(product.id);
      batch.set(docRef, product);
    });

    await batch.commit();

    return NextResponse.json({ message: `${initialProducts.length} Produtos migrados com sucesso para o Firestore!` }, { status: 200 });
  } catch (error) {
    console.error("Erro ao migrar produtos:", error);
    return NextResponse.json({ error: "Erro ao migrar produtos" }, { status: 500 });
  }
}
