"use client";

import React, { useState, useEffect } from "react";
import { Product } from "@/data/products";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { getReviews, addReview, FirestoreReview } from "@/lib/firebase";
import Link from "next/link";
import "./product-modal.css";

interface ProductModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function ProductModal({ product, isOpen, onClose }: ProductModalProps) {
  const { addToCart } = useCart();
  const { user } = useAuth();
  
  const [reviews, setReviews] = useState<FirestoreReview[]>([]);
  const [newComment, setNewComment] = useState("");
  const [rating, setRating] = useState(5);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeImg, setActiveImg] = useState<string | null>(null);
  
  // Reset activeImg when product changes, derive current display image
  const allImages = product ? [product.image, ...(product.images || [])].filter((img, index, self) => img && self.indexOf(img) === index) as string[] : [];
  const currentActiveImg = allImages.length > 0 && allImages.includes(activeImg || "") ? activeImg : (product?.image || null);

  // Reset activeImg when product changes
  useEffect(() => {
    if (product) {
      setActiveImg(null);
      console.log("Product images:", { 
        mainImage: product.image, 
        secondaryImages: product.images, 
        allImages: allImages 
      });
    }
  }, [product?.id]);

  useEffect(() => {
    if (!product) return;
    let cancelled = false;
    (async () => {
      try {
        const all = await getReviews();
        if (!cancelled) {
          const productReviews = all.filter((r) => r.productId === product.id);
          setReviews(productReviews);
        }
      } catch {
        console.error("Erro ao carregar reviews");
      }
    })();
    return () => { cancelled = true; };
  }, [product]);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !product) return;
    setIsSubmitting(true);
    try {
      await addReview({
        productId: product.id,
        userId: user.uid,
        userName: user.displayName || user.email?.split('@')[0] || 'Anónimo',
        userEmail: user.email ?? undefined,
        comment: newComment,
        rating: rating
      });
      setNewComment("");
      // Refresh reviews inline
      const all = await getReviews();
      const productReviews = all.filter((r) => r.productId === product.id);
      setReviews(productReviews);
    } catch {
      alert("Erro ao enviar comentário.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !product) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    // Fechar apenas se clicar no backdrop, não no conteúdo
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleCloseClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={handleBackdropClick}>
      <div className="modal-backdrop"></div>
      <div className="modal-content fade-in-up">
        <button className="modal-close" onClick={handleCloseClick}>
          ×
        </button>
        
        <div className="modal-grid">
          {/* Galeria de Imagens */}
          <div className="modal-gallery">
            <div 
              className="modal-main-img"
              style={{
                background: product.color || "#333",
                backgroundImage: currentActiveImg ? `url(${currentActiveImg})` : "none",
                backgroundSize: "cover",
                backgroundPosition: "center"
              }}
            >
              {!currentActiveImg && <span style={{ color: "rgba(255,255,255,0.5)", fontSize: "1.5rem" }}>Vila Cãnhamo</span>}
            </div>
            
            {allImages.length > 1 && (
              <div className="modal-thumbnails">
                <div style={{ padding: "8px 15px", color: "var(--text-secondary)", fontSize: "0.85rem" }}>
                  {allImages.length} imagens
                </div>
                {allImages.map((img, i) => (
                  <div 
                    key={i} 
                    className={`thumb ${currentActiveImg === img ? 'active' : ''}`}
                    onClick={() => {
                      console.log("Thumbnail clicked:", img);
                      setActiveImg(img);
                    }}
                    style={{ backgroundImage: `url(${img})`, backgroundSize: "cover", backgroundPosition: "center" }}
                    title={`Imagem ${i + 1}`}
                  />
                ))}
              </div>
            )}
            {allImages.length <= 1 && (
              <div style={{ padding: "15px", background: "rgba(0,0,0,0.3)", color: "var(--text-secondary)", fontSize: "0.85rem", textAlign: "center" }}>
                Apenas 1 imagem disponível
              </div>
            )}
          </div>

          {/* Detalhes do Produto */}
          <div className="modal-details">
            <span className="product-category">{product.category}</span>
            <h2 className="product-title">{product.name}</h2>
            <p className="product-description">{product.description}</p>
            
            <div className="product-meta">
              <span className="price">€ {product.price.toFixed(2)}</span>
              <button 
                className="btn-primary" 
                onClick={() => {
                  addToCart({
                    id: product.id,
                    name: product.name,
                    price: product.price,
                    quantity: 1,
                    image: product.image,
                    color: product.color
                  });
                  onClose();
                }}
              >
                Adicionar ao Carrinho
              </button>
            </div>

            {/* Secção de Reviews */}
            <div className="reviews-section" style={{ marginTop: "40px", borderTop: "1px solid var(--glass-border)", paddingTop: "32px" }}>
              <h3 style={{ marginBottom: "20px" }}>Avaliações ({reviews.length})</h3>
              
              <div className="reviews-list" style={{ display: "flex", flexDirection: "column", gap: "20px", marginBottom: "32px", maxHeight: "300px", overflowY: "auto" }}>
                {reviews.length === 0 ? (
                  <p style={{ color: "var(--text-secondary)", fontStyle: "italic" }}>Ainda não há avaliações para este produto.</p>
                ) : (
                  reviews.map((r, i) => (
                    <div key={i} className="review-item" style={{ background: "rgba(255,255,255,0.03)", padding: "16px", borderRadius: "12px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                        <span style={{ fontWeight: "bold" }}>{r.userName}</span>
                        <span style={{ color: "var(--accent-gold)" }}>{"★".repeat(r.rating)}</span>
                      </div>
                      <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)" }}>{r.comment}</p>
                    </div>
                  ))
                )}
              </div>

              {user ? (
                <form onSubmit={handleSubmitReview} className="add-review-form">
                  <h4>Deixe a sua avaliação</h4>
                  <div style={{ margin: "12px 0" }}>
                    {[1,2,3,4,5].map(n => (
                      <button 
                        key={n} 
                        type="button"
                        onClick={() => setRating(n)}
                        style={{ background: "none", border: "none", color: rating >= n ? "var(--accent-gold)" : "#555", fontSize: "1.2rem", cursor: "pointer" }}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                  <textarea 
                    className="input-field" 
                    placeholder="O que achou deste produto?" 
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    style={{ minHeight: "80px", marginBottom: "12px" }}
                    required
                  />
                  <button type="submit" className="btn-primary outline" disabled={isSubmitting} style={{ width: "100%" }}>
                    {isSubmitting ? "A enviar..." : "Publicar Comentário"}
                  </button>
                </form>
              ) : (
                <div style={{ textAlign: "center", padding: "24px", background: "rgba(255,255,255,0.03)", borderRadius: "12px" }}>
                  <p style={{ marginBottom: "16px" }}>Inicie sessão para deixar uma avaliação.</p>
                  <Link href="/login" className="btn-secondary" style={{ display: "inline-block" }}>Entrar / Login</Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
