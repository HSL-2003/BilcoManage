import MainLayout from '../layouts/MainLayout'

const MaintenancePage = () => {
  return (
    <MainLayout>
      <section className="page-header">
        <div>
          <h2 className="page-title">Bảo trì & kiểm tra định kỳ</h2>
          <p className="page-subtitle">
            Ghi nhận kết quả kiểm tra, đánh giá tình trạng và lập kế hoạch bảo trì cho từng hạng mục.
          </p>
        </div>
        <button className="btn-primary">+ Tạo phiếu kiểm tra</button>
      </section>

      <section className="grid maintenance-grid">
        <div className="card">
          <h3 className="card-title">Phiếu kiểm tra gần đây</h3>
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Mã phiếu</th>
                  <th>Trò chơi</th>
                  <th>Ngày kiểm tra</th>
                  <th>Người thực hiện</th>
                  <th>Kết quả</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>INS-2025-1201</td>
                  <td>Tàu lượn siêu tốc</td>
                  <td>01-12-2025</td>
                  <td>Nguyễn Văn A</td>
                  <td>
                    <span className="badge badge-success">Đạt</span>
                  </td>
                  <td>
                    <button className="btn-link">Xem chi tiết</button>
                  </td>
                </tr>
                <tr>
                  <td>INS-2025-1198</td>
                  <td>Tháp trượt nước 6 làn</td>
                  <td>30-11-2025</td>
                  <td>Trần Thị B</td>
                  <td>
                    <span className="badge badge-danger">Có hạng mục không đạt</span>
                  </td>
                  <td>
                    <button className="btn-link">Xem chi tiết</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <h3 className="card-title">Mẫu form đánh giá nhanh (demo)</h3>
          <form className="form-grid">
            <label className="form-field">
              <span className="form-label">Trò chơi / Hạng mục</span>
              <select className="select">
                <option>Chọn trò chơi</option>
                <option>Tàu lượn siêu tốc</option>
                <option>Tháp trượt nước 6 làn</option>
                <option>Máy bơm hồ tạo sóng</option>
              </select>
            </label>

            <label className="form-field">
              <span className="form-label">Ngày kiểm tra</span>
              <input type="date" className="input" />
            </label>

            <label className="form-field">
              <span className="form-label">Đánh giá tổng thể</span>
              <select className="select">
                <option>Đạt</option>
                <option>Cần theo dõi</option>
                <option>Không đạt - dừng vận hành</option>
              </select>
            </label>

            <label className="form-field form-field-full">
              <span className="form-label">Ghi chú kỹ thuật</span>
              <textarea
                className="textarea"
                rows={4}
                placeholder="Ghi rõ các hạng mục đã kiểm tra, chi tiết bất thường (nếu có)..."
              />
            </label>

            <div className="form-actions">
              <button type="button" className="btn-secondary">
                Lưu nháp
              </button>
              <button type="submit" className="btn-primary">
                Ghi nhận kết quả
              </button>
            </div>
          </form>
        </div>
      </section>
    </MainLayout>
  )
}

export default MaintenancePage


