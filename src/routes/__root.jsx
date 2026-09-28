import { createRootRoute, HeadContent, Outlet, Scripts } from '@tanstack/react-router'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'Local tasks' },
    ],
  }),
  component: Root,
  notFoundComponent: () => <main style={{ padding: 40 }}><h1>Page not found</h1><a href="/">Back to tasks</a></main>,
})

function Root() {
  return (
    <html lang="en">
      <head><HeadContent /></head>
      <body style={{ margin: 0, background: '#f6f7f9', color: '#172433', fontFamily: 'system-ui, sans-serif' }}>
        <Outlet />
        <Scripts />
      </body>
    </html>
  )
}
