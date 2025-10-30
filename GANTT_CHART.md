# Prés App - Desenvolvimento de Funcionalidades
## Gráfico de Gantt - Próximas Funcionalidades Prioritárias

```
Funcionalidade                          | Sem 1 | Sem 2 | Sem 3 | Sem 4 | Sem 5 | Sem 6 | Sem 7 | Sem 8 | Sem 9 | Sem 10 | Sem 11 |
----------------------------------------|-------|-------|-------|-------|-------|-------|-------|-------|-------|--------|--------|
1. Suporte para Múltiplos Horários     | ████████|       |       |       |       |       |       |       |       |        |        |
   (9h e 11h)                          |       |       |       |       |       |       |       |       |       |        |        |
                                        |       |       |       |       |       |       |       |       |       |        |        |
2. Notas/Comentários sobre Alunos      |       | ████████████  |       |       |       |       |       |       |       |        |        |
   (campo opcional durante marcação)   |       |       |       |       |       |       |       |       |       |        |        |
                                        |       |       |       |       |       |       |       |       |       |        |        |
3. Sistema de Alertas de Faltas        |       |       | ████████████  |       |       |       |       |       |       |        |        |
   (2-3 faltas seguidas)               |       |       |       |       |       |       |       |       |       |        |        |
                                        |       |       |       |       |       |       |       |       |       |        |        |
4. Adicionar Visitantes Rapidamente    |       |       |       | ████████      |       |       |       |       |       |        |        |
   (+ botão durante marcação)          |       |       |       |       |       |       |       |       |       |        |        |
                                        |       |       |       |       |       |       |       |       |       |        |        |
5. Editar Presenças Após Submissão     |       |       |       |       | ████████████  |       |       |       |       |        |        |
   (correções e chegadas tardias)      |       |       |       |       |       |       |       |       |       |        |        |
                                        |       |       |       |       |       |       |       |       |       |        |        |
6. Widget Lista de Cuidadores          |       |       |       |       |       | ████████████  |       |       |       |        |        |
   (home page com alunos atribuídos)   |       |       |       |       |       |       |       |       |       |        |        |
                                        |       |       |       |       |       |       |       |       |       |        |        |
7. Histórico de Lições & Recursos      |       |       |       |       |       |       | ████████████████|       |       |        |        |
   (notas, recursos, avaliação)        |       |       |       |       |       |       |       |       |       |        |        |
                                        |       |       |       |       |       |       |       |       |       |        |        |
8. Ver Todas as Lições do Ano          |       |       |       |       |       |       |       |       | ████████████████████████|
   (PDFs, filtro por professor)        |       |       |       |       |       |       |       |       |       |        |        |
```

---

## Detalhes das Funcionalidades Prioritárias

### 🔴 **Funcionalidade 1: Suporte para Múltiplos Horários de Culto**
**Prioridade:** CRÍTICA (Expansão iminente do ministério)
**Duração Estimada:** 1 semana
**Complexidade:** Média

**Descrição:**
- Adicionar seletor de horário na página de seleção de data
- Opções: 9:00h e 11:00h (preparado para mais horários no futuro)
- Registos de presença separados por horário
- Atualizar API para suportar parâmetro de horário

**Tarefas:**
- [ ] Design do seletor (dropdown ou tabs)
- [ ] Atualizar modelo de dados (adicionar `serviceTime`)
- [ ] Modificar `DateSelectionPage.tsx`
- [ ] Atualizar schema Zod com novo campo
- [ ] Atualizar Google Apps Script backend
- [ ] Atualizar estrutura do Google Sheets
- [ ] Testar com ambos os horários
- [ ] Atualizar ecrã de conclusão para mostrar horário

**Dependências:** Nenhuma

---

### 🟡 **Funcionalidade 2: Notas/Comentários sobre Alunos**
**Prioridade:** ALTA
**Duração Estimada:** 1.5 semanas
**Complexidade:** Média-Baixa

**Descrição:**
- Campo opcional para adicionar notas ao marcar cada aluno
- Exemplos: "Parecia cansado", "Fez boas perguntas", "Precisa de acompanhamento"
- Notas guardadas com o registo de presença
- Visualizar notas no histórico de presenças

**Tarefas:**
- [ ] Adicionar campo de notas em `SearchAttendanceMarkingPage`
- [ ] Adicionar campo de notas em `AttendanceMarkingPage` (método swipe)
- [ ] Design UI: Modal ou input expandível
- [ ] Atualizar modelo `AttendanceRecord` com campo `notes`
- [ ] Atualizar schema Zod
- [ ] Atualizar backend para guardar notas
- [ ] Criar visualização de notas (histórico)
- [ ] Testar em mobile (teclado não deve bloquear interface)

