import { useState, useEffect, type FormEvent } from 'react'
import MainLayout from '../layouts/MainLayout'
import { apiGet, apiPost, apiPut, apiDelete } from '../api/client'
import './admin.css'

type Kho = {
  maKho: number
  tenKho: string
  diaChi: string
  nguoiQuanLyID: number
  ghiChu: string
}

const AdminWarehousesPage = () => {
  const [items, setItems] = useState<Kho[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [formData, setFormData] = useState<Partial<Kho>>({
    tenKho: '',
    diaChi: '',
    nguoiQuanLyID: 0,
    ghiChu: ''
  })
  const [submitting, setSubmitting] = useState(false)

  // Fetch Data
  const fetchItems = async () => {
    try {
      setLoading(true)
      const data = await apiGet<Kho[]>('/api/Kho')
      console.log('📦 Warehouse Data:', data) // Debug log
      setItems(data || [])
    } catch (err) {
      console.error(err)
      setError('Không thể tải danh sách kho.')
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
    setFormData({
      tenKho: '',
      diaChi: '',
      nguoiQuanLyID: 0,
      ghiChu: ''
    })
    setIsModalOpen(true)
  }

  const handleEdit = (item: Kho) => {
    setEditingId(item.maKho)
    setFormData({ ...item })
    setIsModalOpen(true)
  }

  const handleDelete = async (id: number) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa kho này?')) {
      try {
        await apiDelete(`/api/Kho/${id}`)
        setItems(prev => prev.filter(i => i.maKho !== id))
        alert('Xóa thành công!')
      } catch (err) {
        console.error(err)
        alert('Xóa thất bại. Có thể kho đang chứa hàng hóa.')
      }
    }
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const payload = {
          ...formData,
          // Ensure numbers are numbers
          nguoiQuanLyID: Number(formData.nguoiQuanLyID)
      }

      if (editingId) {
        await apiPut(`/api/Kho/${editingId}`, payload)
        alert('Cập nhật thành công!')
      } else {
        await apiPost('/api/Kho', payload)
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
            <h1 className="admin-title">Quản lý Kho bãi</h1>
            <p className="admin-subtitle">
              Danh sách các kho hàng, vị trí và người quản lý.
            </p>
          </div>
          <div style={{display: 'flex', gap: '12px'}}>
             <button className="btn-admin-outline" onClick={() => window.history.back()}>Quay lại</button>
             <button className="btn-admin-primary" onClick={handleAddNew}>+ Thêm kho mới</button>
          </div>
        </header>

         {/* Stats Row */}
         <div className="admin-stats-grid animate-up">
            <div className="stat-card">
                <span className="stat-val">{items.length}</span>
                <span className="stat-lbl">Tổng số kho</span>
            </div>
        </div>

        <section className="admin-card animate-up" style={{animationDelay: '0.1s'}}>
          <div className="admin-card-header">
            <h3 className="admin-card-title">Danh sách kho</h3>
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
                  <th>Tên Kho</th>
                  <th>Địa chỉ</th>
                  <th>Người Quản Lý (ID)</th>
                  <th>Ghi chú</th>
                  <th style={{width: '120px'}}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {items.length === 0 ? (
                    <tr><td colSpan={6} style={{textAlign: 'center', padding: '20px'}}>Chưa có dữ liệu.</td></tr>
                ) : (
                    items.map(item => (
                        <tr key={item.maKho}>
                        <td>#{item.maKho}</td>
                        <td style={{fontWeight: 600, color: '#1a73e8'}}>{item.tenKho}</td>
                        <td>{item.diaChi}</td>
                        <td>
                            <span className="badge">
                                {/* Fallback for case sensitivity issues */}
                                {item.nguoiQuanLyID ?? (item as any).nguoiQuanLyId ?? (item as any).nguoiQuanLy ?? (item as any).maNV ?? '?'}
                            </span>
                        </td>
                        <td>{item.ghiChu}</td>
                        <td>
                            <div style={{display: 'flex', gap: '8px'}}>
                                <button className="btn-admin-secondary" onClick={() => handleEdit(item)}>Sửa</button>
                                <button className="btn-admin-danger" style={{background: 'none', color: '#dc3545', border: '1px solid #dc3545'}} onClick={() => handleDelete(item.maKho)}>Xóa</button>
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
                <div className="modal-content" style={{width: '500px'}}>
                    <div className="modal-header" style={{borderBottom: '1px solid #eee', paddingBottom: '16px', marginBottom: '20px'}}>
                        <h2 style={{margin: 0, fontSize: '20px'}}>{editingId ? 'Cập nhật kho' : 'Thêm kho mới'}</h2>
                    </div>
                    
                    <form onSubmit={handleSubmit}>
                        <div className="admin-input-group">
                            <label className="admin-label">Tên Kho</label>
                            <input 
                                className="admin-input"
                                placeholder="VD: Kho Nguyên Vật Liệu C"
                                required
                                value={formData.tenKho}
                                onChange={e => setFormData({...formData, tenKho: e.target.value})}
                            />
                        </div>

                        <div className="admin-input-group">
                            <label className="admin-label">Địa chỉ</label>
                            <input 
                                className="admin-input"
                                placeholder="VD: Khu C, Cổng số 2"
                                required
                                value={formData.diaChi}
                                onChange={e => setFormData({...formData, diaChi: e.target.value})}
                            />
                        </div>

                        <div className="admin-input-group">
                            <label className="admin-label">ID Người Quản Lý</label>
                            <input 
                                className="admin-input"
                                type="number"
                                placeholder="Nhập ID nhân viên quản lý"
                                required
                                value={formData.nguoiQuanLyID}
                                onChange={e => setFormData({...formData, nguoiQuanLyID: Number(e.target.value)})}
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

export default AdminWarehousesPage
