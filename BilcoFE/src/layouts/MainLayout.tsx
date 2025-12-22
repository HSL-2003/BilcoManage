import { type ReactNode, useState, useRef, useEffect } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './MainLayout.css'
import Galaxy from '../components/Galaxy'

type MainLayoutProps = {
  children: ReactNode
}

const MainLayout = ({ children }: MainLayoutProps) => {
  const { user, logout } = useAuth()
  const isAdmin = user?.role === 'admin'
  const [showDropdown, setShowDropdown] = useState(false)
  const [activeGroup, setActiveGroup] = useState('')
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
      {isAdmin && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0, pointerEvents: 'none' }}>
           <Galaxy 
              mouseRepulsion={true}
              mouseInteraction={true}
              density={1.5}
              glowIntensity={0.5}
              saturation={0.8}
              hueShift={240}
           />
        </div>
      )}
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
            <div className="layout-nav-groups">
              {/* GROUP: QUẢN LÝ TÀI SẢN */}
              <div className="nav-group">
                <div 
                  className="nav-group-header" 
                  onClick={() => setActiveGroup(prev => prev === 'ASSETS' ? '' : 'ASSETS')}
                >
                  <span className="nav-group-title">QUẢN LÝ TÀI SẢN</span>
                  <span className="nav-group-arrow">{activeGroup === 'ASSETS' ? '▼' : '▶'}</span>
                </div>
                {activeGroup === 'ASSETS' && (
                  <div className="nav-group-items">
                    <NavLink to="/admin/equipment" className="layout-nav-item sub-item">
                       Trò chơi / Thiết bị
                    </NavLink>
                  </div>
                )}
              </div>

              {/* GROUP: QUẢN LÝ KHO */}
               <div className="nav-group">
                <div 
                  className="nav-group-header" 
                  onClick={() => setActiveGroup(prev => prev === 'INVENTORY' ? '' : 'INVENTORY')}
                >
                  <span className="nav-group-title">QUẢN LÝ KHO</span>
                  <span className="nav-group-arrow">{activeGroup === 'INVENTORY' ? '▼' : '▶'}</span>
                </div>
                {activeGroup === 'INVENTORY' && (
                  <div className="nav-group-items">
                    <NavLink to="/admin/inventory" className="layout-nav-item sub-item">
                       Tổng quan tồn kho
                    </NavLink>
                    <NavLink to="/admin/materials" className="layout-nav-item sub-item">
                       Danh mục vật tư
                    </NavLink>
                     <NavLink to="/admin/material-types" className="layout-nav-item sub-item">
                       Loại vật tư
                    </NavLink>
                    <NavLink to="/admin/units" className="layout-nav-item sub-item">
                       Đơn vị tính
                    </NavLink>
                    <NavLink to="/admin/warehouses" className="layout-nav-item sub-item">
                       Kho bãi
                    </NavLink>
                    <NavLink to="/admin/suppliers" className="layout-nav-item sub-item">
                       Nhà cung cấp
                    </NavLink>
                  </div>
                )}
              </div>

              {/* GROUP: BẢO TRÌ & SỰ CỐ */}
               <div className="nav-group">
                <div 
                  className="nav-group-header" 
                  onClick={() => setActiveGroup(prev => prev === 'MAINTENANCE' ? '' : 'MAINTENANCE')}
                >
                  <span className="nav-group-title">BẢO TRÌ & SỰ CỐ</span>
                  <span className="nav-group-arrow">{activeGroup === 'MAINTENANCE' ? '▼' : '▶'}</span>
                </div>
                 {activeGroup === 'MAINTENANCE' && (
                  <div className="nav-group-items">
                    <NavLink to="/admin/incidents" className="layout-nav-item sub-item">
                       Quản lý sự cố
                    </NavLink>
                     <NavLink to="/maintenance" className="layout-nav-item sub-item">
                       Bảo trì & Kiểm tra
                    </NavLink>
                     <NavLink to="/admin/maintenance-plans" className="layout-nav-item sub-item">
                        Kế hoạch bảo trì
                     </NavLink>
                  </div>
                )}
              </div>

              {/* GROUP: HỆ THỐNG */}
              <div className="nav-group">
                 <div 
                  className="nav-group-header" 
                  onClick={() => setActiveGroup(prev => prev === 'SYSTEM' ? '' : 'SYSTEM')}
                >
                  <span className="nav-group-title">HỆ THỐNG</span>
                  <span className="nav-group-arrow">{activeGroup === 'SYSTEM' ? '▼' : '▶'}</span>
                </div>
                 {activeGroup === 'SYSTEM' && (
                  <div className="nav-group-items">
                     <NavLink to="/admin" end className="layout-nav-item sub-item">
                       Trung tâm quản trị
                    </NavLink>
                     <NavLink to="/reports" className="layout-nav-item sub-item">
                       Báo cáo
                    </NavLink>
                    <NavLink to="/admin/api-stats" className="layout-nav-item sub-item">
                       Thống kê API
                    </NavLink>
                  </div>
                )}
              </div>

            </div>
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
    </div>
  )
}

export default MainLayout


