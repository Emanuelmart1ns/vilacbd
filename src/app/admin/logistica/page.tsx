"use client";

import React, { useState } from "react";

interface Order {
  id: string;
  date: string;
  customer: string;
  email: string;
  total: number;
  paymentStatus: "pendente" | "pago" | "reembolsado";
  shippingStatus: "pendente" | "preparando" | "enviado" | "entregue";
  trackingCode: string;
  items: { name: string; quantity: number }[];
}

const mockOrders: Order[] = [
  {
    id: "ORD-001",
    date: "2026-04-20",
    customer: "João Silva",
    email: "joao@email.com",
    total: 67.50,
    paymentStatus: "pago",
    shippingStatus: "enviado",
    trackingCode: "PT123456789",
    items: [{ name: "Óleo Premium CBD 5%", quantity: 1 }, { name: "Gomas Relaxantes Morango", quantity: 1 }],
  },
  {
    id: "ORD-002",
    date: "2026-04-22",
    customer: "Maria Santos",
    email: "maria@email.com",
    total: 35.00,
    paymentStatus: "pendente",
    shippingStatus: "pendente",
    trackingCode: "",
    items: [{ name: "Bálsamo Muscular Efeito Frio", quantity: 1 }],
  },
  {
    id: "ORD-003",
    date: "2026-04-24",
    customer: "Pedro Costa",
    email: "pedro@email.com",
    total: 110.00,
    paymentStatus: "pago",
    shippingStatus: "preparando",
    trackingCode: "",
    items: [{ name: "Vaporizador de Erva Seca Premium", quantity: 1 }],
  },
];

export default function LogisticaPage() {
  const [filter, setFilter] = useState<"todas" | "pendentes" | "pagas" | "enviadas">("todas");
  const [orders, setOrders] = useState<Order[]>(mockOrders);
  const [editingTracking, setEditingTracking] = useState<string | null>(null);
  const [trackingValue, setTrackingValue] = useState("");

  const filteredOrders = orders.filter((order) => {
    if (filter === "todas") return true;
    if (filter === "pendentes") return order.paymentStatus === "pendente";
    if (filter === "pagas") return order.paymentStatus === "pago";
    if (filter === "enviadas") return order.shippingStatus === "enviado";
    return true;
  });

  const updateShippingStatus = (id: string, status: Order["shippingStatus"]) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, shippingStatus: status } : o))
    );
  };

  const saveTrackingCode = (id: string) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, trackingCode: trackingValue, shippingStatus: "enviado" as const } : o))
    );
    setEditingTracking(null);
    setTrackingValue("");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pago":
      case "entregue":
        return "var(--accent-green-light)";
      case "pendente":
      case "preparando":
        return "var(--accent-gold)";
      case "reembolsado":
        return "#ff6b6b";
      case "enviado":
        return "#4facfe";
      default:
        return "var(--text-secondary)";
    }
  };

  return (
    <div className="logistica-page">
      <header className="page-header">
        <h2>Gestão de Logística e Encomendas</h2>
        <div className="filters" style={{ display: "flex", gap: "12px", marginTop: "16px" }}>
          {(["todas", "pendentes", "pagas", "enviadas"] as const).map((f) => (
            <button
              key={f}
              className={`btn-secondary ${filter === f ? "active" : ""}`}
              onClick={() => setFilter(f)}
              style={{
                padding: "8px 16px",
                background: filter === f ? "rgba(212, 175, 55, 0.15)" : "transparent",
                border: `1px solid ${filter === f ? "var(--accent-gold)" : "var(--glass-border)"}`,
                color: filter === f ? "var(--accent-gold)" : "var(--text-secondary)",
                borderRadius: "8px",
                cursor: "pointer",
                textTransform: "capitalize",
              }}
            >
              {f}
            </button>
          ))}
        </div>
      </header>

      <div className="glass-panel" style={{ marginTop: "24px" }}>
        {filteredOrders.length === 0 ? (
          <div style={{ padding: "40px", textAlign: "center", color: "var(--text-secondary)" }}>
            Nenhuma encomenda encontrada com este filtro.
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID Encomenda</th>
                <th>Data</th>
                <th>Cliente</th>
                <th>Total</th>
                <th>Estado de Pagamento</th>
                <th>Estado de Envio</th>
                <th>Rastreamento CTT</th>
                <th>Ação Logística</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <tr key={order.id}>
                  <td style={{ fontWeight: 600 }}>{order.id}</td>
                  <td style={{ fontSize: "0.85rem" }}>{new Date(order.date).toLocaleDateString("pt-PT")}</td>
                  <td>
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      <span style={{ fontWeight: 600 }}>{order.customer}</span>
                      <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>{order.email}</span>
                    </div>
                  </td>
                  <td style={{ fontWeight: 600, color: "var(--accent-green-light)" }}>€ {order.total.toFixed(2)}</td>
                  <td>
                    <span style={{ color: getStatusColor(order.paymentStatus), fontWeight: 600, textTransform: "capitalize" }}>
                      {order.paymentStatus}
                    </span>
                  </td>
                  <td>
                    <select
                      value={order.shippingStatus}
                      onChange={(e) => updateShippingStatus(order.id, e.target.value as Order["shippingStatus"])}
                      style={{
                        background: "var(--bg-primary)",
                        border: "1px solid var(--glass-border)",
                        color: getStatusColor(order.shippingStatus),
                        padding: "4px 8px",
                        borderRadius: "6px",
                        cursor: "pointer",
                      }}
                    >
                      <option value="pendente">Pendente</option>
                      <option value="preparando">Preparando</option>
                      <option value="enviado">Enviado</option>
                      <option value="entregue">Entregue</option>
                    </select>
                  </td>
                  <td>
                    {editingTracking === order.id ? (
                      <div style={{ display: "flex", gap: "8px" }}>
                        <input
                          type="text"
                          className="input-field"
                          value={trackingValue}
                          onChange={(e) => setTrackingValue(e.target.value)}
                          placeholder="PT..."
                          style={{ width: "120px", padding: "4px 8px" }}
                        />
                        <button className="btn-primary" style={{ padding: "4px 12px" }} onClick={() => saveTrackingCode(order.id)}>
                          ✓
                        </button>
                      </div>
                    ) : order.trackingCode ? (
                      <span style={{ color: "#4facfe", fontFamily: "monospace" }}>{order.trackingCode}</span>
                    ) : (
                      <span style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}>—</span>
                    )}
                  </td>
                  <td>
                    {!order.trackingCode && order.shippingStatus !== "pendente" && (
                      <button
                        className="btn-text"
                        onClick={() => {
                          setEditingTracking(order.id);
                          setTrackingValue("");
                        }}
                      >
                        Adicionar Tracking
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
