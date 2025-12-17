import { type FormEvent, useEffect, useState } from 'react'
import MainLayout from '../layouts/MainLayout'
import { apiGet, apiPost, apiPut, apiDelete } from '../api/client'
import './admin.css' // Import custom admin styles
import AdminGameGallery from '../components/AdminGameGallery'

type PendingUser = {
  maND: number
  tenDangNhap: string
  email: string
  soDienThoai: string
  maNV: number | null
  maQuyen: number | null
  phongBan: string
  chucVu: string
  trangThai: boolean
  isActive: boolean
  lastLogin: string | null
}

type User = {
  maND: number
  tenDangNhap: string
  email: string
  soDienThoai: string
  phongBan: string
  chucVu: string
  maQuyen: number
  trangThai: boolean
  isActive: boolean
  lastLogin: string | null
  maNV?: number | null
  hoTen?: string // Added hoTen
}

// Demo Data for other tables
const transferDetails = [
  { maCTDC: 'CTDC001', maDieuChuyen: 'DC-2025-01', maVT: 'VT-BL-16', soLuong: 120, ghiChu: 'Chuyển sang kho khu trung tâm' },
  { maCTDC: 'CTDC002', maDieuChuyen: 'DC-2025-02', maVT: 'VT-CP-12', soLuong: 40, ghiChu: 'Bổ sung cho khu tàu lượn' },
]

