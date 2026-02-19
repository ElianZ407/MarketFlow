import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import Login from './pages/Auth/Login'
import Register from './pages/Auth/Register'
import POS from './pages/POS/POS'
import ProductList from './pages/Inventory/ProductList'
import Layout from './components/Layout'
import Ticket from './components/Ticket'


import SalesDashboard from './pages/SalesDashboard'

function App() {
  return (
    <Router>
      <AuthProvider>
        <CartProvider> {/* Added CartProvider */}
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            <Route element={<ProtectedRoute />}>
              <Route element={<Layout />}>
                <Route path="/" element={<POS />} />
                <Route path="/inventory" element={<ProductList />} />
                <Route path="/sales-dashboard" element={<SalesDashboard />} />
                <Route path="/ticket-preview" element={
                  <div className="min-h-screen bg-gray-200 flex items-center justify-center p-4">
                    <Ticket />
                  </div>
                } />
              </Route>
            </Route>

            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </CartProvider> {/* Closed CartProvider */}
      </AuthProvider>
    </Router>
  )
}

export default App
