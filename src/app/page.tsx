import { headers } from "next/headers";
import React from "react";
import { getProducts } from "@/lib/firebase";
import { products as staticProducts, Product } from "@/data/products";
import HomeClient from "@/components/HomeClient";
import ConstructionBanner from "@/components/ConstructionBanner";

function mergeProducts(staticProds: Product[], fbProds: Product[]): Product[] {
  const mergedMap = new Map<string, Product>();
  staticProds.forEach(p => mergedMap.set(p.id, p));
  fbProds.forEach(fb => {
    const existing = mergedMap.get(fb.id);
    if (existing) {
       mergedMap.set(fb.id, {
         ...existing,
         ...fb,
         images: fb.images !== undefined ? fb.images : existing.images,
       });
    } else {
       mergedMap.set(fb.id, fb);
    }
  });
  return Array.from(mergedMap.values());
}

export const revalidate = 60;

export default async function Home() {
  const headersList = await headers();
  const host = headersList.get("host") || "";
  const isDomain = host.includes("vilacbd.com") && !host.includes("vercel.app");

  if (isDomain) {
    return <ConstructionBanner />;
  }

  let products: Product[] = [];

  try {
    const data = await getProducts();
    products = mergeProducts(staticProducts, data as Product[]);
  } catch (error) {
    console.error("Erro ao carregar produtos no servidor:", error);
    products = staticProducts;
  }

  return <HomeClient initialProducts={products} />;
}
