"use client";

import React from "react";
import Link from "next/link";
import "./navbar.css";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function Navbar() {
  const { items, setIsCartOpen } = useCart();
  const { user, profile, loading } = useAuth();
  const cartCount = items.reduce((acc, item) => acc + item.quantity, 0);

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Erro ao sair:", error);
    }
  };

  return (
    <nav className="global-navbar">
      <div className="nav-container">
        <Link href="/" className="nav-logo">Vila Cãnhamo</Link>
        <div className="nav-links">
          <Link href="/">Início</Link>
          {user && <Link href="/loja">Loja</Link>}
          <Link href="/sobre">Sobre Nós</Link>
        </div>
        <div className="nav-actions">
          {loading ? (
            <span className="nav-auth-loading">...</span>
          ) : user ? (
            <div className="nav-user">
              <button className="btn-icon" onClick={() => setIsCartOpen(true)}>
                🛒 ({cartCount})
              </button>
              <div className="nav-user-menu">
                <span className="nav-user-name">{profile?.displayName || user.email?.split('@')[0]}</span>
                <div className="nav-user-avatar">
                  {user.photoURL ? (
                    <img src={user.photoURL} alt="" />
                  ) : (
                    <span>{(user.displayName || user.email || "U")[0].toUpperCase()}</span>
                  )}
                </div>
                <div className="nav-user-dropdown">
                  {profile?.role === "admin" && (
                    <Link href="/admin" className="nav-dropdown-item">Painel Admin</Link>
                  )}
                  <button onClick={handleLogout} className="nav-dropdown-item nav-logout">Sair</button>
                </div>
              </div>
            </div>
          ) : (
            <Link href="/login" className="btn-icon">Entrar</Link>
          )}
        </div>
      </div>
    </nav>
  );
}
