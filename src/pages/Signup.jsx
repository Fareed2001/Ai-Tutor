import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import Button from '../components/Button'
import { supabase } from '../lib/supabase'

const Signup = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    // Validate username
    if (formData.username.length < 3) {
      setError('Username must be at least 3 characters long')
      setLoading(false)
      return
    }

    // Validate username format (alphanumeric and underscore only)
    if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      setError('Username can only contain letters, numbers, and underscores')
      setLoading(false)
      return
    }

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

    try {
      // Normalize username to lowercase for consistency
      const normalizedUsername = formData.username.toLowerCase()

      // Check if username already exists
      const { data: existingUser } = await supabase
        .from('user_profile')
        .select('username')
        .eq('username', normalizedUsername)
        .single()

      if (existingUser) {
        setError('Username already taken. Please choose another one.')
        setLoading(false)
        return
      }

      // Generate email from username (Supabase requires email, so we use username@techmilsolutions.co)
      const generatedEmail = `${normalizedUsername}@techmilsolutions.co`

      // Sign up the user with generated email
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: generatedEmail,
        password: formData.password,
        options: {
          data: {
            username: normalizedUsername,
          },
        },
      })

      if (authError) throw authError

      // Profile is automatically created by the database trigger
      // The trigger reads username from raw_user_meta_data which we set above
      
      // Success - redirect to onboarding (new users need to complete onboarding)
      navigate('/onboarding')
    } catch (err) {
      setError(err.message || 'An error occurred during signup')
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
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Create Your Account</h2>
            <p className="mt-2 text-sm sm:text-base text-gray-600">Start your journey with ChemMentor AI</p>
          </div>
          <form className="mt-6 sm:mt-8 space-y-4 sm:space-y-6 bg-white p-6 sm:p-8 rounded-xl shadow-lg" onSubmit={handleSubmit}>
            <div className="space-y-4">
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
                  placeholder="Choose a username"
                  pattern="[a-zA-Z0-9_]+"
                  minLength={3}
                />
                <p className="mt-1 text-xs text-gray-500">
                  Only letters, numbers, and underscores. Minimum 3 characters.
                </p>
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password
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
                  placeholder="Create a password"
                  minLength={6}
                />
              </div>
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password
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
                  placeholder="Confirm your password"
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div className="flex items-start">
              <input
                id="terms"
                name="terms"
                type="checkbox"
                required
                className="h-4 w-4 mt-0.5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded flex-shrink-0"
              />
              <label htmlFor="terms" className="ml-2 block text-xs sm:text-sm text-gray-700">
                I agree to the{' '}
                <a href="#" className="text-blue-600 hover:text-blue-500">
                  Terms of Service
                </a>{' '}
                and{' '}
                <a href="#" className="text-blue-600 hover:text-blue-500">
                  Privacy Policy
                </a>
              </label>
            </div>

            <div>
              <Button
                type="submit"
                variant="primary"
                className="w-full text-lg py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading}
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </Button>
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
                  Sign in
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default Signup

