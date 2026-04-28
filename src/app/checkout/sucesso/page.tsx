"use client";

import React, { useEffect } from "react";
import Navbar from "@/components/Navbar";
import { useCart } from "@/context/CartContext";
import Link from "next/link";

export default function SuccessPage() {
  const { clearCart } = useCart();

  useEffect(() => {
    // Limpar o carrinho ao chegar aqui com sucesso
    clearCart();
    localStorage.removeItem("pending_order_info");
  }, []);

  return (
    <main style={{ minHeight: "100vh", backgroundColor: "var(--bg-primary)", paddingTop: "120px" }}>
      <Navbar />
      <div className="container" style={{ textAlign: "center", maxWidth: "600px" }}>
        <div className="glass-panel" style={{ padding: "60px 40px", borderRadius: "32px", border: "1px solid var(--accent-gold)" }}>
          <div style={{ fontSize: "5rem", marginBottom: "24px" }}>🎉</div>
          <h1 style={{ color: "var(--accent-gold)", marginBottom: "16px", fontSize: "2.5rem" }}>Pagamento Confirmado!</h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "1.1rem", lineHeight: "1.6", marginBottom: "40px" }}>
            Obrigado por escolher a <strong>Vila Cãnhamo</strong>. A sua encomenda foi processada com sucesso e a nossa equipa já foi notificada.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <Link href="/loja" className="btn-primary" style={{ padding: "16px" }}>Continuar a Comprar</Link>
            <Link href="/" style={{ color: "var(--text-secondary)", textDecoration: "none", fontSize: "0.9rem" }}>Voltar ao Início</Link>
          </div>
        </div>
      </div>
    </main>
  );
}
