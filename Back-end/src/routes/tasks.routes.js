import { Router } from 'express'
import * as controller from '../controllers/tasks.controller.js'
import { validate } from '../middlewares/validate.js'
import {
  createTaskSchema,
  idParamSchema,
  listQuerySchema,
  updateTaskSchema,
} from '../validators/task.schema.js'

const router = Router()

router.get('/', validate({ query: listQuerySchema }), controller.list)
router.get('/inbox', controller.listInbox) // antes de '/:id'
router.post('/', validate({ body: createTaskSchema }), controller.create)
router.get('/:id', validate({ params: idParamSchema }), controller.get)
router.patch('/:id', validate({ params: idParamSchema, body: updateTaskSchema }), controller.update)
router.delete('/:id', validate({ params: idParamSchema }), controller.remove)

export default router