const AdminDashboard = () => {
  const [pendingApprovals, setPendingApprovals] = useState<PendingUser[]>([])
  const [loadingPending, setLoadingPending] = useState(true)
  const [errorPending, setErrorPending] = useState<string | null>(null)
  const [processingIds, setProcessingIds] = useState<Set<number>>(new Set())
  const [users, setUsers] = useState<User[]>([])
  const [loadingUsers, setLoadingUsers] = useState(true)
  const [errorUsers, setErrorUsers] = useState<string | null>(null)

  // Form state
  const [createForm, setCreateForm] = useState({
    hoTen: '',
    tenDangNhap: '',
    matKhau: '',
    email: '',
    soDienThoai: '',
    phongBan: '',
    chucVu: '',
    maQuyen: '',
    ghiChu: '',
    maNV: '',
  })
  const [creatingAccount, setCreatingAccount] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)

  // -- Approval Modal State --
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false)
  const [selectedUserForApproval, setSelectedUserForApproval] = useState<PendingUser | null>(null)
  const [approvalForm, setApprovalForm] = useState({
    maQuyen: 3,
    hoTen: '',
    email: '',
    soDienThoai: '',
    phongBan: '',
    chucVu: '',
  })

  // -- Search State --
  const [searchTerm, setSearchTerm] = useState('')

  // -- Edit User Modal State --
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedUserForEdit, setSelectedUserForEdit] = useState<User | null>(null)
  const [editForm, setEditForm] = useState({
    hoTen: '',
    email: '',
    soDienThoai: '',
    phongBan: '',
    chucVu: '',
  })

  // -- Delete User Modal State --
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedUserForDelete, setSelectedUserForDelete] = useState<User | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // -- Derived Data --
  const filteredUsers = users.filter((u) => {
    const term = searchTerm.toLowerCase()
    return (
      (u.tenDangNhap?.toLowerCase() || '').includes(term) ||
      (u.email?.toLowerCase() || '').includes(term) ||
      (u.phongBan?.toLowerCase() || '').includes(term) ||
      (u.chucVu?.toLowerCase() || '').includes(term)
    )
  })

  const fetchAllUsers = async () => {
    try {
      setLoadingUsers(true)
      const data = await apiGet<User[]>('/api/Auth/users')
      setUsers(data || [])
    } catch {
      setErrorUsers('Không thể lấy danh sách user.')
    } finally {
      setLoadingUsers(false)
    }
  }

  useEffect(() => {
    const fetchPendingUsers = async () => {
      try {
        setLoadingPending(true)
        const data = await apiGet<PendingUser[]>('/api/Auth/pending')
        setPendingApprovals(data || [])
      } catch (err) {
        console.error('Failed to fetch pending', err)
        setErrorPending('Lỗi tải danh sách chờ duyệt.')
      } finally {
        setLoadingPending(false)
      }
    }
    fetchPendingUsers()
    fetchAllUsers()
  }, [])

  const handleApproval = async (maND: number, action: 'approve' | 'reject') => {
    if (action === 'approve') {
       const user = pendingApprovals.find(u => u.maND === maND)
       if (user) {
          setSelectedUserForApproval(user)
          setApprovalForm({
             maQuyen: user.maQuyen || 3,
             hoTen: user.tenDangNhap, 
             email: user.email || '',
             soDienThoai: user.soDienThoai || '',
             phongBan: user.phongBan || '',
             chucVu: user.chucVu || ''
          })
          setIsApproveModalOpen(true)
       }
       return
    }

    // REJECT FLOW -> DELETE the pending user
    try {
      setProcessingIds((prev) => new Set(prev).add(maND))
      console.log('Using DELETE /api/Auth/' + maND + ' for rejection/deletion')
      await apiDelete(`/api/Auth/${maND}`)
      setPendingApprovals((prev) => prev.filter((user) => user.maND !== maND))
      fetchAllUsers()
      alert('Đã từ chối và xóa yêu cầu đăng ký.')
    } catch (err) {
      console.error(err)
      alert(`Thao tác thất bại. Vui lòng thử lại.`)
    } finally {
      setProcessingIds((prev) => {
        const next = new Set(prev)
        next.delete(maND)
        return next
      })
    }
  }

  const confirmApproval = async (e: FormEvent) => {
     e.preventDefault()
     if (!selectedUserForApproval) return

     try {
        setProcessingIds(prev => new Set(prev).add(selectedUserForApproval.maND))
        const payload = {
           ...approvalForm,
           maQuyen: Number(approvalForm.maQuyen),
           maNV: selectedUserForApproval.maNV || 0, // Ensure maNV is sent
           trangThai: true,
           isActive: true
        }
        console.log('Validating Approve Payload:', payload)
        await apiPut(`/api/Auth/${selectedUserForApproval.maND}/approve`, payload)
        
        // Success cleanup
        setPendingApprovals(prev => prev.filter(u => u.maND !== selectedUserForApproval.maND))
        fetchAllUsers()
        setIsApproveModalOpen(false)
        setSelectedUserForApproval(null)
     } catch (err) {
        alert('Duyệt thất bại. Vui lòng kiểm tra dữ liệu.')
        console.error(err)
     } finally {
        if (selectedUserForApproval) {
            setProcessingIds(prev => { const n = new Set(prev); n.delete(selectedUserForApproval.maND); return n })
        }
     }
  }

  const openEditModal = (user: User) => {
    setSelectedUserForEdit(user)
    setEditForm({
      hoTen: user.hoTen || user.tenDangNhap || '', // Prioritize hoTen
      email: user.email || '',
      soDienThoai: user.soDienThoai || '',
      phongBan: user.phongBan || '',
      chucVu: user.chucVu || ''
    })
    setIsEditModalOpen(true)
  }

  const handleUpdateUser = async (e: FormEvent) => {
    e.preventDefault()
    if (!selectedUserForEdit) return

    console.log('📝 Updating User:', selectedUserForEdit)
    
    // Choose ID for endpoint: Try maNV first, fallback to maND (though endpoint says maNV)
    const updateId = selectedUserForEdit.maNV || selectedUserForEdit.maND
    console.log('🔗 Update ID being used:', updateId)

    try {
      const payload = {
        hoTen: editForm.hoTen,
        email: editForm.email,
        soDienThoai: editForm.soDienThoai,
        phongBan: editForm.phongBan,
        chucVu: editForm.chucVu
      }
      
      // Using maNV as per Swagger, but might be maND if user has no maNV
      await apiPut(`/api/Auth/nhanvien/${updateId}`, payload)
      
      // Success
      alert('Cập nhật thông tin thành công!')
      setIsEditModalOpen(false)
      setSelectedUserForEdit(null)
      // Force refresh data - Await it!
      await fetchAllUsers()
    } catch (err) {
      alert('Cập nhật thất bại. Vui lòng kiểm tra dữ liệu và xem console.')
      console.error(err)
    }
  }

  // -- Delete User Functions --
  const openDeleteModal = (user: User) => {
    setSelectedUserForDelete(user)
    setIsDeleteModalOpen(true)
  }

  const handleDeleteUser = async () => {
    if (!selectedUserForDelete) return

    try {
      setIsDeleting(true)
      // Log ID being deleted
      console.log('🗑️ Deleting User ID (maND):', selectedUserForDelete.maND)
      console.log('🗑️ User Info:', selectedUserForDelete)
      
      await apiDelete(`/api/Auth/${selectedUserForDelete.maND}`)
      
      // Success
      alert(`Đã xóa tài khoản "${selectedUserForDelete.tenDangNhap}" thành công!`)
      setIsDeleteModalOpen(false)
      setSelectedUserForDelete(null)
      fetchAllUsers()
    } catch (err) {
      alert('Xóa tài khoản thất bại. Vui lòng thử lại.')
      console.error(err)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleCreateAccount = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    try {
      setCreatingAccount(true)
      setCreateError(null)
      await apiPost('/api/Auth/admin/create', {
        tenDangNhap: createForm.tenDangNhap,
        matKhau: createForm.matKhau,
        maNV: createForm.maNV ? parseInt(createForm.maNV) : 0,
        maQuyen: createForm.maQuyen ? parseInt(createForm.maQuyen) : 0,
        email: createForm.email,
        soDienThoai: createForm.soDienThoai,
        phongBan: createForm.phongBan,
        chucVu: createForm.chucVu,
        trangThai: true,
        isActive: true,
      })
      setCreateForm({ hoTen: '', tenDangNhap: '', matKhau: '', email: '', soDienThoai: '', phongBan: '', chucVu: '', maQuyen: '', ghiChu: '', maNV: '' })
      alert('Tạo tài khoản thành công!')
      fetchAllUsers()
    } catch {
      setCreateError('Có lỗi xảy ra khi tạo tài khoản.')
    } finally {
      setCreatingAccount(false)
    }
  }

  return (
    <MainLayout>
      <div className="admin-container">
        <header className="admin-header">
          <div>
            <h1 className="admin-title">Trung tâm quản trị</h1>
            <p className="admin-subtitle">Quản lý người dùng, phân quyền và duyệt đăng ký mới.</p>
          </div>
          <nav className="admin-menu-bar">
            <a href="/admin/incidents" className="admin-menu-item">
               <span style={{fontSize: '16px'}}>⚠️</span> Quản lý sự cố
            </a>
            <a href="/admin/equipment" className="admin-menu-item">
               <span style={{fontSize: '16px'}}>🛠️</span> Thiết bị
            </a>
            <a href="/admin/materials" className="admin-menu-item">
               <span style={{fontSize: '16px'}}>🔩</span> Vật tư
            </a>
            <a href="/admin/inventory" className="admin-menu-item">
               <span style={{fontSize: '16px'}}>📦</span> Tồn kho
            </a>
            <a href="/admin/warehouses" className="admin-menu-item">
               <span style={{fontSize: '16px'}}>🏭</span> Kho bãi
            </a>
            <div style={{width: '1px', height: '20px', background: '#ccc', margin: '0 8px'}} />
            <button 
                className="btn-admin-primary" 
                style={{borderRadius: '99px', padding: '8px 20px'}}
                onClick={() => document.getElementById('create-user-section')?.scrollIntoView({ behavior: 'smooth' })}
            >
                + Tài khoản mới
            </button>
          </nav>
        </header>

        <AdminGameGallery />

        {/* Stats Row */}
        <div className="admin-stats-grid animate-up">
          <div className="stat-card">
            <span className="stat-val">{users.length}</span>
            <span className="stat-lbl">Tổng tài khoản</span>
          </div>
          <div className="stat-card">
            <span className="stat-val">{pendingApprovals.length}</span>
            <span className="stat-lbl" style={{ color: pendingApprovals.length > 0 ? '#d93025' : 'inherit' }}>
              Chờ duyệt
            </span>
          </div>
          <div className="stat-card">
            <span className="stat-val">
              {users.filter(u => u.trangThai).length}
            </span>
            <span className="stat-lbl">Đang hoạt động</span>
          </div>
          <div className="stat-card">
            <span className="stat-val">
              {users.filter(u => u.maQuyen === 1).length}
            </span>
            <span className="stat-lbl">Quản trị viên (Admin)</span>
          </div>
        </div>

        <div className="grid admin-grid-wide animate-up" style={{ animationDelay: '0.1s' }}>
          {/* USER MANAGEMENT & APPROVALS */}
          <div style={{ gridColumn: 'span 2' }}>
            <div className="admin-card">
              <div className="admin-card-header">
                <h3 className="admin-card-title">Yêu cầu đăng ký mới</h3>
                {pendingApprovals.length > 0 && <span className="badge badge-warning">{pendingApprovals.length} mới</span>}
              </div>
              
              {loadingPending ? (
                 <p style={{textAlign: 'center', color: '#888'}}>Đang tải...</p>
              ) : errorPending ? (
                <div style={{textAlign: 'center', padding: '16px', color: 'red'}}>{errorPending}</div>
              ) : pendingApprovals.length === 0 ? (
                <div style={{textAlign: 'center', padding: '20px', color: '#999', fontStyle: 'italic'}}>
                  Không có yêu cầu nào đang chờ.
                </div>
              ) : (
                <div className="admin-approval-list">
                  {pendingApprovals.map((req) => (
                    <div key={req.maND} className="admin-approval-item">
                      <div className="admin-user-info">
                        <h4>{req.tenDangNhap}</h4>
                        <div className="admin-user-meta">
                          {req.email || 'Chưa có email'} • {req.soDienThoai || 'Chưa có SĐT'}
                        </div>
                        <div className="admin-user-meta" style={{color: '#1a73e8'}}>
                          {req.chucVu} - {req.phongBan}
                        </div>
                      </div>
                      <div className="admin-actions">
                        <button 
                          className="btn-admin-danger" 
                          onClick={() => handleApproval(req.maND, 'reject')}
                          disabled={processingIds.has(req.maND)}
                        >
                          Từ chối
                        </button>
                        <button 
                          className="btn-admin-primary"
                          onClick={() => handleApproval(req.maND, 'approve')}
                          disabled={processingIds.has(req.maND)}
                        >
                          {processingIds.has(req.maND) ? '...' : 'Duyệt ngay'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="admin-card">
              <div className="admin-card-header">
                <h3 className="admin-card-title">Danh sách nhân viên</h3>
                <input 
                  className="admin-input" 
                  style={{width: '200px'}} 
                  placeholder="Tìm kiếm..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="table-wrapper">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Username</th>
                      <th>Phòng ban</th>
                      <th>Chức vụ</th>
                      <th>Quyền</th>
                      <th>Trạng thái</th>
                      <th>Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loadingUsers ? (
                      <tr><td colSpan={6} style={{textAlign: 'center'}}>Đang tải...</td></tr>
                    ) : errorUsers ? (
                      <tr><td colSpan={6} style={{textAlign: 'center', color: 'red'}}>{errorUsers}</td></tr>
                    ) : (
                      filteredUsers.map(u => (
                        <tr key={u.maND}>
                          <td>
                            <div style={{fontWeight: 500}}>{u.tenDangNhap}</div>
                            <div style={{fontSize: '11px', color: '#666'}}>{u.email}</div>
                          </td>
                          <td>{u.phongBan}</td>
                          <td>{u.chucVu}</td>
                          <td><span className="badge">{u.maQuyen}</span></td>
                          <td>
                            <span className={`badge ${u.trangThai ? 'badge-success' : 'badge-danger'}`}>
                              {u.trangThai ? 'Active' : 'Locked'}
                            </span>
                          </td>
                          <td>
                            <div style={{display: 'flex', gap: '8px'}}>
                              <button 
                                className="btn-admin-secondary"
                                onClick={() => openEditModal(u)}
                                style={{padding: '6px 12px', fontSize: '13px'}}
                              >
                                Sửa
                              </button>
                              <button 
                                className="btn-admin-danger"
                                onClick={() => openDeleteModal(u)}
                                style={{padding: '6px 12px', fontSize: '13px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer'}}
                              >
                                Xóa
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* CREATE ACCOUNT FORM */}
          <div id="create-user-section">
            <div className="admin-card" style={{borderTop: '4px solid #1a73e8'}}>
              <h3 className="admin-card-title" style={{marginBottom: '24px'}}>Cấp tài khoản mới</h3>
              
              <form onSubmit={handleCreateAccount}>
                {createError && <div style={{color: 'red', marginBottom: '16px', fontSize: '13px'}}>{createError}</div>}
                
                {/* GROUP 1: LOGIN INFO */}
                <div className="section-divider"><span>1. Thông tin đăng nhập</span></div>
                <div className="admin-input-group">
                  <label className="admin-label">Tên đăng nhập (Username) *</label>
                  <input 
                    className="admin-input" 
                    placeholder="VD: kythuat_vien01" 
                    value={createForm.tenDangNhap}
                    onChange={e => setCreateForm({...createForm, tenDangNhap: e.target.value})}
                    required
                  />
                  <small style={{color: '#666', fontSize: '12px'}}>Dùng để đăng nhập hệ thống</small>
                </div>
                
                <div className="admin-input-group">
                  <label className="admin-label">Mật khẩu tạm *</label>
                  <input 
                    className="admin-input" 
                    type="password"
                    placeholder="••••••••" 
                    value={createForm.matKhau}
                    onChange={e => setCreateForm({...createForm, matKhau: e.target.value})}
                    required
                  />
                </div>

                <div className="admin-input-group">
                  <label className="admin-label">Phân quyền</label>
                  <select 
                    className="admin-input"
                    value={createForm.maQuyen}
                    onChange={e => setCreateForm({...createForm, maQuyen: e.target.value})}
                  >
                    <option value="">-- Chọn quyền --</option>
                    <option value="1">1 - Quản trị hệ thống</option>
                    <option value="2">2 - Quản lý bảo trì</option>
                    <option value="3">3 - Nhân viên bảo trì</option>
                    <option value="4">4 - Xem báo cáo</option>
                    <option value="5">5 - Admin</option>
                    <option value="6">6 - QuanLy</option>
                    <option value="7">7 - NhanVien</option>
                    <option value="8">8 - XemBaoCao</option>
                  </select>
                </div>

                {/* GROUP 2: PERSONAL INFO */}
                <div className="section-divider"><span>2. Thông tin cá nhân</span></div>
                <div className="admin-input-group">
                  <label className="admin-label">Họ và tên nhân viên</label>
                  <input 
                    className="admin-input"
                    placeholder="VD: Nguyễn Văn A"
                    value={createForm.hoTen}
                    onChange={e => setCreateForm({...createForm, hoTen: e.target.value})}
                  />
                </div>
                
                <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px'}}>
                  <div className="admin-input-group">
                    <label className="admin-label">Email</label>
                    <input 
                      className="admin-input"
                      value={createForm.email}
                      onChange={e => setCreateForm({...createForm, email: e.target.value})}
                    />
                  </div>
                  <div className="admin-input-group">
                    <label className="admin-label">Số điện thoại</label>
                    <input 
                      className="admin-input"
                      value={createForm.soDienThoai}
                      onChange={e => setCreateForm({...createForm, soDienThoai: e.target.value})}
                    />
                  </div>
                </div>

                {/* GROUP 3: WORK INFO */}
                <div className="section-divider"><span>3. Công việc</span></div>
                <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px'}}>
                  <div className="admin-input-group">
                    <label className="admin-label">Phòng ban</label>
                    <input 
                      className="admin-input"
                      value={createForm.phongBan}
                      onChange={e => setCreateForm({...createForm, phongBan: e.target.value})}
                    />
                  </div>
                  <div className="admin-input-group">
                    <label className="admin-label">Chức vụ</label>
                    <input 
                      className="admin-input"
                      value={createForm.chucVu}
                      onChange={e => setCreateForm({...createForm, chucVu: e.target.value})}
                    />
                  </div>
                </div>

                 <div className="admin-input-group">
                    <label className="admin-label">Mã nhân viên (Tùy chọn)</label>
                    <input 
                      className="admin-input"
                      type="number"
                      placeholder="Nếu để trống, hệ thống tự tạo"
                      value={createForm.maNV}
                      onChange={e => setCreateForm({...createForm, maNV: e.target.value})}
                    />
                  </div>

                <div style={{marginTop: '24px'}}>
                  <button 
                    type="submit" 
                    className="btn-admin-primary" 
                    style={{width: '100%', padding: '12px'}}
                    disabled={creatingAccount}
                  >
                    {creatingAccount ? 'Đang xử lý...' : 'Tạo tài khoản ngay'}
                  </button>
                </div>

              </form>
            </div>
          </div>
        </div>

        {/* LOG SECTION (Full Width) */}
        <div className="admin-card animate-up" style={{animationDelay: '0.2s', marginTop: '32px'}}>
          <div className="admin-card-header">
            <h3 className="admin-card-title">Dữ liệu vận hành (Demo)</h3>
            <button className="btn-admin-outline">Xem tất cả</button>
          </div>
          <div className="table-wrapper">
             <table className="table">
              <thead>
                <tr>
                  <th>Mã phiếu</th>
                  <th>Loại phiếu</th>
                  <th>Ghi chú</th>
                  <th>Chi tiết</th>
                </tr>
              </thead>
              <tbody>
                {transferDetails.map(t => (
                  <tr key={t.maCTDC}>
                    <td>{t.maDieuChuyen}</td>
                    <td><span className="badge badge-success">Điều chuyển</span></td>
                    <td>{t.ghiChu}</td>
                    <td>{t.soLuong} vật tư</td>
                  </tr>
                ))}
                {/* Can add more details if needed */}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* APPROVAL MODAL */}
      {isApproveModalOpen && (
        <div className="admin-modal-overlay">
          <div className="admin-modal" style={{ width: '500px', maxWidth: '90%' }}>
            <h3>Duyệt tài khoản: {selectedUserForApproval?.tenDangNhap}</h3>
            <p style={{marginBottom: '16px', color: '#666'}}>Vui lòng điền thông tin để kích hoạt tài khoản này.</p>
            
            <form onSubmit={confirmApproval}>
                <div className="admin-input-group">
                    <label className="admin-label">Họ và tên</label>
                    <input 
                        className="admin-input" 
                        value={approvalForm.hoTen}
                        onChange={e => setApprovalForm({...approvalForm, hoTen: e.target.value})}
                        required
                    />
                </div>
                
                <div className="admin-input-group">
                    <label className="admin-label">Quyền hạn</label>
                    <select 
                        className="admin-input"
                        value={approvalForm.maQuyen}
                        onChange={e => setApprovalForm({...approvalForm, maQuyen: Number(e.target.value)})}
                    >
                        <option value="1">1 - Quản trị hệ thống</option>
                        <option value="2">2 - Quản lý bảo trì</option>
                        <option value="3">3 - Nhân viên bảo trì</option>
                        <option value="4">4 - Xem báo cáo</option>
                        <option value="5">5 - Admin</option>
                        <option value="6">6 - QuanLy</option>
                        <option value="7">7 - NhanVien</option>
                        <option value="8">8 - XemBaoCao</option>
                    </select>
                </div>

                <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px'}}>
                    <div className="admin-input-group">
                        <label className="admin-label">Email</label>
                        <input 
                            className="admin-input" 
                            type="email"
                            value={approvalForm.email}
                            onChange={e => setApprovalForm({...approvalForm, email: e.target.value})}
                        />
                    </div>
                    <div className="admin-input-group">
                        <label className="admin-label">Số điện thoại</label>
                        <input 
                            className="admin-input" 
                            value={approvalForm.soDienThoai}
                            onChange={e => setApprovalForm({...approvalForm, soDienThoai: e.target.value})}
                        />
                    </div>
                </div>

                <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px'}}>
                    <div className="admin-input-group">
                        <label className="admin-label">Phòng ban</label>
                        <input 
                            className="admin-input" 
                            value={approvalForm.phongBan}
                            onChange={e => setApprovalForm({...approvalForm, phongBan: e.target.value})}
                        />
                    </div>
                     <div className="admin-input-group">
                        <label className="admin-label">Chức vụ</label>
                        <input 
                            className="admin-input" 
                            value={approvalForm.chucVu}
                            onChange={e => setApprovalForm({...approvalForm, chucVu: e.target.value})}
                        />
                    </div>
                </div>

                <div className="form-actions" style={{display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '20px'}}>
                    <button 
                        type="button" 
                        className="btn-admin-outline"
                        onClick={() => setIsApproveModalOpen(false)}
                    >
                        Hủy
                    </button>
                    <button 
                        type="submit" 
                        className="btn-admin-primary"
                    >
                        Xác nhận duyệt
                    </button>
                </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {isEditModalOpen && (
        <div className="admin-modal-overlay">
          <div className="admin-modal" style={{ width: '500px', maxWidth: '90%' }}>
            <h3>Chỉnh sửa thông tin: {selectedUserForEdit?.tenDangNhap}</h3>
            <p style={{marginBottom: '16px', color: '#666'}}>Cập nhật thông tin nhân viên</p>
            
            <form onSubmit={handleUpdateUser}>
                <div className="admin-input-group">
                    <label className="admin-label">Họ và tên</label>
                    <input 
                        className="admin-input" 
                        value={editForm.hoTen}
                        onChange={e => setEditForm({...editForm, hoTen: e.target.value})}
                        required
                    />
                </div>

                <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px'}}>
                    <div className="admin-input-group">
                        <label className="admin-label">Email</label>
                        <input 
                            className="admin-input" 
                            type="email"
                            value={editForm.email}
                            onChange={e => setEditForm({...editForm, email: e.target.value})}
                        />
                    </div>
                    <div className="admin-input-group">
                        <label className="admin-label">Số điện thoại</label>
                        <input 
                            className="admin-input" 
                            value={editForm.soDienThoai}
                            onChange={e => setEditForm({...editForm, soDienThoai: e.target.value})}
                        />
                    </div>
                </div>

                <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px'}}>
                    <div className="admin-input-group">
                        <label className="admin-label">Phòng ban</label>
                        <input 
                            className="admin-input" 
                            value={editForm.phongBan}
                            onChange={e => setEditForm({...editForm, phongBan: e.target.value})}
                        />
                    </div>
                    <div className="admin-input-group">
                        <label className="admin-label">Chức vụ</label>
                        <input 
                            className="admin-input" 
                            value={editForm.chucVu}
                            onChange={e => setEditForm({...editForm, chucVu: e.target.value})}
                        />
                    </div>
                </div>

                <div className="form-actions" style={{display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '20px'}}>
                    <button 
                        type="button" 
                        className="btn-admin-outline"
                        onClick={() => setIsEditModalOpen(false)}
                    >
                        Hủy
                    </button>
                    <button 
                        type="submit" 
                        className="btn-admin-primary"
                    >
                        Cập nhật
                    </button>
                </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && selectedUserForDelete && (
        <div className="admin-modal-overlay" onClick={() => setIsDeleteModalOpen(false)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()} style={{maxWidth: '500px'}}>
            <div className="admin-card-header" style={{borderBottom: '1px solid #e5e7eb', paddingBottom: '16px'}}>
              <h2 style={{margin: 0, fontSize: '20px', fontWeight: 600, color: '#dc3545'}}>
                ⚠️ Xác nhận xóa tài khoản
              </h2>
              <button 
                className="btn-admin-outline"
                onClick={() => setIsDeleteModalOpen(false)}
                style={{background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#666', padding: '0 8px'}}
              >
                ×
              </button>
            </div>

            <div style={{padding: '24px 0'}}>
              <div style={{
                backgroundColor: '#fff3cd',
                border: '1px solid #ffc107',
                borderRadius: '8px',
                padding: '16px',
                marginBottom: '20px'
              }}>
                <p style={{margin: 0, color: '#856404', fontSize: '14px'}}>
                  <strong>Cảnh báo:</strong> Hành động này không thể hoàn tác!
                </p>
              </div>

              <p style={{margin: '0 0 16px 0', fontSize: '15px', color: '#374151'}}>
                Bạn có chắc chắn muốn xóa tài khoản sau?
              </p>

              <div style={{
                backgroundColor: '#f9fafb',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                padding: '16px',
                marginBottom: '20px'
              }}>
                <div style={{marginBottom: '8px'}}>
                  <strong style={{color: '#374151'}}>Tên đăng nhập:</strong>{' '}
                  <span style={{color: '#dc3545', fontWeight: 600}}>{selectedUserForDelete.tenDangNhap}</span>
                </div>
                <div style={{marginBottom: '8px'}}>
                  <strong style={{color: '#374151'}}>Email:</strong> {selectedUserForDelete.email}
                </div>
                <div style={{marginBottom: '8px'}}>
                  <strong style={{color: '#374151'}}>Phòng ban:</strong> {selectedUserForDelete.phongBan}
                </div>
                <div>
                  <strong style={{color: '#374151'}}>Chức vụ:</strong> {selectedUserForDelete.chucVu}
                </div>
              </div>

              <p style={{margin: 0, fontSize: '13px', color: '#6b7280', fontStyle: 'italic'}}>
                Tất cả dữ liệu liên quan đến tài khoản này sẽ bị xóa vĩnh viễn.
              </p>
            </div>

            <div style={{display: 'flex', justifyContent: 'flex-end', gap: '12px', paddingTop: '16px', borderTop: '1px solid #e5e7eb'}}>
              <button 
                type="button" 
                className="btn-admin-outline"
                onClick={() => setIsDeleteModalOpen(false)}
                disabled={isDeleting}
                style={{padding: '10px 20px'}}
              >
                Hủy
              </button>
              <button 
                type="button" 
                onClick={handleDeleteUser}
                disabled={isDeleting}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#dc3545',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontWeight: 500,
                  cursor: isDeleting ? 'not-allowed' : 'pointer',
                  opacity: isDeleting ? 0.6 : 1
                }}
              >
                {isDeleting ? 'Đang xóa...' : 'Xác nhận xóa'}
              </button>
            </div>
          </div>
        </div>
      )}

    </MainLayout>
  )
}

export default AdminDashboard
