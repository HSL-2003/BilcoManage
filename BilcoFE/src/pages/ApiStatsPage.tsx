import { useEffect, useState } from 'react'
import MainLayout from '../layouts/MainLayout'

interface ApiLog {
  id: string
  method: string
  url: string
  status: number
  duration: number
  timestamp: string
  error?: string
}

const ApiStatsPage = () => {
  const [logs, setLogs] = useState<ApiLog[]>([])
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    // Load logs from localStorage
    const savedLogs = localStorage.getItem('bilco_api_logs')
    if (savedLogs) {
      try {
        setLogs(JSON.parse(savedLogs).reverse()) // Show newest first
      } catch (e) {
        console.error('Failed to parse api logs', e)
      }
    }

    // Poll for updates (optional, or just refresh on mount)
    const interval = setInterval(() => {
        const current = localStorage.getItem('bilco_api_logs')
        if (current) {
             setLogs(JSON.parse(current).reverse())
        }
    }, 2000)

    return () => clearInterval(interval)
  }, [])

  const filteredLogs = logs.filter(log => 
    log.url.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.method.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.status.toString().includes(searchTerm)
  )

  const clearLogs = () => {
    localStorage.removeItem('bilco_api_logs')
    setLogs([])
  }

  const getStatusColor = (status: number) => {
    if (status >= 200 && status < 300) return 'green'
    if (status >= 400 && status < 500) return 'orange'
    if (status >= 500) return 'red'
    return 'gray'
  }

  return (
    <MainLayout>
      <div style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div style={{display: 'flex', alignItems: 'center', gap: '20px'}}>
             <h1 style={{ fontSize: '24px', fontWeight: 600, margin: 0 }}>Thống Kê API</h1>
             <input 
                type="text" 
                placeholder="Tìm endpoint, method..." 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className='admin-search-input'
                style={{width: '240px'}}
             />
          </div>
          <button 
            onClick={clearLogs}
            style={{ 
                padding: '8px 16px', 
                backgroundColor: '#d93025', 
                color: 'white', 
                border: 'none', 
                borderRadius: '4px',
                cursor: 'pointer' 
            }}
          >
            Xóa Lịch Sử
          </button>
        </div>

        <div className="admin-table-container">
          <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left', padding: '12px', borderBottom: '1px solid #ddd' }}>Thời gian</th>
                <th style={{ textAlign: 'left', padding: '12px', borderBottom: '1px solid #ddd' }}>Method</th>
                <th style={{ textAlign: 'left', padding: '12px', borderBottom: '1px solid #ddd' }}>Endpoint</th>
                <th style={{ textAlign: 'left', padding: '12px', borderBottom: '1px solid #ddd' }}>Status</th>
                <th style={{ textAlign: 'left', padding: '12px', borderBottom: '1px solid #ddd' }}>Duration (ms)</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.length === 0 ? (
                 <tr>
                    <td colSpan={5} style={{ padding: '24px', textAlign: 'center', color: '#666' }}>
                        {searchTerm ? 'Không tìm thấy kết quả.' : 'Chưa có dữ liệu nào được ghi nhận.'}
                    </td>
                 </tr>
              ) : (
                filteredLogs.map((log) => (
                    <tr key={log.id} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '12px' }}>{new Date(log.timestamp).toLocaleTimeString()}</td>
                    <td style={{ padding: '12px', fontWeight: 600 }}>{log.method}</td>
                    <td style={{ padding: '12px', fontFamily: 'monospace' }}>{log.url}</td>
                    <td style={{ padding: '12px' }}>
                        <span style={{ 
                            padding: '4px 8px', 
                            borderRadius: '12px', 
                            fontSize: '12px', 
                            backgroundColor: getStatusColor(log.status),
                            color: 'white',
                            fontWeight: 500
                        }}>
                            {log.status}
                        </span>
                    </td>
                    <td style={{ padding: '12px' }}>{log.duration.toFixed(0)}ms</td>
                    </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </MainLayout>
  )
}

export default ApiStatsPage
