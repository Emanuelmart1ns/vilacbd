"use client";

import React, { useState, useEffect, useRef } from "react";
import "./chat-widget.css";

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [userName, setUserName] = useState("");
  const [userMessage, setUserMessage] = useState("");
  const [settings, setSettings] = useState<any>(null);
  const [isSent, setIsSent] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/settings")
      .then(res => res.json())
      .then(data => {
        setSettings(data);
      })
      .catch(err => console.error("Erro ao carregar definições no widget:", err));

    const handleOpenChat = () => setIsOpen(true);
    window.addEventListener('openWhatsAppChat', handleOpenChat); // Mantemos o nome do evento para compatibilidade com a navbar por agora
    
    const timer = setTimeout(() => {
      setShowNotification(true);
    }, 8000);

    return () => {
      window.removeEventListener('openWhatsAppChat', handleOpenChat);
      clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    if (isOpen) setShowNotification(false);
  }, [isOpen]);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isTyping]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userMessage.trim()) return;

    const currentMsg = userMessage;
    const msgObj = { from: "user", text: currentMsg, timestamp: new Date() };
    setMessages(prev => [...prev, msgObj]);
    setUserMessage("");

    try {
      setIsTyping(true);
      const res = await fetch("/api/telegram/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          name: userName || "Anónimo",
          text: currentMsg 
        })
      });
      
      if (!res.ok) throw new Error("API failed");
      
      setTimeout(() => {
        setIsTyping(false);
        setMessages(prev => [...prev, { 
          from: "bot", 
          text: "Mensagem enviada com sucesso! ✅ Já notifiquei a nossa equipa. Responderemos o mais breve possível.", 
          timestamp: new Date() 
        }]);
      }, 1500);

    } catch (error) {
      console.error("Erro ao enviar via Telegram:", error);
      setIsTyping(false);
      setMessages(prev => [...prev, { 
        from: "bot", 
        text: "Pedimos desculpa, mas houve um erro técnico. Por favor, tente contactar-nos por email ou telefone.", 
        timestamp: new Date() 
      }]);
    }
  };

  return (
    <div className="chat-widget-wrapper">
      {/* Notificação Flutuante */}
      {showNotification && !isOpen && (
        <div className="chat-notification" onClick={() => setIsOpen(true)}>
          <div className="chat-notification-content">
            <span className="chat-notification-badge">1</span>
            Olá! Alguma dúvida? Estou aqui para ajudar. 🌱
          </div>
        </div>
      )}

      {/* Janela de Chat Premium */}
      <div className={`chat-window ${isOpen ? 'open' : ''}`}>
        <div className="chat-header">
          <div className="chat-header-info">
            <div className="chat-avatar">
              <span className="chat-avatar-icon">🤖</span>
              <span className="chat-status-dot"></span>
            </div>
            <div className="chat-header-text">
              <span className="chat-name">Vila Bot</span>
              <span className="chat-status">Assistente Virtual • Vila Cãnhamo</span>
            </div>
          </div>
          <button className="chat-close-btn" onClick={() => setIsOpen(false)}>×</button>
        </div>

        <div className="chat-body">
          <div className="chat-message-received">
            <div className="chat-msg-bubble">
              Olá! 🌱 Sou o <strong>Vila Bot</strong>.<br/><br/>
              Diga-nos o que procura ou as suas dúvidas e eu encaminharei imediatamente para a nossa equipa de suporte.
              <span className="chat-msg-time">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          </div>

          {messages.map((msg, i) => (
            <div key={i} className={msg.from === "user" ? "chat-message-sent" : "chat-message-received"}>
              <div className={msg.from === "user" ? "chat-msg-bubble-sent" : "chat-msg-bubble"}>
                {msg.text}
                <span className="chat-msg-time">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="chat-message-received">
              <div className="chat-msg-bubble chat-typing">
                <span className="dot"></span>
                <span className="dot"></span>
                <span className="dot"></span>
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        <div className="chat-footer">
          <form onSubmit={handleSend} className="chat-form">
            <input 
              type="text" 
              placeholder="O seu nome (opcional)" 
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="chat-input-name"
            />
            <div className="chat-input-container">
              <textarea 
                placeholder="Escreva a sua mensagem..." 
                value={userMessage}
                onChange={(e) => setUserMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend(e);
                  }
                }}
                className="chat-textarea"
                required
              />
              <button type="submit" className="chat-send-btn">
                <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                  <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"></path>
                </svg>
              </button>
            </div>
          </form>
          <p className="chat-footer-note">A sua mensagem será enviada de forma segura.</p>
        </div>
      </div>

      {/* Botão de Trigger */}
      <button 
        className={`chat-trigger-btn ${isOpen ? 'active' : ''}`} 
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Abrir chat de suporte"
        style={{ zIndex: 999999 }}
      >
        <div className="chat-icon-container">
          {isOpen ? (
            <span style={{ fontSize: "1.5rem", fontWeight: "bold" }}>×</span>
          ) : (
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
          )}
        </div>
        {!isOpen && <div className="chat-pulse"></div>}
      </button>
    </div>
  );
}
