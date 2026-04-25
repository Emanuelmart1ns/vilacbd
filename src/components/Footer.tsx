"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import "./footer.css";

export default function Footer() {
  const pathname = usePathname();
  
  // Não mostrar footer em admin, login ou checkout
  if (pathname?.startsWith("/admin") || pathname === "/login" || pathname === "/checkout") {
    return null;
  }
  return (
    <footer className="site-footer">
      <div className="footer-container">
        <div className="footer-grid">
          {/* Coluna 1 - Marca */}
          <div className="footer-col">
            <h3 className="footer-logo">Vila Cãnhamo</h3>
            <p className="footer-desc">
              A melhor seleção de produtos Cãnhamo premium em Santa Maria da Feira.
            </p>
          </div>

          {/* Coluna 2 - Links */}
          <div className="footer-col">
            <h4>Navegação</h4>
            <ul>
              <li><Link href="/">Início</Link></li>
              <li><Link href="/loja">Loja</Link></li>
              <li><Link href="/#sobre">Sobre Nós</Link></li>
            </ul>
          </div>

          {/* Coluna 3 - Contacto */}
          <div className="footer-col">
            <h4>Contacto</h4>
            <ul>
              <li>📍 Rua Dr. Roberto Alves 56</li>
              <li>4520-213 Santa Maria da Feira</li>
              <li>📞 +351 912 345 678</li>
              <li>✉️ info@vilacbd.com</li>
            </ul>
          </div>

          {/* Coluna 4 - Horário */}
          <div className="footer-col">
            <h4>Horário</h4>
            <ul>
              <li>Seg-Sex: 10:00 - 13:00 | 14:30 - 19:00</li>
              <li>Sábado: 10:00 - 13:00</li>
              <li>Domingo: Encerrado</li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} Vila Cãnhamo. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
