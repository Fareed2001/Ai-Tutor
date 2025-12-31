const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'

class ApiService {
  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    }

    if (options.body) {
      config.body = JSON.stringify(options.body)
    }

    try {
      const response = await fetch(url, config)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Request failed')
      }

      return data
    } catch (error) {
      throw error
    }
  }

  async generateDiagnostic(userId, chapter) {
    return this.request('/generate-diagnostic', {
      method: 'POST',
      body: { user_id: userId, chapter },
    })
  }

  async getDiagnostic(userId, chapter) {
    return this.request('/get-diagnostic', {
      method: 'POST',
      body: { user_id: userId, chapter },
    })
  }

  async submitDiagnostic(userId, diagnosticId, answers) {
    return this.request('/submit-diagnostic', {
      method: 'POST',
      body: {
        user_id: userId,
        diagnostic_id: diagnosticId,
        answers,
      },
    })
  }

  async getDashboard(userId) {
    return this.request(`/dashboard?user_id=${userId}`, {
      method: 'GET',
    })
  }

  async generateRoadmap(userId) {
    return this.request('/generate-roadmap', {
      method: 'POST',
      body: { user_id: userId },
    })
  }

  async resetPassword(username, newPassword) {
    return this.request('/reset-password', {
      method: 'POST',
      body: { username, new_password: newPassword },
    })
  }
}

export default new ApiService()

