import { NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";
import fs from "fs";
import path from "path";

// Função para baralhar um array
function shuffleArray(array: string[]) {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

// Função para normalizar strings (remover acentos e converter para minúsculas)
function normalizeString(str: string) {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export async function GET() {
  try {
    const db = getAdminDb();
    const productsSnapshot = await db.collection("products").get();
    
    // Carregar o inventário de imagens reais descarregadas
    const inventoryPath = path.join(process.cwd(), "scripts", "image_inventory.json");
    if (!fs.existsSync(inventoryPath)) {
      return NextResponse.json({ error: "Inventory file not found. Run download script first." }, { status: 400 });
    }
    
    const CATEGORY_POOLS = JSON.parse(fs.readFileSync(inventoryPath, "utf-8"));
    
    const batch = db.batch();
    let count = 0;

    // Usar um contador por categoria para garantir imagens principais diferentes
    const categoryCounters: Record<string, number> = {};

    // Preparar pools baralhados e normalizados
    const normalizedPools: Record<string, string[]> = {};
    Object.keys(CATEGORY_POOLS).forEach(cat => {
      const normalizedCat = normalizeString(cat);
      normalizedPools[normalizedCat] = shuffleArray(CATEGORY_POOLS[cat]);
    });

    productsSnapshot.docs.forEach((doc) => {
      const product = doc.data();
      const rawCategory = product.category;
      const normalizedCat = normalizeString(rawCategory);
      
      console.log(`Processing product: ${product.name} | Raw Category: "${rawCategory}" | Normalized: "${normalizedCat}"`);
      
      // Encontrar pool correspondente ou usar fallback
      let pool = normalizedPools[normalizedCat];
      if (!pool || pool.length === 0) {
        console.log(`  !! Category mismatch for "${rawCategory}" (${normalizedCat}), falling back to oils.`);
        pool = normalizedPools[normalizeString("Óleos e Tinturas")];
      }
      
      if (!categoryCounters[normalizedCat]) categoryCounters[normalizedCat] = 0;
      
      // Imagem principal: ciclar pelo pool baralhado
      const mainIndex = categoryCounters[normalizedCat] % pool.length;
      const mainImage = pool[mainIndex];
      
      // Sub-imagens: 4 imagens diferentes da principal
      // Tentamos garantir que sejam diferentes, se houver pool suficiente
      let galleryPool = pool.filter(img => img !== mainImage);
      if (galleryPool.length < 4) {
        // Se o pool for pequeno, repetimos algumas mas tentamos manter a variedade
        galleryPool = [...galleryPool, ...pool]; 
      }
      
      const shuffledGallery = shuffleArray(galleryPool);
      const gallery = [mainImage, ...shuffledGallery.slice(0, 4)];
      
      batch.update(doc.ref, {
        image: mainImage,
        images: gallery
      });
      
      categoryCounters[normalizedCat]++;
      count++;
    });

    await batch.commit();

    return NextResponse.json({ 
      success: true, 
      message: `${count} produtos agora possuem imagens REAIS e galerias de 5 imagens.`,
      details: "As imagens foram importadas de marcas internacionais (CBDfx, The CBD Flower Shop) para máxima qualidade."
    });
  } catch (error) {
    console.error("Import error:", error);
    return NextResponse.json({ error: "Failed to import images", details: String(error) }, { status: 500 });
  }
}
