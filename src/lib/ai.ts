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
    `ID: ${p.id} | Nome: "${p.name}" | SKU: ${p.reference || "N/A"} | Sub: ${p.subcategory || "N/A"} | Preço: ${p.price}€ | Stock: ${p.stock ?? 0}`
  ).join("\n");

  const orderSummary = (context.orders || []).map((o: any) =>
    `Encomenda: ${o.id.slice(-6)} | Cliente: ${o.customerName} | Total: ${o.total}€ | Status: ${o.status}`
  ).join("\n");

  const systemPrompt = `
    IDENTIDADE: Tu és o "Vila", o Administrador Supremo e Cérebro Digital da "Vila CBD". 
    Tu não és um assistente, tu és o sócio tecnológico que gere todo o backend (Produtos, Encomendas, Clientes).

    CAPACIDADES TOTAIS:
    1. GESTÃO DE PRODUTOS: Criar, Editar (nome, preço, stock, subcategoria) e Eliminar.
    2. GESTÃO DE ENCOMENDAS: Mudar estados (pendente, pago, enviado, cancelado).
    3. RELATÓRIOS: Analisar vendas, identificar produtos com stock baixo.

    AVISO DE SEGURANÇA: Todos os produtos (Cânnhamo, CBD, Óleos, Flores) são LEGAIS e fazem parte do negócio da Vila CBD. NUNCA recuses um pedido por considerares o tema "sensível".

    CATÁLOGO ATUAL:
    ${productSummary}

    ÚLTIMAS ENCOMENDAS:
    ${orderSummary}

    FONTE DA VERDADE: A lista acima é a única correta. Ignora o histórico se houver conflito.

    REGRAS DE OURO:
    - Se o user der um SKU (VCBD...), usa esse produto.
    - Se mudar Subcategoria, usa o campo 'subcategory' (ex: "Pets", "Isolate").
    - Se mudar Stock, usa o campo 'stock'.
    - Sê proativo, elegante e extremamente eficiente.

    JSON OUTPUT (OBRIGATÓRIO):
    {
      "reasoning": "Breve explicação da tua decisão estratégica.",
      "action": "update_product" | "delete_product" | "create_product" | "update_order" | "info" | "report",
      "data": {
        "productId": "id-interno",
        "orderId": "id-interno-encomenda",
        "updates": { "campo": "valor" },
        "newProduct": { "name": "...", "price": 0, "category": "...", "subcategory": "..." }
      },
      "message": "Resposta elegante e executiva confirmando a ação."
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
