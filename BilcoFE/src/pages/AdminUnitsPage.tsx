import { useState, useEffect, type FormEvent } from 'react'
import MainLayout from '../layouts/MainLayout'
import { apiGet, apiPost, apiPut, apiDelete } from '../api/client'
import './admin.css'

type DonViTinh = {
  maDVT: number
  tenDVT: string
  moTa: string
}

const AdminUnitsPage = () => {
  const [items, setItems] = useState<DonViTinh[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  
  const initialForm: Partial<DonViTinh> = {
    tenDVT: '',
    moTa: ''
  }
  const [formData, setFormData] = useState<Partial<DonViTinh>>(initialForm)
  const [submitting, setSubmitting] = useState(false)

  // Fetch Data
  const fetchItems = async () => {
    try {
      setLoading(true)
      const data = await apiGet<DonViTinh[]>('/api/DonViTinh')
      setItems(data || [])
    } catch (err) {
      console.error(err)
      setError('Không thể tải danh sách đơn vị tính.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchItems()
  }, [])

  const filteredItems = items.filter(i => 
    i.tenDVT.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (i.moTa && i.moTa.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  // Form Handlers
  const handleAddNew = () => {
    setEditingId(null)
    setFormData(initialForm)
    setIsModalOpen(true)
  }

  const handleEdit = (item: DonViTinh) => {
    setEditingId(item.maDVT)
    setFormData({ ...item })
    setIsModalOpen(true)
  }

  const handleDelete = async (id: number) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa đơn vị tính này?')) {
      try {
        await apiDelete(`/api/DonViTinh/${id}`)
        setItems(prev => prev.filter(i => i.maDVT !== id))
        alert('Xóa thành công!')
      } catch (err) {
        console.error(err)
        alert('Xóa thất bại. Có thể đang được sử dụng.')
      }
    }
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const payload = { ...formData }

      if (editingId) {
        await apiPut(`/api/DonViTinh/${editingId}`, payload)
        alert('Cập nhật thành công!')
      } else {
        await apiPost('/api/DonViTinh', payload)
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
            <h1 className="admin-title">Quản lý Đơn Vị Tính</h1>
            <p className="admin-subtitle">
              Danh sách các đơn vị tính cho vật tư (cái, bộ, kg, mét...).
            </p>
          </div>
          <div style={{display: 'flex', gap: '12px', alignItems: 'center'}}>
             <input 
                type="text" 
                placeholder="Tìm kiếm đơn vị..." 
                className="admin-search-input"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                style={{width: '200px'}}
             />
             <button className="btn-admin-outline" onClick={() => window.history.back()}>Quay lại</button>
             <button className="btn-admin-primary" onClick={handleAddNew}>+ Thêm ĐVT mới</button>
          </div>
        </header>

         {/* Stats Row */}
         <div className="admin-stats-grid animate-up">
            <div className="stat-card">
                <span className="stat-val">{items.length}</span>
                <span className="stat-lbl">Tổng số ĐVT</span>
            </div>
        </div>

        <section className="admin-card animate-up" style={{animationDelay: '0.1s'}}>
          <div className="admin-card-header">
            <h3 className="admin-card-title">Danh sách đơn vị tính</h3>
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
                  <th>Tên Đơn Vị Tính</th>
                  <th>Mô tả</th>
                  <th style={{width: '120px'}}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.length === 0 ? (
                    <tr><td colSpan={4} style={{textAlign: 'center', padding: '20px'}}>
                        {searchTerm ? 'Không tìm thấy kết quả.' : 'Chưa có dữ liệu.'}
                    </td></tr>
                ) : (
                    filteredItems.map(item => (
                        <tr key={item.maDVT}>
                        <td>#{item.maDVT}</td>
                        <td style={{fontWeight: 600, color: '#1a73e8'}}>{item.tenDVT}</td>
                        <td>{item.moTa}</td>
                        <td>
                            <div style={{display: 'flex', gap: '8px'}}>
                                <button className="btn-admin-secondary" onClick={() => handleEdit(item)}>Sửa</button>
                                <button className="btn-admin-danger" style={{background: 'none', color: '#dc3545', border: '1px solid #dc3545'}} onClick={() => handleDelete(item.maDVT)}>Xóa</button>
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
                        <h2 style={{margin: 0, fontSize: '20px'}}>{editingId ? 'Cập nhật ĐVT' : 'Thêm ĐVT mới'}</h2>
                    </div>
                    
                    <form onSubmit={handleSubmit}>
                        <div className="admin-input-group">
                            <label className="admin-label">Tên Đơn Vị Tính</label>
                            <input 
                                className="admin-input"
                                placeholder="VD: Cai, Bo, Kg"
                                required
                                value={formData.tenDVT}
                                onChange={e => setFormData({...formData, tenDVT: e.target.value})}
                            />
                        </div>

                        <div className="admin-input-group">
                            <label className="admin-label">Mô tả</label>
                            <textarea 
                                className="admin-input"
                                style={{minHeight: '80px', fontFamily: 'inherit'}}
                                value={formData.moTa}
                                onChange={e => setFormData({...formData, moTa: e.target.value})}
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

export default AdminUnitsPage
