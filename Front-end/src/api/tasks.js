// Ponto único de acesso aos dados. Com VITE_API_URL definida, usa a API (PostgreSQL);
// sem ela, continua em localStorage, ótimo para demonstrar ou desenvolver só o front.

import * as local from './tasksLocal.js'
import { createHttpApi } from './tasksHttp.js'

const apiUrl = import.meta.env.VITE_API_URL
const impl = apiUrl ? createHttpApi(apiUrl) : local

export const { getTasks, createTask, updateTask, deleteTask } = impl
