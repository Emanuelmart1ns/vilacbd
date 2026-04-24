import React from "react";

export default function AdminDashboard() {
  return (
    <div className="dashboard-overview">
      <div className="stats-grid">
        <div className="stat-card glass-panel">
          <h3>Vendas Mensais</h3>
          <p className="stat-value">€ 0.00</p>
          <span className="stat-trend">À espera da inauguração</span>
        </div>
        <div className="stat-card glass-panel">
          <h3>Encomendas Pendentes</h3>
          <p className="stat-value">0</p>
          <span className="stat-trend">Tudo em dia</span>
        </div>
        <div className="stat-card glass-panel">
          <h3>Lucro Estimado Atual</h3>
          <p className="stat-value">€ 0.00</p>
          <span className="stat-trend">(Preço de Venda - Custo)</span>
        </div>
      </div>
      
      <div className="recent-orders-section glass-panel">
        <h2>Atividade Recente (Fluxo de Caixa)</h2>
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID Encomenda</th>
              <th>Data</th>
              <th>Cliente</th>
              <th>Valor</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={5} style={{ textAlign: "center", padding: "32px", color: "var(--text-secondary)" }}>
                Ainda não existem transações. A tua loja está a ser preparada!
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
