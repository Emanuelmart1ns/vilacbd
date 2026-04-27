"use client";

import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";

export default function LegislacaoPage() {
  return (
    <main style={{ minHeight: "100vh", backgroundColor: "var(--bg-primary)" }}>
      <Navbar />

      <section style={{ padding: "120px 0 60px", background: "linear-gradient(180deg, var(--bg-primary) 0%, var(--bg-secondary) 100%)" }}>
        <div className="container">
          <div style={{ textAlign: "center", maxWidth: "900px", margin: "0 auto" }}>
            <h1 style={{ fontSize: "4rem", color: "var(--accent-gold)", marginBottom: "24px", lineHeight: "1.2" }}>
              Enquadramento Legal
            </h1>
            <p style={{ fontSize: "1.25rem", color: "var(--text-secondary)", lineHeight: "1.8" }}>
              Transparência e segurança jurídica são os pilares da nossa operação. 
              Aqui pode consultar os principais diplomas e decisões que regulam o setor do cânhamo em Portugal e na União Europeia.
            </p>
          </div>
        </div>
      </section>

      <section style={{ padding: "80px 0" }}>
        <div className="container">
          <div style={{ display: "grid", gap: "40px", maxWidth: "1000px", margin: "0 auto" }}>
            
            {/* Bloco 1: Legislação Nacional */}
            <div className="glass-panel" style={{ padding: "40px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "15px", marginBottom: "25px" }}>
                <span style={{ fontSize: "2rem" }}>🇵🇹</span>
                <h2 style={{ fontSize: "2rem", color: "var(--accent-gold)" }}>Legislação Nacional</h2>
              </div>
              
              <div style={{ display: "grid", gap: "30px" }}>
                <div>
                  <h3 style={{ color: "var(--text-primary)", marginBottom: "10px" }}>Decreto-Lei n.º 15/93</h3>
                  <p style={{ color: "var(--text-secondary)", lineHeight: "1.7", marginBottom: "15px" }}>
                    A lei de combate à droga em Portugal estabelece no seu Artigo 2.º que as substâncias listadas nas Tabelas I a IV são proibidas. 
                    No entanto, as variedades de cânhamo para fins industriais, com teores de THC (Tetrahidrocanabinol) inferiores aos limites 
                    estabelecidos pela UE, são excluídas destas restrições quando devidamente autorizadas.
                  </p>
                  <a 
                    href="https://href.li/?https://diariodarepublica.pt/dr/detalhe/decreto-lei/15-1993-585178" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="btn-text"
                  >
                    Diário da República →
                  </a>
                </div>

                <div style={{ borderTop: "1px solid var(--glass-border)", paddingTop: "30px" }}>
                  <h3 style={{ color: "var(--text-primary)", marginBottom: "10px" }}>Portaria n.º 83/2021</h3>
                  <p style={{ color: "var(--text-secondary)", lineHeight: "1.7", marginBottom: "15px" }}>
                    Define os requisitos e procedimentos para a autorização do cultivo de variedades de cânhamo industrial em Portugal. 
                    Estabelece as competências da DGAV (Direção-Geral de Alimentação e Veterinária) e as normas de controlo e fiscalização.
                  </p>
                  <a 
                    href="https://href.li/?https://diariodarepublica.pt/dr/detalhe/portaria/83-2021-161433504" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="btn-text"
                  >
                    Consultar Portaria →
                  </a>
                </div>
              </div>
            </div>

            {/* Bloco 2: Legislação Europeia */}
            <div className="glass-panel" style={{ padding: "40px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "15px", marginBottom: "25px" }}>
                <span style={{ fontSize: "2rem" }}>🇪🇺</span>
                <h2 style={{ fontSize: "2rem", color: "var(--accent-gold)" }}>Legislação Europeia</h2>
              </div>
              
              <div style={{ display: "grid", gap: "30px" }}>
                <div>
                  <h3 style={{ color: "var(--text-primary)", marginBottom: "10px" }}>Regulamento (UE) n.º 1307/2013 e 1308/2013</h3>
                  <p style={{ color: "var(--text-secondary)", lineHeight: "1.7", marginBottom: "15px" }}>
                    Estabelecem as normas comuns de mercado para os produtos agrícolas. Recentemente, a UE elevou o limite de THC permitido 
                    para o cultivo de cânhamo industrial de 0.2% para 0.3%, refletindo a evolução do mercado e a segurança destes produtos.
                  </p>
                  <a href="https://eur-lex.europa.eu/legal-content/PT/TXT/?uri=CELEX:32013R1307" target="_blank" className="btn-text">Ver no EUR-Lex →</a>
                </div>

                <div style={{ borderTop: "1px solid var(--glass-border)", paddingTop: "30px" }}>
                  <h3 style={{ color: "var(--text-primary)", marginBottom: "10px" }}>Acórdão do Tribunal de Justiça (C-663/18 - Kanavape)</h3>
                  <p style={{ color: "var(--text-secondary)", lineHeight: "1.7", marginBottom: "15px" }}>
                    Decisão histórica de 19 de novembro de 2020, onde o tribunal superior da UE declarou que o CBD extraído da planta 
                    inteira de cannabis não é um estupefaciente e que um Estado-Membro não pode proibir a comercialização de CBD 
                    legalmente produzido noutro Estado-Membro.
                  </p>
                  <a href="https://curia.europa.eu/juris/document/document.jsf?text=&docid=233925&pageIndex=0&doclang=PT&mode=lst&dir=&occ=first&part=1&cid=14467140" target="_blank" className="btn-text">Ler Acórdão na íntegra →</a>
                </div>
              </div>
            </div>

            {/* Nota de Isenção */}
            <div style={{ textAlign: "center", padding: "40px", color: "var(--text-secondary)", fontSize: "0.9rem" }}>
              <p>
                <strong>Aviso:</strong> A informação aqui contida é meramente informativa e não constitui aconselhamento jurídico profissional. 
                A legislação pode sofrer alterações e deve ser sempre confirmada através dos canais oficiais do Estado e da União Europeia.
              </p>
            </div>

          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
