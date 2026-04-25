# Correções Rápidas

## 🔥 Problema 1: Google Login - "Domain not authorized"

### Solução Rápida:

1. **Acesse o Firebase Console:**
   - https://console.firebase.google.com
   - Selecione o projeto "vilacbd"

2. **Adicione os domínios do Vercel:**
   - Menu lateral > **Authentication**
   - Aba **Settings** > **Authorized domains**
   - Clique em **Add domain**
   - Adicione estes domínios (um de cada vez):
     ```
     vilacbd-q77neyiln-emanulias-projects.vercel.app
     vilacbd.vercel.app
     ```
   - Clique em **Add** para cada um

3. **Teste novamente:**
   - Aguarde 1-2 minutos
   - Tente fazer login com Google novamente

---

## 🖼️ Problema 2: Produtos com apenas 1 imagem

### Causa:
Os produtos no Firebase não têm o campo `images` (array de imagens secundárias).

### Solução Rápida - Opção A: Atualizar via API

1. **Acesse esta URL no navegador:**
   ```
   https://vilacbd-q77neyiln-emanulias-projects.vercel.app/api/update-images
   ```

2. **Você verá uma mensagem:**
   ```json
   {
     "message": "X produtos atualizados com imagens secundárias!",
     "details": [...]
   }
   ```

3. **Recarregue a loja e teste:**
   - Vá para a loja
   - Clique em "Óleo Premium Cãnhamo 5%" ou "Flor Amnesia Haze"
   - Agora deve aparecer as thumbnails!

### Solução Rápida - Opção B: Adicionar manualmente

1. **Acesse o painel admin:**
   ```
   https://vilacbd-q77neyiln-emanulias-projects.vercel.app/admin/produtos
   ```

2. **Edite um produto:**
   - Clique em "Editar" em qualquer produto
   - Na seção "Imagens Secundárias", clique em "Escolher ficheiro"
   - Selecione 2-3 imagens do seu PC
   - Aguarde o upload
   - Clique em "Guardar Produto"

3. **Teste o produto:**
   - Vá para a loja
   - Clique no produto que editou
   - Deve aparecer as thumbnails!

---

## ✅ Verificação

Após aplicar as correções:

1. **Google Login:**
   - Vá para `/login`
   - Clique em "Entrar com Google"
   - Deve abrir o popup do Google sem erros

2. **Múltiplas Imagens:**
   - Vá para a loja
   - Clique num produto
   - Deve aparecer "X imagens" na parte inferior
   - Deve ter thumbnails clicáveis

---

## 🆘 Se ainda não funcionar

Abra o console do navegador (F12) e tire um print da aba "Console" para eu ver os erros.
