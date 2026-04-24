import React from "react";

export default function AdminDashboard() {
  return (
    <div className="dashboard-overview">
      <div className="stats-grid">
        <div className="stat-card glass-panel">
          <h3>Vendas Mensais</h3>
          <p className="stat-value">€ 4.250</p>
          <span className="stat-trend positive">+12% vs mês passado</span>
        </div>
        <div className="stat-card glass-panel">
          <h3>Encomendas Pendentes</h3>
          <p className="stat-value">14</p>
          <span className="stat-trend warning">Requerem atenção</span>
        </div>
        <div className="stat-card glass-panel">
          <h3>Produtos Ativos</h3>
          <p className="stat-value">28</p>
          <span className="stat-trend">Em stock</span>
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
              <td>#10045</td>
              <td>24 Abr 2026</td>
              <td>João M.</td>
              <td>€ 85.00</td>
              <td><span className="badge pago">Pago</span></td>
            </tr>
            <tr>
              <td>#10044</td>
              <td>23 Abr 2026</td>
              <td>Maria F.</td>
              <td>€ 120.50</td>
              <td><span className="badge pendente">A aguardar MBWay</span></td>
            </tr>
            <tr>
              <td>#10043</td>
              <td>22 Abr 2026</td>
              <td>Carlos S.</td>
              <td>€ 45.00</td>
              <td><span className="badge enviado">Enviado</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
