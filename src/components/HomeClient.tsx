"use client";

import React, { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { Product } from "@/data/products";
import { useCart } from "@/context/CartContext";
import ProductModal from "@/components/ProductModal";

interface HomeClientProps {
  initialProducts: Product[];
}

export default function HomeClient({ initialProducts }: HomeClientProps) {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { addToCart } = useCart();

  // Obter 4 best sellers
  const bestSellers = initialProducts.filter(p => p.isPopular).slice(0, 4);

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  return (
    <main style={{ minHeight: "100vh", backgroundColor: "var(--bg-primary)" }}>
      <Navbar />

      {/* Hero Section Cinematográfica */}
      <section className="hero-cinematic">
        <div className="hero-overlay" style={{ background: "rgba(0, 0, 0, 0.7)" }}></div>
        
        <div className="hero-content">
          <h1 className="hero-title fade-in">A Essência Pura <br/>da Natureza</h1>
          <p className="hero-subtitle fade-in" style={{ animationDelay: "0.2s" }}>
            Produtos CBD Premium em Santa Maria da Feira. Qualidade rigorosa, testes de laboratório suíço e resultados reais.
          </p>
          <div className="hero-buttons fade-in" style={{ animationDelay: "0.4s" }}>
            <Link href="/loja" className="btn-primary" style={{ padding: "16px 40px", fontSize: "1.1rem" }}>
              Explorar a Loja
            </Link>
            <Link href="#sobre" className="btn-secondary" style={{ padding: "16px 40px", fontSize: "1.1rem", border: "1px solid rgba(255,255,255,0.3)" }}>
              Saber Mais
            </Link>
          </div>
        </div>
      </section>

      {/* Secção Confiança / Features */}
      <section id="sobre" className="features-section">
        <div className="container">
          <div className="features-grid">
            <div className="feature-item">
              <div className="feature-icon" style={{ color: "var(--accent-gold)" }}>🌿</div>
              <h3>100% Orgânico</h3>
              <p>Cultivado sem pesticidas ou químicos.</p>
            </div>
            <div className="feature-item">
              <div className="feature-icon" style={{ color: "var(--accent-gold)" }}>🔬</div>
              <h3>Testado em Laboratório</h3>
              <p>Certificado de análise em todos os lotes.</p>
            </div>
            <div className="feature-item">
              <div className="feature-icon" style={{ color: "var(--accent-gold)" }}>⚡</div>
              <h3>Efeito Rápido</h3>
              <p>Extração Full Spectrum de alta absorção.</p>
            </div>
          </div>

          <div className="location-container" style={{ marginTop: "60px", display: "grid", gridTemplateColumns: "1fr 1.5fr", gap: "40px", alignItems: "center", borderTop: "1px solid var(--glass-border)", paddingTop: "60px" }}>
            <div className="location-text" style={{ textAlign: "left" }}>
              <h3 style={{ color: "var(--accent-gold)", marginBottom: "24px", fontSize: "2rem" }}>Onde Estamos</h3>
              <p style={{ color: "var(--text-primary)", fontSize: "1.1rem", marginBottom: "16px" }}>
                📍 <strong>Vila CBD Santa Maria da Feira</strong><br/>
                Rua Dr. Roberto Alves 56, <br/>
                4520-213 Santa Maria da Feira
              </p>
              <div style={{ background: "rgba(255,255,255,0.03)", padding: "20px", borderRadius: "12px", border: "1px solid var(--glass-border)" }}>
                <h4 style={{ marginBottom: "12px", color: "var(--accent-green-light)" }}>Horário de Funcionamento</h4>
                <ul style={{ listStyle: "none", padding: 0, fontSize: "0.9rem", color: "var(--text-secondary)" }}>
                  <li style={{ marginBottom: "8px" }}>📅 Segunda a Sexta: 10:00 - 13:00 | 14:30 - 19:00</li>
                  <li>📅 Sábado: 10:00 - 13:00</li>
                </ul>
              </div>
            </div>
            
            <div className="location-map" style={{ borderRadius: "16px", overflow: "hidden", border: "1px solid var(--glass-border)", height: "350px" }}>
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3014.5678!2d-8.5432!3d40.9254!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xd2385...!2sSanta%20Maria%20da%20Feira!5e0!3m2!1spt-PT!2spt!4v171396...!" 
                width="100%" 
                height="100%" 
                style={{ border: 0 }} 
                allowFullScreen={true} 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>
          </div>
        </div>
      </section>

      {/* Secção Best Sellers */}
      <section className="bestsellers-section" style={{ padding: "80px 0" }}>
        <div className="container">
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: "40px" }}>
            <div style={{ textAlign: "center", marginBottom: "20px" }}>
              <h2 style={{ fontSize: "2.5rem", color: "var(--accent-gold)", marginBottom: "8px" }}>Mais Vendidos</h2>
              <p style={{ color: "var(--text-secondary)" }}>Os produtos favoritos dos nossos clientes.</p>
            </div>
            <Link href="/loja" className="btn-secondary">Ver Tudo</Link>
          </div>

          <div className="product-grid">
            {bestSellers.map((product) => (
              <div 
                key={product.id} 
                className="product-card"
                style={{ cursor: "pointer" }}
                onClick={() => handleProductClick(product)}
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
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <ProductModal 
        product={selectedProduct} 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </main>
  );
}
