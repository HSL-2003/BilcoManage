import { useState, useEffect, type FormEvent } from 'react'
import MainLayout from '../layouts/MainLayout'
import { apiGet, apiPost, apiPut, apiDelete } from '../api/client'
import './admin.css'

type NhaCungCap = {
  maNCC: number
  tenNCC: string
  diaChi: string
  soDienThoai: string
  email: string
  nguoiLienHe: string
  ghiChu: string
}

const AdminSuppliersPage = () => {
  const [items, setItems] = useState<NhaCungCap[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  
  const initialForm: Partial<NhaCungCap> = {
    tenNCC: '',
    diaChi: '',
    soDienThoai: '',
    email: '',
    nguoiLienHe: '',
    ghiChu: ''
  }
  const [formData, setFormData] = useState<Partial<NhaCungCap>>(initialForm)
  const [submitting, setSubmitting] = useState(false)

  // Fetch Data
  const fetchItems = async () => {
    try {
      setLoading(true)
      const data = await apiGet<NhaCungCap[]>('/api/NhaCungCap')
      console.log('📦 Suppliers Data:', data)
      setItems(data || [])
    } catch (err) {
      console.error(err)
      setError('Không thể tải danh sách nhà cung cấp.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchItems()
  }, [])

  // Form Handlers
  const handleAddNew = () => {
    setEditingId(null)
    setFormData(initialForm)
    setIsModalOpen(true)
  }

  const handleEdit = (item: NhaCungCap) => {
    setEditingId(item.maNCC)
    setFormData({ ...item })
    setIsModalOpen(true)
  }

  const handleDelete = async (id: number) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa nhà cung cấp này?')) {
      try {
        await apiDelete(`/api/NhaCungCap/${id}`)
        setItems(prev => prev.filter(i => i.maNCC !== id))
        alert('Xóa thành công!')
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
      const payload = { ...formData }

      if (editingId) {
        await apiPut(`/api/NhaCungCap/${editingId}`, payload)
        alert('Cập nhật thành công!')
      } else {
        await apiPost('/api/NhaCungCap', payload)
        alert('Thêm mới thành công!')
      }
      setIsModalOpen(false)
      fetchItems()
    } catch (err) {
      console.error(err)
      alert('Đã có lỗi xảy ra.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <MainLayout>
      <div className="admin-root">
        <header className="admin-header">
          <div>
            <h1 className="admin-title">Quản lý Nhà Cung Cấp</h1>
            <p className="admin-subtitle">
              Danh sách các đối tác, nhà cung cấp vật tư và thiết bị.
            </p>
          </div>
          <div style={{display: 'flex', gap: '12px'}}>
             <button className="btn-admin-outline" onClick={() => window.history.back()}>Quay lại</button>
             <button className="btn-admin-primary" onClick={handleAddNew}>+ Thêm nhà cung cấp</button>
          </div>
        </header>

         {/* Stats Row */}
         <div className="admin-stats-grid animate-up">
            <div className="stat-card">
                <span className="stat-val">{items.length}</span>
                <span className="stat-lbl">Tổng số NCC</span>
            </div>
            <div className="stat-card">
                <span className="stat-val" style={{color: '#1a73e8'}}>
                   {items.filter(i => i.nguoiLienHe && i.nguoiLienHe.trim() !== '').length}
                </span>
                <span className="stat-lbl">Có người liên hệ</span>
            </div>
        </div>

        <section className="admin-card animate-up" style={{animationDelay: '0.1s'}}>
          <div className="admin-card-header">
            <h3 className="admin-card-title">Danh sách nhà cung cấp</h3>
            <button className="btn-admin-outline" onClick={fetchItems}>Làm mới</button>
          </div>

          <div className="table-wrapper">
             {loading ? (
                <div style={{padding: '20px', textAlign: 'center'}}>Đang tải...</div>
             ) : error ? (
                <div style={{padding: '20px', textAlign: 'center', color: 'red'}}>{error}</div>
             ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Tên Nhà Cung Cấp</th>
                  <th>Địa chỉ</th>
                  <th>Liên hệ</th>
                  <th>Người Liên Hệ</th>
                  <th>Ghi chú</th>
                  <th style={{width: '120px'}}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {items.length === 0 ? (
                    <tr><td colSpan={7} style={{textAlign: 'center', padding: '20px'}}>Chưa có dữ liệu.</td></tr>
                ) : (
                    items.map(item => (
                        <tr key={item.maNCC}>
                        <td>#{item.maNCC}</td>
                        <td style={{fontWeight: 600, color: '#1a73e8'}}>{item.tenNCC}</td>
                        <td style={{fontSize: '13px'}}>{item.diaChi}</td>
                        <td>
                            <div style={{fontSize: '13px'}}>{item.soDienThoai}</div>
                            <div style={{fontSize: '12px', color: '#666'}}>{item.email}</div>
                        </td>
                        <td>{item.nguoiLienHe}</td>
                        <td>{item.ghiChu}</td>
                        <td>
                            <div style={{display: 'flex', gap: '8px'}}>
                                <button className="btn-admin-secondary" onClick={() => handleEdit(item)}>Sửa</button>
                                <button className="btn-admin-danger" style={{background: 'none', color: '#dc3545', border: '1px solid #dc3545'}} onClick={() => handleDelete(item.maNCC)}>Xóa</button>
                            </div>
                        </td>
                        </tr>
                    ))
                )}
              </tbody>
            </table>
             )}
          </div>
        </section>

        {/* MODAL */}
        {isModalOpen && (
             <div className="modal-overlay">
                <div className="modal-content" style={{width: '600px'}}>
                    <div className="modal-header" style={{borderBottom: '1px solid #eee', paddingBottom: '16px', marginBottom: '20px'}}>
                        <h2 style={{margin: 0, fontSize: '20px'}}>{editingId ? 'Cập nhật NCC' : 'Thêm NCC mới'}</h2>
                    </div>
                    
                    <form onSubmit={handleSubmit}>
                        <div className="admin-input-group">
                            <label className="admin-label">Tên Nhà Cung Cấp</label>
                            <input 
                                className="admin-input"
                                placeholder="VD: Công ty TNHH ABC"
                                required
                                value={formData.tenNCC}
                                onChange={e => setFormData({...formData, tenNCC: e.target.value})}
                            />
                        </div>

                         <div className="admin-input-group">
                            <label className="admin-label">Địa chỉ</label>
                            <input 
                                className="admin-input"
                                placeholder="VD: 123 Đường Số 1..."
                                required
                                value={formData.diaChi}
                                onChange={e => setFormData({...formData, diaChi: e.target.value})}
                            />
                        </div>

                        <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px'}}>
                            <div className="admin-input-group">
                                <label className="admin-label">Số điện thoại</label>
                                <input 
                                    className="admin-input"
                                    placeholder="09..."
                                    value={formData.soDienThoai}
                                    onChange={e => setFormData({...formData, soDienThoai: e.target.value})}
                                />
                            </div>
                            <div className="admin-input-group">
                                <label className="admin-label">Email</label>
                                <input 
                                    className="admin-input"
                                    type="email"
                                    placeholder="contact@abc.com"
                                    value={formData.email}
                                    onChange={e => setFormData({...formData, email: e.target.value})}
                                />
                            </div>
                        </div>

                        <div className="admin-input-group">
                            <label className="admin-label">Người liên hệ</label>
                            <input 
                                className="admin-input"
                                placeholder="VD: Anh Nam - Kinh doanh"
                                value={formData.nguoiLienHe}
                                onChange={e => setFormData({...formData, nguoiLienHe: e.target.value})}
                            />
                        </div>

                        <div className="admin-input-group">
                            <label className="admin-label">Ghi chú</label>
                            <textarea 
                                className="admin-input"
                                style={{minHeight: '80px', fontFamily: 'inherit'}}
                                value={formData.ghiChu}
                                onChange={e => setFormData({...formData, ghiChu: e.target.value})}
                            />
                        </div>

                        <div style={{display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px'}}>
                            <button type="button" className="btn-admin-outline" onClick={() => setIsModalOpen(false)}>Hủy</button>
                            <button type="submit" className="btn-admin-primary" disabled={submitting}>
                                {submitting ? 'Đang lưu...' : 'Lưu dữ liệu'}
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

export default AdminSuppliersPage
