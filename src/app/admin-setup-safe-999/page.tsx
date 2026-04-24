"use client";

import React, { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";

export default function AdminSetupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("");
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("A criar conta...");
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      setStatus("Conta criada com sucesso! Redirecionando para o Admin...");
      setTimeout(() => router.push("/admin"), 2000);
    } catch (err: any) {
      setStatus("Erro: " + err.message);
    }
  };

  return (
    <div style={{ padding: "100px", textAlign: "center", backgroundColor: "#0a0e0a", minHeight: "100vh", color: "#fff" }}>
      <h1>Configuração Inicial do Administrador</h1>
      <p>Utilize esta página apenas uma vez para criar a sua conta mestre.</p>
      
      <form onSubmit={handleRegister} style={{ maxWidth: "400px", margin: "40px auto", display: "flex", flexDirection: "column", gap: "16px" }}>
        <input 
          type="email" 
          placeholder="Email do Admin" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
          style={{ padding: "12px", borderRadius: "8px", border: "1px solid #333", background: "#111", color: "#fff" }}
          required 
        />
        <input 
          type="password" 
          placeholder="Password Forte" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
          style={{ padding: "12px", borderRadius: "8px", border: "1px solid #333", background: "#111", color: "#fff" }}
          required 
        />
        <button type="submit" className="btn-primary" style={{ padding: "12px" }}>Criar Conta Admin</button>
      </form>
      
      {status && <p style={{ color: status.includes("Erro") ? "#ff6b6b" : "#4caf50" }}>{status}</p>}
    </div>
  );
}
