import { useEffect, useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'

const ProtectedRoute = ({ children, requireOnboarding = false }) => {
  const { user, loading: authLoading } = useAuth()
  const location = useLocation()
  const [onboardingStatus, setOnboardingStatus] = useState(null)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    const checkOnboarding = async () => {
      if (!user) {
        setChecking(false)
        return
      }

      try {
        // Add a small delay to ensure database updates are visible
        await new Promise(resolve => setTimeout(resolve, 100))
        
        const { data, error } = await supabase
          .from('student_profile')
          .select('onboarding_completed')
          .eq('user_id', user.id)
          .single()

        if (error && error.code !== 'PGRST116') {
          // PGRST116 = no rows returned
          console.error('Error checking onboarding:', error)
          setOnboardingStatus(false)
        } else {
          setOnboardingStatus(data?.onboarding_completed ?? false)
        }
      } catch (err) {
        console.error('Error checking onboarding:', err)
        setOnboardingStatus(false)
      } finally {
        setChecking(false)
      }
    }

    if (user) {
      // Reset checking state when location changes to force re-check
      setChecking(true)
      checkOnboarding()
    } else if (!authLoading) {
      setChecking(false)
    }
  }, [user, authLoading, location.pathname])

  if (authLoading || checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (requireOnboarding) {
    // For dashboard - must have completed onboarding
    if (onboardingStatus === false) {
      return <Navigate to="/onboarding" replace />
    }
  } else {
    // For onboarding - redirect to dashboard if already completed
    if (onboardingStatus === true) {
      return <Navigate to="/dashboard" replace />
    }
  }

  return children
}

export default ProtectedRoute



