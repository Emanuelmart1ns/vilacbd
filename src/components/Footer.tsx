"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import "./footer.css";

export default function Footer() {
  const pathname = usePathname();

  if (pathname?.startsWith("/admin") || pathname === "/login" || pathname === "/checkout") {
    return null;
  }
  return (
    <footer className="site-footer">
      <div className="footer-container">
        <div className="footer-grid">
          <div className="footer-col">
            <h3 className="footer-logo">Vila CBD</h3>
            <p className="footer-desc">
              Produtos de cânhamo premium em Santa Maria da Feira. Qualidade certificada e testada em laboratório.
            </p>
          </div>

          <div className="footer-col">
            <h4>Informação</h4>
            <ul>
              <li><Link href="/">Início</Link></li>
              <li><Link href="/loja">Loja</Link></li>
              <li><Link href="/sobre">Sobre Nós &amp; Contactos</Link></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Legal</h4>
            <ul>
              <li><Link href="/sobre#termos">Termos e Condições</Link></li>
              <li><Link href="/sobre#privacidade">Política de Privacidade</Link></li>
              <li><Link href="/sobre#idade">Verificação de Idade</Link></li>
              <li><Link href="/sobre#devolucoes">Política de Devoluções</Link></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Compliance</h4>
            <ul>
              <li><Link href="/sobre#regulamentacao">Regulamentação CBD</Link></li>
              <li><Link href="/sobre#thc">Teor de THC &lt;0,2%</Link></li>
              <li><Link href="/sobre#laboratorio">Certificados Laboratoriais</Link></li>
              <li><Link href="/sobre#isencao">Isenção de Responsabilidade</Link></li>
            </ul>
          </div>
        </div>

        <div className="footer-legal">
          <p>
            Os produtos vendidos neste website contêm CBD (canabidiol) derivado de cânhamo industrial com teor de THC inferior a 0,2%, 
            em conformidade com o Regulamento (UE) 2023/915 e a legislação portuguesa em vigor. 
            Os produtos de CBD não são medicamentos e não substituem consultas ou tratamentos médicos.
          </p>
          <p>
            A venda de produtos de cânhamo é destinada exclusivamente a maiores de 18 anos. 
            A Vila CBD reserva-se o direito de recusar vendas a menores de idade.
          </p>
        </div>

        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} Vila CBD. Todos os direitos reservados a VilaCBD</p>
        </div>
      </div>
    </footer>
  );
}
