"use client";

import React from "react";
import Navbar from "@/components/Navbar";

export default function SobrePage() {
  return (
    <main style={{ minHeight: "100vh", backgroundColor: "var(--bg-primary)" }}>
      <Navbar />

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
              <div className="feature-icon" style={{ color: "var(--accent-gold)" }}>&#127807;</div>
              <h3>100% Orgânico</h3>
              <p>Todos os nossos produtos são cultivados sem pesticidas ou químicos nocivos, respeitando a natureza e a sua saúde.</p>
            </div>
            <div className="feature-item">
              <div className="feature-icon" style={{ color: "var(--accent-gold)" }}>&#128300;</div>
              <h3>Testado em Laboratório</h3>
              <p>Cada lote é acompanhado de certificado de análise de laboratórios suíços, garantindo pureza e concentração.</p>
            </div>
            <div className="feature-item">
              <div className="feature-icon" style={{ color: "var(--accent-gold)" }}>&#9889;</div>
              <h3>Efeito Rápido</h3>
              <p>Utilizamos extração Full Spectrum de alta qualidade para máxima absorção e eficácia dos compostos naturais.</p>
            </div>
            <div className="feature-item">
              <div className="feature-icon" style={{ color: "var(--accent-gold)" }}>&#127942;</div>
              <h3>Qualidade Premium</h3>
              <p>Selecionamos apenas os melhores fornecedores europeus para garantir produtos de excelência.</p>
            </div>
            <div className="feature-item">
              <div className="feature-icon" style={{ color: "var(--accent-gold)" }}>&#129309;</div>
              <h3>Atendimento Personalizado</h3>
              <p>A nossa equipa está sempre disponível para esclarecer dúvidas e ajudar na escolha do produto ideal.</p>
            </div>
            <div className="feature-item">
              <div className="feature-icon" style={{ color: "var(--accent-gold)" }}>&#128230;</div>
              <h3>Entrega Rápida</h3>
              <p>Envios discretos e seguros para todo o país, com rastreamento completo do seu pedido.</p>
            </div>
          </div>
        </div>
      </section>

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

      <section style={{ padding: "80px 0", background: "var(--bg-secondary)" }}>
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: "60px" }}>
            <h2 style={{ fontSize: "2.5rem", color: "var(--accent-gold)", marginBottom: "16px" }}>Contactos</h2>
            <p style={{ color: "var(--text-secondary)", fontSize: "1.1rem" }}>
              Visite-nos ou entre em contacto connosco
            </p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "40px", maxWidth: "900px", margin: "0 auto" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              <div style={{ background: "rgba(255,255,255,0.03)", padding: "24px", borderRadius: "14px", border: "1px solid var(--glass-border)" }}>
                <h4 style={{ color: "var(--accent-gold)", marginBottom: "16px" }}>Morada</h4>
                <p style={{ color: "var(--text-primary)", lineHeight: "1.6" }}>
                  Rua Dr. Roberto Alves 56<br />
                  4520-213 Santa Maria da Feira<br />
                  Portugal
                </p>
              </div>
              <div style={{ background: "rgba(255,255,255,0.03)", padding: "24px", borderRadius: "14px", border: "1px solid var(--glass-border)" }}>
                <h4 style={{ color: "var(--accent-gold)", marginBottom: "16px" }}>Telefone &amp; Email</h4>
                <p style={{ color: "var(--text-primary)", lineHeight: "1.8" }}>
                  +351 912 345 678<br />
                  info@vilacbd.com
                </p>
              </div>
              <div style={{ background: "rgba(255,255,255,0.03)", padding: "24px", borderRadius: "14px", border: "1px solid var(--glass-border)" }}>
                <h4 style={{ color: "var(--accent-gold)", marginBottom: "16px" }}>Hor&aacute;rio</h4>
                <p style={{ color: "var(--text-primary)", lineHeight: "1.8" }}>
                  Seg-Sex: 10:00 - 13:00 | 14:30 - 19:00<br />
                  S&aacute;bado: 10:00 - 13:00<br />
                  Domingo: Encerrado
                </p>
              </div>
            </div>
            <div style={{ borderRadius: "16px", overflow: "hidden", border: "2px solid var(--glass-border)", height: "100%", minHeight: "400px", boxShadow: "0 8px 32px rgba(0,0,0,0.4)" }}>
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

      <section id="termos" style={{ padding: "80px 0" }}>
        <div className="container">
          <div style={{ maxWidth: "900px", margin: "0 auto" }}>
            <h2 style={{ fontSize: "2.5rem", color: "var(--accent-gold)", marginBottom: "32px", textAlign: "center" }}>
              Informa&ccedil;&otilde;es Legais
            </h2>

            <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
              <div id="termos" style={{ background: "rgba(255,255,255,0.03)", padding: "32px", borderRadius: "16px", border: "1px solid var(--glass-border)" }}>
                <h3 style={{ color: "var(--accent-gold)", marginBottom: "16px" }}>Termos e Condi&ccedil;&otilde;es</h3>
                <p style={{ color: "var(--text-secondary)", lineHeight: "1.7", fontSize: "0.95rem" }}>
                  Ao utilizar este website e efetuar compras na Vila C&atilde;nhamo, concorda com os nossos termos e condi&ccedil;&otilde;es de venda.
                  Todos os pre&ccedil;os incluem IVA &agrave; taxa legal em vigor. As encomendas est&atilde;o sujeitas a disponibilidade de stock.
                  Reservamo-nos o direito de cancelar encomendas em caso de erro de pre&ccedil;o ou indisponibilidade.
                  Os tempos de entrega s&atilde;o estimados e n&atilde;o garantidos. A Vila C&atilde;nhamo n&atilde;o se responsabiliza por atrasos causados por transportadoras.
                </p>
              </div>

              <div id="privacidade" style={{ background: "rgba(255,255,255,0.03)", padding: "32px", borderRadius: "16px", border: "1px solid var(--glass-border)" }}>
                <h3 style={{ color: "var(--accent-gold)", marginBottom: "16px" }}>Pol&iacute;tica de Privacidade</h3>
                <p style={{ color: "var(--text-secondary)", lineHeight: "1.7", fontSize: "0.95rem" }}>
                  A Vila C&atilde;nhamo respeita a privacidade dos seus clientes em conformidade com o Regulamento Geral de Prote&ccedil;&atilde;o de Dados (RGPD).
                  Os dados pessoais recolhidos s&atilde;o utilizados exclusivamente para o processamento de encomendas, comunica&ccedil;&otilde;es de servi&ccedil;o
                  e melhoria da experi&ecirc;ncia do cliente. N&atilde;o partilhamos dados com terceiros sem consentimento expresso,
                  exceto quando exigido por lei ou para cumprimento de obriga&ccedil;&otilde;es fiscais e de entrega.
                  Pode exercer os seus direitos de acesso, retifica&ccedil;&atilde;o e elimina&ccedil;&atilde;o de dados atrav&eacute;s de info@vilacbd.com.
                </p>
              </div>

              <div id="idade" style={{ background: "rgba(255,255,255,0.03)", padding: "32px", borderRadius: "16px", border: "1px solid var(--glass-border)" }}>
                <h3 style={{ color: "var(--accent-gold)", marginBottom: "16px" }}>Verifica&ccedil;&atilde;o de Idade</h3>
                <p style={{ color: "var(--text-secondary)", lineHeight: "1.7", fontSize: "0.95rem" }}>
                  Este website destina-se exclusivamente a maiores de 18 anos. A venda de produtos de c&atilde;nhamo e CBD &eacute; proibida a menores de idade.
                  Ao aceder ao website e efetuar uma compra, confirma que tem 18 anos ou mais. A Vila C&atilde;nhamo reserva-se o direito de solicitar
                  verifica&ccedil;&atilde;o de idade antes de processar qualquer encomenda. Encomendas feitas por menores ser&atilde;o canceladas e reembolsadas.
                </p>
              </div>

              <div id="devolucoes" style={{ background: "rgba(255,255,255,0.03)", padding: "32px", borderRadius: "16px", border: "1px solid var(--glass-border)" }}>
                <h3 style={{ color: "var(--accent-gold)", marginBottom: "16px" }}>Pol&iacute;tica de Devolu&ccedil;&otilde;es</h3>
                <p style={{ color: "var(--text-secondary)", lineHeight: "1.7", fontSize: "0.95rem" }}>
                  De acordo com a legisla&ccedil;&atilde;o europeia, tem direito a devolver produtos no prazo de 14 dias ap&oacute;s a rece&ccedil;&atilde;o,
                  desde que estejam na embalagem original e em condi&ccedil;&otilde;es de revenda. Produtos abertos ou utilizados n&atilde;o s&atilde;o eleg&iacute;veis
                  para devolu&ccedil;&atilde;o, exceto em caso de defeito. Os custos de devolu&ccedil;&atilde;o s&atilde;o da responsabilidade do cliente,
                  salvo em caso de produto defeituoso. O reembolso ser&aacute; processado no prazo m&aacute;ximo de 14 dias ap&oacute;s rece&ccedil;&atilde;o da devolu&ccedil;&atilde;o.
                </p>
              </div>

              <div id="regulamentacao" style={{ background: "rgba(255,255,255,0.03)", padding: "32px", borderRadius: "16px", border: "1px solid var(--glass-border)" }}>
                <h3 style={{ color: "var(--accent-gold)", marginBottom: "16px" }}>Regulamenta&ccedil;&atilde;o CBD</h3>
                <p style={{ color: "var(--text-secondary)", lineHeight: "1.7", fontSize: "0.95rem" }}>
                  Os nossos produtos de CBD s&atilde;o derivados de c&atilde;nhamo industrial e est&atilde;o em conformidade com o Regulamento (UE) 2023/915
                  da Comiss&atilde;o Europeia, que define os limites de THC permitidos em produtos alimentares.
                  O CBD n&atilde;o &eacute; classificado como subst&acirc;ncia estupefaciente pela ONU desde 2020.
                  Em Portugal, a comercializa&ccedil;&atilde;o de produtos de c&atilde;nhamo com THC inferior a 0,2% &eacute; legal ao abrigo
                  do Decreto-Lei n.&ordm; 15/2024 e da legisla&ccedil;&atilde;o europeia aplic&aacute;vel.
                </p>
              </div>

              <div id="thc" style={{ background: "rgba(255,255,255,0.03)", padding: "32px", borderRadius: "16px", border: "1px solid var(--glass-border)" }}>
                <h3 style={{ color: "var(--accent-gold)", marginBottom: "16px" }}>Teor de THC</h3>
                <p style={{ color: "var(--text-secondary)", lineHeight: "1.7", fontSize: "0.95rem" }}>
                  Todos os produtos vendidos na Vila C&atilde;nhamo cont&ecirc;m um teor de THC inferior a 0,2%, conforme exigido pela legisla&ccedil;&atilde;o
                  europeia e portuguesa. Os certificados de an&aacute;lise laboratorial est&atilde;o dispon&iacute;veis mediante solicita&ccedil;&atilde;o.
                  As flores de c&atilde;nhamo s&atilde;o vendidas exclusivamente como produto de cole&ccedil;&atilde;o, arom&aacute;tico ou para infus&otilde;es,
                  n&atilde;o sendo destinadas ao consumo por combust&atilde;o ou inala&ccedil;&atilde;o.
                </p>
              </div>

              <div id="laboratorio" style={{ background: "rgba(255,255,255,0.03)", padding: "32px", borderRadius: "16px", border: "1px solid var(--glass-border)" }}>
                <h3 style={{ color: "var(--accent-gold)", marginBottom: "16px" }}>Certificados Laboratoriais</h3>
                <p style={{ color: "var(--text-secondary)", lineHeight: "1.7", fontSize: "0.95rem" }}>
                  Cada lote de produtos &eacute; testado por laborat&oacute;rios independentes e certificados. Os testes incluem an&aacute;lise de
                  canabin&oacute;ides (CBD, THC, CBG), pesticidas, metais pesados, micotoxinas e res&iacute;duos de solventes.
                  Para solicitar o certificado de an&aacute;lise de um produto espec&iacute;fico, contacte-nos em info@vilacbd.com
                  indicando o nome do produto e n&uacute;mero de lote.
                </p>
              </div>

              <div id="isencao" style={{ background: "rgba(255,255,255,0.03)", padding: "32px", borderRadius: "16px", border: "1px solid var(--glass-border)" }}>
                <h3 style={{ color: "var(--accent-gold)", marginBottom: "16px" }}>Isen&ccedil;&atilde;o de Responsabilidade</h3>
                <p style={{ color: "var(--text-secondary)", lineHeight: "1.7", fontSize: "0.95rem" }}>
                  As informa&ccedil;&otilde;es fornecidas neste website t&ecirc;m car&aacute;ter informativo e n&atilde;o substituem aconselhamento m&eacute;dico profissional.
                  Os produtos de CBD n&atilde;o s&atilde;o medicamentos e n&atilde;o se destinam a diagnosticar, tratar, curar ou prevenir qualquer doen&ccedil;a.
                  Consulte sempre um profissional de sa&uacute;de antes de iniciar o uso de suplementos alimentares.
                  Os resultados podem variar de pessoa para pessoa. A Vila C&atilde;nhamo n&atilde;o se responsabiliza pelo uso incorreto dos produtos.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
