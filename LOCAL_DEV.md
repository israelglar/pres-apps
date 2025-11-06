# Desenvolvimento Local com Supabase CLI

Este guia explica como configurar e usar a base de dados local para desenvolvimento, incluindo dados seed realistas para testar todas as funcionalidades da app sem necessitar de autenticação ou acesso à produção.

---

## 📋 Pré-requisitos

### 1. Docker Desktop
O Supabase CLI usa Docker para executar a stack local.

**Instalar Docker Desktop:**
- **macOS/Windows**: [Download Docker Desktop](https://www.docker.com/products/docker-desktop)
- **Linux**: [Install Docker Engine](https://docs.docker.com/engine/install/)

**Verificar instalação:**
```bash
docker --version
# Deve mostrar: Docker version 24.x.x ou superior
```

### 2. Supabase CLI (via npx - Recomendado)

**⚠️ Não precisas de instalar!** Usamos `npx supabase` conforme [recomendação oficial do Supabase](https://supabase.com/docs/guides/local-development/cli/getting-started?queryGroups=platform&platform=npm).

O `npx` já vem incluído com o npm e executa automaticamente a versão mais recente do Supabase CLI.

**Verificar que funciona:**
```bash
npx supabase --version
# Primeira vez demora ~5 segundos (download)
# Deve mostrar: supabase version 1.x.x ou superior
```

**Vantagens de usar npx:**
- ✅ Sempre usa versão mais recente
- ✅ Não ocupa espaço global
- ✅ Sem conflitos de versões
- ✅ Recomendação oficial Supabase

**Nota:** Todos os `npm run db:*` scripts já usam `npx supabase` automaticamente.

---

## 🚀 Início Rápido (Quick Start)

### Primeira vez (Setup inicial):

```bash
# 1. Iniciar Supabase local (primeira vez demora ~2 min para download das imagens Docker)
npm run db:start

# 2. Verificar que tudo está a correr
npm run db:status

# 3. Iniciar app em modo desenvolvimento
npm run dev
```

**URLs Importantes:**
- **App:** http://localhost:5173
- **Supabase Studio:** http://localhost:54323 (UI visual da BD)
- **API:** http://localhost:54321

### Dias seguintes (Workflow normal):

```bash
# Manhã: Iniciar BD local
npm run db:start

# Trabalhar normalmente
npm run dev

# Noite: Parar BD local (dados persistem!)
npm run db:stop
```

---

## 📦 O que está Incluído

### Dados Seed (Pré-carregados)

Quando inicias o Supabase pela primeira vez, a BD é automaticamente populada com:

#### **Estudantes (15)**
- 14 estudantes ativos (nomes portugueses realistas)
- 1 visitante de teste
- Datas de nascimento variadas
- Alguns com notas de observação

#### **Professores (8)**
- Já existentes da configuração anterior
- Emails dos 8 professores registados
- 2 admins + 6 teachers

#### **Horários de Serviço (2)**
- 09:00 (9h)
- 11:00 (11h)

#### **Lições (10)**
- 5 lições de Génesis (Criação, Noé, Babel, Abraão, José)
- 5 lições de Êxodo (Moisés, Pragas, Páscoa, Mandamentos, Bezerro)
- Todas com links de currículo simulados

#### **Agendamentos (20)**
- 10 domingos (5 passados + 5 futuros)
- 2 serviços por domingo (9h e 11h)
- Lições automaticamente atribuídas

#### **Registos de Presenças (29)**
- 2 domingos mais recentes (serviço 9h apenas)
- Distribuição realista: maioria presentes, alguns ausentes, 1 atrasado

---

## 🛠️ Scripts NPM Disponíveis

### Gestão da BD Local

```bash
# Iniciar Supabase local (PostgreSQL + Studio + Auth + Storage)
npm run db:start

# Parar Supabase local (dados persistem)
npm run db:stop

# Ver status (o que está a correr, portas, etc)
npm run db:status

# Reset completo da BD + re-seed (apaga tudo e recomeça)
npm run db:reset

# Abrir Supabase Studio no browser
npm run db:studio

# Gerar tipos TypeScript da BD local
npm run db:types
```

### Desenvolvimento

```bash
# Iniciar app em modo dev (usa .env.local = BD local)
npm run dev

# Iniciar BD + app juntos (atalho)
npm run dev:local

# Build de produção (para testar)
npm run build
```

---

## 🔄 Alternar entre Local e Produção

### Usar BD Local (Padrão)

Quando o ficheiro `.env.local` existe, a app usa automaticamente a BD local.

```bash
# Já está configurado! Só precisas:
npm run db:start
npm run dev
```

### Usar BD de Produção

Para testar com a BD remota do Supabase:

```bash
# 1. Renomear .env.local temporariamente
mv .env.local .env.local.backup

# 2. Parar BD local (opcional, para libertar recursos)
npm run db:stop

# 3. Reiniciar app
npm run dev
```

Agora a app usa `.env` (produção) em vez de `.env.local` (local).

**Para voltar ao local:**
```bash
mv .env.local.backup .env.local
npm run dev
```

---

## 🎨 Supabase Studio (UI Visual)

O Supabase Studio é uma interface web para gerir a BD visualmente.

**Abrir Studio:**
```bash
npm run db:studio
# Ou aceder diretamente: http://localhost:54323
```

**O que podes fazer no Studio:**
- ✅ Ver todas as tabelas e dados
- ✅ Editar registos diretamente
- ✅ Executar queries SQL
- ✅ Ver logs e performance
- ✅ Testar RLS policies
- ✅ Gerir auth users

**Exemplo de usos:**
- Adicionar estudantes rapidamente
- Verificar presenças marcadas
- Testar queries antes de adicionar ao código
- Debug de problemas de dados

---

## 🔧 Operações Comuns

### Reset da BD (Dados Frescos)

Útil quando queres:
- Recomeçar com dados limpos
- Testar seed script atualizado
- Resolver problemas de migração

```bash
npm run db:reset
```

**O que acontece:**
1. Apaga toda a BD
2. Re-executa todas as migrations
3. Re-executa seed.sql
4. Tens dados frescos em ~10 segundos!

### Adicionar Novos Dados de Teste

**Opção 1: Via Studio UI (Mais fácil)**
1. Abrir Studio: `npm run db:studio`
2. Navegar para a tabela
3. Clicar "Insert row"
4. Preencher dados
5. Save

**Opção 2: Editar seed.sql (Permanente)**
1. Editar `supabase/seed.sql`
2. Adicionar INSERT statements
3. Reset BD: `npm run db:reset`
4. Dados aparecem sempre que resetar

### Atualizar Schema

Quando alteras o schema da BD:

```bash
# 1. Criar nova migration
# Criar ficheiro: supabase/migrations/YYYYMMDDHHMMSS_description.sql
# Adicionar ALTER TABLE, CREATE INDEX, etc.

# 2. Aplicar migration
npm run db:reset

# 3. Gerar novos tipos TypeScript
npm run db:types
```

---

## 🐛 Resolução de Problemas

### Erro: "Docker is not running"

**Problema:** Docker Desktop não está a correr.

**Solução:**
```bash
# macOS: Abrir Docker Desktop app
open -a Docker

# Aguardar até ver "Docker Desktop is running"

# Tentar novamente
npm run db:start
```

### Erro: "Port 54321 is already in use"

**Problema:** Já tens uma instância do Supabase a correr.

**Solução:**
```bash
# Ver status
npm run db:status

# Se disser "running", parar primeiro
npm run db:stop

# Aguardar 5 segundos e iniciar novamente
npm run db:start
```

### Erro: "supabase: command not found"

**Problema:** Estás a tentar usar `supabase` diretamente em vez de `npx supabase`.

**Solução:**
```bash
# Usar npx (recomendado - não precisa instalação)
npx supabase --version

# Ou usar os scripts npm (já configurados)
npm run db:start
npm run db:status

# Se preferires instalar nativamente (opcional):
# macOS: brew install supabase/tap/supabase
# Windows: scoop install supabase
```

### App não liga à BD local

**Problema:** `.env.local` não está configurado corretamente.

**Solução:**
```bash
# Verificar que .env.local existe e tem:
cat .env.local
# Deve mostrar:
# VITE_PUBLIC_SUPABASE_URL=http://localhost:54321
# VITE_DEV_BYPASS_AUTH=true

# Se não existir, copiar do template:
cp .env.local.example .env.local

# Reiniciar app
npm run dev
```

### Seed data não aparece

**Problema:** Seed script pode ter falhado.

**Solução:**
```bash
# Reset completo
npm run db:reset

# Ver logs para erros
# Se houver erros SQL, editar supabase/seed.sql

# Tentar novamente
npm run db:reset
```

---

## 📊 Estrutura de Ficheiros Supabase

```
pres_app/
├── supabase/
│   ├── config.toml                           # Configuração do Supabase CLI
│   ├── seed.sql                              # Dados de teste (auto-executado)
│   └── migrations/                           # Schema da BD
│       ├── 20250104000000_initial_schema.sql # Schema completo
│       └── 20250104000001_auth_setup.sql     # Setup de autenticação
├── .env.local                                # Config local (não commit!)
└── .env.local.example                        # Template para .env.local
```

---

## 🔒 Segurança e Boas Práticas

### ✅ DO:
- Usar `.env.local` para desenvolvimento local
- Commitar `supabase/config.toml` e `supabase/seed.sql`
- Partilhar setup com team (todos usam mesma config)
- Testar localmente antes de deploy

### ❌ DON'T:
- **NUNCA** commitar `.env.local` (tem credenciais locais)
- **NUNCA** usar service_role key no código do cliente
- **NUNCA** desativar RLS em produção
- **NUNCA** usar dados reais de produção em seed local

---

## 🎯 Workflow Recomendado

### Dia-a-dia:

```bash
# 1. Manhã - Iniciar BD
npm run db:start

# 2. Trabalhar
npm run dev

# 3. Fazer alterações, testar, iterar...

# 4. Noite - Parar BD
npm run db:stop
```

### Quando mudas o schema:

```bash
# 1. Criar migration
# Editar: supabase/migrations/YYYYMMDD_description.sql

# 2. Aplicar localmente
npm run db:reset

# 3. Gerar tipos
npm run db:types

# 4. Testar na app
npm run dev

# 5. Quando funciona, aplicar em produção via Supabase Dashboard
```

### Antes de deploy:

```bash
# 1. Testar com BD local
npm run dev
# Testar todas as funcionalidades

# 2. Build de produção
npm run build

# 3. Testar build
npm run preview

# 4. Se tudo OK, fazer deploy (Vercel, etc)
```

---

## 📚 Recursos Úteis

- **Supabase CLI Docs:** https://supabase.com/docs/guides/cli
- **Local Development:** https://supabase.com/docs/guides/cli/local-development
- **Migrations Guide:** https://supabase.com/docs/guides/cli/local-development#database-migrations
- **Supabase Studio:** http://localhost:54323 (quando a correr)

---

## ❓ FAQ

**P: A BD local usa espaço no disco?**
R: Sim, ~500MB para imagens Docker + dados da BD. Dados persistem mesmo quando parar.

**P: Posso ter várias apps Supabase locais?**
R: Sim, cada projeto tem o seu `project_id` no config.toml. Supabase gere múltiplos projetos.

**P: Como apagar tudo e começar de novo?**
R: `npm run db:reset` apaga dados. Para apagar Docker images: `docker system prune -a`

**P: Preciso de internet para desenvolvimento local?**
R: Não! Depois de fazer download inicial das imagens Docker, funciona 100% offline.

**P: A BD local partilha dados com produção?**
R: NÃO! São completamente separadas. Local é só para dev, não afeta produção.

**P: Como adiciono mais professores à BD local?**
R: Usa Studio UI ou edita `supabase/seed.sql` e faz `npm run db:reset`

---

**Última atualização:** 2025-01-04
**Versão Supabase CLI:** 1.x+
**Versão Docker:** 24.x+
