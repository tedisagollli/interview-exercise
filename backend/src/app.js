import express from 'express'
import { checkFirestoreConnection, firestoreConfig } from './firestore.js'

export function createApp(checkFirestore = checkFirestoreConnection) {
  const app = express()

  app.use(express.json())

  app.get('/health', async (req, res) => {
    res.set('Cache-Control', 'no-store')
    try {
      const firestore = await checkFirestore()
      res.status(200).json({ status: 'ok', firestore })
    } catch (error) {
      console.error('Firestore health check failed:', error.message)
      res.status(503).json({
        status: 'error',
        firestore: { status: 'unavailable', ...firestoreConfig },
        message: 'Cannot reach Firestore. Start the emulator with npm run emulator from the repository root.',
      })
    }
  })

  return app
}

export const app = createApp()
