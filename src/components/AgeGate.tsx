"use client";

import React, { useState } from "react";
import "./age-gate.css";

const AGE_GATE_KEY = "vilacbd-age-verified";

function getInitialVerified(): boolean | null {
  if (typeof window === "undefined") return null;
  const stored = sessionStorage.getItem(AGE_GATE_KEY);
  return stored === "true" ? true : false;
}

export default function AgeGate({ children }: { children: React.ReactNode }) {
  const [verified, setVerified] = useState<boolean | null>(getInitialVerified);
  const [denied, setDenied] = useState(false);
  const [year, setYear] = useState("");
  const [month, setMonth] = useState("");
  const [day, setDay] = useState("");

  const handleConfirm = () => {
    if (!year || !month || !day) return;

    const birthDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    if (age >= 18) {
      sessionStorage.setItem(AGE_GATE_KEY, "true");
      setVerified(true);
    } else {
      setDenied(true);
    }
  };

  const handleQuickConfirm = () => {
    sessionStorage.setItem(AGE_GATE_KEY, "true");
    setVerified(true);
  };

  if (verified === null) return null;

  if (verified) return <>{children}</>;

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 100 }, (_, i) => currentYear - 18 - i);
  const months = [
    { value: "1", label: "Janeiro" }, { value: "2", label: "Fevereiro" },
    { value: "3", label: "Março" }, { value: "4", label: "Abril" },
    { value: "5", label: "Maio" }, { value: "6", label: "Junho" },
    { value: "7", label: "Julho" }, { value: "8", label: "Agosto" },
    { value: "9", label: "Setembro" }, { value: "10", label: "Outubro" },
    { value: "11", label: "Novembro" }, { value: "12", label: "Dezembro" },
  ];
  const days = Array.from({ length: 31 }, (_, i) => String(i + 1));

  return (
    <div className="age-gate">
      <div className="age-gate-bg" />
      <div className="age-gate-overlay" />

      <div className="age-gate-content">
        {!denied ? (
          <>
            <div className="age-gate-logo">
              <span className="age-gate-logo-icon">&#9752;</span>
              <h1 className="age-gate-title">Vila CBD</h1>
              <p className="age-gate-subtitle">Premium CBD &amp; Cânhamo</p>
            </div>

            <div className="age-gate-divider" />

            <div className="age-gate-message">
              <h2>Verificação de Idade</h2>
              <p>
                Este website contém informação sobre produtos de cânhamo e CBD.
                Para aceder, confirme que tem <strong>18 anos ou mais</strong>.
              </p>
            </div>

            <div className="age-gate-dob">
              <p className="age-gate-dob-label">Data de nascimento</p>
              <div className="age-gate-dob-fields">
                <select value={day} onChange={(e) => setDay(e.target.value)} className="age-gate-select">
                  <option value="" disabled>Dia</option>
                  {days.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
                <select value={month} onChange={(e) => setMonth(e.target.value)} className="age-gate-select">
                  <option value="" disabled>Mês</option>
                  {months.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                </select>
                <select value={year} onChange={(e) => setYear(e.target.value)} className="age-gate-select">
                  <option value="" disabled>Ano</option>
                  {years.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
            </div>

            <button
              className="age-gate-btn age-gate-btn-primary"
              onClick={handleConfirm}
              disabled={!year || !month || !day}
            >
              Confirmar Idade
            </button>

            <div className="age-gate-or">
              <span>ou</span>
            </div>

            <button className="age-gate-btn age-gate-btn-quick" onClick={handleQuickConfirm}>
              Tenho 18+ anos
            </button>

            <p className="age-gate-disclaimer">
              Ao entrar, confirma que tem idade legal para consumir produtos de cânhamo
              no seu país de residência. Os nossos produtos contêm THC abaixo do limite
              legal de 0,2%, em conformidade com a legislação europeia.
            </p>
          </>
        ) : (
          <div className="age-gate-denied">
            <span className="age-gate-denied-icon">&#9888;</span>
            <h2>Acesso Negado</h2>
            <p>
              Lamentamos, mas precisa de ter 18 anos ou mais para aceder a este website.
            </p>
            <p className="age-gate-denied-sub">
              Os produtos de cânhamo e CBD são destinados exclusivamente a maiores de idade,
              em conformidade com a legislação em vigor.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
