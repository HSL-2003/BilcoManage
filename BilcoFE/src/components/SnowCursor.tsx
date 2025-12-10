import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

const SnowCursor = () => {
    // 7 colors of the rainbow + extras
    const colors = [
        '#FF0000', // Red
        '#FF7F00', // Orange
        '#FFFF00', // Yellow
        '#00FF00', // Green
        '#0000FF', // Blue
        '#4B0082', // Indigo
        '#9400D3', // Violet
    ]

  const [flakes, setFlakes] = useState<{ id: number; x: number; y: number; size: number; speedX: number; speedY: number; opacity: number; life: number; color: string }[]>([])

  useEffect(() => {
    // Ambient Snowfall
    const ambientInterval = setInterval(() => {
        if(Math.random() > 0.3) return 
        const id = Date.now() + Math.random()
        const color = colors[Math.floor(Math.random() * colors.length)]
        setFlakes(prev => [
            ...prev,
            {
                id,
                x: Math.random() * window.innerWidth,
                y: -10,
                size: Math.random() * 3 + 2,
                speedX: Math.random() * 1 - 0.5,
                speedY: Math.random() * 2 + 1,
                opacity: 0.8,
                life: 100,
                color
            }
        ])
    }, 100)

    const handleMouseMove = (e: MouseEvent) => {
        // Create trail flakes
        const count = 4; // Increased density for visibility
        const newFlakes = Array.from({ length: count }).map(() => ({
            id: Date.now() + Math.random(),
            x: e.clientX + (Math.random() * 10 - 5),
            y: e.clientY + (Math.random() * 10 - 5),
            size: Math.random() * 4 + 1,
            speedX: Math.random() * 2 - 1,
            speedY: Math.random() * 2 + 1,
            opacity: 1,
            life: 1.0,
            color: colors[Math.floor(Math.random() * colors.length)]
        }))
        setFlakes(prev => [...prev, ...newFlakes])
    }

    const moveInterval = setInterval(() => {
        setFlakes(prev => prev
            .map(f => ({
                ...f,
                x: f.x + f.speedX,
                y: f.y + f.speedY,
                life: f.y > -10 ? (f.life < 50 ? f.life - 0.02 : f.life) : f.life, 
                opacity: f.life < 1 ? f.life : 0.8 
            }))
            .filter(f => f.y < window.innerHeight && f.opacity > 0)
            .slice(-300) 
        )
    }, 20)

    window.addEventListener('mousemove', handleMouseMove)

    return () => {
        clearInterval(ambientInterval)
        clearInterval(moveInterval)
        window.removeEventListener('mousemove', handleMouseMove)
    }
  }, [])

  return createPortal(
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 99999999, overflow: 'hidden' }}>
      {flakes.map((flake) => (
        <div
          key={flake.id}
          style={{
            position: 'absolute',
            left: flake.x,
            top: flake.y,
            width: flake.size,
            height: flake.size,
            backgroundColor: flake.color,
            borderRadius: '50%',
            opacity: flake.opacity,
            boxShadow: `0 0 5px ${flake.color}`,
            transform: `scale(${Math.random() * 0.5 + 0.5})`,
            willChange: 'transform, top, left',
          }}
        />
      ))}
    </div>,
    document.body
  )
}

export default SnowCursor
