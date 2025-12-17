import { useState, useEffect, type FormEvent } from 'react'
import MainLayout from '../layouts/MainLayout'
import { apiGet, apiPost, apiPut, apiDelete } from '../api/client'
import { useAuth } from '../context/AuthContext'
import './admin.css'

type Incident = {
  maSuCo: number
  maThietBi: number
  tieuDe: string
  moTa: string
  mucDo: 'Nghiêm trọng' | 'Trung bình' | 'Nhẹ'
  thoiGianPhatHien: string
  nguoiDungID: number
  trangThai: 'Đã xử lý' | 'Chưa xử lý' | 'Đang xử lý'
  giaiPhap: string
  ngayXuLy: string | null
}

const AdminIncidentsPage = () => {
  const { user } = useAuth()
  const [incidents, setIncidents] = useState<Incident[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [submitting, setSubmitting] = useState(false)
  
  const [formData, setFormData] = useState<Partial<Incident>>({
    maThietBi: 0,
    tieuDe: '',
    moTa: '',
    mucDo: 'Nhẹ',
    thoiGianPhatHien: '',
    trangThai: 'Chưa xử lý',
    giaiPhap: '',
    ngayXuLy: null
  })

  // Fetch Incidents
  const fetchIncidents = async () => {
    try {
      setLoading(true)
      const data = await apiGet<Incident[]>('/api/LichSuSuCo')
      setIncidents(data || [])
    } catch (err) {
      console.error(err)
      setError('Không thể tải danh sách sự cố.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchIncidents()
  }, [])

  // Handlers
  const handleEdit = (incident: Incident) => {
    setEditingId(incident.maSuCo)
    setFormData({
      ...incident,
      // Ensure date format for input is compatible if needed, 
      // but API usually returns ISO string which works with text inputs or needs formatting for date inputs
      thoiGianPhatHien: incident.thoiGianPhatHien ? new Date(incident.thoiGianPhatHien).toISOString().slice(0, 16) : '',
      ngayXuLy: incident.ngayXuLy ? new Date(incident.ngayXuLy).toISOString().slice(0, 16) : null
    })
    setIsModalOpen(true)
  }

  const handleDelete = async (id: number) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa báo cáo này?')) {
      try {
        await apiDelete(`/api/LichSuSuCo/${id}`)
        setIncidents(prev => prev.filter(i => i.maSuCo !== id))
        alert('Xóa thành công!')
      } catch (err) {
        console.error(err)
        alert('Xóa thất bại.')
      }
    }
  }

  const handleAddNew = () => {
    setEditingId(null)
    setFormData({
        maThietBi: 0,
        tieuDe: '',
        moTa: '',
        mucDo: 'Nhẹ',
        thoiGianPhatHien: new Date().toISOString().slice(0, 16),
        trangThai: 'Chưa xử lý',
        giaiPhap: '',
        ngayXuLy: null
    })
    setIsModalOpen(true)
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    
    // Validation
    if (!formData.maThietBi || Number(formData.maThietBi) <= 0) {
        alert('Vui lòng nhập Mã Thiết Bị hợp lệ (phải tồn tại trong hệ thống)!')
        setSubmitting(false)
        return
    }

    if (formData.trangThai === 'Đã xử lý' && !formData.ngayXuLy) {
        alert('Vui lòng nhập Thời gian hoàn thành khi trạng thái là Đã xử lý!')
        setSubmitting(false)
        return
    }

    // Determine Reporter ID
    const reporterId = user?.maNV ? Number(user.maNV) : (user?.id ? Number(user.id) : 0);
    
    if (reporterId <= 0) {
        alert('Không tìm thấy thông tin nhân viên (MaNV/ID). Vui lòng đăng xuất và đăng nhập lại!')
        setSubmitting(false)
        return
    }

    try {
      const payload = {
        maThietBi: Number(formData.maThietBi),
        tieuDe: formData.tieuDe,
        moTa: formData.moTa || '',
        mucDo: formData.mucDo,
        thoiGianPhatHien: formData.thoiGianPhatHien ? new Date(formData.thoiGianPhatHien).toISOString() : new Date().toISOString(),
        nguoiDungID: reporterId,
        trangThai: formData.trangThai,
        giaiPhap: formData.giaiPhap || 'Chưa có',
        ngayXuLy: formData.ngayXuLy ? new Date(formData.ngayXuLy).toISOString() : null,
      };
      
      console.log('📦 Sending Refined Payload:', JSON.stringify(payload, null, 2))

      if (editingId) {
          // PUT
          const updatePayload = { ...payload, maSuCo: editingId }
          await apiPut(`/api/LichSuSuCo/${editingId}`, updatePayload)
          alert('Cập nhật thành công!')
      } else {
          // POST
          await apiPost('/api/LichSuSuCo', payload)
          alert('Báo cáo mới đã được tạo!')
      }

      setIsModalOpen(false)
      fetchIncidents()
    } catch (err) {
      console.error(err)
      alert(`Thao tác thất bại. Lỗi Server (500) thường do Mã Thiết Bị không tồn tại hoặc dữ liệu sai. Check Console!`)
    } finally {
      setSubmitting(false)
    }
  }

  // Helper for Badge Colors
  const getStatusBadge = (status: string) => {
      switch(status) {
          case 'Đã xử lý': return 'badge-success'
          case 'Đang xử lý': return 'badge-warning'
          default: return 'badge-danger'
      }
  }

  const getLevelColor = (level: string) => {
      if (level === 'Nghiêm trọng') return '#d93025'
      if (level === 'Trung bình') return '#f9ab00'
      return '#188038'
  }

  return (
    <MainLayout>
      <div className="admin-root">
        <header className="admin-header">
          <div>
            <h1 className="admin-title">Quản lý sự cố & Báo cáo</h1>
            <p className="admin-subtitle">Theo dõi, cập nhật và xử lý các sự cố kỹ thuật trong hệ thống.</p>
          </div>
          <div>
            <button className="btn-admin-outline" onClick={() => window.history.back()} style={{marginRight: '12px'}}>
                Quay lại
            </button>
            <button className="btn-admin-primary" onClick={handleAddNew}>
                + Báo cáo sự cố mới
            </button>
          </div>
        </header>

        {/* STATS */}
        <div className="admin-stats-grid animate-up">
            <div className="stat-card">
                <span className="stat-val">{incidents.length}</span>
                <span className="stat-lbl">Tổng sự cố</span>
            </div>
            <div className="stat-card">
                <span className="stat-val" style={{color: '#d93025'}}>
                    {incidents.filter(i => i.mucDo === 'Nghiêm trọng').length}
                </span>
                <span className="stat-lbl">Nghiêm trọng</span>
            </div>
            <div className="stat-card">
                <span className="stat-val" style={{color: '#188038'}}>
                    {incidents.filter(i => i.trangThai === 'Đã xử lý').length}
                </span>
                <span className="stat-lbl">Đã khắc phục</span>
            </div>
            <div className="stat-card">
                <span className="stat-val" style={{color: '#f9ab00'}}>
                    {incidents.filter(i => i.trangThai === 'Đang xử lý').length}
                </span>
                <span className="stat-lbl">Đang xử lý</span>
            </div>
        </div>

        {/* TABLE */}
        <div className="admin-card animate-up" style={{animationDelay: '0.1s'}}>
            <div className="admin-card-header">
                <h3 className="admin-card-title">Danh sách sự cố gần đây</h3>
                {loading && <span style={{fontSize: '14px', color: '#666', marginLeft: '10px'}}>(Đang tải...)</span>}
            </div>
            
            {error ? (
               <div style={{padding: '20px', textAlign: 'center', color: 'red'}}>{error}</div>
            ) : (
            <div className="table-wrapper">
                <table className="table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Tiêu đề & Thiết bị</th>
                            <th>Mức độ</th>
                            <th>Người báo cáo</th>
                            <th>Thời gian</th>
                            <th>Trạng thái</th>
                            <th style={{width: '120px'}}>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {incidents.length === 0 && !loading ? (
                            <tr><td colSpan={7} style={{textAlign: 'center', padding: '20px'}}>Chưa có dữ liệu sự cố.</td></tr>
                        ) : incidents.map(inc => (
                            <tr key={inc.maSuCo}>
                                <td>#{inc.maSuCo}</td>
                                <td>
                                    <div style={{fontWeight: 600}}>{inc.tieuDe}</div>
                                    <div style={{fontSize: '12px', color: '#666'}}>Thiết bị ID: {inc.maThietBi}</div>
                                </td>
                                <td>
                                    <span style={{
                                        color: getLevelColor(inc.mucDo), 
                                        fontWeight: 600, 
                                        backgroundColor: getLevelColor(inc.mucDo) + '15',
                                        padding: '4px 8px',
                                        borderRadius: '4px',
                                        fontSize: '12px'
                                    }}>
                                        {inc.mucDo}
                                    </span>
                                </td>
                                <td>ID: {inc.nguoiDungID}</td>
                                <td>
                                    <div>{new Date(inc.thoiGianPhatHien).toLocaleDateString('vi-VN')}</div>
                                    <div style={{fontSize: '11px', color: '#888'}}>{new Date(inc.thoiGianPhatHien).toLocaleTimeString('vi-VN')}</div>
                                </td>
                                <td>
                                    <span className={`badge ${getStatusBadge(inc.trangThai)}`}>
                                        {inc.trangThai}
                                    </span>
                                </td>
                                <td>
                                    <div style={{display: 'flex', gap: '8px'}}>
                                        <button className="btn-admin-secondary" onClick={() => handleEdit(inc)}>
                                            Sửa
                                        </button>
                                        <button className="btn-admin-danger" style={{background: 'none', color: '#dc3545', border: '1px solid #dc3545'}} onClick={() => handleDelete(inc.maSuCo)}>
                                            Xóa
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            )}
        </div>

        {/* MODAL FORM */}
        {isModalOpen && (
            <div className="modal-overlay">
                <div className="modal-content" style={{width: '600px'}}>
                    <div className="modal-header" style={{borderBottom: '1px solid #eee', paddingBottom: '16px', marginBottom: '20px'}}>
                        <h2 style={{margin: 0, fontSize: '20px'}}>
                            {editingId ? 'Cập nhật sự cố' : 'Báo cáo sự cố mới'}
                        </h2>
                    </div>
                    
                    <form onSubmit={handleSubmit}>
                        <div className="admin-input-group">
                            <label className="admin-label">Tiêu đề sự cố</label>
                            <input 
                                className="admin-input" 
                                required
                                value={formData.tieuDe}
                                onChange={e => setFormData({...formData, tieuDe: e.target.value})}
                                placeholder="VD: Hỏng motor băng chuyền..."
                            />
                        </div>

                        <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px'}}>
                             <div className="admin-input-group">
                                <label className="admin-label">Mã thiết bị</label>
                                <input 
                                    className="admin-input" 
                                    required
                                    type="number"
                                    value={formData.maThietBi}
                                    onChange={e => setFormData({...formData, maThietBi: Number(e.target.value)})}
                                />
                            </div>
                            <div className="admin-input-group">
                                <label className="admin-label">Thời gian phát hiện</label>
                                <input 
                                    className="admin-input" 
                                    type="datetime-local"
                                    required
                                    value={formData.thoiGianPhatHien}
                                    onChange={e => setFormData({...formData, thoiGianPhatHien: e.target.value})}
                                />
                            </div>
                        </div>

                        <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px'}}>
                            <div className="admin-input-group">
                                <label className="admin-label">Mức độ</label>
                                <select 
                                    className="admin-input"
                                    value={formData.mucDo}
                                    onChange={e => setFormData({...formData, mucDo: e.target.value as any})}
                                >
                                    <option value="Nhẹ">Nhẹ</option>
                                    <option value="Trung bình">Trung bình</option>
                                    <option value="Nghiêm trọng">Nghiêm trọng</option>
                                </select>
                            </div>
                            <div className="admin-input-group">
                                <label className="admin-label">Trạng thái</label>
                                <select 
                                    className="admin-input"
                                    value={formData.trangThai}
                                    onChange={e => setFormData({...formData, trangThai: e.target.value as any})}
                                >
                                    <option value="Chưa xử lý">Chưa xử lý</option>
                                    <option value="Đang xử lý">Đang xử lý</option>
                                    <option value="Đã xử lý">Đã xử lý</option>
                                </select>
                            </div>
                        </div>

                        <div className="admin-input-group">
                            <label className="admin-label">Mô tả chi tiết</label>
                            <textarea 
                                className="admin-input"
                                rows={3}
                                required
                                value={formData.moTa}
                                onChange={e => setFormData({...formData, moTa: e.target.value})}
                                style={{resize: 'vertical'}}
                            />
                        </div>

                        <div className="admin-input-group">
                            <label className="admin-label">Giải pháp / Ghi chú xử lý</label>
                            <textarea 
                                className="admin-input"
                                rows={2}
                                value={formData.giaiPhap || ''}
                                onChange={e => setFormData({...formData, giaiPhap: e.target.value})}
                            />
                        </div>

                        {(formData.trangThai === 'Đã xử lý' || editingId) && (
                            <div className="admin-input-group">
                                <label className="admin-label">Thời gian hoàn thành (Nếu có)</label>
                                <input 
                                    className="admin-input"
                                    type="datetime-local"
                                    value={formData.ngayXuLy || ''}
                                    onChange={e => setFormData({...formData, ngayXuLy: e.target.value})}
                                />
                            </div>
                        )}

                        <div style={{display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px'}}>
                            <button type="button" className="btn-admin-outline" onClick={() => setIsModalOpen(false)}>
                                Hủy bỏ
                            </button>
                            <button type="submit" className="btn-admin-primary" disabled={submitting}>
                                {submitting ? 'Đang xử lý...' : (editingId ? 'Lưu thay đổi' : 'Tạo báo cáo')}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        )}
      </div>
    </MainLayout>
  )
}

export default AdminIncidentsPage
