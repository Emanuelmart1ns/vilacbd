"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";

interface UserRecord {
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
}

export default function UtilizadoresPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const hasFetched = useRef(false);

  const fetchUsers = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/users");
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users);
      }
    } catch {
      console.error("Erro ao carregar utilizadores");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!hasFetched.current) {
      hasFetched.current = true;
      fetchUsers();
    }
  }, [fetchUsers]);

  const toggleRole = async (targetUid: string, currentRole: string, targetEmail: string) => {
    if (!user) return;
    setUpdating(targetUid);
    const newRole = currentRole === "admin" ? "customer" : "admin";
    const confirmMsg = newRole === "admin"
      ? `Tornar ${targetEmail} administrador?`
      : `Remover permissões de administrador de ${targetEmail}?`;

    if (!confirm(confirmMsg)) {
      setUpdating(null);
      return;
    }

    try {
      const idToken = await user.getIdToken();
      const res = await fetch("/api/auth/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken, targetUid, role: newRole }),
      });
      if (res.ok) {
        setUsers(prev => prev.map(u => u.uid === targetUid ? { ...u, role: newRole } : u));
      } else {
        const data = await res.json();
        alert(data.error || "Erro ao atualizar role.");
      }
    } catch {
      alert("Erro ao atualizar role.");
    } finally {
      setUpdating(null);
    }
  };

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

  const admins = users.filter(u => u.role === "admin");
  const customers = users.filter(u => u.role !== "admin");

  return (
    <div>
      <div style={{ marginBottom: "32px" }}>
        <h2 style={{ fontSize: "1.8rem", marginBottom: "8px" }}>Utilizadores</h2>
        <p style={{ color: "var(--text-secondary)" }}>
          {users.length} registados &bull; {admins.length} admin{admins.length !== 1 ? "s" : ""}
        </p>
      </div>

      {loading ? (
        <p style={{ color: "var(--text-secondary)" }}>A carregar utilizadores...</p>
      ) : users.length === 0 ? (
        <p style={{ color: "var(--text-secondary)" }}>Nenhum utilizador registado.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
          {admins.length > 0 && (
            <div>
              <h3 style={{ color: "var(--accent-gold)", marginBottom: "16px", fontSize: "1.1rem" }}>
                Administradores ({admins.length})
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {admins.map(u => (
                  <div key={u.uid} className="glass-panel" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                      <div style={{
                        width: 40, height: 40, borderRadius: "50%",
                        background: "linear-gradient(135deg, var(--accent-gold), #a08040)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        overflow: "hidden", flexShrink: 0,
                      }}>
                        {u.photoURL ? (
                          <img src={u.photoURL} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        ) : (
                          <span style={{ color: "#000", fontWeight: 700, fontSize: "1rem" }}>
                            {(u.displayName || u.email || "U")[0].toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600 }}>{u.displayName || "-"}</div>
                        <div style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}>{u.email}</div>
                        <div style={{ color: "var(--text-secondary)", fontSize: "0.75rem" }}>
                          {u.provider} &bull; {u.loginCount} login{u.loginCount !== 1 ? "s" : ""} &bull; Último: {formatDate(u.lastLogin)}
                        </div>
                      </div>
                    </div>
                    <button
                      className="btn-secondary"
                      style={{ padding: "8px 16px", fontSize: "0.85rem", borderColor: "#e57373", color: "#e57373" }}
                      disabled={updating === u.uid}
                      onClick={() => toggleRole(u.uid, u.role, u.email)}
                    >
                      {updating === u.uid ? "..." : "Remover Admin"}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {customers.length > 0 && (
            <div>
              <h3 style={{ color: "var(--text-secondary)", marginBottom: "16px", fontSize: "1.1rem" }}>
                Clientes ({customers.length})
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {customers.map(u => (
                  <div key={u.uid} className="glass-panel" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                      <div style={{
                        width: 40, height: 40, borderRadius: "50%",
                        background: "rgba(255,255,255,0.1)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        overflow: "hidden", flexShrink: 0,
                      }}>
                        {u.photoURL ? (
                          <img src={u.photoURL} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        ) : (
                          <span style={{ color: "var(--text-secondary)", fontWeight: 600, fontSize: "1rem" }}>
                            {(u.displayName || u.email || "U")[0].toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600 }}>{u.displayName || "-"}</div>
                        <div style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}>{u.email}</div>
                        <div style={{ color: "var(--text-secondary)", fontSize: "0.75rem" }}>
                          {u.provider} &bull; {u.loginCount} login{u.loginCount !== 1 ? "s" : ""} &bull; Registado: {formatDate(u.createdAt)}
                        </div>
                      </div>
                    </div>
                    <button
                      className="btn-primary"
                      style={{ padding: "8px 16px", fontSize: "0.85rem" }}
                      disabled={updating === u.uid}
                      onClick={() => toggleRole(u.uid, u.role, u.email)}
                    >
                      {updating === u.uid ? "..." : "Tornar Admin"}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
