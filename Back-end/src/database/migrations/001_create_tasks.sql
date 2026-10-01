CREATE TABLE tasks (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title        varchar(120) NOT NULL CHECK (length(btrim(title)) > 0),
  notes        text         NOT NULL DEFAULT '' CHECK (length(notes) <= 1000),
  category     text         NOT NULL DEFAULT 'pessoal'
               CHECK (category IN ('trabalho', 'estudos', 'pessoal', 'saude', 'casa', 'rotina')),
  priority     text         NOT NULL DEFAULT 'media' CHECK (priority IN ('alta', 'media', 'baixa')),
  duration_min integer      NOT NULL DEFAULT 60 CHECK (duration_min BETWEEN 5 AND 1440),
  -- Relógio local da pessoa, sem fuso (mesmo formato do front: YYYY-MM-DDTHH:mm).
  -- NULL = a tarefa está na caixa (sem data).
  start_at     timestamp,
  someday      boolean      NOT NULL DEFAULT false,
  done         boolean      NOT NULL DEFAULT false,
  created_at   timestamptz  NOT NULL DEFAULT now(),
  updated_at   timestamptz  NOT NULL DEFAULT now(),
  -- "Algum dia" só faz sentido para quem está na caixa.
  CONSTRAINT tasks_someday_only_in_inbox CHECK (NOT (start_at IS NOT NULL AND someday))
);

CREATE INDEX tasks_scheduled_idx ON tasks (start_at) WHERE start_at IS NOT NULL;
CREATE INDEX tasks_inbox_idx ON tasks (created_at) WHERE start_at IS NULL;
