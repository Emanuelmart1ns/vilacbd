"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import "./navbar.css";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function Navbar() {
  const { items, setIsCartOpen } = useCart();
  const { user, profile, loading } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [socials, setSocials] = useState<any>(null);
  const cartCount = items.reduce((acc, item) => acc + item.quantity, 0);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    
    fetch("/api/settings")
      .then(res => res.json())
      .then(data => {
        if (data.socials) setSocials(data.socials);
      })
      .catch(err => console.error("Erro ao carregar redes sociais:", err));

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Erro ao sair:", error);
    }
  };

  return (
    <nav className={`global-navbar ${scrolled ? "scrolled" : ""}`}>
      <div className="nav-container">
        <Link href="/" className="nav-logo">Vila CBD</Link>
        <div className="nav-links">
          <Link href="/">Início</Link>
          {user && <Link href="/loja">Loja</Link>}
          <Link href="/sobre">Sobre Nós</Link>
          <Link href="/legislacao">Legislação</Link>
        </div>
        <div className="nav-actions">
          {loading ? (
            <span className="nav-auth-loading">...</span>
          ) : (
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <button className="btn-icon" onClick={() => setIsCartOpen(true)}>
                🛒 ({cartCount})
              </button>

              <div className="navbar-socials" style={{ display: "flex", gap: "12px", alignItems: "center", margin: "0 8px" }}>
                <a href={socials?.instagram || undefined} {...(socials?.instagram ? { target: "_blank", rel: "noopener noreferrer" } : { onClick: (e: React.MouseEvent) => e.preventDefault() })} title="Instagram" style={{ opacity: socials?.instagram ? 1 : 0.3, cursor: socials?.instagram ? "pointer" : "default" }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path></svg>
                </a>
                <a href={socials?.facebook || undefined} {...(socials?.facebook ? { target: "_blank", rel: "noopener noreferrer" } : { onClick: (e: React.MouseEvent) => e.preventDefault() })} title="Facebook" style={{ opacity: socials?.facebook ? 1 : 0.3, cursor: socials?.facebook ? "pointer" : "default" }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
                </a>
                <a href={socials?.tiktok || undefined} {...(socials?.tiktok ? { target: "_blank", rel: "noopener noreferrer" } : { onClick: (e: React.MouseEvent) => e.preventDefault() })} title="TikTok" style={{ opacity: socials?.tiktok ? 1 : 0.3, cursor: socials?.tiktok ? "pointer" : "default" }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"></path></svg>
                </a>
                <button 
                  onClick={() => {
                    const event = new CustomEvent('openWhatsAppChat');
                    window.dispatchEvent(event);
                  }}
                  title="Abrir Chat de Suporte" 
                  className="btn-icon-social"
                  style={{ 
                    background: "none", 
                    border: "none", 
                    cursor: "pointer", 
                    padding: 0,
                    color: "inherit",
                    opacity: 1 
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 1 1-7.6-14 8.38 8.38 0 0 1 3.8.9L21 3z"></path></svg>
                </button>
              </div>

              {user ? (
                <div className="nav-user-menu" style={{ display: "flex", alignItems: "center" }}>
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
              ) : (
                <Link href="/login" className="btn-icon">Entrar</Link>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
