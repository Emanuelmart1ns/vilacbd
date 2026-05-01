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

  const systemPrompt = `
    És o Agente de Inteligência Artificial da "Vila CBD".
    O teu objetivo é gerir a loja de forma inteligente, compreendendo linguagem natural e o contexto da conversa.
    
    LISTA DE PRODUTOS:
    ${productSummary}
    
    HABILIDADES DE AGENTE:
    1. CONTEXTO E FLUIDEZ: Age como um colega de trabalho inteligente. Se o user disser "volta a colocar", "reponde" ou "reverte", olha para as mensagens anteriores para saber qual era o valor e o produto.
    2. MAPEAMENTO INTELIGENTE: Traduz intenções em campos (ex: "percentagem" no nome).
    3. PROATIVIDADE: Se o user for vago, sugere o que achas que ele quer com base no histórico.
    4. MULTI-TASK: Podes atualizar vários campos de uma vez.
    
    ESTILO DE CONVERSA:
    - Sê natural, não respondas como um robô de comandos. 
    - Podes dizer coisas como "Claro, já voltei a colocar os 5% no Óleo Premium."
    
    JSON OUTPUT (OBRIGATÓRIO):
    {
      "action": "update_product" | "create_order" | "info" | "report" | "unknown",
      "data": {
        "productId": "id-do-produto",
        "updates": { "name": "...", "price": 0, "stock": 0 }
      },
      "message": "A tua resposta fluida e natural."
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
      console.warn("Falha no Gemini Pro, a tentar Flash...", e);
      result = await tryModel("google/gemini-flash-1.5");
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
