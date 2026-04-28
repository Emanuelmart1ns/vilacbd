"use client";

import React, { useEffect, useState } from "react";
import { 
  LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar, Cell, PieChart, Pie 
} from "recharts";
import { 
  TrendingUp, Package, Users, DollarSign, FileText, Calendar, 
  Download, Printer, ChevronRight, Search, LayoutPanelLeft 
} from "lucide-react";

export default function ReportsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [dateRange, setDateRange] = useState({ start: "", end: "" });

  useEffect(() => {
    fetchReports();
  }, [dateRange]);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams(dateRange).toString();
      const res = await fetch(`/api/admin/reports?${query}`);
      const json = await res.json();
      setData(json);
    } catch (error) {
      console.error("Erro ao carregar relatórios:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !data) {
    return <div className="loading-luxury">A carregar inteligência de negócio...</div>;
  }

  return (
    <div className="reports-luxury-container">
      {/* Header com Filtros */}
      <div className="reports-header glass-panel">
        <div className="header-titles">
          <h1>Business Intelligence</h1>
          <p>Relatórios Profissionais • Vila Cãnhamo</p>
        </div>
        <div className="header-filters">
          <div className="date-input-group">
            <Calendar size={16} />
            <input 
              type="date" 
              value={dateRange.start} 
              onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
            />
            <span>até</span>
            <input 
              type="date" 
              value={dateRange.end} 
              onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
            />
          </div>
          <button className="btn-primary" onClick={() => window.print()}>
            <Printer size={16} /> Exportar PDF
          </button>
        </div>
      </div>

      {/* Stats Principais */}
      <div className="reports-stats-grid">
        <div className="luxury-stat-card glass-panel">
          <div className="stat-icon revenue"><DollarSign /></div>
          <div className="stat-info">
            <h3>Receita Total</h3>
            <p className="value">€ {data?.totalRevenue?.toFixed(2)}</p>
            <span className="trend positive">+12% vs mês anterior</span>
          </div>
        </div>
        <div className="luxury-stat-card glass-panel">
          <div className="stat-icon orders"><Package /></div>
          <div className="stat-info">
            <h3>Encomendas Pagas</h3>
            <p className="value">{data?.totalOrdersPaid}</p>
            <span className="trend">Média de € {(data?.totalRevenue / data?.totalOrdersPaid || 0).toFixed(2)} por venda</span>
          </div>
        </div>
        <div className="luxury-stat-card glass-panel">
          <div className="stat-icon products"><TrendingUp /></div>
          <div className="stat-info">
            <h3>Top Produto</h3>
            <p className="value" style={{ fontSize: "1.1rem" }}>{data?.salesByProduct?.[0]?.name || "N/A"}</p>
            <span className="trend">{data?.salesByProduct?.[0]?.quantity || 0} unidades vendidas</span>
          </div>
        </div>
      </div>

      <div className="charts-main-grid">
        {/* Gráfico de Vendas por Data */}
        <div className="chart-container glass-panel">
          <div className="chart-header">
            <h3>Tendência de Vendas</h3>
            <div className="chart-actions">
              <span className="badge">Diário</span>
            </div>
          </div>
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={data?.salesByDate}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--accent-green-light)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="var(--accent-green-light)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="date" stroke="var(--text-secondary)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--text-secondary)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `€${val}`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: "#121812", border: "1px solid var(--glass-border)", borderRadius: "8px" }}
                  itemStyle={{ color: "var(--accent-green-light)" }}
                />
                <Area type="monotone" dataKey="total" stroke="var(--accent-green-light)" strokeWidth={3} fillOpacity={1} fill="url(#colorTotal)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gráfico de Performance de Produtos */}
        <div className="chart-container glass-panel">
          <div className="chart-header">
            <h3>Performance por Produto</h3>
          </div>
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data?.salesByProduct?.slice(0, 5)}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" stroke="var(--text-secondary)" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--text-secondary)" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: "#121812", border: "1px solid var(--glass-border)", borderRadius: "8px" }}
                />
                <Bar dataKey="total" fill="var(--accent-gold)" radius={[4, 4, 0, 0]}>
                  {data?.salesByProduct?.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? 'var(--accent-gold)' : 'rgba(207, 170, 107, 0.4)'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Lista de Encomendas para Relatórios Individuais */}
      <div className="individual-reports-section glass-panel">
        <div className="section-header">
          <h2>Relatórios Individuais</h2>
          <div className="search-bar">
            <Search size={18} />
            <input type="text" placeholder="Procurar por ID ou Cliente..." />
          </div>
        </div>
        
        <div className="luxury-table-wrapper">
          <table className="luxury-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Cliente</th>
                <th>Data</th>
                <th>Valor</th>
                <th>Método</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {data?.orders?.map((order: any) => (
                <tr key={order.id} onClick={() => setSelectedOrder(order)} className="clickable-row">
                  <td className="id-col">#{order.id?.slice(-6)}</td>
                  <td className="client-col">
                    <div className="client-info">
                      <span className="name">{order.email?.split("@")[0]}</span>
                      <span className="email">{order.email}</span>
                    </div>
                  </td>
                  <td>{order.createdAt?.split("T")[0]}</td>
                  <td className="amount-col">€ {order.total?.toFixed(2)}</td>
                  <td>
                    <span className="method-badge">{order.source || "Stripe"}</span>
                  </td>
                  <td>
                    <button className="btn-view-report" onClick={() => setSelectedOrder(order)}>
                      Ver Detalhes <ChevronRight size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Relatório de Venda Individual */}
      {selectedOrder && (
        <div className="report-modal-overlay" onClick={() => setSelectedOrder(null)}>
          <div className="report-modal glass-panel fade-in-up" onClick={e => e.stopPropagation()}>
            <button className="close-report" onClick={() => setSelectedOrder(null)}>×</button>
            
            <div className="report-doc">
              <div className="report-doc-header">
                <div className="brand">
                  <h2>Vila Cãnhamo</h2>
                  <p>Relatório de Transação Individual</p>
                </div>
                <div className="order-meta">
                  <span className="order-id">ID: #{selectedOrder.id}</span>
                  <span className="order-date">Emitido em: {new Date().toLocaleDateString()}</span>
                </div>
              </div>

              <div className="report-doc-grid">
                <div className="doc-section">
                  <h4>Informação do Comprador</h4>
                  <p><strong>Email:</strong> {selectedOrder.email}</p>
                  <p><strong>Status Pagamento:</strong> {selectedOrder.paymentStatus}</p>
                  <p><strong>Status Envio:</strong> {selectedOrder.shippingStatus}</p>
                </div>
                <div className="doc-section">
                  <h4>Detalhes de Pagamento</h4>
                  <p><strong>Método:</strong> {selectedOrder.source || "Stripe Checkout"}</p>
                  <p><strong>Transação ID:</strong> {selectedOrder.paymentId || "N/A"}</p>
                  <p><strong>Valor Total:</strong> € {selectedOrder.total?.toFixed(2)}</p>
                </div>
              </div>

              <div className="doc-items">
                <h4>Produtos Adquiridos</h4>
                <table className="items-table">
                  <thead>
                    <tr>
                      <th>Produto</th>
                      <th>Qtd</th>
                      <th>Preço Un.</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedOrder.items?.map((item: any, idx: number) => (
                      <tr key={idx}>
                        <td>{item.name}</td>
                        <td>{item.quantity}</td>
                        <td>€ {item.price?.toFixed(2)}</td>
                        <td>€ {(item.price * item.quantity).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colSpan={3}>Subtotal</td>
                      <td>€ {selectedOrder.total?.toFixed(2)}</td>
                    </tr>
                    <tr className="grand-total">
                      <td colSpan={3}>TOTAL PAGO</td>
                      <td>€ {selectedOrder.total?.toFixed(2)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              <div className="report-doc-footer">
                <p>Este documento serve como registo interno de operação logística.</p>
                <div className="signature-area">
                  <div className="sig-line"></div>
                  <span>Vila Bot Intelligence • Operação Automatizada</span>
                </div>
              </div>
            </div>

            <div className="modal-actions-bar">
              <button className="btn-secondary" onClick={() => window.print()}>
                <Download size={16} /> Baixar PDF
              </button>
              <button className="btn-primary" onClick={() => setSelectedOrder(null)}>
                Fechar Relatório
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .reports-luxury-container {
          display: flex;
          flex-direction: column;
          gap: 32px;
          animation: fadeIn 0.5s ease-out;
        }

        .reports-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 32px;
          border-radius: 20px;
        }

        .header-titles h1 {
          font-size: 2rem;
          margin-bottom: 4px;
        }

        .header-titles p {
          color: var(--text-secondary);
          font-size: 0.9rem;
        }

        .header-filters {
          display: flex;
          gap: 16px;
          align-items: center;
        }

        .date-input-group {
          background: rgba(255,255,255,0.05);
          border: 1px solid var(--glass-border);
          border-radius: 12px;
          padding: 8px 16px;
          display: flex;
          align-items: center;
          gap: 12px;
          color: var(--text-secondary);
        }

        .date-input-group input {
          background: transparent;
          border: none;
          color: var(--text-primary);
          font-family: inherit;
          outline: none;
        }

        .reports-stats-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
        }

        .luxury-stat-card {
          padding: 32px;
          border-radius: 20px;
          display: flex;
          align-items: center;
          gap: 24px;
          transition: transform 0.3s ease;
        }

        .luxury-stat-card:hover {
          transform: translateY(-5px);
        }

        .stat-icon {
          width: 56px;
          height: 56px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(212, 175, 55, 0.1);
          color: var(--accent-gold);
        }

        .stat-icon.revenue { background: rgba(66, 130, 94, 0.1); color: var(--accent-green-light); }
        .stat-icon.orders { background: rgba(212, 175, 55, 0.1); color: var(--accent-gold); }
        .stat-icon.products { background: rgba(255, 255, 255, 0.05); color: #fff; }

        .stat-info h3 {
          font-size: 0.85rem;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 8px;
        }

        .stat-info .value {
          font-size: 1.8rem;
          font-weight: 700;
          margin-bottom: 4px;
        }

        .trend {
          font-size: 0.75rem;
          color: var(--text-secondary);
        }

        .trend.positive { color: #42825e; }

        .charts-main-grid {
          display: grid;
          grid-template-columns: 1.6fr 1fr;
          gap: 24px;
        }

        .chart-container {
          padding: 32px;
          border-radius: 24px;
        }

        .chart-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 32px;
        }

        .chart-header h3 {
          font-size: 1.1rem;
          color: var(--text-primary);
        }

        .badge {
          background: rgba(212, 175, 55, 0.1);
          color: var(--accent-gold);
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 600;
        }

        .individual-reports-section {
          padding: 32px;
          border-radius: 24px;
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 32px;
        }

        .search-bar {
          display: flex;
          align-items: center;
          gap: 12px;
          background: rgba(255,255,255,0.05);
          border: 1px solid var(--glass-border);
          padding: 8px 16px;
          border-radius: 12px;
          width: 300px;
          color: var(--text-secondary);
        }

        .search-bar input {
          background: transparent;
          border: none;
          color: white;
          outline: none;
          width: 100%;
        }

        .luxury-table-wrapper {
          overflow-x: auto;
        }

        .luxury-table {
          width: 100%;
          border-collapse: separate;
          border-spacing: 0 12px;
        }

        .luxury-table th {
          text-align: left;
          padding: 12px 16px;
          color: var(--text-secondary);
          font-size: 0.8rem;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .luxury-table tr td {
          padding: 20px 16px;
          background: rgba(255,255,255,0.02);
          transition: all 0.2s;
        }

        .luxury-table tr td:first-child { border-radius: 12px 0 0 12px; }
        .luxury-table tr td:last-child { border-radius: 0 12px 12px 0; }

        .luxury-table tr:hover td {
          background: rgba(255,255,255,0.05);
          cursor: pointer;
        }

        .id-col { font-weight: bold; color: var(--accent-gold); }
        .client-info { display: flex; flex-direction: column; }
        .client-info .email { font-size: 0.75rem; color: var(--text-secondary); }
        .amount-col { font-weight: bold; }

        .method-badge {
          font-size: 0.75rem;
          padding: 4px 10px;
          background: rgba(255,255,255,0.05);
          border-radius: 6px;
          text-transform: capitalize;
        }

        .btn-view-report {
          background: transparent;
          border: 1px solid var(--glass-border);
          color: var(--text-primary);
          padding: 6px 12px;
          border-radius: 8px;
          font-size: 0.8rem;
          display: flex;
          align-items: center;
          gap: 6px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-view-report:hover {
          border-color: var(--accent-gold);
          color: var(--accent-gold);
        }

        /* Modal de Relatório Individual */
        .report-modal-overlay {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0,0,0,0.85);
          backdrop-filter: blur(10px);
          z-index: 11000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px;
        }

        .report-modal {
          width: 100%;
          max-width: 800px;
          max-height: 90vh;
          overflow-y: auto;
          position: relative;
          padding: 40px;
          border-radius: 30px;
        }

        .close-report {
          position: absolute;
          top: 20px; right: 20px;
          background: transparent;
          border: none;
          color: white;
          font-size: 2rem;
          cursor: pointer;
        }

        .report-doc {
          background: #fff;
          color: #111;
          padding: 60px;
          border-radius: 4px;
          box-shadow: 0 10px 40px rgba(0,0,0,0.5);
          font-family: 'Inter', sans-serif;
        }

        .report-doc-header {
          display: flex;
          justify-content: space-between;
          border-bottom: 2px solid #eee;
          padding-bottom: 20px;
          margin-bottom: 40px;
        }

        .report-doc-header h2 { color: #2a6344; margin-bottom: 4px; }
        .order-meta { text-align: right; font-size: 0.85rem; color: #666; display: flex; flex-direction: column; }

        .report-doc-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 40px;
          margin-bottom: 40px;
        }

        .doc-section h4 {
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: #888;
          margin-bottom: 12px;
          border-bottom: 1px solid #f0f0f0;
          padding-bottom: 4px;
        }

        .doc-section p { margin-bottom: 6px; font-size: 0.95rem; }

        .doc-items h4 { margin-bottom: 16px; font-size: 0.75rem; text-transform: uppercase; color: #888; }

        .items-table { width: 100%; border-collapse: collapse; }
        .items-table th { text-align: left; padding: 12px; background: #f9f9f9; font-size: 0.85rem; }
        .items-table td { padding: 12px; border-bottom: 1px solid #eee; font-size: 0.9rem; }

        .items-table tfoot td { padding-top: 20px; text-align: right; font-weight: bold; }
        .grand-total td { font-size: 1.2rem; color: #2a6344; border-top: 2px solid #eee; }

        .report-doc-footer {
          margin-top: 60px;
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          font-size: 0.8rem;
          color: #888;
        }

        .signature-area { text-align: center; }
        .sig-line { width: 200px; border-bottom: 1px solid #ccc; margin-bottom: 8px; }

        .modal-actions-bar {
          margin-top: 32px;
          display: flex;
          justify-content: center;
          gap: 16px;
        }

        .loading-luxury {
          height: 60vh;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: var(--font-heading);
          color: var(--accent-gold);
          letter-spacing: 2px;
          font-size: 1.2rem;
          text-transform: uppercase;
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0% { opacity: 0.5; }
          50% { opacity: 1; }
          100% { opacity: 0.5; }
        }

        @media print {
          .admin-sidebar, .admin-header, .reports-header, .modal-actions-bar, .individual-reports-section, .reports-stats-grid, .charts-main-grid {
            display: none !important;
          }
          .report-modal-overlay { background: white; padding: 0; position: absolute; }
          .report-modal { box-shadow: none; padding: 0; max-height: none; }
          .report-doc { box-shadow: none; border: none; padding: 0; width: 100%; }
        }
      `}</style>
    </div>
  );
}
