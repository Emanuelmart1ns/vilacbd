"use client";

import React from "react";
import Link from "next/link";
import "./legal-section.css";

const legalItems = [
  {
    icon: "⚖️",
    title: "Regulamento (UE) 1307/2013",
    text: "Estabelece as regras para pagamentos diretos aos agricultores ao abrigo de regimes de apoio no âmbito da PAC, permitindo o cultivo de cânhamo industrial.",
    link: "https://eur-lex.europa.eu/legal-content/PT/TXT/?uri=CELEX:32013R1307"
  },
  {
    icon: "📜",
    title: "Decreto-Lei n.º 15/93",
    text: "Legislação portuguesa que exclui do seu âmbito de aplicação as variedades de Cannabis Sativa L. destinadas a fins industriais com baixo teor de THC.",
    link: "https://diariodarepublica.pt/dr/detalhe/decreto-lei/15-1993-239634"
  },
  {
    icon: "🛡️",
    title: "Acórdão Kanavape (UE)",
    text: "O Tribunal de Justiça da UE confirmou que o CBD não é um entorpecente e que a sua livre circulação entre Estados-Membros é protegida por lei.",
    link: "https://curia.europa.eu/jcms/upload/docs/application/pdf/2020-11/cp200141pt.pdf"
  }
];

export default function LegalSection() {
  return (
    <section className="legal-separator">
      <div className="legal-container">
        <div className="legal-header fade-in">
          <span className="legal-badge">Conformidade Legal</span>
          <h2 className="legal-title">Compromisso com a Legalidade</h2>
          <p className="legal-subtitle">
            Garantimos que todos os nossos produtos e operações estão em estrita conformidade 
            com a legislação portuguesa e europeia vigente.
          </p>
        </div>

        <div className="legal-grid">
          {legalItems.map((item, index) => (
            <div 
              key={index} 
              className="legal-card fade-in" 
              style={{ animationDelay: `${index * 0.2}s` }}
            >
              <span className="legal-icon">{item.icon}</span>
              <h3 className="legal-card-title">{item.title}</h3>
              <p className="legal-card-text">{item.text}</p>
              <a 
                href={item.link} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="legal-link"
              >
                Ler Documento Oficial <span>→</span>
              </a>
            </div>
          ))}
        </div>

        <div className="legal-footer fade-in" style={{ animationDelay: "0.6s" }}>
          <Link href="/legislacao" className="btn-secondary">
            Ver Legislação Completa
          </Link>
        </div>
      </div>
    </section>
  );
}
