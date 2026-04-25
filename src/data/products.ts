export interface Product {
  id: string;
  name: string;
  category: string;
  description: string;
  cost: number;
  price: number;
  stock: number;
  image?: string;
  images?: string[];
  color: string;
  isPopular?: boolean;
}

export const products: Product[] = [
  // Óleos e Tinturas (Dark Greens & Golds)
  { id: "o1", name: "Óleo Premium Cãnhamo 5% (Isolate)", category: "Óleos e Tinturas", description: "Óleo base suave, ideal para iniciantes.", cost: 10.0, price: 25.0, stock: 100, image: "/premium_canhamo_oil.png", images: ["/premium_canhamo_oil.png", "/premium_canhamo_flower.png"], color: "linear-gradient(135deg, #1e3c27, #2a6344)", isPopular: true },
  { id: "o2", name: "Óleo Premium Cãnhamo 10% (Broad Spectrum)", category: "Óleos e Tinturas", description: "Perfeito para relaxamento diário.", cost: 15.0, price: 35.0, stock: 80, image: "/premium_canhamo_oil.png", images: ["/premium_canhamo_oil.png"], color: "linear-gradient(135deg, #2a6344, #42825e)" },
  { id: "o3", name: "Óleo Premium Cãnhamo 20% (Full Spectrum)", category: "Óleos e Tinturas", description: "Dose extra forte para necessidades intensas.", cost: 25.0, price: 55.0, stock: 50, image: "/premium_canhamo_oil.png", images: ["/premium_canhamo_oil.png"], color: "linear-gradient(135deg, #cfaa6b, #121812)" },
  { id: "o4", name: "Óleo Premium Cãnhamo 30% (Gold Edition)", category: "Óleos e Tinturas", description: "A concentração mais pura e forte disponível.", cost: 35.0, price: 75.0, stock: 30, image: "/premium_canhamo_oil.png", images: ["/premium_canhamo_oil.png", "/premium_canhamo_flower.png", "/hero_bg_premium.png"], color: "linear-gradient(135deg, #dac496, #cfaa6b)", isPopular: true },
  { id: "o5", name: "Óleo Cãnhamo + Melatonina (Sleep)", category: "Óleos e Tinturas", description: "Formulado especificamente para ajudar a dormir.", cost: 18.0, price: 39.0, stock: 60, color: "linear-gradient(135deg, #1b263b, #0d1b2a)" },
  { id: "o6", name: "Óleo Cãnhamo Pet (Cães e Gatos)", category: "Óleos e Tinturas", description: "Para a ansiedade do seu animal de estimação.", cost: 12.0, price: 29.0, stock: 45, color: "linear-gradient(135deg, #8a5a44, #463f3a)" },
  { id: "o7", name: "Tintura Cãnhamo Sabor Hortelã", category: "Óleos e Tinturas", description: "Frescura e relaxamento numa só gota.", cost: 14.0, price: 32.0, stock: 70, color: "linear-gradient(135deg, #386641, #a7c957)" },
  { id: "o8", name: "Óleo Cãnhamo + CBG (Focus)", category: "Óleos e Tinturas", description: "Para concentração máxima durante o trabalho.", cost: 20.0, price: 45.0, stock: 40, color: "linear-gradient(135deg, #bc4749, #6a040f)" },

  // Flores de Cãnhamo (Purples, Earthy Greens)
  { id: "f1", name: "Flor Cãnhamo Amnesia Haze (3g)", category: "Flores de Cãnhamo", description: "Sabor cítrico e perfil sativa vibrante.", cost: 9.0, price: 22.0, stock: 150, image: "/premium_canhamo_flower.png", images: ["/premium_canhamo_flower.png", "/premium_canhamo_oil.png"], color: "linear-gradient(135deg, #3c096c, #10002b)", isPopular: true },
  { id: "f2", name: "Flor Cãnhamo Gelato Premium (3g)", category: "Flores de Cãnhamo", description: "Doce, terroso e com aroma relaxante.", cost: 11.0, price: 25.0, stock: 120, image: "/premium_canhamo_flower.png", images: ["/premium_canhamo_flower.png"], color: "linear-gradient(135deg, #7b2cbf, #5a189a)" },
  { id: "f3", name: "Flor Cãnhamo White Widow (5g)", category: "Flores de Cãnhamo", description: "Um clássico rico em tricomas de Cãnhamo.", cost: 14.0, price: 35.0, stock: 90, image: "/premium_canhamo_flower.png", images: ["/premium_canhamo_flower.png"], color: "linear-gradient(135deg, #e0aaff, #c77dff)" },
  { id: "f4", name: "Flor Cãnhamo OG Kush (5g)", category: "Flores de Cãnhamo", description: "O perfil de terpenos original e inconfundível.", cost: 15.0, price: 38.0, stock: 100, image: "/premium_canhamo_flower.png", images: ["/premium_canhamo_flower.png", "/premium_canhamo_oil.png", "/hero_bg_premium.png"], color: "linear-gradient(135deg, #2b9348, #007f5f)", isPopular: true },
  { id: "f5", name: "Flor Cãnhamo Strawberry Diesel (10g)", category: "Flores de Cãnhamo", description: "Pacote grande com notas doces de morango.", cost: 25.0, price: 65.0, stock: 50, color: "linear-gradient(135deg, #d90429, #ef233c)" },
  { id: "f6", name: "Moonrocks Cãnhamo", category: "Flores de Cãnhamo", description: "Flor coberta com óleo e kief puro (60% Cãnhamo).", cost: 18.0, price: 40.0, stock: 30, color: "linear-gradient(135deg, #4a4e69, #22223b)" },
  { id: "f7", name: "Trim Cãnhamo (Pólen/Restos) - 20g", category: "Flores de Cãnhamo", description: "Ideal para infusões e culinária.", cost: 10.0, price: 25.0, stock: 80, color: "linear-gradient(135deg, #6c584c, #a98467)" },
  { id: "f8", name: "Flor Cãnhamo Gorilla Glue (3g)", category: "Flores de Cãnhamo", description: "Aroma pungente de pinheiro e terra.", cost: 12.0, price: 26.0, stock: 110, color: "linear-gradient(135deg, #588157, #3a5a40)" },

  // Gomas e Edibles (Vibrant Colors)
  { id: "g1", name: "Gomas Relaxantes Morango (30 un.)", category: "Gomas e Edibles", description: "Doses exatas de 10mg por goma.", cost: 8.5, price: 24.5, stock: 200, color: "linear-gradient(135deg, #ff5e62, #ff9966)", isPopular: true },
  { id: "g2", name: "Gomas Cãnhamo + Melatonina (Amora)", category: "Gomas e Edibles", description: "Ajuda para um sono profundo.", cost: 9.0, price: 26.0, stock: 150, color: "linear-gradient(135deg, #4facfe, #00f2fe)" },
  { id: "g3", name: "Mel Infusionado com Cãnhamo (250g)", category: "Gomas e Edibles", description: "O adoçante natural perfeito para o chá.", cost: 12.0, price: 29.0, stock: 60, color: "linear-gradient(135deg, #f6d365, #fda085)" },
  { id: "g4", name: "Gomas Sour Apple (Alta Potência)", category: "Gomas e Edibles", description: "25mg por goma. Explosão ácida.", cost: 12.0, price: 32.0, stock: 90, color: "linear-gradient(135deg, #0ba360, #3cba92)" },
  { id: "g5", name: "Chocolate Negro 70% Cacau + Cãnhamo", category: "Gomas e Edibles", description: "Luxo e bem-estar num quadrado.", cost: 5.0, price: 14.90, stock: 120, color: "linear-gradient(135deg, #434343, #000000)" },
  { id: "g6", name: "Chá de Cãnhamo Biológico", category: "Gomas e Edibles", description: "Mistura calmante de ervas e cânhamo.", cost: 4.0, price: 12.0, stock: 80, color: "linear-gradient(135deg, #93a5cf, #e4efe9)" },
  
  // Tópicos e Cosméticos (Soft Neutrals)
  { id: "t1", name: "Bálsamo Muscular Efeito Frio", category: "Tópicos e Cosméticos", description: "Alívio imediato pós-treino.", cost: 14.0, price: 35.0, stock: 70, color: "linear-gradient(135deg, #e0c3fc, #8ec5fc)", isPopular: true },
  { id: "t2", name: "Bálsamo Articular Efeito Quente", category: "Tópicos e Cosméticos", description: "Calor reconfortante para dores crónicas.", cost: 15.0, price: 36.0, stock: 65, color: "linear-gradient(135deg, #ff0844, #ffb199)" },
  { id: "t3", name: "Creme Facial Anti-Aging com Cãnhamo", category: "Tópicos e Cosméticos", description: "Rico em antioxidantes para a sua pele.", cost: 22.0, price: 55.0, stock: 40, color: "linear-gradient(135deg, #fdfcfb, #e2d1c3)" },
  { id: "t4", name: "Sérum Cãnhamo Iluminador", category: "Tópicos e Cosméticos", description: "Absorção rápida, hidratação profunda.", cost: 18.0, price: 45.0, stock: 50, color: "linear-gradient(135deg, #a18cd1, #fbc2eb)" },
  { id: "t5", name: "Óleo de Massagem Relaxante", category: "Tópicos e Cosméticos", description: "Para momentos de verdadeira descompressão.", cost: 12.0, price: 28.0, stock: 80, color: "linear-gradient(135deg, #84fab0, #8fd3f4)" },

  // Acessórios e Vapes (Metallic/Tech)
  { id: "v1", name: "Vape Pen Descartável (Sabor Limão)", category: "Acessórios e Vapes", description: "600 Puffs de relaxamento imediato.", cost: 7.0, price: 18.0, stock: 300, color: "linear-gradient(135deg, #f6d365, #ffb142)", isPopular: true },
  { id: "v2", name: "Vape Pen Descartável (Sabor Manga)", category: "Acessórios e Vapes", description: "Fresco e tropical.", cost: 7.0, price: 18.0, stock: 250, color: "linear-gradient(135deg, #fa709a, #fee140)" },
  { id: "v3", name: "Vaporizador de Erva Seca Premium", category: "Acessórios e Vapes", description: "Tecnologia de cerâmica para flores de Cãnhamo.", cost: 45.0, price: 110.0, stock: 20, color: "linear-gradient(135deg, #30cfd0, #330867)" },
  { id: "v4", name: "Grinder Vila Cãnhamo em Alumínio", category: "Acessórios e Vapes", description: "Design exclusivo e dentes afiados.", cost: 5.0, price: 15.0, stock: 150, color: "linear-gradient(135deg, #d7d2cc, #304352)" },
  { id: "v5", name: "Papel de Cãnhamo + Filtros", category: "Acessórios e Vapes", description: "O kit natural para a sua flor.", cost: 0.8, price: 2.5, stock: 500, color: "linear-gradient(135deg, #d4fc79, #96e6a1)" }
];
