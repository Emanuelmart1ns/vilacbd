import React from "react";
import { getProducts } from "@/lib/firebase";
import { products as staticProducts, Product } from "@/data/products";
import HomeClient from "@/components/HomeClient";

// Esta página agora é um Server Component por padrão (sem "use client")
export const revalidate = 60; // Revalida a cada 60 segundos

export default async function Home() {
  let products: Product[] = [];
  
  try {
    // Busca os produtos no servidor (muito mais rápido que no cliente)
    const data = await getProducts();
    if (data && data.length > 0) {
      products = data as Product[];
    } else {
      products = staticProducts;
    }
  } catch (error) {
    console.error("Erro ao carregar produtos no servidor:", error);
    products = staticProducts;
  }

  return <HomeClient initialProducts={products} />;
}
