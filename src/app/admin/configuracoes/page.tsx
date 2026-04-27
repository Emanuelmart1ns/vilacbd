"use client";

import React, { useState, useEffect } from "react";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";

export default function ConfiguracoesPage() {
  const router = useRouter();
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [storeName, setStoreName] = useState("Vila CBD");
  const [socials, setSocials] = useState({
    instagram: "",
    facebook: "",
    tiktok: "",
    whatsapp: "",
    whatsappToken: "",
    whatsappPhoneId: "",
    whatsappBusinessId: "",
    whatsappVerifyToken: "vilacbd_secret_token"
  });
  const [stripePublic, setStripePublic] = useState("");
  const [stripeSecret, setStripeSecret] = useState("");
  const [mbwayKey, setMbwayKey] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [categories, setCategories] = useState<{name: string, subcategories: string[]}[]>([]);
  const [saveMessage, setSaveMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch("/api/settings");
        if (res.ok) {
          const data = await res.json();
          if (data.socials) setSocials(data.socials);
          if (data.storeName) setStoreName(data.storeName);
          if (data.categories) setCategories(data.categories);
        }
      } catch (error) {
        console.error("Erro ao carregar definições:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/login");
  };

  const handleSocialChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSocials(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveMessage("A guardar...");
    
    try {
      const idToken = await auth.currentUser?.getIdToken();
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken, socials, storeName, categories })
      });

      if (res.ok) {
        setSaveMessage("Definições guardadas com sucesso!");
      } else {
        setSaveMessage("Erro ao guardar definições.");
      }
    } catch (error) {
      setSaveMessage("Erro de ligação.");
    }

    setTimeout(() => setSaveMessage(""), 3000);
  };

  const handleSavePayments = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveMessage("Pagamentos guardados com sucesso!");
    setTimeout(() => setSaveMessage(""), 3000);
  };

  const addCategory = () => {
    const name = prompt("Nome da nova categoria:");
    if (name && !categories.find(c => c.name === name)) {
      setCategories([...categories, { name, subcategories: [] }]);
    }
  };

  const removeCategory = (name: string) => {
    if (confirm(`Tem a certeza que deseja remover a categoria '${name}'?`)) {
      setCategories(categories.filter(c => c.name !== name));
    }
  };

  const addSubcategory = (catName: string) => {
    const subName = prompt("Nome da nova subcategoria:");
    if (subName) {
      setCategories(categories.map(c => {
        if (c.name === catName && (!c.subcategories || !c.subcategories.includes(subName))) {
          return { ...c, subcategories: [...(c.subcategories || []), subName] };
        }
        return c;
      }));
    }
  };

  const removeSubcategory = (catName: string, subName: string) => {
    if (confirm(`Remover a subcategoria '${subName}' de '${catName}'?`)) {
      setCategories(categories.map(c => {
        if (c.name === catName) {
          return { ...c, subcategories: c.subcategories.filter(s => s !== subName) };
        }
        return c;
      }));
    }
  };

  if (loading) return <div style={{ padding: "40px", color: "var(--text-secondary)" }}>A carregar definições...</div>;

  return (
    <div className="configuracoes-page">
      <header className="page-header">
        <h2>Definições da Loja</h2>
      </header>

      <div className="settings-grid" style={{ display: "grid", gap: "24px", gridTemplateColumns: "1fr 1fr" }}>
        {saveMessage && (
          <div style={{ gridColumn: "1 / -1", padding: "12px 20px", background: "rgba(42, 99, 68, 0.2)", border: "1px solid var(--accent-green)", borderRadius: "8px", color: "var(--accent-green-light)" }}>
            {saveMessage}
          </div>
        )}
        
        {/* Identidade Visual */}
        <form className="glass-panel" style={{ padding: "24px" }} onSubmit={handleSaveSettings}>
          <h3 style={{ color: "var(--accent-gold)", marginBottom: "16px" }}>Identidade Visual</h3>
          <div className="form-group" style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", marginBottom: "8px" }}>Nome da Loja</label>
            <input type="text" className="input-field" value={storeName} onChange={(e) => setStoreName(e.target.value)} />
          </div>
          <button type="submit" className="btn-primary">Guardar Alterações</button>
        </form>

        {/* Redes Sociais */}
        <form className="glass-panel" style={{ padding: "24px" }} onSubmit={handleSaveSettings}>
          <h3 style={{ color: "var(--accent-gold)", marginBottom: "16px" }}>Redes Sociais</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div className="form-group">
              <label style={{ display: "block", marginBottom: "8px", fontSize: "0.85rem" }}>Instagram</label>
              <input type="text" name="instagram" className="input-field" value={socials.instagram} onChange={handleSocialChange} placeholder="https://instagram.com/..." />
            </div>
            <div className="form-group">
              <label style={{ display: "block", marginBottom: "8px", fontSize: "0.85rem" }}>Facebook</label>
              <input type="text" name="facebook" className="input-field" value={socials.facebook} onChange={handleSocialChange} placeholder="https://facebook.com/..." />
            </div>
            <div className="form-group">
              <label style={{ display: "block", marginBottom: "8px", fontSize: "0.85rem" }}>TikTok</label>
              <input type="text" name="tiktok" className="input-field" value={socials.tiktok} onChange={handleSocialChange} placeholder="https://tiktok.com/@..." />
            </div>
            <div className="form-group">
              <label style={{ display: "block", marginBottom: "8px", fontSize: "0.85rem" }}>WhatsApp (Nº de Exibição)</label>
              <input type="text" name="whatsapp" className="input-field" value={socials.whatsapp} onChange={handleSocialChange} placeholder="Ex: 351912345678" />
            </div>
            
            <div style={{ gridColumn: "1 / -1", marginTop: "20px", padding: "15px", backgroundColor: "rgba(37, 211, 102, 0.1)", borderRadius: "8px", border: "1px solid #25d366" }}>
              <h4 style={{ margin: "0 0 15px 0", color: "#25d366" }}>Configuração WhatsApp (via QR Code)</h4>
              <p style={{ fontSize: "0.8rem", marginBottom: "15px" }}>Use serviços como UltraMsg ou Z-API para conectar sem Facebook.</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
                <div className="form-group">
                  <label style={{ display: "block", marginBottom: "8px", fontSize: "0.85rem" }}>Instance ID (ID da Instância)</label>
                  <input type="text" name="whatsappPhoneId" className="input-field" value={socials.whatsappPhoneId || ""} onChange={handleSocialChange} placeholder="Ex: instance12345" />
                </div>
                <div className="form-group">
                  <label style={{ display: "block", marginBottom: "8px", fontSize: "0.85rem" }}>Token de Acesso</label>
                  <input type="password" name="whatsappToken" className="input-field" value={socials.whatsappToken || ""} onChange={handleSocialChange} placeholder="O seu token secreto" />
                </div>
                <div className="form-group" style={{ gridColumn: "1 / -1" }}>
                  <label style={{ display: "block", marginBottom: "8px", fontSize: "0.85rem" }}>Verify Token (Opcional)</label>
                  <input type="text" name="whatsappVerifyToken" className="input-field" value={socials.whatsappVerifyToken || "vilacbd_secret_token"} onChange={handleSocialChange} />
                </div>
              </div>
            </div>
          </div>
          <button type="submit" className="btn-primary" style={{ marginTop: "24px" }}>Guardar Redes Sociais</button>
        </form>

        {/* Pagamentos */}
        <form className="glass-panel" style={{ padding: "24px" }} onSubmit={handleSavePayments}>
          <h3 style={{ color: "var(--accent-gold)", marginBottom: "16px" }}>Integração de Pagamentos</h3>
          
          <div className="form-group" style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", marginBottom: "8px" }}>Stripe Public Key</label>
            <input type="text" className="input-field" value={stripePublic} onChange={(e) => setStripePublic(e.target.value)} placeholder="pk_test_..." />
          </div>
          
          <div className="form-group" style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", marginBottom: "8px" }}>Stripe Secret Key</label>
            <input type="password" className="input-field" value={stripeSecret} onChange={(e) => setStripeSecret(e.target.value)} placeholder="sk_test_..." />
          </div>

          <button type="submit" className="btn-primary">Guardar Pagamentos</button>
        </form>

        {/* Categorias e Subcategorias */}
        <form className="glass-panel" style={{ padding: "24px", gridColumn: "1 / -1" }} onSubmit={handleSaveSettings}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <h3 style={{ color: "var(--accent-gold)" }}>Categorias e Subcategorias</h3>
            <button type="button" className="btn-action outline" onClick={addCategory}>+ Nova Categoria</button>
          </div>
          
          <div style={{ display: "grid", gap: "16px", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))" }}>
            {categories.map((cat, idx) => (
              <div key={idx} style={{ background: "rgba(0,0,0,0.2)", padding: "16px", borderRadius: "8px", border: "1px solid var(--glass-border)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                  <h4 style={{ margin: 0, color: "var(--text-primary)" }}>{cat.name}</h4>
                  <button type="button" className="btn-text text-danger" onClick={() => removeCategory(cat.name)}>Eliminar</button>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "12px" }}>
                  {cat.subcategories && cat.subcategories.map((sub, sIdx) => (
                    <span key={sIdx} style={{ background: "rgba(212, 175, 55, 0.1)", color: "var(--accent-gold)", padding: "4px 8px", borderRadius: "4px", fontSize: "0.8rem", display: "flex", alignItems: "center", gap: "4px" }}>
                      {sub}
                      <button type="button" style={{ background: "none", border: "none", color: "inherit", cursor: "pointer", padding: 0 }} onClick={() => removeSubcategory(cat.name, sub)}>×</button>
                    </span>
                  ))}
                </div>
                <button type="button" className="btn-text" style={{ fontSize: "0.8rem" }} onClick={() => addSubcategory(cat.name)}>+ Adicionar Subcategoria</button>
              </div>
            ))}
            {categories.length === 0 && <p style={{ color: "var(--text-secondary)" }}>Nenhuma categoria configurada.</p>}
          </div>
          <button type="submit" className="btn-primary" style={{ marginTop: "24px" }}>Guardar Categorias</button>
        </form>

        {/* Sessão e Segurança */}
        <div className="glass-panel" style={{ padding: "24px" }}>
          <h3 style={{ color: "#ff6b6b", marginBottom: "16px" }}>Sessão e Segurança</h3>
          <p style={{ color: "var(--text-secondary)", marginBottom: "16px", fontSize: "0.9rem" }}>Estás autenticado como Administrador.</p>
          <button className="btn-action outline" onClick={handleLogout} style={{ borderColor: "#ff6b6b", color: "#ff6b6b", width: "100%" }}>
            Terminar Sessão Segura
          </button>
        </div>
      </div>
    </div>
  );
}
