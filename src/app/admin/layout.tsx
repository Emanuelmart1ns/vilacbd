import React from "react";
import Link from "next/link";
import "./admin.css"; // Custom admin styles we'll create

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="admin-container">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar-header">
          <h2>Vila CBD <span>Admin</span></h2>
        </div>
        <nav className="admin-nav">
          <Link href="/admin" className="admin-nav-link">Visão Geral</Link>
          <Link href="/admin/logistica" className="admin-nav-link">Logística & Encomendas</Link>
          <Link href="/admin/produtos" className="admin-nav-link">Produtos</Link>
          <Link href="/admin/configuracoes" className="admin-nav-link">Configurações</Link>
        </nav>
        <div className="admin-sidebar-footer">
          <button className="btn-logout">Sair</button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="admin-main">
        <header className="admin-header">
          <h1>Painel de Controlo</h1>
          <div className="admin-user-info">
            <span>Admin</span>
          </div>
        </header>
        <div className="admin-content">
          {children}
        </div>
      </main>
    </div>
  );
}
