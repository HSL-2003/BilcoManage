import MainLayout from '../layouts/MainLayout'
import { useAuth } from '../context/AuthContext'
import './technical.css'

const Dashboard = () => {
  const { user } = useAuth()
  
  // Greeting based on time
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Chào buổi sáng' : hour < 18 ? 'Chào buổi chiều' : 'Chào buổi tối'
  const today = new Date().toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

  // Mock Data for Technical Stuff
  const tasks = [
    { id: 1, time: '08:00', title: 'Kiểm tra hệ thống lọc nước', subtitle: 'Khu vực hồ tạo sóng', priority: 'high', status: 'done' },
    { id: 2, time: '09:30', title: 'Bảo trì máng trượt số 4', subtitle: 'Thay thế ốc vít bị lỏng', priority: 'normal', status: 'processing' },
    { id: 3, time: '13:00', title: 'Kiểm tra định kỳ tàu lượn', subtitle: 'Hạng mục A/B/C', priority: 'high', status: 'pending' },
    { id: 4, time: '15:30', title: 'Vệ sinh bơm áp lực', subtitle: 'Khu công viên nước trẻ em', priority: 'low', status: 'pending' },
  ]

  return (
    <MainLayout>
      <div className="tech-root">
        {/* Header Section */}
        <header className="tech-header">
          <h1 className="tech-welcome">{greeting}, {user?.username || 'Đồng nghiệp'}! 👋</h1>
          <p className="tech-date">Hôm nay là {today}</p>
        </header>

        <div className="tech-grid">
          {/* LEFT COLUMN: SCHEDULE */}
          <div className="tech-column animate-delay-1">
            <div className="tech-card">
              <div className="tech-card-title">
                <span>Lịch trình hôm nay</span>
                <button style={{background:'none', border:'none', color:'#007cc3', fontWeight:600, cursor:'pointer'}}>Xem tất cả</button>
              </div>
              
              <div className="tech-timeline">
                {tasks.map(task => (
                  <div key={task.id} className={`tech-task priority-${task.priority}`}>
                    <div className="tech-task-time">
                      <span>{task.time}</span>
                    </div>
                    <div className="tech-task-content">
                      <h4>{task.title}</h4>
                      <p>{task.subtitle}</p>
                      <span className={`tech-status-badge badge-${task.status}`}>
                        {task.status === 'done' ? 'Hoàn thành' : task.status === 'processing' ? 'Đang thực hiện' : 'Chờ xử lý'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: STATS & ACTION */}
          <div className="tech-column">
            
            {/* Mini Stats */}
            <div className="tech-stats-row animate-delay-2">
              <div className="tech-mini-stat">
                <span className="tech-mini-val">4</span>
                <span className="tech-mini-lbl">Nhiệm vụ hôm nay</span>
              </div>
              <div className="tech-mini-stat">
                <span className="tech-mini-val" style={{color:'#d93025'}}>1</span>
                <span className="tech-mini-lbl">Cần gấp</span>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="tech-card animate-delay-3" style={{marginBottom: '32px'}}>
               <div className="tech-card-title">Thao tác nhanh</div>
               <div className="tech-actions-grid">
                  <button className="btn-tech-action">
                    <span>📝</span> Báo cáo sự cố
                  </button>
                  <button className="btn-tech-action">
                    <span>🔧</span> Yêu cầu vật tư
                  </button>
                  <button className="btn-tech-action">
                    <span>✅</span> Check-in công việc
                  </button>
               </div>
            </div>

            {/* Weather / Status Widget Demo */}
            <div className="tech-card animate-delay-3" style={{background: 'linear-gradient(135deg, #007cc3 0%, #00c6d4 100%)', color: 'white'}}>
               <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                  <div>
                    <h3 style={{margin:0, fontSize:'18px'}}>Hệ thống vận hành</h3>
                    <p style={{margin:'4px 0 0 0', opacity:0.9, fontSize:'13px'}}>Tất cả thiết bị ổn định</p>
                  </div>
                  <div style={{fontSize:'32px'}}>🛡️</div>
               </div>
            </div>

          </div>
        </div>
      </div>
    </MainLayout>
  )
}

export default Dashboard


