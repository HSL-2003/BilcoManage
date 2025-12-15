import { type FormEvent, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import ShootingStarBackground from '../components/ShootingStarBackground'
import DeepDiveTransition from '../components/DeepDiveTransition'
import './auth.css'

const LoginPage = () => {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Transition States
  const [isTransitioning, setIsTransitioning] = useState(false) // Exit
  const [showEnterTransition, setShowEnterTransition] = useState(true) // Enter

  const onEnterComplete = () => setShowEnterTransition(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await login(username, password)
    } catch {
      setError('Đăng nhập thất bại, vui lòng kiểm tra lại tài khoản/mật khẩu.')
    } finally {
      setLoading(false)
    }
  }

  const handleRegisterClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsTransitioning(true);
    // Wait for Ripple Expand (1s approx)
    setTimeout(() => {
        navigate('/register');
    }, 1100); 
  }

  return (
    <div className="auth-root">
       {showEnterTransition && <DeepDiveTransition mode="enter" onComplete={onEnterComplete} />}
       {isTransitioning && <DeepDiveTransition mode="exit" onComplete={() => {}} />}
      <ShootingStarBackground />
      <div className="auth-panel" style={{position: 'relative', zIndex: 1}}>
        <div className="auth-brand">
          <span className="auth-brand-main">Bilco</span>
          <span className="auth-brand-sub">Waterpark Assets</span>
        </div>
        <h1 className="auth-title">Đăng nhập hệ thống</h1>
        <p className="auth-subtitle">
          Quản lý vật liệu, lịch bảo trì và an toàn vận hành cho khu vui chơi nước.
        </p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label className="form-field form-field-full">
            <span className="form-label">Tên đăng nhập</span>
            <input
              className="input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="VD: ky_thuat01"
            />
          </label>

          <label className="form-field form-field-full">
            <span className="form-label">Mật khẩu</span>
            <input
              className="input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Nhập mật khẩu"
            />
          </label>

          {error && <p className="auth-error">{error}</p>}

          <button type="submit" className="btn-primary auth-submit" disabled={loading}>
            {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>
        </form>

        <p className="auth-footer">
          Chưa có tài khoản?{' '}
          <a href="/register" onClick={handleRegisterClick} className="auth-link">
            Đăng ký
          </a>
        </p>

        <div className="auth-footer auth-cta-company">
          <Link to="/company" className="auth-cta-btn">
            <span className="auth-cta-icon">🌊</span>
            <span>Xem giới thiệu về Bilco</span>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
