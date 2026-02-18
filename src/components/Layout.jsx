import { Link, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Store, ShoppingCart, LogOut, BarChart3 } from 'lucide-react'

export default function Layout() {
    const { signOut, profile } = useAuth()
    const location = useLocation()

    return (
        <div className="min-h-screen bg-gray-50 pb-20 md:pb-0 md:flex">
            {/* Mobile Header */}
            <div className="md:hidden bg-green-600 text-white p-4 flex justify-between items-center shadow-md">
                <h1 className="font-bold text-xl">MarketFlow</h1>
                <button onClick={signOut}><LogOut size={24} /></button>
            </div>

            {/* Desktop Sidebar */}
            <div className="hidden md:flex flex-col w-64 bg-green-700 text-white min-h-screen p-4">
                <h1 className="font-bold text-2xl mb-8">MarketFlow</h1>
                <div className="flex-1 space-y-4">
                    <NavLink to="/" icon={<ShoppingCart />} label="Punto de Venta" active={location.pathname === '/'} />
                    <NavLink to="/inventory" icon={<Store />} label="Inventario" active={location.pathname === '/inventory'} />
                    <NavLink to="/sales-dashboard" icon={<BarChart3 />} label="Panel de Ventas" active={location.pathname === '/sales-dashboard'} />
                </div>
                <div className="pt-4 border-t border-green-600">
                    <p className="text-sm mb-2">{profile?.nombre_negocio || 'Mi Negocio'}</p>
                    <button onClick={signOut} className="flex items-center gap-2 text-green-200 hover:text-white transition">
                        <LogOut size={20} /> Salir
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 p-4 md:p-8 overflow-y-auto">
                <Outlet />
            </div>

            {/* Mobile Bottom Nav */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t flex justify-around p-3 z-50">
                <MobileNavLink to="/" icon={<ShoppingCart />} label="Venta" active={location.pathname === '/'} />
                <MobileNavLink to="/inventory" icon={<Store />} label="Inventario" active={location.pathname === '/inventory'} />
                <MobileNavLink to="/sales-dashboard" icon={<BarChart3 />} label="Reportes" active={location.pathname === '/sales-dashboard'} />
            </div>
        </div>
    )
}

const NavLink = ({ to, icon, label, active }) => (
    <Link to={to} className={`flex items-center gap-3 p-3 rounded-lg transition ${active ? 'bg-green-800 text-white' : 'hover:bg-green-600 text-green-100'}`}>
        {icon}
        <span>{label}</span>
    </Link>
)

const MobileNavLink = ({ to, icon, label, active }) => (
    <Link to={to} className={`flex flex-col items-center gap-1 ${active ? 'text-green-600' : 'text-gray-500'}`}>
        {icon}
        <span className="text-xs">{label}</span>
    </Link>
)
