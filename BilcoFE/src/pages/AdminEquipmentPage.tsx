import { useState, useEffect, type FormEvent } from 'react'
import MainLayout from '../layouts/MainLayout'
import { apiGet, apiPost, apiPut, apiDelete } from '../api/client'
import './admin.css'

// Types
type LoaiThietBi = {
  maLoai: number
  tenLoai: string
  moTa: string
}

type ThietBi = {
  maThietBi: number
  tenThietBi: string
  maLoai: number
  maSo: string
  ngayLapDat: string
  ngayHetHanBaoHanh: string
  tinhTrang: string
  ghiChu?: string
  hinhAnh?: string
  viTriLapDat?: string // Included in GET, optional in form if supported
}

const AdminEquipmentPage = () => {
  const [activeTab, setActiveTab] = useState<'devices' | 'types'>('devices')
  
  // Data State
  const [devices, setDevices] = useState<ThietBi[]>([])
  const [types, setTypes] = useState<LoaiThietBi[]>([])
  const [loading, setLoading] = useState(false)
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [zoomedImage, setZoomedImage] = useState<string | null>(null) // New State for Image Zoom
  const [editingDevice, setEditingDevice] = useState<ThietBi | null>(null)
  const [editingType, setEditingType] = useState<LoaiThietBi | null>(null)
  const [submitting, setSubmitting] = useState(false)

  // Form State
  const [deviceForm, setDeviceForm] = useState<Partial<ThietBi>>({})
  const [typeForm, setTypeForm] = useState<Partial<LoaiThietBi>>({})

  // Fetch Data
  const fetchData = async () => {
    setLoading(true)
    try {
      if (activeTab === 'devices') {
        const [devData, typeData] = await Promise.all([
             apiGet<ThietBi[]>('/api/ThietBi').catch(() => []),
             apiGet<LoaiThietBi[]>('/api/LoaiThietBi').catch(() => []) 
        ])
        setDevices(devData || [])
        setTypes(typeData || [])
      } else {
        const data = await apiGet<LoaiThietBi[]>('/api/LoaiThietBi')
        setTypes(data || [])
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [activeTab])

  // --- HANDLERS FOR DEVICES ---
  const handleEditDevice = (device: ThietBi) => {
    setEditingDevice(device)
    setDeviceForm({
        ...device,
        ngayLapDat: device.ngayLapDat ? new Date(device.ngayLapDat).toISOString().slice(0, 10) : '',
        ngayHetHanBaoHanh: device.ngayHetHanBaoHanh ? new Date(device.ngayHetHanBaoHanh).toISOString().slice(0, 10) : ''
    })
    setEditingType(null)
    setIsModalOpen(true)
  }

  const handleDeleteDevice = async (id: number) => {
    if(!window.confirm('Xác nhận xóa thiết bị này?')) return
    try {
        await apiDelete(`/api/ThietBi/${id}`)
        setDevices(prev => prev.filter(d => d.maThietBi !== id))
        alert('Đã xóa thành công')
    } catch(err) {
        alert('Xóa thất bại')
    }
  }

  // --- HANDLERS FOR TYPES ---
  const handleEditType = (type: LoaiThietBi) => {
    setEditingType(type)
    setTypeForm(type)
    setEditingDevice(null)
    setIsModalOpen(true)
  }

  const handleDeleteType = async (id: number) => {
    if(!window.confirm('Xác nhận xóa loại thiết bị này?')) return
    try {
        await apiDelete(`/api/LoaiThietBi/${id}`)
        setTypes(prev => prev.filter(t => t.maLoai !== id))
        alert('Đã xóa thành công')
    } catch(err) {
        alert('Xóa thất bại')
    }
  }

  const openNewModal = () => {
      setEditingDevice(null)
      setEditingType(null)
      if (activeTab === 'devices') {
          setDeviceForm({
              tenThietBi: '',
              maLoai: types.length > 0 ? types[0].maLoai : 0,
              maSo: '',
              ngayLapDat: new Date().toISOString().slice(0, 10),
              ngayHetHanBaoHanh: new Date(new Date().setFullYear(new Date().getFullYear() + 2)).toISOString().slice(0, 10),
              tinhTrang: 'Đang hoạt động',
              ghiChu: '',
              hinhAnh: '',
              viTriLapDat: ''
          })
      } else {
          setTypeForm({
              tenLoai: '',
              moTa: ''
          })
      }
      setIsModalOpen(true)
  }

  const handleSubmit = async (e: FormEvent) => {
      e.preventDefault()
      setSubmitting(true)
      try {
          if (activeTab === 'devices') {
              const payload = {
                  tenThietBi: deviceForm.tenThietBi,
                  maLoai: Number(deviceForm.maLoai),
                  maSo: deviceForm.maSo,
                  ngayLapDat: deviceForm.ngayLapDat,
                  ngayHetHanBaoHanh: deviceForm.ngayHetHanBaoHanh,
                  tinhTrang: deviceForm.tinhTrang,
                  ghiChu: deviceForm.ghiChu || '',
                  hinhAnh: deviceForm.hinhAnh || '',
                  viTriLapDat: deviceForm.viTriLapDat || ''
              }
              
              if (editingDevice) {
                  await apiPut(`/api/ThietBi/${editingDevice.maThietBi}`, { ...payload, maThietBi: editingDevice.maThietBi })
              } else {
                  await apiPost('/api/ThietBi', payload)
              }
          } else {
              const typePayload = {
                  tenLoai: typeForm.tenLoai,
                  moTa: typeForm.moTa
              }

              if (editingType) {
                  await apiPut(`/api/LoaiThietBi/${editingType.maLoai}`, { ...typePayload, maLoai: editingType.maLoai })
              } else {
                  await apiPost('/api/LoaiThietBi', typePayload)
              }
          }
          alert('Lưu thành công!')
          setIsModalOpen(false)
          fetchData()
      } catch (err) {
          console.error(err)
          alert('Có lỗi xảy ra!')
      } finally {
          setSubmitting(false)
      }
  }

  return (
    <MainLayout>
      <div className="admin-root">
        {/* ... Header & Tabs ... */}
        <header className="admin-header">
            <div>
                <h1 className="admin-title">Quản lý Thiết Bị</h1>
                <p className="admin-subtitle">Danh mục thiết bị và phân loại hệ thống.</p>
            </div>
            <div>
                 <button className="btn-admin-outline" onClick={() => window.history.back()} style={{marginRight: '12px'}}>
                    Quay lại
                </button>
                <button className="btn-admin-primary" onClick={openNewModal}>
                    + {activeTab === 'devices' ? 'Thêm thiết bị' : 'Thêm loại mới'}
                </button>
            </div>
        </header>

        {/* TABS */}
        <div style={{marginBottom: '24px', borderBottom: '1px solid #ddd', display: 'flex', gap: '24px'}}>
            <button 
                onClick={() => setActiveTab('devices')}
                style={{
                    padding: '12px 0',
                    background: 'none',
                    border: 'none',
                    borderBottom: activeTab === 'devices' ? '3px solid #1a73e8' : '3px solid transparent',
                    color: activeTab === 'devices' ? '#1a73e8' : '#5f6368',
                    fontWeight: 600,
                    cursor: 'pointer'
                }}
            >
                Danh sách thiết bị
            </button>
            <button 
                onClick={() => setActiveTab('types')}
                style={{
                    padding: '12px 0',
                    background: 'none',
                    border: 'none',
                    borderBottom: activeTab === 'types' ? '3px solid #1a73e8' : '3px solid transparent',
                    color: activeTab === 'types' ? '#1a73e8' : '#5f6368',
                    fontWeight: 600,
                    cursor: 'pointer'
                }}
            >
                Loại thiết bị
            </button>
        </div>

        <div className="admin-card animate-up">
            {loading && <p style={{textAlign: 'center', padding: '20px'}}>Đang tải dữ liệu...</p>}
            
            {!loading && activeTab === 'devices' && (
                <div className="table-wrapper">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Mã Số</th>
                                <th>Hình ảnh</th>
                                <th>Tên thiết bị</th>
                                <th>Loại</th>
                                <th>Trạng thái</th>
                                <th>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {devices.length === 0 ? (
                                <tr><td colSpan={7} style={{textAlign: 'center'}}>Chưa có dữ liệu</td></tr>
                            ) : devices.map(d => (
                                <tr key={d.maThietBi}>
                                    <td>{d.maThietBi}</td>
                                    <td><span className="badge">{d.maSo}</span></td>
                                    <td>
                                        {d.hinhAnh ? (
                                            <img 
                                                src={d.hinhAnh} 
                                                alt={d.tenThietBi}
                                                style={{width: '60px', height: '40px', objectFit: 'cover', borderRadius: '4px', cursor: 'zoom-in', border: '1px solid #eee'}}
                                                onClick={() => setZoomedImage(d.hinhAnh!)}
                                            />
                                        ) : (
                                            <div style={{width: '60px', height: '40px', background: '#f0f0f0', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ccc', fontSize: '10px'}}>
                                                No Img
                                            </div>
                                        )}
                                    </td>
                                    <td>
                                        <div style={{fontWeight: 600}}>{d.tenThietBi}</div>
                                        <div style={{fontSize: '12px', color: '#666'}}>{d.viTriLapDat}</div>
                                    </td>
                                    <td>
                                        {types.find(t => t.maLoai === d.maLoai)?.tenLoai || d.maLoai}
                                    </td>
                                    <td>
                                        <span className={`badge ${d.tinhTrang === 'Đang hoạt động' ? 'badge-success' : 'badge-warning'}`}>
                                            {d.tinhTrang}
                                        </span>
                                    </td>
                                    <td>
                                        <div style={{display: 'flex', gap: '8px'}}>
                                            <button className="btn-admin-secondary" onClick={() => handleEditDevice(d)}>Sửa</button>
                                            <button className="btn-admin-danger" style={{background: 'none', color: '#dc3545', border: '1px solid #dc3545'}} onClick={() => handleDeleteDevice(d.maThietBi)}>Xóa</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {!loading && activeTab === 'types' && (
                <div className="table-wrapper">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Tên loại</th>
                                <th>Mô tả</th>
                                <th>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                             {types.length === 0 ? (
                                <tr><td colSpan={4} style={{textAlign: 'center'}}>Chưa có dữ liệu</td></tr>
                            ) : types.map(t => (
                                <tr key={t.maLoai}>
                                    <td>{t.maLoai}</td>
                                    <td style={{fontWeight: 600}}>{t.tenLoai}</td>
                                    <td>{t.moTa}</td>
                                    <td>
                                        <div style={{display: 'flex', gap: '8px'}}>
                                            <button className="btn-admin-secondary" onClick={() => handleEditType(t)}>Sửa</button>
                                            <button className="btn-admin-danger" style={{background: 'none', color: '#dc3545', border: '1px solid #dc3545'}} onClick={() => handleDeleteType(t.maLoai)}>Xóa</button>
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
                <div className="modal-content" style={{width: '550px'}}>
                     <h2 style={{marginTop: 0, borderBottom: '1px solid #eee', paddingBottom: '16px'}}>
                        {activeTab === 'devices' 
                            ? (editingDevice ? 'Cập nhật thiết bị' : 'Thêm thiết bị mới')
                            : (editingType ? 'Cập nhật loại' : 'Thêm loại mới')
                        }
                     </h2>
                     <form onSubmit={handleSubmit}>
                        {activeTab === 'devices' ? (
                            <>
                                <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px'}}>
                                    <div className="admin-input-group">
                                        <label className="admin-label">Mã số</label>
                                        <input 
                                            className="admin-input" required 
                                            value={deviceForm.maSo || ''}
                                            onChange={e => setDeviceForm({...deviceForm, maSo: e.target.value})}
                                            placeholder="VD: CT-001"
                                        />
                                    </div>
                                    <div className="admin-input-group">
                                        <label className="admin-label">Loại thiết bị</label>
                                        <select 
                                            className="admin-input"
                                            value={deviceForm.maLoai}
                                            onChange={e => setDeviceForm({...deviceForm, maLoai: Number(e.target.value)})}
                                        >
                                            <option value={0}>-- Chọn loại --</option>
                                            {types.map(t => (
                                                <option key={t.maLoai} value={t.maLoai}>{t.tenLoai}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="admin-input-group">
                                    <label className="admin-label">Tên thiết bị</label>
                                    <input 
                                        className="admin-input" required 
                                        value={deviceForm.tenThietBi || ''}
                                        onChange={e => setDeviceForm({...deviceForm, tenThietBi: e.target.value})}
                                    />
                                    <div className="admin-input-group">
                                        <label className="admin-label">Vị trí lắp đặt</label>
                                        <input 
                                            className="admin-input" 
                                            value={deviceForm.viTriLapDat || ''}
                                            onChange={e => setDeviceForm({...deviceForm, viTriLapDat: e.target.value})}
                                            placeholder="VD: Khu vực A"
                                        />
                                    </div>
                                </div>
                                
                                <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px'}}>
                                    <div className="admin-input-group">
                                            <label className="admin-label">Ngày lắp đặt</label>
                                            <input 
                                                type="date" className="admin-input"
                                                value={deviceForm.ngayLapDat || ''}
                                                onChange={e => setDeviceForm({...deviceForm, ngayLapDat: e.target.value})}
                                            />
                                    </div>
                                    <div className="admin-input-group">
                                            <label className="admin-label">Hết hạn bảo hành</label>
                                            <input 
                                                type="date" className="admin-input"
                                                value={deviceForm.ngayHetHanBaoHanh || ''}
                                                onChange={e => setDeviceForm({...deviceForm, ngayHetHanBaoHanh: e.target.value})}
                                            />
                                    </div>
                                </div>

                                <div className="admin-input-group">
                                    <label className="admin-label">Tình trạng</label>
                                    <select 
                                        className="admin-input"
                                        value={deviceForm.tinhTrang || 'Đang hoạt động'}
                                        onChange={e => setDeviceForm({...deviceForm, tinhTrang: e.target.value})}
                                    >
                                        <option value="Đang hoạt động">Đang hoạt động</option>
                                        <option value="Đang bảo trì">Đang bảo trì</option>
                                        <option value="Hư hỏng">Hư hỏng</option>
                                        <option value="Thanh lý">Thanh lý</option>
                                    </select>
                                </div>

                                <div className="admin-input-group">
                                    <label className="admin-label">Ghi chú</label>
                                    <textarea 
                                        className="admin-input" 
                                        rows={2}
                                        value={deviceForm.ghiChu || ''}
                                        onChange={e => setDeviceForm({...deviceForm, ghiChu: e.target.value})}
                                    />
                                </div>

                                <div className="admin-input-group">
                                    <label className="admin-label">Link Hình ảnh (URL)</label>
                                    <input 
                                        className="admin-input" 
                                        value={deviceForm.hinhAnh || ''}
                                        onChange={e => setDeviceForm({...deviceForm, hinhAnh: e.target.value})}
                                        placeholder="https://example.com/image.jpg"
                                    />
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="admin-input-group">
                                    <label className="admin-label">Tên loại thiết bị</label>
                                    <input 
                                        className="admin-input" required 
                                        value={typeForm.tenLoai || ''}
                                        onChange={e => setTypeForm({...typeForm, tenLoai: e.target.value})}
                                    />
                                </div>
                                <div className="admin-input-group">
                                    <label className="admin-label">Mô tả</label>
                                    <textarea 
                                        className="admin-input" rows={3}
                                        value={typeForm.moTa || ''}
                                        onChange={e => setTypeForm({...typeForm, moTa: e.target.value})}
                                    />
                                </div>
                            </>
                        )}

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

        {/* IMAGE ZOOM MODAL */}
        {zoomedImage && (
            <div 
                className="modal-overlay" 
                style={{backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 9999}}
                onClick={() => setZoomedImage(null)}
            >
                <div style={{position: 'relative', maxWidth: '90%', maxHeight: '90%'}}>
                    <img 
                        src={zoomedImage} 
                        alt="Zoomed" 
                        style={{maxWidth: '100%', maxHeight: '90vh', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.5)'}}
                    />
                    <button 
                        onClick={() => setZoomedImage(null)}
                        style={{
                            position: 'absolute', top: -40, right: 0, 
                            background: 'none', border: 'none', color: 'white', 
                            fontSize: '24px', cursor: 'pointer'
                        }}
                    >
                        ✕ Đóng
                    </button>
                </div>
            </div>
        )}

      </div>
    </MainLayout>
  )
}

export default AdminEquipmentPage
