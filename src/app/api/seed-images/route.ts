import { NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";

function svgToDataUrl(svg: string): string {
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
}

function oilSvg(label: string, pct: string, bg1: string, bg2: string, angle = 135): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${bg1}"/>
        <stop offset="100%" stop-color="${bg2}"/>
      </linearGradient>
      <linearGradient id="liq" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#d4af37" stop-opacity="0.9"/>
        <stop offset="100%" stop-color="#b8860b" stop-opacity="0.95"/>
      </linearGradient>
      <linearGradient id="cap" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#3a3a3a"/>
        <stop offset="100%" stop-color="#1a1a1a"/>
      </linearGradient>
    </defs>
    <rect width="400" height="400" rx="20" fill="url(#bg)"/>
    <rect x="155" y="80" width="90" height="30" rx="8" fill="url(#cap)"/>
    <rect x="160" y="105" width="80" height="200" rx="6" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.3)" stroke-width="1"/>
    <rect x="165" y="140" width="70" height="155" rx="4" fill="url(#liq)" opacity="0.85"/>
    <ellipse cx="200" cy="140" rx="35" ry="6" fill="#d4af37" opacity="0.5"/>
    <text x="200" y="230" text-anchor="middle" font-family="Georgia,serif" font-size="22" font-weight="bold" fill="#fff">${pct}</text>
    <text x="200" y="260" text-anchor="middle" font-family="Arial,sans-serif" font-size="11" fill="rgba(255,255,255,0.8)">CBD</text>
    <text x="200" y="350" text-anchor="middle" font-family="Arial,sans-serif" font-size="14" font-weight="bold" fill="rgba(255,255,255,0.9)">${label}</text>
    <circle cx="200" cy="300" r="12" fill="none" stroke="#d4af37" stroke-width="1.5" opacity="0.6"/>
    <text x="200" y="304" text-anchor="middle" font-family="Georgia,serif" font-size="10" fill="#d4af37" opacity="0.8">✦</text>
  </svg>`;
}

function flowerSvg(name: string, bg1: string, bg2: string, leafColor: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${bg1}"/>
        <stop offset="100%" stop-color="${bg2}"/>
      </linearGradient>
    </defs>
    <rect width="400" height="400" rx="20" fill="url(#bg)"/>
    <ellipse cx="200" cy="180" rx="80" ry="70" fill="${leafColor}" opacity="0.7"/>
    <ellipse cx="175" cy="170" rx="40" ry="35" fill="${leafColor}" opacity="0.5" transform="rotate(-20 175 170)"/>
    <ellipse cx="225" cy="170" rx="40" ry="35" fill="${leafColor}" opacity="0.5" transform="rotate(20 225 170)"/>
    <ellipse cx="200" cy="155" rx="30" ry="25" fill="${leafColor}" opacity="0.4"/>
    <circle cx="190" cy="165" r="3" fill="#fff" opacity="0.6"/>
    <circle cx="210" cy="175" r="2" fill="#fff" opacity="0.5"/>
    <circle cx="195" cy="180" r="2.5" fill="#fff" opacity="0.55"/>
    <circle cx="215" cy="160" r="2" fill="#fff" opacity="0.4"/>
    <circle cx="185" cy="175" r="1.5" fill="#fff" opacity="0.45"/>
    <path d="M120 300 Q160 260 200 280 Q240 260 280 300" fill="${leafColor}" opacity="0.3" stroke="${leafColor}" stroke-width="1"/>
    <text x="200" y="350" text-anchor="middle" font-family="Arial,sans-serif" font-size="14" font-weight="bold" fill="rgba(255,255,255,0.9)">${name}</text>
    <text x="200" y="90" text-anchor="middle" font-family="Georgia,serif" font-size="11" fill="rgba(255,255,255,0.6)" letter-spacing="3">PREMIUM</text>
  </svg>`;
}

