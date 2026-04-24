import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { collection, addDoc, getDocs, query, limit } from "firebase/firestore";
import { products as initialProducts } from "@/data/products";

export async function GET() {
  try {
    // Verificar se já existem produtos para evitar duplicação acidental
    const q = query(collection(db, "products"), limit(1));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      return NextResponse.json({ message: "Base de dados já contém produtos." }, { status: 200 });
    }

    // Adicionar todos os produtos do ficheiro estático ao Firestore
    const promises = initialProducts.map((product) => {
      // Removemos o ID estático para o Firebase gerar o seu próprio, 
      // ou mantemos se quisermos IDs específicos. Vamos deixar o Firebase gerar.
      const { id, ...productData } = product;
      return addDoc(collection(db, "products"), productData);
    });

    await Promise.all(promises);

    return NextResponse.json({ message: "32 Produtos migrados com sucesso para o Firestore!" }, { status: 200 });
  } catch (error: any) {
    console.error("Erro ao migrar produtos:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
