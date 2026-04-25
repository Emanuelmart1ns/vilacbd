import React from "react";
import { getProducts } from "@/lib/firebase";
import { products as staticProducts, Product } from "@/data/products";
import LojaClient from "@/components/LojaClient";

function mergeWithStatic(fbProducts: Product[]): Product[] {
  const staticMap = new Map(staticProducts.map(p => [p.id, p]));
  return fbProducts.map(fb => {
    const st = staticMap.get(fb.id);
    if (!st) return fb;
    return {
      ...fb,
      image: fb.image || st.image,
      images: (!fb.images || fb.images.length === 0) ? st.images : fb.images,
      color: fb.color || st.color,
    };
  });
}

export const revalidate = 60;

export default async function LojaPage() {
  let products: Product[] = [];
  
  try {
    const data = await getProducts();
    if (data && data.length > 0) {
      products = mergeWithStatic(data as Product[]);
    } else {
      products = staticProducts;
    }
  } catch (error) {
    console.error("Erro ao carregar loja no servidor:", error);
    products = staticProducts;
  }

  return <LojaClient initialProducts={products} />;
}
