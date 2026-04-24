"use client";

import React, { useState } from "react";
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import "./login.css";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/admin");
    } catch (err: any) {
      setError("Credenciais inválidas. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      router.push("/admin");
    } catch (err: any) {
      setError("Erro ao entrar com Google.");
    }
  };

  return (
    <main className="login-page">
      <div className="login-container glass-panel fade-in">
        <div className="login-header">
          <h2>Vila CBD</h2>
          <p>Acesso Reservado</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleLogin} className="login-form">
          <div className="form-group">
            <label>Email</label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)}
              className="input-field" 
              placeholder="admin@vilacbd.com" 
              required 
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              className="input-field" 
              placeholder="••••••••" 
              required 
            />
          </div>
          <button type="submit" className="btn-primary" disabled={loading} style={{ width: "100%", marginTop: "16px" }}>
            {loading ? "A entrar..." : "Entrar com Email"}
          </button>
        </form>

        <div style={{ display: "flex", alignItems: "center", margin: "20px 0", color: "var(--text-secondary)" }}>
          <div style={{ flex: 1, height: "1px", background: "var(--glass-border)" }}></div>
          <span style={{ padding: "0 10px", fontSize: "0.8rem" }}>OU</span>
          <div style={{ flex: 1, height: "1px", background: "var(--glass-border)" }}></div>
        </div>

        <button 
          onClick={handleGoogleLogin} 
          className="btn-secondary" 
          style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" width="18" />
          Entrar com Google
        </button>

        <div className="login-footer">
          <Link href="/">Voltar à Loja</Link>
        </div>
      </div>
    </main>
  );
}