function gummySvg(name: string, bg1: string, bg2: string, candyColor: string, shape: "circle" | "bear" | "square"): string {
  const shapes = {
    circle: `<circle cx="140" cy="180" r="25" fill="${candyColor}" opacity="0.8"/><circle cx="200" cy="170" r="30" fill="${candyColor}" opacity="0.9"/><circle cx="260" cy="180" r="25" fill="${candyColor}" opacity="0.8"/><circle cx="170" cy="230" r="22" fill="${candyColor}" opacity="0.7"/><circle cx="230" cy="225" r="24" fill="${candyColor}" opacity="0.75"/>`,
    bear: `<ellipse cx="140" cy="190" rx="18" ry="22" fill="${candyColor}" opacity="0.8"/><circle cx="132" cy="172" r="7" fill="${candyColor}" opacity="0.8"/><circle cx="148" cy="172" r="7" fill="${candyColor}" opacity="0.8"/><ellipse cx="200" cy="180" rx="22" ry="26" fill="${candyColor}" opacity="0.9"/><circle cx="190" cy="158" r="8" fill="${candyColor}" opacity="0.9"/><circle cx="210" cy="158" r="8" fill="${candyColor}" opacity="0.9"/><ellipse cx="260" cy="190" rx="18" ry="22" fill="${candyColor}" opacity="0.8"/><circle cx="252" cy="172" r="7" fill="${candyColor}" opacity="0.8"/><circle cx="268" cy="172" r="7" fill="${candyColor}" opacity="0.8"/>`,
    square: `<rect x="120" y="160" width="40" height="40" rx="8" fill="${candyColor}" opacity="0.8"/><rect x="180" y="150" width="45" height="45" rx="10" fill="${candyColor}" opacity="0.9"/><rect x="245" y="160" width="40" height="40" rx="8" fill="${candyColor}" opacity="0.8"/><rect x="155" y="215" width="35" height="35" rx="7" fill="${candyColor}" opacity="0.7"/><rect x="210" y="210" width="38" height="38" rx="8" fill="${candyColor}" opacity="0.75"/>`,
  };
  return `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">
    <defs><linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="${bg1}"/><stop offset="100%" stop-color="${bg2}"/></linearGradient></defs>
    <rect width="400" height="400" rx="20" fill="url(#bg)"/>
    ${shapes[shape]}
    <text x="200" y="310" text-anchor="middle" font-family="Arial,sans-serif" font-size="13" font-weight="bold" fill="rgba(255,255,255,0.9)">${name}</text>
    <text x="200" y="90" text-anchor="middle" font-family="Georgia,serif" font-size="11" fill="rgba(255,255,255,0.6)" letter-spacing="3">EDIBLES</text>
  </svg>`;
}

function cosmeticSvg(name: string, bg1: string, bg2: string, containerColor: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">
    <defs><linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="${bg1}"/><stop offset="100%" stop-color="${bg2}"/></linearGradient></defs>
    <rect width="400" height="400" rx="20" fill="url(#bg)"/>
    <rect x="160" y="100" width="80" height="130" rx="20" fill="${containerColor}" opacity="0.85" stroke="rgba(255,255,255,0.3)" stroke-width="1"/>
    <rect x="170" y="95" width="60" height="15" rx="5" fill="rgba(255,255,255,0.25)"/>
    <rect x="175" y="145" width="50" height="40" rx="4" fill="rgba(255,255,255,0.15)"/>
    <text x="200" y="170" text-anchor="middle" font-family="Georgia,serif" font-size="10" fill="rgba(255,255,255,0.9)">CBD</text>
    <circle cx="200" cy="280" r="35" fill="none" stroke="${containerColor}" stroke-width="1.5" opacity="0.4"/>
    <circle cx="200" cy="280" r="20" fill="${containerColor}" opacity="0.2"/>
    <text x="200" y="355" text-anchor="middle" font-family="Arial,sans-serif" font-size="13" font-weight="bold" fill="rgba(255,255,255,0.9)">${name}</text>
  </svg>`;
}

function vapeSvg(name: string, bg1: string, bg2: string, bodyColor: string, accentColor: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">
    <defs><linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="${bg1}"/><stop offset="100%" stop-color="${bg2}"/></linearGradient></defs>
    <rect width="400" height="400" rx="20" fill="url(#bg)"/>
    <rect x="175" y="90" width="50" height="180" rx="25" fill="${bodyColor}" opacity="0.9" stroke="rgba(255,255,255,0.2)" stroke-width="1"/>
    <rect x="180" y="100" width="40" height="60" rx="5" fill="${accentColor}" opacity="0.4"/>
    <text x="200" y="135" text-anchor="middle" font-family="Arial,sans-serif" font-size="8" fill="rgba(255,255,255,0.9)" font-weight="bold">CBD</text>
    <circle cx="200" cy="240" r="8" fill="rgba(255,255,255,0.3)"/>
    <rect x="190" y="270" width="20" height="8" rx="4" fill="${accentColor}" opacity="0.6"/>
    <text x="200" y="355" text-anchor="middle" font-family="Arial,sans-serif" font-size="13" font-weight="bold" fill="rgba(255,255,255,0.9)">${name}</text>
  </svg>`;
}

