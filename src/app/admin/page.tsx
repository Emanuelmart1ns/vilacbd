import React from "react";
import Link from "next/link";

export default function AdminDashboard() {
  return (
    <div className="dashboard-overview">
      <div className="stats-grid">
        <div className="stat-card glass-panel">
          <h3>Estado da Loja</h3>
          <p className="stat-value" style={{ fontSize: "1.5rem" }}>Pré-lançamento</p>
          <span className="stat-trend">A preparar para inauguração</span>
        </div>
        <div className="stat-card glass-panel">
          <h3>Produtos no Catálogo</h3>
          <p className="stat-value" style={{ fontSize: "1.5rem" }}>32</p>
          <span className="stat-trend">5 categorias disponíveis</span>
        </div>
        <div className="stat-card glass-panel">
          <h3>Próximos Passos</h3>
          <p className="stat-value" style={{ fontSize: "1.2rem" }}>Configurar Pagamentos</p>
          <span className="stat-trend">Stripe / MBWay / Multibanco</span>
        </div>
      </div>
      
      <div className="recent-orders-section glass-panel">
        <h2>Checklist de Lançamento</h2>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", padding: "24px 0" }}>
          <div>
            <h4 style={{ color: "var(--accent-gold)", marginBottom: "16px" }}>Configuração</h4>
            <ul style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: "12px" }}>
              <li style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ color: "var(--accent-green-light)" }}>✅</span>
                <span>Catálogo de produtos criado</span>
              </li>
              <li style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ color: "var(--accent-green-light)" }}>✅</span>
                <span>Painel administrativo funcional</span>
              </li>
              <li style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ color: "var(--accent-gold)" }}>⏳</span>
                <span>Configurar gateway de pagamentos</span>
              </li>
              <li style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ color: "var(--accent-gold)" }}>⏳</span>
                <span>Configurar Firebase Firestore</span>
              </li>
            </ul>
          </div>
          <div>
            <h4 style={{ color: "var(--accent-gold)", marginBottom: "16px" }}>Links Rápidos</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <Link href="/admin/produtos" className="btn-secondary" style={{ textAlign: "center" }}>Gerir Produtos</Link>
              <Link href="/admin/configuracoes" className="btn-secondary" style={{ textAlign: "center" }}>Configurações</Link>
              <Link href="/loja" className="btn-secondary" style={{ textAlign: "center" }}>Ver Loja Pública</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
