import { useEffect, useState } from 'react'
import MainLayout from '../layouts/MainLayout'
import { apiGet, apiPost } from '../api/client'
import { useAuth } from '../context/AuthContext'
import './admin.css' // Import admin styles

interface MaintenancePlan {
  maKeHoach: number
  tieuDe: string
  maThietBi: number
  loaiBaoTri: string
  chuKyBaoTri: number
  ngayBatDau: string
  ngayKetThuc: string
  moTa: string
  trangThai: string
  nguoiTao: number
  ngayTao: string
  tenNguoiTao?: string
  tenThietBi?: string
}

const AdminMaintenancePlanningPage = () => {
    const { user } = useAuth()
    const [plans, setPlans] = useState<MaintenancePlan[]>([])
    const [loading, setLoading] = useState(true)
    const [editingId, setEditingId] = useState<number | null>(null)
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

    // Form State
    const [formData, setFormData] = useState({
        tieuDe: '',
        maThietBi: 0,
        loaiBaoTri: 'Định kỳ',
        chuKyBaoTri: 30,
        ngayBatDau: new Date().toISOString().split('T')[0],
        ngayKetThuc: new Date().toISOString().split('T')[0],
        moTa: '',
        trangThai: 'Lên kế hoạch'
    })

    const fetchPlans = async () => {
        setLoading(true)
        try {
            const data = await apiGet<MaintenancePlan[]>('/api/Kehoachbaotri')
            setPlans(data)
        } catch (error) {
            console.error('Failed to fetch maintenance plans', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchPlans()
    }, [])

    const handleDelete = async (id: number) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa kế hoạch này?')) return
        try {
            await import('../api/client').then(m => m.apiDelete(`/api/Kehoachbaotri/${id}`))
            setPlans(prev => prev.filter(p => p.maKeHoach !== id))
            alert('Đã xóa thành công!')
        } catch (error) {
            console.error('Delete failed', error)
            alert('Xóa thất bại')
        }
    }

    const handleEdit = (plan: MaintenancePlan) => {
        setEditingId(plan.maKeHoach)
        setFormData({
            tieuDe: plan.tieuDe,
            maThietBi: plan.maThietBi,
            loaiBaoTri: plan.loaiBaoTri,
            chuKyBaoTri: plan.chuKyBaoTri,
            ngayBatDau: plan.ngayBatDau.split('T')[0],
            ngayKetThuc: plan.ngayKetThuc.split('T')[0],
            moTa: plan.moTa,
            trangThai: plan.trangThai
        })
        setIsCreateModalOpen(true)
    }

    const openCreate = () => {
        setEditingId(null)
        setFormData({
            tieuDe: '',
            maThietBi: 0,
            loaiBaoTri: 'Định kỳ',
            chuKyBaoTri: 30,
            ngayBatDau: new Date().toISOString().split('T')[0],
            ngayKetThuc: new Date().toISOString().split('T')[0],
            moTa: '',
            trangThai: 'Lên kế hoạch'
        })
        setIsCreateModalOpen(true)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!user?.maND) {
            alert('Bạn chưa đăng nhập hoặc không có mã người dùng!')
            return
        }

        try {
            const payload = {
                ...formData,
                maThietBi: Number(formData.maThietBi),
                chuKyBaoTri: Number(formData.chuKyBaoTri),
                nguoiTao: user.maND
            }

            if (editingId) {
                // UPDATE
                await import('../api/client').then(m => m.apiPut(`/api/Kehoachbaotri/${editingId}`, payload))
                alert('Cập nhật kế hoạch thành công!')
            } else {
                // CREATE
                await apiPost('/api/Kehoachbaotri', payload)
                alert('Tạo kế hoạch thành công!')
            }
            
            setIsCreateModalOpen(false)
            fetchPlans()
        } catch (error) {
            console.error('Save plan failed', error)
            console.log(error)
            alert('Có lỗi xảy ra')
        }
    }

    const getStatusBadge = (status: string) => {
        switch(status) {
            case 'Hoàn thành': return 'badge-success'
            case 'Đang thực hiện': return 'badge-progress' // Assuming you have this or similar in admin.css, otherwise badge-warning
            case 'Lên kế hoạch': return 'badge-info' // Or similar
            case 'Hủy': return 'badge-danger'
            default: return 'badge-warning'
        }
    }

    return (
        <MainLayout>
            <div className="admin-root">
                <header className="admin-header">
                    <div>
                        <h1 className="admin-title">Kế hoạch bảo trì</h1>
                        <p className="admin-subtitle">Quản lý lịch trình bảo trì thiết bị định kỳ</p>
                    </div>
                    <div>
                        <button className="btn-admin-primary" onClick={openCreate}>
                            + Lập kế hoạch mới
                        </button>
                    </div>
                </header>

                <div className="admin-card animate-up">
                    <div className="admin-card-header">
                        <h3 className="admin-card-title">Danh sách kế hoạch</h3>
                        {loading && <span style={{fontSize: '14px', color: '#666', marginLeft: '10px'}}>(Đang tải...)</span>}
                    </div>

                    <div className="table-wrapper">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Mã KH</th>
                                    <th>Tiêu đề</th>
                                    <th>Thiết bị</th>
                                    <th>Người tạo</th>
                                    <th>Loại</th>
                                    <th>Chu kỳ (ngày)</th>
                                    <th>Ngày BĐ</th>
                                    <th>Trạng thái</th>
                                    <th style={{textAlign: 'right'}}>Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan={9} style={{textAlign: 'center', padding: '24px'}}>Đang tải...</td></tr>
                                ) : plans.length === 0 ? (
                                    <tr><td colSpan={9} style={{textAlign: 'center', padding: '24px'}}>Chưa có kế hoạch nào</td></tr>
                                ) : (
                                    plans.map(p => (
                                        <tr key={p.maKeHoach}>
                                            <td>#{p.maKeHoach}</td>
                                            <td style={{fontWeight: 600, color: '#e2e8f0'}}>{p.tieuDe}</td>
                                            <td>
                                                <div style={{fontWeight: 500}}>{p.tenThietBi || `ID: ${p.maThietBi}`}</div>
                                            </td>
                                            <td>{p.tenNguoiTao || `ID: ${p.nguoiTao}`}</td>
                                            <td>{p.loaiBaoTri}</td>
                                            <td>{p.chuKyBaoTri}</td>
                                            <td>{new Date(p.ngayBatDau).toLocaleDateString('vi-VN')}</td>
                                            <td>
                                                <span className={`badge ${getStatusBadge(p.trangThai)}`}>
                                                    {p.trangThai}
                                                </span>
                                            </td>
                                            <td>
                                                <div style={{display: 'flex', gap: '8px', justifyContent: 'flex-end'}}>
                                                    <button 
                                                        onClick={() => handleEdit(p)}
                                                        className="btn-admin-secondary"
                                                        style={{padding: '4px 12px', fontSize: '12px'}}
                                                    >
                                                        Sửa
                                                    </button>
                                                    <button 
                                                        onClick={() => handleDelete(p.maKeHoach)}
                                                        className="btn-admin-danger"
                                                        style={{padding: '4px 12px', fontSize: '12px', background: 'none', border: '1px solid #dc3545', color: '#dc3545'}}
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

                {isCreateModalOpen && (
                    <div className="modal-overlay">
                        <div className="modal-content" style={{width: '600px'}}>
                            <div className="modal-header" style={{borderBottom: '1px solid #eee', paddingBottom: '16px', marginBottom: '20px'}}>
                                <h2 style={{margin: 0, fontSize: '20px'}}>
                                    {editingId ? 'Cập nhật kế hoạch' : 'Lập kế hoạch bảo trì'}
                                </h2>
                            </div>
                            <form onSubmit={handleSubmit}>
                                <div className="admin-input-group">
                                    <label className="admin-label">Tiêu đề kế hoạch</label>
                                    <input 
                                        type="text" 
                                        className="admin-input" 
                                        required 
                                        value={formData.tieuDe}
                                        onChange={e => setFormData({...formData, tieuDe: e.target.value})}
                                        placeholder="VD: Bảo dưỡng máy nén khí..."
                                    />
                                </div>
                                
                                <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px'}}>
                                    <div className="admin-input-group">
                                        <label className="admin-label">Mã thiết bị</label>
                                        <input 
                                            type="number" 
                                            className="admin-input" 
                                            required 
                                            value={formData.maThietBi}
                                            onChange={e => setFormData({...formData, maThietBi: Number(e.target.value)})}
                                        />
                                    </div>
                                    <div className="admin-input-group">
                                        <label className="admin-label">Loại bảo trì</label>
                                        <select 
                                            className="admin-input" 
                                            value={formData.loaiBaoTri}
                                            onChange={e => setFormData({...formData, loaiBaoTri: e.target.value})}
                                        >
                                            <option value="Định kỳ">Định kỳ</option>
                                            <option value="Sửa chữa">Sửa chữa</option>
                                            <option value="Nâng cấp">Nâng cấp</option>
                                        </select>
                                    </div>
                                </div>

                                <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px'}}>
                                    <div className="admin-input-group">
                                        <label className="admin-label">Chu kỳ (ngày)</label>
                                        <input 
                                            type="number" 
                                            className="admin-input" 
                                            value={formData.chuKyBaoTri}
                                            onChange={e => setFormData({...formData, chuKyBaoTri: Number(e.target.value)})}
                                        />
                                    </div>
                                     <div className="admin-input-group">
                                        <label className="admin-label">Trạng thái</label>
                                        <select 
                                            className="admin-input" 
                                            value={formData.trangThai}
                                            onChange={e => setFormData({...formData, trangThai: e.target.value})}
                                        >
                                            <option value="Lên kế hoạch">Lên kế hoạch</option>
                                            <option value="Đang thực hiện">Đang thực hiện</option>
                                            <option value="Hoàn thành">Hoàn thành</option>
                                            <option value="Hủy">Hủy</option>
                                        </select>
                                    </div>
                                </div>

                                <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px'}}>
                                    <div className="admin-input-group">
                                        <label className="admin-label">Ngày bắt đầu</label>
                                        <input 
                                            type="date" 
                                            className="admin-input" 
                                            required
                                            value={formData.ngayBatDau}
                                            onChange={e => setFormData({...formData, ngayBatDau: e.target.value})}
                                        />
                                    </div>
                                    <div className="admin-input-group">
                                        <label className="admin-label">Ngày kết thúc</label>
                                        <input 
                                            type="date" 
                                            className="admin-input" 
                                            required
                                            value={formData.ngayKetThuc}
                                            onChange={e => setFormData({...formData, ngayKetThuc: e.target.value})}
                                        />
                                    </div>
                                </div>

                                <div className="admin-input-group">
                                    <label className="admin-label">Mô tả chi tiết</label>
                                    <textarea 
                                        className="admin-input" 
                                        rows={3}
                                        value={formData.moTa}
                                        onChange={e => setFormData({...formData, moTa: e.target.value})}
                                        style={{resize: 'vertical'}}
                                    />
                                </div>

                                <div style={{display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px'}}>
                                    <button type="button" className="btn-admin-outline" onClick={() => setIsCreateModalOpen(false)}>Hủy bỏ</button>
                                    <button type="submit" className="btn-admin-primary">
                                        {editingId ? 'Cập nhật' : 'Lưu kế hoạch'}
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

export default AdminMaintenancePlanningPage
