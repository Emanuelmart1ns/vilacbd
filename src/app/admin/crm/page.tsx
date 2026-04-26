"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";

interface CustomerRecord {
  id: string;
  uid: string;
  email: string;
  displayName: string;
  role: string;
  provider: string;
  createdAt: string;
  lastLogin: string;
  loginCount: number;
  photoURL?: string;
  // Shipping info from checkout
  shippingInfo?: {
    firstName: string;
    lastName: string;
    address: string;
    city: string;
    postalCode: string;
    phone: string;
  };
  totalSpent?: number;
  orderCount?: number;
}

export default function CRMPage() {
  const { user } = useAuth();
  const [customers, setCustomers] = useState<CustomerRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const hasFetched = useRef(false);

  const fetchCustomers = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/users");
      if (res.ok) {
        const data = await res.json();
        // Filter only customers (not admins) for CRM
        setCustomers(data.users.filter((u: any) => u.role !== "admin"));
      }
    } catch {
      console.error("Erro ao carregar clientes");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!hasFetched.current) {
      hasFetched.current = true;
      fetchCustomers();
    }
  }, [fetchCustomers]);

  const formatDate = (iso: string) => {
    if (!iso) return "-";
    return new Date(iso).toLocaleDateString("pt-PT", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const filteredCustomers = customers.filter(u => 
    (u.email?.toLowerCase().includes(search.toLowerCase()) || 
     u.displayName?.toLowerCase().includes(search.toLowerCase()) ||
     u.shippingInfo?.firstName?.toLowerCase().includes(search.toLowerCase()) ||
     u.shippingInfo?.lastName?.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="crm-page">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "32px" }}>
        <div>
          <h2 style={{ fontSize: "1.8rem", marginBottom: "8px" }}>CRM & Gestão de Clientes</h2>
          <p style={{ color: "var(--text-secondary)" }}>
            Acompanhe o percurso dos seus clientes, desde o registo até à compra.
          </p>
        </div>
      </div>

      <div style={{ marginBottom: "24px", display: "flex", gap: "16px", alignItems: "center" }}>
        <div style={{ width: "400px" }}>
          <input 
            type="text" 
            placeholder="Procurar por nome, email ou contacto..." 
            className="input-field" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div style={{ marginLeft: "auto", color: "var(--text-secondary)", fontSize: "0.9rem" }}>
          Total de Clientes: <strong>{customers.length}</strong>
        </div>
      </div>

      {loading ? (
        <p style={{ color: "var(--text-secondary)" }}>A carregar base de dados de clientes...</p>
      ) : filteredCustomers.length === 0 ? (
        <div className="glass-panel" style={{ padding: "40px", textAlign: "center" }}>
          <p style={{ color: "var(--text-secondary)" }}>
            {search ? "Nenhum cliente encontrado para a pesquisa." : "Ainda não existem clientes registados no sistema."}
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {filteredCustomers.map(u => (
            <div key={u.uid} className="glass-panel" style={{ padding: "24px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" }}>
                <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
                  <div style={{
                    width: 50, height: 50, borderRadius: "14px",
                    background: "rgba(255,255,255,0.05)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    border: "1px solid var(--glass-border)",
                    fontSize: "1.2rem", color: "var(--accent-gold)"
                  }}>
                    {(u.displayName || u.email || "C")[0].toUpperCase()}
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: "1.1rem" }}>{u.displayName || u.email.split('@')[0]}</h3>
                    <p style={{ margin: "2px 0 0", color: "var(--text-secondary)", fontSize: "0.9rem" }}>{u.email}</p>
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginBottom: "4px" }}>PRIMEIRO ACESSO</div>
                  <div style={{ fontWeight: 500 }}>{formatDate(u.createdAt)}</div>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "24px", borderTop: "1px solid var(--glass-border)", paddingTop: "20px" }}>
                <div>
                  <h4 style={{ fontSize: "0.75rem", color: "var(--accent-gold)", textTransform: "uppercase", marginBottom: "12px", letterSpacing: "1px" }}>Informação de Conta</h4>
                  <div style={{ fontSize: "0.9rem", display: "flex", flexDirection: "column", gap: "6px" }}>
                    <div><span style={{ color: "var(--text-secondary)" }}>Logins:</span> {u.loginCount}</div>
                    <div><span style={{ color: "var(--text-secondary)" }}>Origem:</span> {u.provider}</div>
                    <div><span style={{ color: "var(--text-secondary)" }}>Último Login:</span> {formatDate(u.lastLogin)}</div>
                  </div>
                </div>

                <div>
                  <h4 style={{ fontSize: "0.75rem", color: "var(--accent-gold)", textTransform: "uppercase", marginBottom: "12px", letterSpacing: "1px" }}>Dados de Envio</h4>
                  {u.shippingInfo ? (
                    <div style={{ fontSize: "0.9rem", display: "flex", flexDirection: "column", gap: "6px" }}>
                      <div>{u.shippingInfo.firstName} {u.shippingInfo.lastName}</div>
                      <div>{u.shippingInfo.address}</div>
                      <div>{u.shippingInfo.postalCode} {u.shippingInfo.city}</div>
                      <div style={{ color: "var(--accent-green-light)" }}>{u.shippingInfo.phone}</div>
                    </div>
                  ) : (
                    <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", fontStyle: "italic" }}>
                      Nenhum dado de envio registado (aguarda primeira compra).
                    </p>
                  )}
                </div>

                <div style={{ background: "rgba(255,255,255,0.02)", padding: "16px", borderRadius: "12px", border: "1px solid var(--glass-border)" }}>
                  <h4 style={{ fontSize: "0.75rem", color: "var(--accent-gold)", textTransform: "uppercase", marginBottom: "12px", letterSpacing: "1px" }}>Resumo de Compras</h4>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                    <span style={{ fontSize: "0.9rem", color: "var(--text-secondary)" }}>Total Gasto:</span>
                    <span style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--accent-green-light)" }}>€ {(u.totalSpent || 0).toFixed(2)}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "0.9rem", color: "var(--text-secondary)" }}>Encomendas:</span>
                    <span style={{ fontSize: "1.1rem", fontWeight: 700 }}>{u.orderCount || 0}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
