import React, { createContext, useContext, useState, useEffect } from 'react'
import api from '../services/api'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')

    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData)
        setUser(parsedUser)
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`
      } catch (error) {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
      }
    }
    setLoading(false)
  }, [])

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password })
      const { token, ...userData } = response.data
      // Only treat as logged in if success is true and token exists
      if (response.data.success && token) {
        localStorage.setItem('token', token)
        localStorage.setItem('user', JSON.stringify(userData))
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`
        setUser(userData)
        return { success: true }
      } else {

        localStorage.removeItem('token')
        localStorage.removeItem('user')
        setUser(null)
        return {
          success: false,
          message: response.data.message || 'Invalid email or password.'
        }
      }
    } catch (error) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      setUser(null)
      let msg = 'Login failed';
      if (error.response?.data?.message) {
        msg = error.response.data.message;
      } else if (error.response?.data && typeof error.response.data === 'string') {
        msg = error.response.data;
      }
      return {
        success: false,
        message: msg === 'Invalid credentials' ? 'Invalid email or password.' : msg
      }
    }
  }

  const register = async (registerData) => {
    try {
      const response = await api.post('/auth/register', registerData)


      if (response.data.success) {
        const { token, ...userData } = response.data


        if (token) {
          localStorage.setItem('token', token)
          localStorage.setItem('user', JSON.stringify(userData))
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`
          setUser(userData)
          return { success: true, user: userData }
        }


        return { success: true, user: userData }
      } else {

        return {
          success: false,
          message: response.data.message || 'Registration failed. Please try again.'
        }
      }
    } catch (error) {
      console.error('Registration error:', error)
      return {
        success: false,
        message: error.response?.data?.message || 'Registration failed. Please try again.'
      }
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    delete api.defaults.headers.common['Authorization']
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

