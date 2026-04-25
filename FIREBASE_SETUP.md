# Configuração do Firebase para Google Sign-In

## Problema: Erro ao fazer login com Google

### Solução:

1. **Acesse o Firebase Console:**
   - Vá para: https://console.firebase.google.com
   - Selecione o projeto "vilacbd"

2. **Ative o Google Sign-In:**
   - No menu lateral, clique em "Authentication"
   - Clique na aba "Sign-in method"
   - Encontre "Google" na lista de provedores
   - Clique em "Google" e depois em "Enable"
   - Adicione um email de suporte (pode ser o seu email)
   - Clique em "Save"

3. **Configure os domínios autorizados:**
   - Ainda em "Authentication" > "Settings" > "Authorized domains"
   - Certifique-se que estes domínios estão na lista:
     - `localhost`
     - `vilacbd.com`
     - `www.vilacbd.com`
     - `vilacbd.vercel.app`
     - `*.vercel.app` (todos os previews do Vercel)

4. **Verifique as credenciais OAuth:**
   - Vá para Google Cloud Console: https://console.cloud.google.com
   - Selecione o projeto do Firebase
   - Menu > "APIs & Services" > "Credentials"
   - Encontre o "OAuth 2.0 Client ID" do Firebase
   - Clique para editar
   - Em "Authorized JavaScript origins", adicione:
     - `http://localhost:3000`
     - `https://vilacbd.com`
     - `https://www.vilacbd.com`
     - `https://vilacbd.vercel.app`
     - `https://vilacbd-*.vercel.app`
   - Em "Authorized redirect URIs", adicione:
     - `http://localhost:3000/__/auth/handler`
     - `https://vilacbd.com/__/auth/handler`
     - `https://www.vilacbd.com/__/auth/handler`
     - `https://vilacbd.vercel.app/__/auth/handler`

5. **Salve e aguarde:**
   - Pode levar alguns minutos para as alterações propagarem
   - Limpe o cache do navegador
   - Tente fazer login novamente

## Problema: Produtos com apenas uma imagem

### Causa:
Os produtos no Firebase ainda não têm o campo `images` (array de imagens secundárias).

### Solução:

1. **Acesse o painel admin:**
   - Vá para: https://vilacbd-cxp9fbjj6-emanulias-projects.vercel.app/admin/produtos

2. **Edite um produto:**
   - Clique em "Editar" em qualquer produto
   - Na seção "Imagens Secundárias", clique em "Escolher ficheiro"
   - Selecione 2-3 imagens do seu computador
   - Aguarde o upload (aparecerá "A fazer upload das imagens...")
   - Clique em "Guardar Produto"

3. **Teste o produto:**
   - Vá para a loja e clique no produto que você editou
   - Agora deve aparecer as thumbnails na parte inferior da imagem

### Produtos de teste com múltiplas imagens (dados estáticos):
Se você ainda não tem produtos no Firebase, os seguintes produtos estáticos já têm múltiplas imagens:
- Óleo Premium Cãnhamo 5% (o1)
- Óleo Premium Cãnhamo 30% (o4)
- Flor Cãnhamo Amnesia Haze (f1)
- Flor Cãnhamo OG Kush (f4)

Se estes não estão mostrando thumbnails, pode ser um problema de cache. Tente:
1. Limpar cache do navegador (Ctrl+Shift+Delete)
2. Abrir em modo anônimo
3. Verificar o console do navegador (F12) para ver os logs