**Dependências:** Nenhuma

---

### 🟢 **Funcionalidade 3: Sistema de Alertas de Faltas**
**Prioridade:** ALTA
**Duração Estimada:** 1.5 semanas
**Complexidade:** Média

**Descrição:**
- Alerta automático quando aluno faltou 2-3 aulas recentes
- Mostrar durante marcação de presença
- Sugestão de ação: "Considera falar com ele/ela"
- Limiar configurável (2-3 faltas)

**Tarefas:**
- [ ] Criar lógica para calcular faltas recentes
- [ ] Design do componente de alerta (banner, modal, badge)
- [ ] Integrar em ambos os métodos de marcação
- [ ] Adicionar configuração de limiar (admin)
- [ ] Testar cálculo com dados históricos reais
- [ ] Adicionar opção "Já falei com o aluno" (dismiss)
- [ ] Guardar histórico de alertas

**Dependências:** Funcionalidade 2 (útil ter notas para follow-up)

---

### 🔵 **Funcionalidade 4: Adicionar Visitantes Rapidamente**
**Prioridade:** MÉDIA-ALTA
**Duração Estimada:** 1 semana
**Complexidade:** Baixa-Média

**Descrição:**
- Botão "+ Adicionar Visitante" na interface de marcação
- Input simples de nome
- Marca visitante como Presente automaticamente
- Visitantes armazenados com flag `isVisitor: true`
- Possibilidade de converter para aluno regular depois

**Tarefas:**
- [ ] Adicionar botão em ambos métodos de marcação
- [ ] Criar modal/dialog para input de nome
- [ ] Atualizar modelo de dados com flag `isVisitor`
- [ ] Atualizar backend para suportar visitantes
- [ ] Criar interface admin para converter visitante → aluno
- [ ] Testar fluxo completo
- [ ] Adicionar filtro na lista de alunos (mostrar/ocultar visitantes)

**Dependências:** Nenhuma

---

### 🟣 **Funcionalidade 5: Editar Presenças Após Submissão**
**Prioridade:** MÉDIA-ALTA
**Duração Estimada:** 1.5 semanas
**Complexidade:** Média-Alta

**Descrição:**
- Permitir correção de erros após guardar
- Lidar com chegadas tardias
- Acesso para admin e professores
- Audit trail (histórico de edições)

**Tarefas:**
- [ ] Criar página de histórico de presenças
- [ ] Adicionar botão "Editar" em cada registo
- [ ] Criar interface de edição (similar a marcação inicial)
- [ ] Implementar endpoint PATCH no backend
- [ ] Adicionar timestamps de edição
- [ ] Guardar histórico de alterações (quem, quando, o quê)
- [ ] Testar permissões (admin vs professor)
- [ ] Adicionar confirmação antes de editar

**Dependências:** Funcionalidade 9 (Autenticação Google) para roles

---

### 🟠 **Funcionalidade 6: Widget Lista de Cuidadores**
**Prioridade:** MÉDIA
**Duração Estimada:** 1.5 semanas
**Complexidade:** Média

**Descrição:**
- Seção "Meus Pré-adolescentes" na home page
- Mostrar 3-5 alunos atribuídos ao professor logado
- Lembretes: "Lembra-te de falar com..."
- Clicar em aluno para ver histórico de presenças
- Interface admin para atribuir cuidadores

**Tarefas:**
- [ ] Design do widget (home page)
- [ ] Criar modelo de dados para atribuição cuidador-aluno
- [ ] Criar interface admin para atribuições
- [ ] Implementar lógica de filtragem por professor
- [ ] Criar página de detalhe do aluno (histórico)
- [ ] Integrar com sistema de autenticação
- [ ] Migrar dados do Excel existente
- [ ] Testar com múltiplos professores

**Dependências:** Funcionalidade 9 (Autenticação) NECESSÁRIA

---

### 🟤 **Funcionalidade 7: Histórico de Lições & Recursos**
**Prioridade:** MÉDIA
**Duração Estimada:** 2 semanas
**Complexidade:** Média-Alta

**Descrição:**
- Secção acessível no menu de navegação
- Lista de todas as lições passadas (data, nome, link)
- Para cada lição:
  - Recursos partilhados (links, ficheiros, notas)
  - Comentários (o que funcionou, observações)
  - Avaliação do currículo (votar/classificar)
