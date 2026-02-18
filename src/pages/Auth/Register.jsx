import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function Register() {
    const [formData, setFormData] = useState({
        nombreNegocio: '',
        telefono: '',
        email: '',
        password: ''
    })
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const { signUp } = useAuth()
    const navigate = useNavigate()

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value })

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        try {
            await signUp({
                email: formData.email,
                password: formData.password,
                nombreNegocio: formData.nombreNegocio,
                telefono: formData.telefono
            })
            navigate('/')
        } catch (error) {
            console.error('Registration error:', error)
            setError(error.response?.data?.message || 'Error al registrarse')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
            <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border-t-4 border-green-500">
                <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">Crear Cuenta</h2>
                {error && <div className="bg-red-100 text-red-600 p-3 rounded-lg mb-4 text-sm">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Negocio</label>
                        <input
                            name="nombreNegocio"
                            required
                            className="w-full px-4 py-2 border rounded-lg focus:ring-green-500 focus:border-green-500 outline-none transition"
                            value={formData.nombreNegocio}
                            onChange={handleChange}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono (WhatsApp)</label>
                        <input
                            name="telefono"
                            type="tel"
                            required
                            placeholder="Ej: 5212345678"
                            className="w-full px-4 py-2 border rounded-lg focus:ring-green-500 focus:border-green-500 outline-none transition"
                            value={formData.telefono}
                            onChange={handleChange}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input
                            name="email"
                            type="email"
                            required
                            className="w-full px-4 py-2 border rounded-lg focus:ring-green-500 focus:border-green-500 outline-none transition"
                            value={formData.email}
                            onChange={handleChange}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
                        <input
                            name="password"
                            type="password"
                            required
                            className="w-full px-4 py-2 border rounded-lg focus:ring-green-500 focus:border-green-500 outline-none transition"
                            value={formData.password}
                            onChange={handleChange}
                        />
                    </div>
                    <button
                        disabled={loading}
                        className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50"
                    >
                        {loading ? 'Registrando...' : 'Registrar'}
                    </button>
                </form>

                <div className="mt-6 text-center text-sm text-gray-600">
                    ¿Ya tienes cuenta? <Link to="/login" className="text-green-600 hover:underline font-medium">Inicia Sesión</Link>
                </div>
            </div>
        </div>
    )
}
