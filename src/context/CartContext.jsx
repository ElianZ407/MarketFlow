import { createContext, useContext, useState, useEffect } from 'react'

const CartContext = createContext({})

export const useCart = () => useContext(CartContext)

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState([])
    const [total, setTotal] = useState(0)

    useEffect(() => {
        // Recalculate total whenever cart changes
        const newTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
        setTotal(newTotal)
    }, [cart])

    const addToCart = (product) => {
        setCart(prev => {
            const existing = prev.find(item => item.id === product.id)
            if (existing) {
                return prev.map(item =>
                    item.id === product.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                )
            }
            return [...prev, { ...product, price: parseFloat(product.precio), quantity: 1 }]
        })
    }

    const removeFromCart = (productId) => {
        setCart(prev => prev.filter(item => item.id !== productId))
    }

    const updateQuantity = (productId, amount) => {
        setCart(prev => prev.map(item => {
            if (item.id === productId) {
                const newQuantity = Math.max(0, item.quantity + amount)
                return { ...item, quantity: newQuantity }
            }
            return item
        }).filter(item => item.quantity > 0))
    }

    const clearCart = () => setCart([])

    return (
        <CartContext.Provider value={{ cart, total, addToCart, removeFromCart, updateQuantity, clearCart }}>
            {children}
        </CartContext.Provider>
    )
}
