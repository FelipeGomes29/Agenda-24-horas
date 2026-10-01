import assert from 'node:assert/strict'
import { after, before, beforeEach, describe, it } from 'node:test'
import request from 'supertest'
import app from '../src/app.js'
import { pool } from '../src/config/db.js'
import { migrate } from '../src/database/migrate.js'

const api = () => request(app)
const create = (body) => api().post('/api/tasks').send(body)

before(async () => {
  await migrate({ log: () => {} })
})
beforeEach(() => pool.query('TRUNCATE tasks'))
after(() => pool.end())

describe('POST /api/tasks', () => {
  it('cria na caixa com valores padrão', async () => {
    const res = await create({ title: '  Marcar dentista  ' })
    assert.equal(res.status, 201)
    assert.equal(res.body.title, 'Marcar dentista')
    assert.equal(res.body.start, null)
    assert.equal(res.body.duration, 60)
    assert.equal(res.body.category, 'pessoal')
    assert.equal(res.body.priority, 'media')
    assert.equal(res.body.done, false)
    assert.match(res.body.id, /^[0-9a-f-]{36}$/)
    assert.ok(!Number.isNaN(Date.parse(res.body.createdAt)))
  })

  it('devolve start no mesmo formato enviado, sem deslocar por fuso', async () => {
    const res = await create({ title: 'Reunião', start: '2026-10-01T14:00', duration: 90 })
    assert.equal(res.status, 201)
    assert.equal(res.body.start, '2026-10-01T14:00')
    assert.equal(res.body.duration, 90)
  })

  it('tarefa com horário nunca fica como "algum dia"', async () => {
    const res = await create({ title: 'X', start: '2026-10-01T09:00', someday: true })
    assert.equal(res.body.someday, false)
  })

  it('rejeita título vazio, duração fora do limite e data impossível', async () => {
    assert.equal((await create({ title: '   ' })).status, 400)
    assert.equal((await create({ title: 'a', duration: 4 })).status, 400)
    assert.equal((await create({ title: 'a', duration: 1441 })).status, 400)
    assert.equal((await create({ title: 'a', duration: 30.5 })).status, 400)
    assert.equal((await create({ title: 'a', start: '2026-02-30T10:00' })).status, 400)
    assert.equal((await create({ title: 'a', start: '2026-10-01T25:00' })).status, 400)
    assert.equal((await create({ title: 'a', start: '2026-10-01' })).status, 400)
    assert.equal((await create({ title: 'a', category: 'hacker' })).status, 400)
    assert.equal((await create({ title: 'x'.repeat(121) })).status, 400)
  })

  it('rejeita campos desconhecidos (mass assignment)', async () => {
    const res = await create({ title: 'a', id: '00000000-0000-4000-8000-000000000000', admin: true })
    assert.equal(res.status, 400)
    assert.equal(res.body.error, 'Dados inválidos')
  })

  it('rejeita JSON malformado e corpo grande demais', async () => {
    const bad = await api().post('/api/tasks').set('Content-Type', 'application/json').send('{"title":')
    assert.equal(bad.status, 400)
    const big = await create({ title: 'a', notes: 'n'.repeat(20_000) })
    assert.equal(big.status, 413)
  })
})

describe('GET /api/tasks', () => {
  it('lista tudo, agendadas primeiro, e separa a caixa', async () => {
    await create({ title: 'caixa' })
    await create({ title: 'agendada', start: '2026-10-01T10:00' })
    const all = await api().get('/api/tasks')
    assert.equal(all.status, 200)
    assert.deepEqual(all.body.map((t) => t.title), ['agendada', 'caixa'])
    const inbox = await api().get('/api/tasks/inbox')
    assert.deepEqual(inbox.body.map((t) => t.title), ['caixa'])
  })

  it('filtra por período, incluindo tarefa que cruza a meia-noite', async () => {
    await create({ title: 'sono', start: '2026-10-01T23:00', duration: 480 })
    await create({ title: 'fora', start: '2026-10-05T10:00' })
    await create({ title: 'caixa' })
    const dia2 = await api().get('/api/tasks?from=2026-10-02&to=2026-10-02')
    assert.deepEqual(dia2.body.map((t) => t.title), ['sono'])
    const dia1 = await api().get('/api/tasks?from=2026-10-01&to=2026-10-01')
    assert.deepEqual(dia1.body.map((t) => t.title), ['sono'])
    const dia3 = await api().get('/api/tasks?from=2026-10-03&to=2026-10-03')
    assert.deepEqual(dia3.body, [])
  })

  it('valida o filtro', async () => {
    assert.equal((await api().get('/api/tasks?from=ontem')).status, 400)
    assert.equal((await api().get('/api/tasks?from=2026-10-05&to=2026-10-01')).status, 400)
    assert.equal((await api().get('/api/tasks?x=1')).status, 400)
  })
})

