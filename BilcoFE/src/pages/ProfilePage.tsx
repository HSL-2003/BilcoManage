import { useState, useEffect, type FormEvent } from 'react'
import MainLayout from '../layouts/MainLayout'
import { apiGet, apiPut } from '../api/client'
import { useAuth } from '../context/AuthContext'

type UserProfile = {
  hoTen: string
  soDienThoai: string
  email: string
  tenDangNhap: string
  phongBan?: string
  chucVu?: string
}

const ProfilePage = () => {
  const { user } = useAuth()
  const [profile, setProfile] = useState<UserProfile>({
    hoTen: '',
    soDienThoai: '',
    email: '',
    tenDangNhap: '',
    phongBan: '',
    chucVu: '',
  })
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return

      console.log('🔍 Current user object:', user)
      console.log('🔍 User ID (MaND):', user.id)

      // Helper to map ANY case-insensitive logic or PascalCase from API to Custom State
      const mapResponseToProfile = (data: any) => {
        if (!data) return
        console.log('✅ Mapping profile data:', data)
        setProfile((prev) => ({
          ...prev,
          hoTen: data.hoTen || data.HoTen || data.fullName || prev.hoTen || data.tenDangNhap,
          soDienThoai: data.soDienThoai || data.SoDienThoai || data.phoneNumber || prev.soDienThoai,
          email: data.email || data.Email || prev.email,
          tenDangNhap: data.tenDangNhap || data.TenDangNhap || data.username || prev.tenDangNhap,
          phongBan: data.phongBan || data.PhongBan || data.department || prev.phongBan,
          chucVu: data.chucVu || data.ChucVu || data.position || prev.chucVu,
        }))
      }

      // PRIMARY STRATEGY: Use /api/Auth/{id} endpoint with MaND
      try {
        const maND = user.id
        console.log('📡 Calling GET /api/Auth/' + maND)
        if (maND) {
          const data = await apiGet<any>(`/api/Auth/${maND}`)
          console.log('✅ Profile API response:', data)
          if (data) {
            mapResponseToProfile(data)
            return
          }
        }
      } catch (err: any) {
        console.error('❌ GET /api/Auth/{id} failed:', err)
        
        // Check if it's a 401 Unauthorized error
        if (err?.message?.includes('401')) {
          setMsg({ 
            type: 'error', 
            text: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng xuất và đăng nhập lại.' 
          })
          return // Don't try fallback if unauthorized
        }
      }

      // Fallback: Try users list endpoint (for admin only)
      try {
        console.log('📡 Fallback: Calling GET /api/Auth/users')
        const data = await apiGet<any>('/api/Auth/users')
        if (Array.isArray(data)) {
          const currentUser = data.find((u: any) => 
            u.maND?.toString() === user.id?.toString() || 
            u.tenDangNhap === user.username
          )
          if (currentUser) {
            console.log('✅ Found user in users list:', currentUser)
            mapResponseToProfile(currentUser)
            return
          }
        }
      } catch (err) { 
        console.error('❌ GET /users fallback failed:', err)
      }

      // Context Fallback
      console.log('⚠️ Using context fallback')
      setProfile(prev => ({
        ...prev,
        hoTen: user.hoTen || user.username || prev.hoTen,
        email: user.email || prev.email,
        soDienThoai: user.soDienThoai || prev.soDienThoai,
        tenDangNhap: user.username || prev.tenDangNhap,
        phongBan: user.phongBan || prev.phongBan,
        chucVu: user.chucVu || prev.chucVu,
      }))
    }
    
    fetchProfile()
  }, [user])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setMsg(null)

    if (password && password !== confirmPassword) {
      setMsg({ type: 'error', text: 'Mật khẩu xác nhận không khớp.' })
      return
    }

    try {
      setLoading(true)
      
      // Construct Payload based on Swagger: { hoTen, soDienThoai, email, matKhau }
      const payload: any = {
        hoTen: profile.hoTen, // Send current hoTen (even if hidden from UI)
        soDienThoai: profile.soDienThoai,
        email: profile.email,
      }
      
      // Only include matKhau if user entered a new one
      if (password) {
        payload.matKhau = password
      }

      // Call API using the profile endpoint
      // PUT /api/Auth/profile
      console.log('📡 Updating profile Payload:', payload)
      await apiPut('/api/Auth/profile', payload)
      setMsg({ type: 'success', text: 'Cập nhật thông tin thành công!' })
      setPassword('')
      setConfirmPassword('')
    } catch (err) {
      console.error(err)
      setMsg({ type: 'error', text: 'Không thể cập nhật hồ sơ. Vui lòng thử lại.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <MainLayout>
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '24px' }}>
        <h2 style={{ fontSize: '24px', marginBottom: '8px', color: '#fff' }}>Hồ sơ cá nhân</h2>
        <p style={{ color: '#94a3b8', marginBottom: '32px' }}>Quản lý thông tin và mật khẩu của bạn</p>

        <div className="card" style={{ padding: '32px', background: 'rgba(30, 41, 59, 0.6)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.1)' }}>
          {msg && (
            <div
              style={{
                padding: '12px',
                borderRadius: '8px',
                marginBottom: '24px',
                background: msg.type === 'success' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                color: msg.type === 'success' ? '#34d399' : '#f87171',
                border: msg.type === 'success' ? '1px solid #059669' : '1px solid #dc2626'
              }}
            >
              {msg.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="form-grid">
            <div className="form-field">
              <label className="form-label" style={{color: '#cbd5e1'}}>Tên đăng nhập</label>
              <input className="input" value={profile.tenDangNhap} disabled style={{ background: 'rgba(255,255,255,0.05)', color: '#94a3b8', cursor: 'not-allowed' }} />
            </div>
            
            {/* Removed Ho Ten field as requested */}

            <div className="form-field">
              <label className="form-label" style={{color: '#cbd5e1'}}>Email</label>
              <input
                className="input"
                type="email"
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                placeholder="email@example.com"
                style={{background: 'rgba(15, 23, 42, 0.6)', color: '#fff', borderColor: 'rgba(255,255,255,0.1)'}}
              />
            </div>

            <div className="form-field">
              <label className="form-label" style={{color: '#cbd5e1'}}>Số điện thoại</label>
              <input
                className="input"
                value={profile.soDienThoai}
                onChange={(e) => setProfile({ ...profile, soDienThoai: e.target.value })}
                placeholder="0912..."
                style={{background: 'rgba(15, 23, 42, 0.6)', color: '#fff', borderColor: 'rgba(255,255,255,0.1)'}}
              />
            </div>

            <div className="form-field">
              <label className="form-label" style={{color: '#cbd5e1'}}>Phòng ban (Chỉ xem)</label>
              <input className="input" value={profile.phongBan || ''} disabled style={{ background: 'rgba(255,255,255,0.05)', color: '#94a3b8' }} />
            </div>

            <div className="form-field">
              <label className="form-label" style={{color: '#cbd5e1'}}>Chức vụ (Chỉ xem)</label>
              <input className="input" value={profile.chucVu || ''} disabled style={{ background: 'rgba(255,255,255,0.05)', color: '#94a3b8' }} />
            </div>

            <div className="section-divider" style={{ gridColumn: '1 / -1', marginTop: '16px' }}>
              <span>Đổi mật khẩu</span>
            </div>

            <div className="form-field">
              <label className="form-label">Mật khẩu mới</label>
              <input
                className="input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Bỏ trống nếu không đổi"
              />
            </div>

            <div className="form-field">
              <label className="form-label">Xác nhận mật khẩu</label>
              <input
                className="input"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Nhập lại mật khẩu mới"
              />
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </MainLayout>
  )
}

export default ProfilePage
