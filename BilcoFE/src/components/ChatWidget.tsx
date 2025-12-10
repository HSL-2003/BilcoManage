import { useState, useRef, useEffect } from 'react'
import './ChatWidget.css'

type Message = {
  id: string
  text: string
  sender: 'ai' | 'user'
  timestamp: number
}

// Helper to remove accents for better matching
const normalizeText = (str: string) => {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
}

const BILCO_KNOWLEDGE_BASE = [
  {
    keywords: ['chào', 'hello', 'hi', 'xin chào', 'ola', 'alo'],
    answer: 'Chào bạn! Mình là trợ lý ảo AI của Bilco. Mình có thể giúp gì cho bạn về các giải pháp kỹ thuật, hợp tác kinh doanh hay thông tin dự án?'
  },
  {
    keywords: ['đối tác', 'hợp tác', 'đăng ký', 'nhà thầu', 'đại lý'],
    answer: 'Bilco luôn hoan nghênh sự hợp tác từ các đối tác. Chúng tôi đang tìm kiếm:\n- Nhà cung cấp vật liệu xây dựng, cơ khí.\n- Đội thi công lắp đặt chuyên nghiệp.\n- Chủ đầu tư các dự án khu vui chơi, nhà máy.\n\nBạn có thể nhấn nút "Đăng ký đối tác" trên website hoặc để lại SĐT tại đây để bộ phận đối tác liên hệ lại ngay!'
  },
  {
    keywords: ['liên hệ', 'sđt', 'số điện thoại', 'gọi', 'email', 'địa chỉ', 'văn phòng', 'ở đâu'],
    answer: 'Thông tin liên hệ chính thức của Bilco:\n📍 Địa chỉ: Số M1-25, KĐT Vinhomes Grand Park, Thủ Đức, TP.HCM.\n📞 Hotline: 0283 9112 229\n📧 Email: info@bilco.com.vn\nChúng tôi làm việc từ Thứ 2 - Thứ 7 (8:00 - 17:30).'
  },
  {
    keywords: ['giá', 'chi phí', 'báo giá', 'bao nhiêu', 'tiền', 'mắc không', 'rẻ không'],
    answer: 'Chi phí dự án phụ thuộc vào quy mô và yêu cầu kỹ thuật.\n- Với Nông nghiệp cao: tính theo m2 và công nghệ áp dụng.\n- Với Công viên nước: tùy thuộc số lượng trò chơi và diện tích.\nĐể có báo giá chính xác, bạn vui lòng để lại SĐT, kỹ sư của Bilco sẽ gọi tư vấn miễn phí trong 30 phút!'
  },
  {
    keywords: ['nông nghiệp', 'tưới', 'nhà màng', 'trồng trọt', 'farm'],
    answer: 'Về Nông nghiệp công nghệ cao, Bilco cung cấp:\n1. Hệ thống nhà màng thông minh chịu bão.\n2. Hệ thống tưới nhỏ giọt tự động (công nghệ Israel).\n3. IoT giám sát nhiệt độ, độ ẩm qua điện thoại.\nBạn đang có dự định trồng cây gì và diện tích khoảng bao nhiêu?'
  },
  {
    keywords: ['công viên', 'trò chơi', 'tàu lượn', 'nước', 'giải trí', 'bể bơi', 'hồ bơi'],
    answer: 'Bilco là đơn vị hàng đầu về thiết bị khu giải trí:\n- Thiết kế, thi công công viên nước trọn gói.\n- Cung cấp, bảo trì tàu lượn siêu tốc, máng trượt.\n- Đảm bảo tiêu chuẩn an toàn quốc tế (ASTM/EN).\nBạn quan tâm đến hạng mục nào?'
  },
  {
    keywords: ['nhà máy', 'công nghiệp', 'băng tải', 'dây chuyền', 'lắp đặt', 'cơ khí'],
    answer: 'Trong lĩnh vực Công nghiệp, chúng tôi chuyên:\n- Lắp đặt dây chuyền sản xuất, kết cấu thép.\n- Hệ thống băng tải, cầu trục, logistic nội bộ.\n- Hệ thống cơ điện (M&E) nhà xưởng.\nChúng tôi đã thực hiện hơn 50 dự án nhà máy lớn tại Việt Nam.'
  },
  {
    keywords: ['bảo hành', 'bảo trì', 'hỏng', 'sửa', 'kỹ thuật', 'sự cố'],
    answer: 'Dịch vụ kỹ thuật là thế mạnh của Bilco. Chúng tôi cam kết:\n- Bảo trì định kỳ hàng tháng/quý.\n- Có mặt xử lý sự cố trong 24h.\n- Phần mềm quản lý lịch bảo trì online giúp bạn theo dõi dễ dàng.'
  },
  {
    keywords: ['tuyển dụng', 'việc làm', 'nhân viên', 'lương', 'apply'],
    answer: 'Hiện tại Bilco đang tuyển dụng các vị trí Kỹ sư cơ khí và Nhân viên kinh doanh dự án. Bạn vui lòng gửi CV về email: hr@bilco.com.vn nhé.'
  },
  {
    keywords: ['ai', 'bot', 'bạn là ai', 'tên gì', 'người máy', 'gì'],
    answer: 'Mình là trợ lý ảo được phát triển bởi Em Sơn Học Giỏi. Mình được học để trả lời nhanh các câu hỏi về dịch vụ và chính sách của công ty. Tuy nhiên mình vẫn đang học hỏi thêm mỗi ngày! 🤖'
  },
  {
    keywords: ['dm', 'đm', 'vcl', 'đéo', 'cút', 'ngu', 'chó', 'điên', 'cặc', 'địt', 'cứt', 'lồn'],
    answer: 'mày đùa tao đấy à, mày biết bố mày là ai không con lợn'
  },
  {
    keywords: ['cảm ơn', 'ok', 'thank', 'tạm biệt'],
    answer: 'Cảm ơn bạn đã quan tâm! Chúc bạn một ngày làm việc hiệu quả. Nếu cần thêm thông tin cứ nhắn mình nhé! 👋'
  }
]

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      text: 'Chào bạn! 👋 Mình có thể giúp gì cho bạn về các cơ hội hợp tác với Bilco?',
      sender: 'ai',
      timestamp: Date.now()
    }
  ])
  const [inputVal, setInputVal] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isOpen, isTyping])

  const findAnswer = (query: string): string => {
    const cleanQuery = normalizeText(query)
    
    // Check specific keywords
    for (const item of BILCO_KNOWLEDGE_BASE) {
      // Check if ANY keyword matches the normalized query
      if (item.keywords.some(k => cleanQuery.includes(normalizeText(k)))) {
        return item.answer
      }
    }
    
    // Fallback logic
    if (cleanQuery.length < 5) {
      return 'Bạn có thể nói rõ hơn một chút được không ạ?'
    }

    return 'Xin lỗi, mình chưa tìm thấy thông tin chính xác cho câu hỏi này trong cơ sở dữ liệu. Bạn có thể hỏi về các chủ đề như: "Báo giá", "Đối tác", "Nông nghiệp", "Công viên nước" hoặc "Liên hệ" được không?'
  }

  const handleSend = async () => {
    if (!inputVal.trim()) return

    const userMsg: Message = {
      id: Date.now().toString(),
      text: inputVal,
      sender: 'user',
      timestamp: Date.now()
    }

    setMessages(prev => [...prev, userMsg])
    setInputVal('')
    setIsTyping(true)

    // Simulate AI thinking delay based on query length (smarter feel)
    const delay = 600 + Math.random() * 800

    setTimeout(() => {
      const answer = findAnswer(userMsg.text)
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: answer,
        sender: 'ai',
        timestamp: Date.now()
      }
      setMessages(prev => [...prev, aiMsg])
      setIsTyping(false)
    }, delay)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSend()
  }

  return (
    <div className="chat-widget-wrapper">
      {!isOpen && (
        <button className="chat-launcher" onClick={() => setIsOpen(true)}>
          <span className="chat-launcher-icon">💬</span>
          <span className="chat-launcher-label">Hỗ trợ đối tác</span>
        </button>
      )}

      {isOpen && (
        <div className="chat-window animate-pop-in">
          <div className="chat-header">
            <div className="chat-header-info">
              <div className="chat-avatar-ai">B</div>
              <div>
                <h4 className="chat-title">Bilco AI Support</h4>
                <p className="chat-status">🟢 Trả lời ngay lập tức</p>
              </div>
            </div>
            <button className="chat-close" onClick={() => setIsOpen(false)}>×</button>
          </div>

          <div className="chat-body">
            {messages.map(msg => (
              <div key={msg.id} className={`chat-message ${msg.sender}`}>
                <div className="message-content">{msg.text}</div>
              </div>
            ))}
            {isTyping && (
              <div className="chat-message ai">
                <div className="message-content typing-indicator">
                  <span>•</span><span>•</span><span>•</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="chat-footer">
            <input
              className="chat-input"
              value={inputVal}
              onChange={e => setInputVal(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Nhập câu hỏi... (VD: Báo giá, Đối tác)"
              autoFocus
            />
            <button className="chat-send" onClick={handleSend} disabled={!inputVal.trim()}>
              ➤
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default ChatWidget
