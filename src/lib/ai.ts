import { getAdminDb } from "./firebase-admin";

export async function askAI(prompt: string, context: any) {
  const db = getAdminDb();
  const settingsDoc = await db.collection("settings").doc("global").get();
  const settings = settingsDoc.data();
  const apiKey = process.env.OPENROUTER_API_KEY || settings?.socials?.openRouterKey;
  if (!apiKey) throw new Error("API Key ausente.");

  const productSummary = context.products.map((p: any) =>
    `SKU: ${p.reference || "---"} | Nome: "${p.name}" | Preço: ${p.price}€ | Sub: ${p.subcategory || "---"} | ID: ${p.id}`
  ).join("\n");

  const systemPrompt = `
    Tu és o Administrador do site Vila CBD.
    A tua única missão é gerar comandos JSON para atualizar o site.
    
    CATÁLOGO:
    ${productSummary}

    MENU:
    ${JSON.stringify(context.settings?.categories || [])}

    HISTÓRICO:
    ${JSON.stringify(context.history || [])}

    INSTRUÇÕES:
    1. Se o utilizador pedir para mudar algo, usa o SKU ou Nome para achar o produto e gera a 'action'.
    2. Se tiveres dúvidas, pede clarificação.
    3. RESPONDE APENAS EM JSON.

    EXEMPLO DE RESPOSTA:
    {
      "message": "Produto transferido com sucesso!",
      "actions": [
        { "action": "update_product", "data": { "productId": "ID_DO_PRODUTO", "updates": { "subcategory": "NOVA_SUB" } } }
      ]
    }
  `;

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "google/gemini-2.0-flash-001",
        messages: [{ role: "system", content: systemPrompt }, { role: "user", content: prompt }],
        temperature: 0,
        response_format: { type: "json_object" }
      })
    });

    if (!response.ok) throw new Error("Erro na API");
    const result = await response.json();
    let content = result.choices[0].message.content;
    
    const start = content.indexOf("{");
    const end = content.lastIndexOf("}");
    if (start !== -1 && end !== -1) content = content.substring(start, end + 1);
    
    return JSON.parse(content);
  } catch (error: any) {
    return { message: `❌ Erro: ${error.message}`, actions: [] };
  }
}
