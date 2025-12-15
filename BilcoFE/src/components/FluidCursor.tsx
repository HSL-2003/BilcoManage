import { useEffect, useRef } from 'react'

const FluidCursor = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const particles = useRef<any[]>([])
    const mouse = useRef({ x: 0, y: 0 })

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext('2d')
        if (!ctx) return

        let animationFrameId: number
        let width = window.innerWidth
        let height = window.innerHeight

        const resize = () => {
            width = window.innerWidth
            height = window.innerHeight
            canvas.width = width
            canvas.height = height
        }
        window.addEventListener('resize', resize)
        resize()

        class Particle {
            x: number
            y: number
            vx: number
            vy: number
            size: number
            color: string
            life: number
            maxLife: number

            constructor(x: number, y: number) {
                this.x = x
                this.y = y
                const angle = Math.random() * Math.PI * 2
                const speed = Math.random() * 2 + 1
                this.vx = Math.cos(angle) * speed
                this.vy = Math.sin(angle) * speed
                this.size = Math.random() * 15 + 5
                this.life = 100
                this.maxLife = 100
                // Random fluid colors (Blues, Cyans, Purples)
                const hue = 180 + Math.random() * 100 
                this.color = `hsla(${hue}, 100%, 50%, 0.8)`
            }

            update() {
                this.x += this.vx
                this.y += this.vy
                this.vx *= 0.96 // Friction
                this.vy *= 0.96
                this.size *= 0.96
                this.life--
            }

            draw(context: CanvasRenderingContext2D) {
                context.beginPath()
                context.arc(this.x, this.y, this.size, 0, Math.PI * 2)
                context.fillStyle = this.color
                context.fill()
            }
        }

        const handleMouseMove = (e: MouseEvent) => {
            mouse.current = { x: e.clientX, y: e.clientY }
            // Spawn particles on move (splash)
            for (let i = 0; i < 3; i++) {
                particles.current.push(new Particle(e.clientX, e.clientY))
            }
        }
        window.addEventListener('mousemove', handleMouseMove)

        const render = () => {
            // Clear with fading trail for fluid effect
            ctx.globalCompositeOperation = 'source-over'
            ctx.fillStyle = 'rgba(255, 255, 255, 0.2)' // Light fade for white background
            // Use clear rect if we want transparency, but for trails we need fillRect
            // However, filling with white might hide background if this canvas is on top?
            // Since this canvas is zIndex 0 (background), we should clear properly.
            
            ctx.clearRect(0, 0, width, height)
            
            // To simulate trails we need to NOT clear completely, but since we are over a DOM background,
            // we can't just fillRect with opacity over the DOM.
            // So for transparent canvas, we just draw particles. 
            // To make them "fluid", we can use a lot of particles and blur?
            
            // Let's stick to standard particle drawing for safety first to ensure it renders.
            
            // Re-draw all existing particles
            for (let i = 0; i < particles.current.length; i++) {
                const p = particles.current[i]
                p.update()
                p.draw(ctx)
                if (p.life <= 0 || p.size < 0.5) {
                    particles.current.splice(i, 1)
                    i--
                }
            }
            
            animationFrameId = requestAnimationFrame(render)
        }
        render()

        return () => {
            window.removeEventListener('resize', resize)
            window.removeEventListener('mousemove', handleMouseMove)
            cancelAnimationFrame(animationFrameId)
        }
    }, [])

    return (
        <canvas
            ref={canvasRef}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                pointerEvents: 'none',
                zIndex: 0 // Background layer
            }}
        />
    )
}

export default FluidCursor
