# Planner 24h

Ferramenta de produtividade que mostra o dia inteiro — as 24 horas, não só o
horário comercial — para organizar tarefas por horário ao longo da semana,
com um espaço separado para tudo que ainda não tem data definida.

A maioria dos apps de tarefa trata cada item como uma linha numa lista. A
maioria dos calendários trata o tempo como compromisso fixo. Este projeto
fica no meio: cada tarefa vira um bloco de tempo, visível ao lado do resto do
seu dia — incluindo sono e rotina — para que o planejamento parta do tempo
que você realmente tem, não de uma lista infinita de pendências.

## Funcionalidades

- **Grade semanal de 24h** com arrastar e soltar entre dias e horários, encaixe de 15 em 15 minutos e detecção de conflito quando duas tarefas se sobrepõem.
- **Tarefas que cruzam a meia-noite** aparecem corretamente nos dois dias.
- **Caixa de entrada**, separada da grade, para tarefas sem data — com distinção entre "em breve" e "algum dia".
- **Visão do dia**, com o que está acontecendo agora, a próxima tarefa e o que ficou atrasado.
- **Tema claro e escuro**, com alternância manual.

## Stack

| Camada | Tecnologias |
|---|---|
| Front-end | React, Vite, Tailwind CSS, React Router, dnd-kit |
| Back-end | Node.js, Express, PostgreSQL, Zod |
| Testes | `node:test` + Supertest (30 testes de integração, banco real) |

## Segurança

Este projeto também serviu para colocar em prática controles de segurança de
aplicação de ponta a ponta, não só a interface:

- Sessão em **cookies `httpOnly`** (não em `localStorage`), reduzindo o
  impacto de um eventual XSS.
- **Rotação de refresh token**: cada renovação invalida o token anterior.
  Reusar um token já girado é tratado como sinal de roubo e derruba todas as
  sessões da conta na hora.
- **Isolamento entre contas** em toda rota (inclusive `PATCH`/`DELETE`), com
  404 — e não 403 — ao tentar acessar algo de outra conta, para não revelar
  que o registro existe.
- **Proteção contra CSRF** via header customizado exigido em toda mutação.
- Consultas sempre **parametrizadas** e validação de entrada com Zod
  recusando campos desconhecidos (mass assignment).
- `helmet`, CORS restrito à origem do front e rate limit por IP (mais
  restrito ainda nas rotas de login/cadastro).

## Estrutura

```
planner/
├── client/   React + Vite + Tailwind
└── server/   Node + Express + PostgreSQL
```

Detalhes de cada parte, variáveis de ambiente e o contrato completo da API
estão em `client/README.md` e `server/README.md`.

## Rodando o projeto

```bash
# Banco (uma vez)
createuser planner --pwprompt
createdb planner --owner planner

# API
cd server
cp .env.example .env   # ajuste DATABASE_URL e gere um JWT_SECRET (instruções no arquivo)
npm install
npm run migrate
npm run dev             # http://localhost:3333

# Front, em outro terminal
cd client
cp .env.example .env    # aponte VITE_API_URL para a API acima
npm install
npm run dev             # http://localhost:5173
```

## Status

MVP funcional: front-end, back-end e autenticação completos e com testes
automatizados. Ainda faltam, antes de um lançamento público: recuperação de
senha, deploy com HTTPS e política de privacidade — nenhum desses está
implementado ainda.

Próximos passos em avaliação: tarefas recorrentes, notificações,
integração com o Google Calendar e uma versão PWA/app.
