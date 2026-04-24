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
              <td>#10045</td>
              <td>24 Abr 2026</td>
              <td>João M. (Porto)</td>
              <td>€ 85.00</td>
              <td><span className="badge pago">Confirmado (MBWay)</span></td>
              <td><input type="text" placeholder="Ex: CTT12345" className="input-field" /></td>
              <td>
                <button className="btn-action">Marcar Envio</button>
              </td>
            </tr>
            <tr>
              <td>#10044</td>
              <td>23 Abr 2026</td>
              <td>Maria F. (Lisboa)</td>
              <td>€ 120.50</td>
              <td><span className="badge pendente">A aguardar</span></td>
              <td>-</td>
              <td>
                <button className="btn-action outline">Aprovar Pagamento</button>
              </td>
            </tr>
            <tr>
              <td>#10043</td>
              <td>22 Abr 2026</td>
              <td>Carlos S. (Faro)</td>
              <td>€ 45.00</td>
              <td><span className="badge pago">Confirmado (Cartão)</span></td>
              <td>CTT998877PT</td>
              <td>
                <button className="btn-action done">Concluir Entrega</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
