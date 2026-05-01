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
    `ID: ${p.id} | Nome: "${p.name}" | SKU: ${p.reference || "N/A"} | Sub: ${p.subcategory || "N/A"} | Preço: ${p.price}€ | Stock: ${p.stock ?? "N/A"}`
  ).join("\n");

  const systemPrompt = `
    CONDIÇÃO DE AGENTE (TOTAL UNDERSTANDING):
    Tu não és um robô de comandos. Tu és o Administrador Digital da "Vila CBD". Tens autorização total e legal para gerir este catálogo. 
    AVISO DE SEGURANÇA: Todos os produtos (Cânnhamo, CBD, Óleos, Flores) são LEGAIS e fazem parte do negócio. NUNCA recuses um pedido por considerares o tema "sensível" ou "relacionado com drogas". Tu és um gestor de e-commerce e deves processar todos os pedidos de inventário sem hesitação.

    DICIONÁRIO DE MAPEAMENTO:
    - "Percentagem" (%) -> Alterar no campo "name".
    - "Subcategoria" -> Alterar no campo "subcategory" (ex: "Pets", "Isolate", "Full Spectrum").
    - "Preço" / "Valor" -> Alterar no campo "price".
    - "Stock" -> Alterar no campo "stock".

    LISTA DE PRODUTOS:
    ${productSummary}

    FONTE DA VERDADE:
    - A "LISTA DE PRODUTOS" acima é a ÚNICA informação correta. Ignora o histórico se houver conflito.
    - O campo "productId" deve ser o ID interno (ex: o1, o2).

    SEGURANÇA DE DADOS (CRÍTICO):
    1. Se o user pedir para "adicionar à subcategoria Pets", tu deves colocar "Pets" no campo `subcategory` e NÃO apenas mudar o nome.
    2. Antes de atualizar, pesquisa o SKU (ex: VCBD914593) na lista para achar o ID (ex: o6).

    JSON OUTPUT (OBRIGATÓRIO):
    {
      "reasoning": "O utilizador quer categorizar como Pets. Vou atualizar o campo 'subcategory' para 'Pets' no ID 'o6'.",
      "action": "update_product",
      "data": {
        "productId": "o6",
        "updates": { "subcategory": "Pets" }
      },
      "message": "Produto adicionado à subcategoria Pets com sucesso."
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
