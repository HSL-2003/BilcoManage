import MainLayout from '../layouts/MainLayout'

const ReportsPage = () => {
  return (
    <MainLayout>
      <section className="page-header">
        <div>
          <h2 className="page-title">Báo cáo & thống kê</h2>
          <p className="page-subtitle">
            Tổng hợp lịch sử kiểm tra, hạng mục lỗi và xu hướng sử dụng vật tư để phục vụ quản lý.
          </p>
        </div>
      </section>

      <section className="grid reports-grid">
        <div className="card">
          <h3 className="card-title">Tổng quan số lần kiểm tra theo trò chơi</h3>
          <p className="card-subtitle">
            Phần này sau này có thể thay bằng biểu đồ (chart) lấy dữ liệu từ API.
          </p>
          <div className="placeholder-chart">Biểu đồ demo</div>
        </div>

        <div className="card">
          <h3 className="card-title">Các hạng mục hay phát sinh lỗi</h3>
          <ul className="simple-list">
            <li>
              <span className="simple-list-primary">Bu lông liên kết chân trụ tháp trượt</span>
              <span className="simple-list-secondary">12 lần ghi nhận trong 6 tháng</span>
            </li>
            <li>
              <span className="simple-list-primary">Phớt trục bơm hồ tạo sóng</span>
              <span className="simple-list-secondary">8 lần thay thế trong 6 tháng</span>
            </li>
            <li>
              <span className="simple-list-primary">Dây cáp an toàn ghế treo</span>
              <span className="simple-list-secondary">5 lần thay thế trong 6 tháng</span>
            </li>
          </ul>
        </div>
      </section>
    </MainLayout>
  )
}

export default ReportsPage


