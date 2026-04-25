"use client";

import React, { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { Product } from "@/data/products";
import { useCart } from "@/context/CartContext";
import ProductModal from "@/components/ProductModal";

interface ProductPageClientProps {
  product: Product;
  allProducts: Product[];
}

export default function ProductPageClient({ product, allProducts }: ProductPageClientProps) {
  const { addToCart } = useCart();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const relatedProducts = allProducts
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  const allImages = [product.image, ...(product.images || [])].filter(Boolean) as string[];
  const [activeImg, setActiveImg] = useState<string | null>(product.image || null);

  return (
    <main style={{ minHeight: "100vh", backgroundColor: "var(--bg-primary)", paddingTop: "100px" }}>
      <Navbar />
      
      <div className="container">
        {/* Breadcrumb */}
        <nav style={{ marginBottom: "24px", fontSize: "0.9rem", color: "var(--text-secondary)" }}>
          <Link href="/">Início</Link>
          <span style={{ margin: "0 8px" }}>/</span>
          <Link href="/loja">Loja</Link>
          <span style={{ margin: "0 8px" }}>/</span>
          <span style={{ color: "var(--text-primary)" }}>{product.name}</span>
        </nav>

        {/* Product Detail */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "48px", marginBottom: "80px" }}>
          {/* Gallery */}
          <div>
            <div
              style={{
                width: "100%",
                aspectRatio: "1",
                borderRadius: "16px",
                overflow: "hidden",
                background: product.color || "#121812",
                backgroundImage: activeImg ? `url(${activeImg})` : "none",
                backgroundSize: "cover",
                backgroundPosition: "center",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "16px",
              }}
            >
              {!activeImg && (
                <span style={{ color: "rgba(255,255,255,0.5)", fontSize: "1.5rem" }}>Vila Cãnhamo</span>
              )}
            </div>

            {allImages.length > 1 && (
              <div style={{ display: "flex", gap: "8px" }}>
                {allImages.map((img, i) => (
                  <div
                    key={i}
                    onClick={() => setActiveImg(img)}
                    style={{
                      width: "80px",
                      height: "80px",
                      borderRadius: "8px",
                      overflow: "hidden",
                      cursor: "pointer",
                      border: activeImg === img ? "2px solid var(--accent-gold)" : "2px solid transparent",
                      backgroundImage: `url(${img})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div>
            <span className="product-category">{product.category}</span>
            <h1 style={{ fontSize: "2.5rem", marginBottom: "16px", color: "var(--text-primary)" }}>{product.name}</h1>
            <p style={{ fontSize: "1.1rem", color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: "32px" }}>
              {product.description}
            </p>

            <div style={{ display: "flex", alignItems: "center", gap: "24px", marginBottom: "32px" }}>
              <span style={{ fontSize: "2rem", fontWeight: 700, color: "var(--accent-green-light)" }}>
                € {product.price.toFixed(2)}
              </span>
              {product.stock > 0 && (
                <span style={{ fontSize: "0.9rem", color: "var(--accent-green-light)", background: "rgba(66, 130, 94, 0.1)", padding: "4px 12px", borderRadius: "20px" }}>
                  Em stock ({product.stock} un.)
                </span>
              )}
            </div>

            <div style={{ display: "flex", gap: "16px" }}>
              <button
                className="btn-primary"
                style={{ flex: 1, padding: "16px", fontSize: "1.1rem" }}
                onClick={() => {
                  addToCart({
                    id: product.id,
                    name: product.name,
                    price: product.price,
                    quantity: 1,
                    image: product.image,
                    color: product.color,
                  });
                }}
              >
                Adicionar ao Carrinho
              </button>
              <button
                className="btn-secondary"
                style={{ padding: "16px 24px" }}
                onClick={() => {
                  addToCart({
                    id: product.id,
                    name: product.name,
                    price: product.price,
                    quantity: 1,
                    image: product.image,
                    color: product.color,
                  });
                }}
              >
                Comprar Agora
              </button>
            </div>

            {/* Product Meta */}
            <div style={{ marginTop: "40px", borderTop: "1px solid var(--glass-border)", paddingTop: "24px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--text-secondary)" }}>Categoria</span>
                  <span style={{ color: "var(--text-primary)" }}>{product.category}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--text-secondary)" }}>ID do Produto</span>
                  <span style={{ color: "var(--text-primary)", fontFamily: "monospace" }}>{product.id}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section style={{ marginBottom: "80px" }}>
            <h2 style={{ fontSize: "2rem", marginBottom: "32px", color: "var(--accent-gold)" }}>Produtos Relacionados</h2>
            <div className="product-grid">
              {relatedProducts.map((p) => (
                <div
                  key={p.id}
                  className="product-card"
                  style={{ cursor: "pointer" }}
                  onClick={() => {
                    setSelectedProduct(p);
                    setIsModalOpen(true);
                  }}
                >
                  <div
                    className="product-image"
                    style={{
                      background: p.color || "#121812",
                      backgroundImage: p.image ? `url(${p.image})` : "none",
                      backgroundSize: "cover",
                    }}
                  />
                  <div className="product-info">
                    <span className="product-category">{p.category}</span>
                    <h3 className="product-title">{p.name}</h3>
                    <div className="product-footer">
                      <span className="product-price">€ {p.price.toFixed(2)}</span>
                      <button
                        className="btn-primary"
                        style={{ padding: "8px 20px" }}
                        onClick={(e) => {
                          e.stopPropagation();
                          addToCart({ id: p.id, name: p.name, price: p.price, quantity: 1, image: p.image, color: p.color });
                        }}
                      >
                        Comprar
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      <ProductModal
        product={selectedProduct}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </main>
  );
}
