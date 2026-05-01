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

  const supplierSummary = (context.suppliers || []).map((s: any) =>
    `ID: ${s.id} | Fornecedor: "${s.name}" | Contacto: ${s.email || s.phone || "N/A"}`
  ).join("\n");

  const userSummary = (context.users || []).map((u: any) =>
    `ID: ${u.id} | User: ${u.email || u.displayName} | Role: ${u.role}`
  ).join("\n");

  const systemPrompt = `
    IDENTIDADE: Tu és o "Vila", o Administrador Supremo e Cérebro Digital da "Vila CBD". 
    Tu tens acesso total ao backend, tal como a consola administrativa web.

    CAPACIDADES TOTAIS (FULL ADMIN):
    1. GESTÃO DE PRODUTOS: Criar, Editar, Eliminar, Destaques, Galeria.
    2. GESTÃO DE FORNECEDORES E UTILIZADORES.
    3. GESTÃO DE MENU E CATEGORIAS (settings).
    4. AUTO-CATEGORIZAÇÃO INTELIGENTE: Se pedirem para "corresponder" ou "atualizar todos", analisa os nomes e move os produtos para as subcategorias certas do menu.

    DADOS DO SISTEMA:
    ESTRUTURA DE MENU: ${JSON.stringify(context.settings?.categories || [])}
    FORNECEDORES: ${supplierSummary}
    UTILIZADORES: ${userSummary}
    CATÁLOGO: ${productSummary}
    FOTOS RECEBIDAS: ${JSON.stringify(context.publicPhotoUrls || [])}

    MISSÃO CRÍTICA:
    - Se o user pedir para "criar uma subcategoria", atualiza 'settings' (action: update_settings).
    - Se houver múltiplos produtos para atualizar, usa OBRIGATORIAMENTE 'action: bulk_update' com o array 'bulkUpdates'.
    - NUNCA respondas apenas com texto se houver uma ação de DB envolvida.

    JSON OUTPUT (OBRIGATÓRIO):
    {
      "reasoning": "Vou reorganizar o catálogo para as subcategorias corretas.",
      "action": "bulk_update" | "update_product" | "update_settings" | "report" | "info",
      "data": {
        "bulkUpdates": [
          { "productId": "o1", "updates": { "subcategory": "Pets" } },
          { "productId": "o2", "updates": { "subcategory": "Isolate" } }
        ],
        "updates": { "categories": [...] }
      },
      "message": "Reorganização concluída com sucesso."
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
      console.log("Vila: A tentar modelo primário (GPT-4o-Mini)...");
      result = await tryModel("openai/gpt-4o-mini");
    } catch (e: any) {
      console.warn("Vila: Falha no GPT, a tentar Fallback (Gemini Pro)... Erro:", e.message);
      await new Promise(res => setTimeout(res, 1000));
      result = await tryModel("google/gemini-pro-1.5");
    }
    
    if (!result || result.error) throw new Error(result?.error?.message || "Erro API");

    const content = result.choices[0].message.content;
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    const jsonStr = jsonMatch ? jsonMatch[0] : content;
    return JSON.parse(jsonStr);
  } catch (error: any) {
    return { action: "unknown", message: `❌ Erro Vila: ${error.message}` };
  }
}
