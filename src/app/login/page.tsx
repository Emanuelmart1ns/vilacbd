"use client";

import React, { useState } from "react";
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import "./login.css";

type Mode = "login" | "register";

export default function LoginPage() {
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const syncUserToDb = async (user: { getIdToken: () => Promise<string>; displayName?: string | null }, provider: string, displayName?: string) => {
    try {
      const idToken = await user.getIdToken();
      await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken, displayName, provider }),
      });
    } catch {}
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      await syncUserToDb(cred.user, "email");
      router.push("/");
    } catch {
      setError("Credenciais inválidas. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (name.trim().length < 2) {
      setError("Nome deve ter pelo menos 2 caracteres.");
      return;
    }
    if (password.length < 6) {
      setError("Password deve ter pelo menos 6 caracteres.");
      return;
    }
    if (password !== confirmPassword) {
      setError("As passwords não coincidem.");
      return;
    }
    setLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(cred.user, { displayName: name.trim() });
      const idToken = await cred.user.getIdToken();
      await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken, displayName: name.trim() }),
      });
      router.push("/");
    } catch (err: unknown) {
      const firebaseErr = err as { code?: string; message?: string };
      if (firebaseErr.code === "auth/email-already-in-use") {
        setError("Este email já está registado.");
      } else if (firebaseErr.code === "auth/weak-password") {
        setError("Password demasiado fraca.");
      } else {
        setError("Erro ao criar conta. Tente novamente.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });
    setError("");
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, provider);
      await syncUserToDb(result.user, "google", result.user.displayName || undefined);
      router.push("/");
    } catch (err: unknown) {
      const firebaseErr = err as { code?: string; message?: string };
      if (firebaseErr.code === "auth/popup-closed-by-user") {
        setError("Login cancelado.");
      } else if (firebaseErr.code === "auth/popup-blocked") {
        setError("Popup bloqueado. Permita popups no navegador.");
      } else if (firebaseErr.code === "auth/unauthorized-domain") {
        setError("Domínio não autorizado. Configure no Firebase Console.");
      } else {
        setError(`Erro: ${firebaseErr.message || "Erro ao entrar com Google"}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="login-page">
      <div className="login-container glass-panel fade-in">
        <div className="login-header">
          <h2
            onMouseDown={(e) => {
              if (e.ctrlKey || e.metaKey) {
                e.preventDefault();
              }
            }}
            onDoubleClick={(e) => {
              if (e.ctrlKey || e.metaKey) {
                e.preventDefault();
                router.push("/admin-login");
              }
            }}
            style={{ cursor: "default", userSelect: "none", WebkitUserSelect: "none" }}
          >
            Vila CBD
          </h2>
          <p>{mode === "login" ? "Bem-vindo de volta" : "Criar Conta"}</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        {mode === "login" ? (
          <form onSubmit={handleLogin} className="login-form">
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                placeholder="seu@email.com"
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
        ) : (
          <form onSubmit={handleRegister} className="login-form">
            <div className="form-group">
              <label>Nome</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input-field"
                placeholder="O seu nome"
                required
              />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                placeholder="seu@email.com"
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
                placeholder="Mínimo 6 caracteres"
                required
              />
            </div>
            <div className="form-group">
              <label>Confirmar Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="input-field"
                placeholder="••••••••"
                required
              />
            </div>
            <button type="submit" className="btn-primary" disabled={loading} style={{ width: "100%", marginTop: "16px" }}>
              {loading ? "A criar conta..." : "Criar Conta"}
            </button>
          </form>
        )}

        <div style={{ display: "flex", alignItems: "center", margin: "20px 0", color: "var(--text-secondary)" }}>
          <div style={{ flex: 1, height: "1px", background: "var(--glass-border)" }}></div>
          <span style={{ padding: "0 10px", fontSize: "0.8rem" }}>OU</span>
          <div style={{ flex: 1, height: "1px", background: "var(--glass-border)" }}></div>
        </div>

        <button
          onClick={handleGoogleLogin}
          className="btn-secondary"
          disabled={loading}
          style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" width="18" />
          {loading ? "A entrar..." : "Entrar com Google"}
        </button>

        <div style={{ textAlign: "center", marginTop: "20px" }}>
          {mode === "login" ? (
            <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
              Não tem conta?{" "}
              <button type="button" onClick={() => { setMode("register"); setError(""); }} style={{ background: "none", border: "none", color: "var(--accent-gold)", cursor: "pointer", font: "inherit", textDecoration: "underline" }}>
                Registar-se
              </button>
            </p>
          ) : (
            <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
              Já tem conta?{" "}
              <button type="button" onClick={() => { setMode("login"); setError(""); }} style={{ background: "none", border: "none", color: "var(--accent-gold)", cursor: "pointer", font: "inherit", textDecoration: "underline" }}>
                Entrar
              </button>
            </p>
          )}
        </div>

        <div className="login-footer">
          <Link href="/">Voltar à Loja</Link>
        </div>
      </div>
    </main>
  );
}
