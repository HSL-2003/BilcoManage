import { useEffect, useRef } from 'react'

const SpiderWebCursor = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let width = (canvas.width = window.innerWidth)
    let height = (canvas.height = window.innerHeight)

    let mouseX = width / 2
    let mouseY = height / 2

    // Configuration
    const particleCount = 50 // Số lượng hạt tơ
    const connectionDistance = 150 // Khoảng cách kết nối tơ
    const mouseSafetyRadius = 200 // Phạm vi ảnh hưởng của chuột
    const moveSpeed = 2.5 // Tốc độ di chuyển ngẫu nhiên

    interface Particle {
      x: number
      y: number
      vx: number
      vy: number
      size: number
      alpha: number
    }

    const particles: Particle[] = []

    const random = (min: number, max: number) => Math.random() * (max - min) + min

    // Init particles
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: random(0, width),
        y: random(0, height),
        vx: random(-moveSpeed, moveSpeed),
        vy: random(-moveSpeed, moveSpeed),
        size: random(1.5, 3.5),
        alpha: random(0.3, 0.8), // Độ mờ ngẫu nhiên tạo cảm giác ảo
      })
    }

    const handleMouseMove = (e: MouseEvent) => {
      // Smooth movement optional, simply tracking coords here
      mouseX = e.clientX
      mouseY = e.clientY
    }

    const handleResize = () => {
      width = canvas.width = window.innerWidth
      height = canvas.height = window.innerHeight
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('resize', handleResize)

    // Animation Loop
    const animate = () => {
      ctx.clearRect(0, 0, width, height)
      
      // Vẽ hiệu ứng "mơ hồ" (Glow/Blur)
      // Chúng ta sẽ vẽ các hạt và đường nối
      
      // Update particles
      particles.forEach((p) => {
        p.x += p.vx
        p.y += p.vy

        // Bounce off edges
        if (p.x < 0 || p.x > width) p.vx *= -1
        if (p.y < 0 || p.y > height) p.vy *= -1

        // Mouse interaction (Đẩy nhẹ hoặc hút nhẹ - ở đây làm hiệu ứng tơ bám theo chuột)
        const dxMouse = mouseX - p.x
        const dyMouse = mouseY - p.y
        const distMouse = Math.sqrt(dxMouse * dxMouse + dyMouse * dyMouse)

        // Nếu gần chuột, di chuyển chậm về phía chuột (hút nhẹ) nhưng không quá dính
        if (distMouse < mouseSafetyRadius) {
          p.x += dxMouse * 0.02
          p.y += dyMouse * 0.02
          p.alpha = Math.min(p.alpha + 0.02, 1) // Sáng lên khi gần chuột
        } else {
          // Trở về độ sáng bình thường
          if (p.alpha > 0.5) p.alpha -= 0.01
        }

        // Draw particle (Đốm sáng mơ hồ)
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        // Gradient cho hạt tạo hiệu ứng phát sáng
        const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 2)
        gradient.addColorStop(0, `rgba(138, 180, 248, ${p.alpha})`) // Xanh dương nhạt
        gradient.addColorStop(1, 'rgba(138, 180, 248, 0)')
        
        ctx.fillStyle = gradient
        ctx.fill()
      })

      // Draw connections (Tơ nhện)
      // Kết nối giữa các hạt
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const p1 = particles[i]
          const p2 = particles[j]
          const dx = p1.x - p2.x
          const dy = p1.y - p2.y
          const dist = Math.sqrt(dx * dx + dy * dy)

          if (dist < connectionDistance) {
            ctx.beginPath()
            ctx.strokeStyle = `rgba(138, 180, 248, ${0.2 * (1 - dist / connectionDistance)})`
            ctx.lineWidth = 1
            ctx.moveTo(p1.x, p1.y)
            ctx.lineTo(p2.x, p2.y)
            ctx.stroke()
          }
        }
      }

      // Kết nối hạt với chuột (Tạo mạng lưới từ chuột)
      particles.forEach((p) => {
        const dx = mouseX - p.x
        const dy = mouseY - p.y
        const dist = Math.sqrt(dx * dx + dy * dy)

        if (dist < mouseSafetyRadius) {
            ctx.beginPath()
            // Màu sáng hơn khi nối với chuột
            ctx.strokeStyle = `rgba(100, 200, 255, ${0.4 * (1 - dist / mouseSafetyRadius)})`
            ctx.lineWidth = 1.2
            ctx.moveTo(mouseX, mouseY) // Từ chuột
            ctx.lineTo(p.x, p.y) // Đến hạt
            ctx.stroke()
        }
      })
      
      // Vẽ điểm sáng tại chuột (Glow center)
      const mouseGradient = ctx.createRadialGradient(mouseX, mouseY, 0, mouseX, mouseY, 40)
      mouseGradient.addColorStop(0, 'rgba(255, 255, 255, 0.4)')
      mouseGradient.addColorStop(1, 'rgba(255, 255, 255, 0)')
      ctx.fillStyle = mouseGradient
      ctx.beginPath()
      ctx.arc(mouseX, mouseY, 40, 0, Math.PI * 2)
      ctx.fill()

      requestAnimationFrame(animate)
    }

    const animationId = requestAnimationFrame(animate)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('resize', handleResize)
      cancelAnimationFrame(animationId)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 9999, // Rất cao để đè lên mọi thứ nhưng không chặn click
        pointerEvents: 'none', // Cho phép click xuyên qua
      }}
    />
  )
}

export default SpiderWebCursor
