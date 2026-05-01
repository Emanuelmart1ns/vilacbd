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
    1. GESTÃO DE PRODUTOS: Criar, Editar (nome, preço, stock, subcategoria, isPopular, images) e Eliminar.
    2. GESTÃO DE GALERIA: Reordenar as fotos do produto (campo 'images'). A primeira foto (índice 0) é sempre a principal.
    3. PRODUTOS EM DESTAQUE: Ativar ou desativar o destaque (campo 'isPopular').

    DICIONÁRIO DE MAPEAMENTO:
    - "Destaque" / "Principal" -> Alterar 'isPopular' para true ou false.
    - "Fotos" / "Galeria" -> Alterar o array 'images'. 
    - "Subcategoria" -> Alterar 'subcategory'.

    FOTOS RECEBIDAS AGORA:
    ${JSON.stringify(context.publicPhotoUrls || [])}
    (Usa estes URLs se o utilizador quiser adicionar fotos ao produto agora).

    CATÁLOGO ATUAL:
    ${productSummary}
    (Nota: Se pedirem para reordenar fotos, consulta o campo 'images' no DB interno que te é passado).

    JSON OUTPUT (OBRIGATÓRIO):
    {
      "reasoning": "O utilizador quer colocar o produto em destaque e trocar a foto principal.",
      "action": "update_product",
      "data": {
        "productId": "o1",
        "updates": { 
          "isPopular": true, 
          "images": ["/url-foto-nova.jpg", "/url-foto-antiga.jpg"] 
        }
      },
      "message": "Produto colocado em destaque e galeria de fotos atualizada."
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
