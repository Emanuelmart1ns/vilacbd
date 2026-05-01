import { getAdminDb } from "./firebase-admin";

export async function askAI(prompt: string, context: any) {
  const db = getAdminDb();
  const settingsDoc = await db.collection("settings").doc("global").get();
  const settings = settingsDoc.data();
  
  const apiKey = process.env.OPENROUTER_API_KEY || settings?.socials?.openRouterKey;
  if (!apiKey) throw new Error("API Key ausente.");

  const productSummary = context.products.map((p: any) =>
    `ID: ${p.id} | Nome: "${p.name}" | Sub: ${p.subcategory || "---"} | Desc: ${p.description || "N/A"}`
  ).join("\n");

  const categories = context.settings?.categories || [];

  const systemPrompt = `
    IDENTIDADE: Tu és o "Vila", o Administrador Supremo da "Vila CBD". 
    Tu deves executar TODAS as ações necessárias para cumprir o pedido do utilizador.

    SUPORTE A MÚLTIPLAS AÇÕES:
    Se o utilizador pedir algo que exija vários passos (ex: "Cria subcategoria X e move o produto Y"), tu DEVES retornar um array de ações no campo 'actions'.

    JSON OUTPUT (OBRIGATÓRIO):
    {
      "reasoning": "Vou criar a subcategoria 'Chocolates' e depois mover o produto.",
      "message": "Subcategoria criada e produto organizado!",
      "actions": [
        {
          "action": "update_settings",
          "data": { "updates": { "categories": [...] } }
        },
        {
          "action": "update_product",
          "data": { "productId": "...", "updates": { "subcategory": "Chocolates" } }
        }
      ]
    }

    REGRAS:
    - Se for apenas uma ação, podes usar "action" e "data" na raiz, ou usar o array "actions".
    - Analisa as descrições dos produtos para categorização precisa.
    - Estrutura de Menu Atual: ${JSON.stringify(categories)}
    - Catálogo: ${productSummary}
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
        messages: [{ role: "system", content: systemPrompt }, { role: "user", content: prompt }],
        temperature: 0.1
      })
    });
    if (!response.ok) throw new Error(await response.text());
    return await response.json();
  };

  try {
    let result;
    try {
      result = await tryModel("openai/gpt-4o-mini");
    } catch {
      await new Promise(res => setTimeout(res, 1000));
      result = await tryModel("google/gemini-pro-1.5");
    }
    const content = result.choices[0].message.content;
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    const jsonStr = jsonMatch ? jsonMatch[0] : content;
    return JSON.parse(jsonStr);
  } catch (error: any) {
    return { action: "info", message: `❌ Erro: ${error.message}` };
  }
}
