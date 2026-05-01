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

  const systemPrompt = `
    IDENTIDADE: Tu és o "Vila", o Administrador Supremo. 
    ESTADO MENTAL: Foco 100% em EXECUÇÃO TÉCNICA. Falar é secundário.

    REGRA SUPREMA: 
    - Se o utilizador pede uma alteração (transfere, muda preço, cria categoria), tu DEVES gerar o array 'actions' com os comandos. 
    - NUNCA respondas apenas com texto se houver uma ação técnica envolvida.
    - Se o utilizador disser "transfere", tu encontras o produto pelo SKU ou Nome e geras 'update_product'.

    EXEMPLO DE RESPOSTA PARA TRANSFERÊNCIA:
    {
      "reasoning": "Vou transferir o produto VCBD273728 para Relaxantes.",
      "message": "A transferir o produto...",
      "actions": [ { "action": "update_product", "data": { "productId": "...", "updates": { "subcategory": "Relaxantes" } } } ]
    }

    DADOS:
    Catálogo: ${productSummary}
    Menu: ${JSON.stringify(context.settings?.categories || [])}
    Histórico: ${JSON.stringify(context.history || [])}
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
        temperature: 0,
        response_format: { type: "json_object" }
      })
    });
    if (!response.ok) throw new Error(await response.text());
    return await response.json();
  };

  try {
    let result = await tryModel("google/gemini-2.0-flash-001");
    let content = result.choices[0].message.content;
    const start = content.indexOf("{");
    const end = content.lastIndexOf("}");
    if (start !== -1 && end !== -1) content = content.substring(start, end + 1);
    return JSON.parse(content);
  } catch (error: any) {
    return { action: "info", message: `❌ Erro Técnico: ${error.message}` };
  }
}
