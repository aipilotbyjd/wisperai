interface TimerProps {
  seconds: number
}

export function Timer({ seconds }: TimerProps) {
  const minutes = Math.floor(seconds / 60)
  const secs = seconds % 60

  return (
    <span className="text-sm font-mono text-gray-400">
      {String(minutes).padStart(2, '0')}:{String(secs).padStart(2, '0')}
    </span>
  )
}
