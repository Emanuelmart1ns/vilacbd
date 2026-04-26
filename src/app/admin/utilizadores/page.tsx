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
  const [activeTab, setActiveTab] = useState<"admins" | "users">("admins");
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [modalLoading, setModalLoading] = useState(false);
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

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newAdminEmail) return;
    setModalLoading(true);

    try {
      const idToken = await user.getIdToken();
      const res = await fetch("/api/auth/set-admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken, targetEmail: newAdminEmail }),
      });

      if (res.ok) {
        const data = await res.json();
        alert(data.message || "Administrador adicionado!");
        setIsModalOpen(false);
        setNewAdminEmail("");
        fetchUsers(); // Refresh the list
      } else {
        const data = await res.json();
        alert(data.error || "Erro ao adicionar administrador.");
      }
    } catch (error) {
      alert("Erro ao processar pedido.");
    } finally {
      setModalLoading(false);
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

  const filteredUsers = users.filter(u => 
    (u.email?.toLowerCase().includes(search.toLowerCase()) || 
     u.displayName?.toLowerCase().includes(search.toLowerCase()))
  );

  const admins = filteredUsers.filter(u => u.role === "admin");
  const customers = filteredUsers.filter(u => u.role !== "admin");

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "32px" }}>
        <div>
          <h2 style={{ fontSize: "1.8rem", marginBottom: "8px" }}>Administradores</h2>
          <p style={{ color: "var(--text-secondary)" }}>
            Gestão da equipa com acesso ao painel de administração.
          </p>
        </div>
        <button 
          className="btn-primary" 
          style={{ display: "flex", alignItems: "center", gap: "8px" }}
          onClick={() => setIsModalOpen(true)}
        >
          <span>+</span> Adicionar Administrador
        </button>
      </div>

      <div style={{ marginBottom: "24px", display: "flex", gap: "16px", alignItems: "center" }}>
        <div style={{ width: "300px" }}>
          <input 
            type="text" 
            placeholder="Procurar administrador..." 
            className="input-field" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <p style={{ color: "var(--text-secondary)" }}>A carregar administradores...</p>
      ) : admins.length === 0 ? (
        <p style={{ color: "var(--text-secondary)" }}>
          {search ? "Nenhum administrador encontrado." : "Nenhum administrador registado."}
        </p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {admins.map(u => (
            <div key={u.uid} className="glass-panel" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                <div style={{
                  width: 44, height: 44, borderRadius: "12px",
                  background: "linear-gradient(135deg, var(--accent-gold), #a08040)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  overflow: "hidden", flexShrink: 0,
                  border: "1px solid var(--glass-border)"
                }}>
                  {u.photoURL ? (
                    <img src={u.photoURL} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    <span style={{ color: "#000", fontWeight: 700, fontSize: "1.1rem" }}>
                      {(u.displayName || u.email || "U")[0].toUpperCase()}
                    </span>
                  )}
                </div>
                <div>
                  <div style={{ fontWeight: 600, display: "flex", alignItems: "center", gap: "8px" }}>
                    {u.displayName || "-"}
                    <span style={{ fontSize: "0.7rem", padding: "2px 8px", background: "rgba(207, 170, 107, 0.1)", color: "var(--accent-gold)", borderRadius: "10px", border: "1px solid rgba(207, 170, 107, 0.2)" }}>ADMIN</span>
                  </div>
                  <div style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}>{u.email}</div>
                  <div style={{ color: "var(--text-secondary)", fontSize: "0.75rem", marginTop: "2px" }}>
                    {u.provider} &bull; {u.loginCount} login{u.loginCount !== 1 ? "s" : ""} &bull; Último: {formatDate(u.lastLogin)}
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  className="btn-secondary"
                  style={{ 
                    padding: "8px 16px", 
                    fontSize: "0.85rem", 
                    borderColor: "#e57373", 
                    color: "#e57373" 
                  }}
                  disabled={updating === u.uid}
                  onClick={() => toggleRole(u.uid, u.role, u.email)}
                >
                  {updating === u.uid ? "..." : "Remover Admin"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Adicionar Admin */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => !modalLoading && setIsModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: "450px" }}>
            <h3 className="modal-title">Adicionar Administrador</h3>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginBottom: "24px" }}>
              Introduza o email do utilizador que deseja promover a administrador. 
              O utilizador já deve ter uma conta registada.
            </p>
            <form onSubmit={handleAddAdmin}>
              <div className="form-group" style={{ marginBottom: "24px" }}>
                <label>Email do Utilizador</label>
                <input 
                  type="email" 
                  className="input-field" 
                  placeholder="exemplo@email.com"
                  value={newAdminEmail}
                  onChange={e => setNewAdminEmail(e.target.value)}
                  required
                  autoFocus
                />
              </div>
              <div className="form-actions" style={{ border: "none", paddingTop: 0, justifyContent: "flex-end" }}>
                <button 
                  type="button" 
                  className="btn-secondary" 
                  onClick={() => setIsModalOpen(false)}
                  disabled={modalLoading}
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="btn-primary"
                  disabled={modalLoading || !newAdminEmail}
                >
                  {modalLoading ? "A processar..." : "Confirmar Admin"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