export async function GET() {
  try {
    const db = getAdminDb();

    const productImages: Record<string, { main: string; secondary: string[] }> = {};

    const oils = [
      { id: "o1", name: "CBD 5%", pct: "5%", bg1: "#1e3c27", bg2: "#2a6344" },
      { id: "o2", name: "CBD 10%", pct: "10%", bg1: "#2a6344", bg2: "#42825e" },
      { id: "o3", name: "CBD 20%", pct: "20%", bg1: "#3c2a1e", bg2: "#634a2a" },
      { id: "o4", name: "CBD 30% Gold", pct: "30%", bg1: "#4a3c1e", bg2: "#8a6a2a" },
      { id: "o5", name: "CBD Sleep", pct: "5%", bg1: "#1b263b", bg2: "#0d1b2a" },
      { id: "o6", name: "CBD Pet", pct: "3%", bg1: "#8a5a44", bg2: "#463f3a" },
      { id: "o7", name: "CBD Hortelã", pct: "10%", bg1: "#386641", bg2: "#2a4a30" },
      { id: "o8", name: "CBD+CBG Focus", pct: "15%", bg1: "#6a2020", bg2: "#3a1010" },
    ];
    for (const o of oils) {
      const main = svgToDataUrl(oilSvg(o.name, o.pct, o.bg1, o.bg2));
      const sec = [
        svgToDataUrl(oilSvg(o.name + " (frente)", o.pct, o.bg2, o.bg1)),
        svgToDataUrl(oilSvg(o.name + " (detalhe)", o.pct, "#1a1a2e", "#16213e")),
        svgToDataUrl(oilSvg(o.name + " (uso)", o.pct, o.bg1, "#0a0a0a")),
      ];
      productImages[o.id] = { main, secondary: sec };
    }

    const flowers = [
      { id: "f1", name: "Amnesia Haze", bg1: "#3c096c", bg2: "#10002b", leaf: "#7b2cbf" },
      { id: "f2", name: "Gelato Premium", bg1: "#7b2cbf", bg2: "#5a189a", leaf: "#c77dff" },
      { id: "f3", name: "White Widow", bg1: "#4a3060", bg2: "#2a1840", leaf: "#e0aaff" },
      { id: "f4", name: "OG Kush", bg1: "#2b9348", bg2: "#005f40", leaf: "#55c578" },
      { id: "f5", name: "Strawberry Diesel", bg1: "#a01030", bg2: "#601020", leaf: "#ff4466" },
      { id: "f6", name: "Moonrocks", bg1: "#4a4e69", bg2: "#22223b", leaf: "#9a8c98" },
      { id: "f7", name: "Trim CBD", bg1: "#6c584c", bg2: "#3a2e24", leaf: "#a98467" },
      { id: "f8", name: "Gorilla Glue", bg1: "#3a5a40", bg2: "#1a3020", leaf: "#588157" },
    ];
    for (const f of flowers) {
      const main = svgToDataUrl(flowerSvg(f.name, f.bg1, f.bg2, f.leaf));
      const sec = [
        svgToDataUrl(flowerSvg(f.name + " (close-up)", f.bg2, f.bg1, f.leaf)),
        svgToDataUrl(flowerSvg(f.name + " (embalagem)", "#1a1a2e", "#0a0a1e", f.leaf)),
        svgToDataUrl(flowerSvg(f.name + " (trichomas)", f.bg1, "#050510", f.leaf)),
      ];
      productImages[f.id] = { main, secondary: sec };
    }

    const gummies = [
      { id: "g1", name: "Morango", bg1: "#ff5e62", bg2: "#ff9966", candy: "#ff3366", shape: "bear" as const },
      { id: "g2", name: "Melatonina Amora", bg1: "#4facfe", bg2: "#00f2fe", candy: "#6a0dad", shape: "circle" as const },
      { id: "g3", name: "Mel CBD", bg1: "#d4a030", bg2: "#b8860b", candy: "#f6d365", shape: "square" as const },
      { id: "g4", name: "Sour Apple", bg1: "#0ba360", bg2: "#3cba92", candy: "#80ff80", shape: "bear" as const },
      { id: "g5", name: "Chocolate CBD", bg1: "#434343", bg2: "#1a1a1a", candy: "#8B4513", shape: "square" as const },
      { id: "g6", name: "Chá Cânhamo", bg1: "#6b8e5a", bg2: "#3a5a2a", candy: "#a8d88a", shape: "circle" as const },
    ];
    for (const g of gummies) {
      const main = svgToDataUrl(gummySvg(g.name, g.bg1, g.bg2, g.candy, g.shape));
      const sec = [
        svgToDataUrl(gummySvg(g.name + " (embalagem)", g.bg2, g.bg1, g.candy, g.shape)),
        svgToDataUrl(gummySvg(g.name + " (detalhe)", "#1a1a2e", "#0a0a1e", g.candy, g.shape)),
        svgToDataUrl(gummySvg(g.name + " (porção)", g.bg1, "#0a0a0a", g.candy, g.shape)),
      ];
      productImages[g.id] = { main, secondary: sec };
    }

    const cosmetics = [
      { id: "t1", name: "Bálsamo Frio", bg1: "#e0c3fc", bg2: "#8ec5fc", container: "#6090c0" },
      { id: "t2", name: "Bálsamo Quente", bg1: "#ff0844", bg2: "#ffb199", container: "#ff6030" },
      { id: "t3", name: "Creme Anti-Aging", bg1: "#d4c4a8", bg2: "#e8d8c0", container: "#c8a880" },
      { id: "t4", name: "Sérum Iluminador", bg1: "#a18cd1", bg2: "#fbc2eb", container: "#c8a0e0" },
      { id: "t5", name: "Óleo Massagem", bg1: "#84fab0", bg2: "#8fd3f4", container: "#50b080" },
    ];
    for (const t of cosmetics) {
      const main = svgToDataUrl(cosmeticSvg(t.name, t.bg1, t.bg2, t.container));
      const sec = [
        svgToDataUrl(cosmeticSvg(t.name + " (frente)", t.bg2, t.bg1, t.container)),
        svgToDataUrl(cosmeticSvg(t.name + " (detalhe)", "#1a1a2e", "#0a0a1e", t.container)),
        svgToDataUrl(cosmeticSvg(t.name + " (aplicação)", t.bg1, "#0a0a0a", t.container)),
      ];
      productImages[t.id] = { main, secondary: sec };
    }

    const vapes = [
      { id: "v1", name: "Vape Limão", bg1: "#f6d365", bg2: "#ffb142", body: "#e0e0e0", accent: "#f6d365" },
      { id: "v2", name: "Vape Manga", bg1: "#fa709a", bg2: "#fee140", body: "#f0e0f0", accent: "#ff80b0" },
      { id: "v3", name: "Vaporizador Premium", bg1: "#30cfd0", bg2: "#330867", body: "#2a2a2a", accent: "#30cfd0" },
      { id: "v4", name: "Grinder Alumínio", bg1: "#808080", bg2: "#404040", body: "#c0c0c0", accent: "#d4af37" },
      { id: "v5", name: "Papel Cânhamo", bg1: "#d4fc79", bg2: "#96e6a1", body: "#e8e0c0", accent: "#96e6a1" },
    ];
    for (const v of vapes) {
      const main = svgToDataUrl(vapeSvg(v.name, v.bg1, v.bg2, v.body, v.accent));
      const sec = [
        svgToDataUrl(vapeSvg(v.name + " (frente)", v.bg2, v.bg1, v.body, v.accent)),
        svgToDataUrl(vapeSvg(v.name + " (detalhe)", "#1a1a2e", "#0a0a1e", v.body, v.accent)),
      ];
      productImages[v.id] = { main, secondary: sec };
    }

    let updated = 0;
    const batch = db.batch();
    for (const [id, imgs] of Object.entries(productImages)) {
      const ref = db.collection("products").doc(id);
      batch.update(ref, {
        image: imgs.main,
        images: imgs.secondary,
      });
      updated++;
    }
    await batch.commit();

    return NextResponse.json({ success: true, updated, message: `${updated} produtos atualizados com imagens SVG` });
  } catch (error) {
    console.error("Seed images error:", error);
    return NextResponse.json({ error: "Failed", details: String(error) }, { status: 500 });
  }
}
