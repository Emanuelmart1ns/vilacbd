"use client";

import React from "react";
import Link from "next/link";
import "./navbar.css";
import { useCart } from "@/context/CartContext";

export default function Navbar() {
  const { items, setIsCartOpen } = useCart();
  const cartCount = items.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <nav className="global-navbar">
      <div className="nav-container">
        <Link href="/" className="nav-logo">Vila Cãnhamo</Link>
        <div className="nav-links">
          <Link href="/">Início</Link>
          <Link href="/loja">Loja Completa</Link>
          <Link href="/sobre">Sobre Nós</Link>
        </div>
        <div className="nav-actions">
          <button className="btn-icon" onClick={() => setIsCartOpen(true)}>
            🛒 Carrinho ({cartCount})
          </button>
        </div>
      </div>
    </nav>
  );
}
