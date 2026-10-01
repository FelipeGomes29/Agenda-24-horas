# Planner 24h (API)

Node + Express 5 + PostgreSQL. Validação com Zod, consultas parametrizadas, Helmet, CORS restrito e rate limit.

## Rodando

```bash
# 1. banco (uma vez)
createuser planner --pwprompt
createdb planner --owner planner

# 2. configuração
cp .env.example .env        # ajuste DATABASE_URL e CORS_ORIGIN

# 3. API (aplica as migrations ao subir)
npm install
npm run dev                 # http://localhost:3333/api
```

`npm run migrate` aplica só as migrations. Cada arquivo de `src/database/migrations/*.sql`
roda uma vez, em transação, e fica registrado em `schema_migrations`.

## Testes

Usam um banco separado (`planner_test`, definido em `.env.test`), que é esvaziado a cada teste.

```bash
createdb planner_test --owner planner
npm test
```

## Rotas

| Método | Rota | Descrição |
|---|---|---|
| GET | `/api/health` | Verifica API e banco |
| GET | `/api/tasks` | Todas as tarefas. Com `?from=YYYY-MM-DD&to=YYYY-MM-DD`, só as agendadas que tocam o período (inclui as que cruzam a meia-noite) |
| GET | `/api/tasks/inbox` | Só as sem data |
| GET | `/api/tasks/:id` | Uma tarefa |
| POST | `/api/tasks` | Cria (201) |
| PATCH | `/api/tasks/:id` | Atualiza só os campos enviados |
| DELETE | `/api/tasks/:id` | Exclui (204) |

Tarefa:

```json
{
  "id": "uuid", "title": "Reunião", "notes": "", "category": "trabalho",
  "priority": "alta", "duration": 60, "start": "2026-10-01T14:00",
  "someday": false, "done": false, "createdAt": "2026-10-01T21:38:54.585Z"
}
```

- `start`: `YYYY-MM-DDTHH:mm` no relógio local da pessoa, sem fuso. `null` = está na caixa.
- `duration`: minutos, de 5 a 1440. `title`: até 120 caracteres. `notes`: até 1000.
- `category`: trabalho, estudos, pessoal, saude, casa, rotina. `priority`: alta, media, baixa.
- Quem tem `start` nunca fica como `someday` (regra no serviço e `CHECK` no banco).
- Campos desconhecidos são recusados com 400.

Erros: `{ "error": "mensagem", "details": { ... } }`. Falhas internas respondem 500 genérico, sem stack nem SQL.

## Estrutura

```
src/
  config/        env.js (valida variáveis), db.js (pool do pg)
  routes/        rotas -> controllers
  controllers/   HTTP (req/res)
  services/      regras de negócio
  repositories/  SQL
  validators/    schemas Zod
  middlewares/   validate, errorHandler
  database/      migrate.js + migrations/*.sql
  app.js         monta o Express (sem listen, para testar com supertest)
  server.js      migra, sobe e encerra com graceful shutdown
tests/           integração (node:test + supertest)
```

## Ainda não tem

- **Autenticação e `user_id`**: hoje qualquer cliente que alcança a API vê todas as tarefas. Antes de publicar na internet, adicione login (JWT em cookie `httpOnly`), `user_id` na tabela e filtro por usuário em todas as queries.
- Tarefas recorrentes.
- `.env.test` traz só credenciais de um banco local descartável; não reutilize em outro ambiente.