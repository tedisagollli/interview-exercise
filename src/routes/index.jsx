import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useServerFn } from '@tanstack/react-start'
import { listTasks, createTask, updateTask, deleteTask } from '../lib/tasks.functions.js'

export const Route = createFileRoute('/')({ component: Tasks })

const button = { border: '1px solid #dce1e7', borderRadius: 9, padding: '10px 16px', background: '#fff', color: '#26364a', font: 'inherit', cursor: 'pointer' }
const muted = { color: '#6c7887', fontSize: 14 }

function Tasks() {
  const [title, setTitle] = useState('')
  const [filter, setFilter] = useState('All')
  const client = useQueryClient()
  const list = useServerFn(listTasks)
  const create = useServerFn(createTask)
  const update = useServerFn(updateTask)
  const remove = useServerFn(deleteTask)
  const all = useQuery({ queryKey: ['tasks', 'All'], queryFn: () => list({ data: { filter: 'All' } }) })
  const filtered = useQuery({ queryKey: ['tasks', filter], queryFn: () => list({ data: { filter } }) })
  const refresh = () => client.invalidateQueries({ queryKey: ['tasks'] })
  const adding = useMutation({ mutationFn: (title) => create({ data: { title } }), onSuccess: async () => { setTitle(''); await refresh() } })
  const updating = useMutation({ mutationFn: (data) => update({ data }), onSuccess: refresh })
  const deleting = useMutation({ mutationFn: (id) => remove({ data: { id } }), onSuccess: refresh })
  const tasks = all.data ?? []
  const visible = filtered.data ?? []
  const completed = tasks.filter((task) => task.completed).length
  const pending = adding.isPending || updating.isPending || deleting.isPending
  const connected = all.isSuccess && !all.isError && !filtered.isError
  const error = [adding.error, updating.error, deleting.error, all.error, filtered.error].find(Boolean)?.message
  const queryConfirmed = filtered.isSuccess && !filtered.isError

  function addTask(event) {
    event.preventDefault()
    if (!title.trim() || pending || !connected) return
    adding.reset(); updating.reset(); deleting.reset()
    adding.mutate(title.trim())
  }

  return (
    <main style={{ maxWidth: 780, margin: '0 auto', padding: '52px 20px' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap', marginBottom: 52 }}>
        <div style={{ fontWeight: 750, letterSpacing: '-0.4px' }}><span style={{ background: '#205d50', color: '#fff', padding: '8px 11px', borderRadius: 10, marginRight: 10 }}>✓</span> Local tasks</div>
        <span role="status" style={{ fontSize: 13, background: connected ? '#e5f1e9' : '#fff0d9', color: connected ? '#286444' : '#856018', padding: '7px 12px', borderRadius: 30 }}>{connected ? '● Backend connected' : '○ Connecting to backend'}</span>
      </header>
      <p style={{ ...muted, textTransform: 'uppercase', letterSpacing: 2, fontSize: 11, fontWeight: 700 }}>Your local workspace</p>
      <h1 style={{ fontSize: 38, letterSpacing: '-1.4px', margin: '12px 0' }}>A little more done.</h1>
      <p style={{ ...muted, fontSize: 16, marginBottom: 32 }}>Keep track of what’s next. Changes save through the backend. Refreshes every 3 seconds.</p>
      <section aria-label="Task list" style={{ background: '#fff', border: '1px solid #e2e6eb', borderRadius: 16, padding: 24, boxShadow: '0 4px 22px #17243305' }}>
        <form onSubmit={addTask} style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
          <input aria-label="New task" placeholder="What needs to get done?" value={title} onChange={(event) => setTitle(event.target.value)} maxLength={200} disabled={pending} style={{ flex: '1 1 240px', minWidth: 0, padding: '13px 14px', border: '1px solid #dce1e7', borderRadius: 9, font: 'inherit' }} />
          <button disabled={!title.trim() || !connected || pending} style={{ ...button, background: '#205d50', color: '#fff', opacity: !title.trim() || !connected || pending ? 0.5 : 1 }}>+ Add task</button>
        </form>
        {error && <p role="alert" style={{ color: '#a03b29', background: '#fff4ef', padding: 12, borderRadius: 8 }}>{error}</p>}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center', margin: '26px 0 12px' }}>
          {['All', 'Active', 'Completed'].map((value) => <button key={value} aria-pressed={filter === value} onClick={() => setFilter(value)} style={{ ...button, padding: '7px 12px', border: 'none', background: filter === value ? '#edf2f0' : 'transparent', color: filter === value ? '#205d50' : '#6c7887' }}>{value}</button>)}
          <span style={{ ...muted, marginLeft: 'auto' }}>{tasks.length - completed} remaining</span>
        </div>
        {filter !== 'All' && <aside aria-label="Composite index demonstration" style={{ background: '#edf5f1', borderRadius: 9, padding: 16, margin: '16px 0' }}>
          <strong>Composite index demonstration</strong>
          <pre style={{ fontSize: 12, whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>{`// Runs only on the backend\ndb.collection('tasks')\n  .where('completed', '==', ${filter === 'Completed'})\n  .orderBy('createdAt', 'desc').get()`}</pre>
          <p role="status" style={{ ...muted, margin: '8px 0' }}>{filtered.isError ? `Query failed: ${filtered.error.message}` : queryConfirmed ? `Backend confirmed: ${visible.length} result(s), newest first. Firestore queried on the server; refreshes every 3 seconds.` : 'Waiting for backend confirmation…'}</p>
          <p style={{ ...muted, margin: 0 }}>Production requires a composite index on completed + createdAt (descending). This project defines no composite indexes; the emulator still executes this query.</p>
        </aside>}
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {visible.map((task) => <li key={task.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '17px 0', borderTop: '1px solid #edf0f3' }}>
            <input type="checkbox" aria-label={`Complete ${task.title}`} checked={Boolean(task.completed)} disabled={pending || !connected} onChange={() => { adding.reset(); deleting.reset(); updating.mutate({ id: task.id, completed: !task.completed }) }} style={{ width: 18, height: 18, accentColor: '#205d50', flexShrink: 0 }} />
            <span style={{ flex: 1, overflowWrap: 'anywhere', textDecoration: task.completed ? 'line-through' : 'none', color: task.completed ? '#87929e' : '#26364a' }}>{task.title}</span>
            <button aria-label={`Delete ${task.title}`} disabled={pending || !connected} onClick={() => { adding.reset(); updating.reset(); deleting.mutate(task.id) }} style={{ ...button, border: 'none', color: '#7c8793', fontSize: 13, padding: 6 }}>Delete</button>
          </li>)}
        </ul>
        {visible.length === 0 && <div style={{ textAlign: 'center', padding: '44px 12px' }}><div style={{ color: '#205d50', fontSize: 28 }}>✓</div><h2 style={{ fontSize: 17, fontWeight: 600 }}>{!connected ? 'Waiting for backend' : tasks.length === 0 ? 'Make room for your first task' : 'Nothing here right now'}</h2><p style={muted}>{tasks.length === 0 ? 'Add a task above to get started.' : 'Try another filter or add something new.'}</p></div>}
        <footer style={{ ...muted, fontSize: 12, borderTop: '1px solid #edf0f3', paddingTop: 16, marginTop: 12 }}>{completed} of {tasks.length} completed{pending ? ' · Saving…' : ' · Refreshes every 3 seconds'}</footer>
      </section>
      <footer style={{ ...muted, fontSize: 12, display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'space-between', marginTop: 22 }}><span>TanStack Start + Firestore · Local development</span><a href="http://127.0.0.1:4000" target="_blank" rel="noreferrer" style={{ color: '#205d50' }}>Open emulator dashboard ↗</a></footer>
    </main>
  )
}
