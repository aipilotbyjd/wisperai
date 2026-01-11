import { useSettingsStore, type Style } from '../../stores'
import { clsx } from 'clsx'

const styles: { id: Style; label: string; icon: string }[] = [
  { id: 'formal', label: 'Formal', icon: '📝' },
  { id: 'casual', label: 'Casual', icon: '💬' },
  { id: 'extremely_casual', label: 'Chill', icon: '😎' },
]

export function StyleSwitcher() {
  const { currentStyle, setStyle } = useSettingsStore()

  return (
    <div className="flex gap-1 bg-gray-800/50 rounded-lg p-1">
      {styles.map((style) => (
        <button
          key={style.id}
          onClick={() => setStyle(style.id)}
          className={clsx(
            'flex-1 py-1.5 px-2 rounded-md text-xs font-medium transition-all',
            currentStyle === style.id
              ? 'bg-blue-500/20 text-blue-400'
              : 'text-gray-400 hover:text-gray-200'
          )}
        >
          <span className="mr-1">{style.icon}</span>
          {style.label}
        </button>
      ))}
    </div>
  )
}