- Editor de texto rico para notas
- Suporte para anexos

**Tarefas:**
- [ ] Criar nova rota `/lesson-history`
- [ ] Design da página de lista de lições
- [ ] Design da página de detalhe da lição
- [ ] Implementar editor de texto rico (ex: TipTap, Quill)
- [ ] Adicionar sistema de upload de ficheiros
- [ ] Criar sistema de avaliação/classificação
- [ ] Atualizar backend para novos dados
- [ ] Atualizar estrutura Google Sheets (ou migrar para BD)
- [ ] Implementar permissões (todos os professores editam)
- [ ] Testar com múltiplos professores colaborando

**Dependências:** Funcionalidade 9 (Autenticação) útil para atribuição de autoria

---

### ⚫ **Funcionalidade 8: Ver Todas as Lições do Ano com PDFs**
**Prioridade:** BAIXA
**Duração Estimada:** 2.5 semanas
**Complexidade:** Alta

**Descrição:**
- Visualização completa de todas as lições do ano letivo
- Acesso e visualização de PDFs associados a cada lição
- Filtro por professor (ver apenas lições que ensinei)
- Filtro por trimestre/mês
- Download de PDFs
- Visualização de estatísticas (quantas lições lecionadas por professor)

**Tarefas:**
- [ ] **Migrar para Base de Dados Real (BLOQUEADOR)**
  - [ ] Escolher BD: PostgreSQL, Firebase, ou MongoDB
  - [ ] Criar schema para lições, PDFs, relações professor-lição
  - [ ] Migrar dados do Google Sheets
  - [ ] Criar endpoints de API (Node.js/Firebase Functions)
  - [ ] Testar migração de dados
- [ ] Criar nova rota `/lessons-overview`
- [ ] Design da interface de visualização anual
- [ ] Implementar sistema de upload/armazenamento de PDFs
  - [ ] Escolher storage: Firebase Storage, AWS S3, ou Cloudinary
  - [ ] Implementar upload de múltiplos ficheiros
- [ ] Criar sistema de filtros:
  - [ ] Filtro por professor
  - [ ] Filtro por data/período
  - [ ] Filtro por tipo de lição
- [ ] Implementar visualizador de PDF inline (ou download)
- [ ] Adicionar estatísticas e métricas
- [ ] Implementar permissões (quem pode ver quais lições)
- [ ] Testar performance com muitos PDFs

**Dependências:**
- **Migração de Base de Dados (CRÍTICA)** - Impossível implementar com Google Sheets
- **Funcionalidade 9: Autenticação Google** - Necessária para filtro por professor
- **Sistema de Storage** - Para armazenar PDFs (Firebase Storage, S3, etc.)

**Nota Técnica:**
Esta funcionalidade **não pode ser implementada** com a atual stack de Google Sheets. Requer:
1. Base de dados relacional ou NoSQL
2. Sistema de armazenamento de ficheiros
3. Backend robusto (Node.js, Firebase, etc.)
4. Autenticação para associar professores a lições

**Recomendação:** Implementar após migração completa para stack moderna.

---

## Resumo de Esforço

| Funcionalidade | Duração | Complexidade | Prioridade |
|----------------|---------|--------------|------------|
| 1. Múltiplos Horários | 1 semana | Média | 🔴 CRÍTICA |
| 2. Notas sobre Alunos | 1.5 semanas | Média-Baixa | 🟡 ALTA |
| 3. Alertas de Faltas | 1.5 semanas | Média | 🟢 ALTA |
| 4. Adicionar Visitantes | 1 semana | Baixa-Média | 🔵 MÉDIA-ALTA |
| 5. Editar Presenças | 1.5 semanas | Média-Alta | 🟣 MÉDIA-ALTA |
| 6. Widget Cuidadores | 1.5 semanas | Média | 🟠 MÉDIA |
| 7. Histórico de Lições | 2 semanas | Média-Alta | 🟤 MÉDIA |
| 8. Ver Lições do Ano (PDFs) | 2.5 semanas | Alta | ⚫ BAIXA* |

**Duração Total Estimada:** ~13 semanas (~3 meses)

*\*Funcionalidade 8 requer migração de base de dados primeiro (adicional 1-2 semanas)*

---

## Recomendação de Ordem de Implementação

### **Sprint 1-2 (Semanas 1-2): Fundação Crítica**
1. ✅ **Múltiplos Horários** - Bloqueador para crescimento do ministério
2. ✅ **Notas sobre Alunos** - Base para funcionalidades futuras

