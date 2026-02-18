import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { ShoppingBag } from 'lucide-react'

export default function Login() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const { signIn } = useAuth()
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError('')
         
        try {
            await signIn({ email, password })
            navigate('/')
        } catch (error) {
            console.error('Login error:', error)
            setError(error.response?.data?.message || 'Error al iniciar sesión')
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
            <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
                <div className="flex justify-center mb-6 text-green-600">
                    <ShoppingBag size={48} />
                </div>
                <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">Iniciar Sesión</h2>
                {error && <div className="bg-red-100 text-red-600 p-3 rounded-lg mb-4 text-sm">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input
                            type="email"
                            required
                            className="w-full px-4 py-2 border rounded-lg focus:ring-green-500 focus:border-green-500 outline-none transition"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
                        <input
                            type="password"
                            required
                            className="w-full px-4 py-2 border rounded-lg focus:ring-green-500 focus:border-green-500 outline-none transition"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    <button
                        disabled={loading}
                        className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50"
                    >
                        {loading ? 'Entrando...' : 'Ingresar'}
                    </button>
                </form>

                <div className="mt-6 text-center text-sm text-gray-600">
                    ¿No tienes cuenta? <Link to="/register" className="text-green-600 hover:underline font-medium">Regístrate</Link>
                </div>
            </div>
        </div>
    )
}
