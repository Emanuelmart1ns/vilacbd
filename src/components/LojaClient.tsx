"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { Product } from "@/data/products";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import ProductModal from "@/components/ProductModal";

interface LojaClientProps {
  initialProducts: Product[];
}

export default function LojaClient({ initialProducts }: LojaClientProps) {
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { addToCart } = useCart();
  const { user, loading: authLoading } = useAuth();
  const [settingsCategories, setSettingsCategories] = useState<{name: string, subcategories: string[]}[]>([]);

  useEffect(() => {
    fetch("/api/settings")
      .then(res => res.json())
      .then(data => {
        if (data.categories) setSettingsCategories(data.categories);
      })
      .catch(err => console.error("Erro ao carregar categorias:", err));
  }, []);

  const filteredProducts = selectedCategory === "Todos" 
    ? initialProducts 
    : initialProducts.filter(p => {
        if (selectedCategory.includes("|")) {
          const [cat, sub] = selectedCategory.split("|");
          return p.category === cat && p.subcategory === sub;
        }
        return p.category === selectedCategory;
      });

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  if (authLoading) {
    return (
      <main style={{ minHeight: "100vh", backgroundColor: "var(--bg-primary)" }}>
        <Navbar />
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "80vh", color: "var(--text-secondary)" }}>
          A verificar acesso...
        </div>
      </main>
    );
  }

  if (!user) {
    return (
      <main style={{ minHeight: "100vh", backgroundColor: "var(--bg-primary)" }}>
        <Navbar />
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "80vh", gap: "24px" }}>
          <h2 style={{ color: "var(--accent-gold)", fontSize: "2rem" }}>Acesso Reservado</h2>
          <p style={{ color: "var(--text-secondary)", textAlign: "center", maxWidth: "400px" }}>
            Inicie sessão para aceder ao nosso catálogo completo de produtos premium.
          </p>
          <Link href="/login" className="btn-primary" style={{ padding: "14px 40px", fontSize: "1rem" }}>
            Entrar na Conta
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main style={{ minHeight: "100vh", backgroundColor: "var(--bg-primary)", paddingTop: "100px" }}>
      <Navbar />
      
      <div className="container">
        <div className="shop-layout" style={{ display: "grid", gridTemplateColumns: "250px 1fr", gap: "40px", marginTop: "40px" }}>
          <aside className="shop-sidebar">
            <h3 style={{ marginBottom: "20px", color: "var(--accent-gold)" }}>Categorias</h3>
            <div className="category-list" style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <button 
                className={`category-btn ${selectedCategory === "Todos" ? 'active' : ''}`}
                onClick={() => setSelectedCategory("Todos")}
                style={{
                  textAlign: "left",
                  padding: "10px",
                  background: selectedCategory === "Todos" ? "rgba(212, 175, 55, 0.1)" : "transparent",
                  border: "none",
                  color: selectedCategory === "Todos" ? "var(--accent-gold)" : "var(--text-secondary)",
                  cursor: "pointer",
                  borderRadius: "8px",
                  transition: "all 0.2s"
                }}
              >
                Todos
              </button>
              {settingsCategories.map((cat) => (
                <div key={cat.name} style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  <button 
                    className={`category-btn ${selectedCategory === cat.name ? 'active' : ''}`}
                    onClick={() => setSelectedCategory(cat.name)}
                    style={{
                      textAlign: "left",
                      padding: "10px",
                      background: selectedCategory === cat.name ? "rgba(212, 175, 55, 0.1)" : "transparent",
                      border: "none",
                      color: selectedCategory === cat.name || selectedCategory.startsWith(cat.name + "|") ? "var(--accent-gold)" : "var(--text-secondary)",
                      cursor: "pointer",
                      borderRadius: "8px",
                      transition: "all 0.2s"
                    }}
                  >
                    {cat.name}
                  </button>
                  {cat.subcategories && cat.subcategories.length > 0 && cat.subcategories.map(sub => {
                    const subKey = `${cat.name}|${sub}`;
                    return (
                      <button
                        key={subKey}
                        onClick={() => setSelectedCategory(subKey)}
                        style={{
                          textAlign: "left",
                          padding: "6px 10px 6px 20px",
                          background: selectedCategory === subKey ? "rgba(212, 175, 55, 0.1)" : "transparent",
                          border: "none",
                          color: selectedCategory === subKey ? "var(--accent-gold)" : "var(--text-secondary)",
                          cursor: "pointer",
                          borderRadius: "8px",
                          fontSize: "0.9rem",
                          transition: "all 0.2s"
                        }}
                      >
                        {sub}
                      </button>
                    )
                  })}
                </div>
              ))}
            </div>
          </aside>

          <div className="shop-main">
            <div className="section-header" style={{ marginBottom: "32px" }}>
              <h1 style={{ fontSize: "2.5rem", marginBottom: "8px" }}>Catálogo Completo</h1>
              <p style={{ color: "var(--text-secondary)" }}>A nossa seleção rigorosa para o seu bem-estar.</p>
            </div>

            <div className="product-grid">
              {filteredProducts.map((product) => (
                <div 
                  key={product.id} 
                  className="product-card"
                  style={{ cursor: "pointer" }}
                  onClick={() => handleProductClick(product)}
                >
                  <div 
                    className="product-image" 
                    style={{ 
                      background: product.color || "#121812", 
                      backgroundImage: product.image ? `url(${product.image})` : 'none',
                      backgroundSize: 'cover'
                    }}
                  >
                  </div>
                  <div className="product-info">
                    <span className="product-category">{product.category}</span>
                    <h3 className="product-title">{product.name}</h3>
                    <div className="product-footer">
                      <span className="product-price">€ {product.price.toFixed(2)}</span>
                      <button 
                        className="btn-primary"
                        onClick={(e) => {
                          e.stopPropagation();
                          addToCart({ ...product, quantity: 1 });
                        }}
                      >
                        Comprar
                      </button>
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

      <ProductModal 
        product={selectedProduct} 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </main>
  );
}
