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
  Award, Briefcase, Eye, BarChart3, PieChart as PieIcon, Settings2, ShieldCheck
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
    setTimeout(() => {
      window.print();
      setIsGenerating(false);
    }, 1500);
  };

  if (loading && !data) {
    return (
      <div className="loading-luxury-master">
        <div className="pulse-logo">VC</div>
        <p>A sincronizar inteligência corporativa...</p>
      </div>
    );
  }

  const getReportTitle = () => {
    switch(reportType) {
      case 'finance': return "Relatório de Auditoria Financeira & Liquidez";
      case 'logistics': return "Relatório de Eficiência Logística & Distribuição";
      case 'category': return "Análise de Market Share por Categoria";
      case 'customers': return "Relatório de Fidelização & Inteligência de Cliente";
      default: return "Relatório de Visão Geral Executiva";
    }
  };

  return (
    <div className="corporate-reporting-center">
      {/* 1. CONFIGURATION PANEL (NON-PRINTABLE) */}
      <div className="config-panel glass-panel no-print">
        <div className="panel-info">
          <div className="luxury-badge-alt">Executive intelligence</div>
          <h1>Centro de Comando Analítico</h1>
          <p>Configure os parâmetros para gerar dossiers empresariais de alta fidelidade.</p>
        </div>

        <div className="config-controls">
          <div className="control-group">
            <label><BarChart3 size={14} /> Seleção do Dossier</label>
            <div className="radio-grid">
              {[
                { id: 'overview', label: 'Visão Geral' },
                { id: 'finance', label: 'Auditoria Financeira' },
                { id: 'logistics', label: 'Eficiência Logística' },
                { id: 'category', label: 'Market Share' },
                { id: 'customers', label: 'Inteligência de Cliente' }
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
              <label><Calendar size={14} /> Ciclo Temporal</label>
              <div className="input-row">
                <input type="date" value={filters.start} onChange={e => setFilters({...filters, start: e.target.value})} />
                <span>→</span>
                <input type="date" value={filters.end} onChange={e => setFilters({...filters, end: e.target.value})} />
              </div>
            </div>

            <div className="filter-box">
              <label><Settings2 size={14} /> Segmentação</label>
              <select value={filters.category} onChange={e => setFilters({...filters, category: e.target.value})}>
                <option value="all">Todas as Categorias</option>
                {data?.categories?.map((cat: string) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <button className={`btn-generate ${isGenerating ? 'loading' : ''}`} onClick={handleGenerateReport} disabled={isGenerating}>
              {isGenerating ? "A Processar..." : <><Printer size={18} /> Exportar PDF Profissional</>}
            </button>
          </div>
        </div>
      </div>

      {/* 2. DYNAMIC REPORT CONTENT (SCREEN + PRINT) */}
      <div className="printable-report-dossier">
        <div className="dossier-document">
          
          {/* HEADER */}
          <div className="dossier-header-corporate">
            <div className="branding-section">
              <div className="logo-square">VC</div>
              <div className="brand-text">
                <h2>VILA CÃNHAMO</h2>
                <p>DEPARTAMENTO DE BUSINESS INTELLIGENCE • AUDITORIA 2026</p>
              </div>
            </div>
            <div className="report-meta-info">
              <div className="meta-item"><span className="m-label">DOCUMENTO:</span> <span className="m-val">{reportType.toUpperCase()} REPORT</span></div>
              <div className="meta-item"><span className="m-label">EMISSÃO:</span> <span className="m-val">{new Date().toLocaleDateString()}</span></div>
              <div className="meta-item"><span className="m-label">ID RELATÓRIO:</span> <span className="m-val">#VC-{Math.random().toString(36).substr(2, 6).toUpperCase()}</span></div>
            </div>
          </div>

          <div className="dossier-title-hero">
            <h1>{getReportTitle()}</h1>
            <div className="dossier-divider"></div>
          </div>

          {/* SUMMARY KPIs */}
          <div className="dossier-kpi-grid">
            <div className="kpi-card">
              <span className="k-label">Receita Liquidada</span>
              <h3 className="k-val">€ {data?.summary?.totalRevenue?.toLocaleString()}</h3>
            </div>
            <div className="kpi-card">
              <span className="k-label">Volume Transacional</span>
              <h3 className="k-val">{data?.summary?.totalOrdersPaid} <small>un.</small></h3>
            </div>
            <div className="kpi-card">
              <span className="k-label">Ticket Médio de Venda</span>
              <h3 className="k-val">€ {data?.summary?.averageTicket?.toFixed(2)}</h3>
            </div>
            <div className="kpi-card">
              <span className="k-label">Capital em Pendência</span>
              <h3 className="k-val highlight">€ {data?.summary?.pendingRevenue?.toFixed(2)}</h3>
            </div>
          </div>

          {/* DYNAMIC SECTIONS */}
          {reportType === 'overview' && (
            <div className="report-section fade-in">
              <div className="section-title"><h3><AreaChart size={16} /> Evolução de Capital no Período</h3></div>
              <div className="report-chart-box">
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={data?.charts?.salesByDate}>
                    <defs>
                      <linearGradient id="printGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2a6344" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#2a6344" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ddd" />
                    <XAxis dataKey="date" fontSize={10} tickLine={false} />
                    <YAxis fontSize={10} tickLine={false} />
                    <Tooltip />
                    <Area type="monotone" dataKey="total" stroke="#2a6344" strokeWidth={3} fill="url(#printGradient)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {reportType === 'logistics' && (
            <div className="report-section fade-in">
              <div className="section-title"><h3><Package size={16} /> Fluxo de Operações Logísticas</h3></div>
              <div className="report-chart-box">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={data?.charts?.shippingStats}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ddd" />
                    <XAxis dataKey="name" fontSize={11} />
                    <YAxis fontSize={11} />
                    <Tooltip />
                    <Bar dataKey="value" fill="#cfaa6b" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {reportType === 'category' && (
            <div className="report-section fade-in">
              <div className="section-title"><h3><PieIcon size={16} /> Distribuição de Receita por Categoria</h3></div>
              <div className="category-report-grid">
                <div className="chart-half">
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie data={data?.charts?.salesByCategory} innerRadius={60} outerRadius={80} dataKey="value">
                        {data?.charts?.salesByCategory?.map((e: any, i: number) => <Cell key={i} fill={i % 2 === 0 ? '#2a6344' : '#cfaa6b'} />)}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="table-half">
                  <table className="dossier-mini-table">
                    <thead><tr><th>Categoria</th><th>Receita Bruta</th></tr></thead>
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
              <div className="section-title"><h3><Award size={16} /> Matriz de Clientes VIP & Fidelização</h3></div>
              <table className="dossier-full-table">
                <thead>
                  <tr>
                    <th>CLIENTE</th>
                    <th>FREQUÊNCIA</th>
                    <th>VALOR ACUMULADO</th>
                    <th>CRITÉRIO</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.topCustomers?.map((cust: any) => (
                    <tr key={cust.email}>
                      <td>{cust.email}</td>
                      <td>{cust.orders} Operações</td>
                      <td>€ {cust.total.toFixed(2)}</td>
                      <td><span className="tag-vip">VIP ESTRATÉGICO</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* OPERATIONS LOG */}
          <div className="report-section no-break">
            <div className="section-title"><h3><ShieldCheck size={16} /> Registo Detalhado de Operações Auditadas</h3></div>
            <table className="dossier-full-table">
              <thead>
                <tr>
                  <th>REF</th>
                  <th>IDENTIFICAÇÃO</th>
                  <th>DATA</th>
                  <th>TOTAL</th>
                  <th>STATUS FISCAL</th>
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
            <div className="pagination-note">Documento limitado às 20 transações mais recentes do período. Consulte a base digital para histórico completo.</div>
          </div>

          {/* FOOTER */}
          <div className="dossier-footer-legal">
            <div className="signature-section">
              <div className="signature-box">
                <div className="sig-placeholder"></div>
                <span>Responsável de Business Intelligence</span>
              </div>
              <div className="signature-box">
                <div className="sig-placeholder"></div>
                <span>Direção Executiva • Vila Cãnhamo</span>
              </div>
            </div>
            <div className="legal-disclaimer">
              Este documento constitui um relatório oficial de auditoria interna. Os dados aqui contidos são confidenciais e protegidos por protocolos de segurança Vila Cãnhamo. Gerado via VC Intelligence Core 2.0.
            </div>
          </div>

        </div>
      </div>

      <style jsx>{`
        .corporate-reporting-center { display: flex; flex-direction: column; gap: 40px; min-height: 100vh; padding-bottom: 80px; }

        /* CONFIG PANEL */
        .config-panel { padding: 40px; border-radius: 30px; display: flex; flex-direction: column; gap: 32px; animation: slideDown 0.6s cubic-bezier(0.16, 1, 0.3, 1); }
        .luxury-badge-alt { display: inline-block; background: linear-gradient(135deg, var(--accent-gold), #dac496); color: black; font-size: 0.65rem; font-weight: 800; text-transform: uppercase; letter-spacing: 2px; padding: 5px 15px; border-radius: 20px; margin-bottom: 12px; }
        .panel-info h1 { font-size: 2.2rem; margin-bottom: 8px; letter-spacing: -1px; }
        .panel-info p { color: var(--text-secondary); font-size: 1rem; }

        .config-controls { display: grid; grid-template-columns: 1fr; gap: 32px; background: rgba(255,255,255,0.02); padding: 32px; border-radius: 20px; border: 1px solid var(--glass-border); }
        .control-group label { font-size: 0.75rem; text-transform: uppercase; color: var(--accent-gold); font-weight: 800; display: flex; align-items: center; gap: 8px; margin-bottom: 16px; }
        .radio-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 12px; }
        .radio-item { position: relative; background: rgba(255,255,255,0.03); border: 1px solid var(--glass-border); padding: 14px 20px; border-radius: 12px; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; gap: 12px; }
        .radio-item input { position: absolute; opacity: 0; }
        .radio-item span { font-size: 0.9rem; font-weight: 500; color: #999; transition: color 0.2s; }
        .radio-item.active { background: rgba(212, 175, 55, 0.1); border-color: var(--accent-gold); }
        .radio-item.active span { color: white; font-weight: 700; }

        .secondary-filters { display: flex; gap: 32px; align-items: flex-end; padding-top: 16px; border-top: 1px solid rgba(255,255,255,0.05); }
        .filter-box { display: flex; flex-direction: column; gap: 8px; }
        .filter-box label { font-size: 0.7rem; text-transform: uppercase; color: #666; font-weight: bold; display: flex; align-items: center; gap: 6px; }
        .input-row { display: flex; align-items: center; gap: 10px; }
        .input-row input, .filter-box select { background: rgba(255, 255, 255, 0.03) !important; border: 1px solid var(--glass-border) !important; color: white !important; padding: 10px 16px; border-radius: 10px; outline: none; font-size: 0.9rem; transition: all 0.2s; color-scheme: dark; }
        .filter-box select option { background-color: #121812; color: white; }

        .btn-generate { margin-left: auto; background: linear-gradient(135deg, var(--accent-green), var(--accent-green-light)); color: white; border: none; padding: 14px 32px; border-radius: 12px; font-weight: 700; display: flex; align-items: center; gap: 12px; cursor: pointer; transition: all 0.3s; box-shadow: 0 10px 20px rgba(42, 99, 68, 0.2); }
        .btn-generate:hover { transform: translateY(-3px); box-shadow: 0 15px 30px rgba(42, 99, 68, 0.4); }

        /* DOSSIER STYLE */
        .printable-report-dossier { margin: 40px auto; max-width: 1100px; width: 100%; }
        .dossier-document { background: rgba(255,255,255,0.02); color: var(--text-primary); padding: 60px 80px; border: 1px solid var(--glass-border); border-radius: 32px; backdrop-filter: blur(10px); }

        .dossier-header-corporate { display: flex; justify-content: space-between; border-bottom: 1px solid var(--glass-border); padding-bottom: 30px; margin-bottom: 40px; }
        .branding-section { display: flex; align-items: center; gap: 24px; }
        .logo-square { width: 70px; height: 70px; background: var(--accent-green); color: white; display: flex; align-items: center; justify-content: center; font-weight: 900; font-size: 2rem; border-radius: 12px; }
        .brand-text h2 { font-size: 1.8rem; letter-spacing: 2px; color: var(--accent-gold); margin-bottom: 2px; }
        .brand-text p { font-size: 0.65rem; font-weight: 700; color: #666; text-transform: uppercase; letter-spacing: 1px; }

        .report-meta-info { text-align: right; display: flex; flex-direction: column; gap: 6px; }
        .meta-item { display: flex; justify-content: flex-end; gap: 12px; font-size: 0.7rem; }
        .m-label { color: #666; font-weight: 800; }
        .m-val { font-weight: 900; color: white; }

        .dossier-title-hero { margin-bottom: 60px; }
        .dossier-title-hero h1 { font-size: 2.2rem; margin-bottom: 20px; font-weight: 300; letter-spacing: -1px; }
        .dossier-divider { width: 100px; height: 4px; background: var(--accent-gold); }

        .dossier-kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 60px; }
        .kpi-card { background: rgba(255,255,255,0.03); padding: 30px 20px; text-align: center; border-radius: 20px; border: 1px solid var(--glass-border); }
        .k-label { font-size: 0.6rem; text-transform: uppercase; font-weight: 800; color: #666; display: block; margin-bottom: 10px; letter-spacing: 1px; }
        .k-val { font-size: 1.6rem; font-weight: 900; color: var(--accent-gold); }
        .k-val.highlight { color: #ff6b6b; }
        .k-val small { font-size: 0.8rem; font-weight: 400; color: #666; }

        .report-section { margin-bottom: 80px; }
        .section-title { margin-bottom: 30px; display: flex; align-items: center; gap: 12px; }
        .section-title h3 { font-size: 0.85rem; text-transform: uppercase; letter-spacing: 2px; color: var(--accent-gold); font-weight: 700; }

        .report-chart-box { background: rgba(0,0,0,0.2); padding: 40px; border: 1px solid var(--glass-border); border-radius: 24px; }
        .category-report-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 60px; align-items: center; }
        .dossier-mini-table { width: 100%; border-collapse: collapse; }
        .dossier-mini-table th { text-align: left; background: rgba(255,255,255,0.05); padding: 14px; font-size: 0.7rem; color: var(--accent-gold); }
        .dossier-mini-table td { padding: 14px; border-bottom: 1px solid var(--glass-border); font-size: 0.9rem; font-weight: 600; color: white; }

        .dossier-full-table { width: 100%; border-collapse: collapse; }
        .dossier-full-table th { background: rgba(255,255,255,0.05); color: var(--accent-gold); text-align: left; padding: 18px; font-size: 0.7rem; text-transform: uppercase; letter-spacing: 1px; }
        .dossier-full-table td { padding: 18px; border-bottom: 1px solid var(--glass-border); font-size: 0.85rem; color: var(--text-secondary); }
        .mono { font-family: monospace; font-weight: bold; color: white; }
        .bold { font-weight: 900; color: white; }
        .status-text.pago { color: var(--accent-green-light); font-weight: bold; }
        .status-text.pendente { color: #ff6b6b; font-weight: bold; }
        .tag-vip { background: var(--accent-gold); color: black; font-size: 0.6rem; font-weight: 900; padding: 4px 10px; border-radius: 6px; }
        .pagination-note { margin-top: 20px; font-size: 0.7rem; font-style: italic; color: #555; text-align: right; }

        .dossier-footer-legal { margin-top: 120px; border-top: 1px solid var(--glass-border); padding-top: 60px; }
        .signature-section { display: flex; justify-content: space-between; margin-bottom: 60px; }
        .signature-box { display: flex; flex-direction: column; align-items: center; gap: 12px; font-size: 0.7rem; color: #666; font-weight: bold; }
        .sig-placeholder { width: 250px; height: 1px; background: var(--glass-border); }
        .legal-disclaimer { font-size: 0.65rem; color: #444; line-height: 1.8; text-align: center; max-width: 800px; margin: 0 auto; }

        .loading-luxury-master { height: 70vh; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 30px; }
        .pulse-logo { width: 80px; height: 80px; background: var(--accent-green); border-radius: 20px; display: flex; align-items: center; justify-content: center; color: white; font-weight: 900; font-size: 2rem; animation: pulseLogo 2s infinite; }

        @keyframes pulseLogo { 0%, 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(42, 99, 68, 0.4); } 50% { transform: scale(1.05); box-shadow: 0 0 40px 10px rgba(42, 99, 68, 0.2); } }
        @keyframes slideDown { from { opacity: 0; transform: translateY(-40px); } to { opacity: 1; transform: translateY(0); } }
        .fade-in { animation: fadeIn 1s ease-out; }

        @media print {
          .no-print { display: none !important; }
          body { background: white !important; margin: 0 !important; padding: 0 !important; }
          .admin-container { display: block !important; }
          .admin-main { margin: 0 !important; padding: 0 !important; }
          .corporate-reporting-center { padding: 0; gap: 0; background: white !important; }
          .printable-report-dossier { margin: 0 !important; padding: 0 !important; width: 100% !important; max-width: none !important; }
          .dossier-document { background: white !important; color: #111 !important; border: none !important; padding: 40px !important; border-radius: 0 !important; box-shadow: none !important; backdrop-filter: none !important; }
          .dossier-header-corporate { border-bottom: 2px solid #111 !important; }
          .logo-square { background: #2a6344 !important; -webkit-print-color-adjust: exact; }
          .brand-text h2 { color: #2a6344 !important; }
          .m-val { color: #111 !important; }
          .dossier-title-hero h1 { color: #111 !important; }
          .dossier-divider { background: #2a6344 !important; -webkit-print-color-adjust: exact; }
          .kpi-card { background: #f9f9f9 !important; border: 1px solid #ddd !important; -webkit-print-color-adjust: exact; }
          .k-val { color: #111 !important; }
          .k-val.highlight { color: #d32f2f !important; }
          .report-chart-box { background: #fff !important; border: 1px solid #eee !important; -webkit-print-color-adjust: exact; }
          .section-title h3 { color: #2a6344 !important; }
          .dossier-full-table th { background: #f0f0f0 !important; color: #111 !important; -webkit-print-color-adjust: exact; }
          .dossier-full-table td { border-bottom: 1px solid #eee !important; color: #444 !important; }
          .mono, .bold { color: #111 !important; }
          .tag-vip { background: #eee !important; border: 1px solid #ccc !important; color: #111 !important; }
          .sig-placeholder { background: #111 !important; }
          .report-section { page-break-inside: avoid; margin-bottom: 40px !important; }
          .no-break { page-break-inside: avoid; }
        }
      `}</style>
    </div>
  );
}
