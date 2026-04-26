"use client";

import React, { useState } from "react";
import { signInWithEmailAndPassword, signInWithCustomToken } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const bypassAdmin = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/admin-bypass", { method: "POST" });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || errData.details || "API error " + res.status);
      }
      const { customToken } = await res.json();
      if (!customToken) throw new Error("No token received");
      await signInWithCustomToken(auth, customToken);
      router.push("/admin");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Acesso negado.";
      setError(msg);
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      const idToken = await cred.user.getIdToken();
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken, provider: "admin" }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.role !== "admin") {
          setError("Sem permissões de administrador.");
          return;
        }
        router.push("/admin");
      } else {
        setError("Erro ao verificar permissões.");
      }
    } catch {
      setError("Credenciais inválidas.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "linear-gradient(135deg, #0a0e0a, #1a2a1a)",
    }}>
      <div style={{
        width: "100%",
        maxWidth: "400px",
        padding: "40px",
        background: "rgba(20, 26, 20, 0.9)",
        border: "1px solid var(--glass-border)",
        borderRadius: "24px",
        boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
      }}>
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <h2
            onDoubleClick={(e) => {
              if (e.altKey) {
                e.preventDefault();
                bypassAdmin();
              }
            }}
            style={{ color: "var(--accent-gold)", fontSize: "1.8rem", marginBottom: "8px", cursor: "default", userSelect: "none", WebkitUserSelect: "none" }}
          >
            Vila CBD
          </h2>
          <p style={{ color: "var(--accent-gold)", fontSize: "0.85rem", letterSpacing: "2px", textTransform: "uppercase" }}>
            Painel de Administração
          </p>
        </div>

        {error && (
          <div style={{
            background: "rgba(255, 107, 107, 0.1)",
            border: "1px solid #ff6b6b",
            color: "#ff6b6b",
            padding: "12px",
            borderRadius: "8px",
            fontSize: "0.9rem",
            marginBottom: "24px",
            textAlign: "center",
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <label style={{ fontSize: "0.9rem", color: "var(--text-secondary)" }}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field"
              placeholder="admin@vilacbd.com"
              required
            />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <label style={{ fontSize: "0.9rem", color: "var(--text-secondary)" }}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field"
              placeholder="••••••••"
              required
            />
          </div>
          <button
            type="submit"
            className="btn-primary"
            disabled={loading}
            style={{ width: "100%", marginTop: "16px", padding: "14px" }}
          >
            {loading ? "A verificar..." : "Entrar como Admin"}
          </button>
        </form>
      </div>
    </div>
  );
}
