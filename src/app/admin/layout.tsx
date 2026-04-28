"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import "./admin.css";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, profile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/admin-login");
      }
    }
  }, [user, loading, router]);



  // Remover o redirecionamento com timer para evitar falsos positivos
  // A proteção real acontece nas APIs do backend.


  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push("/admin-login");
    } catch (error) {
      console.error("Erro ao sair:", error);
    }
  };

  if (loading) {
    return <div style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "var(--bg-primary)" }}>A verificar acesso...</div>;
  }

  const isAdmin = profile?.role === "admin";

  if (!user) return null;

  if (!isAdmin && !loading) {
    return (
      <div style={{ height: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", backgroundColor: "#121812", color: "white", textAlign: "center", padding: "20px" }}>
        <h1 style={{ color: "var(--accent-gold)", marginBottom: "16px" }}>Acesso Restrito</h1>
        <p style={{ marginBottom: "24px" }}>A sua conta ({user.email}) não tem permissões de administrador.</p>
        <div style={{ display: "flex", gap: "12px" }}>
          <button className="btn-primary" onClick={() => router.push("/")}>Voltar à Loja</button>
          <button className="btn-secondary" onClick={handleLogout}>Sair / Trocar Conta</button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-container">
      <aside className="admin-sidebar no-print">
        <div className="admin-sidebar-header">
          <h2>Vila CBD <span>Admin</span></h2>
        </div>
        <nav className="admin-nav">
          <Link href="/admin" className="admin-nav-link">Visão Geral</Link>
          <Link href="/admin/logistica" className="admin-nav-link">Logística & Encomendas</Link>
          <Link href="/admin/relatorios" className="admin-nav-link">Relatórios Estratégicos</Link>
          <Link href="/admin/produtos" className="admin-nav-link">Produtos</Link>
          <Link href="/admin/utilizadores" className="admin-nav-link">Administradores</Link>
          <Link href="/admin/crm" className="admin-nav-link">CRM & Clientes</Link>
          <Link href="/admin/comentarios" className="admin-nav-link">Comentários</Link>
          <Link href="/admin/configuracoes" className="admin-nav-link">Configurações</Link>
        </nav>
        <div className="admin-sidebar-footer">
          <button className="btn-logout" onClick={handleLogout}>Sair</button>
        </div>
      </aside>

      <main className="admin-main">
        <header className="admin-header no-print">
          <h1>Painel de Controlo</h1>
          <div className="admin-user-info">
            <span>{profile?.displayName || user.email}</span>
            <span style={{ fontSize: "0.75rem", color: "var(--accent-gold)", marginLeft: "8px" }}>Admin</span>
          </div>
        </header>
        <div className="admin-content">
          {children}
        </div>
      </main>
    </div>
  );
}
