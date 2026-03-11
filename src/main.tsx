import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider, createRouter } from '@tanstack/react-router'
import * as TanStackQueryProvider from './providers/root-provider.tsx'
import { routeTree } from './routeTree.gen'
import './styles.css'
import reportWebVitals from './reportWebVitals.ts'
import { AuthProvider, useAuth } from './routes/-auth.tsx'
import { LanguageProvider } from './providers/language-provider.tsx'

const TanStackQueryProviderContext = TanStackQueryProvider.getContext()
const router = createRouter({
  routeTree,
  context: { ...TanStackQueryProviderContext, auth: undefined! },
  defaultPreload: 'intent',
  scrollRestoration: true,
  defaultStructuralSharing: true,
  defaultPreloadStaleTime: 0,
})

declare module '@tanstack/react-router' {
  interface Register { router: typeof router }
}

function InnerApp() {
  const auth = useAuth()
  return <RouterProvider router={router} context={{ ...TanStackQueryProviderContext, auth }} />
}

const rootElement = document.getElementById('app')
if (rootElement && !rootElement.innerHTML) {
  ReactDOM.createRoot(rootElement).render(
    <StrictMode>
      <TanStackQueryProvider.Provider {...TanStackQueryProviderContext}>
        <AuthProvider>
          <LanguageProvider>
            <InnerApp />
          </LanguageProvider>
        </AuthProvider>
      </TanStackQueryProvider.Provider>
    </StrictMode>,
  )
}

reportWebVitals()