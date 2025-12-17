import { useState, useEffect, type FormEvent } from 'react'
import MainLayout from '../layouts/MainLayout'
import { apiGet, apiPost, apiPut, apiDelete } from '../api/client'
import './admin.css'

// GET Response Type
type VatTu = {
  maVT: number
  maLoaiVT: number
  maDVT: number
  tenVT: string
  maVach: string
  maNCC: number
  thoiGianBaoHanh: number
  ghiChu: string
  hinhAnh: string
  // Read-only / Expanded fields
  ngayTao: string
  nguoiTao: number
  tenLoaiVT: string
  tenDVT: string
  tenNCC: string
  tenNguoiTao: string
}

// POST/PUT Payload Type
type VatTuPayload = {
  maVT?: number // Optional for POST
  maLoaiVT: number
  maDVT: number
  tenVT: string
  maVach: string
  maNCC: number
  thoiGianBaoHanh: number
  ghiChu: string
  hinhAnh: string
}

const AdminMaterialsPage = () => {
  const [items, setItems] = useState<VatTu[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  
  const initialForm: VatTuPayload = {
      maLoaiVT: 0,
      maDVT: 0,
      tenVT: '',
      maVach: '',
      maNCC: 0,
      thoiGianBaoHanh: 0,
      ghiChu: '',
      hinhAnh: ''
  }
  const [formData, setFormData] = useState<VatTuPayload>(initialForm)
  const [submitting, setSubmitting] = useState(false)

  // Fetch Data
  const fetchItems = async () => {
    try {
      setLoading(true)
      const data = await apiGet<VatTu[]>('/api/VatTu')
      setItems(data || [])
    } catch (err) {
      console.error(err)
      setError('Không thể tải danh sách vật tư.')
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

  const handleEdit = (item: VatTu) => {
    setEditingId(item.maVT)
    // Map existing item to payload structure
    setFormData({
        maVT: item.maVT,
        maLoaiVT: item.maLoaiVT,
        maDVT: item.maDVT,
        tenVT: item.tenVT,
        maVach: item.maVach,
        maNCC: item.maNCC,
        thoiGianBaoHanh: item.thoiGianBaoHanh,
        ghiChu: item.ghiChu,
        hinhAnh: item.hinhAnh
    })
    setIsModalOpen(true)
  }

  const handleDelete = async (id: number) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa vật tư này?')) {
      try {
        await apiDelete(`/api/VatTu/${id}`)
        setItems(prev => prev.filter(i => i.maVT !== id))
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
      const payload: VatTuPayload = {
          ...formData,
          // Ensure numbers are numbers
          maLoaiVT: Number(formData.maLoaiVT),
          maDVT: Number(formData.maDVT),
          maNCC: Number(formData.maNCC),
          thoiGianBaoHanh: Number(formData.thoiGianBaoHanh)
      }

      if (editingId) {
        await apiPut(`/api/VatTu/${editingId}`, payload)
        alert('Cập nhật thành công!')
      } else {
        await apiPost('/api/VatTu', payload)
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
            <h1 className="admin-title">Quản lý Vật Tư (Danh mục)</h1>
            <p className="admin-subtitle">
              Danh sách các loại vật tư, thiết bị trong hệ thống.
            </p>
          </div>
          <div style={{display: 'flex', gap: '12px'}}>
             <button className="btn-admin-outline" onClick={() => window.history.back()}>Quay lại</button>
             <button className="btn-admin-primary" onClick={handleAddNew}>+ Thêm vật tư mới</button>
          </div>
        </header>

         {/* Stats Row */}
         <div className="admin-stats-grid animate-up">
            <div className="stat-card">
                <span className="stat-val">{items.length}</span>
                <span className="stat-lbl">Tổng mã vật tư</span>
            </div>
        </div>

        <section className="admin-card animate-up" style={{animationDelay: '0.1s'}}>
          <div className="admin-card-header">
            <h3 className="admin-card-title">Danh sách vật tư</h3>
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
                  <th style={{width: '60px'}}>Ảnh</th>
                  <th>Tên Vật Tư</th>
                  <th>Mã Vạch</th>
                  <th>Loại</th>
                  <th>ĐVT</th>
                  <th>Nhà CC</th>
                  <th>Bảo Hành</th>
                  <th style={{width: '120px'}}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {items.length === 0 ? (
                    <tr><td colSpan={9} style={{textAlign: 'center', padding: '20px'}}>Chưa có dữ liệu.</td></tr>
                ) : (
                    items.map(item => (
                        <tr key={item.maVT}>
                        <td>#{item.maVT}</td>
                        <td>
                            {item.hinhAnh ? (
                                <img src={item.hinhAnh} alt="vt" style={{width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #ddd'}} />
                            ) : (
                                <div style={{width: '40px', height: '40px', background: '#eee', borderRadius: '4px'}} />
                            )}
                        </td>
                        <td style={{fontWeight: 600, color: '#1a73e8'}}>
                            {item.tenVT}
                            <div style={{fontSize: '11px', color: '#666', marginTop: '2px'}}>{item.ghiChu}</div>
                        </td>
                        <td><code>{item.maVach}</code></td>
                        <td>{item.tenLoaiVT} <span style={{fontSize:'10px', color: '#888'}}>({item.maLoaiVT})</span></td>
                        <td>{item.tenDVT} <span style={{fontSize:'10px', color: '#888'}}>({item.maDVT})</span></td>
                        <td>{item.tenNCC} <span style={{fontSize:'10px', color: '#888'}}>({item.maNCC})</span></td>
                        <td>{item.thoiGianBaoHanh} tháng</td>
                        <td>
                            <div style={{display: 'flex', gap: '8px'}}>
                                <button className="btn-admin-secondary" onClick={() => handleEdit(item)}>Sửa</button>
                                <button className="btn-admin-danger" style={{background: 'none', color: '#dc3545', border: '1px solid #dc3545'}} onClick={() => handleDelete(item.maVT)}>Xóa</button>
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
                <div className="modal-content" style={{width: '700px'}}>
                    <div className="modal-header" style={{borderBottom: '1px solid #eee', paddingBottom: '16px', marginBottom: '20px'}}>
                        <h2 style={{margin: 0, fontSize: '20px'}}>{editingId ? 'Cập nhật vật tư' : 'Thêm vật tư mới'}</h2>
                    </div>
                    
                    <form onSubmit={handleSubmit}>
                        <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px'}}>
                             <div className="admin-input-group">
                                <label className="admin-label">Tên Vật Tư</label>
                                <input 
                                    className="admin-input"
                                    placeholder="VD: Xi măng Hà Tiên"
                                    required
                                    value={formData.tenVT}
                                    onChange={e => setFormData({...formData, tenVT: e.target.value})}
                                />
                            </div>
                            <div className="admin-input-group">
                                <label className="admin-label">Mã Vạch (Barcode)</label>
                                <input 
                                    className="admin-input"
                                    placeholder="VD: 893..."
                                    value={formData.maVach}
                                    onChange={e => setFormData({...formData, maVach: e.target.value})}
                                />
                            </div>
                        </div>

                        <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px'}}>
                            <div className="admin-input-group">
                                <label className="admin-label">Mã Loại VT (ID)</label>
                                <input 
                                    className="admin-input"
                                    type="number"
                                    required
                                    value={formData.maLoaiVT}
                                    onChange={e => setFormData({...formData, maLoaiVT: Number(e.target.value)})}
                                />
                            </div>
                            <div className="admin-input-group">
                                <label className="admin-label">Mã ĐVT (ID)</label>
                                <input 
                                    className="admin-input"
                                    type="number"
                                    required
                                    value={formData.maDVT}
                                    onChange={e => setFormData({...formData, maDVT: Number(e.target.value)})}
                                />
                            </div>
                             <div className="admin-input-group">
                                <label className="admin-label">Mã Nhà CC (ID)</label>
                                <input 
                                    className="admin-input"
                                    type="number"
                                    required
                                    value={formData.maNCC}
                                    onChange={e => setFormData({...formData, maNCC: Number(e.target.value)})}
                                />
                            </div>
                        </div>

                         <div style={{display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '16px'}}>
                            <div className="admin-input-group">
                                <label className="admin-label">Bảo hành (tháng)</label>
                                <input 
                                    className="admin-input"
                                    type="number"
                                    value={formData.thoiGianBaoHanh}
                                    onChange={e => setFormData({...formData, thoiGianBaoHanh: Number(e.target.value)})}
                                />
                            </div>
                             <div className="admin-input-group">
                                <label className="admin-label">Link Hình Ảnh</label>
                                <input 
                                    className="admin-input"
                                    placeholder="https://..."
                                    value={formData.hinhAnh}
                                    onChange={e => setFormData({...formData, hinhAnh: e.target.value})}
                                />
                            </div>
                        </div>

                        <div className="admin-input-group">
                            <label className="admin-label">Ghi chú</label>
                            <textarea 
                                className="admin-input"
                                style={{minHeight: '60px', fontFamily: 'inherit'}}
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

export default AdminMaterialsPage
