import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import Button from '../components/Button'
import { supabase } from '../lib/supabase'
import api from '../services/api'

const ForgotPassword = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [step, setStep] = useState('username') // 'username' or 'password'

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
    setError('')
  }

  const handleUsernameSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Validate username
      if (!formData.username || formData.username.trim().length < 3) {
        setError('Please enter a valid username')
        setLoading(false)
        return
      }

      // Normalize username to lowercase
      const normalizedUsername = formData.username.toLowerCase()

      // Check if username exists
      const { data: profileData, error: profileError } = await supabase
        .from('user_profile')
        .select('username')
        .eq('username', normalizedUsername)
        .single()

      if (profileError || !profileData) {
        setError('Username not found. Please check and try again.')
        setLoading(false)
        return
      }

      // Username exists, move to password step
      setStep('password')
    } catch (err) {
      setError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Validate passwords match
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match')
        setLoading(false)
        return
      }

      // Validate password length
      if (formData.password.length < 6) {
        setError('Password must be at least 6 characters long')
        setLoading(false)
        return
      }

      // Normalize username to lowercase
      const normalizedUsername = formData.username.toLowerCase()

      // Call backend API to reset password
      await api.resetPassword(normalizedUsername, formData.password)

      // Success - redirect to login
      navigate('/login', { 
        state: { message: 'Password reset successfully. Please login with your new password.' }
      })
    } catch (err) {
      setError(err.message || 'Failed to reset password. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <div className="flex-grow flex items-center justify-center py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-6 sm:space-y-8">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl sm:text-2xl">C</span>
              </div>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Forgot Password</h2>
            <p className="mt-2 text-sm sm:text-base text-gray-600">
              {step === 'username' 
                ? 'Enter your username to reset your password'
                : 'Enter your new password'}
            </p>
          </div>

          {step === 'username' ? (
            <form
              className="mt-6 sm:mt-8 space-y-4 sm:space-y-6 bg-white p-6 sm:p-8 rounded-xl shadow-lg"
              onSubmit={handleUsernameSubmit}
            >
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                  Username
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  required
                  value={formData.username}
                  onChange={handleChange}
                  className="appearance-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your username"
                  autoFocus
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <div>
                <Button
                  type="submit"
                  variant="primary"
                  className="w-full text-lg py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={loading}
                >
                  {loading ? 'Verifying...' : 'Continue'}
                </Button>
              </div>

              <div className="text-center">
                <Link to="/login" className="text-sm font-medium text-blue-600 hover:text-blue-500">
                  Back to Sign In
                </Link>
              </div>
            </form>
          ) : (
            <form
              className="mt-6 sm:mt-8 space-y-4 sm:space-y-6 bg-white p-6 sm:p-8 rounded-xl shadow-lg"
              onSubmit={handlePasswordSubmit}
            >
              <div className="space-y-4">
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                    New Password
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="appearance-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter new password"
                    minLength={6}
                    autoFocus
                  />
                  <p className="mt-1 text-xs text-gray-500">Minimum 6 characters</p>
                </div>
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm New Password
                  </label>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="appearance-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Confirm new password"
                    minLength={6}
                  />
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <div>
                <Button
                  type="submit"
                  variant="primary"
                  className="w-full text-lg py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={loading}
                >
                  {loading ? 'Resetting Password...' : 'Reset Password'}
                </Button>
              </div>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => {
                    setStep('username')
                    setError('')
                    setFormData({ ...formData, password: '', confirmPassword: '' })
                  }}
                  className="text-sm font-medium text-blue-600 hover:text-blue-500"
                >
                  Back to Username
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default ForgotPassword
