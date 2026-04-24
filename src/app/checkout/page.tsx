"use client";

import React, { useState } from "react";
import Navbar from "@/components/Navbar";
import { useCart } from "@/context/CartContext";
import Link from "next/link";

export default function CheckoutPage() {
  const { items, cartTotal } = useCart();
  const [formData, setFormData] = useState({
    email: "",
    nome: "",
    morada: "",
    cidade: "",
    codigoPostal: "",
    telemovel: ""
  });

  if (items.length === 0) {
    return (
      <main style={{ minHeight: "100vh", backgroundColor: "var(--bg-primary)", paddingTop: "120px" }}>
        <Navbar />
        <div className="container" style={{ textAlign: "center" }}>
          <h2>O seu carrinho está vazio</h2>
          <p style={{ margin: "20px 0" }}>Adicione produtos para finalizar a compra.</p>
          <Link href="/loja" className="btn-primary">Ir para a Loja</Link>
        </div>
      </main>
    );
  }

  return (
    <main style={{ minHeight: "100vh", backgroundColor: "var(--bg-primary)", paddingTop: "120px", paddingBottom: "80px" }}>
      <Navbar />
      <div className="container">
        <h1 style={{ marginBottom: "40px", fontSize: "2.5rem" }}>Finalizar Compra</h1>
        
        <div style={{ display: "grid", gridTemplateColumns: "1fr 400px", gap: "40px" }}>
          {/* Formulário de Envio */}
          <div className="glass-panel" style={{ padding: "32px" }}>
            <h3 style={{ marginBottom: "24px", color: "var(--accent-gold)" }}>Informações de Envio</h3>
            <form style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div className="form-group">
                <label>Email</label>
                <input type="email" className="input-field" placeholder="exemplo@email.com" required />
              </div>
              <div className="form-group">
                <label>Nome Completo</label>
                <input type="text" className="input-field" placeholder="O seu nome" required />
              </div>
              <div className="form-group">
                <label>Morada</label>
                <input type="text" className="input-field" placeholder="Rua, Número, Andar" required />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div className="form-group">
                  <label>Cidade</label>
                  <input type="text" className="input-field" placeholder="Cidade" required />
                </div>
                <div className="form-group">
                  <label>Código Postal</label>
                  <input type="text" className="input-field" placeholder="0000-000" required />
                </div>
              </div>
              <div className="form-group">
                <label>Telemóvel (para entrega)</label>
                <input type="tel" className="input-field" placeholder="9xxxxxxxx" required />
              </div>
            </form>

            <h3 style={{ margin: "32px 0 24px 0", color: "var(--accent-gold)" }}>Método de Pagamento</h3>
            <div style={{ display: "flex", gap: "16px" }}>
              <button className="btn-primary outline" style={{ flex: 1, padding: "12px", borderColor: "var(--accent-gold)", color: "var(--accent-gold)" }}>
                MBWay
              </button>
              <button className="btn-primary outline" style={{ flex: 1, padding: "12px" }}>
                Cartão de Crédito
              </button>
              <button className="btn-primary outline" style={{ flex: 1, padding: "12px" }}>
                Multibanco
              </button>
            </div>
          </div>

          {/* Resumo do Pedido */}
          <div className="glass-panel" style={{ padding: "32px", height: "fit-content" }}>
            <h3 style={{ marginBottom: "24px" }}>Resumo</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginBottom: "24px" }}>
              {items.map(item => (
                <div key={item.id} style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--text-secondary)" }}>{item.quantity}x {item.name}</span>
                  <span>€ {(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div style={{ borderTop: "1px solid var(--glass-border)", paddingTop: "16px", display: "flex", justifyContent: "space-between", fontWeight: "bold", fontSize: "1.2rem" }}>
              <span>Total</span>
              <span style={{ color: "var(--accent-green-light)" }}>€ {cartTotal.toFixed(2)}</span>
            </div>
            <button className="btn-primary" style={{ width: "100%", marginTop: "32px", padding: "16px" }}>
              Confirmar e Pagar
            </button>
            <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", textAlign: "center", marginTop: "16px" }}>
              Pagamento seguro garantido pela Vila Cãnhamo.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
