"use client";

import React from "react";
import "./construction-banner.css";

export default function ConstructionBanner() {
  return (
    <>
      {/* Top Persistent Warning Bar */}
      <div className="construction-top-bar">
        <span>⚠️ Página em Construção | Beta v1.0 🏗️</span>
      </div>

      {/* Persistent Splash Overlay - Fixed and unclosable */}
      <div className="construction-overlay">
        <div className="construction-modal glass-panel">
          <div className="construction-content">
            <h2 className="construction-title">Vila CBD</h2>
            <p>Estamos a preparar a melhor seleção de produtos premium para si.</p>
            <p style={{ 
              fontSize: '1rem', 
              marginTop: '20px', 
              color: 'var(--accent-gold)',
              fontWeight: '500',
              letterSpacing: '0.05em'
            }}>
              VOLTAMOS EM BREVE! 🚀
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
