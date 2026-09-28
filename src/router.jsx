import { createRouter } from '@tanstack/react-router'
import { routeTree } from './routeTree.gen.js'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

export function getRouter() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: 1, refetchInterval: 3000 } } })
  return createRouter({
    routeTree,
    scrollRestoration: true,
    Wrap: ({ children }) => <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>,
  })
}
