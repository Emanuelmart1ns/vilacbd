"use client";

import React, { useState, useEffect, useRef } from "react";
import "./whatsapp-widget.css";

export default function WhatsAppWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [userName, setUserName] = useState("");
  const [userMessage, setUserMessage] = useState("");
  const [socials, setSocials] = useState<any>(null);
  const [isSent, setIsSent] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/settings")
      .then(res => res.json())
      .then(data => {
        if (data.socials) setSocials(data.socials);
      })
      .catch(err => console.error("Erro ao carregar link do WhatsApp no widget:", err));

    const handleOpenChat = () => setIsOpen(true);
    window.addEventListener('openWhatsAppChat', handleOpenChat);
    
    // Pequeno atraso para mostrar uma notificação de "Boas-vindas"
    const timer = setTimeout(() => {
      setShowNotification(true);
    }, 5000);

    return () => {
      window.removeEventListener('openWhatsAppChat', handleOpenChat);
      clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    if (isOpen) {
      setShowNotification(false);
    }
  }, [isOpen]);

  const [messages, setMessages] = useState<any[]>([]);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userMessage.trim()) return;

    const currentMsg = userMessage;
    const msgObj = { from: "user", text: currentMsg, timestamp: new Date() };
    setMessages(prev => [...prev, msgObj]);
    setUserMessage("");
    setIsSent(true);

    try {
      const res = await fetch("/api/whatsapp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          text: `Nome: ${userName || "Anónimo"}\nMensagem: ${currentMsg}` 
        })
      });
      
      if (!res.ok) throw new Error("API failed");
      
      // Simular resposta automática curta
      setTimeout(() => {
        setMessages(prev => [...prev, { 
          from: "admin", 
          text: "Recebemos a sua mensagem! Um dos nossos especialistas irá responder em breve no seu WhatsApp.", 
          timestamp: new Date() 
        }]);
        setIsSent(false);
      }, 1500);

    } catch (error) {
      console.error("Erro ao enviar via API:", error);
      // Fallback discreto
      const phoneNumber = socials?.whatsapp?.replace(/\s/g, '').replace(/\+/g, '') || "351912345678";
      const finalMsg = `Olá! Sou o ${userName || "um cliente"}.\n\n${currentMsg}`;
      window.open(`https://wa.me/${phoneNumber}?text=${encodeURIComponent(finalMsg)}`, "_blank");
      setIsSent(false);
    }
  };

  // Removido o check estrito para garantir que o componente monta
  // if (!socials?.whatsapp) return null;

  return (
    <div className="wa-widget-wrapper">
      {/* Notificação Flutuante */}
      {showNotification && !isOpen && (
        <div className="wa-notification" onClick={() => setIsOpen(true)}>
          <div className="wa-notification-content">
            <span className="wa-notification-badge">1</span>
            Olá! Alguma dúvida sobre os nossos produtos?
          </div>
        </div>
      )}

      {/* Janela de Chat Premium */}
      <div className={`wa-chat-window ${isOpen ? 'open' : ''}`}>
        <div className="wa-header">
          <div className="wa-header-info">
            <div className="wa-avatar">
              <img src="/next.svg" alt="Vila CBD" className="wa-avatar-img" style={{ filter: "invert(1) brightness(2)" }} />
              <span className="wa-status-dot"></span>
            </div>
            <div className="wa-header-text">
              <span className="wa-name">Vila Cãnhamo</span>
              <span className="wa-status">Online • Suporte Especializado</span>
            </div>
          </div>
          <button className="wa-close-btn" onClick={() => setIsOpen(false)}>×</button>
        </div>

        <div className="wa-body">
          <div className="wa-message-received">
            <div className="wa-msg-bubble">
              Olá! 🌱 Seja bem-vindo à <strong>Vila Cãnhamo</strong>.<br/><br/>
              Como podemos ajudar hoje? Conte-nos a sua dúvida ou o que procura.
              <span className="wa-msg-time">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          </div>

          {messages.map((msg, i) => (
            <div key={i} className={msg.from === "user" ? "wa-message-sent" : "wa-message-received"}>
              <div className={msg.from === "user" ? "wa-msg-bubble-sent" : "wa-msg-bubble"}>
                {msg.text}
                <span className="wa-msg-time">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            </div>
          ))}

          <div ref={chatEndRef} />
        </div>

        <div className="wa-footer">
          <form onSubmit={handleSend} className="wa-form">
            <input 
              type="text" 
              placeholder="O seu nome (opcional)" 
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="wa-input-name"
            />
            <div className="wa-input-container">
              <textarea 
                placeholder="Escreva a sua mensagem..." 
                value={userMessage}
                onChange={(e) => setUserMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleStartChat(e);
                  }
                }}
                className="wa-textarea"
                required
              />
              <button type="submit" className="wa-send-btn">
                <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                  <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"></path>
                </svg>
              </button>
            </div>
          </form>
          <p className="wa-footer-note">Ao clicar, será aberto o WhatsApp.</p>
        </div>
      </div>

      {/* Botão de Trigger */}
      <button 
        className={`wa-trigger-btn ${isOpen ? 'active' : ''}`} 
        onClick={() => {
          console.log("WhatsApp Trigger Clicked! Current State:", !isOpen);
          setIsOpen(!isOpen);
        }}
        aria-label="Abrir chat de WhatsApp"
        style={{ zIndex: 999999 }}
      >
        <div className="wa-icon-container">
          <svg className="wa-icon-svg" viewBox="0 0 448 512" width="28" height="28" fill="currentColor">
            <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-5.5-2.8-23.2-8.5-44.2-27.3-16.3-14.5-27.3-32.5-30.5-38s-.3-8.4 2.4-11.2c2.5-2.5 5.5-6.5 8.3-9.7 2.8-3.3 3.7-5.6 5.6-9.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 13.2 5.7 23.5 9.2 31.6 11.8 13.3 4.2 25.4 3.6 34.9 2.2 10.6-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z"/>
          </svg>
        </div>
        <div className="wa-pulse"></div>
      </button>
    </div>
  );
}
