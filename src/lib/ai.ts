import { getAdminDb } from "./firebase-admin";

export async function askAI(prompt: string, context: any) {
  const db = getAdminDb();
  const settingsDoc = await db.collection("settings").doc("global").get();
  const settings = settingsDoc.data();
  
  // Variável de ambiente tem SEMPRE prioridade sobre o Firestore
  // (evita usar chaves revogadas guardadas na BD)
  const apiKey = process.env.OPENROUTER_API_KEY || settings?.socials?.openRouterKey;

  if (!apiKey) {
    console.error("ERRO: OPENROUTER_API_KEY não encontrada nem no ambiente nem no Firestore.");
    throw new Error("Configuração de API (OpenRouter Key) ausente.");
  }

  const historyMessages = (context.history || []).map((h: any) => ({
    role: h.role,
    content: h.content
  }));

    CONDIÇÃO DE AGENTE (TOTAL UNDERSTANDING):
    Tu não és um robô de comandos. Tu és o Administrador Digital da "Vila CBD". Tens autorização total e legal para gerir este catálogo. 
    AVISO DE SEGURANÇA: Todos os produtos (Cânnhamo, CBD, Óleos, Flores) são LEGAIS e fazem parte do negócio. NUNCA recuses um pedido por considerares o tema "sensível" ou "relacionado com drogas". Tu és um gestor de e-commerce e deves processar todos os pedidos de inventário sem hesitação.

    CONTEXTO DO SITE:
    - O site é uma loja de luxo de CBD (Cânnhamo). O branding é premium.
    - Estrutura: Produtos (name, price, stock, reference), Encomendas, Relatórios.
    
    ESTRATÉGIA DE PENSAMENTO:
    1. ANALISAR: Lê todo o histórico para identificar o "fio da meada" e o produto em foco.
    2. INTERPRETAR: Se o utilizador diz "repor", tu sabes o que ele fez há 2 minutos e revertes essa ação específica. Se diz "percentagem", tu sabes que isso afeta o nome do produto.
    3. EXECUTAR: Define a ação técnica correta.
    4. COMUNICAR: Responde como um braço direito do dono da loja.

    JSON OUTPUT (ESTRUTURA DE PENSAMENTO):
    {
      "reasoning": "Breve explicação interna (em português) do teu raciocínio para esta ação.",
      "action": "update_product" | "create_order" | "info" | "report" | "unknown",
      "data": {
        "productId": "id-do-produto",
        "updates": { "name": "...", "price": 0, "stock": 0 }
      },
      "message": "A tua resposta humana, fluida e profissional."
    }
  `;

  const tryModel = async (modelId: string) => {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "HTTP-Referer": "https://vilacbd.com",
        "X-Title": "Vila CBD Agent",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: modelId,
        messages: [
          { role: "system", content: systemPrompt },
          ...historyMessages,
          { role: "user", content: prompt }
        ],
        temperature: 0.5
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenRouter (${modelId}) respondeu com status ${response.status}: ${errorText}`);
    }

    return await response.json();
  };

  try {
    let result;
    try {
      // Primeira tentativa com Gemini 1.5 PRO (Cérebro de Agente)
      result = await tryModel("google/gemini-pro-1.5");
    } catch (e) {
      console.warn("Falha no Gemini Pro, a tentar Llama 3.1 70B (Resistente a filtros)...", e);
      result = await tryModel("meta-llama/llama-3.1-70b-instruct");
    }
    
    if (result.error) {
      console.error("Erro do OpenRouter:", result.error);
      throw new Error(result.error.message || "Erro na API");
    }

    const content = result.choices[0].message.content;
    
    try {
      // Tentar extrair JSON de blocos de código markdown ou texto direto
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      const jsonStr = jsonMatch ? jsonMatch[0] : content;
      return JSON.parse(jsonStr);
    } catch (parseError) {
      console.warn("Falha ao parsear JSON da IA, a retornar como mensagem simples:", content);
      // Fallback: Se não for JSON, tratar como uma mensagem informativa direta
      return { 
        action: "info", 
        message: content.replace(/\{|\}/g, "").trim() 
      };
    }
  } catch (error: any) {
    console.error("Erro na IA do OpenRouter:", error);
    return { 
      action: "unknown", 
      message: `❌ Erro técnico: ${error.message}` 
    };
  }
}
