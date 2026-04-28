"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalSales: 0,
    lowStockCount: 0,
    pendingReviewsCount: 0,
    catalogCount: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch("/api/admin/stats");
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch (error) {
        console.error("Erro ao carregar estatísticas:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  return (
    <div className="dashboard-overview">
      <div className="stats-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px", marginBottom: "32px" }}>
        <div className="stat-card glass-panel" style={{ padding: "24px" }}>
          <h3 style={{ fontSize: "0.9rem", color: "var(--text-secondary)", marginBottom: "8px" }}>Vendas Totais</h3>
          <p className="stat-value" style={{ fontSize: "1.8rem", fontWeight: "bold", color: "var(--accent-green-light)" }}>
            € {stats.totalSales.toFixed(2)}
          </p>
          <span className="stat-trend" style={{ fontSize: "0.8rem" }}>{stats.totalOrders} encomendas pagas</span>
        </div>
        
        <div className="stat-card glass-panel" style={{ padding: "24px" }}>
          <h3 style={{ fontSize: "0.9rem", color: "var(--text-secondary)", marginBottom: "8px" }}>Stock Crítico</h3>
          <p className="stat-value" style={{ fontSize: "1.8rem", fontWeight: "bold", color: stats.lowStockCount > 0 ? "#ff6b6b" : "var(--text-primary)" }}>
            {stats.lowStockCount}
          </p>
          <span className="stat-trend" style={{ fontSize: "0.8rem" }}>Produtos abaixo de 3 un.</span>
        </div>

        <div className="stat-card glass-panel" style={{ padding: "24px" }}>
          <h3 style={{ fontSize: "0.9rem", color: "var(--text-secondary)", marginBottom: "8px" }}>Produtos Ativos</h3>
          <p className="stat-value" style={{ fontSize: "1.8rem", fontWeight: "bold" }}>
            {stats.catalogCount}
          </p>
          <span className="stat-trend" style={{ fontSize: "0.8rem" }}>No catálogo da loja</span>
        </div>

        <div className="stat-card glass-panel" style={{ padding: "24px" }}>
          <h3 style={{ fontSize: "0.9rem", color: "var(--text-secondary)", marginBottom: "8px" }}>Reviews Pendentes</h3>
          <p className="stat-value" style={{ fontSize: "1.8rem", fontWeight: "bold", color: stats.pendingReviewsCount > 0 ? "var(--accent-gold)" : "var(--text-primary)" }}>
            {stats.pendingReviewsCount}
          </p>
          <span className="stat-trend" style={{ fontSize: "0.8rem" }}>Aguardam moderação</span>
        </div>
      </div>
      
      <div className="recent-orders-section glass-panel" style={{ padding: "32px" }}>
        <h2 style={{ marginBottom: "24px" }}>Estado do Sistema</h2>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "40px" }}>
          <div>
            <h4 style={{ color: "var(--accent-gold)", marginBottom: "16px" }}>Checklist de Operação</h4>
            <ul style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: "12px" }}>
              <li style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <span style={{ color: "var(--accent-green-light)" }}>✅</span>
                <span>Stripe Payments (MBWay/Cards) ativo</span>
              </li>
              <li style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <span style={{ color: "var(--accent-green-light)" }}>✅</span>
                <span>Vila Bot Intelligence (Telegram) ativo</span>
              </li>
              <li style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <span style={{ color: "var(--accent-green-light)" }}>✅</span>
                <span>Sincronização Firestore OK</span>
              </li>
              <li style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <span style={{ color: stats.lowStockCount > 0 ? "var(--accent-gold)" : "var(--accent-green-light)" }}>
                  {stats.lowStockCount > 0 ? "⚠️" : "✅"}
                </span>
                <span>Inventário: {stats.lowStockCount > 0 ? "Reposição necessária" : "Níveis normais"}</span>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 style={{ color: "var(--accent-gold)", marginBottom: "16px" }}>Ações Rápidas</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <Link href="/admin/logistica" className="btn-secondary" style={{ textAlign: "center", padding: "12px" }}>
                Gerir Encomendas e Envios
              </Link>
              <Link href="/admin/produtos" className="btn-secondary" style={{ textAlign: "center", padding: "12px" }}>
                Atualizar Catálogo
              </Link>
              <Link href="/admin/comentarios" className="btn-secondary" style={{ textAlign: "center", padding: "12px" }}>
                Moderador de Reviews ({stats.pendingReviewsCount})
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
