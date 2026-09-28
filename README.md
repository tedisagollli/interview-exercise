# Interview exercise starter

A JavaScript starter for the interview exercise: React, TanStack Start, TanStack Query, a local Firestore emulator, and a separate Express backend. A working task list is included as an example to build on. The exercise requirements are provided separately.

## Prerequisites

- **Node.js 24** (npm is included). If you use nvm, run `nvm install` and `nvm use` in this directory.
- **Java 21 or newer**, required by the Firestore emulator. Check with `java -version`.
- Internet access for the initial dependency install and emulator download.

No Firebase account, login, API keys, environment files, or global Firebase CLI installation are needed. All application code is JavaScript/JSX; Java is only the emulator runtime.

### Install Java on macOS with Homebrew

If `java -version` already shows Java 21 or newer, you can skip this step. Otherwise, install [Homebrew](https://brew.sh/) if needed, then run:

```sh
brew install openjdk@21
export JAVA_HOME="$(brew --prefix openjdk@21)/libexec/openjdk.jdk/Contents/Home"
export PATH="$JAVA_HOME/bin:$PATH"
java -version
```

The output should show OpenJDK 21. Homebrew's versioned JDK is keg-only, so the two `export` commands make it available in the current terminal. Using `brew --prefix` works on both Apple Silicon and Intel Macs.

To keep this configuration in new terminals, add the two `export` lines above to `~/.zshrc` (the default macOS shell), then run `source ~/.zshrc`. For Bash, use `~/.bash_profile` instead. Start `npm run dev` from a terminal where `java -version` succeeds.

See the [Homebrew OpenJDK 21 formula](https://formulae.brew.sh/formula/openjdk@21) for details. On Windows or Linux, install a Java 21+ JDK using your platform's package manager or a JDK installer, and ensure `java` is on your PATH.

## Quick start

Clone or download this starter, open a terminal in its directory, then run:

```sh
npm ci
npm run dev
```

The first launch downloads the emulator runtime and may take a little longer. Wait for Vite to print its local URL.

- **App:** http://127.0.0.1:3000
- **Database viewer:** http://127.0.0.1:4000/firestore

Add a task in the app to confirm everything is connected. A fresh checkout starts with an empty database.

Stop with **Ctrl+C** and wait for the export to finish. Data is saved in `.firebase/data` and restored the next time you run `npm run dev`. This local data is ignored by Git. Forced shutdowns can lose changes since the last export.

## Seed sample partners and reported emails

With the emulator running (`npm run dev` or `npm run emulator`), run this in another terminal from the repository root:

```sh
npm run seed
```

This creates partner `msps/msp-demo` and two documents in `msps/msp-demo/reported-emails`: a high-severity invoice email and a low-severity newsletter. View them in the [database viewer](http://127.0.0.1:4000/firestore/default/data/msps/msp-demo). The task-list UI does not display reported emails.

Each email has `headers` (an array of `{ name, value }` objects), `body`, `subject`, `from` (a string), `to` (an array of email addresses), `severity` (a string), `companyId`, and `reporterId`. Company and reporter IDs are sample references; this seed does not create company or reporter documents. All addresses and URLs are fictional `.example` values.

Fixtures live in `scripts/seed-data.js`. IDs are fixed, so rerunning the seed creates only missing documents and preserves existing edits and unrelated data. The script connects only to the local emulator. Seeded data is saved with the rest of the database when the emulator shuts down cleanly.

## Separate Express backend

`backend/` is an independent Node.js app with its own dependencies and startup commands. It does not need the UI, Java, or the Firestore emulator. The task UI continues to use its TanStack Start server functions; Express runs separately.

From the repository root, open a separate terminal and run:

```sh
cd backend
npm ci
npm run dev
```

The server runs at **http://127.0.0.1:3001** and restarts when its source changes. Check it with:

```sh
curl http://127.0.0.1:3001/health
```

`GET /health` returns HTTP **200** with `{"status":"ok"}`. This checks that the Express app is running; it does not check a database connection.

Use `npm start` inside `backend/` to run without file watching. Set `PORT` to change the port, for example `PORT=3002 npm start`. Stop it with **Ctrl+C**. The root `npm run dev` command does not start Express.

## Where to work

The data flow is **React → TanStack Query → TanStack Start server functions → Firestore**. Only the backend accesses Firebase. Mutations refresh the UI immediately; other changes are picked up by polling every three seconds.

| File | Purpose |
| --- | --- |
| `src/routes/index.jsx` | Task UI, queries, and mutations |
| `src/lib/tasks.functions.js` | Backend endpoints and input validation |
| `src/lib/firestore.server.js` | Firebase Admin connection and database operations |
| `src/router.jsx` | Router and TanStack Query provider |
| `src/routes/__root.jsx` | Page shell |
| `tests/firestore.test.js` | Backend integration test |
| `firebase.json` | Emulator configuration |
| `scripts/seed.js`, `scripts/seed-data.js` | Seed command and sample partners/reported emails |
| `backend/src/app.js` | Standalone Express app and health check route |
| `backend/src/server.js` | Express HTTP server and port configuration |

`src/routeTree.gen.js` is generated automatically; do not edit it by hand.

## Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the UI, TanStack Start backend, and emulator together |
| `npm run build` | Check the production build |
| `npm run seed` | Add sample partners and reported emails to the running emulator |
| `npm test` | Start a temporary emulator and test backend CRUD, filtering, and sorting |
| `npm run emulator` | Run only the emulator, with saved data |
| `npm run dev:app` | Run only the app and backend against an already-running emulator |

**Stop `npm run dev` before running `npm test`** to free the emulator ports. Tests do not load or overwrite your saved development data.

## Troubleshooting

- **Java is missing or too old:** install Java 21+ and confirm `java -version` works in the terminal you use to start the app.
- **A port is already in use:** stop any other copy of this starter. It uses ports 3000, 4000, 8080, 4400, 4500, and 9150. Use `npm run dev:app` if its emulator is already running separately.
- **The UI cannot reach the backend or database:** check the terminal output and start both together with `npm run dev`.
- **Need an empty database:** stop the emulator, then delete `.firebase/data`. This permanently removes your saved local task data; the next startup creates an empty database.

## Local development notes

This starter uses the demo project `demo-interview-exercise`, open emulator access, and no application authentication. It is configured for local interview work.

The Active and Completed filters demonstrate a backend query that normally needs a composite index. The emulator executes it without requiring that index. Its [index usage report](http://127.0.0.1:8080/emulator/v1/projects/demo-interview-exercise:indexUsage?database=projects/demo-interview-exercise/databases/%28default%29) shows index shapes for queries that have run.

Installation automatically runs `scripts/patch-start.js` to keep TanStack's generated routes JavaScript-only. Keep install scripts enabled. Maintainers should review this compatibility patch when upgrading TanStack Start.
