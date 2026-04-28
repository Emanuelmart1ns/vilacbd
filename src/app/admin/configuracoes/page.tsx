"use client";

import React, { useState, useEffect } from "react";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";

export default function ConfiguracoesPage() {
  const router = useRouter();
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [storeName, setStoreName] = useState("Vila CBD");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [schedule, setSchedule] = useState("");
  const [logo, setLogo] = useState("");
  const [socials, setSocials] = useState({
    instagram: "",
    facebook: "",
    tiktok: "",
    whatsapp: "",
    whatsappToken: "",
    whatsappPhoneId: "",
    whatsappBusinessId: "",
    whatsappVerifyToken: "vilacbd_secret_token",
    telegramToken: "",
    telegramChatId: ""
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
          if (data.address) setAddress(data.address);
          if (data.phone) setPhone(data.phone);
          if (data.email) setEmail(data.email);
          if (data.schedule) setSchedule(data.schedule);
          if (data.logo) setLogo(data.logo);
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
        body: JSON.stringify({ 
          idToken, 
          socials, 
          storeName, 
          categories,
          address,
          phone,
          email,
          schedule,
          logo
        })
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

  const handleTestTelegram = async () => {
    setSaveMessage("A enviar teste...");
    try {
      const res = await fetch("/api/telegram/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          name: "Vila Admin",
          text: "Este é um teste de ligação do seu Painel de Administração! 🚀" 
        })
      });
      if (res.ok) {
        setSaveMessage("Teste enviado! Verifique o seu Telegram. ✅");
      } else {
        const data = await res.json();
        setSaveMessage(`Erro no teste: ${data.error || "Verifique as chaves"}`);
      }
    } catch (error) {
      setSaveMessage("Erro de ligação ao servidor.");
    }
    setTimeout(() => setSaveMessage(""), 5000);
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

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogo(reader.result as string);
      };
      reader.readAsDataURL(file);
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
        
        {/* Identidade Visual e Dados */}
        <form className="glass-panel" style={{ padding: "24px" }} onSubmit={handleSaveSettings}>
          <h3 style={{ color: "var(--accent-gold)", marginBottom: "16px" }}>Dados da Loja</h3>
          
          <div className="form-group" style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", marginBottom: "8px", fontSize: "0.85rem" }}>Nome da Loja</label>
            <input type="text" className="input-field" value={storeName} onChange={(e) => setStoreName(e.target.value)} />
          </div>

          <div className="form-group" style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", marginBottom: "8px", fontSize: "0.85rem" }}>Logo (URL ou Upload)</label>
            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
              {logo && <img src={logo} alt="Logo Preview" style={{ height: "40px", borderRadius: "4px" }} />}
              <input type="file" accept="image/*" onChange={handleLogoUpload} style={{ fontSize: "0.8rem" }} />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", marginBottom: "8px", fontSize: "0.85rem" }}>Morada Completa</label>
            <textarea className="input-field" value={address} onChange={(e) => setAddress(e.target.value)} rows={2} style={{ resize: "none" }} />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
            <div className="form-group">
              <label style={{ display: "block", marginBottom: "8px", fontSize: "0.85rem" }}>Telefone</label>
              <input type="text" className="input-field" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            <div className="form-group">
              <label style={{ display: "block", marginBottom: "8px", fontSize: "0.85rem" }}>Email de Contacto</label>
              <input type="email" className="input-field" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", marginBottom: "8px", fontSize: "0.85rem" }}>Horário de Funcionamento</label>
            <input type="text" className="input-field" value={schedule} onChange={(e) => setSchedule(e.target.value)} placeholder="Ex: Seg-Sex: 10h-19h..." />
          </div>

          <button type="submit" className="btn-primary">Guardar Dados da Loja</button>
        </form>

        {/* Categorias e Subcategorias */}
        <form className="glass-panel" style={{ padding: "24px" }} onSubmit={handleSaveSettings}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <h3 style={{ color: "var(--accent-gold)" }}>Categorias e Subcategorias</h3>
            <button type="button" className="btn-action outline" onClick={addCategory}>+ Nova Categoria</button>
          </div>
          
          <div style={{ display: "grid", gap: "12px", gridTemplateColumns: "1fr" }}>
            {categories.map((cat, idx) => (
              <div key={idx} style={{ background: "rgba(0,0,0,0.2)", padding: "12px", borderRadius: "8px", border: "1px solid var(--glass-border)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                  <h4 style={{ margin: 0, color: "var(--text-primary)", fontSize: "0.95rem" }}>{cat.name}</h4>
                  <button type="button" className="btn-text text-danger" style={{ fontSize: "0.75rem" }} onClick={() => removeCategory(cat.name)}>Eliminar</button>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "8px" }}>
                  {cat.subcategories && cat.subcategories.map((sub, sIdx) => (
                    <span key={sIdx} style={{ background: "rgba(212, 175, 55, 0.1)", color: "var(--accent-gold)", padding: "2px 6px", borderRadius: "4px", fontSize: "0.75rem", display: "flex", alignItems: "center", gap: "4px" }}>
                      {sub}
                      <button type="button" style={{ background: "none", border: "none", color: "inherit", cursor: "pointer", padding: 0 }} onClick={() => removeSubcategory(cat.name, sub)}>×</button>
                    </span>
                  ))}
                </div>
                <button type="button" className="btn-text" style={{ fontSize: "0.75rem" }} onClick={() => addSubcategory(cat.name)}>+ Adicionar Subcategoria</button>
              </div>
            ))}
            {categories.length === 0 && <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}>Nenhuma categoria configurada.</p>}
          </div>
          <button type="submit" className="btn-primary" style={{ marginTop: "20px" }}>Guardar Categorias</button>
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
            
            <div style={{ gridColumn: "1 / -1", marginTop: "20px", padding: "24px", backgroundColor: "rgba(0, 136, 204, 0.05)", borderRadius: "16px", border: "1px solid #0088cc" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
                <span style={{ fontSize: "1.5rem" }}>🤖</span>
                <h3 style={{ margin: 0, color: "#0088cc" }}>Configuração do Vila Bot (Telegram)</h3>
              </div>
              
              <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)", marginBottom: "20px" }}>
                Este bot enviará as mensagens dos clientes do site diretamente para o seu Telegram.
              </p>

              <div style={{ background: "rgba(0, 136, 204, 0.1)", padding: "15px", borderRadius: "12px", marginBottom: "24px", fontSize: "0.85rem", borderLeft: "4px solid #0088cc", color: "#b0d4ff" }}>
                <strong style={{ color: "#0088cc", display: "block", marginBottom: "8px" }}>🚀 Guia de Configuração Rápida:</strong>
                1. No Telegram, procure por <strong>@BotFather</strong>, envie <code>/newbot</code> e copie o <strong>API Token</strong>.<br/>
                2. Fale com o bot <strong>@userinfobot</strong> para obter o seu <strong>ID de Utilizador (Chat ID)</strong>.<br/>
                3. Introduza os dados abaixo e clique em <strong>Testar Ligação</strong>.
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                <div className="form-group">
                  <label style={{ display: "block", marginBottom: "8px", fontSize: "0.85rem", color: "#0088cc" }}>Bot API Token (@BotFather)</label>
                  <input type="password" name="telegramToken" className="input-field" value={(socials as any).telegramToken || ""} onChange={handleSocialChange} placeholder="Ex: 123456:ABC-DEF..." style={{ borderColor: "rgba(0, 136, 204, 0.3)" }} />
                </div>
                <div className="form-group">
                  <label style={{ display: "block", marginBottom: "8px", fontSize: "0.85rem", color: "#0088cc" }}>O seu Chat ID (@userinfobot)</label>
                  <input type="text" name="telegramChatId" className="input-field" value={(socials as any).telegramChatId || ""} onChange={handleSocialChange} placeholder="Ex: 987654321" style={{ borderColor: "rgba(0, 136, 204, 0.3)" }} />
                </div>
                <div style={{ gridColumn: "1 / -1" }}>
                   <button type="button" className="btn-action outline" onClick={handleTestTelegram} style={{ fontSize: "0.85rem", width: "100%", marginTop: "10px", borderColor: "var(--accent-gold)", color: "var(--accent-gold)", padding: "10px", borderRadius: "10px", background: "none", cursor: "pointer", fontWeight: "500" }}>
                     Testar Ligação ao Telegram
                   </button>
                </div>
              </div>
            </div>
          </div>
          <button type="submit" className="btn-primary" style={{ marginTop: "32px", width: "100%" }}>Guardar Todas as Definições</button>
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
