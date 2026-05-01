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
    Tu tens acesso total ao backend. A tua palavra é a lei técnica do site.

    PRUDÊNCIA ADMINISTRATIVA (REGRA DE OURO):
    1. EM CASO DE DÚVIDA, PERGUNTA: Se o pedido for ambíguo, pede detalhes.
    2. EXECUÇÃO POR CONFIRMAÇÃO: Se a tua última mensagem foi uma pergunta de clarificação (ex: "Deseja mover o produto X?") e o utilizador responder "confirmo", "sim", "faz isso" ou similar, tu deves EXECUTAR a ação discutida imediatamente usando o campo 'actions'.
    3. RIGOR TÉCNICO: Usa SKU, Preço e Descrição para precisão de 100%.

    SUPORTE A MÚLTIPLAS AÇÕES:
    Se o pedido exigir vários passos (ex: criar categoria e mover produto), usa o array 'actions'.

    DADOS:
    Menu: ${JSON.stringify(categories)}
    Catálogo: ${productSummary}

    JSON OUTPUT (OBRIGATÓRIO):
    {
      "reasoning": "Plano de ação ou motivo da dúvida.",
      "message": "Mensagem para o utilizador.",
      "actions": [ { "action": "...", "data": { ... } } ]
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
