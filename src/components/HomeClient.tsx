"use client";

import React, { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { Product } from "@/data/products";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import ProductModal from "@/components/ProductModal";

interface HomeClientProps {
  initialProducts: Product[];
}

export default function HomeClient({ initialProducts }: HomeClientProps) {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { addToCart } = useCart();
  const { user, loading: authLoading } = useAuth();

  const bestSellers = initialProducts.filter(p => p.isPopular).slice(0, 4);

  const handleProductClick = (product: Product) => {
    if (!user) return;
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  return (
    <main style={{ minHeight: "100vh", backgroundColor: "var(--bg-primary)" }}>
      <Navbar />

      <section className="hero-cinematic">
        <div className="hero-overlay" style={{ background: "rgba(0, 0, 0, 0.7)" }}></div>
        
        <div className="hero-content">
          <h1 className="hero-title fade-in">A Essência Pura <br/>da Natureza</h1>
          <p className="hero-subtitle fade-in" style={{ animationDelay: "0.2s" }}>
            Produtos CBD Premium em Santa Maria da Feira. Qualidade rigorosa, testes de laboratório suíço e resultados reais.
          </p>
          <div className="hero-buttons fade-in" style={{ animationDelay: "0.4s" }}>
            {user ? (
              <Link href="/loja" className="btn-primary" style={{ padding: "16px 40px", fontSize: "1.1rem" }}>
                Explorar a Loja
              </Link>
            ) : (
              <Link href="/login" className="btn-primary" style={{ padding: "16px 40px", fontSize: "1.1rem" }}>
                Entrar na Loja
              </Link>
            )}
            <Link href="/sobre" className="btn-secondary" style={{ padding: "16px 40px", fontSize: "1.1rem", border: "1px solid rgba(255,255,255,0.3)" }}>
              Saber Mais
            </Link>
          </div>
        </div>
      </section>

      {!authLoading && (
        <section className="bestsellers-section" style={{ padding: "80px 0" }}>
          <div className="container">
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: "40px" }}>
              <div style={{ textAlign: "center", marginBottom: "20px" }}>
                <h2 style={{ fontSize: "2.5rem", color: "var(--accent-gold)", marginBottom: "8px" }}>Mais Vendidos</h2>
                <p style={{ color: "var(--text-secondary)" }}>Os produtos favoritos dos nossos clientes.</p>
              </div>
              {user ? (
                <Link href="/loja" className="btn-secondary">Ver Tudo</Link>
              ) : (
                <Link href="/login" className="btn-secondary">Entrar para Ver</Link>
              )}
            </div>

            <div className="product-grid">
              {bestSellers.map((product) => (
                <div 
                  key={product.id} 
                  className="product-card"
                  style={{ cursor: "pointer" }}
                  onClick={() => {
                    if (!user) {
                      window.location.href = "/login";
                      return;
                    }
                    handleProductClick(product);
                  }}
                >
                  {product.image ? (
                    <img src={product.image} alt={product.name} className="product-image" />
                  ) : (
                    <div className="product-image" style={{ background: product.color, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <span style={{ color: "rgba(255,255,255,0.5)", fontSize: "2rem" }}>Vila CBD</span>
                    </div>
                  )}
                  <div className="product-info">
                    <span className="product-category">{product.category}</span>
                    <h3 className="product-title">{product.name}</h3>
                    <div className="product-footer" style={{ marginTop: "auto" }}>
                      <span className="product-price">€ {product.price.toFixed(2)}</span>
                      {user ? (
                        <button 
                          className="btn-primary" 
                          style={{ padding: "8px 20px" }}
                          onClick={(e) => {
                            e.stopPropagation();
                            addToCart({
                              id: product.id,
                              name: product.name,
                              price: product.price,
                              quantity: 1,
                              image: product.image,
                              color: product.color
                            });
                          }}
                        >
                          Comprar
                        </button>
                      ) : (
                        <button 
                          className="btn-primary" 
                          style={{ padding: "8px 20px" }}
                          onClick={(e) => {
                            e.stopPropagation();
                            window.location.href = "/login";
                          }}
                        >
                          Entrar
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}



      <ProductModal 
        product={selectedProduct} 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </main>
  );
}
