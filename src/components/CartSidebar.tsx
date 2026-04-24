"use client";

import React from "react";
import { useCart } from "@/context/CartContext";
import "./cart.css";

export default function CartSidebar() {
  const { items, isCartOpen, setIsCartOpen, removeFromCart, updateQuantity, cartTotal } = useCart();

  if (!isCartOpen) return null;

  return (
    <div className="cart-overlay">
      <div className="cart-backdrop" onClick={() => setIsCartOpen(false)}></div>
      <div className="cart-drawer fade-in-right">
        <div className="cart-header">
          <h2>O seu Carrinho</h2>
          <button className="btn-close" onClick={() => setIsCartOpen(false)}>×</button>
        </div>

        <div className="cart-items">
          {items.length === 0 ? (
            <p className="empty-cart">O seu carrinho está vazio.</p>
          ) : (
            items.map((item) => (
              <div key={item.id} className="cart-item">
                <div className="cart-item-img" style={{ background: item.color || "#333", backgroundImage: item.image ? `url(${item.image})` : 'none', backgroundSize: 'cover' }}>
                </div>
                <div className="cart-item-details">
                  <h4>{item.name}</h4>
                  <div className="cart-item-actions">
                    <div className="qty-controls">
                      <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>-</button>
                      <span>{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
                    </div>
                    <span className="cart-item-price">€ {(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                  <button className="btn-remove" onClick={() => removeFromCart(item.id)}>Remover</button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="cart-footer">
          <div className="cart-total-row">
            <span>Total:</span>
            <span className="cart-total-price">€ {cartTotal.toFixed(2)}</span>
          </div>
          <button className="btn-primary btn-checkout" disabled={items.length === 0}>
            Finalizar Compra
          </button>
        </div>
      </div>
    </div>
  );
}
