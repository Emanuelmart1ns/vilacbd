"use client";

import React, { useState } from "react";
import Navbar from "@/components/Navbar";
import { products } from "@/data/products";

export default function LojaPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Filtrar produtos
  const filteredProducts = selectedCategory 
    ? products.filter(p => p.category === selectedCategory)
    : products;

  const categories = Array.from(new Set(products.map(p => p.category)));

  return (
    <main style={{ minHeight: "100vh", backgroundColor: "var(--bg-primary)" }}>
      <Navbar />

      <div className="container" style={{ paddingTop: "120px", paddingBottom: "80px" }}>
        <h1 style={{ fontSize: "3rem", color: "#fff", marginBottom: "8px" }}>Catálogo Completo</h1>
        <p style={{ color: "var(--text-secondary)", marginBottom: "40px" }}>A nossa seleção rigorosa de produtos para o seu bem-estar diário.</p>

        <div className="shop-layout">
          {/* Sidebar de Filtros */}
          <aside className="shop-sidebar">
            <div className="filter-group">
              <h4>Categorias</h4>
              <ul className="filter-list">
                <li>
                  <label className="filter-label" style={{ color: selectedCategory === null ? "var(--accent-gold)" : "var(--text-secondary)" }}>
                    <input 
                      type="radio" 
                      name="category" 
                      checked={selectedCategory === null}
                      onChange={() => setSelectedCategory(null)}
                    /> 
                    Mostrar Todos
                  </label>
                </li>
                {categories.map(cat => (
                  <li key={cat}>
                    <label className="filter-label" style={{ color: selectedCategory === cat ? "var(--accent-gold)" : "var(--text-secondary)" }}>
                      <input 
                        type="radio" 
                        name="category" 
                        checked={selectedCategory === cat}
                        onChange={() => setSelectedCategory(cat)}
                      /> 
                      {cat}
                    </label>
                  </li>
                ))}
              </ul>
            </div>
          </aside>

          {/* Grelha de Produtos */}
          <div className="shop-main">
            <div className="product-grid" style={{ paddingTop: 0 }}>
              {filteredProducts.map((product, index) => (
                <div 
                  key={product.id} 
                  className="product-card fade-in" 
                  style={{ animationDelay: `${(index % 8) * 0.05}s` }}
                >
                  {product.isPopular && <div className="badge-popular">Mais Vendido</div>}
                  {product.image ? (
                    <img src={product.image} alt={product.name} className="product-image" />
                  ) : (
                    <div className="product-image" style={{ background: product.color, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <span style={{ color: "rgba(255,255,255,0.5)", fontSize: "1.5rem", fontWeight: "bold" }}>Vila CBD</span>
                    </div>
                  )}
                  <div className="product-info">
                    <span className="product-category">{product.category}</span>
                    <h3 className="product-title">{product.name}</h3>
                    <p className="product-desc" style={{ fontSize: "0.85rem", marginBottom: "16px" }}>{product.description}</p>
                    <div className="product-footer" style={{ marginTop: "auto" }}>
                      <span className="product-price">€ {product.price.toFixed(2)}</span>
                      <button className="btn-primary" style={{ padding: "8px 20px" }}>Adicionar</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {filteredProducts.length === 0 && (
              <p style={{ color: "var(--text-secondary)", marginTop: "40px" }}>Nenhum produto encontrado nesta categoria.</p>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
