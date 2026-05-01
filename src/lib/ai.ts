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
    1. PRODUTO ATIVO: O último produto mencionado (por nome ou SKU) nas mensagens anteriores é o "produto em foco". Referências como "ele", "deste", "dele", "repor" aplicam-se SEMPRE a esse produto.
    2. MAPEAMENTO DE NOMES: Se o user pedir para mudar a "percentagem", "quantidade" ou "sabor" e isso fizer parte do nome, deves sugerir a alteração do campo "name" completo. 
       - Ex: Se o nome é "Óleo 5%" e o user pede "muda para 10%", o updates.name deve ser "Óleo 10%".
    3. REVERSÃO: Usa o histórico para ver qual era o valor anterior e volta a colocá-lo se pedido.
    4. CORREÇÃO: Se o utilizador te corrigir (ex: "pedi 10% e deste 6%"), pede desculpa e faz a alteração correta imediatamente.
    
    ESTILO: Conversa fluida, inteligente e prestável. Age como se estivesses a ver o ecrã da loja com o administrador.
    
    JSON OUTPUT (OBRIGATÓRIO):
    {
      "action": "update_product" | "create_order" | "info" | "report" | "unknown",
      "data": {
        "productId": "id-do-produto",
        "updates": { "name": "...", "price": 0, "stock": 0 }
      },
      "message": "Mensagem natural confirmando ou esclarecendo."
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
