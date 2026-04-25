import React from "react";
import { getProducts } from "@/lib/firebase";
import { products as staticProducts, Product } from "@/data/products";
import ProductPageClient from "./ProductPageClient";
import { notFound } from "next/navigation";

export const revalidate = 60;

export async function generateStaticParams() {
  const allProducts = [...staticProducts];
  return allProducts.map((p) => ({ id: p.id }));
}

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  let products: Product[] = [];
  
  try {
    const data = await getProducts();
    if (data && data.length > 0) {
      products = data as Product[];
    } else {
      products = staticProducts;
    }
  } catch {
    products = staticProducts;
  }

  const product = products.find((p) => p.id === id);
  
  if (!product) {
    notFound();
  }

  return <ProductPageClient product={product} allProducts={products} />;
}
