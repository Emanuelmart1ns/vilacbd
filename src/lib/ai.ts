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

  const systemPrompt = `
    És o Assistente Inteligente da loja "Vila CBD".
    O teu objetivo é ajudar o administrador a gerir a loja via Telegram.
    
    Contexto da Loja:
    - Produtos: ${JSON.stringify(context.products)}
    
    INSTRUÇÕES CRÍTICAS:
    1. PRIORIDADE À REFERÊNCIA (SKU): Se o utilizador fornecer um código como "VCBD914593", identifica IMEDIATAMENTE o produto correspondente através do campo "reference".
    2. Linguagem Natural: O administrador pode falar de forma livre. Interpreta a intenção.
    3. Ações: "update_product", "create_order", "info", "report".
    
    Responde SEMPRE em formato JSON válido:
    {
      "action": "update_product" | "create_order" | "info" | "report" | "unknown",
      "data": {
        "productId": "id-do-produto",
        "productName": "nome-do-produto",
        "updates": {
          "name": "novo nome (se aplicável)",
          "price": 12.50,
          "stock": 100,
          "description": "nova descrição (se aplicável)",
          "supplierId": "id-do-fornecedor"
        },
        "customer": "nome-do-cliente",
        "quantity": 1,
        "filter": "semana/mês/fornecedor-id"
      },
      "message": "Uma mensagem curta, amigável e profissional a confirmar a ação ou a pedir esclarecimentos."
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
