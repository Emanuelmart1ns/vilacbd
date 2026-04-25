# Configuração das Variáveis de Ambiente no Vercel

## Problema: Erro "is not valid JSON"

Este erro acontece porque o Firebase Admin SDK precisa das credenciais corretas no Vercel.

## Solução: Configurar Variáveis de Ambiente

### Passo 1: Obter o Service Account Key

1. **Acesse o Firebase Console:**
   - https://console.firebase.google.com
   - Selecione o projeto "vilacbd"

2. **Vá para Project Settings:**
   - Clique no ícone de engrenagem ⚙️ ao lado de "Project Overview"
   - Clique em "Project settings"

3. **Acesse Service Accounts:**
   - Clique na aba "Service accounts"
   - Clique em "Generate new private key"
   - Confirme clicando em "Generate key"
   - Um arquivo JSON será baixado

4. **Abra o arquivo JSON:**
   - Abra o arquivo baixado com um editor de texto
   - Copie TODO o conteúdo (é um JSON grande)

### Passo 2: Adicionar no Vercel

1. **Acesse o Vercel Dashboard:**
   - https://vercel.com/dashboard
   - Selecione o projeto "vilacbd"

2. **Vá para Settings:**
   - Clique em "Settings" no menu superior
   - Clique em "Environment Variables" no menu lateral

3. **Adicione a variável:**
   - **Name:** `FIREBASE_SERVICE_ACCOUNT_KEY`
   - **Value:** Cole TODO o conteúdo do arquivo JSON (incluindo as chaves `{}`)
   - **Environment:** Selecione "Production", "Preview" e "Development"
   - Clique em "Save"

### Passo 3: Fazer Redeploy

Depois de adicionar a variável:

1. **Vá para "Deployments"**
2. **Clique nos 3 pontinhos** do último deployment
3. **Clique em "Redeploy"**
4. Aguarde o deploy terminar

### Passo 4: Testar

Acesse novamente:
```
https://[seu-deployment].vercel.app/api/reseed
```

Deve funcionar agora! ✅

---

## Alternativa: Usar Variáveis Individuais

Se preferir, pode usar variáveis separadas em vez do JSON completo:

1. **FIREBASE_ADMIN_PROJECT_ID** = `vilacbd` (ou o ID do seu projeto)
2. **FIREBASE_ADMIN_CLIENT_EMAIL** = (copie do JSON: `client_email`)
3. **FIREBASE_ADMIN_PRIVATE_KEY** = (copie do JSON: `private_key`)

---

## Verificar Configuração

Depois de configurar, acesse:
```
https://[seu-deployment].vercel.app/api/check-env
```

Deve mostrar:
```json
{
  "hasServiceAccountKey": true,
  "serviceAccountKeyPrefix": "{\"type\":\"service_account\",\"project_id\":\"vilacbd\"..."
}
```

Se mostrar `false` ou começar com "NEXT_PUBLI", a variável não foi configurada corretamente.
