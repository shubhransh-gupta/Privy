import { Suspense, lazy, type ComponentType } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Header, useCommandPalette } from './components/CommandPalette'
import { Sidebar, MobileNav } from './components/Sidebar'
import { FileDropOverlay } from './components/FileDropOverlay'
import { HomePage } from './pages/HomePage'
import { CategoryPage } from './pages/CategoryPage'
import { FavoritesPage } from './pages/FavoritesPage'
import { SecurityPage } from './pages/SecurityPage'
import { TOOLS, type ToolCategory, type ToolDefinition } from './lib/toolRegistry'
import { getBasename } from './lib/router'

const CATEGORIES: ToolCategory[] = ['documents', 'images', 'developer', 'india', 'privacy', 'business']

// Create lazy components once at module level — calling lazy() inside render causes infinite loading
const LAZY_TOOLS = new Map<string, ComponentType>(
  TOOLS.map((tool) => [tool.id, lazy(tool.component)])
)

function AppLayout() {
  const { setOpen, CommandPalette } = useCommandPalette()

  return (
    <div className="min-h-screen flex flex-col">
      <Header onSearchClick={() => setOpen(true)} />
      <CommandPalette />

      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 overflow-y-auto pb-20 lg:pb-0">
          <Routes>
            <Route path="/" element={<HomePage onSearchClick={() => setOpen(true)} />} />
            <Route path="/favorites" element={<FavoritesPage />} />
            <Route path="/security" element={<SecurityPage />} />
            {CATEGORIES.map((cat) => (
              <Route key={cat} path={`/category/${cat}`} element={<CategoryPage category={cat} />} />
            ))}
            {TOOLS.map((tool) => (
              <Route
                key={tool.id}
                path={tool.route}
                element={
                  <SuspenseWrapper name={tool.name}>
                    <LazyToolComponent tool={tool} />
                  </SuspenseWrapper>
                }
              />
            ))}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>

      <MobileNav />
      <FileDropOverlay />
    </div>
  )
}

function LazyToolComponent({ tool }: { tool: ToolDefinition }) {
  const Component = LAZY_TOOLS.get(tool.id)!
  return <Component />
}

function SuspenseWrapper({ children, name }: { children: React.ReactNode; name: string }) {
  return (
    <Suspense
      fallback={
        <div className="max-w-5xl mx-auto px-4 py-16 text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
          <p className="text-sm text-zinc-500 mt-4">Loading {name}...</p>
        </div>
      }
    >
      {children}
    </Suspense>
  )
}

export default function App() {
  return (
    <BrowserRouter basename={getBasename()}>
      <AppLayout />
    </BrowserRouter>
  )
}
