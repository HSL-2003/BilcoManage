import { Navigate, Route, Routes } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import PlaysPage from './pages/PlaysPage'
import MaterialsPage from './pages/MaterialsPage'
import MaintenancePage from './pages/MaintenancePage'
import ReportsPage from './pages/ReportsPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import AdminDashboard from './pages/AdminDashboard'
import AdminIncidentsPage from './pages/AdminIncidentsPage'
import AdminEquipmentPage from './pages/AdminEquipmentPage'
import CompanyHomePage from './pages/CompanyHomePage'
import ProfilePage from './pages/ProfilePage'
import AdminInventoryPage from './pages/AdminInventoryPage'
import AdminWarehousesPage from './pages/AdminWarehousesPage'
import AdminMaterialsPage from './pages/AdminMaterialsPage'
import AdminSuppliersPage from './pages/AdminSuppliersPage'
import AdminMaterialTypesPage from './pages/AdminMaterialTypesPage'
import AdminUnitsPage from './pages/AdminUnitsPage'
import AdminMaintenancePlanningPage from './pages/AdminMaintenancePlanningPage'
import AdminPermissionsPage from './pages/AdminPermissionsPage'
import ApiStatsPage from './pages/ApiStatsPage'
import { useAuth } from './context/AuthContext'
import './App.css'

function App() {
  const { isAuthenticated, user } = useAuth()

  const isAdmin = user?.role === 'admin'

  return (
    <Routes>
      {/* Trang giới thiệu công ty (public) */}
      <Route path="/company" element={<CompanyHomePage />} />

      {/* Auth */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Khu người dùng (yêu cầu đăng nhập) */}
      <Route
        path="/"
        element={
          isAuthenticated ? (
            isAdmin ? <Navigate to="/admin" replace /> : <Dashboard />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route
        path="/plays"
        element={isAuthenticated ? <PlaysPage /> : <Navigate to="/login" replace />}
      />
      <Route
        path="/materials"
        element={isAuthenticated ? <MaterialsPage /> : <Navigate to="/login" replace />}
      />
      <Route
        path="/maintenance"
        element={isAuthenticated ? <MaintenancePage /> : <Navigate to="/login" replace />}
      />
      <Route
        path="/reports"
        element={isAuthenticated ? <ReportsPage /> : <Navigate to="/login" replace />}
      />
      <Route
        path="/profile"
        element={isAuthenticated ? <ProfilePage /> : <Navigate to="/login" replace />}
      />

      {/* Admin */}
      <Route
        path="/admin"
        element={
          isAuthenticated && isAdmin ? (
            <AdminDashboard />
          ) : (
            <Navigate to={isAuthenticated ? '/' : '/login'} replace />
          )
        }
      />
      
      <Route
        path="/admin/incidents"
        element={
          isAuthenticated && isAdmin ? (
            <AdminIncidentsPage />
          ) : (
             <Navigate to={isAuthenticated ? '/' : '/login'} replace />
          )
        }
      />

      <Route
        path="/admin/equipment"
        element={
          isAuthenticated && isAdmin ? (
            <AdminEquipmentPage />
          ) : (
             <Navigate to={isAuthenticated ? '/' : '/login'} replace />
          )
        }
      />

      <Route
        path="/admin/inventory"
        element={
          isAuthenticated && isAdmin ? (
            <AdminInventoryPage />
          ) : (
             <Navigate to={isAuthenticated ? '/' : '/login'} replace />
          )
        }
      />

      <Route
        path="/admin/warehouses"
        element={
          isAuthenticated && isAdmin ? (
            <AdminWarehousesPage />
          ) : (
             <Navigate to={isAuthenticated ? '/' : '/login'} replace />
          )
        }
      />
      <Route
        path="/admin/materials"
        element={
          isAuthenticated && isAdmin ? (
            <AdminMaterialsPage />
          ) : (
             <Navigate to={isAuthenticated ? '/' : '/login'} replace />
          )
        }
      />
      <Route
        path="/admin/suppliers"
        element={
          isAuthenticated && isAdmin ? (
            <AdminSuppliersPage />
          ) : (
             <Navigate to={isAuthenticated ? '/' : '/login'} replace />
          )
        }
      />
      <Route
        path="/admin/material-types"
        element={
          isAuthenticated && isAdmin ? (
            <AdminMaterialTypesPage />
          ) : (
             <Navigate to={isAuthenticated ? '/' : '/login'} replace />
          )
        }
      />
      <Route
        path="/admin/units"
        element={
          isAuthenticated && isAdmin ? (
            <AdminUnitsPage />
          ) : (
             <Navigate to={isAuthenticated ? '/' : '/login'} replace />
          )
        }
      />
       <Route
        path="/admin/api-stats"
        element={
          isAuthenticated && isAdmin ? (
            <ApiStatsPage />
          ) : (
             <Navigate to={isAuthenticated ? '/' : '/login'} replace />
          )
        }
      />
      <Route
        path="/admin/maintenance-plans"
        element={
          isAuthenticated && isAdmin ? (
            <AdminMaintenancePlanningPage />
          ) : (
             <Navigate to={isAuthenticated ? '/' : '/login'} replace />
          )
        }
      />
      <Route
        path="/admin/permissions"
        element={
          isAuthenticated && isAdmin ? (
            <AdminPermissionsPage />
          ) : (
             <Navigate to={isAuthenticated ? '/' : '/login'} replace />
          )
        }
      />
      
      {/* Mặc định */}
      <Route path="*" element={<Navigate to={isAuthenticated ? '/' : '/login'} replace />} />
    </Routes>
  )
}

export default App
