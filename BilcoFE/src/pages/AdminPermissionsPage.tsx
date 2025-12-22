import { useState, useEffect, type FormEvent } from 'react'
import MainLayout from '../layouts/MainLayout'
import { apiGet, apiPost, apiPut, apiDelete } from '../api/client'
import './admin.css'

interface PhanQuyen {
  maQuyen: number
  tenQuyen: string
  moTa: string
  soLuongNguoiDung: number
}

const AdminPermissionsPage = () => {
  const [items, setItems] = useState<PhanQuyen[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  
  const [formData, setFormData] = useState({
    tenQuyen: '',
    moTa: ''
  })
  const [submitting, setSubmitting] = useState(false)

  // Fetch Data
  const fetchItems = async () => {
    try {
      setLoading(true)
      const data = await apiGet<PhanQuyen[]>('/api/PhanQuyen')
      setItems(data || [])
    } catch (err) {
      console.error(err)
      alert('Không thể tải danh sách quyền.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchItems()
  }, [])

  const filteredItems = items.filter(i => 
    i.tenQuyen.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (i.moTa && i.moTa.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  // Form Handlers
  const handleAddNew = () => {
    setEditingId(null)
    setFormData({ tenQuyen: '', moTa: '' })
    setIsModalOpen(true)
  }

  const handleEdit = (item: PhanQuyen) => {
    setEditingId(item.maQuyen)
    setFormData({ 
        tenQuyen: item.tenQuyen,
        moTa: item.moTa
    })
    setIsModalOpen(true)
  }

  const handleDelete = async (id: number) => {
    if (window.confirm('Con vợ có chắc chắn muốn xóa quyền này? Hành động này không thể hoàn tác.')) {
      try {
        await apiDelete(`/api/PhanQuyen/${id}`)
        setItems(prev => prev.filter(i => i.maQuyen !== id))
        alert('Xóa thành công!')
      } catch (err) {
        console.error(err)
        alert('Xóa thất bại. Có thể quyền đang được sử dụng.')
      }
    }
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      if (editingId) {
        await apiPut(`/api/PhanQuyen/${editingId}`, formData)
        alert('Cập nhật thành công!')
      } else {
        await apiPost('/api/PhanQuyen', formData)
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
            <h1 className="admin-title">Phân Quyền Hệ Thống</h1>
            <p className="admin-subtitle">
              Quản lý các vai trò và quyền hạn truy cập của người dùng.
            </p>
          </div>
          <div style={{display: 'flex', gap: '16px', alignItems: 'center'}}>
             <input 
                type="text" 
                placeholder="Tìm quyền..." 
                className="admin-search-input"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                style={{width: '250px'}}
             />
             <button className="btn-admin-primary" onClick={handleAddNew}>+ Thêm Quyền</button>
          </div>
        </header>

         {/* Stats Row */}
         <div className="admin-stats-grid animate-up">
            <div className="stat-card">
                <span className="stat-val">{items.length}</span>
                <span className="stat-lbl">Tổng số Role</span>
            </div>
             <div className="stat-card">
                <span className="stat-val" style={{color: '#3b82f6'}}>
                    {items.reduce((acc, curr) => acc + (curr.soLuongNguoiDung || 0), 0)}
                </span>
                <span className="stat-lbl">Người dùng được gán</span>
            </div>
        </div>

        <section className="admin-card animate-up" style={{animationDelay: '0.1s'}}>
          <div className="admin-card-header">
            <h3 className="admin-card-title">Danh sách quyền hạn</h3>
            <button className="btn-admin-outline" onClick={fetchItems} style={{fontSize: '12px'}}>Làm mới</button>
          </div>

          <div className="table-wrapper">
             {loading ? (
                <div style={{padding: '20px', textAlign: 'center'}}>Đang tải...</div>
             ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Mã Quyền</th>
                  <th>Tên Quyền</th>
                  <th>Mô tả</th>
                  <th>Số người dùng</th>
                  <th style={{textAlign: 'right'}}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.length === 0 ? (
                    <tr><td colSpan={5} style={{textAlign: 'center', padding: '20px'}}>
                        {searchTerm ? 'Không tìm thấy kết quả.' : 'Chưa có quyền nào.'}
                    </td></tr>
                ) : (
                    filteredItems.map(item => (
                        <tr key={item.maQuyen}>
                        <td>#{item.maQuyen}</td>
                        <td style={{fontWeight: 600, color: '#e2e8f0'}}>{item.tenQuyen}</td>
                        <td>{item.moTa}</td>
                        <td>
                            <span className="badge badge-info">{item.soLuongNguoiDung || 0} users</span>
                        </td>
                        <td>
                            <div style={{display: 'flex', gap: '8px', justifyContent: 'flex-end'}}>
                                <button className="btn-admin-secondary" onClick={() => handleEdit(item)}>Sửa</button>
                                <button className="btn-admin-danger" style={{background: 'none', color: '#dc3545', border: '1px solid #dc3545'}} onClick={() => handleDelete(item.maQuyen)}>Xóa</button>
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
                        <h2 style={{margin: 0, fontSize: '20px'}}>{editingId ? 'Cập nhật Quyền' : 'Thêm Quyền mới'}</h2>
                    </div>
                    
                    <form onSubmit={handleSubmit}>
                        <div className="admin-input-group">
                            <label className="admin-label">Tên Quyền</label>
                            <input 
                                className="admin-input"
                                placeholder="VD: Admin, Manager, User..."
                                required
                                value={formData.tenQuyen}
                                onChange={e => setFormData({...formData, tenQuyen: e.target.value})}
                            />
                        </div>

                        <div className="admin-input-group">
                            <label className="admin-label">Mô tả</label>
                            <textarea 
                                className="admin-input"
                                placeholder="Mô tả quyền hạn..."
                                style={{minHeight: '80px', fontFamily: 'inherit'}}
                                value={formData.moTa}
                                onChange={e => setFormData({...formData, moTa: e.target.value})}
                            />
                        </div>

                        <div style={{display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px'}}>
                            <button type="button" className="btn-admin-outline" onClick={() => setIsModalOpen(false)}>Hủy</button>
                            <button type="submit" className="btn-admin-primary" disabled={submitting}>
                                {submitting ? 'Đang lưu...' : (editingId ? 'Cập nhật' : 'Thêm mới')}
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

export default AdminPermissionsPage
