import { createContext, useContext, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiPost } from '../api/client'

type User = {
  id: string
  username: string
  role: 'user' | 'admin'
  maNV?: string // Employee number - needed for API calls
  hoTen?: string
  email?: string
  soDienThoai?: string
  phongBan?: string
  chucVu?: string
}

type LoginRequest = {
  tenDangNhap: string
  matKhau: string
}

type LoginResponse = {
  token: string
  refreshToken?: string
  expiration?: string
  maND?: number
  maNV?: string // Employee number from backend
  tenDangNhap?: string
  maQuyen?: number | string
  hoTen?: string
  email?: string
  soDienThoai?: string
  phongBan?: string
  chucVu?: string
  user?: {
    id: string
    username: string
    role?: string
    maNV?: string
    hoTen?: string
    email?: string
    phone?: string
    department?: string
    position?: string
  }
}

type AuthContextValue = {
  user: User | null
  isAuthenticated: boolean
  login: (username: string, password: string) => Promise<void>
  register: (username: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

type AuthProviderProps = {
  children: ReactNode
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(() => {
    if (typeof window === 'undefined') return null
    const storedUser = window.localStorage.getItem('auth_user')
    if (!storedUser) return null
    try {
      return JSON.parse(storedUser) as User
    } catch {
      window.localStorage.removeItem('auth_user')
      return null
    }
  })
  const navigate = useNavigate()

  const login = async (username: string, password: string) => {
    try {
      const result = await apiPost<LoginRequest, LoginResponse>('/api/Auth/login', {
        tenDangNhap: username,
        matKhau: password,
      })

      const roleValue = result.user?.role ?? result.maQuyen
      const normalizedRole: User['role'] =
        roleValue === 'admin' || roleValue === 'user'
          ? roleValue
          : typeof roleValue === 'number'
            ? (roleValue === 1 ? 'admin' : 'user')
            : 'user'

      const normalizedUser: User = {
        id: result.user?.id ?? result.maND?.toString() ?? username,
        username: result.user?.username ?? result.tenDangNhap ?? username,
        role: normalizedRole,
        maNV: result.maNV ?? result.user?.maNV ?? result.maND?.toString(), // Save employee number
        // Map additional fields from response or nested user object
        hoTen: result.hoTen ?? result.user?.hoTen ?? '',
        email: result.email ?? result.user?.email ?? '',
        soDienThoai: result.soDienThoai ?? result.user?.phone ?? '',
        phongBan: result.phongBan ?? result.user?.department ?? '',
        chucVu: result.chucVu ?? result.user?.position ?? '',
      }

      setUser(normalizedUser)
      window.localStorage.setItem('auth_user', JSON.stringify(normalizedUser))
      window.localStorage.setItem('auth_token', result.token)
      navigate('/')
    } catch (error) {
      // Với skeleton này, chỉ log ra console, bạn có thể nối vào UI thông báo lỗi sau
      console.error('Login failed', error)
      throw error
    }
  }

  const register = async (username: string, password: string) => {
    try {
      // Backend handles maNV (auto-inc) and maQuyen (nullable). 
      // Email/phone fields are required by validation, so we send placeholders.
      await apiPost('/api/Auth/register', {
        tenDangNhap: username,
        matKhau: password,
        maQuyen: null,
        email: `${username}@bilco.local`,
        soDienThoai: '0000000000',
        phongBan: 'Chưa cập nhật',
        chucVu: 'Nhân viên mới',
      })
      
      // Removed auto-login because new accounts need Admin approval.
      // Trying to login immediately would fail, causing the FE to report an error 
      // even though registration succeeded.
    } catch (error) {
      console.error('Register failed', error)
      throw error
    }
  }

  const logout = () => {
    setUser(null)
    window.localStorage.removeItem('auth_user')
    window.localStorage.removeItem('auth_token')
    navigate('/login')
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return ctx
}


