import { initializeApp, deleteApp } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { partners, reportedEmails } from './seed-data.js'

// Fixed demo project and loopback host: this script never seeds production.
const projectId = 'demo-interview-exercise'
const host = '127.0.0.1:8080'

async function seed() {
  try {
    await fetch(`http://${host}/`, { signal: AbortSignal.timeout(3000) })
  } catch {
    throw new Error('Firestore emulator is not running at 127.0.0.1:8080. Start npm run emulator (or npm run dev), then run npm run seed again.')
  }

  const app = initializeApp({ projectId }, 'seed')
  const db = getFirestore(app)
  db.settings({ host, ssl: false })
  try {
    const documents = [
      ...partners.map(({ id, ...data }) => ({ path: `msps/${id}`, data })),
      ...reportedEmails.map(({ id, mspId, ...data }) => ({ path: `msps/${mspId}/reported-emails/${id}`, data })),
    ]
    const created = await db.runTransaction(async (transaction) => {
      const refs = documents.map(({ path }) => db.doc(path))
      const snapshots = await transaction.getAll(...refs)
      let count = 0
      snapshots.forEach((snapshot, index) => {
        if (!snapshot.exists) {
          transaction.create(refs[index], documents[index].data)
          count++
        }
      })
      return count
    })
    console.log(`Seed complete: created ${created} document(s); kept ${documents.length - created} existing document(s).`)
    console.log('View the emails at http://127.0.0.1:4000/firestore/default/data/msps/msp-demo')
  } finally {
    await deleteApp(app)
  }
}

seed().catch((error) => {
  console.error(error.message)
  process.exitCode = 1
})
