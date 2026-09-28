import { getApps, initializeApp } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'

export const firestoreConfig = {
  projectId: 'demo-interview-exercise',
  databaseId: '(default)',
  host: '127.0.0.1:8080',
}

let database

export function getDatabase() {
  if (!database) {
    const name = 'express-backend'
    const app = getApps().find((app) => app.name === name) ?? initializeApp({ projectId: firestoreConfig.projectId }, name)
    database = getFirestore(app)
    // Use the same local database as TanStack Start; never fall back to production.
    database.settings({ host: firestoreConfig.host, ssl: false })
  }
  return database
}

export async function checkFirestoreConnection() {
  let timer
  try {
    const snapshot = await Promise.race([
      getDatabase().doc('msps/msp-demo').get(),
      new Promise((_, reject) => {
        timer = setTimeout(() => reject(new Error('Firestore health check timed out')), 5000)
      }),
    ])
    // A successful read also confirms connectivity when the database is empty.
    return { status: 'connected', ...firestoreConfig, samplePartnerExists: snapshot.exists }
  } finally {
    clearTimeout(timer)
  }
}
