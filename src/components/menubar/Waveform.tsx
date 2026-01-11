import { useEffect, useRef } from 'react'

interface WaveformProps {
  audioLevel: number
}

export function Waveform({ audioLevel }: WaveformProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const barsRef = useRef<number[]>(Array(32).fill(0))

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Shift bars left and add new value
    barsRef.current.shift()
    barsRef.current.push(audioLevel)

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Draw bars
    const barWidth = canvas.width / barsRef.current.length
    const centerY = canvas.height / 2

    barsRef.current.forEach((level, i) => {
      const height = Math.max(2, level * canvas.height * 0.8)
      const x = i * barWidth

      // Create gradient
      const gradient = ctx.createLinearGradient(0, centerY - height / 2, 0, centerY + height / 2)
      gradient.addColorStop(0, 'rgba(59, 130, 246, 0.6)')
      gradient.addColorStop(0.5, 'rgba(59, 130, 246, 1)')
      gradient.addColorStop(1, 'rgba(59, 130, 246, 0.6)')

      ctx.fillStyle = gradient
      ctx.beginPath()
      ctx.roundRect(x + 1, centerY - height / 2, barWidth - 2, height, 2)
      ctx.fill()
    })
  }, [audioLevel])

  return (
    <canvas
      ref={canvasRef}
      width={280}
      height={60}
      className="w-full h-[60px] rounded-lg bg-gray-800/30"
    />
  )
}
