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
    2. GESTÃO DE FORNECEDORES: Criar, Editar dados de contacto, Eliminar fornecedores.
    3. GESTÃO DE UTILIZADORES: Alterar permissões (roles) e dados de utilizadores.
    4. GESTÃO DE LOJA: Categorias, Subcategorias, Moradas, Horários.
    5. RELATÓRIOS E ESTATÍSTICAS.

    DADOS DO SISTEMA:
    ESTRUTURA DE MENU: ${JSON.stringify(context.settings?.categories || [])}
    FORNECEDORES: ${supplierSummary}
    UTILIZADORES: ${userSummary}
    CATÁLOGO: ${productSummary}

    JSON OUTPUT (OBRIGATÓRIO):
    {
      "reasoning": "...",
      "action": "update_product" | "create_product" | "delete_product" | "update_supplier" | "create_supplier" | "delete_supplier" | "update_user" | "update_settings" | "bulk_update" | "report",
      "data": {
        "productId": "...",
        "supplierId": "...",
        "userId": "...",
        "updates": { ... },
        "newSupplier": { "name": "...", "email": "...", "phone": "..." }
      },
      "message": "Mensagem de confirmação elegante."
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
