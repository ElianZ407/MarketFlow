import { useState, useEffect } from 'react'
import { Search, ShoppingCart, Plus, Minus, Trash2 } from 'lucide-react'
import api from '../../lib/api'
import { useAuth } from '../../context/AuthContext'
import { useCart } from '../../context/CartContext'

export default function POS() {
    const { user, profile } = useAuth()
    const { cart, total, addToCart, removeFromCart, updateQuantity, clearCart } = useCart()
    const [products, setProducts] = useState([])
    const [searchTerm, setSearchTerm] = useState('')
    const [loading, setLoading] = useState(false)
    const [processing, setProcessing] = useState(false)

    useEffect(() => {
        if (user) fetchProducts()
    }, [user])

    const fetchProducts = async () => {
        try {
            const { data } = await api.get('/products')
            // Only show products with stock
            setProducts(data.filter(p => p.stock > 0))
        } catch (error) {
            console.error('Error fetching products:', error)
        }
    }

    const handleCheckout = async () => {
        if (cart.length === 0) return
        setProcessing(true)

        try {
            const saleData = {
                total: total,
                metodo_pago: 'Efectivo', // Default for now
                tel_cliente: '0000000000', // Default
                details: cart.map(item => ({
                    producto_id: item.id,
                    cantidad: item.quantity,
                    precio_unitario: item.price
                }))
            }

            await api.post('/sales', saleData)

            // WhatsApp Receipt
            const message = `¡Gracias por tu compra en *${profile?.nombre_negocio || 'MarketFlow'}*!%0A%0A` +
                `*Resumen de compra:*%0A` +
                cart.map(item => `- ${item.nombre} x${item.quantity} ($${(item.price * item.quantity).toFixed(2)})`).join('%0A') +
                `%0A%0A*Total: $${total.toFixed(2)}*`

            window.open(`https://wa.me/?text=${message}`, '_blank')

            clearCart()
            fetchProducts() // Refresh stock

        } catch (error) {
            console.error('Checkout error:', error)
            alert('Error al procesar la venta. Intente nuevamente.')
        } finally {
            setProcessing(false)
        }
    }

    const filteredProducts = products.filter(p =>
        p.nombre.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div className="flex flex-col md:flex-row gap-6 h-[calc(100vh-100px)]">
            {/* Left: Product Grid */}
            <div className="flex-1 flex flex-col overflow-hidden">
                <div className="bg-white p-4 rounded-xl shadow-sm border mb-4">
                    <div className="flex items-center gap-2 border rounded-lg px-3 py-2 bg-gray-50">
                        <Search className="text-gray-400" size={20} />
                        <input
                            placeholder="Buscar producto a vender..."
                            className="flex-1 outline-none bg-transparent"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            autoFocus
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto pr-2">
                    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {filteredProducts.map(product => (
                            <div
                                key={product.id}
                                onClick={() => addToCart(product)}
                                className="bg-white p-4 rounded-xl shadow-sm border cursor-pointer hover:border-green-500 hover:shadow-md transition group"
                            >
                                <h3 className="font-bold text-gray-800 truncate">{product.nombre}</h3>
                                <p className="text-green-600 font-bold">${product.precio}</p>
                                <p className="text-xs text-gray-400">Stock: {product.stock}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right: Cart */}
            <div className="w-full md:w-96 bg-white rounded-xl shadow-lg border flex flex-col h-full">
                <div className="p-4 border-b bg-green-50 rounded-t-xl">
                    <h2 className="font-bold text-lg flex items-center gap-2 text-green-800">
                        <ShoppingCart size={20} /> Carrito Actual
                    </h2>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {cart.length === 0 ? (
                        <div className="text-center text-gray-400 mt-10">Carrito vacío</div>
                    ) : (
                        cart.map(item => (
                            <div key={item.id} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                                <div className="flex-1">
                                    <h4 className="font-medium text-sm text-gray-800">{item.nombre}</h4>
                                    <p className="text-xs text-gray-500">${item.price} x {item.quantity}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button onClick={() => updateQuantity(item.id, -1)} className="p-1 hover:bg-gray-200 rounded"><Minus size={16} /></button>
                                    <span className="w-6 text-center font-bold text-sm">{item.quantity}</span>
                                    <button onClick={() => updateQuantity(item.id, 1)} className="p-1 hover:bg-gray-200 rounded"><Plus size={16} /></button>
                                    <button onClick={() => removeFromCart(item.id)} className="text-red-500 p-1 hover:bg-red-50 rounded"><Trash2 size={16} /></button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div className="p-6 border-t bg-gray-50 rounded-b-xl">
                    <div className="flex justify-between items-center mb-6">
                        <span className="text-gray-600">Total a Pagar</span>
                        <span className="text-3xl font-bold text-gray-900">${total.toFixed(2)}</span>
                    </div>

                    <button
                        onClick={handleCheckout}
                        disabled={cart.length === 0 || processing}
                        className="w-full bg-green-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-green-700 transition disabled:opacity-50 shadow-lg shadow-green-200"
                    >
                        {processing ? 'Procesando...' : 'Confirmar Venta'}
                    </button>
                </div>
            </div>
        </div>
    )
}
