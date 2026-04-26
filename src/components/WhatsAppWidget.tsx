"use client";

import React, { useState, useEffect } from "react";

export default function WhatsAppWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [socials, setSocials] = useState<any>(null);

  const [messages, setMessages] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/settings")
      .then(res => res.json())
      .then(data => {
        if (data.socials) setSocials(data.socials);
      })
      .catch(err => console.error("Erro ao carregar link do WhatsApp no widget:", err));

    const handleOpenChat = () => setIsOpen(true);
    window.addEventListener('openWhatsAppChat', handleOpenChat);
    
    // Polling simples para novas mensagens (em produção usaríamos WebSockets ou Listeners)
    const interval = setInterval(async () => {
      if (isOpen) {
        // Aqui buscaríamos as mensagens do chat específico
        // Por agora, simulamos a leitura do histórico
      }
    }, 5000);

    return () => {
      window.removeEventListener('openWhatsAppChat', handleOpenChat);
      clearInterval(interval);
    };
  }, [isOpen]);

  const handleSend = async () => {
    if (!message) return;
    
    const newMessage = { from: "user", text: message, timestamp: new Date() };
    setMessages(prev => [...prev, newMessage]);
    const currentMsg = message;
    setMessage("");

    try {
      const res = await fetch("/api/whatsapp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: currentMsg })
      });
      
      if (!res.ok) throw new Error("Falha ao enviar via API");
    } catch (error) {
      console.error("Erro ao enviar mensagem:", error);
      // Fallback para o link direto se a API falhar ou não estiver configurada
      const phoneNumber = socials?.whatsapp?.replace(/\s/g, '') || "351912345678";
      window.open(`https://wa.me/${phoneNumber}?text=${encodeURIComponent(currentMsg)}`, "_blank");
    }
  };

  if (!socials?.whatsapp) return null;

  return (
    <div className="wa-widget-container" style={{ position: "fixed", bottom: "30px", right: "30px", zIndex: 9999, fontFamily: "sans-serif" }}>
      {/* Janela de Chat */}
      {isOpen && (
        <div className="wa-chat-window" style={{
          width: "320px",
          backgroundColor: "#fff",
          borderRadius: "15px",
          boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
          marginBottom: "20px",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          animation: "slideUp 0.3s ease"
        }}>
          {/* Header */}
          <div style={{ backgroundColor: "#075e54", color: "#fff", padding: "20px", display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ width: "40px", height: "40px", backgroundColor: "rgba(255,255,255,0.2)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem", fontWeight: "bold" }}>
              V
            </div>
            <div>
              <div style={{ fontWeight: "bold" }}>Vila CBD - Suporte</div>
              <div style={{ fontSize: "0.75rem", opacity: 0.8 }}>Online agora</div>
            </div>
          </div>

          {/* Corpo do Chat */}
          <div style={{ padding: "20px", backgroundColor: "#e5ddd5", flex: 1, minHeight: "200px", maxHeight: "300px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "10px" }}>
            <div style={{ backgroundColor: "#fff", padding: "10px 15px", borderRadius: "8px", fontSize: "0.9rem", maxWidth: "85%", alignSelf: "flex-start", boxShadow: "0 1px 2px rgba(0,0,0,0.1)" }}>
              Olá! Como podemos ajudar hoje? 🌱
            </div>
            
            {messages.map((msg, i) => (
              <div key={i} style={{ 
                backgroundColor: msg.from === "user" ? "#dcf8c6" : "#fff", 
                padding: "10px 15px", 
                borderRadius: "8px", 
                fontSize: "0.9rem", 
                maxWidth: "85%", 
                alignSelf: msg.from === "user" ? "flex-end" : "flex-start",
                boxShadow: "0 1px 2px rgba(0,0,0,0.1)" 
              }}>
                {msg.text}
                <div style={{ fontSize: "0.6rem", opacity: 0.5, textAlign: "right", marginTop: "4px" }}>
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            ))}
          </div>

          {/* Input */}
          <div style={{ padding: "15px", backgroundColor: "#f0f0f0", display: "flex", gap: "10px" }}>
            <input 
              type="text" 
              placeholder="Escreva a sua mensagem..." 
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              style={{ flex: 1, padding: "10px", borderRadius: "20px", border: "none", outline: "none", fontSize: "0.9rem" }}
            />
            <button 
              onClick={handleSend}
              style={{ backgroundColor: "#075e54", color: "#fff", border: "none", borderRadius: "50%", width: "38px", height: "38px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"></path></svg>
            </button>
          </div>
        </div>
      )}

      {/* Botão Flutuante */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: "60px",
          height: "60px",
          backgroundColor: "#25d366",
          borderRadius: "50%",
          border: "none",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 4px 10px rgba(0,0,0,0.3)",
          transition: "transform 0.2s ease"
        }}
        onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.1)")}
        onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
      >
        <svg width="30" height="30" viewBox="0 0 24 24" fill="#fff"><path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.025 3.107l-.694 2.54 2.6-.684c.851.463 1.784.707 2.837.707 3.181 0 5.768-2.586 5.768-5.766 0-3.18-2.587-5.766-5.768-5.77zM12.03 16.2c-1.028 0-1.933-.243-2.731-.723l-.195-.118-1.556.408.416-1.521-.13-.207c-.503-.803-.768-1.722-.768-2.673 0-2.825 2.299-5.124 5.124-5.125 2.826 0 5.125 2.299 5.125 5.125s-2.299 5.125-5.125 5.125zM15.427 13.593c-.197-.1-.1.197-.459-.38-.344-.55-.41-.53-.55-.459-.14.07-.492.21-.601.32-.109.11-.219.12-.416.021s-.834-.307-1.588-.981c-.588-.524-.984-1.171-1.1-1.368-.109-.197-.012-.304.086-.401s.197-.229.296-.344c.099-.115.131-.197.197-.328.066-.131.033-.246-.016-.344s-.459-1.107-.629-1.516c-.165-.397-.333-.343-.459-.349-.118-.006-.254-.007-.39-.007s-.356.05-.542.253c-.187.203-.712.697-.712 1.7s.73 1.975.832 2.112c.102.138 1.435 2.193 3.476 3.073.486.21 0.864.335 1.159.429.488.155.932.133 1.283.081.391-.058 1.201-.491 1.371-.963.17-.473.17-.878.118-.963s-.187-.138-.383-.238z"/></svg>
      </button>

      <style jsx>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
