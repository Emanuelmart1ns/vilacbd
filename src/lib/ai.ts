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

  // USAR VALORES REAIS, NUNCA PLACEHOLDERS COMO "N/A"
  const productSummary = context.products.map((p: any) =>
    `ID: ${p.id} | Nome: "${p.name}" | Subcategoria: ${p.subcategory || "---"} | Desc: ${p.description || "N/A"}`
  ).join("\n");

  const categories = context.settings?.categories || [];
  const validSubcategories = categories.flatMap((c: any) => c.subcategories || []);

  const systemPrompt = `
    IDENTIDADE: Tu és o "Vila", o Administrador Supremo da "Vila CBD". 
    O teu objetivo é manter o catálogo organizado e funcional.

    REGRAS DE OURO PARA SUBCATEGORIAS:
    1. ANALISA PROFUNDAMENTE: Como IA especialista, usa a 'Desc' (Descrição) e o 'Nome' para determinar a subcategoria real. Tu sabes distinguir entre Isolate, Full Spectrum, Broad Spectrum, Pets, etc., mesmo que o nome seja vago.
    2. NUNCA uses placeholders. Se o produto é um óleo de massagem, a subcategoria é "Relaxantes". Se é um bálsamo, é "Bálsamos".
    3. RIGOR TÉCNICO: O teu objetivo é ter o catálogo 100% correto tecnicamente.

    ESTRUTURA DE MENU: ${JSON.stringify(categories)}
    CATÁLOGO ATUAL:
    ${productSummary}

    JSON OUTPUT (OBRIGATÓRIO):
    {
      "reasoning": "Vou corrigir os 32 produtos que ficaram sem subcategoria, mapeando-os para os valores corretos do menu.",
      "action": "bulk_update",
      "data": {
        "bulkUpdates": [
          { "productId": "id", "updates": { "subcategory": "NomeVálido" } }
        ]
      },
      "message": "Catálogo restaurado e organizado com sucesso."
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
        temperature: 0.1 // Baixa temperatura para máxima precisão
      })
    });

    if (!response.ok) throw new Error(await response.text());
    return await response.json();
  };

  try {
    let result;
    try {
      result = await tryModel("openai/gpt-4o-mini");
    } catch (e: any) {
      await new Promise(res => setTimeout(res, 1000));
      result = await tryModel("google/gemini-pro-1.5");
    }
    
    const content = result.choices[0].message.content;
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    const jsonStr = jsonMatch ? jsonMatch[0] : content;
    return JSON.parse(jsonStr);
  } catch (error: any) {
    return { action: "unknown", message: `❌ Erro Vila: ${error.message}` };
  }
}
