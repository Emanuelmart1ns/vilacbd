"use client";

import React from "react";
import { Product } from "@/data/products";
import { useCart } from "@/context/CartContext";
import "./product-modal.css";

interface ProductModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function ProductModal({ product, isOpen, onClose }: ProductModalProps) {
  const { addToCart } = useCart();

  if (!isOpen || !product) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-backdrop" onClick={onClose}></div>
      <div className="modal-content fade-in-up">
        <button className="modal-close" onClick={onClose}>&times;</button>
        
        <div className="modal-grid">
          {/* Galeria de Imagens Simples */}
          <div className="modal-gallery">
            <div 
              className="modal-main-img"
              style={{
                background: product.color || "#333",
                backgroundImage: product.image ? `url(${product.image})` : "none",
                backgroundSize: "cover",
                backgroundPosition: "center"
              }}
            >
              {!product.image && <span style={{ color: "rgba(255,255,255,0.5)", fontSize: "1.5rem" }}>Vila CBD</span>}
            </div>
          </div>

          {/* Detalhes do Produto */}
          <div className="modal-details">
            <span className="modal-category">{product.category}</span>
            <h2 className="modal-title">{product.name}</h2>
            <div className="modal-price">€ {product.price.toFixed(2)}</div>
            
            <div className="modal-description">
              <p>{product.description}</p>
              <ul style={{ marginTop: "16px", paddingLeft: "20px", color: "var(--text-secondary)" }}>
                <li>Extração Full Spectrum e testado em laboratório.</li>
                <li>Garantia de qualidade Premium.</li>
                <li>{product.stock > 0 ? `Em Stock: ${product.stock} unidades` : "Esgotado"}</li>
              </ul>
            </div>

            <div className="modal-actions">
              <button 
                className="btn-primary" 
                style={{ width: "100%", padding: "16px", fontSize: "1.1rem" }}
                disabled={product.stock <= 0}
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
                {product.stock > 0 ? "Adicionar ao Carrinho" : "Esgotado"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
