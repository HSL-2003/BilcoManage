import { type ReactNode, useState, useRef, useEffect } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import SnowCursor from '../components/SnowCursor'
import './MainLayout.css'

type MainLayoutProps = {
  children: ReactNode
}

const MainLayout = ({ children }: MainLayoutProps) => {
  const { user, logout } = useAuth()
  const isAdmin = user?.role === 'admin'
  const [showDropdown, setShowDropdown] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="layout-root">
      <aside className="layout-sidebar">
        <div className="layout-logo">
          <span className="layout-logo-main">Bilco</span>
          <span className="layout-logo-sub">Waterpark Assets</span>
        </div>

        <nav className="layout-nav">
          {!isAdmin && (
            <>
              <p className="layout-nav-section">Tổng quan</p>
              <NavLink to="/" end className="layout-nav-item">
                Dashboard
              </NavLink>
            </>
          )}

          {isAdmin && (
            <>
              <p className="layout-nav-section">Nghiệp vụ</p>
              <NavLink to="/plays" className="layout-nav-item">
                Trò chơi / Hạng mục
              </NavLink>
              <NavLink to="/admin/inventory" className="layout-nav-item">
                Quản lý tồn kho
              </NavLink>
              <NavLink to="/maintenance" className="layout-nav-item">
                Bảo trì & Kiểm tra
              </NavLink>
              <NavLink to="/reports" className="layout-nav-item">
                Báo cáo
              </NavLink>
            </>
          )}

          {isAdmin && (
            <>
              <p className="layout-nav-section">Quản trị</p>
              <NavLink to="/admin" className="layout-nav-item">
                Admin dashboard
              </NavLink>
            </>
          )}
        </nav>

        <div className="layout-footer">
          <Link to="/profile" className="layout-footer-link">
            Hồ sơ của tôi
          </Link>
          <span className="layout-footer-text">v0.1.0</span>
        </div>
      </aside>

      <div className="layout-main">
        <header className="layout-header">
          <div className="layout-header-left">
            <h1 className="layout-title">Quản lý vật liệu & bảo trì</h1>
            <p className="layout-subtitle">
              Theo dõi vật tư, lịch kiểm tra định kỳ và tình trạng an toàn các trò chơi.
            </p>
          </div>
          <div className="layout-header-right">
            
            <div className="layout-user-wrapper" ref={dropdownRef}>
              <div className="layout-user" onClick={() => setShowDropdown(!showDropdown)}>
                <span className="layout-user-avatar">
                   {user?.username?.charAt(0).toUpperCase() || 'U'}
                </span>
                <div className="layout-user-meta">
                  <span className="layout-user-name">{user?.username || 'Nhân viên'}</span>
                  <span className="layout-user-role">
                    {user?.role === 'admin' ? 'Quản trị hệ thống' : 'Kỹ thuật / Người dùng'}
                  </span>
                </div>
                <span style={{ fontSize: '10px', marginLeft: '4px', color: '#666' }}>▼</span>
              </div>

              {showDropdown && (
                <div className="layout-user-dropdown">
                  <div style={{padding: '12px 16px', borderBottom: '1px solid #eee'}}>
                    <div style={{fontWeight: 600, color: '#202124'}}>{user?.username}</div>
                    <div style={{fontSize: '12px', color: '#5f6368'}}>
                         {user?.role === 'admin' ? 'Administrator' : 'User'}
                    </div>
                  </div>
                  <Link to="/profile" className="layout-user-dropdown-item" onClick={() => setShowDropdown(false)}>
                    Hồ sơ cá nhân
                  </Link>
                   <Link to="#" className="layout-user-dropdown-item" onClick={() => setShowDropdown(false)}>
                    Cài đặt hiển thị
                  </Link>
                  <div className="layout-user-dropdown-divider"></div>
                  <button 
                    className="layout-user-dropdown-item" 
                    onClick={() => { logout(); setShowDropdown(false); }}
                    style={{color: '#d93025'}}
                  >
                    Đăng xuất
                  </button>
                </div>
              )}
            </div>

          </div>
        </header>

      <main className="layout-content">{children}</main>
      </div>
      <SnowCursor />
    </div>
  )
}

export default MainLayout


