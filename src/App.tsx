import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AppLayout } from './components/layout'
import { Dashboard, Settings, Menubar } from './pages'

function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">{title}</h1>
      <p className="text-gray-500">Coming soon in Phase 5...</p>
    </div>
  )
}

export default function App() {
  // Check if this is the menubar window via URL path
  const isMenubar = window.location.pathname === '/menubar'

  if (isMenubar) {
    return <Menubar />
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/dictionary" element={<PlaceholderPage title="Dictionary" />} />
          <Route path="/styles" element={<PlaceholderPage title="Style Matching" />} />
          <Route path="/commands" element={<PlaceholderPage title="Voice Commands" />} />
          <Route path="/snippets" element={<PlaceholderPage title="Snippets" />} />
          <Route path="/notes" element={<PlaceholderPage title="Notes" />} />
          <Route path="/history" element={<PlaceholderPage title="History" />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
