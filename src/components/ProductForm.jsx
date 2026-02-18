import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import api from '../lib/api'

export default function ProductForm({ product, onClose, onSave }) {
    const [formData, setFormData] = useState({
        nombre: '',
        precio: '',
        stock: '',
        categoria: ''
    })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    useEffect(() => {
        if (product) {
            setFormData({
                nombre: product.nombre,
                precio: product.precio,
                stock: product.stock,
                categoria: product.categoria || ''
            })
        }
    }, [product])

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        const productData = {
            nombre: formData.nombre,
            precio: parseFloat(formData.precio),
            stock: parseInt(formData.stock),
            categoria: formData.categoria
        }

        try {
            if (product) {
                // Edit
                await api.put(`/products/${product.id}`, productData)
            } else {
                // Create
                await api.post('/products', productData)
            }
            onSave()
            onClose()
        } catch (error) {
            console.error('Error saving product:', error)
            setError(error.response?.data?.message || 'Error al guardar producto')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
                <div className="bg-green-600 p-4 flex justify-between items-center text-white">
                    <h3 className="font-bold text-lg">{product ? 'Editar Producto' : 'Nuevo Producto'}</h3>
                    <button onClick={onClose}><X /></button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {error && <div className="text-red-500 text-sm bg-red-50 p-2 rounded">{error}</div>}

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Nombre</label>
                        <input
                            required
                            className="w-full border rounded p-2 focus:ring-green-500 outline-none"
                            value={formData.nombre}
                            onChange={e => setFormData({ ...formData, nombre: e.target.value })}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Precio</label>
                            <input
                                type="number" step="0.01"
                                required
                                className="w-full border rounded p-2 focus:ring-green-500 outline-none"
                                value={formData.precio}
                                onChange={e => setFormData({ ...formData, precio: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Stock</label>
                            <input
                                type="number"
                                required
                                className="w-full border rounded p-2 focus:ring-green-500 outline-none"
                                value={formData.stock}
                                onChange={e => setFormData({ ...formData, stock: e.target.value })}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Categoría</label>
                        <input
                            className="w-full border rounded p-2 focus:ring-green-500 outline-none"
                            value={formData.categoria}
                            onChange={e => setFormData({ ...formData, categoria: e.target.value })}
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">Cancelar</button>
                        <button disabled={loading} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 font-medium">
                            {loading ? 'Guardando...' : 'Guardar'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
