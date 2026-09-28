import { getApps, initializeApp } from 'firebase-admin/app'
import { FieldValue, getFirestore } from 'firebase-admin/firestore'

let database
function getDatabase() {
  if (!database) {
    const app = getApps().find((app) => app.name === 'local-tasks-backend') ?? initializeApp({ projectId: 'demo-interview-exercise' }, 'local-tasks-backend')
    database = getFirestore(app)
    // Explicit host + ssl:false keeps every request on the local emulator.
    database.settings({ host: '127.0.0.1:8080', ssl: false })
  }
  return database
}

export async function readTasks(filter) {
  let reference = getDatabase().collection('tasks')
  if (filter !== 'All') reference = reference.where('completed', '==', filter === 'Completed')
  const snapshot = await reference.orderBy('createdAt', 'desc').get()
  return snapshot.docs.map((document) => {
    const task = document.data()
    return { id: document.id, title: task.title, completed: task.completed, createdAt: task.createdAt?.toDate().toISOString() ?? null }
  })
}

export async function insertTask(title) {
  const reference = await getDatabase().collection('tasks').add({ title, completed: false, createdAt: FieldValue.serverTimestamp() })
  return { id: reference.id }
}

export async function completeTask(id, completed) {
  await getDatabase().collection('tasks').doc(id).update({ completed })
  return { success: true }
}

export async function removeTask(id) {
  await getDatabase().collection('tasks').doc(id).delete()
  return { success: true }
}
