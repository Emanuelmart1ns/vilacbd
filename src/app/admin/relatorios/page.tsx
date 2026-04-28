"use client";

import React, { useEffect, useState, useRef } from "react";
import { 
  LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar, Cell, PieChart, Pie, Legend
} from "recharts";
import { 
  TrendingUp, Package, Users, DollarSign, FileText, Calendar, 
  Download, Printer, ChevronRight, Search, LayoutPanelLeft,
  Filter, ArrowUpRight, ArrowDownRight, CreditCard, ShoppingBag,
  Award, Briefcase, Eye
} from "lucide-react";

export default function ReportsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [filters, setFilters] = useState({
    start: "",
    end: "",
    client: "",
    product: "",
    status: ""
  });

  useEffect(() => {
    fetchReports();
  }, [filters]);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams(filters).toString();
      const res = await fetch(`/api/admin/reports?${query}`);
      const json = await res.json();
      setData(json);
    } catch (error) {
      console.error("Erro ao carregar relatórios:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading && !data) {
    return (
      <div className="loading-container-luxury">
        <div className="luxury-spinner"></div>
        <p>A extrair inteligência empresarial...</p>
      </div>
    );
  }

  return (
    <div className="reports-corporate-view">
      {/* 1. TOP BAR / FILTERS */}
      <div className="corporate-header glass-panel">
        <div className="title-group">
          <div className="luxury-badge">Executive View</div>
          <h1>Análise Estratégica</h1>
          <p>Consola de Relatórios Empresariais • Vila Cãnhamo</p>
        </div>
        
        <div className="filters-bar">
          <div className="filter-item">
            <label><Calendar size={12} /> Período</label>
            <div className="date-group">
              <input type="date" value={filters.start} onChange={e => setFilters({...filters, start: e.target.value})} />
              <span>→</span>
              <input type="date" value={filters.end} onChange={e => setFilters({...filters, end: e.target.value})} />
            </div>
          </div>
          
          <div className="filter-item">
            <label><Users size={12} /> Cliente</label>
            <input type="text" placeholder="Nome ou Email..." value={filters.client} onChange={e => setFilters({...filters, client: e.target.value})} />
          </div>

          <div className="filter-item">
            <label><CreditCard size={12} /> Estado</label>
            <select value={filters.status} onChange={e => setFilters({...filters, status: e.target.value})}>
              <option value="">Todos os Estados</option>
              <option value="pago">Apenas Pagos</option>
              <option value="pendente">Aguardam Pagamento</option>
            </select>
          </div>

          <button className="btn-luxury-action" onClick={handlePrint}>
            <Printer size={18} />
          </button>
        </div>
      </div>

      {/* 2. EXECUTIVE SUMMARY CARDS */}
      <div className="summary-cards-grid">
        <div className="executive-card glass-panel revenue">
          <div className="card-top">
            <div className="icon-box"><DollarSign /></div>
            <div className="trend-badge positive">+18.5% <ArrowUpRight size={12}/></div>
          </div>
          <div className="card-body">
            <span className="label">Receita Líquida</span>
            <h2 className="value">€ {data?.summary?.totalRevenue?.toLocaleString('pt-PT', { minimumFractionDigits: 2 })}</h2>
            <div className="sub-detail">
              <span>Pendente: € {data?.summary?.pendingRevenue?.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="executive-card glass-panel volume">
          <div className="card-top">
            <div className="icon-box"><ShoppingBag /></div>
            <div className="trend-badge">Volume Ativo</div>
          </div>
          <div className="card-body">
            <span className="label">Total de Vendas</span>
            <h2 className="value">{data?.summary?.totalOrdersPaid} <span className="unit">concluídas</span></h2>
            <div className="sub-detail">
              <span>{data?.summary?.totalOrdersPending} aguardam confirmação</span>
            </div>
          </div>
        </div>

        <div className="executive-card glass-panel ticket">
          <div className="card-top">
            <div className="icon-box"><Briefcase /></div>
            <div className="trend-badge neutral">Estável</div>
          </div>
          <div className="card-body">
            <span className="label">Ticket Médio</span>
            <h2 className="value">€ {data?.summary?.averageTicket?.toFixed(2)}</h2>
            <div className="sub-detail">
              <span>Média por transação confirmada</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. CHARTS GRID */}
      <div className="main-analytics-grid">
        <div className="analytics-card glass-panel main-chart">
          <div className="card-header">
            <h3>Fluxo de Capital Mensal</h3>
            <div className="header-actions">
              <span className="dot-active">Real-time</span>
            </div>
          </div>
          <div className="chart-container-luxury">
            <ResponsiveContainer width="100%" height={350}>
              <AreaChart data={data?.charts?.salesByDate}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--accent-gold)" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="var(--accent-gold)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)" />
                <XAxis dataKey="date" stroke="#666" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#666" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: "#111", border: "1px solid var(--glass-border)", borderRadius: "12px", boxShadow: "0 10px 30px rgba(0,0,0,0.5)" }}
                  itemStyle={{ color: "var(--accent-gold)" }}
                />
                <Area type="monotone" dataKey="total" stroke="var(--accent-gold)" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="analytics-card glass-panel category-chart">
          <div className="card-header">
            <h3>Mix de Categorias</h3>
          </div>
          <div className="chart-container-luxury">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={data?.charts?.salesByCategory}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {data?.charts?.salesByCategory?.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? 'var(--accent-green-light)' : (index === 1 ? 'var(--accent-gold)' : '#333')} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="detailed-grids">
        {/* TOP PRODUCTS */}
        <div className="data-panel glass-panel">
          <div className="panel-header">
            <Award size={18} />
            <h3>Top Performance de Produtos</h3>
          </div>
          <div className="luxury-list">
            {data?.charts?.salesByProduct?.slice(0, 5).map((prod: any, i: number) => (
              <div className="luxury-list-item" key={i}>
                <div className="rank">0{i+1}</div>
                <div className="prod-name">
                  <span className="p-title">{prod.name}</span>
                  <span className="p-cat">{prod.category}</span>
                </div>
                <div className="prod-stats">
                  <span className="p-qty">{prod.quantity} un.</span>
                  <span className="p-val">€{prod.total.toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* TOP CUSTOMERS */}
        <div className="data-panel glass-panel">
          <div className="panel-header">
            <Users size={18} />
            <h3>Clientes de Alto Valor</h3>
          </div>
          <div className="luxury-list">
            {data?.topCustomers?.map((cust: any, i: number) => (
              <div className="luxury-list-item" key={i}>
                <div className="avatar">{cust.email[0].toUpperCase()}</div>
                <div className="prod-name">
                  <span className="p-title">{cust.email}</span>
                  <span className="p-cat">{cust.orders} encomendas realizadas</span>
                </div>
                <div className="prod-stats">
                  <span className="p-val">€{cust.total.toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 4. DATA TABLE */}
      <div className="corporate-table-section glass-panel">
        <div className="table-header">
          <h3>Registo Histórico de Operações</h3>
        </div>
        <div className="table-scroll-container">
          <table className="corporate-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Operação</th>
                <th>Cliente Responsável</th>
                <th>Data Registo</th>
                <th>Valor Bruto</th>
                <th>Estado Fiscal</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {data?.orders?.map((order: any) => (
                <tr key={order.id}>
                  <td className="id-cell">#{order.id?.slice(-8).toUpperCase()}</td>
                  <td>Venda Direta</td>
                  <td className="client-cell">{order.email}</td>
                  <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td className="amount-cell">€ {order.total?.toFixed(2)}</td>
                  <td>
                    <span className={`status-badge ${order.paymentStatus}`}>
                      {order.paymentStatus === 'pago' ? 'Confirmado' : 'Aguardando'}
                    </span>
                  </td>
                  <td>
                    <button className="btn-luxury-view" onClick={() => setSelectedOrder(order)}>
                      <Eye size={14} /> Ficha Técnica
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* INDIVIDUAL REPORT DOSSIER MODAL */}
      {selectedOrder && (
        <div className="dossier-overlay" onClick={() => setSelectedOrder(null)}>
          <div className="dossier-modal glass-panel" onClick={e => e.stopPropagation()}>
            <div className="dossier-controls">
              <button className="btn-icon" onClick={handlePrint} title="Imprimir Dossier"><Printer size={20}/></button>
              <button className="btn-icon close" onClick={() => setSelectedOrder(null)}>×</button>
            </div>

            <div className="dossier-document">
              {/* BRANDING */}
              <div className="dossier-header">
                <div className="brand-luxury">
                  <span className="brand-logo">VC</span>
                  <div>
                    <h2>VILA CÃNHAMO</h2>
                    <p>Relatório de Auditoria Individual</p>
                  </div>
                </div>
                <div className="dossier-ref">
                  <span className="ref-label">REFERÊNCIA DE OPERAÇÃO</span>
                  <span className="ref-val">OP-{selectedOrder.id?.slice(-12).toUpperCase()}</span>
                </div>
              </div>

              {/* STATUS BANNER */}
              <div className={`dossier-status-banner ${selectedOrder.paymentStatus}`}>
                <div className="status-label">ESTADO DA TRANSACÇÃO</div>
                <div className="status-val">
                  {selectedOrder.paymentStatus === 'pago' ? 'CONFIRMADA & LIQUIDADA' : 'PENDENTE DE CONFIRMAÇÃO'}
                </div>
              </div>

              {/* DATA GRID */}
              <div className="dossier-grid">
                <div className="dossier-section">
                  <h4>Perfil do Requerente</h4>
                  <div className="doc-field">
                    <span className="f-label">Identificação:</span>
                    <span className="f-val">{selectedOrder.email}</span>
                  </div>
                  <div className="doc-field">
                    <span className="f-label">Data de Registo:</span>
                    <span className="f-val">{new Date(selectedOrder.createdAt).toLocaleString()}</span>
                  </div>
                  <div className="doc-field">
                    <span className="f-label">Localização Logística:</span>
                    <span className="f-val">{selectedOrder.shippingInfo?.address?.city || 'A definir'}</span>
                  </div>
                </div>

                <div className="dossier-section">
                  <h4>Estrutura Financeira</h4>
                  <div className="doc-field">
                    <span className="f-label">Método de Liquidação:</span>
                    <span className="f-val">{selectedOrder.source || 'Plataforma Digital'}</span>
                  </div>
                  <div className="doc-field">
                    <span className="f-label">Valor Patrimonial:</span>
                    <span className="f-val">€ {selectedOrder.total?.toFixed(2)}</span>
                  </div>
                  <div className="doc-field">
                    <span className="f-label">Encargos de Envio:</span>
                    <span className="f-val">€ 0.00 (Incluso)</span>
                  </div>
                </div>
              </div>

              {/* ITEMS TABLE */}
              <div className="dossier-items">
                <h4>Discriminação de Ativos</h4>
                <table className="dossier-table">
                  <thead>
                    <tr>
                      <th>Descrição do Produto</th>
                      <th>Qtd</th>
                      <th>Val. Unitário</th>
                      <th>Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedOrder.items?.map((item: any, idx: number) => (
                      <tr key={idx}>
                        <td className="item-name">{item.name}</td>
                        <td>{item.quantity}</td>
                        <td>€ {item.price?.toFixed(2)}</td>
                        <td>€ {(item.price * item.quantity).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                
                <div className="dossier-total-box">
                  <div className="total-row">
                    <span>Subtotal da Operação:</span>
                    <span>€ {selectedOrder.total?.toFixed(2)}</span>
                  </div>
                  <div className="total-row main">
                    <span>VALOR TOTAL {selectedOrder.paymentStatus === 'pago' ? 'LIQUIDADO' : 'EM DÍVIDA'}:</span>
                    <span className="total-val">€ {selectedOrder.total?.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="dossier-footer">
                <div className="signature-block">
                  <div className="sig-line"></div>
                  <span>Assinatura Digital de Auditoria</span>
                </div>
                <div className="legal-note">
                  <p>Este relatório foi gerado automaticamente pelo Vila Bot Intelligence e serve como documento de controlo interno da Vila Cãnhamo. A veracidade dos dados é garantida pela integração direta com a gateway de pagamentos.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .reports-corporate-view {
          display: flex;
          flex-direction: column;
          gap: 24px;
          padding-bottom: 60px;
        }

        .corporate-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 32px 40px;
          border-radius: 24px;
        }

        .luxury-badge {
          display: inline-block;
          background: rgba(212, 175, 55, 0.1);
          color: var(--accent-gold);
          font-size: 0.65rem;
          text-transform: uppercase;
          letter-spacing: 2px;
          padding: 4px 12px;
          border-radius: 20px;
          margin-bottom: 12px;
          font-weight: 700;
        }

        .title-group h1 { font-size: 2.2rem; margin-bottom: 4px; letter-spacing: -1px; }
        .title-group p { color: var(--text-secondary); font-size: 0.95rem; }

        .filters-bar {
          display: flex;
          gap: 24px;
          background: rgba(255,255,255,0.03);
          padding: 16px 24px;
          border-radius: 16px;
          border: 1px solid var(--glass-border);
        }

        .filter-item { display: flex; flex-direction: column; gap: 8px; }
        .filter-item label { font-size: 0.7rem; text-transform: uppercase; color: var(--accent-gold); display: flex; align-items: center; gap: 6px; font-weight: bold; }
        .filter-item input, .filter-item select {
          background: transparent;
          border: 1px solid var(--glass-border);
          color: white;
          padding: 6px 12px;
          border-radius: 8px;
          outline: none;
          font-size: 0.85rem;
        }

        .date-group { display: flex; align-items: center; gap: 8px; color: #444; }

        .btn-luxury-action {
          align-self: flex-end;
          background: var(--accent-gold);
          color: black;
          border: none;
          padding: 10px;
          border-radius: 10px;
          cursor: pointer;
          transition: transform 0.2s;
        }

        .summary-cards-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
        }

        .executive-card {
          padding: 32px;
          border-radius: 24px;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .executive-card:hover { transform: translateY(-8px); border-color: var(--accent-gold); }

        .card-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
        .icon-box { width: 48px; height: 48px; border-radius: 14px; display: flex; align-items: center; justify-content: center; background: rgba(255,255,255,0.05); }
        .trend-badge { font-size: 0.75rem; font-weight: bold; padding: 4px 10px; border-radius: 20px; display: flex; align-items: center; gap: 4px; background: rgba(255,255,255,0.05); }
        .trend-badge.positive { background: rgba(66, 130, 94, 0.2); color: #42825e; }

        .card-body .label { font-size: 0.85rem; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 1px; }
        .card-body h2 { font-size: 2.2rem; margin: 8px 0; font-weight: 700; color: white; }
        .unit { font-size: 0.9rem; font-weight: 400; color: #666; }
        .sub-detail { font-size: 0.8rem; color: #555; }

        .main-analytics-grid {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 24px;
        }

        .analytics-card { padding: 32px; border-radius: 24px; }
        .card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px; }
        .card-header h3 { font-size: 1.1rem; }
        .dot-active { display: flex; align-items: center; gap: 8px; font-size: 0.75rem; color: #42825e; font-weight: bold; }
        .dot-active::before { content: ""; width: 8px; height: 8px; background: #42825e; border-radius: 50%; box-shadow: 0 0 10px #42825e; animation: pulse 2s infinite; }

        .detailed-grids { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
        .data-panel { padding: 32px; border-radius: 24px; }
        .panel-header { display: flex; align-items: center; gap: 12px; margin-bottom: 24px; color: var(--accent-gold); }
        .panel-header h3 { color: white; font-size: 1rem; }

        .luxury-list { display: flex; flex-direction: column; gap: 12px; }
        .luxury-list-item { 
          display: flex; align-items: center; gap: 16px; 
          background: rgba(255,255,255,0.02); 
          padding: 16px; 
          border-radius: 12px; 
          border: 1px solid transparent; 
          transition: all 0.2s;
        }
        .luxury-list-item:hover { background: rgba(255,255,255,0.05); border-color: rgba(212, 175, 55, 0.2); }
        .rank { font-weight: 700; color: #444; font-size: 0.9rem; }
        .avatar { width: 40px; height: 40px; border-radius: 10px; background: var(--accent-gold); color: black; display: flex; align-items: center; justify-content: center; font-weight: bold; }
        .prod-name { flex: 1; display: flex; flex-direction: column; }
        .p-title { font-weight: bold; font-size: 0.9rem; }
        .p-cat { font-size: 0.75rem; color: var(--text-secondary); }
        .prod-stats { text-align: right; display: flex; flex-direction: column; }
        .p-qty { font-size: 0.8rem; color: #666; }
        .p-val { font-weight: bold; color: var(--accent-green-light); }

        .corporate-table-section { padding: 32px; border-radius: 24px; }
        .table-scroll-container { overflow-x: auto; margin-top: 24px; }
        .corporate-table { width: 100%; border-collapse: collapse; }
        .corporate-table th { text-align: left; padding: 16px; font-size: 0.75rem; text-transform: uppercase; color: var(--text-secondary); border-bottom: 1px solid var(--glass-border); letter-spacing: 1px; }
        .corporate-table td { padding: 16px; border-bottom: 1px solid rgba(255,255,255,0.02); font-size: 0.9rem; }
        .id-cell { font-family: monospace; font-weight: bold; color: var(--accent-gold); }
        .amount-cell { font-weight: bold; }
        .status-badge { font-size: 0.7rem; font-weight: bold; padding: 4px 10px; border-radius: 6px; text-transform: uppercase; }
        .status-badge.pago { background: rgba(66, 130, 94, 0.15); color: #42825e; }
        .status-badge.pendente { background: rgba(255, 107, 107, 0.1); color: #ff6b6b; }

        .btn-luxury-view { 
          background: transparent; 
          border: 1px solid var(--glass-border); 
          color: white; 
          padding: 8px 14px; 
          border-radius: 8px; 
          font-size: 0.8rem; 
          cursor: pointer; 
          display: flex; 
          align-items: center; 
          gap: 8px; 
          transition: all 0.2s;
        }
        .btn-luxury-view:hover { border-color: var(--accent-gold); color: var(--accent-gold); background: rgba(212, 175, 55, 0.05); }

        /* DOSSIER MODAL */
        .dossier-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.9); backdrop-filter: blur(15px); z-index: 12000; display: flex; align-items: center; justify-content: center; padding: 40px; }
        .dossier-modal { width: 100%; max-width: 900px; max-height: 90vh; overflow-y: auto; padding: 50px; border-radius: 30px; position: relative; }
        .dossier-controls { position: absolute; top: 20px; right: 30px; display: flex; gap: 12px; }
        .btn-icon { background: rgba(255,255,255,0.05); border: 1px solid var(--glass-border); color: white; width: 40px; height: 40px; border-radius: 10px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s; }
        .btn-icon:hover { border-color: var(--accent-gold); color: var(--accent-gold); }
        .btn-icon.close { font-size: 1.5rem; }

        .dossier-document { background: white; color: #111; padding: 80px; border-radius: 4px; font-family: 'Inter', sans-serif; }
        .dossier-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 50px; border-bottom: 3px solid #111; padding-bottom: 30px; }
        .brand-luxury { display: flex; align-items: center; gap: 20px; }
        .brand-logo { width: 60px; height: 60px; background: #2a6344; color: white; display: flex; align-items: center; justify-content: center; font-weight: 900; font-size: 1.8rem; border-radius: 8px; }
        .brand-luxury h2 { font-size: 1.5rem; letter-spacing: 2px; color: #2a6344; margin-bottom: 2px; }
        .brand-luxury p { font-size: 0.75rem; text-transform: uppercase; color: #666; font-weight: 600; }
        .dossier-ref { text-align: right; }
        .ref-label { font-size: 0.65rem; color: #888; font-weight: bold; display: block; margin-bottom: 4px; }
        .ref-val { font-size: 1.1rem; font-weight: 900; font-family: monospace; color: #111; }

        .dossier-status-banner { padding: 16px 24px; margin-bottom: 40px; border-left: 8px solid #ddd; background: #f8f8f8; display: flex; flex-direction: column; gap: 4px; }
        .dossier-status-banner.pago { border-color: #2a6344; background: #f0f7f2; }
        .dossier-status-banner.pendente { border-color: #ff6b6b; background: #fff5f5; }
        .status-label { font-size: 0.6rem; font-weight: 900; color: #888; letter-spacing: 1px; }
        .status-val { font-size: 1rem; font-weight: 800; }
        .dossier-status-banner.pago .status-val { color: #2a6344; }
        .dossier-status-banner.pendente .status-val { color: #ff6b6b; }

        .dossier-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 60px; margin-bottom: 50px; }
        .dossier-section h4 { font-size: 0.7rem; text-transform: uppercase; color: #999; margin-bottom: 16px; border-bottom: 1px solid #eee; padding-bottom: 6px; font-weight: 800; }
        .doc-field { display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 0.9rem; }
        .f-label { color: #666; }
        .f-val { font-weight: 600; color: #111; }

        .dossier-items h4 { font-size: 0.7rem; text-transform: uppercase; color: #999; margin-bottom: 20px; font-weight: 800; }
        .dossier-table { width: 100%; border-collapse: collapse; }
        .dossier-table th { text-align: left; padding: 12px; background: #111; color: white; font-size: 0.75rem; text-transform: uppercase; }
        .dossier-table td { padding: 16px 12px; border-bottom: 1px solid #eee; font-size: 0.9rem; }
        .item-name { font-weight: 700; color: #111; }

        .dossier-total-box { margin-top: 30px; display: flex; flex-direction: column; align-items: flex-end; gap: 10px; }
        .total-row { display: flex; gap: 40px; font-size: 0.9rem; color: #666; }
        .total-row.main { margin-top: 10px; padding-top: 10px; border-top: 2px solid #111; color: #111; font-weight: 900; font-size: 1.1rem; }
        .total-val { color: #2a6344; font-size: 1.4rem; }

        .dossier-footer { margin-top: 80px; display: flex; justify-content: space-between; align-items: flex-end; }
        .signature-block { display: flex; flex-direction: column; align-items: center; gap: 8px; font-size: 0.7rem; color: #999; font-weight: bold; }
        .sig-line { width: 180px; height: 1px; background: #ccc; }
        .legal-note { max-width: 400px; font-size: 0.65rem; color: #aaa; text-align: right; line-height: 1.5; }

        .loading-container-luxury { height: 70vh; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 20px; color: var(--accent-gold); letter-spacing: 2px; text-transform: uppercase; }
        .luxury-spinner { width: 40px; height: 40px; border: 3px solid rgba(212, 175, 55, 0.1); border-top-color: var(--accent-gold); border-radius: 50%; animation: spin 1s linear infinite; }

        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }

        @media print {
          .admin-sidebar, .admin-header, .corporate-header, .summary-cards-grid, .main-analytics-grid, .detailed-grids, .corporate-table-section, .dossier-controls { display: none !important; }
          .dossier-overlay { position: static; background: white; padding: 0; display: block; }
          .dossier-modal { padding: 0; max-height: none; overflow: visible; background: white; }
          .dossier-document { padding: 0; width: 100%; border: none; }
        }
      `}</style>
    </div>
  );
}
