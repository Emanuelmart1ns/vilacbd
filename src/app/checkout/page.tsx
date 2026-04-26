"use client";

import React, { useState } from "react";
import Navbar from "@/components/Navbar";
import { useCart } from "@/context/CartContext";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export default function CheckoutPage() {
  const { items, cartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    nome: "",
    morada: "",
    cidade: "",
    codigoPostal: "",
    telemovel: ""
  });
  const [paymentMethod, setPaymentMethod] = useState<"mbway" | "cartao" | "multibanco">("mbway");
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleConfirmPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      const idToken = user ? await user.getIdToken() : null;
      
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idToken,
          items,
          total: cartTotal,
          shippingInfo: {
            firstName: formData.nome.split(' ')[0],
            lastName: formData.nome.split(' ').slice(1).join(' '),
            address: formData.morada,
            city: formData.cidade,
            postalCode: formData.codigoPostal,
            phone: formData.telemovel,
            email: formData.email
          },
          paymentMethod
        })
      });

      if (res.ok) {
        setOrderPlaced(true);
        clearCart();
      } else {
        alert("Erro ao processar a encomenda. Por favor, tente novamente.");
      }
    } catch (error) {
      console.error("Erro no checkout:", error);
      alert("Erro de ligação.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (orderPlaced) {
    return (
      <main style={{ minHeight: "100vh", backgroundColor: "var(--bg-primary)", paddingTop: "120px" }}>
        <Navbar />
        <div className="container" style={{ textAlign: "center" }}>
          <h2 style={{ color: "var(--accent-green-light)", marginBottom: "16px" }}>Encomenda Confirmada!</h2>
          <p style={{ margin: "20px 0", color: "var(--text-secondary)" }}>Receberá um email de confirmação em breve.</p>
          <Link href="/loja" className="btn-primary">Continuar a Comprar</Link>
        </div>
      </main>
    );
  }

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
        
        <form onSubmit={handleConfirmPayment}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 400px", gap: "40px" }}>
            {/* Formulário de Envio */}
            <div className="glass-panel" style={{ padding: "32px" }}>
              <h3 style={{ marginBottom: "24px", color: "var(--accent-gold)" }}>Informações de Envio</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div className="form-group">
                  <label>Email</label>
                  <input type="email" name="email" className="input-field" placeholder="exemplo@email.com" value={formData.email} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label>Nome Completo</label>
                  <input type="text" name="nome" className="input-field" placeholder="O seu nome" value={formData.nome} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label>Morada</label>
                  <input type="text" name="morada" className="input-field" placeholder="Rua, Número, Andar" value={formData.morada} onChange={handleChange} required />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  <div className="form-group">
                    <label>Cidade</label>
                    <input type="text" name="cidade" className="input-field" placeholder="Cidade" value={formData.cidade} onChange={handleChange} required />
                  </div>
                  <div className="form-group">
                    <label>Código Postal</label>
                    <input type="text" name="codigoPostal" className="input-field" placeholder="0000-000" value={formData.codigoPostal} onChange={handleChange} required />
                  </div>
                </div>
                <div className="form-group">
                  <label>Telemóvel (para entrega)</label>
                  <input type="tel" name="telemovel" className="input-field" placeholder="9xxxxxxxx" value={formData.telemovel} onChange={handleChange} required />
                </div>
              </div>

              <h3 style={{ margin: "32px 0 24px 0", color: "var(--accent-gold)" }}>Método de Pagamento</h3>
              <div style={{ display: "flex", gap: "16px" }}>
                <button type="button" className="btn-primary outline" style={{ flex: 1, padding: "12px", borderColor: paymentMethod === "mbway" ? "var(--accent-gold)" : "var(--glass-border)", color: paymentMethod === "mbway" ? "var(--accent-gold)" : "var(--text-secondary)" }} onClick={() => setPaymentMethod("mbway")}>
                  MBWay
                </button>
                <button type="button" className="btn-primary outline" style={{ flex: 1, padding: "12px", borderColor: paymentMethod === "cartao" ? "var(--accent-gold)" : "var(--glass-border)", color: paymentMethod === "cartao" ? "var(--accent-gold)" : "var(--text-secondary)" }} onClick={() => setPaymentMethod("cartao")}>
                  Cartão
                </button>
                <button type="button" className="btn-primary outline" style={{ flex: 1, padding: "12px", borderColor: paymentMethod === "multibanco" ? "var(--accent-gold)" : "var(--glass-border)", color: paymentMethod === "multibanco" ? "var(--accent-gold)" : "var(--text-secondary)" }} onClick={() => setPaymentMethod("multibanco")}>
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
              <button type="submit" className="btn-primary" style={{ width: "100%", marginTop: "32px", padding: "16px" }} disabled={isProcessing}>
                {isProcessing ? "A processar..." : "Confirmar e Pagar"}
              </button>
              <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", textAlign: "center", marginTop: "16px" }}>
                Pagamento seguro garantido pela Vila CBD.
              </p>
            </div>
          </div>
        </form>
      </div>
    </main>
  );
}
