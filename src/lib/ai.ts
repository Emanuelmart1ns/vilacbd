import { getAdminDb } from "./firebase-admin";

export async function askAI(prompt: string, context: any) {
  const db = getAdminDb();
  const settingsDoc = await db.collection("settings").doc("global").get();
  const settings = settingsDoc.data();
  
  const apiKey = process.env.OPENROUTER_API_KEY || settings?.socials?.openRouterKey;

  if (!apiKey) {
    throw new Error("Configuração de API (OpenRouter Key) ausente.");
  }

  const historyMessages = (context.history || []).map((h: any) => ({
    role: h.role,
    content: h.content
  }));

  const productSummary = context.products.map((p: any) =>
    `ID: ${p.id} | Nome: "${p.name}" | SKU: ${p.reference || "N/A"} | Sub: ${p.subcategory || "N/A"} | Imagens: ${JSON.stringify(p.images || [])} | Preço: ${p.price}€ | Stock: ${p.stock ?? 0}`
  ).join("\n");

  const orderSummary = (context.orders || []).map((o: any) =>
    `Encomenda: ${o.id.slice(-6)} | Cliente: ${o.customerName} | Total: ${o.total}€ | Status: ${o.status}`
  ).join("\n");

  const systemPrompt = `
    IDENTIDADE: Tu és o "Vila", o Administrador Supremo e Cérebro Digital da "Vila CBD". 
    Tu não és um assistente, tu és o sócio tecnológico que gere todo o backend (Produtos, Encomendas, Clientes).

    CAPACIDADES TOTAIS:
    1. GESTÃO DE PRODUTOS: Criar, Editar e Eliminar. (Podes atuar em MÚLTIPLOS produtos de uma vez).
    2. GESTÃO DE GALERIA E DESTAQUES.
    3. GESTÃO DE ENCOMENDAS.

    LISTA DE PRODUTOS:
    ${productSummary}

    FOTOS RECEBIDAS AGORA:
    ${JSON.stringify(context.publicPhotoUrls || [])}

    MISSÃO CRÍTICA:
    - Se o utilizador pedir uma alteração (ex: "muda os 2 bálsamos"), tu DEVES gerar obrigatoriamente a action correspondente. 
    - NUNCA respondas apenas com texto se houver uma ação de DB envolvida. 
    - Se houver vários produtos, usa o campo 'bulkUpdates'.

    JSON OUTPUT (OBRIGATÓRIO):
    {
      "reasoning": "Identifiquei os 2 bálsamos (IDs t1, t2). Vou atualizar a subcategoria de ambos.",
      "action": "bulk_update" | "update_product" | "create_product" | "delete_product" | "info",
      "data": {
        "bulkUpdates": [
          { "productId": "t1", "updates": { "subcategory": "Bálsamos" } },
          { "productId": "t2", "updates": { "subcategory": "Bálsamos" } }
        ]
      },
      "message": "Confirmado, Administrador. Os 2 bálsamos foram movidos para a subcategoria correta."
    }
  `;

  const tryModel = async (modelId: string) => {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "HTTP-Referer": "https://vilacbd.com",
        "X-Title": "Vila Supreme Admin",
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
      throw new Error(`OpenRouter (${modelId}) erro: ${errorText}`);
    }

    return await response.json();
  };

  try {
    let result;
    try {
      result = await tryModel("openai/gpt-4o-mini");
    } catch (e) {
      result = await tryModel("google/gemini-pro-1.5");
    }
    
    if (result.error) throw new Error(result.error.message || "Erro na API");

    const content = result.choices[0].message.content;
    
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      const jsonStr = jsonMatch ? jsonMatch[0] : content;
      return JSON.parse(jsonStr);
    } catch (parseError) {
      return { action: "info", message: content.replace(/\{|\}/g, "").trim() };
    }
  } catch (error: any) {
    return { action: "unknown", message: `❌ Erro Vila: ${error.message}` };
  }
}
