import { useEffect } from 'react'
import { getCurrentWindow } from '@tauri-apps/api/window'
import { MenubarWidget } from '../components/menubar'

export function Menubar() {
  useEffect(() => {
    // Close menubar when clicking outside (losing focus)
    const handleBlur = async () => {
      try {
        const win = getCurrentWindow()
        await win.hide()
      } catch (err) {
        console.error('Failed to hide window:', err)
      }
    }

    window.addEventListener('blur', handleBlur)
    return () => window.removeEventListener('blur', handleBlur)
  }, [])

  return (
    <div className="min-h-screen bg-transparent p-2">
      <MenubarWidget />
    </div>
  )
}
