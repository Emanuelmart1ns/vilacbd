"use client";

import React, { useEffect, useState } from "react";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar, Cell, PieChart, Pie, Legend
} from "recharts";
import { 
  TrendingUp, Package, Users, DollarSign, FileText, Calendar, 
  Download, Printer, ChevronRight, Search, LayoutPanelLeft,
  Filter, ArrowUpRight, ArrowDownRight, CreditCard, ShoppingBag,
  Award, Briefcase, Eye, BarChart3, PieChart as PieIcon, Settings2
} from "lucide-react";

type ReportType = 'finance' | 'logistics' | 'category' | 'customers' | 'overview';

export default function ReportsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [reportType, setReportType] = useState<ReportType>('overview');
  const [isGenerating, setIsGenerating] = useState(false);
  const [filters, setFilters] = useState({
    start: "",
    end: "",
    category: "all"
  });

  useEffect(() => {
    fetchData();
  }, [filters]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams(filters).toString();
      const res = await fetch(`/api/admin/reports?${query}`);
      const json = await res.json();
      setData(json);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateReport = () => {
    setIsGenerating(true);
    // Simular processamento de luxo
    setTimeout(() => {
      window.print();
      setIsGenerating(false);
    }, 1500);
  };

  if (loading && !data) {
    return (
      <div className="loading-luxury-master">
        <div className="pulse-logo">VC</div>
        <p>A sincronizar base de dados empresarial...</p>
      </div>
    );
  }

  return (
    <div className="corporate-reporting-center">
      {/* 1. CONFIGURATION PANEL (NON-PRINTABLE) */}
      <div className="config-panel glass-panel no-print">
        <div className="panel-info">
          <div className="luxury-badge-alt">Intelligence Center</div>
          <h1>Gerador de Relatórios Estratégicos</h1>
          <p>Selecione os parâmetros para a elaboração do dossier profissional.</p>
        </div>

        <div className="config-controls">
          {/* TIPO DE RELATÓRIO */}
          <div className="control-group">
            <label><BarChart3 size={14} /> Tipo de Relatório</label>
            <div className="radio-grid">
              {[
                { id: 'overview', label: 'Visão Geral' },
                { id: 'finance', label: 'Auditoria Financeira' },
                { id: 'logistics', label: 'Eficiência Logística' },
                { id: 'category', label: 'Performance por Categoria' },
                { id: 'customers', label: 'Análise de Clientes' }
              ].map(type => (
                <label key={type.id} className={`radio-item ${reportType === type.id ? 'active' : ''}`}>
                  <input 
                    type="radio" 
                    name="reportType" 
                    value={type.id} 
                    checked={reportType === type.id}
                    onChange={(e) => setReportType(e.target.value as ReportType)}
                  />
                  <span>{type.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="secondary-filters">
            <div className="filter-box">
              <label><Calendar size={14} /> Intervalo Temporal</label>
              <div className="input-row">
                <input type="date" value={filters.start} onChange={e => setFilters({...filters, start: e.target.value})} />
                <span>→</span>
                <input type="date" value={filters.end} onChange={e => setFilters({...filters, end: e.target.value})} />
              </div>
            </div>

            <div className="filter-box">
              <label><Settings2 size={14} /> Categoria de Produto</label>
              <select value={filters.category} onChange={e => setFilters({...filters, category: e.target.value})}>
                <option value="all">Todas as Categorias</option>
                {data?.categories?.map((cat: string) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <button className={`btn-generate ${isGenerating ? 'loading' : ''}`} onClick={handleGenerateReport} disabled={isGenerating}>
              {isGenerating ? "A Processar..." : <><Printer size={18} /> Elaborar Dossier</>}
            </button>
          </div>
        </div>
      </div>

      {/* 2. DYNAMIC REPORT CONTENT (PRINTABLE) */}
      <div className="printable-report-dossier">
        
        {/* REPORT COVER / HEADER */}
        <div className="dossier-header-corporate">
          <div className="branding-section">
            <div className="logo-square">VC</div>
            <div className="brand-text">
              <h2>VILA CÃNHAMO</h2>
              <p>Departamento de Business Intelligence • Auditoria 2026</p>
            </div>
          </div>
          <div className="report-meta-info">
            <div className="meta-item">
              <span className="m-label">DOCUMENTO:</span>
              <span className="m-val">{reportType.toUpperCase()} REPORT</span>
            </div>
            <div className="meta-item">
              <span className="m-label">EMISSÃO:</span>
              <span className="m-val">{new Date().toLocaleDateString()}</span>
            </div>
            <div className="meta-item">
              <span className="m-label">ID RELATÓRIO:</span>
              <span className="m-val">#{Math.random().toString(36).substr(2, 9).toUpperCase()}</span>
            </div>
          </div>
        </div>

        {/* SECTION: SUMMARY KPIs (Common to all) */}
        <div className="dossier-kpi-grid">
          <div className="kpi-card">
            <span className="k-label">Receita Confirmada</span>
            <h3 className="k-val">€ {data?.summary?.totalRevenue?.toLocaleString()}</h3>
          </div>
          <div className="kpi-card">
            <span className="k-label">Volume de Operações</span>
            <h3 className="k-val">{data?.summary?.totalOrdersPaid} <small>un.</small></h3>
          </div>
          <div className="kpi-card">
            <span className="k-label">Ticket Médio</span>
            <h3 className="k-val">€ {data?.summary?.averageTicket?.toFixed(2)}</h3>
          </div>
          <div className="kpi-card">
            <span className="k-label">Património Pendente</span>
            <h3 className="k-val" style={{ color: '#ff6b6b' }}>€ {data?.summary?.pendingRevenue?.toFixed(2)}</h3>
          </div>
        </div>

        {/* DYNAMIC CONTENT BASED ON TYPE */}
        {reportType === 'overview' && (
          <div className="report-section fade-in">
            <div className="section-title"><h3>Análise de Fluxo de Capital Diário</h3></div>
            <div className="report-chart-box">
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={data?.charts?.salesByDate}>
                  <defs>
                    <linearGradient id="printGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2a6344" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#2a6344" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                  <XAxis dataKey="date" fontSize={10} tickLine={false} />
                  <YAxis fontSize={10} tickLine={false} />
                  <Tooltip />
                  <Area type="monotone" dataKey="total" stroke="#2a6344" strokeWidth={2} fill="url(#printGradient)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="section-footer-note">A análise reflete o capital efetivamente liquidado via gateway de pagamento.</div>
          </div>
        )}

        {reportType === 'finance' && (
          <div className="report-section fade-in">
            <div className="section-title"><h3>Detalhamento de Liquidez e Pendências</h3></div>
            <div className="dossier-data-grid">
              <div className="data-column">
                <h4>Status de Liquidação</h4>
                <div className="data-row"><span>Transações Confirmadas</span> <strong>{data?.summary?.totalOrdersPaid}</strong></div>
                <div className="data-row"><span>Transações em Aberto</span> <strong>{data?.summary?.totalOrdersPending}</strong></div>
                <div className="data-row"><span>Rácio de Conversão</span> <strong>{((data?.summary?.totalOrdersPaid / (data?.summary?.totalOrdersPaid + data?.summary?.totalOrdersPending)) * 100).toFixed(1)}%</strong></div>
              </div>
              <div className="data-column">
                <h4>Valores Brutos</h4>
                <div className="data-row"><span>Total Liquidado</span> <strong>€ {data?.summary?.totalRevenue?.toFixed(2)}</strong></div>
                <div className="data-row"><span>Total em Espera</span> <strong style={{ color: '#ff6b6b' }}>€ {data?.summary?.pendingRevenue?.toFixed(2)}</strong></div>
                <div className="data-row"><span>Projeção Mensal</span> <strong>€ {(data?.summary?.totalRevenue + data?.summary?.pendingRevenue).toFixed(2)}</strong></div>
              </div>
            </div>
          </div>
        )}

        {reportType === 'logistics' && (
          <div className="report-section fade-in">
            <div className="section-title"><h3>Análise de Eficiência Logística</h3></div>
            <div className="report-chart-box">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data?.charts?.shippingStats}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                  <XAxis dataKey="name" fontSize={11} />
                  <YAxis fontSize={11} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#cfaa6b" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="section-footer-note">Distribuição de estados das encomendas no período selecionado.</div>
          </div>
        )}

        {reportType === 'category' && (
          <div className="report-section fade-in">
            <div className="section-title"><h3>Market Share por Categoria</h3></div>
            <div className="category-report-grid">
              <div className="chart-half">
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie data={data?.charts?.salesByCategory} innerRadius={50} outerRadius={70} dataKey="value">
                      {data?.charts?.salesByCategory?.map((e: any, i: number) => <Cell key={i} fill={i % 2 === 0 ? '#2a6344' : '#cfaa6b'} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="table-half">
                <table className="dossier-mini-table">
                  <thead><tr><th>Categoria</th><th>Receita</th></tr></thead>
                  <tbody>
                    {data?.charts?.salesByCategory?.map((cat: any) => (
                      <tr key={cat.name}><td>{cat.name}</td><td>€ {cat.value.toFixed(2)}</td></tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {reportType === 'customers' && (
          <div className="report-section fade-in">
            <div className="section-title"><h3>Análise de Fidelização de Clientes</h3></div>
            <table className="dossier-full-table">
              <thead>
                <tr>
                  <th>Identificação do Cliente</th>
                  <th>Freq. Venda</th>
                  <th>Valor Acumulado</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {data?.topCustomers?.map((cust: any) => (
                  <tr key={cust.email}>
                    <td>{cust.email}</td>
                    <td>{cust.orders} ord.</td>
                    <td>€ {cust.total.toFixed(2)}</td>
                    <td><span className="tag-vip">CLIENTE VIP</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* LIST OF TRANSACTIONS (Always present at the end) */}
        <div className="report-section no-break">
          <div className="section-title"><h3>Registo Detalhado de Operações</h3></div>
          <table className="dossier-full-table">
            <thead>
              <tr>
                <th>REF</th>
                <th>CLIENTE</th>
                <th>DATA</th>
                <th>VALOR BRUTO</th>
                <th>ESTADO</th>
              </tr>
            </thead>
            <tbody>
              {data?.orders?.slice(0, 20).map((order: any) => (
                <tr key={order.id}>
                  <td className="mono">#{order.id?.slice(-8).toUpperCase()}</td>
                  <td>{order.email}</td>
                  <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td className="bold">€ {order.total?.toFixed(2)}</td>
                  <td><span className={`status-text ${order.paymentStatus}`}>{order.paymentStatus.toUpperCase()}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="pagination-note">Exibindo as 20 transações mais recentes. Para lista completa, consulte a consola digital.</div>
        </div>

        {/* SIGNATURE & LEGAL */}
        <div className="dossier-footer-legal">
          <div className="signature-box">
            <div className="sig-placeholder"></div>
            <span>Responsável de Business Intelligence</span>
          </div>
          <div className="legal-disclaimer">
            Este relatório contém informações confidenciais de propriedade da Vila Cãnhamo. A reprodução não autorizada é estritamente proibida. Todos os dados foram auditados via sistemas automatizados Vila Bot.
          </div>
        </div>

      </div>

      <style jsx>{`
        .corporate-reporting-center {
          display: flex;
          flex-direction: column;
          gap: 40px;
          min-height: 100vh;
          padding-bottom: 80px;
        }

        /* CONFIG PANEL STYLE */
        .config-panel {
          padding: 40px;
          border-radius: 30px;
          display: flex;
          flex-direction: column;
          gap: 32px;
          animation: slideDown 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .luxury-badge-alt {
          display: inline-block;
          background: linear-gradient(135deg, var(--accent-gold), #dac496);
          color: black;
          font-size: 0.65rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 2px;
          padding: 5px 15px;
          border-radius: 20px;
          margin-bottom: 12px;
        }

        .panel-info h1 { font-size: 2.2rem; margin-bottom: 8px; letter-spacing: -1px; }
        .panel-info p { color: var(--text-secondary); font-size: 1rem; }

        .config-controls {
          display: grid;
          grid-template-columns: 1fr;
          gap: 32px;
          background: rgba(255,255,255,0.02);
          padding: 32px;
          border-radius: 20px;
          border: 1px solid var(--glass-border);
        }

        .control-group label {
          font-size: 0.75rem;
          text-transform: uppercase;
          color: var(--accent-gold);
          font-weight: 800;
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 16px;
        }

        .radio-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
          gap: 12px;
        }

        .radio-item {
          position: relative;
          background: rgba(255,255,255,0.03);
          border: 1px solid var(--glass-border);
          padding: 14px 20px;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .radio-item input { position: absolute; opacity: 0; }
        .radio-item span { font-size: 0.9rem; font-weight: 500; color: #999; transition: color 0.2s; }
        .radio-item.active { background: rgba(212, 175, 55, 0.1); border-color: var(--accent-gold); }
        .radio-item.active span { color: white; font-weight: 700; }

        .secondary-filters {
          display: flex;
          gap: 32px;
          align-items: flex-end;
          padding-top: 16px;
          border-top: 1px solid rgba(255,255,255,0.05);
        }

        .filter-box { display: flex; flex-direction: column; gap: 8px; }
        .filter-box label { font-size: 0.7rem; text-transform: uppercase; color: #666; font-weight: bold; display: flex; align-items: center; gap: 6px; }
        .input-row { display: flex; align-items: center; gap: 10px; }
        .input-row input, .filter-box select {
          background: rgba(255, 255, 255, 0.03) !important;
          border: 1px solid var(--glass-border) !important;
          color: white !important;
          padding: 10px 16px;
          border-radius: 10px;
          outline: none;
          font-size: 0.9rem;
          transition: all 0.2s;
          color-scheme: dark;
        }

        .filter-box select option {
          background-color: #121812;
          color: white;
        }

        .input-row input:focus, .filter-box select:focus {
          border-color: var(--accent-gold) !important;
          background: rgba(255, 255, 255, 0.08) !important;
          box-shadow: 0 0 0 2px rgba(207, 170, 107, 0.1);
        }

        .input-row input:hover, .filter-box select:hover {
          background: rgba(255, 255, 255, 0.05) !important;
          border-color: rgba(212, 175, 55, 0.3) !important;
        }

        .btn-generate {
          margin-left: auto;
          background: linear-gradient(135deg, var(--accent-green), var(--accent-green-light));
          color: white;
          border: none;
          padding: 14px 32px;
          border-radius: 12px;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 12px;
          cursor: pointer;
          transition: all 0.3s;
          box-shadow: 0 10px 20px rgba(42, 99, 68, 0.2);
        }

        .btn-generate:hover { transform: translateY(-3px); box-shadow: 0 15px 30px rgba(42, 99, 68, 0.4); }
        .btn-generate.loading { opacity: 0.7; cursor: wait; }

        /* PRINTABLE DOSSIER STYLE */
        .printable-report-dossier {
          background: white;
          color: #111;
          padding: 60px 80px;
          border-radius: 4px;
          min-height: 1000px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.5);
          display: none;
        }

        @media screen {
          .printable-report-dossier {
            display: block;
            max-width: 1000px;
            margin: 40px auto;
            background: rgba(255, 255, 255, 0.02);
            color: var(--text-primary);
            border: 1px solid var(--glass-border);
            border-radius: 24px;
            backdrop-filter: blur(10px);
          }
          .dossier-document { background: transparent !important; color: var(--text-primary) !important; padding: 40px !important; }
          .kpi-card { background: rgba(255,255,255,0.03) !important; color: white !important; border: 1px solid var(--glass-border) !important; }
          .dossier-kpi-grid { background: transparent !important; border: none !important; gap: 12px !important; }
          .k-val { color: var(--accent-gold) !important; }
          .section-title h3 { color: var(--accent-gold) !important; }
          .report-chart-box { background: rgba(255,255,255,0.02) !important; border-color: var(--glass-border) !important; }
          .data-column h4 { border-bottom-color: var(--glass-border) !important; color: var(--accent-gold) !important; }
          .data-row strong { color: white !important; }
          .dossier-full-table th { background: rgba(255,255,255,0.05) !important; color: var(--accent-gold) !important; }
          .dossier-full-table td { border-bottom-color: var(--glass-border) !important; color: var(--text-secondary) !important; }
          .bold { color: white !important; }
          .sig-placeholder { background: var(--glass-border) !important; }
          .brand-logo { background: var(--accent-green) !important; }
          .brand-text h2 { color: var(--accent-gold) !important; }
          .dossier-header-corporate { border-bottom-color: var(--glass-border) !important; }
          .dossier-mini-table th { background: rgba(255,255,255,0.05) !important; color: var(--accent-gold) !important; }
          .dossier-mini-table td { border-bottom-color: var(--glass-border) !important; color: white !important; }
          .status-text.pago { color: var(--accent-green-light) !important; }
        }

        .dossier-header-corporate {
          display: flex;
          justify-content: space-between;
          border-bottom: 4px solid #111;
          padding-bottom: 30px;
          margin-bottom: 40px;
        }

        .branding-section { display: flex; align-items: center; gap: 24px; }
        .logo-square { width: 70px; height: 70px; background: #2a6344; color: white; display: flex; align-items: center; justify-content: center; font-weight: 900; font-size: 2rem; border-radius: 4px; }
        .brand-text h2 { font-size: 1.8rem; letter-spacing: 2px; color: #2a6344; margin-bottom: 2px; }
        .brand-text p { font-size: 0.75rem; font-weight: 700; color: #999; text-transform: uppercase; }

        .report-meta-info { text-align: right; display: flex; flex-direction: column; gap: 6px; }
        .meta-item { display: flex; justify-content: flex-end; gap: 12px; font-size: 0.75rem; }
        .m-label { color: #999; font-weight: 800; }
        .m-val { font-weight: 900; color: #111; }

        .dossier-kpi-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 2px;
          background: #111;
          border: 2px solid #111;
          margin-bottom: 60px;
        }

        .kpi-card { background: white; padding: 24px; text-align: center; }
        .k-label { font-size: 0.65rem; text-transform: uppercase; font-weight: 800; color: #999; display: block; margin-bottom: 8px; }
        .k-val { font-size: 1.5rem; font-weight: 900; color: #111; }
        .k-val small { font-size: 0.8rem; font-weight: 400; color: #666; }

        .report-section { margin-bottom: 60px; }
        .section-title { border-bottom: 2px solid #f0f0f0; margin-bottom: 30px; padding-bottom: 10px; }
        .section-title h3 { font-size: 0.9rem; text-transform: uppercase; letter-spacing: 1px; color: #555; }

        .report-chart-box { background: rgba(255, 255, 255, 0.01); padding: 30px; border: 1px solid var(--glass-border); border-radius: 12px; }
        .section-footer-note { margin-top: 15px; font-size: 0.75rem; font-style: italic; color: #aaa; text-align: right; }

        .dossier-data-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 60px; }
        .data-column h4 { font-size: 0.75rem; color: #999; margin-bottom: 20px; border-bottom: 1px solid #eee; padding-bottom: 8px; }
        .data-row { display: flex; justify-content: space-between; margin-bottom: 12px; font-size: 0.95rem; }
        .data-row span { color: #555; }
        .data-row strong { font-weight: 800; color: #111; }

        .category-report-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; align-items: center; }
        .dossier-mini-table { width: 100%; border-collapse: collapse; }
        .dossier-mini-table th { text-align: left; background: #f9f9f9; padding: 12px; font-size: 0.75rem; }
        .dossier-mini-table td { padding: 12px; border-bottom: 1px solid #eee; font-size: 0.9rem; font-weight: 600; }

        .dossier-full-table { width: 100%; border-collapse: collapse; }
        .dossier-full-table th { background: #111; color: white; text-align: left; padding: 14px; font-size: 0.7rem; text-transform: uppercase; }
        .dossier-full-table td { padding: 14px; border-bottom: 1px solid #eee; font-size: 0.85rem; }
        .mono { font-family: monospace; font-weight: bold; }
        .bold { font-weight: 900; }
        .status-text.pago { color: #2a6344; font-weight: bold; }
        .status-text.pendente { color: #ff6b6b; font-weight: bold; }
        .tag-vip { background: #cfaa6b; color: black; font-size: 0.65rem; font-weight: 900; padding: 4px 8px; border-radius: 4px; }

        .dossier-footer-legal { margin-top: 100px; display: flex; justify-content: space-between; align-items: flex-end; }
        .signature-box { display: flex; flex-direction: column; align-items: center; gap: 10px; font-size: 0.7rem; color: #999; font-weight: bold; }
        .sig-placeholder { width: 220px; height: 1px; background: #ccc; }
        .legal-disclaimer { max-width: 450px; font-size: 0.65rem; color: #bbb; line-height: 1.6; text-align: right; }

        .loading-luxury-master { height: 70vh; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 30px; }
        .pulse-logo { width: 80px; height: 80px; background: #2a6344; border-radius: 20px; display: flex; align-items: center; justify-content: center; color: white; font-weight: 900; font-size: 2rem; animation: pulseLogo 2s infinite; }

        @keyframes pulseLogo { 0%, 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(42, 99, 68, 0.4); } 50% { transform: scale(1.05); box-shadow: 0 0 40px 10px rgba(42, 99, 68, 0.2); } }
        @keyframes slideDown { from { opacity: 0; transform: translateY(-40px); } to { opacity: 1; transform: translateY(0); } }
        .fade-in { animation: fadeIn 0.8s ease-out; }

        @media print {
          .no-print { display: none !important; }
          .admin-sidebar, .admin-header { display: none !important; }
          .corporate-reporting-center { padding: 0; gap: 0; background: white; }
          .printable-report-dossier { display: block; border-radius: 0; box-shadow: none; padding: 0; width: 100%; max-width: none; margin: 0; }
          .report-section { page-break-inside: avoid; }
          .no-break { page-break-inside: avoid; }
        }
      `}</style>
    </div>
  );
}
