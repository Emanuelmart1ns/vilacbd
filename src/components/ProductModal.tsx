"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Product } from "@/data/products";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { getReviews, FirestoreReview } from "@/lib/firebase";
import Link from "next/link";
import "./product-modal.css";

interface ProductModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function ProductModal({ product, isOpen, onClose }: ProductModalProps) {
  const { addToCart } = useCart();
  const { user, loading: authLoading } = useAuth();
  
  const [reviews, setReviews] = useState<FirestoreReview[]>([]);
  const [newComment, setNewComment] = useState("");
  const [rating, setRating] = useState(5);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  
  const allImages = product
    ? [product.image, ...(product.images || [])].filter(
        (img, index, self): img is string => !!img && self.indexOf(img) === index
      )
    : [];

  const prevProductId = React.useRef<string | undefined>(undefined);
  if (product?.id !== prevProductId.current) {
    prevProductId.current = product?.id;
    if (product) {
      setActiveIndex(0);
    }
  }

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

  const goToImage = useCallback((index: number) => {
    setActiveIndex((prev) => {
      if (allImages.length === 0) return prev;
      const next = ((index % allImages.length) + allImages.length) % allImages.length;
      return next;
    });
  }, [allImages.length]);

  const goNext = useCallback(() => {
    goToImage(activeIndex + 1);
  }, [activeIndex, goToImage]);

  const goPrev = useCallback(() => {
    goToImage(activeIndex - 1);
  }, [activeIndex, goToImage]);

  useEffect(() => {
    if (!isOpen || allImages.length <= 1) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") {
        e.preventDefault();
        goNext();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        goPrev();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, allImages.length, goNext, goPrev]);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || authLoading || !product) return;

    setIsSubmitting(true);
    try {
      const idToken = await user.getIdToken();
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.id,
          comment: newComment.trim(),
          rating,
          idToken,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "Erro ao enviar comentário.");
        return;
      }

      setNewComment("");
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
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleCloseClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClose();
  };

  const currentImg = allImages.length > 0 ? allImages[activeIndex] : null;

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
            {allImages.length > 0 ? (
              <div className="gallery-layout">
                {allImages.length > 1 && (
                  <div className="gallery-thumbs-vertical">
                    {allImages.map((img, i) => (
                      <button
                        key={i}
                        className={`thumb-vertical ${activeIndex === i ? 'active' : ''}`}
                        onClick={() => setActiveIndex(i)}
                        type="button"
                        aria-label={`Imagem ${i + 1} de ${allImages.length}`}
                      >
                        <div className="thumb-vertical-img" style={{ background: product.color || "#333", position: "relative", overflow: "hidden" }}>
                          <img 
                            src={img} 
                            alt="" 
                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                            onError={(e) => { (e.target as HTMLImageElement).style.opacity = "0"; }}
                          />
                        </div>
                      </button>
                    ))}
                  </div>
                )}
                <div className="gallery-main">
                  <div className="modal-main-img-wrapper">
                    <div className="modal-main-img" style={{ background: product.color || "#333", position: "relative", overflow: "hidden" }}>
                      {currentImg && (
                        <img 
                          src={currentImg} 
                          alt={product.name} 
                          style={{ width: "100%", height: "100%", objectFit: "contain" }} 
                          onError={(e) => { (e.target as HTMLImageElement).style.opacity = "0"; }}
                        />
                      )}
                    </div>

                    {allImages.length > 1 && (
                      <>
                        <button
                          className="gallery-arrow gallery-arrow-left"
                          onClick={(e) => { e.stopPropagation(); goPrev(); }}
                          aria-label="Imagem anterior"
                        >
                          ‹
                        </button>
                        <button
                          className="gallery-arrow gallery-arrow-right"
                          onClick={(e) => { e.stopPropagation(); goNext(); }}
                          aria-label="Próxima imagem"
                        >
                          ›
                        </button>
                        <div className="gallery-indicator">
                          {activeIndex + 1} / {allImages.length}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="gallery-no-images">
                <span className="gallery-no-images-icon">🖼</span>
                <span className="gallery-no-images-text">Sem imagens disponíveis</span>
              </div>
            )}
          </div>

          <div className="modal-details">
            <div style={{ 
              display: "flex", 
              justifyContent: "space-between", 
              alignItems: "flex-start",
              marginBottom: "20px",
              width: "100%"
            }}>
              <span className="product-category" style={{ margin: 0, fontSize: "0.8rem", letterSpacing: "2px" }}>
                {product.category}
              </span>
              <div style={{ textAlign: "right" }}>
                {product.reference && (
                  <span style={{ 
                    fontSize: "0.65rem", 
                    color: "#fff", 
                    opacity: 0.4,
                    letterSpacing: "1px",
                    fontFamily: "monospace",
                    display: "block",
                    marginBottom: "4px"
                  }}>
                    SKU: {product.reference}
                  </span>
                )}
                <div style={{ 
                  display: "flex", 
                  alignItems: "center", 
                  justifyContent: "flex-end",
                  gap: "6px"
                }}>
                  <div style={{ 
                    width: "6px", 
                    height: "6px", 
                    borderRadius: "50%", 
                    backgroundColor: (Number(product.stock) || 0) > 5 ? "#4caf50" : "#ff4d4d",
                    boxShadow: (Number(product.stock) || 0) > 5 ? "0 0 10px #4caf50" : "0 0 10px #ff4d4d"
                  }} />
                  <span style={{ 
                    fontSize: "0.75rem", 
                    color: (Number(product.stock) || 0) > 0 ? "var(--accent-gold)" : "#ff4d4d", 
                    fontWeight: "700",
                    letterSpacing: "0.5px",
                    textTransform: "uppercase"
                  }}>
                    {(Number(product.stock) || 0) > 0 ? `${product.stock} DISPONÍVEIS` : "ESGOTADO"}
                  </span>
                </div>
              </div>
            </div>
            <h2 className="product-title">{product.name}</h2>
            <p className="product-description">{product.description}</p>
            
            <div className="product-meta" style={{ display: "flex", alignItems: "center", gap: "32px", marginTop: "24px", marginBottom: "24px" }}>
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

              {user && !authLoading ? (
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
                    style={{ 
                      minHeight: "100px", 
                      marginBottom: "16px", 
                      width: "100%", 
                      display: "block",
                      boxSizing: "border-box" 
                    }}
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
