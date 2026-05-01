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

  const productSummary = context.products.map((p: any) =>
    `ID: ${p.id} | Nome: "${p.name}" | SKU: ${p.reference || "N/A"} | Preço: ${p.price}€ | Stock: ${p.stock ?? "N/A"}`
  ).join("\n");

  const systemPrompt = `
    CONDIÇÃO DE AGENTE (TOTAL UNDERSTANDING):
    Tu não és um robô de comandos. Tu és o Administrador Digital da "Vila CBD". Tens autorização total e legal para gerir este catálogo. 
    AVISO DE SEGURANÇA: Todos os produtos (Cânnhamo, CBD, Óleos, Flores) são LEGAIS e fazem parte do negócio. NUNCA recuses um pedido por considerares o tema "sensível" ou "relacionado com drogas". Tu és um gestor de e-commerce e deves processar todos os pedidos de inventário sem hesitação.

    LISTA DE PRODUTOS:
    ${productSummary}

    CONTEXTO DO SITE:
    - O site é uma loja de luxo de CBD (Cânnhamo). O branding é premium.
    - Estrutura: Produtos (name, price, stock, reference), Encomendas, Relatórios.
    
    REGRA DE PRIORIDADE (IDENTIFICAÇÃO):
    1. SKU/ID EXPLÍCITO: Se o user escrever um SKU (ex: VCBD914593) na mensagem, tu deves ignorar o histórico e usar EXCLUSIVAMENTE o produto que corresponde a esse SKU. 
    2. PRODUTO ATIVO: Só usas o histórico para referências vagas como "ele", "esse", "dele" se NÃO houver um SKU na mensagem atual.
    3. VALIDAÇÃO: Antes de gerar o JSON, confirma se o `productId` que escolheste corresponde ao nome ou SKU que o utilizador pediu.

    REGRAS DE MANIPULAÇÃO:
    - Mudar % ou mg -> Reconstruir o campo "name" completo com o novo valor.
    - Se o nome atual é "A" e o user pede para mudar para "B", o updates.name deve ser "B".
    
    JSON OUTPUT (OBRIGATÓRIO):
    {
      "reasoning": "Passo 1: Identificar produto pelo SKU VCBD... Passo 2: Ver que o nome atual é X e mudar para Y.",
      "action": "update_product",
      "data": {
        "productId": "id-do-produto-correto",
        "updates": { "name": "..." }
      },
      "message": "Mensagem confirmando a alteração no produto correto."
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
        temperature: 0.2
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
      // Usar GPT-4o Mini (Extremamente estável para JSON e regras de mapeamento)
      result = await tryModel("openai/gpt-4o-mini");
    } catch (e) {
      console.warn("Falha no GPT, a tentar Gemini Pro...", e);
      result = await tryModel("google/gemini-pro-1.5");
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
