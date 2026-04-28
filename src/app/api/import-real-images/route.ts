import { NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";

// Mapeamento das imagens reais descarregadas no servidor (public/products/...)
const CATEGORY_POOLS: Record<string, string[]> = {
  "Óleos e Tinturas": [
    "/products/oleos/oil_real_1.jpg",
    "/products/oleos/oil_real_2.jpg",
    "/products/oleos/oil_real_3.png",
    "/products/oleos/oil_real_4.png",
    "/products/oleos/oil_real_5.jpg",
    "/products/oleos/oil_real_6.png",
    "/products/oleos/oil_real_7.png"
  ],
  "Flores de Cânhamo": [
    "/products/flores/flores_real_1.jpg",
    "/products/flores/flores_real_2.jpg",
    "/products/flores/flores_real_3.jpg",
    "/products/flores/flores_real_4.jpg",
    "/products/flores/flores_real_5.png",
    "/products/flores/flores_real_6.jpg",
    "/products/flores/flores_real_7.jpg",
    "/products/flores/flores_real_8.jpg"
  ],
  "Gomas e Edibles": [
    "/products/edibles/edibles_real_1.jpg",
    "/products/edibles/edibles_real_2.jpg",
    "/products/edibles/edibles_real_3.jpg",
    "/products/edibles/edibles_real_4.jpg",
    "/products/edibles/edibles_real_5.png",
    "/products/edibles/edibles_real_6.png",
    "/products/edibles/edibles_real_7.png"
  ],
  "Tópicos e Cosméticos": [
    "/products/cosmeticos/cosmeticos_real_1.jpg",
    "/products/cosmeticos/cosmeticos_real_2.png",
    "/products/cosmeticos/cosmeticos_real_3.png",
    "/products/cosmeticos/cosmeticos_real_4.png",
    "/products/cosmeticos/cosmeticos_real_5.png",
    "/products/cosmeticos/cosmeticos_real_6.png",
    "/products/cosmeticos/cosmeticos_real_7.png"
  ],
  "Acessórios e Vapes": [
    "/products/vapes/vapes_real_2.jpg",
    "/products/vapes/vapes_real_3.jpg",
    "/products/vapes/vapes_real_4.jpg",
    "/products/vapes/vapes_real_5.jpg"
  ]
};

// Função para baralhar um array (para galerias únicas)
function shuffleArray(array: string[]) {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

export async function GET() {
  try {
    const db = getAdminDb();
    const productsSnapshot = await db.collection("products").get();
    
    const batch = db.batch();
    let count = 0;

    // Usar um contador por categoria para garantir imagens principais diferentes
    const categoryCounters: Record<string, number> = {};

    productsSnapshot.docs.forEach((doc) => {
      const product = doc.data();
      const category = product.category;
      
      const pool = CATEGORY_POOLS[category] || CATEGORY_POOLS["Óleos e Tinturas"];
      
      if (!categoryCounters[category]) categoryCounters[category] = 0;
      const index = categoryCounters[category] % pool.length;
      
      // Imagem principal única para o produto (dentro do pool da categoria)
      const mainImage = pool[index];
      
      // Criar galeria com 4 imagens (a principal + outras 3 aleatórias da mesma categoria)
      const otherImages = pool.filter(img => img !== mainImage);
      const shuffledOthers = shuffleArray(otherImages);
      const gallery = [mainImage, ...shuffledOthers.slice(0, 3)];
      
      batch.update(doc.ref, {
        image: mainImage,
        images: gallery
      });
      
      categoryCounters[category]++;
      count++;
    });

    await batch.commit();

    return NextResponse.json({ 
      success: true, 
      message: `${count} produtos agora possuem imagens REAIS e galerias únicas.`,
      details: "As imagens foram importadas de lojas internacionais e estão agora alojadas localmente."
    });
  } catch (error) {
    console.error("Import error:", error);
    return NextResponse.json({ error: "Failed to import images", details: String(error) }, { status: 500 });
  }
}
