import React from "react";

export default function LogisticaPage() {
  return (
    <div className="logistica-page">
      <header className="page-header">
        <h2>Gestão de Logística e Encomendas</h2>
        <div className="filters">
          <button className="btn-secondary active">Todas</button>
          <button className="btn-secondary">Pendentes</button>
          <button className="btn-secondary">Pagas</button>
          <button className="btn-secondary">Enviadas</button>
        </div>
      </header>

      <div className="glass-panel" style={{ marginTop: "24px" }}>
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID Encomenda</th>
              <th>Data</th>
              <th>Cliente</th>
              <th>Total</th>
              <th>Estado de Pagamento</th>
              <th>Rastreamento CTT</th>
              <th>Ação Logística</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={7} style={{ textAlign: "center", padding: "32px", color: "var(--text-secondary)" }}>
                Ainda não existem encomendas. A tua equipa de expedição está pronta para inaugurar!
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
