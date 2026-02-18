import { createContext, useContext, useEffect, useState } from 'react'
import api from '../lib/api'

const AuthContext = createContext({})

export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null)
    const [profile, setProfile] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        checkUser()
    }, [])

    const checkUser = async () => {
        const token = localStorage.getItem('token')
        if (!token) {
            setLoading(false)
            return
        }

        try {
            const { data } = await api.get('/auth/me')
            setUser(data.user)
            setProfile(data.profile)
        } catch (error) {
            console.error('Check user error:', error)
            localStorage.removeItem('token')
            setUser(null)
            setProfile(null)
        } finally {
            setLoading(false)
        }
    }

    const value = {
        signUp: async (data) => {
            const response = await api.post('/auth/register', data)
            const { token, user, profile } = response.data
            localStorage.setItem('token', token)
            setUser(user)
            setProfile(profile)
            return response
        },
        signIn: async (data) => {
            const response = await api.post('/auth/login', data)
            const { token, user, profile } = response.data
            localStorage.setItem('token', token)
            setUser(user)
            setProfile(profile)
            return response
        },
        signOut: () => {
            localStorage.removeItem('token')
            setUser(null)
            setProfile(null)
        },
        user,
        profile,
        loading
    }

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    )
}
