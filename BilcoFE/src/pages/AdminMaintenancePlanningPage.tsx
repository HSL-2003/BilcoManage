import { useEffect, useState } from 'react'
import MainLayout from '../layouts/MainLayout'
import { apiGet, apiPost } from '../api/client'
import { useAuth } from '../context/AuthContext'

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

    return (
        <MainLayout>
            <div className="admin-page">
                <div className="admin-header">
                    <div>
                        <h1 className="admin-title">Kế hoạch bảo trì</h1>
                        <p className="admin-subtitle">Quản lý lịch trình bảo trì thiết bị định kỳ</p>
                    </div>
                    <button className="btn-primary" onClick={openCreate}>
                        + Lập kế hoạch mới
                    </button>
                </div>

                <div className="admin-table-container">
                    <table className="admin-table">
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
                                <th>Thao tác</th>
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
                                        <td style={{fontWeight: 500}}>{p.tieuDe}</td>
                                        <td>
                                            <div style={{fontWeight: 500}}>{p.tenThietBi || `ID: ${p.maThietBi}`}</div>
                                        </td>
                                        <td>{p.tenNguoiTao || `ID: ${p.nguoiTao}`}</td>
                                        <td>{p.loaiBaoTri}</td>
                                        <td>{p.chuKyBaoTri}</td>
                                        <td>{new Date(p.ngayBatDau).toLocaleDateString()}</td>
                                        <td>
                                            <span className={`badge ${p.trangThai === 'Hoàn thành' ? 'badge-success' : 'badge-warning'}`}>
                                                {p.trangThai}
                                            </span>
                                        </td>
                                        <td>
                                            <button 
                                                onClick={() => handleEdit(p)}
                                                style={{marginRight: '8px', border: 'none', background: 'none', color: '#1a73e8', cursor: 'pointer', fontWeight: 600}}
                                            >
                                                Sửa
                                            </button>
                                            <button 
                                                onClick={() => handleDelete(p.maKeHoach)}
                                                style={{border: 'none', background: 'none', color: '#d93025', cursor: 'pointer', fontWeight: 600}}
                                            >
                                                Xóa
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {isCreateModalOpen && (
                    <div className="admin-modal-overlay">
                        <div className="admin-modal">
                            <h2 className="admin-modal-title">
                                {editingId ? 'Cập nhật kế hoạch' : 'Lập kế hoạch bảo trì'}
                            </h2>
                            <form onSubmit={handleSubmit} className="form-grid">
                                <label className="form-field">
                                    <span className="form-label">Tiêu đề kế hoạch</span>
                                    <input 
                                        type="text" 
                                        className="input" 
                                        required 
                                        value={formData.tieuDe}
                                        onChange={e => setFormData({...formData, tieuDe: e.target.value})}
                                    />
                                </label>
                                <label className="form-field">
                                    <span className="form-label">Mã thiết bị</span>
                                    <input 
                                        type="number" 
                                        className="input" 
                                        required 
                                        value={formData.maThietBi}
                                        onChange={e => setFormData({...formData, maThietBi: Number(e.target.value)})}
                                    />
                                </label>
                                <label className="form-field">
                                    <span className="form-label">Loại bảo trì</span>
                                    <select 
                                        className="select" 
                                        value={formData.loaiBaoTri}
                                        onChange={e => setFormData({...formData, loaiBaoTri: e.target.value})}
                                    >
                                        <option value="Định kỳ">Định kỳ</option>
                                        <option value="Sửa chữa">Sửa chữa</option>
                                        <option value="Nâng cấp">Nâng cấp</option>
                                    </select>
                                </label>
                                <label className="form-field">
                                    <span className="form-label">Chu kỳ (ngày)</span>
                                    <input 
                                        type="number" 
                                        className="input" 
                                        value={formData.chuKyBaoTri}
                                        onChange={e => setFormData({...formData, chuKyBaoTri: Number(e.target.value)})}
                                    />
                                </label>
                                <label className="form-field">
                                    <span className="form-label">Ngày bắt đầu</span>
                                    <input 
                                        type="date" 
                                        className="input" 
                                        required
                                        value={formData.ngayBatDau}
                                        onChange={e => setFormData({...formData, ngayBatDau: e.target.value})}
                                    />
                                </label>
                                <label className="form-field">
                                    <span className="form-label">Ngày kết thúc</span>
                                    <input 
                                        type="date" 
                                        className="input" 
                                        required
                                        value={formData.ngayKetThuc}
                                        onChange={e => setFormData({...formData, ngayKetThuc: e.target.value})}
                                    />
                                </label>
                                <label className="form-field">
                                    <span className="form-label">Trạng thái</span>
                                    <select 
                                        className="select" 
                                        value={formData.trangThai}
                                        onChange={e => setFormData({...formData, trangThai: e.target.value})}
                                    >
                                        <option value="Lên kế hoạch">Lên kế hoạch</option>
                                        <option value="Đang thực hiện">Đang thực hiện</option>
                                        <option value="Hoàn thành">Hoàn thành</option>
                                        <option value="Hủy">Hủy</option>
                                    </select>
                                </label>
                                <label className="form-field form-field-full">
                                    <span className="form-label">Mô tả chi tiết</span>
                                    <textarea 
                                        className="textarea" 
                                        rows={3}
                                        value={formData.moTa}
                                        onChange={e => setFormData({...formData, moTa: e.target.value})}
                                    />
                                </label>

                                <div className="form-actions" style={{marginTop: '20px', display: 'flex', gap: '10px', justifyContent: 'flex-end'}}>
                                    <button type="button" className="btn-secondary" onClick={() => setIsCreateModalOpen(false)}>Hủy</button>
                                    <button type="submit" className="btn-primary">
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
