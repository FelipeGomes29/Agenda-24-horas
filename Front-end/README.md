# Planner 24h (front-end)

Planejador com a semana inteira em 24h, uma visão de foco do dia e uma caixa para tarefas sem data.
React + Vite + Tailwind CSS 4, em JavaScript.

## Rodando

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # gera dist/
npm run lint
```

## O que já funciona

- **Semana (7 dias x 24h)** e **Dia**, com navegação por URL (`/semana?d=2026-10-01`, `/dia?d=...`).
- **Caixa**: adicione com Enter, separe "em breve" e "algum dia", filtre por categoria, ordenação por prioridade.
- **Arrastar e soltar** (dnd-kit): da caixa para a grade, entre dias e horários (encaixe de 15 min) e de volta para a caixa.
- **Redimensionar** a duração puxando a borda inferior do bloco.
- **Clicar no espaço vazio** da grade cria uma tarefa naquele horário.
- Tarefas que **cruzam a meia-noite** aparecem nos dois dias.
- **Conflitos** de horário (blocos lado a lado, com aviso) e **horas livres** por dia.
- Painel do dia: "Agora", próxima tarefa, atrasadas (fazer agora, devolver à caixa, já fiz) e lista do dia.
- Tema **claro e escuro** com alternância (respeita o tema do sistema na primeira visita).
- Teclado: blocos e itens da caixa abrem com Enter ou Espaço; o formulário usa `<dialog>` nativo.

## Estrutura

```
src/
  api/tasks.js          dados (hoje em localStorage; trocar por fetch na API Express)
  context/              TasksContext: estado e ações das tarefas
  hooks/                useTheme, useNow, useFocusDate
  utils/                date.js, layout.js (posição/faixas/conflitos), categories.js, pointer.js
  components/
    layout/Header.jsx
    inbox/                InboxPanel, InboxItem
    week/                 TimeGrid, DayColumn, TaskBlock
    day/FocusPanel.jsx
    tasks/                TaskModal, DragPreview
  pages/                  PlannerLayout (DndContext), WeekPage, DayPage
  routes/AppRoutes.jsx
```

## Ligando ao back-end

Só `src/api/tasks.js` conversa com o armazenamento. Mantenha as quatro funções
(`getTasks`, `createTask`, `updateTask`, `deleteTask`) e troque o corpo por chamadas HTTP:

```
GET /api/tasks            PATCH  /api/tasks/:id
POST /api/tasks           DELETE /api/tasks/:id
```

Forma da tarefa:

```js
{ id, title, notes, category, priority, duration, start, someday, done, createdAt }
// start: 'YYYY-MM-DDTHH:mm' (horário local) ou null quando está na caixa
// duration: minutos
```

O back-end deve validar tudo de novo (o front já limita título a 120 caracteres,
anotações a 1000 e duração a 5..1440 min, mas isso não substitui a validação do servidor).

## Decisões e limites conhecidos

- A semana começa na segunda (`WEEK_STARTS_ON` em `utils/date.js`).
- Sem fuso horário: `start` é o relógio local da pessoa.
- No celular, a caixa abre como painel lateral; para agendar, toque na tarefa e escolha dia e hora
  (arrastar da caixa funciona melhor no desktop).
- Ainda não há login, tarefas recorrentes nem sincronização entre dispositivos.
