import React from "react";
import { getProducts } from "@/lib/firebase";
import { products as staticProducts, Product } from "@/data/products";
import ProductPageClient from "./ProductPageClient";
import { notFound } from "next/navigation";

export const revalidate = 0;

export async function generateStaticParams() {
  const allProducts = [...staticProducts];
  return allProducts.map((p) => ({ id: p.id }));
}

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

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  let products: Product[] = [];
  
  try {
    const data = await getProducts();
    products = mergeProducts(staticProducts, data as Product[]);
  } catch {
    products = staticProducts;
  }

  const product = products.find((p) => p.id === id);
  
  if (!product) {
    notFound();
  }

  return <ProductPageClient product={product} allProducts={products} />;
}
