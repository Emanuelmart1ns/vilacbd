import React from "react";
import { getProducts } from "@/lib/firebase";
import { products as staticProducts, Product } from "@/data/products";
import LojaClient from "@/components/LojaClient";

function mergeProducts(staticProds: Product[], fbProds: Product[]): Product[] {
  const mergedMap = new Map<string, Product>();
  
  // Add all static
  staticProds.forEach(p => mergedMap.set(p.id, p));
  
  // Overwrite or add from Firestore
  fbProds.forEach(fb => {
    const existing = mergedMap.get(fb.id);
    if (existing) {
       mergedMap.set(fb.id, {
         ...existing,
         ...fb,
         // Use Firestore images if defined, even if empty array
         images: fb.images !== undefined ? fb.images : existing.images,
       });
    } else {
       mergedMap.set(fb.id, fb);
    }
  });
  
  return Array.from(mergedMap.values());
}

export const revalidate = 0;

export default async function LojaPage() {
  let products: Product[] = [];
  
  try {
      const fbProducts = await getProducts(true) as Product[];
      products = mergeProducts(staticProducts, fbProducts);
  } catch (error) {
    console.error("Erro ao carregar loja no servidor:", error);
    products = staticProducts;
  }

  return <LojaClient initialProducts={products} />;
}
