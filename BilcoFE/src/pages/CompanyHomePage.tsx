import { useState, useEffect } from 'react'
import './company.css'
import ChatWidget from '../components/ChatWidget'
import SpiderWebCursor from '../components/SpiderWebCursor'
import anhChopImg from '../images/anhchop.webp'
import phuongHangImg from '../images/phuonghang.webp'
import truongMyLanImg from '../images/images.webp'
import sharkBinhImg from '../images/sharkbinh.webp'

type InfoSectionKey = 'new' | 'investor' | 'technical'

const CompanyHomePage = () => {
  const [openInfo, setOpenInfo] = useState<InfoSectionKey | null>('new')

  const [scrollProgress, setScrollProgress] = useState(0)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('active')
          }
        })
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    )

    // Observe reveal elements
    const reveals = document.querySelectorAll('.reveal')
    reveals.forEach((el) => observer.observe(el))

    // Observe reveal-stagger elements
    const revealStaggers = document.querySelectorAll('.reveal-stagger')
    revealStaggers.forEach((el) => observer.observe(el))

    // Mouse Parallax for Blobs
    const handleMouseMove = (e: MouseEvent) => {
      const blobs = document.querySelectorAll('.company-blob') as NodeListOf<HTMLElement>
      const x = e.clientX / window.innerWidth
      const y = e.clientY / window.innerHeight

      blobs.forEach((blob, index) => {
        const speed = (index + 1) * 20 
        const xOffset = (0.5 - x) * speed
        const yOffset = (0.5 - y) * speed
        // Store mouse offset in css var to combine with scroll
        blob.style.setProperty('--mouse-x', `${xOffset}px`)
        blob.style.setProperty('--mouse-y', `${yOffset}px`)
      })
    }

    const handleScroll = () => {
      // Scroll Progress
      const totalScroll = document.documentElement.scrollTop
      const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight
      const scroll = `${totalScroll / windowHeight}`
      setScrollProgress(Number(scroll))

      // Scroll Parallax for Blobs
      const blobs = document.querySelectorAll('.company-blob') as NodeListOf<HTMLElement>
      blobs.forEach((blob, index) => {
        const speed = (index + 1) * 0.15
        const yPos = -(totalScroll * speed)
        blob.style.setProperty('--scroll-y', `${yPos}px`)
      })
      
      // Header transformation
      const header = document.querySelector('.company-header')
      if (header) {
        if (totalScroll > 50) {
          header.classList.add('scrolled')
        } else {
          header.classList.remove('scrolled')
        }
      }
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('scroll', handleScroll)

    return () => {
      observer.disconnect()
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  return (
    <div className="company-root">
      {/* Scroll Progress Bar */}
      <div 
        className="scroll-progress-bar" 
        style={{ transform: `scaleX(${scrollProgress})` }}
      />
      
      <header className="company-header">
        <div className="company-header-inner">
          <a href="/company" className="company-logo-link">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="40" height="40" rx="12" fill="url(#logo_grad)"/>
              <path d="M12 20C12 20 15 15 20 15C25 15 28 20 28 20" stroke="white" strokeWidth="3" strokeLinecap="round"/>
              <path d="M12 26C12 26 16 23 20 23C24 23 28 26 28 26" stroke="white" strokeWidth="3" strokeLinecap="round" strokeOpacity="0.6"/>
              <circle cx="28" cy="12" r="3" fill="#8AB4F8"/>
              <defs>
                <linearGradient id="logo_grad" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#1A73E8"/>
                  <stop offset="1" stopColor="#0D47A1"/>
                </linearGradient>
              </defs>
            </svg>
            <span className="company-logo-text">Bilco</span>
          </a>
          <nav className="company-nav">
            <a href="#services">Dịch vụ</a>
            <a href="#why-us">Giải pháp</a>
            <a href="#info">Khách hàng</a>
          </nav>
          <div className="company-header-actions">
            <a href="/login" className="company-header-link">
              Đăng nhập hệ thống
            </a>
          </div>
        </div>
      </header>

      <main className="company-main">
        <section className="company-hero">
          {/* Video Background */}
          <div className="company-hero-video-wrapper">
            <video 
              autoPlay={true}
              muted={true}
              loop={true}
              playsInline={true}
              preload="auto"
              className="company-hero-video"
            >
              <source src="/images/292827_small.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
            <div className="company-hero-overlay"></div>
          </div>
          
          <div className="company-blob blob-1"></div>
          <div className="company-blob blob-2"></div>
          
          <div className="company-hero-inner company-hero-grid">
            <div>
              <div className="company-badge">15 năm – Vươn tầm thế giới</div>
              <h1 className="company-title">
                Bilco – Giải pháp tổng thể cho{' '}
                <span className="company-title-highlight">
                  lắp đặt, bảo trì và thiết kế gia công trò chơi nước
                </span>
              </h1>
              <p className="company-subtitle">
                Từ các tổ hợp trượt nước quy mô lớn đến hệ thống tàu lượn và cáp treo, Bilco đồng hành cùng
                đối tác trong suốt vòng đời công trình: tư vấn, thiết kế, chế tạo, lắp đặt, vận hành và bảo
                trì an toàn.
              </p>

              <div className="company-hero-actions">
                <a href="#services" className="btn-primary">
                  Khám phá dịch vụ
                </a>
                <a href="#why-us" className="btn-secondary">
                  Vì sao chọn Bilco
                </a>
              </div>
            </div>
            <div className="company-hero-panel">
              <div className="company-hero-panel-inner">
                <p className="company-hero-panel-title">Con số nổi bật</p>
                <div className="company-hero-metrics">
                  <div className="metric">
                    <div className="metric-value">15+</div>
                    <div className="metric-label">Năm kinh nghiệm</div>
                  </div>
                  <div className="metric">
                    <div className="metric-value">100+</div>
                    <div className="metric-label">Dự án công viên nước</div>
                  </div>
                  <div className="metric">
                    <div className="metric-value">10+</div>
                    <div className="metric-label">Quốc gia & vùng lãnh thổ</div>
                  </div>
                </div>
                <p className="company-hero-panel-note">
                  Bilco đồng hành cùng chủ đầu tư từ bước ý tưởng đến vận hành dài hạn, đảm bảo an toàn và tối
                  ưu chi phí.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section id="services" className="company-section reveal">
          <h2 className="company-section-title">Lĩnh vực hoạt động</h2>
          <p className="company-section-subtitle">
            Hơn 15 năm kinh nghiệm triển khai các dự án quy mô lớn trong nhiều lĩnh vực kỹ thuật và công nghiệp.
          </p>
          <div className="company-grid reveal-stagger" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
            <article className="company-card">
              <h3 className="company-card-title">Nông nghiệp công nghệ cao</h3>
              <p className="company-card-body">
                Cung cấp giải pháp tưới tiêu tự động, hệ thống nhà màng thông minh và kiểm soát môi trường (IoT) giúp tối ưu năng suất và chất lượng nông sản.
              </p>
            </article>
            <article className="company-card">
              <h3 className="company-card-title">Lắp đặt thiết bị nhà máy</h3>
              <p className="company-card-body">
                Dịch vụ trọn gói từ tư vấn, thiết kế, gia công đến lắp đặt dây chuyền sản xuất, kết cấu thép và hệ thống cơ điện (M&E) cho nhà xưởng.
              </p>
            </article>
            <article className="company-card">
              <h3 className="company-card-title">Hệ thống thiết bị lưu chuyển</h3>
              <p className="company-card-body">
                 Thiết kế và chế tạo băng tải, hệ thống logistic nội bộ, cầu trục và các giải pháp tự động hóa giúp tối ưu dòng chảy nguyên vật liệu.
              </p>
            </article>
            <article className="company-card">
              <h3 className="company-card-title">Thiết bị khu giải trí</h3>
              <p className="company-card-body">
                Chuyên sâu về công viên nước, tàu lượn siêu tốc và các trò chơi cảm giác mạnh. Đảm bảo tiêu chuẩn an toàn quốc tế và trải nghiệm người dùng tuyệt vời.
              </p>
            </article>
          </div>
        </section>

        <section id="why-us" className="company-section company-section-alt reveal">
          <h2 className="company-section-title">Vì sao Bilco được tin chọn?</h2>
          <div className="company-grid company-grid-2">
            <div className="company-highlight-block">
              <h3>Chuẩn quốc tế – hiểu địa phương</h3>
              <p>
                Bilco kết hợp tiêu chuẩn thiết kế quốc tế với am hiểu điều kiện khí hậu, vật liệu và quy định
                an toàn tại Việt Nam và khu vực, giúp dự án vận hành bền vững lâu dài.
              </p>
            </div>
            <ul className="company-list">
              <li>
                <span className="company-list-title">Quy trình an toàn khép kín</span>
                <span className="company-list-text">
                  Từ thiết kế, tính toán tải trọng, lựa chọn vật liệu đến nghiệm thu và bảo trì đều có quy trình,
                  biểu mẫu và lịch sử truy vết rõ ràng.
                </span>
              </li>
              <li>
                <span className="company-list-title">Đội ngũ kỹ sư chuyên sâu</span>
                <span className="company-list-text">
                  Chuyên gia cơ khí, kết cấu, thủy lực, tự động hóa – đồng hành cùng chủ đầu tư trong từng giai đoạn.
                </span>
              </li>
              <li>
                <span className="company-list-title">Chuyển đổi số công tác bảo trì</span>
                <span className="company-list-text">
                  Hệ thống phần mềm quản lý vật liệu & bảo trì giúp theo dõi lịch kiểm tra, cảnh báo rủi ro và tối ưu chi
                  phí vận hành.
                </span>
              </li>
            </ul>
          </div>
        </section>

        <section id="info" className="company-section company-section-clients reveal">
          <div className="company-section-header-row">
            <div>
              <h2 className="company-section-title">Khách hàng tiêu biểu</h2>
              <p className="company-section-subtitle">
                Các lãnh đạo tin tưởng Bilco trong việc triển khai, vận hành và nâng cấp hệ thống trò chơi
                nước tại khu nghỉ dưỡng, công viên chủ đề và tổ hợp giải trí.
              </p>
            </div>
          </div>

          <div className="company-grid-4">
            <article className="company-client-card">
              <div className="company-client-photo-wrapper">
                <img src={anhChopImg} alt="Anh Chóp - Co-Founder Oppo" className="company-client-photo" />
                <div className="company-client-avatar company-client-avatar-1">ST</div>
              </div>
              <div className="company-client-meta">
                <p className="company-client-name">Anh Chóp - Co-Founder Oppo</p>
                <p className="company-client-role">CEO Nhảy Việc Gấp</p>
              </div>
              <p className="company-client-quote">
                “Bilco không chỉ bàn giao công trình đúng tiến độ mà còn xây dựng quy trình bảo trì rõ ràng,
                giúp chúng tôi yên tâm vận hành trong mùa cao điểm.”
              </p>
            </article>

            <article className="company-client-card">
              <div className="company-client-photo-wrapper">
                <img src={phuongHangImg} alt="Hằng Phương" className="company-client-photo" />
                <div className="company-client-avatar company-client-avatar-2">PH</div>
              </div>
              <div className="company-client-meta">
                <p className="company-client-name">Hằng Phương - Giám đốc vận hành công viên Đại Nam</p>
                <p className="company-client-role">Quản lý vận hành & an toàn</p>
              </div>
              <p className="company-client-quote">
                “Giải pháp quản lý vật liệu và lịch kiểm tra của Bilco giúp đội kỹ thuật nắm rõ tình trạng từng
                hạng mục, giảm thời gian dừng máy và tối ưu chi phí vật tư.”
              </p>
            </article>

            <article className="company-client-card">
              <div className="company-client-photo-wrapper">
                <img src={truongMyLanImg} alt="Trương Mỹ Lan" className="company-client-photo" />
                <div className="company-client-avatar company-client-avatar-3">ML</div>
              </div>
              <div className="company-client-meta">
                <p className="company-client-name">Lan Ngàn Tỏi - Tổng giám đốc tập đoàn Vạn Thịnh Phát</p>
                <p className="company-client-role">Doanh Nhân Và Nhà Đầu Tư</p>
              </div>
              <p className="company-client-quote">
                “Bilco là đối tác lâu dài của chúng tôi tại nhiều dự án trong và ngoài nước, luôn chủ động đề
                xuất các giải pháp thiết kế và vật liệu phù hợp từng thị trường.”
              </p>
            </article>

            <article className="company-client-card">
              <div className="company-client-photo-wrapper">
                <img src={sharkBinhImg} alt="Nguyễn Hòa Bình" className="company-client-photo" />
                <div className="company-client-avatar company-client-avatar-4">HB</div>
              </div>
              <div className="company-client-meta">
                <p className="company-client-name">Bình Đớp - Giám đốc Vận hành tập đoàn NextTech</p>
                <p className="company-client-role">Ngồi chơi xơi nước</p>
              </div>
              <p className="company-client-quote">
                “Từ khâu thiết kế đến gia công chế tạo, Bilco phối hợp chặt chẽ với đội kỹ thuật nội bộ, đảm
                bảo hệ thống đáp ứng yêu cầu an toàn nghiêm ngặt.”
              </p>
            </article>
          </div>
        </section>

        <section className="company-section company-section-projects reveal">
          <div className="company-section-header-row">
            <div>
              <h2 className="company-section-title">Dự án tiêu biểu</h2>
              <p className="company-section-subtitle">
                Hơn 100+ công trình công viên nước và khu vui chơi giải trí được Bilco thiết kế, lắp đặt và bảo trì trên toàn quốc
              </p>
            </div>
          </div>

          <div className="projects-grid">
            <div className="project-card">
              <div className="project-image-wrapper">
                <img 
                  src="https://media.mia.vn/uploads/blog-du-lich/cong-vien-nuoc-dam-sen-01-1692529264.jpg" 
                  alt="Công viên nước Đầm Sen" 
                  className="project-image"
                />
              </div>
              <div className="project-content">
                <h3 className="project-title">Công viên nước Đầm Sen</h3>
                <p className="project-location">TP. Hồ Chí Minh</p>
                <p className="project-description">
                  Hệ thống 12 trượt nước đa dạng, bể sóng nhân tạo 2,500m² và khu vực vui chơi trẻ em
                </p>
                <div className="project-stats">
                  <div className="project-stat">
                    <span className="stat-number">12</span>
                    <span className="stat-label">Trượt nước</span>
                  </div>
                  <div className="project-stat">
                    <span className="stat-number">2,500m²</span>
                    <span className="stat-label">Bể sóng</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="project-card">
              <div className="project-image-wrapper">
                <img 
                  src="https://motogo.vn/wp-content/uploads/2020/02/Untitled-1-jpg-1080x720-FIT-51fe706ed61e4eb75d260952d8346cdb.jpeg" 
                  alt="Khu du lịch Hồ Mây" 
                  className="project-image"
                />
              </div>
              <div className="project-content">
                <h3 className="project-title">Khu du lịch Hồ Mây</h3>
                <p className="project-location">Vũng Tàu</p>
                <p className="project-description">
                  Cáp treo ngắm cảnh 1.2km, hệ thống trượt nước tốc độ cao và khu vực thể thao nước
                </p>
                <div className="project-stats">
                  <div className="project-stat">
                    <span className="stat-number">1.2km</span>
                    <span className="stat-label">Cáp treo</span>
                  </div>
                  <div className="project-stat">
                    <span className="stat-number">8</span>
                    <span className="stat-label">Trò chơi</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="project-card">
              <div className="project-image-wrapper">
                 <img 
                  src="https://th.bing.com/th/id/R.cf7e2c675296459c5ee66245a5979280?rik=Ng%2bKstlUF%2fYfIg&pid=ImgRaw&r=0" 
                  alt="Sun World Hạ Long Park" 
                  className="project-image"
                />
              </div>
              <div className="project-content">
                <h3 className="project-title">Sun World Hạ Long Park</h3>
                <p className="project-location">Quảng Ninh</p>
                <p className="project-description">
                  Tổ hợp giải trí với hệ thống trượt nước hiện đại, bể bơi vô cực và khu vực thư giãn cao cấp
                </p>
                <div className="project-stats">
                  <div className="project-stat">
                    <span className="stat-number">15</span>
                    <span className="stat-label">Trò chơi</span>
                  </div>
                  <div className="project-stat">
                    <span className="stat-number">3,000m²</span>
                    <span className="stat-label">Diện tích</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="company-section company-section-alt reveal">
          <h2 className="company-section-title">Quy trình triển khai tiêu chuẩn</h2>
          <p className="company-section-subtitle">
            Để đảm bảo chất lượng và tiến độ, Bilco áp dụng quy trình làm việc khép kín và chuyên nghiệp qua 4 bước.
          </p>
          <div className="company-process-grid">
            <div className="process-step">
              <div className="process-number">01</div>
              <h3 className="process-title">Khảo sát & Tư vấn</h3>
              <p className="process-desc">
                Đánh giá hiện trạng, nhu cầu và đề xuất giải pháp kỹ thuật, vật liệu phù hợp nhất với ngân sách.
              </p>
            </div>
            <div className="process-step">
              <div className="process-number">02</div>
              <h3 className="process-title">Thiết kế & Dự toán</h3>
              <p className="process-desc">
                Lên bản vẽ chi tiết 2D/3D, tính toán kết cấu chịu lực và lập bảng dự toán chi phí minh bạch.
              </p>
            </div>
            <div className="process-step">
              <div className="process-number">03</div>
              <h3 className="process-title">Gia công & Lắp đặt</h3>
              <p className="process-desc">
                Sản xuất tại xưởng với máy móc hiện đại, vận chuyển và lắp đặt bởi đội ngũ kỹ sư lành nghề.
              </p>
            </div>
            <div className="process-step">
              <div className="process-number">04</div>
              <h3 className="process-title">Bảo trì & Chăm sóc</h3>
              <p className="process-desc">
                Bàn giao hướng dẫn vận hành, thực hiện bảo trì định kỳ và hỗ trợ kỹ thuật 24/7.
              </p>
            </div>
          </div>
        </section>

        <section className="company-section reveal">
          <h2 className="company-section-title">Thông tin dành cho bạn</h2>
          <p className="company-section-subtitle">
            Tùy vào vai trò của mình, khách hàng có thể quan tâm tới những nội dung khác nhau. Hãy chọn mục
            phù hợp để xem chi tiết.
          </p>

          <div className="company-info-accordion">
            <button
              type="button"
              className={`company-info-item ${openInfo === 'new' ? 'company-info-item-open' : ''}`}
              onClick={() => setOpenInfo(openInfo === 'new' ? null : 'new')}
            >
              <div className="company-info-header">
                <span className="company-info-title">Khách hàng mới / Chủ đầu tư</span>
                <span className="company-info-toggle">{openInfo === 'new' ? '−' : '+'}</span>
              </div>
              {openInfo === 'new' && (
                <div className="company-info-body">
                  <p>
                    Bạn đang lập kế hoạch cho công viên nước, khu nghỉ dưỡng hay mở rộng hạng mục trò chơi? Bilco
                    hỗ trợ từ giai đoạn ý tưởng, dự toán đến thiết kế kỹ thuật và triển khai.
                  </p>
                </div>
              )}
            </button>

            <button
              type="button"
              className={`company-info-item ${openInfo === 'investor' ? 'company-info-item-open' : ''}`}
              onClick={() => setOpenInfo(openInfo === 'investor' ? null : 'investor')}
            >
              <div className="company-info-header">
                <span className="company-info-title">Ban quản lý & vận hành hiện hữu</span>
                <span className="company-info-toggle">{openInfo === 'investor' ? '−' : '+'}</span>
              </div>
              {openInfo === 'investor' && (
                <div className="company-info-body">
                  <p>
                    Tập trung vào an toàn, tối ưu chi phí bảo trì và giảm thời gian dừng máy. Giải pháp phần mềm và
                    dịch vụ kiểm tra định kỳ của Bilco giúp bạn kiểm soát vật tư, lịch kiểm tra và cảnh báo rủi ro.
                  </p>
                </div>
              )}
            </button>

            <button
              type="button"
              className={`company-info-item ${openInfo === 'technical' ? 'company-info-item-open' : ''}`}
              onClick={() => setOpenInfo(openInfo === 'technical' ? null : 'technical')}
            >
              <div className="company-info-header">
                <span className="company-info-title">Đối tác kỹ thuật & nhà cung cấp</span>
                <span className="company-info-toggle">{openInfo === 'technical' ? '−' : '+'}</span>
              </div>
              {openInfo === 'technical' && (
                <div className="company-info-body">
                  <p>
                    Bilco luôn tìm kiếm đối tác về vật liệu, thiết bị và giải pháp tự động hóa để cùng phát triển
                    sản phẩm mới, mở rộng thị trường trong và ngoài nước.
                  </p>
                </div>
              )}
            </button>
          </div>
        </section>

        <section className="company-cta reveal">
          <div className="company-cta-content">
            <h2 className="company-cta-title">Sẵn sàng nâng tầm dự án của bạn?</h2>
            <p className="company-cta-desc">
              Liên hệ ngay với đội ngũ chuyên gia của Bilco để nhận tư vấn giải pháp tối ưu nhất.
            </p>
            <div className="company-cta-actions">
              <a href="#contact" className="btn-primary-white">Liên hệ ngay</a>
              <a href="/register" className="btn-outline-white">Đăng ký đối tác</a>
            </div>
          </div>
        </section>
      </main>

      <footer id="contact" className="company-footer">
        <div className="footer-grid">
          <div className="footer-brand">
             <h3>Công ty cổ phần Bilco</h3>
             <p className="footer-desc">
               Các dịch vụ của BILCO được dựa trên hơn 15 năm kinh nghiệm giúp đỡ khách hàng và đối tác trong kinh doanh và quản lý doanh nghiệp.
             </p>
          </div>
          <div className="footer-contact">
             <h4>Liên hệ</h4>
             <div className="footer-item">
               <span className="footer-icon">📍</span>
               <span>Số M1-25, KĐT Vinhomes Grand Park, đường Phước Thiện,<br/>phường Long Bình, Thành phố Thủ Đức, Thành phố Hồ Chí Minh, Việt Nam</span>
             </div>
             <div className="footer-item">
               <span className="footer-icon">📞</span>
               <span>0283 9112 229</span>
             </div>
             <div className="footer-item">
               <span className="footer-icon">✉️</span>
               <span>info@bilco.com.vn</span>
             </div>
          </div>
        </div>
        <p className="footer-copy">© {new Date().getFullYear()} Bilco. All rights reserved.</p>
      </footer>
      <ChatWidget />
      <SpiderWebCursor />
    </div>
  )
}

export default CompanyHomePage
