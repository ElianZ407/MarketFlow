import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Search } from 'lucide-react'
import api from '../../lib/api'
import { useAuth } from '../../context/AuthContext'
import ProductForm from '../../components/ProductForm'

export default function ProductList() {
    const { user } = useAuth()
    const [products, setProducts] = useState([])
    const [loading, setLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const [editingProduct, setEditingProduct] = useState(null)
    const [searchTerm, setSearchTerm] = useState('')

    useEffect(() => {
        if (user) fetchProducts()
    }, [user])

    const fetchProducts = async () => {
        try {
            const { data } = await api.get('/products')
            setProducts(data)
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (id) => {
        if (!confirm('¿Estás seguro de eliminar este producto?')) return

        try {
            await api.delete(`/products/${id}`)
            fetchProducts()
        } catch (error) {
            console.error('Error deleting product', error)
        }
    }

    const handleEdit = (product) => {
        setEditingProduct(product)
        setShowModal(true)
    }

    const filteredProducts = products.filter(p =>
        p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.categoria?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Inventario</h2>
                <button
                    onClick={() => { setEditingProduct(null); setShowModal(true) }}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-700 shadow-sm"
                >
                    <Plus size={20} /> <span className="hidden sm:inline">Nuevo Producto</span>
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border p-4 mb-6">
                <div className="flex items-center gap-2 border rounded-lg px-3 py-2">
                    <Search className="text-gray-400" size={20} />
                    <input
                        placeholder="Buscar productos..."
                        className="flex-1 outline-none text-gray-700"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {loading ? (
                <div className="text-center py-10">Cargando...</div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {filteredProducts.map(product => (
                        <div key={product.id} className="bg-white p-4 rounded-xl shadow-sm border hover:shadow-md transition">
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="font-bold text-gray-800 truncate pr-2">{product.nombre}</h3>
                                <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">{product.categoria || 'General'}</span>
                            </div>
                            <div className="text-2xl font-bold text-green-600 mb-2">${product.precio}</div>
                            <div className="flex justify-between items-center text-sm text-gray-500 mb-4">
                                <span>Stock: {product.stock}</span>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleEdit(product)}
                                    className="flex-1 flex items-center justify-center gap-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 rounded-lg transition"
                                >
                                    <Edit size={16} /> Editar
                                </button>
                                <button
                                    onClick={() => handleDelete(product.id)}
                                    className="flex-none bg-red-50 hover:bg-red-100 text-red-600 p-2 rounded-lg transition"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showModal && (
                <ProductForm
                    product={editingProduct}
                    onClose={() => setShowModal(false)}
                    onSave={fetchProducts}
                />
            )}
        </div>
    )
}
