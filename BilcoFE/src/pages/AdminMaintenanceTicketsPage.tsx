import { useState, useEffect, type FormEvent } from 'react'
import MainLayout from '../layouts/MainLayout'
import { apiGet, apiPost, apiPut, apiDelete } from '../api/client'
import { useAuth } from '../context/AuthContext'
import './admin.css'

interface PhieuBaoTri {
  maPhieu: number
  maKeHoach: number
  maThietBi: number
  nhanVienThucHien: number
  tenNhanVienThucHien?: string
  thoiGianBatDau: string
  thoiGianKetThuc: string
  tinhTrangTruocBT: string
  tinhTrangSauBT: string
  ketQua: string
  ghiChu: string
  nguoiXacNhan: number
  tenNguoiXacNhan?: string
  ngayXacNhan: string
  trangThai: string
  tenKeHoach?: string
  tenThietBi?: string
  // New API Fields
  nguoiTao: number
  nguoiDuyet?: number
  trangThaiDuyet?: string
  lyDoTuChoi?: string
  ngayDuyet?: string
  tenNguoiTao?: string
  tenNguoiDuyet?: string
}

const AdminMaintenanceTicketsPage = () => {
  const { user } = useAuth()
  const [items, setItems] = useState<PhieuBaoTri[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  
  // Approval/Rejection State
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false)
  const [selectedTicketId, setSelectedTicketId] = useState<number | null>(null)
  const [actionNote, setActionNote] = useState('') // Used for both Approve Note and Reject Reason
  
  const [formData, setFormData] = useState({
    maKeHoach: 0,
    maThietBi: 0,
    nhanVienThucHien: 0,
    thoiGianBatDau: '',
    thoiGianKetThuc: '',
    tinhTrangTruocBT: '',
    tinhTrangSauBT: '',
    ketQua: '',
    ghiChu: '',
    trangThai: 'Đang thực hiện'
  })
  const [submitting, setSubmitting] = useState(false)

  const fetchItems = async () => {
    try {
      setLoading(true)
      const data = await apiGet<PhieuBaoTri[]>('/api/PhieuBaoTri')
      // Sort: Pending approval first, then by date
      const sorted = (data || []).sort((a, b) => {
         if (a.trangThaiDuyet === 'Chờ duyệt' && b.trangThaiDuyet !== 'Chờ duyệt') return -1
         if (a.trangThaiDuyet !== 'Chờ duyệt' && b.trangThaiDuyet === 'Chờ duyệt') return 1
         return new Date(b.thoiGianBatDau).getTime() - new Date(a.thoiGianBatDau).getTime()
      })
      setItems(sorted)
    } catch (err) {
      console.error(err)
      alert('Không thể tải danh sách phiếu bảo trì.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchItems()
  }, [])

  const filteredItems = items.filter(i => {
    // Search Filter
    const matchesSearch = (i.tenThietBi?.toLowerCase() || '').includes(searchTerm.toLowerCase()) || 
                          (i.trangThai?.toLowerCase() || '').includes(searchTerm.toLowerCase()) || 
                          (i.trangThaiDuyet?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                          i.maPhieu.toString().includes(searchTerm)
    
    // Role Filter: Admin sees all, User sees only their assigned tickets
    const isAdmin = user?.role === 'admin'
    const isOwner = i.nhanVienThucHien === user?.maND

    return matchesSearch && (isAdmin || isOwner)
  })

  const handleAddNew = () => {
    setEditingId(null)
    setFormData({
        maKeHoach: 0,
        maThietBi: 0,
        nhanVienThucHien: user?.maND || 0,
        thoiGianBatDau: new Date().toISOString().slice(0, 16),
        thoiGianKetThuc: new Date().toISOString().slice(0, 16),
        tinhTrangTruocBT: '',
        tinhTrangSauBT: '',
        ketQua: '',
        ghiChu: '',
        trangThai: 'Đang thực hiện'
    })
    setIsModalOpen(true)
  }

  const handleEdit = (item: PhieuBaoTri) => {
    setEditingId(item.maPhieu)
    setFormData({ 
        maKeHoach: item.maKeHoach,
        maThietBi: item.maThietBi,
        nhanVienThucHien: item.nhanVienThucHien,
        thoiGianBatDau: item.thoiGianBatDau ? item.thoiGianBatDau.slice(0, 16) : '',
        thoiGianKetThuc: item.thoiGianKetThuc ? item.thoiGianKetThuc.slice(0, 16) : '',
        tinhTrangTruocBT: item.tinhTrangTruocBT,
        tinhTrangSauBT: item.tinhTrangSauBT,
        ketQua: item.ketQua,
        ghiChu: item.ghiChu,
        trangThai: item.trangThai
    })
    setIsModalOpen(true)
  }

  const handleDelete = async (id: number) => {
    if (window.confirm('Xóa phiếu bảo trì này?')) {
      try {
        await apiDelete(`/api/PhieuBaoTri/${id}`)
        setItems(prev => prev.filter(i => i.maPhieu !== id))
      } catch (err) {
        console.error(err)
        alert('Xóa thất bại.')
      }
    }
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const payload = {
          ...formData,
          maKeHoach: Number(formData.maKeHoach),
          maThietBi: Number(formData.maThietBi),
          nhanVienThucHien: Number(formData.nhanVienThucHien),
          thoiGianBatDau: new Date(formData.thoiGianBatDau).toISOString(),
          thoiGianKetThuc: new Date(formData.thoiGianKetThuc).toISOString(),
      }

      if (editingId) {
        await apiPut(`/api/PhieuBaoTri/${editingId}`, payload)
        alert('Cập nhật thành công!')
      } else {
        await apiPost('/api/PhieuBaoTri', payload)
        alert('Tạo phiếu thành công!')
      }
      setIsModalOpen(false)
      fetchItems()
    } catch (err) {
      console.error(err)
      alert('Lỗi khi lưu phiếu bảo trì. Kiểm tra lại thông tin.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleApprove = async (id: number) => {
      // For approval, we might want a simple confirmation or an optional note. 
      // API requires body: { maPhieu, ghiChu }
      const note = window.prompt('Nhập ghi chú duyệt (tùy chọn):', 'Đã kiểm tra OK')
      if (note === null) return // Cancelled

      try {
          await apiPost(`/api/PhieuBaoTri/${id}/duyet`, { maPhieu: id, ghiChu: note })
          alert('Đã duyệt phiếu thành công!')
          fetchItems()
      } catch (e) {
          console.error(e)
          alert('Duyệt thất bại.')
      }
  }

  const handleReject = (id: number) => {
      setSelectedTicketId(id)
      setActionNote('')
      setIsRejectModalOpen(true)
  }

  const confirmReject = async () => {
      if (!selectedTicketId || !actionNote.trim()) {
          alert('Vui lòng nhập lý do từ chối.')
          return
      }
      try {
          await apiPost(`/api/PhieuBaoTri/${selectedTicketId}/tuchoi`, { maPhieu: selectedTicketId, lyDoTuChoi: actionNote })
          alert('Đã từ chối phiếu.')
          setIsRejectModalOpen(false)
          fetchItems()
      } catch (e) {
          console.error(e)
          alert('Thao tác thất bại.')
      }
  }

  const getStatusBadge = (s: string) => {
      if (!s) return 'badge-default'
      const lower = s.toLowerCase()
      if(lower === 'hoàn thành' || lower === 'đã duyệt') return 'badge-success'
      if(lower === 'đang thực hiện' || lower === 'chờ duyệt') return 'badge-warning' // Orange for pending/progress
      if(lower === 'hủy' || lower === 'từ chối') return 'badge-danger'
      return 'badge-info'
  }

  const getApprovalBadge = (s?: string) => {
      if (!s) return null
      const lower = s.toLowerCase()
      if (lower.includes('duyệt') && !lower.includes('chờ')) return <span className="badge badge-success">Đã duyệt</span>
      if (lower.includes('từ chối')) return <span className="badge badge-danger">Từ chối</span>
      return <span className="badge badge-warning">Chờ duyệt</span>
  }

  return (
    <MainLayout>
      <div className="admin-root">
        <header className="admin-header">
          <div>
            <h1 className="admin-title">Phiếu Bảo Trì</h1>
            <p className="admin-subtitle">Quản lý các phiếu thực hiện bảo trì thiết bị.</p>
          </div>
          <div style={{display: 'flex', gap: '16px', alignItems: 'center'}}>
             <input 
                type="text" 
                placeholder="Tìm phiếu, thiết bị..." 
                className="admin-search-input"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                style={{width: '240px'}}
             />
             <button className="btn-admin-primary" onClick={handleAddNew}>+ Tạo Phiếu</button>
          </div>
        </header>

        <section className="admin-card animate-up">
           <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Mã Phiếu</th>
                  <th>Thiết Bị</th>
                  <th>Nhân viên</th>
                  <th>Thời gian</th>
                  <th>Duyệt</th>
                  <th>Trạng thái</th>
                  <th style={{textAlign: 'right'}}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                    <tr><td colSpan={7} style={{textAlign: 'center', padding: '20px'}}>Đang tải...</td></tr>
                ) : filteredItems.length === 0 ? (
                    <tr><td colSpan={7} style={{textAlign: 'center', padding: '20px'}}>Chưa có dữ liệu.</td></tr>
                ) : (
                    filteredItems.map(item => (
                        <tr key={item.maPhieu}>
                            <td>#{item.maPhieu}</td>
                            <td>
                                <div>{item.tenThietBi || `ID: ${item.maThietBi}`}</div>
                                <div style={{fontSize: '11px', color: '#94a3b8'}}>{item.tenKeHoach}</div>
                            </td>
                            <td>{item.tenNhanVienThucHien || `ID: ${item.nhanVienThucHien}`}</td>
                            <td>
                                <div style={{fontSize: '12px'}}>
                                    {new Date(item.thoiGianBatDau).toLocaleDateString()}
                                </div>
                                <div style={{fontSize: '11px', color: '#64748b'}}>
                                    {new Date(item.thoiGianBatDau).toLocaleTimeString()} - {new Date(item.thoiGianKetThuc).toLocaleTimeString()}
                                </div>
                            </td>
                            <td>
                                {item.trangThaiDuyet ? getApprovalBadge(item.trangThaiDuyet) : <span style={{color: '#999', fontSize: '12px'}}>-</span>}
                                {item.lyDoTuChoi && <div style={{fontSize: '10px', color: '#f87171', maxWidth: '100px'}}>{item.lyDoTuChoi}</div>}
                            </td>
                            <td>
                                <span className={`badge ${getStatusBadge(item.trangThai)}`}>
                                    {item.trangThai}
                                </span>
                            </td>
                            <td>
                                <div style={{display: 'flex', gap: '8px', justifyContent: 'flex-end'}}>
                                    {/* Action Buttons */}
                                    {user?.role === 'admin' && (
                                        <>
                                            {/* Show Approve/Reject if it's pending (or even if approved, to re-approve) */}
                                            {(!item.trangThaiDuyet || item.trangThaiDuyet.includes('Chờ')) && (
                                                <>
                                                 <button className="btn-admin-success" onClick={() => handleApprove(item.maPhieu)} style={{padding: '4px 8px', fontSize: '11px', background: 'rgba(16, 185, 129, 0.2)', color: '#34d399', border: '1px solid rgba(16, 185, 129, 0.3)'}}>
                                                    ✓ Duyệt
                                                 </button>
                                                 <button className="btn-admin-danger" onClick={() => handleReject(item.maPhieu)} style={{padding: '4px 8px', fontSize: '11px', background: 'rgba(239, 68, 68, 0.2)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.3)'}}>
                                                    ✕ Từ chối
                                                 </button>
                                                </>
                                            )}
                                        
                                            <button className="btn-admin-secondary" onClick={() => handleEdit(item)}>Sửa</button>
                                            <button className="btn-admin-danger" style={{background: 'none', color: '#dc3545', border: '1px solid #dc3545'}} onClick={() => handleDelete(item.maPhieu)}>Xóa</button>
                                        </>
                                    )}
                                </div>
                            </td>
                        </tr>
                    ))
                )}
              </tbody>
            </table>
           </div>
        </section>

        {isModalOpen && (
             <div className="modal-overlay">
                <div className="modal-content" style={{width: '700px'}}>
                    <div className="modal-header" style={{borderBottom: '1px solid #eee', paddingBottom: '16px', marginBottom: '20px'}}>
                        <h2 style={{margin: 0, fontSize: '20px'}}>{editingId ? 'Cập nhật Phiếu' : 'Tạo Phiếu Mới'}</h2>
                    </div>
                    <form onSubmit={handleSubmit} className="form-grid">
                        <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px'}}>
                            <div className="admin-input-group">
                                <label className="admin-label">Mã Thiết Bị (ID)</label>
                                <input type="number" className="admin-input" required 
                                    value={formData.maThietBi}
                                    onChange={e => setFormData({...formData, maThietBi: Number(e.target.value)})}
                                />
                            </div>
                            <div className="admin-input-group">
                                <label className="admin-label">Mã Kế Hoạch (ID)</label>
                                <input type="number" className="admin-input" required 
                                    value={formData.maKeHoach}
                                    onChange={e => setFormData({...formData, maKeHoach: Number(e.target.value)})}
                                />
                            </div>
                        </div>

                        <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px'}}>
                             <div className="admin-input-group">
                                <label className="admin-label">Bắt đầu</label>
                                <input type="datetime-local" className="admin-input" required 
                                    value={formData.thoiGianBatDau}
                                    onChange={e => setFormData({...formData, thoiGianBatDau: e.target.value})}
                                />
                            </div>
                            <div className="admin-input-group">
                                <label className="admin-label">Kết thúc</label>
                                <input type="datetime-local" className="admin-input" required 
                                    value={formData.thoiGianKetThuc}
                                    onChange={e => setFormData({...formData, thoiGianKetThuc: e.target.value})}
                                />
                            </div>
                        </div>

                        <div className="admin-input-group">
                            <label className="admin-label">Tình trạng trước BT</label>
                            <input className="admin-input" placeholder="..." 
                                value={formData.tinhTrangTruocBT}
                                onChange={e => setFormData({...formData, tinhTrangTruocBT: e.target.value})}
                            />
                        </div>
                        <div className="admin-input-group">
                            <label className="admin-label">Kết quả / Tình trạng sau BT</label>
                            <input className="admin-input" placeholder="..." 
                                value={formData.tinhTrangSauBT}
                                onChange={e => setFormData({...formData, tinhTrangSauBT: e.target.value})}
                            />
                        </div>

                        <div className="admin-input-group">
                            <label className="admin-label">Kết luận chung</label>
                            <textarea className="admin-input" style={{fontFamily: 'inherit'}}
                                value={formData.ketQua}
                                onChange={e => setFormData({...formData, ketQua: e.target.value})}
                            />
                        </div>

                        <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px'}}>
                             <div className="admin-input-group">
                                <label className="admin-label">Trạng thái</label>
                                <select className="admin-input" 
                                    value={formData.trangThai}
                                    onChange={e => setFormData({...formData, trangThai: e.target.value})}
                                >
                                    <option value="Đang thực hiện">Đang thực hiện</option>
                                    <option value="Hoàn thành">Hoàn thành</option>
                                    <option value="Hủy">Hủy</option>
                                </select>
                            </div>
                            <div className="admin-input-group">
                                <label className="admin-label">Nhân viên thực hiện (ID)</label>
                                <input type="number" className="admin-input"
                                     value={formData.nhanVienThucHien}
                                     onChange={e => setFormData({...formData, nhanVienThucHien: Number(e.target.value)})}
                                />
                            </div>
                        </div>

                        <div style={{display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px'}}>
                            <button type="button" className="btn-admin-outline" onClick={() => setIsModalOpen(false)}>Hủy</button>
                            <button type="submit" className="btn-admin-primary" disabled={submitting}>
                                {submitting ? 'Đang lưu...' : (editingId ? 'Cập nhật' : 'Lưu phiếu')}
                            </button>
                        </div>
                    </form>
                </div>
             </div>
        )}

        {/* REJECT MODAL */}
        {isRejectModalOpen && (
             <div className="modal-overlay">
                <div className="modal-content" style={{width: '400px'}}>
                    <h3 style={{marginTop: 0}}>Từ chối phiếu bảo trì</h3>
                    <p>Vui lòng nhập lý do từ chối:</p>
                    <textarea 
                        className="admin-input" 
                        rows={4}
                        placeholder="Lý do..."
                        value={actionNote}
                        onChange={e => setActionNote(e.target.value)}
                        autoFocus
                    />
                     <div style={{display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px'}}>
                        <button className="btn-admin-outline" onClick={() => setIsRejectModalOpen(false)}>Hủy</button>
                        <button className="btn-admin-danger" onClick={confirmReject}>Xác nhận Từ chối</button>
                    </div>
                </div>
             </div>
        )}
      </div>
    </MainLayout>
  )
}

export default AdminMaintenanceTicketsPage
