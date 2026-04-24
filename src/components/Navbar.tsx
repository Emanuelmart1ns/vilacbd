import React from "react";
import Link from "next/link";
import "./navbar.css";

export default function Navbar() {
  return (
    <nav className="global-navbar">
      <div className="nav-container">
        <Link href="/" className="nav-logo">Vila CBD</Link>
        <div className="nav-links">
          <Link href="/">Início</Link>
          <Link href="/loja">Loja Completa</Link>
          <Link href="#sobre">Sobre Nós</Link>
        </div>
        <div className="nav-actions">
          <button className="btn-icon">🛒 Carrinho (0)</button>
        </div>
      </div>
    </nav>
  );
}
