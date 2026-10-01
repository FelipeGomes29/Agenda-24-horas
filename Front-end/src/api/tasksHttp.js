// Implementação que fala com a API Express + PostgreSQL.
//
//   GET    /api/tasks        -> lista todas (agendadas e da caixa)
//   POST   /api/tasks        -> cria
//   PATCH  /api/tasks/:id    -> atualiza só os campos enviados
//   DELETE /api/tasks/:id    -> exclui (204)

export function createHttpApi(baseUrl) {
  const base = baseUrl.replace(/\/+$/, '')

  async function request(path, { method = 'GET', body } = {}) {
    const res = await fetch(`${base}/api${path}`, {
      method,
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    })
    if (!res.ok) {
      const err = new Error(`HTTP ${res.status}`)
      err.status = res.status
      throw err
    }
    return res.status === 204 ? null : res.json()
  }

  return {
    getTasks: () => request('/tasks'),
    createTask: (data) => request('/tasks', { method: 'POST', body: data }),
    updateTask: (id, patch) => request(`/tasks/${encodeURIComponent(id)}`, { method: 'PATCH', body: patch }),
    deleteTask: (id) => request(`/tasks/${encodeURIComponent(id)}`, { method: 'DELETE' }),
  }
}
