import MainLayout from '../layouts/MainLayout'

const PlaysPage = () => {
  return (
    <MainLayout>
      <section className="page-header">
        <div>
          <h2 className="page-title">Danh sách trò chơi / hạng mục</h2>
          <p className="page-subtitle">
            Quản lý thông tin kỹ thuật, khu vực lắp đặt và chu kỳ kiểm tra của từng trò chơi.
          </p>
        </div>
        <button className="btn-primary">+ Thêm trò chơi</button>
      </section>

      <section className="card">
        <div className="table-toolbar">
          <input
            className="input"
            placeholder="Tìm theo tên trò chơi, mã thiết bị..."
          />
        </div>

        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Mã</th>
                <th>Tên trò chơi</th>
                <th>Khu vực</th>
                <th>Chu kỳ kiểm tra</th>
                <th>Trạng thái</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>COASTER-01</td>
                <td>Tàu lượn siêu tốc</td>
                <td>Khu trung tâm</td>
                <td>7 ngày</td>
                <td>
                  <span className="badge badge-success">Đang hoạt động</span>
                </td>
                <td>
                  <button className="btn-link">Chi tiết</button>
                </td>
              </tr>
              <tr>
                <td>SLIDE-TWR-02</td>
                <td>Tháp trượt nước 6 làn</td>
                <td>Khu hồ trung tâm</td>
                <td>14 ngày</td>
                <td>
                  <span className="badge badge-warning">Có hạng mục cần theo dõi</span>
                </td>
                <td>
                  <button className="btn-link">Chi tiết</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </MainLayout>
  )
}

export default PlaysPage


