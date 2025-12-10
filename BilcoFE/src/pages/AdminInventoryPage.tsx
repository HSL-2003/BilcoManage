import { useState, useEffect, type FormEvent } from 'react'
import MainLayout from '../layouts/MainLayout'
import { apiGet, apiPost, apiPut, apiDelete } from '../api/client'
import './admin.css'

type TonKho = {
  maTonKho: number
  maKho: number
  maVT: number
  soLuongTon: number
  soLuongKhaDung: number
  soLuongToiThieu: number
  viTriLuuTru: string
  ngayCapNhat: string
}

const AdminInventoryPage = () => {
  const [items, setItems] = useState<TonKho[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [formData, setFormData] = useState<Partial<TonKho>>({
    maKho: 0,
    maVT: 0,
    soLuongTon: 0,
    soLuongKhaDung: 0,
    soLuongToiThieu: 0,
    viTriLuuTru: '',
    ngayCapNhat: new Date().toISOString()
  })
  const [submitting, setSubmitting] = useState(false)

  // Fetch Data
  const fetchItems = async () => {
    try {
      setLoading(true)
      const data = await apiGet<TonKho[]>('/api/TonKho')
      setItems(data || [])
    } catch (err) {
      console.error(err)
      setError('Không thể tải dữ liệu tồn kho.')
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
      maKho: 0,
      maVT: 0,
      soLuongTon: 0,
      soLuongKhaDung: 0,
      soLuongToiThieu: 0,
      viTriLuuTru: '',
      ngayCapNhat: new Date().toISOString()
    })
    setIsModalOpen(true)
  }

  const handleEdit = (item: TonKho) => {
    setEditingId(item.maTonKho)
    setFormData({
      ...item,
      ngayCapNhat: new Date().toISOString() // Update timestamp on edit
    })
    setIsModalOpen(true)
  }

  const handleDelete = async (id: number) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa mục tồn kho này?')) {
      try {
        await apiDelete(`/api/TonKho/${id}`)
        setItems(prev => prev.filter(i => i.maTonKho !== id))
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
        ngayCapNhat: new Date().toISOString()
      }

      if (editingId) {
        await apiPut(`/api/TonKho/${editingId}`, payload)
        alert('Cập nhật thành công!')
      } else {
        await apiPost('/api/TonKho', payload)
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
            <h1 className="admin-title">Quản lý tồn kho</h1>
            <p className="admin-subtitle">
              Theo dõi biến động vật tư, vị trí lưu trữ và cảnh báo tốn kho tối thiểu.
            </p>
          </div>
          <div style={{display: 'flex', gap: '12px'}}>
             <button className="btn-admin-outline" onClick={() => window.history.back()}>Quay lại</button>
             <button className="btn-admin-primary" onClick={handleAddNew}>+ Thêm hàng tồn kho</button>
          </div>
        </header>

         {/* Stats Row */}
         <div className="admin-stats-grid animate-up">
            <div className="stat-card">
                <span className="stat-val">{items.length}</span>
                <span className="stat-lbl">Tổng mã vật tư</span>
            </div>
            <div className="stat-card">
                <span className="stat-val" style={{color: '#d93025'}}>
                    {items.filter(i => i.soLuongTon < i.soLuongToiThieu).length}
                </span>
                <span className="stat-lbl">Cảnh báo (Thấp hơn mức tối thiểu)</span>
            </div>
             <div className="stat-card">
                <span className="stat-val" style={{color: '#1a73e8'}}>
                    {items.reduce((acc, curr) => acc + curr.soLuongTon, 0)}
                </span>
                <span className="stat-lbl">Tổng số lượng tồn</span>
            </div>
        </div>

        <section className="admin-card animate-up" style={{animationDelay: '0.1s'}}>
          <div className="admin-card-header">
            <h3 className="admin-card-title">Chi tiết tồn kho</h3>
            <div style={{display: 'flex', gap: '10px'}}>
               <button className="btn-admin-outline" onClick={fetchItems}>Làm mới</button>
            </div>
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
                  <th>Mã VT</th>
                  <th>Mã Kho</th>
                  <th>SL Tồn</th>
                  <th>SL Khả Dụng</th>
                  <th>SL Tối Thiểu</th>
                  <th>Vị Trí</th>
                  <th>Cập Nhật</th>
                  <th style={{width: '120px'}}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {items.length === 0 ? (
                    <tr><td colSpan={9} style={{textAlign: 'center', padding: '20px'}}>Chưa có dữ liệu.</td></tr>
                ) : (
                    items.map(item => (
                        <tr key={item.maTonKho}>
                        <td>#{item.maTonKho}</td>
                        <td>
                            <div style={{fontWeight: 600}}>VT-{item.maVT}</div>
                        </td>
                        <td>K-{item.maKho}</td>
                        <td>
                            <div style={{fontWeight: 'bold', fontSize: '15px', color: item.soLuongTon < item.soLuongToiThieu ? '#d93025' : '#1a73e8', display: 'flex', alignItems: 'center', gap: '6px'}}>
                                {item.soLuongTon}
                                {item.soLuongTon < item.soLuongToiThieu && (
                                   <span style={{fontSize: '11px', background: '#fee2e2', color: '#b91c1c', padding: '2px 6px', borderRadius: '4px', whiteSpace: 'nowrap'}}>
                                     Sắp hết
                                   </span>
                                )}
                            </div>
                        </td>
                        <td>{item.soLuongKhaDung}</td>
                        <td>{item.soLuongToiThieu}</td>
                        <td>{item.viTriLuuTru}</td>
                        <td style={{fontSize: '13px', color: '#666'}}>{new Date(item.ngayCapNhat).toLocaleDateString('vi-VN')}</td>
                        <td>
                            <div style={{display: 'flex', gap: '8px'}}>
                                <button className="btn-admin-secondary" onClick={() => handleEdit(item)}>Sửa</button>
                                <button className="btn-admin-danger" style={{background: 'none', color: '#dc3545', border: '1px solid #dc3545'}} onClick={() => handleDelete(item.maTonKho)}>Xóa</button>
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
                        <h2 style={{margin: 0, fontSize: '20px'}}>{editingId ? 'Cập nhật tồn kho' : 'Thêm tồn kho mới'}</h2>
                    </div>
                    
                    <form onSubmit={handleSubmit}>
                        <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px'}}>
                            <div className="admin-input-group">
                                <label className="admin-label">Mã Vật Tư (MaVT)</label>
                                <input 
                                    className="admin-input"
                                    type="number"
                                    required
                                    value={formData.maVT}
                                    onChange={e => setFormData({...formData, maVT: Number(e.target.value)})}
                                />
                            </div>
                            <div className="admin-input-group">
                                <label className="admin-label">Mã Kho (MaKho)</label>
                                <input 
                                    className="admin-input"
                                    type="number"
                                    required
                                    value={formData.maKho}
                                    onChange={e => setFormData({...formData, maKho: Number(e.target.value)})}
                                />
                            </div>
                        </div>

                        <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px'}}>
                             <div className="admin-input-group">
                                <label className="admin-label">SL Tồn</label>
                                <input 
                                    className="admin-input"
                                    type="number"
                                    required
                                    value={formData.soLuongTon}
                                    onChange={e => setFormData({...formData, soLuongTon: Number(e.target.value)})}
                                />
                            </div>
                            <div className="admin-input-group">
                                <label className="admin-label">SL Khả Dụng</label>
                                <input 
                                    className="admin-input"
                                    type="number"
                                    required
                                    value={formData.soLuongKhaDung}
                                    onChange={e => setFormData({...formData, soLuongKhaDung: Number(e.target.value)})}
                                />
                            </div>
                            <div className="admin-input-group">
                                <label className="admin-label">SL Tối Thiểu</label>
                                <input 
                                    className="admin-input"
                                    type="number"
                                    required
                                    value={formData.soLuongToiThieu}
                                    onChange={e => setFormData({...formData, soLuongToiThieu: Number(e.target.value)})}
                                />
                            </div>
                        </div>

                        <div className="admin-input-group">
                            <label className="admin-label">Vị trí lưu trữ</label>
                            <input 
                                className="admin-input"
                                placeholder="VD: Kệ A1, Tầng 2"
                                required
                                value={formData.viTriLuuTru}
                                onChange={e => setFormData({...formData, viTriLuuTru: e.target.value})}
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

export default AdminInventoryPage
