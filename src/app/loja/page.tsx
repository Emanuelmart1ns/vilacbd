import React from "react";
import { getProducts } from "@/lib/firebase";
import { products as staticProducts, Product } from "@/data/products";
import LojaClient from "@/components/LojaClient";

export default async function LojaPage() {
  let products: Product[] = [];
  
  try {
    const data = await getProducts();
    if (data && data.length > 0) {
      products = data as Product[];
    } else {
      products = staticProducts;
    }
  } catch (error) {
    console.error("Erro ao carregar loja no servidor:", error);
    products = staticProducts;
  }

  return <LojaClient initialProducts={products} />;
}
