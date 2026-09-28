import assert from 'node:assert/strict'
import test from 'node:test'
import { deleteApp, getApps } from 'firebase-admin/app'
import { readTasks, insertTask, completeTask, removeTask } from '../src/lib/firestore.server.js'

test('backend CRUD and compound queries work against the emulator', { timeout: 20000 }, async () => {
  assert.equal(process.env.FIRESTORE_EMULATOR_HOST, '127.0.0.1:8080', 'Run using npm test or explicitly target the local emulator')
  const ids = []
  try {
    const older = await insertTask('Backend test: older')
    ids.push(older.id)
    const newer = await insertTask('Backend test: newer')
    ids.push(newer.id)
    const active = (await readTasks('Active')).filter((task) => ids.includes(task.id))
    assert.deepEqual(active.map((task) => task.id), [newer.id, older.id])
    assert.equal(typeof active[0].createdAt, 'string')
    assert.equal(active[0].completed, false)
    await completeTask(newer.id, true)
    assert.ok(!(await readTasks('Active')).some((task) => task.id === newer.id))
    assert.ok((await readTasks('Completed')).some((task) => task.id === newer.id))
    await removeTask(older.id)
    assert.ok(!(await readTasks('All')).some((task) => task.id === older.id))
  } finally {
    await Promise.all(ids.map(removeTask))
    await Promise.all(getApps().map(deleteApp))
  }
})
