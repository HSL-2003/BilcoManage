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
}

const AdminMaintenancePlanningPage = () => {
    const { user } = useAuth()
    const [plans, setPlans] = useState<MaintenancePlan[]>([])
    const [loading, setLoading] = useState(true)
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

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!user?.maND) {
            alert('Bạn chưa đăng nhập hoặc không có mã người dùng!')
            return
        }

        try {
            const payload = {
                ...formData,
                maThietBi: Number(formData.maThietBi), // Ensure number
                chuKyBaoTri: Number(formData.chuKyBaoTri), // Ensure number
                nguoiTao: user.maND
            }

            await apiPost('/api/Kehoachbaotri', payload)
            alert('Tạo kế hoạch thành công!')
            setIsCreateModalOpen(false)
            fetchPlans()
        } catch (error) {
            console.error('Create plan failed', error)
            alert('Có lỗi xảy ra khi tạo kế hoạch')
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
                    <button className="btn-primary" onClick={() => setIsCreateModalOpen(true)}>
                        + Lập kế hoạch mới
                    </button>
                </div>

                <div className="admin-table-container">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Mã KH</th>
                                <th>Tiêu đề</th>
                                <th>Thiết bị (ID)</th>
                                <th>Loại</th>
                                <th>Chu kỳ (ngày)</th>
                                <th>Ngày BĐ</th>
                                <th>Trạng thái</th>
                                <th>Ngày tạo</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={8} style={{textAlign: 'center', padding: '24px'}}>Đang tải...</td></tr>
                            ) : plans.length === 0 ? (
                                <tr><td colSpan={8} style={{textAlign: 'center', padding: '24px'}}>Chưa có kế hoạch nào</td></tr>
                            ) : (
                                plans.map(p => (
                                    <tr key={p.maKeHoach}>
                                        <td>#{p.maKeHoach}</td>
                                        <td style={{fontWeight: 500}}>{p.tieuDe}</td>
                                        <td>{p.maThietBi}</td>
                                        <td>{p.loaiBaoTri}</td>
                                        <td>{p.chuKyBaoTri}</td>
                                        <td>{new Date(p.ngayBatDau).toLocaleDateString()}</td>
                                        <td>
                                            <span className={`badge ${p.trangThai === 'Hoàn thành' ? 'badge-success' : 'badge-warning'}`}>
                                                {p.trangThai}
                                            </span>
                                        </td>
                                        <td>{new Date(p.ngayTao).toLocaleDateString()}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {isCreateModalOpen && (
                    <div className="admin-modal-overlay">
                        <div className="admin-modal">
                            <h2 className="admin-modal-title">Lập kế hoạch bảo trì</h2>
                            <form onSubmit={handleCreate} className="form-grid">
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
                                    <button type="submit" className="btn-primary">Lưu kế hoạch</button>
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
