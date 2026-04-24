"use client";

import React, { useState, useEffect } from "react";
import "./construction-banner.css";

export default function ConstructionBanner() {
  const [showSplash, setShowSplash] = useState(true);
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    // Start fading out slightly before 5 seconds
    const fadeTimer = setTimeout(() => {
      setIsFadingOut(true);
    }, 4500);

    // Remove from DOM after 5 seconds
    const removeTimer = setTimeout(() => {
      setShowSplash(false);
    }, 5000);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, []);

  return (
    <>
      {/* Top Persistent Warning Bar */}
      <div className="construction-top-bar">
        <span>⚠️ Página em Construção | Beta v1.0 🏗️</span>
      </div>

      {/* 5-second Splash Overlay */}
      {showSplash && (
        <div className={`construction-overlay ${isFadingOut ? "fade-out" : ""}`}>
          <div className="construction-modal glass-panel">
            <div className="construction-content">
              <span className="construction-icon">✨</span>
              <h2>Vila Cãnhamo</h2>
              <p>Estamos a preparar a melhor seleção de produtos premium para si.</p>
              <div className="construction-timer-bar">
                <div className="timer-progress"></div>
              </div>
              <p style={{ fontSize: '0.8rem', marginTop: '10px', opacity: 0.7 }}>
                A fechar automaticamente em 5 segundos...
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
