"use client";

import React, { useState } from "react";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";

export default function ConfiguracoesPage() {
  const router = useRouter();
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/login");
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="configuracoes-page">
      <header className="page-header">
        <h2>Definições da Loja</h2>
      </header>

      <div className="settings-grid" style={{ display: "grid", gap: "24px", gridTemplateColumns: "1fr 1fr" }}>
        {/* Identidade Visual */}
        <div className="glass-panel" style={{ padding: "24px" }}>
          <h3 style={{ color: "var(--accent-gold)", marginBottom: "16px" }}>Identidade Visual</h3>
          <div className="form-group" style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", marginBottom: "8px" }}>Logótipo da Loja</label>
            <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
              <div 
                style={{ 
                  width: "80px", height: "80px", borderRadius: "8px", 
                  background: "var(--bg-primary)", border: "1px dashed var(--glass-border)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  overflow: "hidden"
                }}
              >
                {logoPreview ? (
                  <img src={logoPreview} alt="Logo Preview" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                ) : (
                  <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>Sem Logo</span>
                )}
              </div>
              <input type="file" accept="image/*" onChange={handleLogoUpload} style={{ color: "var(--text-secondary)" }} />
            </div>
          </div>
          
          <div className="form-group" style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", marginBottom: "8px" }}>Nome da Loja</label>
            <input type="text" className="input-field" defaultValue="Vila CBD" />
          </div>

          <button className="btn-primary">Guardar Identidade</button>
        </div>

        {/* Pagamentos */}
        <div className="glass-panel" style={{ padding: "24px" }}>
          <h3 style={{ color: "var(--accent-gold)", marginBottom: "16px" }}>Integração de Pagamentos</h3>
          
          <div className="form-group" style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", marginBottom: "8px" }}>Stripe Public Key</label>
            <input type="text" className="input-field" defaultValue="pk_test_*************************" />
          </div>
          
          <div className="form-group" style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", marginBottom: "8px" }}>Stripe Secret Key</label>
            <input type="password" className="input-field" defaultValue="sk_test_*************************" />
          </div>

          <div className="form-group" style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", marginBottom: "8px" }}>Chave MBWay (EuPago / IfThenPay)</label>
            <input type="text" className="input-field" placeholder="Opcional se usar Stripe" />
          </div>

          <button className="btn-primary">Guardar Pagamentos</button>
        </div>

        {/* Gestão de Utilizadores */}
        <div className="glass-panel" style={{ padding: "24px", gridColumn: "1 / -1" }}>
          <h3 style={{ color: "var(--accent-gold)", marginBottom: "16px" }}>Gestão de Utilizadores</h3>
          <p style={{ color: "var(--text-secondary)", marginBottom: "24px" }}>Crie e gira as contas de acesso ao painel administrativo.</p>
          
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
            <div className="user-list">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Email</th>
                    <th>Cargo</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>{auth.currentUser?.email || "admin@vilacbd.com"}</td>
                    <td>Administrador</td>
                    <td>-</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="add-user-form" style={{ borderLeft: "1px solid var(--glass-border)", paddingLeft: "24px" }}>
              <h4>Novo Utilizador</h4>
              <div className="form-group" style={{ marginTop: "16px" }}>
                <label>Email do novo utilizador</label>
                <input type="email" className="input-field" placeholder="ex: colega@vilacbd.com" />
              </div>
              <button className="btn-primary" style={{ marginTop: "16px" }}>Convidar / Criar</button>
            </div>
          </div>
        </div>

        {/* Conta de Admin */}
        <div className="glass-panel" style={{ padding: "24px", gridColumn: "1 / -1" }}>
          <h3 style={{ color: "#ff6b6b", marginBottom: "16px" }}>Sessão e Segurança</h3>
          <p style={{ color: "var(--text-secondary)", marginBottom: "16px" }}>Estás autenticado como Administrador.</p>
          <button className="btn-action outline" onClick={handleLogout} style={{ borderColor: "#ff6b6b", color: "#ff6b6b" }}>
            Terminar Sessão Segura
          </button>
        </div>
      </div>
    </div>
  );
}
