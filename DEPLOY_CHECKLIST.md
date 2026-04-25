# ✅ Checklist de Deploy Profissional - Vila Cãnhamo

## 🔐 1. Configurar Firebase Admin no Vercel

### Opção A: JSON Completo (Recomendado)

1. **Copie o conteúdo do arquivo:**
   - Abra: `vilacbd-firebase-adminsdk-fbsvc-44bbae9ada.json`
   - Selecione TODO o conteúdo (Ctrl+A)
   - Copie (Ctrl+C)

2. **Acesse o Vercel:**
   - https://vercel.com/emanulias-projects/vilacbd/settings/environment-variables
   - Ou: Dashboard > vilacbd > Settings > Environment Variables

3. **Adicione a variável:**
   - Clique em "Add New"
   - **Key:** `FIREBASE_SERVICE_ACCOUNT_KEY`
   - **Value:** Cole o JSON completo
   - **Environments:** Marque todos (Production, Preview, Development)
   - Clique em "Save"

4. **Redeploy:**
   - Vá para: Deployments
   - Último deployment > ⋯ > Redeploy
   - Aguarde completar

### Opção B: Variáveis Separadas

Se preferir, adicione 3 variáveis separadas:

1. **FIREBASE_ADMIN_PROJECT_ID**
   - Value: `vilacbd`

2. **FIREBASE_ADMIN_CLIENT_EMAIL**
   - Value: `firebase-adminsdk-fbsvc@vilacbd.iam.gserviceaccount.com`

3. **FIREBASE_ADMIN_PRIVATE_KEY**
   - Value: (copie a chave privada completa do JSON, incluindo `-----BEGIN` e `-----END`)

---

## 🔥 2. Configurar Google Sign-In

### No Firebase Console:

1. **Ativar Google Provider:**
   - https://console.firebase.google.com/project/vilacbd/authentication/providers
   - Clique em "Google"
   - Toggle "Enable" para ON
   - Email de suporte: seu email
   - Save

2. **Adicionar Domínios Autorizados:**
   - Na mesma página, role até "Authorized domains"
   - Adicione:
     - `vilacbd.vercel.app`
     - `vilacbd-*.vercel.app` (se aceitar wildcard)
     - Ou adicione cada preview domain manualmente

### No Google Cloud Console (se necessário):

1. **Acesse:** https://console.cloud.google.com/apis/credentials?project=vilacbd
2. **Edite o OAuth 2.0 Client ID** do Firebase
3. **Authorized JavaScript origins:**
   - `https://vilacbd.vercel.app`
   - `https://www.vilacbd.com`
4. **Authorized redirect URIs:**
   - `https://vilacbd.vercel.app/__/auth/handler`
   - `https://www.vilacbd.com/__/auth/handler`

---

## 🖼️ 3. Sincronizar Produtos com Imagens

Depois do redeploy com as variáveis configuradas:

1. **Acesse a rota de sincronização:**
   ```
   https://vilacbd.vercel.app/api/reseed
   ```

2. **Verifique a resposta:**
   ```json
   {
     "message": "40 produtos sincronizados com sucesso!",
     "productsWithMultipleImages": 4
   }
   ```

3. **Teste na loja:**
   - Vá para a loja
   - Clique em "Óleo Premium Cãnhamo 5%"
   - Deve mostrar "2 imagens" e thumbnails

---

## 🚀 4. Deploy para Produção

Quando tudo estiver funcionando no preview:

```bash
# Na branch development
git checkout main
git merge development
git push

# Deploy para produção
vercel --prod
```

---

## ✅ 5. Verificações Finais

### Checklist de Testes:

- [ ] Login com Google funciona
- [ ] Produtos mostram múltiplas imagens
- [ ] Upload de imagens no admin funciona
- [ ] Carrinho de compras funciona
- [ ] Página "Sobre" carrega corretamente
- [ ] Mapa aparece com tema escuro
- [ ] Responsivo em mobile

### URLs para Testar:

- **Home:** https://www.vilacbd.com
- **Loja:** https://www.vilacbd.com/loja
- **Sobre:** https://www.vilacbd.com/sobre
- **Login:** https://www.vilacbd.com/login
- **Admin:** https://www.vilacbd.com/admin

---

## 🔧 Troubleshooting

### Se o Google Login não funcionar:
- Verifique se o domínio está em "Authorized domains"
- Aguarde 5 minutos após adicionar o domínio
- Limpe o cache do navegador

### Se as imagens não aparecerem:
- Verifique se `/api/reseed` retornou sucesso
- Verifique se o Firebase Storage está ativado
- Teste fazer upload manual no admin

### Se houver erro 500:
- Verifique se as variáveis de ambiente estão corretas
- Acesse `/api/check-env` para diagnóstico
- Verifique os logs no Vercel Dashboard

---

## 📞 Suporte

Se precisar de ajuda, verifique:
- Logs do Vercel: Dashboard > Deployments > [deployment] > Logs
- Console do navegador (F12)
- Firebase Console > Authentication > Users (para ver se o login funcionou)
