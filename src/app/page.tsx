import React from "react";
import { products } from "@/data/products";

export default function Home() {
  return (
    <main style={{ minHeight: "100vh" }}>
      {/* Hero Section */}
      <section className="hero-section fade-in">
        <h1>Vila CBD</h1>
        <p>A experiência premium de bem-estar botânico em Santa Maria da Feira. Qualidade rigorosa, resultados reais.</p>
        <button className="btn-primary" style={{ fontSize: "1.1rem", padding: "16px 32px" }}>Ver Coleção Completa</button>
      </section>

      {/* Catalog Section */}
      <section className="container" style={{ paddingTop: "60px", paddingBottom: "80px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "16px" }}>
          <div>
            <h2 style={{ fontSize: "2rem", color: "var(--accent-gold)", marginBottom: "8px" }}>O Nosso Catálogo</h2>
            <p style={{ color: "var(--text-secondary)" }}>Mais de 30 produtos cuidadosamente selecionados para o seu bem-estar.</p>
          </div>
          
          <div className="filters">
            <button className="btn-secondary active">Todos</button>
            <button className="btn-secondary">Óleos</button>
            <button className="btn-secondary">Flores</button>
            <button className="btn-secondary">Gomas</button>
          </div>
        </div>

        <div className="product-grid">
          {products.map((product, index) => (
            <div 
              key={product.id} 
              className="product-card fade-in" 
              style={{ animationDelay: `${(index % 8) * 0.1}s` }}
            >
              {product.isPopular && <div className="badge-popular">Mais Vendido</div>}
              {/* Usamos a tag nativa img temporariamente para garantir renderização local sem erro de domains do Next Image */}
              <img src={product.image} alt={product.name} className="product-image" />
              <div className="product-info">
                <span className="product-category">{product.category}</span>
                <h3 className="product-title">{product.name}</h3>
                <p className="product-desc">{product.description}</p>
                <div className="product-footer">
                  <span className="product-price">€ {product.price.toFixed(2)}</span>
                  <button className="btn-primary" style={{ padding: "8px 20px" }}>Comprar</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
