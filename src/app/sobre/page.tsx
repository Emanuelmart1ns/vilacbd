"use client";

import React from "react";
import Navbar from "@/components/Navbar";
import Link from "next/link";

export default function SobrePage() {
  return (
    <main style={{ minHeight: "100vh", backgroundColor: "var(--bg-primary)" }}>
      <Navbar />

      {/* Hero Section */}
      <section style={{ padding: "120px 0 80px", background: "linear-gradient(180deg, var(--bg-primary) 0%, var(--bg-secondary) 100%)" }}>
        <div className="container">
          <div style={{ textAlign: "center", maxWidth: "800px", margin: "0 auto" }}>
            <h1 style={{ fontSize: "3.5rem", color: "var(--accent-gold)", marginBottom: "24px", lineHeight: "1.2" }}>
              Sobre a Vila Cãnhamo
            </h1>
            <p style={{ fontSize: "1.2rem", color: "var(--text-secondary)", lineHeight: "1.8" }}>
              Somos uma empresa dedicada a oferecer produtos premium de cânhamo com qualidade certificada e testada em laboratório. 
              A nossa missão é proporcionar bem-estar natural através de produtos de excelência.
            </p>
          </div>
        </div>
      </section>

      {/* Valores / Features */}
      <section style={{ padding: "80px 0", background: "var(--bg-secondary)" }}>
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: "60px" }}>
            <h2 style={{ fontSize: "2.5rem", color: "var(--accent-gold)", marginBottom: "16px" }}>Os Nossos Valores</h2>
            <p style={{ color: "var(--text-secondary)", fontSize: "1.1rem" }}>
              Compromisso com a qualidade e transparência em cada produto
            </p>
          </div>

          <div className="features-grid">
            <div className="feature-item">
              <div className="feature-icon" style={{ color: "var(--accent-gold)" }}>🌿</div>
              <h3>100% Orgânico</h3>
              <p>Todos os nossos produtos são cultivados sem pesticidas ou químicos nocivos, respeitando a natureza e a sua saúde.</p>
            </div>
            <div className="feature-item">
              <div className="feature-icon" style={{ color: "var(--accent-gold)" }}>🔬</div>
              <h3>Testado em Laboratório</h3>
              <p>Cada lote é acompanhado de certificado de análise de laboratórios suíços, garantindo pureza e concentração.</p>
            </div>
            <div className="feature-item">
              <div className="feature-icon" style={{ color: "var(--accent-gold)" }}>⚡</div>
              <h3>Efeito Rápido</h3>
              <p>Utilizamos extração Full Spectrum de alta qualidade para máxima absorção e eficácia dos compostos naturais.</p>
            </div>
            <div className="feature-item">
              <div className="feature-icon" style={{ color: "var(--accent-gold)" }}>🏆</div>
              <h3>Qualidade Premium</h3>
              <p>Selecionamos apenas os melhores fornecedores europeus para garantir produtos de excelência.</p>
            </div>
            <div className="feature-item">
              <div className="feature-icon" style={{ color: "var(--accent-gold)" }}>🤝</div>
              <h3>Atendimento Personalizado</h3>
              <p>A nossa equipa está sempre disponível para esclarecer dúvidas e ajudar na escolha do produto ideal.</p>
            </div>
            <div className="feature-item">
              <div className="feature-icon" style={{ color: "var(--accent-gold)" }}>📦</div>
              <h3>Entrega Rápida</h3>
              <p>Envios discretos e seguros para todo o país, com rastreamento completo do seu pedido.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Nossa História */}
      <section style={{ padding: "80px 0" }}>
        <div className="container">
          <div style={{ maxWidth: "900px", margin: "0 auto" }}>
            <h2 style={{ fontSize: "2.5rem", color: "var(--accent-gold)", marginBottom: "32px", textAlign: "center" }}>
              A Nossa História
            </h2>
            <div style={{ background: "rgba(255,255,255,0.03)", padding: "40px", borderRadius: "16px", border: "1px solid var(--glass-border)" }}>
              <p style={{ color: "var(--text-primary)", fontSize: "1.1rem", lineHeight: "1.8", marginBottom: "24px" }}>
                A Vila Cãnhamo nasceu da paixão por produtos naturais e do desejo de trazer para Santa Maria da Feira 
                uma seleção premium de produtos de cânhamo de alta qualidade.
              </p>
              <p style={{ color: "var(--text-primary)", fontSize: "1.1rem", lineHeight: "1.8", marginBottom: "24px" }}>
                Acreditamos no poder terapêutico das plantas e na importância de oferecer produtos seguros, testados 
                e certificados. Cada produto na nossa loja é cuidadosamente selecionado e passa por rigorosos testes 
                de qualidade em laboratórios europeus.
              </p>
              <p style={{ color: "var(--text-primary)", fontSize: "1.1rem", lineHeight: "1.8" }}>
                Hoje, somos uma referência em Santa Maria da Feira, oferecendo desde óleos e flores até cosméticos 
                e acessórios, sempre com o compromisso de qualidade e transparência que nos define.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Localização */}
      <section style={{ padding: "80px 0", background: "var(--bg-secondary)" }}>
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: "60px" }}>
            <h2 style={{ fontSize: "2.5rem", color: "var(--accent-gold)", marginBottom: "16px" }}>Visite-nos</h2>
            <p style={{ color: "var(--text-secondary)", fontSize: "1.1rem" }}>
              Venha conhecer a nossa loja física em Santa Maria da Feira
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr", gap: "40px", alignItems: "center" }}>
            <div style={{ textAlign: "left" }}>
              <p style={{ color: "var(--text-primary)", fontSize: "1.1rem", marginBottom: "24px" }}>
                📍 <strong>Vila Cãnhamo Santa Maria da Feira</strong><br/>
                Rua Dr. Roberto Alves 56, <br/>
                4520-213 Santa Maria da Feira
              </p>
              <div style={{ background: "rgba(255,255,255,0.03)", padding: "20px", borderRadius: "12px", border: "1px solid var(--glass-border)", marginBottom: "24px" }}>
                <h4 style={{ marginBottom: "12px", color: "var(--accent-green-light)" }}>Horário de Funcionamento</h4>
                <ul style={{ listStyle: "none", padding: 0, fontSize: "0.9rem", color: "var(--text-secondary)" }}>
                  <li style={{ marginBottom: "8px" }}>📅 Segunda a Sexta: 10:00 - 13:00 | 14:30 - 19:00</li>
                  <li>📅 Sábado: 10:00 - 13:00</li>
                </ul>
              </div>
              <Link href="/loja" className="btn-primary" style={{ display: "inline-block" }}>
                Ver Produtos
              </Link>
            </div>
            
            <div style={{ borderRadius: "16px", overflow: "hidden", border: "2px solid var(--glass-border)", height: "400px", boxShadow: "0 8px 32px rgba(0,0,0,0.4)" }}>
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3014.5678!2d-8.5432!3d40.9254!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xd2385...!2sSanta%20Maria%20da%20Feira!5e0!3m2!1spt-PT!2spt!4v171396...!&style=feature:all|element:geometry|color:0x242f3e&style=feature:all|element:labels.text.stroke|color:0x242f3e&style=feature:all|element:labels.text.fill|color:0x746855&style=feature:water|element:geometry|color:0x17263c" 
                width="100%" 
                height="100%" 
                style={{ border: 0, filter: "invert(90%) hue-rotate(180deg) brightness(95%) contrast(85%)" }} 
                allowFullScreen={true} 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
