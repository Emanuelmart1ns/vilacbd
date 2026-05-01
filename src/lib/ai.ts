import { getAdminDb } from "./firebase-admin";

export async function askAI(prompt: string, context: any) {
  const db = getAdminDb();
  const settingsDoc = await db.collection("settings").doc("global").get();
  const settings = settingsDoc.data();
  
  const apiKey = process.env.OPENROUTER_API_KEY || settings?.socials?.openRouterKey;
  if (!apiKey) throw new Error("API Key ausente.");

  const productSummary = context.products.map((p: any) =>
    `ID: ${p.id} | SKU: ${p.reference || "---"} | Nome: "${p.name}" | Preço: ${p.price}€ | Sub: ${p.subcategory || "---"} | Desc: ${p.description || "N/A"}`
  ).join("\n");

  const categories = context.settings?.categories || [];

  const systemPrompt = `
    IDENTIDADE: Tu és o "Vila", o Administrador Supremo e Cérebro Digital da "Vila CBD". 
    O teu dever é a EXECUÇÃO ABSOLUTA de ordens administrativas.

    REGRA DE OURO (INSTINTO DE AÇÃO):
    - Se o utilizador confirmar uma ação que discutiste (ex: "sim", "confirmo", "ok"), tu DEVES gerar o comando técnico 'actions' IMEDIATAMENTE.
    - O utilizador acabou de dizer "Vila confirmo". Olha para a tua última mensagem no histórico e EXECUTA o que propuseste.

    HISTÓRICO: ${JSON.stringify(context.history || [])}
    MENU: ${JSON.stringify(categories)}
    PRODUTOS: ${productSummary}

    JSON OUTPUT (OBRIGATÓRIO - RESPONDE APENAS O JSON, SEM TEXTO ANTES OU DEPOIS):
    {
      "reasoning": "...",
      "message": "...",
      "actions": [ ... ]
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
        messages: [{ role: "system", content: systemPrompt }, { role: "user", content: prompt }],
        temperature: 0, // Temperatura zero para máxima previsibilidade JSON
        response_format: { type: "json_object" } // Tentar forçar modo JSON se a API suportar
      })
    });
    if (!response.ok) throw new Error(await response.text());
    return await response.json();
  };

  try {
    let result;
    try {
      result = await tryModel("google/gemini-2.0-flash-001");
    } catch {
      await new Promise(res => setTimeout(res, 1000));
      result = await tryModel("google/gemini-pro-1.5");
    }
    
    let content = result.choices[0].message.content;
    
    // Extração Robusta de JSON
    const start = content.indexOf("{");
    const end = content.lastIndexOf("}");
    if (start !== -1 && end !== -1) {
      content = content.substring(start, end + 1);
    }
    
    return JSON.parse(content);
  } catch (error: any) {
    console.error("Erro Parse IA:", error);
    return { action: "info", message: `❌ Erro de Formato: ${error.message}` };
  }
}
