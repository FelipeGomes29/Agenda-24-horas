# Planner 24h

Planejador com a semana em 24h, visão de foco do dia e uma caixa para tarefas sem data.

- `client/`: React + Vite + Tailwind (JavaScript)
- `server/`: Node + Express + PostgreSQL

## Subindo tudo

```bash
# API
cd server && cp .env.example .env && npm install && npm run dev

# Front, em outro terminal
cd client && cp .env.example .env && npm install && npm run dev
```

O front só usa a API se `VITE_API_URL` estiver definida em `client/.env`.
Sem ela, funciona sozinho com `localStorage`.

Detalhes em `client/README.md` e `server/README.md`.
