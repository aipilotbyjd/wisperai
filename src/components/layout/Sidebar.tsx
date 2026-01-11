import { NavLink } from 'react-router-dom'
import { Home, Book, Wand2, MessageSquare, History, Settings, FileText, StickyNote } from 'lucide-react'
import { clsx } from 'clsx'

const navItems = [
  { path: '/', icon: Home, label: 'Dashboard' },
  { path: '/dictionary', icon: Book, label: 'Dictionary' },
  { path: '/styles', icon: Wand2, label: 'Styles' },
  { path: '/commands', icon: MessageSquare, label: 'Commands' },
  { path: '/snippets', icon: FileText, label: 'Snippets' },
  { path: '/notes', icon: StickyNote, label: 'Notes' },
  { path: '/history', icon: History, label: 'History' },
]

const bottomItems = [
  { path: '/settings', icon: Settings, label: 'Settings' },
]

export function Sidebar() {
  return (
    <aside className="w-56 border-r border-gray-800 flex flex-col bg-gray-950">
      <div className="p-4 border-b border-gray-800">
        <h1 className="text-xl font-bold text-white">Wisper Pro</h1>
      </div>

      <nav className="flex-1 p-2 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => clsx(
              'flex items-center gap-3 px-3 py-2 rounded-lg transition-colors',
              isActive
                ? 'bg-blue-500/20 text-blue-400'
                : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
            )}
          >
            <item.icon size={18} />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-2 border-t border-gray-800 space-y-1">
        {bottomItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => clsx(
              'flex items-center gap-3 px-3 py-2 rounded-lg transition-colors',
              isActive
                ? 'bg-blue-500/20 text-blue-400'
                : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
            )}
          >
            <item.icon size={18} />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </div>

      <div className="p-4 border-t border-gray-800">
        <div className="text-xs text-gray-500 mb-1">Usage this month</div>
        <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
          <div className="h-full bg-blue-500 rounded-full" style={{ width: '0%' }} />
        </div>
        <div className="text-xs text-gray-400 mt-1">0 / 30 minutes</div>
      </div>
    </aside>
  )
}