describe('PATCH /api/tasks/:id', () => {
  it('agenda uma tarefa da caixa e limpa "algum dia"', async () => {
    const { body: t } = await create({ title: 'a', someday: true })
    assert.equal(t.someday, true)
    const res = await api().patch(`/api/tasks/${t.id}`).send({ start: '2026-10-02T08:30', someday: true })
    assert.equal(res.status, 200)
    assert.equal(res.body.start, '2026-10-02T08:30')
    assert.equal(res.body.someday, false)
  })

  it('devolve à caixa com start null e altera só o que foi enviado', async () => {
    const { body: t } = await create({ title: 'a', start: '2026-10-02T08:30', priority: 'alta' })
    const res = await api().patch(`/api/tasks/${t.id}`).send({ start: null })
    assert.equal(res.body.start, null)
    assert.equal(res.body.priority, 'alta')
    const done = await api().patch(`/api/tasks/${t.id}`).send({ done: true })
    assert.equal(done.body.done, true)
    assert.equal(done.body.title, 'a')
  })

  it('valida id, corpo vazio, campos extras e inexistente', async () => {
    const { body: t } = await create({ title: 'a' })
    assert.equal((await api().patch('/api/tasks/nao-e-uuid').send({ done: true })).status, 400)
    assert.equal((await api().patch(`/api/tasks/${t.id}`).send({})).status, 400)
    assert.equal((await api().patch(`/api/tasks/${t.id}`).send({ id: 'x' })).status, 400)
    assert.equal((await api().patch(`/api/tasks/${t.id}`).send({ duration: 2 })).status, 400)
    const missing = await api().patch('/api/tasks/00000000-0000-4000-8000-000000000000').send({ done: true })
    assert.equal(missing.status, 404)
  })

  it('não executa SQL injetado no título (consulta parametrizada)', async () => {
    const evil = "'); DROP TABLE tasks; --"
    const { body: t } = await create({ title: evil })
    assert.equal(t.title, evil)
    const again = await api().get('/api/tasks')
    assert.equal(again.body.length, 1)
  })
})

describe('DELETE /api/tasks/:id', () => {
  it('remove e depois responde 404', async () => {
    const { body: t } = await create({ title: 'a' })
    assert.equal((await api().delete(`/api/tasks/${t.id}`)).status, 204)
    assert.equal((await api().get(`/api/tasks/${t.id}`)).status, 404)
    assert.equal((await api().delete(`/api/tasks/${t.id}`)).status, 404)
  })
})

describe('infra', () => {
  it('health, rota inexistente e cabeçalhos de segurança', async () => {
    const health = await api().get('/api/health')
    assert.equal(health.status, 200)
    assert.equal(health.headers['x-powered-by'], undefined)
    assert.equal(health.headers['x-content-type-options'], 'nosniff')
    const nope = await api().get('/api/nada')
    assert.equal(nope.status, 404)
  })

  it('CORS só libera a origem configurada', async () => {
    const ok = await api().get('/api/health').set('Origin', 'http://localhost:5173')
    assert.equal(ok.headers['access-control-allow-origin'], 'http://localhost:5173')
    const bad = await api().get('/api/health').set('Origin', 'https://evil.example')
    assert.equal(bad.headers['access-control-allow-origin'], undefined)
  })

  it('constraint do banco também barra dados inválidos (defesa em profundidade)', async () => {
    await assert.rejects(
      pool.query("INSERT INTO tasks (title, start_at, someday) VALUES ('x', '2026-10-01 10:00', true)"),
      /tasks_someday_only_in_inbox/,
    )
  })
})
