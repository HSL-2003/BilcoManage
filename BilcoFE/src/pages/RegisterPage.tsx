import { type FormEvent, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import ShootingStarBackground from '../components/ShootingStarBackground'
import DeepDiveTransition from '../components/DeepDiveTransition'
import './auth.css'

const RegisterPage = () => {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  
  // Transitions
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [showEnterTransition, setShowEnterTransition] = useState(true)

  const onEnterComplete = () => setShowEnterTransition(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!username || !password) {
      setError('Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu.')
      return
    }

    if (password !== confirmPassword) {
      setError('Mật khẩu nhập lại không khớp.')
      return
    }

    setLoading(true)
    try {
      await register(username, password)
      setSuccess(true)
    } catch {
      setError('Đăng ký thất bại. Tên đăng nhập có thể đã tồn tại.')
    } finally {
      setLoading(false)
    }
  }

  const handleLoginClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsTransitioning(true);
    setTimeout(() => {
        navigate('/login');
    }, 1100);
  }

  if (success) {
    return (
      <div className="auth-root">
        <ShootingStarBackground />
        <div className="auth-panel" style={{ textAlign: 'center', padding: '60px 40px', position: 'relative', zIndex: 1 }}>
          <div style={{ fontSize: '64px', marginBottom: '24px' }}>🎉</div>
          <h1 className="auth-title">Đăng ký thành công!</h1>
          <p className="auth-subtitle" style={{ marginTop: '16px', marginBottom: '32px' }}>
            Tài khoản <strong>{username}</strong> đã được tạo va đang chờ quản trị viên duyệt.
            <br />
            Vui lòng liên hệ admin để được kích hoạt sớm nhất.
          </p>
          <a href="/login" onClick={handleLoginClick} className="btn-primary auth-submit" style={{ textDecoration: 'none', display: 'inline-block' }}>
            Về trang đăng nhập
          </a>
        </div>
      </div>
    )
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
        <h1 className="auth-title">Đăng ký tài khoản</h1>
        <p className="auth-subtitle">
          Tạo tài khoản cho nhân sự vận hành/bảo trì. Có thể giới hạn quyền trên giao diện admin.
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

          <label className="form-field form-field-full">
            <span className="form-label">Nhập lại mật khẩu</span>
            <input
              className="input"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Nhập lại mật khẩu"
            />
          </label>

          {error && <p className="auth-error">{error}</p>}

          <button type="submit" className="btn-primary auth-submit" disabled={loading}>
            {loading ? 'Đang xử lý...' : 'Đăng ký'}
          </button>
        </form>

        <p className="auth-footer">
          Đã có tài khoản?{' '}
          <a href="/login" onClick={handleLoginClick} className="auth-link">
            Đăng nhập
          </a>
        </p>
      </div>
    </div>
  )
}

export default RegisterPage
