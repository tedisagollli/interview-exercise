import { createServerFn } from '@tanstack/react-start'
import { readTasks, insertTask, completeTask, removeTask } from './firestore.server.js'

function validateId(data) {
  if (typeof data?.id !== 'string' || !/^[a-zA-Z0-9_-]{1,1500}$/.test(data.id)) throw new Error('Invalid task ID.')
  return data.id
}

export const listTasks = createServerFn({ method: 'GET' })
  .validator((data) => {
    if (!['All', 'Active', 'Completed'].includes(data?.filter)) throw new Error('Invalid task filter.')
    return { filter: data.filter }
  })
  .handler(({ data }) => readTasks(data.filter))

export const createTask = createServerFn({ method: 'POST' })
  .validator((data) => {
    if (typeof data?.title !== 'string' || !data.title.trim() || data.title.trim().length > 200) throw new Error('Task title must contain 1–200 characters.')
    return { title: data.title.trim() }
  })
  .handler(({ data }) => insertTask(data.title))

export const updateTask = createServerFn({ method: 'POST' })
  .validator((data) => {
    const id = validateId(data)
    if (typeof data.completed !== 'boolean') throw new Error('Completed must be a boolean.')
    return { id, completed: data.completed }
  })
  .handler(({ data }) => completeTask(data.id, data.completed))

export const deleteTask = createServerFn({ method: 'POST' })
  .validator((data) => ({ id: validateId(data) }))
  .handler(({ data }) => removeTask(data.id))
