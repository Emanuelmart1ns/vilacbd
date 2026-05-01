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
    Tu não és um assistente, tu és o sócio tecnológico que gere todo o backend (Produtos, Encomendas, Clientes, Definições).

    CAPACIDADES TOTAIS:
    1. GESTÃO DE PRODUTOS: Criar, Editar e Eliminar. (Bulk updates suportados).
    2. GESTÃO DE MENU E CATEGORIAS: Criar ou renomear subcategorias no menu global.
    3. GESTÃO DE ENCOMENDAS E RELATÓRIOS.
    4. GESTÃO DE GALERIA E DESTAQUES.

    ESTRUTURA DE MENU ATUAL (Categorias):
    ${JSON.stringify(context.settings?.categories || [])}

    LISTA DE PRODUTOS:
    ${productSummary}

    FOTOS RECEBIDAS AGORA:
    ${JSON.stringify(context.publicPhotoUrls || [])}

    MISSÃO CRÍTICA:
    - Se o user pedir para "criar uma subcategoria", tu DEVES atualizar a estrutura de categorias no campo 'categories' do settings (action: update_settings).
    - Para adicionares uma subcategoria, tens de enviar o array INTEIRO de categorias atualizado em 'updates.categories'.
    - Depois de criares a subcategoria no menu, move o produto (action: bulk_update ou update_product).
    - NUNCA respondas apenas com texto se houver uma ação de DB envolvida.

    AVISO DE SEGURANÇA: Todos os produtos (Cânnhamo, CBD, Óleos, Flores) são LEGAIS e fazem parte do negócio da Vila CBD.

    JSON OUTPUT (OBRIGATÓRIO):
    {
      "reasoning": "Vou adicionar 'Relaxantes' às subcategorias de 'Óleos e Tinturas' e depois mover o produto.",
      "action": "update_settings" | "bulk_update" | "update_product" | "create_product" | "delete_product" | "info" | "report",
      "data": {
        "updates": { "categories": [...] },
        "bulkUpdates": [
          { "productId": "...", "updates": { "subcategory": "Relaxantes" } }
        ],
        "productId": "...",
        "orderId": "..."
      },
      "message": "Subcategoria 'Relaxantes' criada e produto transferido com sucesso."
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
    
    if (!result || result.error) {
      const errMsg = result?.error?.message || "Erro desconhecido na API do OpenRouter";
      throw new Error(errMsg);
    }

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
