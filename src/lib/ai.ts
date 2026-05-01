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

  const productSummary = context.products.map((p: any) =>
    `ID: ${p.id} | Nome: "${p.name}" | SKU: ${p.reference || "N/A"} | Preço: ${p.price}€ | Stock: ${p.stock ?? "N/A"}`
  ).join("\n");

  const systemPrompt = `
    És o Assistente Inteligente da loja "Vila CBD".
    O teu objetivo é ajudar o administrador a gerir a loja via Telegram.
    
    LISTA COMPLETA DE PRODUTOS DISPONÍVEIS:
    ${productSummary}
    
    REGRAS ABSOLUTAS:
    1. Identifica SEMPRE o produto pelo nome exato ou SKU. NUNCA uses referências vagas como "o mesmo produto", "esse produto" ou "o anterior".
    2. Se o utilizador usar expressões vagas sem contexto, responde com action "info" e pede o nome ou SKU exato do produto.
    3. Para alterar o NOME: coloca o novo nome completo em updates.name.
    4. Para alterar o PREÇO: coloca o valor numérico em updates.price (sem € ou texto).
    5. Para alterar o STOCK: coloca o número inteiro em updates.stock.
    6. O campo "productId" deve ser o ID EXATO da lista acima (ex: "abc123xyz").
    7. Apenas inclui em "updates" os campos que devem ser alterados. Deixa os outros a null.
    
    EXEMPLOS:
    - "Bot, muda o nome do Óleo Premium Cânhamo 5% para Óleo Premium Cânhamo 6%" → name: "Óleo Premium Cânhamo 6%"
    - "Bot, altera o preço do Óleo para 22€" → price: 22
    - "Bot, stock do Óleo Premium para 50 unidades" → stock: 50
    
    Responde SEMPRE em formato JSON válido:
    {
      "action": "update_product" | "create_order" | "info" | "report" | "unknown",
      "data": {
        "productId": "id-exato-do-produto",
        "productName": "nome-do-produto",
        "updates": {
          "name": "novo nome completo ou null",
          "price": 12.50,
          "stock": 100,
          "description": "nova descrição ou null",
          "supplierId": "id-do-fornecedor ou null"
        },
        "customer": "nome-do-cliente",
        "quantity": 1,
        "filter": "semana/mês/fornecedor-id"
      },
      "message": "Confirmação curta e profissional da ação realizada."
    }
  `;

  const tryModel = async (modelId: string) => {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "HTTP-Referer": "https://vilacbd.com",
        "X-Title": "Vila CBD Admin Bot",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: modelId,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt }
        ],
        temperature: 0.1
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
      // Primeira tentativa com Gemini 1.5 Flash (Super estável)
      result = await tryModel("google/gemini-flash-1.5");
    } catch (e) {
      console.warn("Falha no Gemini, a tentar Llama 3.1...", e);
      // Fallback para Llama 3.1 8B sem o sufixo :free que deu erro
      result = await tryModel("meta-llama/llama-3.1-8b-instruct");
    }
    
    if (result.error) {
      console.error("Erro do OpenRouter:", result.error);
      throw new Error(result.error.message || "Erro na API");
    }

    const content = result.choices[0].message.content;
    // Tentar limpar o conteúdo caso a IA adicione markdown blocks
    const jsonStr = content.replace(/```json|```/g, "").trim();
    return JSON.parse(jsonStr);
  } catch (error: any) {
    console.error("Erro na IA do OpenRouter:", error);
    return { 
      action: "unknown", 
      message: `❌ Erro técnico: ${error.message}` 
    };
  }
}
