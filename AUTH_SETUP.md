# Guia de Configuração: Google OAuth Authentication

Este guia detalha todos os passos necessários para configurar a autenticação com Google OAuth na aplicação Prés App.

## 🚀 Modo de Desenvolvimento (Bypass Authentication)

**Para desenvolvimento local ou testes em telemóvel via IP do computador:**

1. Cria um ficheiro `.env.local` na raiz do projeto:
   ```bash
   cp .env.local.example .env.local
   ```

2. Edita `.env.local` e define:
   ```env
   VITE_DEV_BYPASS_AUTH=true
   ```

3. Reinicia o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

**O que acontece:**
- ✅ Podes aceder à app sem fazer login
- ✅ Todos os features funcionam normalmente
- ✅ Usa um professor mock: "Dev Teacher"
- ✅ Perfeito para testar no telemóvel via `192.168.x.x:5173`
- ⚠️ **NUNCA ativar em produção!**

---

## 📋 Pré-requisitos (Produção)

- Acesso ao [Google Cloud Console](https://console.cloud.google.com)
- Acesso ao [Supabase Dashboard](https://app.supabase.com)
- Acesso à base de dados Supabase (via SQL Editor)

---

## 🔧 Fase 1: Configurar Google Cloud Console

### Passo 1.1: Criar Projeto (se necessário)

1. Aceder ao [Google Cloud Console](https://console.cloud.google.com)
2. Criar novo projeto ou selecionar projeto existente
3. Anotar o nome do projeto

### Passo 1.2: Configurar OAuth Consent Screen

1. No menu lateral, ir a: **APIs & Services → OAuth consent screen**
2. Selecionar **External** user type
3. Preencher informação obrigatória:
   - **App name**: `Prés App`
   - **User support email**: O teu email
   - **Developer contact email**: O teu email
4. Clicar em **Save and Continue**
5. Em **Scopes**, adicionar:
   - `openid`
   - `.../auth/userinfo.email`
   - `.../auth/userinfo.profile`
6. Clicar em **Save and Continue** até finalizar

### Passo 1.3: Criar OAuth Client ID

1. No menu lateral, ir a: **APIs & Services → Credentials**
2. Clicar em **+ CREATE CREDENTIALS** → **OAuth client ID**
3. Selecionar **Application type**: **Web application**
4. **Name**: `Prés App - Web Client`
5. **Authorized JavaScript origins**:
   - Adicionar: `http://localhost:5173` (desenvolvimento)
   - Adicionar: `https://your-domain.vercel.app` (produção)
6. **Authorized redirect URIs**:
   - **IMPORTANTE:** Obter este URL do Supabase Dashboard primeiro (ver Fase 2.1)
   - Formato: `https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback`
7. Clicar em **CREATE**
8. **GUARDAR:**
   - Client ID
   - Client Secret

---

## 🗄️ Fase 2: Configurar Supabase Dashboard

### Passo 2.1: Obter Redirect URI

1. Aceder ao [Supabase Dashboard](https://app.supabase.com)
2. Selecionar o projeto
3. Ir a: **Authentication → Providers**
4. Procurar **Google** na lista
5. Copiar o **Callback URL (for OAuth)**: `https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback`
6. **Voltar ao Google Cloud Console** e adicionar este URL aos **Authorized redirect URIs** (Fase 1.3, passo 6)

### Passo 2.2: Ativar Google Provider

1. Ainda em **Authentication → Providers**
2. Clicar em **Google**
3. Ativar **Enable Sign in with Google**
4. Colar:
   - **Client ID** (da Fase 1.3)
   - **Client Secret** (da Fase 1.3)
5. Clicar em **Save**

---

## 🛢️ Fase 3: Executar Scripts SQL na Base de Dados

### Passo 3.1: Executar Script de Setup

1. Aceder ao **Supabase Dashboard → SQL Editor**
2. Criar nova query
3. Copiar todo o conteúdo do ficheiro: `database/auth-setup.sql`
4. Colar no SQL Editor
5. Clicar em **Run** (ou `Ctrl+Enter`)
6. Verificar que não há erros

**O que este script faz:**
- Adiciona coluna `auth_user_id` à tabela `teachers`
- Cria função `check_teacher_whitelist()` (valida emails antes de permitir login)
- Cria trigger `link_teacher_on_signup()` (liga professores a auth.users automaticamente)
- Atualiza RLS policies para exigir autenticação

---

## 🔗 Fase 4: Ativar Auth Hook no Supabase

**IMPORTANTE:** Este passo é crítico para a segurança.

1. Aceder ao **Supabase Dashboard**
2. Ir a: **Authentication → Hooks**
3. Encontrar **Before User Created** hook
4. Selecionar **PostgreSQL Function**: `public.check_teacher_whitelist`
5. Clicar em **Enable Hook**

**O que isto faz:**
- Antes de qualquer utilizador ser criado via Google OAuth, a função valida se o email está registado na tabela `teachers`
- Se o email NÃO estiver registado, o login é bloqueado
- Apenas os 8 professores pré-registados conseguem fazer login

---

## ✅ Fase 5: Testar a Configuração

### Teste 1: Login com Email Autorizado

1. Aceder à aplicação: `http://localhost:5173` (ou URL de produção)
2. Será redirecionado para `/login`
3. Clicar em **Entrar com Google**
4. Selecionar conta Google de um dos 8 professores registados
5. ✅ Deve fazer login com sucesso e redirecionar para a home page
6. Verificar que aparece: "Olá, [Nome]!" no topo
7. Verificar que o botão de logout (ícone) aparece no canto superior direito

### Teste 2: Login com Email Não Autorizado

1. Fazer logout (clicar no ícone no canto superior direito)
2. Clicar em **Entrar com Google**
3. Selecionar conta Google que **NÃO está** registada como professor
4. ✅ Deve ver erro: "Acesso restrito. Apenas professores autorizados podem fazer login."
5. Não deve ser redirecionado

### Teste 3: Desenvolvimento com Bypass

1. Criar ficheiro `.env.local` com `VITE_DEV_BYPASS_AUTH=true`
2. Reiniciar servidor: `npm run dev`
3. Abrir no telemóvel: `http://192.168.x.x:5173`
4. ✅ Deve entrar diretamente na home page sem login
5. ✅ Aparece "Olá, Dev Teacher!" no topo
6. ✅ Todos os features funcionam

---

## 🐛 Resolução de Problemas

### Problema: "Unsupported provider: provider is not enabled"

**Causa:** Google provider não está ativado no Supabase.

**Solução:**
1. Supabase Dashboard → Authentication → Providers → Google
2. Ativar toggle "Enable Sign in with Google"
3. Adicionar Client ID e Client Secret
4. Clicar em Save

### Problema: "Redirect URI mismatch"

**Causa:** O Redirect URI no Google Cloud Console não corresponde ao do Supabase.

**Solução:**
1. Ir ao Supabase Dashboard → Authentication → Providers → Google
2. Copiar o **Callback URL** exato
3. Ir ao Google Cloud Console → Credentials → OAuth Client
4. Adicionar o URL exato aos **Authorized redirect URIs**
5. Aguardar 5-10 minutos para propagar

### Problema: Não consigo testar no telemóvel via IP

**Solução:**
1. Criar `.env.local` com `VITE_DEV_BYPASS_AUTH=true`
2. Reiniciar `npm run dev`
3. Aceder via `http://192.168.x.x:5173` (IP do computador)
4. Agora não precisa de login!

---

## 📝 Checklist de Verificação Final

**Produção:**
- [ ] Google OAuth Client criado com Redirect URI correto
- [ ] Google provider ativado no Supabase com Client ID e Secret
- [ ] Script SQL `auth-setup.sql` executado sem erros
- [ ] Auth hook "Before User Created" ativado no Supabase
- [ ] Teste de login com email autorizado: ✅ Sucesso
- [ ] Teste de login com email não autorizado: ✅ Bloqueado
- [ ] `VITE_DEV_BYPASS_AUTH` NÃO está definido em produção

**Desenvolvimento:**
- [ ] `.env.local` criado com `VITE_DEV_BYPASS_AUTH=true`
- [ ] Servidor reiniciado após criar `.env.local`
- [ ] Consegue aceder sem login em `localhost:5173`
- [ ] Consegue aceder sem login via IP no telemóvel

---

## 🔒 Segurança

**Três camadas de proteção (apenas em produção):**

1. **Auth Hook (Servidor):** Valida email antes de criar utilizador
2. **RLS Policies (Base de Dados):** Exige autenticação para aceder dados
3. **Application Check (React):** Valida perfil de professor após login

**Modo de Desenvolvimento:**
- Bypass apenas ativo quando `VITE_DEV_BYPASS_AUTH=true`
- Variável começa com `VITE_` = exposta ao cliente (não é secreta)
- **NUNCA** definir em produção (Vercel não deve ter esta variável)
- Console mostra aviso: "⚠️ DEVELOPMENT MODE: Authentication bypassed"

---

**Última atualização:** 2025-01-04
