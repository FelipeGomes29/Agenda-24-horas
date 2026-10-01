# Ideia desenvolvida: planner de 24h com caixa de "sem data"

## Conceito central

A maioria dos apps de tarefa (Todoist, TickTick) trata tarefa como item de lista. A maioria dos calendários (Google Calendar) trata tempo como compromisso fixo. Sua ideia fica no meio: **tarefa vira bloco de tempo**, e o dia inteiro fica visível, inclusive sono, deslocamento e descanso. Isso é *time blocking*, e o diferencial é mostrar a realidade das 24h em vez de só as horas úteis.

## Os três espaços da ferramenta

**1. Caixa de entrada (sem data)**
Onde tudo cai primeiro, sem fricção: um campo de texto e Enter. Depois dá para classificar por:
- Prioridade ou etiqueta (trabalho, faculdade, pessoal)
- Estimativa de duração (15 min, 1h...)
- "Algum dia" vs. "em breve"

**2. Visão semanal (7 dias × 24h)**
Uma grade com colunas de dia e linhas de hora. Você **arrasta** uma tarefa da caixa para um horário e ela vira um bloco. Ideias úteis:
- Faixas de sono e rotina fixa (trabalho, aula, deslocamento) em cor neutra, para enxergar o tempo *realmente livre*
- Contador de horas livres por dia
- Alerta quando você agenda mais do que cabe

**3. Visão do dia (foco)**
Linha do tempo de um dia só, com indicador de "agora", próxima tarefa em destaque e opção de marcar como feita, adiar ou devolver para a caixa.

## Funcionalidades por fase

**MVP (o que testa a ideia)**
- Criar, editar e excluir tarefas
- Caixa sem data
- Grade semanal com drag-and-drop
- Marcar como concluída
- Salvar os dados (localStorage no início)

**Versão 2**
- Login e sincronização entre dispositivos
- Blocos recorrentes (academia toda terça, estudo diário)
- Categorias com cores e filtros
- Tarefas que passam da hora voltam sugeridas para reagendar
- Revisão semanal: o que você planejou vs. o que fez

**Versão 3 (diferenciais)**
- Sugestão automática de horário com base em duração e prioridade
- Integração com Google Calendar (importar compromissos fixos)
- Modo foco/Pomodoro em cima do bloco atual
- PWA para funcionar como app no celular
- Estatísticas de uso do tempo por categoria

## Modelo de dados básico

```
Tarefa: id, título, descrição, categoria, prioridade,
        duração_estimada, status (caixa | agendada | feita),
        início (nullable), fim (nullable), recorrência (nullable)
```

O detalhe-chave: **sem data de início = está na caixa**. Ao arrastar para a grade, o início e o fim são preenchidos. Isso deixa o modelo simples, sem precisar de duas entidades separadas.

## Sugestão de stack

Como você já trabalha com React, Node e SQL, faz sentido:
- **Front-end:** React + Tailwind, com `dnd-kit` para drag-and-drop
- **Calendário:** montar a grade você mesmo (é o coração do projeto) ou partir de FullCalendar para ir mais rápido
- **Back-end:** Node + PostgreSQL (ou Supabase para acelerar autenticação e banco)
- **Deploy:** Vercel para o front, Railway ou Render para a API

## Desafios de UX para pensar cedo

- **24h em tela pequena:** no celular, mostrar 1 a 3 dias por vez, com zoom na hora
- **Sobreposição:** o que acontece quando dois blocos colidem?
- **Fuso e virada de dia:** tarefas que cruzam meia-noite
- **Não virar mais um app abandonado:** captura rápida e revisão leve importam mais que muitas funções

## Como se destacar

O nicho mais promissor é o **planejamento realista**: o app mostra quanto tempo livre você *de fato* tem e avisa quando o plano é impossível. Isso resolve a dor de quem enche a lista de tarefas e nunca termina.

## Próximo passo

Posso montar um protótipo funcional da grade semanal com a caixa sem data e drag-and-drop, para você validar a ideia. Ou, se preferir, começo pelo esquema do banco e pela estrutura de pastas do projeto. Qual você prefere?