### **Sprint 3-4 (Semanas 3-4): Melhorias na Experiência**
3. ✅ **Alertas de Faltas** - Valor imediato para cuidado pastoral
4. ✅ **Adicionar Visitantes** - Feature de uso frequente

### **Sprint 5-6 (Semanas 5-6): Correções e Gestão**
5. ✅ **Editar Presenças** - Lidar com casos edge
6. ✅ **Widget Cuidadores** (REQUER AUTENTICAÇÃO)

### **Sprint 7-8 (Semanas 7-8): Colaboração e Recursos**
7. ✅ **Histórico de Lições** - Feature mais complexa, menos urgente

### **Sprint 9-11 (Semanas 9-11): Visualização Anual (Futuro)**
8. ⚫ **Ver Lições do Ano com PDFs** - Requer migração de BD (implementar depois)

---

## Próximos Passos Imediatos

### **Começar HOJE:**
**Funcionalidade 1: Suporte para Múltiplos Horários**

Esta é a funcionalidade mais crítica porque:
- ✅ Expansão para o culto das 9h é iminente
- ✅ Bloqueador para crescimento do ministério
- ✅ Relativamente simples (1 semana)
- ✅ Não requer autenticação
- ✅ Base sólida para outras funcionalidades

**Primeira tarefa:** Design do seletor de horário na página de seleção de data

---

## Notas de Planeamento

### Funcionalidades que Requerem Autenticação:
- **Funcionalidade 6:** Widget Cuidadores (NECESSÁRIA)
- **Funcionalidade 5:** Editar Presenças (opcional, mas útil para audit trail)
- **Funcionalidade 7:** Histórico de Lições (opcional para atribuição de autoria)

**Decisão:** Pode implementar Funcionalidades 1-4 **sem autenticação**. Quando chegar à Funcionalidade 6, precisará de:
- Implementar Google OAuth
- Migrar de Apps Script para backend adequado (Node.js/Firebase)
- Implementar sistema de roles (Admin vs Professor)

### Alternativa: Implementar Autenticação Mais Cedo
Se preferes, podes inserir **Autenticação Google** entre Funcionalidade 4 e 5:

```
Sprint 1-4: Funcionalidades 1-4 (sem auth)
Sprint 5: AUTENTICAÇÃO GOOGLE ⚡
Sprint 6-8: Funcionalidades 5-7 (com auth)
```

Isto permitiria funcionalidades mais robustas nas últimas 3 features.

---

## Questões para Considerar

1. **Prioridade da Autenticação:** Implementar antes da Funcionalidade 6 ou mais cedo?
2. **Migração de Backend:** Quando migrar de Apps Script para backend adequado?
3. **Base de Dados:** Continuar com Google Sheets ou migrar para PostgreSQL/Firebase?
4. **Testes:** Implementar testes unitários/integração durante desenvolvimento?

---

## Roadmap de Migração para Funcionalidade 8

Se quiseres implementar a **Funcionalidade 8 (Ver Lições do Ano com PDFs)**, terás de fazer a migração tecnológica:

### **Fase 1: Escolher Stack (1-2 dias)**
- **Base de Dados:** PostgreSQL (Supabase), Firebase Firestore, ou MongoDB
- **Backend:** Firebase Functions, Node.js + Express, ou Next.js API Routes
- **Storage:** Firebase Storage, AWS S3, ou Cloudinary
- **Autenticação:** Firebase Auth ou Supabase Auth

### **Fase 2: Migração de Dados (3-5 dias)**
- Exportar dados do Google Sheets
- Criar schema de BD
- Script de migração
- Validar integridade dos dados

### **Fase 3: Atualizar Frontend (5-7 dias)**
- Substituir chamadas à API do Apps Script
- Atualizar hooks (useAttendanceData, etc.)
- Testar todas as funcionalidades existentes
- Deploy e testes em produção

### **Fase 4: Implementar Funcionalidade 8 (2-3 semanas)**
- Implementar upload de PDFs
- Criar interface de visualização anual
- Adicionar filtros e estatísticas
- Integrar com autenticação

**Estimativa Total:** 5-7 semanas (incluindo migração + feature)

---

**Próximo Passo Sugerido:** Começar com Funcionalidade 1 (Múltiplos Horários) hoje! 🚀

**Nota sobre Funcionalidade 8:** Deixar para última fase quando o app estiver mais maduro e justificar a migração de BD.
