import React, { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { Product, products as staticProducts } from "@/data/products";
import { useCart } from "@/context/CartContext";
import { getProducts } from "@/lib/firebase";
import ProductModal from "@/components/ProductModal";

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await getProducts();
        if (data.length === 0) {
          setProducts(staticProducts);
        } else {
          setProducts(data as Product[]);
        }
      } catch (error) {
        console.error("Erro ao carregar produtos:", error);
        setProducts(staticProducts);
      }
    };
    fetchProducts();
  }, []);

  // Obter 4 best sellers
  const bestSellers = products.filter(p => p.isPopular).slice(0, 4);

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  return (
    <main style={{ minHeight: "100vh", backgroundColor: "var(--bg-primary)" }}>
      <Navbar />

      {/* Hero Section Cinematográfica */}
      <section className="hero-cinematic">
        <div className="hero-overlay"></div>
        
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
      <section className="features-section">
        <div className="container">
          <div className="features-grid">
            <div className="feature-item">
              <div className="feature-icon">🌿</div>
              <h3>100% Orgânico</h3>
              <p>Cultivado sem pesticidas ou químicos.</p>
            </div>
            <div className="feature-item">
              <div className="feature-icon">🔬</div>
              <h3>Testado em Laboratório</h3>
              <p>Certificado de análise em todos os lotes.</p>
            </div>
            <div className="feature-item">
              <div className="feature-icon">⚡</div>
              <h3>Efeito Rápido</h3>
              <p>Extração Full Spectrum de alta absorção.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Secção Best Sellers */}
      <section className="bestsellers-section" style={{ padding: "80px 0" }}>
        <div className="container">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "40px" }}>
            <div>
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
