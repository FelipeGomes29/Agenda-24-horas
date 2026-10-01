# Planner 24h (front-end)

Planejador com a semana inteira em 24h, uma visão de foco do dia e uma caixa para tarefas sem data.
React + Vite + Tailwind CSS , JavaScript.

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

O front escolhe a fonte de dados em `src/api/tasks.js`:

- com `VITE_API_URL` definida (veja `.env.example`), usa a API Express/PostgreSQL (`tasksHttp.js`);
- sem ela, usa `localStorage` (`tasksLocal.js`).

Depois de mudar o `.env`, reinicie o `npm run dev`. A API precisa liberar a origem do front em `CORS_ORIGIN`.
O contrato das rotas e o formato da tarefa estão em `server/README.md`.

## Decisões e limites conhecidos

- A semana começa na segunda (`WEEK_STARTS_ON` em `utils/date.js`).
- Sem fuso horário: `start` é o relógio local da pessoa.
- No celular, a caixa abre como painel lateral; para agendar, toque na tarefa e escolha dia e hora
  (arrastar da caixa funciona melhor no desktop).
- Ainda não há login nem tarefas recorrentes. Sem login, a sincronização entre dispositivos depende de a API ser compartilhada.
