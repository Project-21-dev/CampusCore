import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:9090/api',
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 5000
})

const mockAPI = {
  register: (userData) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          data: {
            success: true,
            message: 'Registration successful',
            user: {
              id: Date.now(),
              username: userData.username,
              role: userData.role,
              email: userData.email
            }
          }
        })
      }, 1000)
    })
  },
  login: (credentials) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          data: {
            success: true,
            message: 'Login successful',
            token: 'mock-jwt-token',
            user: {
              id: 1,
              username: credentials.username,
              role: 'Student',
              email: 'user@example.com'
            }
          }
        })
      }, 1000)
    })
  }
}

const checkBackend = async () => {
  try {
    await api.get('/health', { timeout: 2000 })
    return true
  } catch {
    return false
  }
}

const enhancedAPI = {
  ...api,
  post: async (url, data) => {
    try {
      return await api.post(url, data)
    } catch (error) {
      if (error.code === 'ERR_NETWORK' || error.code === 'ECONNREFUSED') {
        console.warn('Backend not available, using mock API')
        if (url === '/auth/register') return mockAPI.register(data)
        if (url === '/auth/login') return mockAPI.login(data)
      }
      throw error
    }
  }
}


api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)


api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default enhancedAPI

