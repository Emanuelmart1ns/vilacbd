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

// Encomendas reais serão carregadas da base de dados (Firestore)
const initialOrders: Order[] = [];

export default function LogisticaPage() {
  const [filter, setFilter] = useState<"todas" | "pendentes" | "pagas" | "enviadas">("todas");
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [loading, setLoading] = useState(true);
  const [editingTracking, setEditingTracking] = useState<string | null>(null);
  const [trackingValue, setTrackingValue] = useState("");

  const fetchOrders = React.useCallback(async () => {
    try {
      const res = await fetch("/api/orders");
      if (res.ok) {
        const data = await res.json();
        // Mapear dados do Firestore para a interface Order se necessário
        setOrders(data.orders.map((o: any) => ({
          ...o,
          date: o.createdAt,
          customer: `${o.shippingInfo.firstName} ${o.shippingInfo.lastName}`,
          email: o.shippingInfo.email,
        })));
      }
    } catch (error) {
      console.error("Erro ao carregar encomendas:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const filteredOrders = orders.filter((order) => {
    if (filter === "todas") return true;
    if (filter === "pendentes") return order.paymentStatus === "pendente";
    if (filter === "pagas") return order.paymentStatus === "pago";
    if (filter === "enviadas") return order.shippingStatus === "enviado";
    return true;
  });

  const updateShippingStatus = async (id: string, status: Order["shippingStatus"]) => {
    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ shippingStatus: status })
      });
      
      if (res.ok) {
        setOrders((prev) =>
          prev.map((o) => (o.id === id ? { ...o, shippingStatus: status } : o))
        );
      } else {
        alert("Erro ao atualizar estado de envio.");
      }
    } catch (error) {
      console.error("Erro ao atualizar estado:", error);
    }
  };

  const saveTrackingCode = async (id: string) => {
    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trackingCode: trackingValue, shippingStatus: "enviado" })
      });

      if (res.ok) {
        setOrders((prev) =>
          prev.map((o) => (o.id === id ? { ...o, trackingCode: trackingValue, shippingStatus: "enviado" as const } : o))
        );
        setEditingTracking(null);
        setTrackingValue("");
      } else {
        alert("Erro ao guardar código de rastreamento.");
      }
    } catch (error) {
      console.error("Erro ao guardar tracking:", error);
    }
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
        {loading ? (
          <div style={{ padding: "40px", textAlign: "center", color: "var(--text-secondary)" }}>
            A carregar base de dados de encomendas...
          </div>
        ) : filteredOrders.length === 0 ? (
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
