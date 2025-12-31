import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import Button from '../components/Button'
import api from '../services/api'
import { useAuth } from '../hooks/useAuth'

const DiagnosticTest = () => {
  const { chapter } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [diagnostic, setDiagnostic] = useState(null)
  const [answers, setAnswers] = useState({})
  const [timeLeft, setTimeLeft] = useState(30 * 60) // 30 minutes in seconds
  const [error, setError] = useState('')
  const [checkingExisting, setCheckingExisting] = useState(true) // Check if diagnostic exists in DB
  const [hasExistingDiagnostic, setHasExistingDiagnostic] = useState(false) // Track if diagnostic exists in database
  
  // Session protection: useRef for immediate check, sessionStorage for persistence
  const diagnosticRunRef = useRef(false)
  
  // Get session key for this chapter
  const getSessionKey = () => {
    if (!user || !chapter) return null
    return `diagnostic_run_${user.id}_${chapter}`
  }
  
  // Check if diagnostic already ran in this session
  const hasDiagnosticRun = () => {
    const sessionKey = getSessionKey()
    if (!sessionKey) return false
    
    // Check both useRef and sessionStorage
    return diagnosticRunRef.current || sessionStorage.getItem(sessionKey) === 'true'
  }
  
  // Mark diagnostic as run in this session
  const markDiagnosticAsRun = () => {
    const sessionKey = getSessionKey()
    if (!sessionKey) return
    
    diagnosticRunRef.current = true
    sessionStorage.setItem(sessionKey, 'true')
  }

  useEffect(() => {
    // Only check if user/chapter exists, don't auto-generate diagnostic
    if (!user || !chapter) {
      navigate('/dashboard')
      return
    }
    
    // Check if diagnostic already ran in this session and restore state
    const sessionKey = getSessionKey()
    if (sessionKey && sessionStorage.getItem(sessionKey) === 'true') {
      diagnosticRunRef.current = true
    }

    // Check if diagnostic exists in database (persists across logouts)
    const checkExistingDiagnostic = async () => {
      try {
        const data = await api.getDiagnostic(user.id, chapter)
        if (data && data.diagnostic_id) {
          setHasExistingDiagnostic(true)
        }
      } catch (err) {
        // No existing diagnostic found - this is fine
        setHasExistingDiagnostic(false)
      } finally {
        setCheckingExisting(false)
      }
    }

    checkExistingDiagnostic()
  }, [user, chapter, navigate])

  // Disable automatic refetch on window focus/visibility change/network reconnect
  // Protection is handled via session protection (sessionStorage + useRef)
  // Diagnostic only runs on explicit button click, never automatically

  // Calculate remaining time from created_at
  const getRemainingTime = (data, timeLimitMinutes = 30) => {
    const createdAt = data.created_at
    if (!createdAt) {
      return timeLimitMinutes * 60
    }

    const startTime = new Date(createdAt).getTime()
    const currentTime = new Date().getTime()
    const elapsedSeconds = Math.floor((currentTime - startTime) / 1000)
    const totalSeconds = timeLimitMinutes * 60
    const remainingSeconds = Math.max(0, totalSeconds - elapsedSeconds)
    
    return remainingSeconds
  }

  const handleStartDiagnostic = async () => {
    if (!user || !chapter) {
      navigate('/dashboard')
      return
    }

    // Session protection: prevent duplicate runs
    if (hasDiagnosticRun()) {
      // Diagnostic already ran in this session, do nothing
      return
    }

    setLoading(true)
    setError('')
    try {
      // This will return existing diagnostic if found, or generate new one
      const data = await api.generateDiagnostic(user.id, chapter)
      setDiagnostic(data)
      
      // Calculate remaining time from created_at
      const remainingTime = getRemainingTime(data, data.time_limit)
      setTimeLeft(remainingTime)
        
        setLoading(false)
        // Mark diagnostic as run after successful generation/retrieval
        markDiagnosticAsRun()
        // Update state to reflect that diagnostic exists
        if (data.is_existing) {
          setHasExistingDiagnostic(true)
        }
        
        // If timer has already expired, auto-submit
        if (remainingTime <= 0 && data.diagnostic_test && data.diagnostic_test.length > 0) {
          // Auto-submit will be handled by the timer useEffect
        }
    } catch (err) {
      setError(err.message || 'Failed to load diagnostic')
      setLoading(false)
      // Don't mark as run if generation failed
    }
  }

  const handleResumeDiagnostic = async () => {
    if (!user || !chapter) {
      navigate('/dashboard')
      return
    }

    setLoading(true)
    setError('')
    try {
      // Get existing diagnostic from database (no Gemini call)
      const data = await api.getDiagnostic(user.id, chapter)
      if (data && data.diagnostic_id) {
        setDiagnostic(data)
        
        // Calculate remaining time from created_at
        const remainingTime = getRemainingTime(data, data.time_limit)
        setTimeLeft(remainingTime)
        
        setLoading(false)
        // Mark diagnostic as run after successful retrieval (for session tracking)
        markDiagnosticAsRun()
        // Update state to reflect that diagnostic exists
        setHasExistingDiagnostic(true)
      } else {
        throw new Error('Invalid diagnostic data received')
      }
    } catch (err) {
      setError(err.message || 'Failed to load existing diagnostic')
      setLoading(false)
    }
  }

  const handleSubmit = useCallback(async () => {
    if (!diagnostic || !user || submitting) return

    setSubmitting(true)
    try {
      const result = await api.submitDiagnostic(
        user.id,
        diagnostic.diagnostic_id,
        answers
      )

      navigate(`/dashboard?result=${result.result_id}&chapter=${chapter}`)
    } catch (err) {
      setError(err.message || 'Failed to submit diagnostic')
      setSubmitting(false)
    }
  }, [diagnostic, user, answers, submitting, navigate, chapter])

  useEffect(() => {
    if (timeLeft <= 0 && diagnostic && !submitting) {
      handleSubmit()
      return
    }

    if (timeLeft <= 0) return

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1)
    }, 1000)

    return () => clearInterval(timer)
  }, [timeLeft, diagnostic, submitting, handleSubmit])

  const handleAnswerChange = (questionId, answer) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }))
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Show loading while checking for existing diagnostic
  if (checkingExisting) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Checking for existing diagnostic...</p>
        </div>
      </div>
    )
  }

  // Show start button if diagnostic hasn't been generated yet
  if (!diagnostic && !loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />
        <div className="flex-grow flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
            <div className="text-blue-600 text-5xl mb-4">📝</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Diagnostic Test: {chapter}
            </h2>
            <p className="text-gray-600 mb-6">
              {hasExistingDiagnostic 
                ? "You have an existing diagnostic test. Click 'Resume Diagnostic' to continue."
                : "Click the button below to start your diagnostic test. You will have 30 minutes to complete it."}
            </p>
            {hasExistingDiagnostic ? (
              <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded-lg mb-6">
                ℹ️ You have an existing diagnostic test. Click 'Resume Diagnostic' to continue.
              </div>
            ) : hasDiagnosticRun() && (
              <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg mb-6">
                ⚠️ Diagnostic has already been started in this session. Please complete the current test or close this tab/window to start a new session.
              </div>
            )}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                {error}
              </div>
            )}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {hasExistingDiagnostic ? (
                <Button
                  variant="primary"
                  onClick={handleResumeDiagnostic}
                  disabled={loading}
                  className="px-6 py-3"
                >
                  {loading ? 'Loading...' : 'Resume Diagnostic'}
                </Button>
              ) : (
                <Button
                  variant="primary"
                  onClick={handleStartDiagnostic}
                  disabled={loading || hasDiagnosticRun()}
                  className="px-6 py-3"
                >
                  {loading ? 'Starting...' : hasDiagnosticRun() ? 'Already Started' : 'Start Diagnostic Test'}
                </Button>
              )}
              <Button to="/dashboard" variant="outline" className="px-6 py-3">
                Back to Dashboard
              </Button>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading diagnostic test...</p>
        </div>
      </div>
    )
  }

  if (error && !diagnostic) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />
        <div className="flex-grow flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
            <div className="text-red-600 text-5xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Error</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            {hasExistingDiagnostic ? (
              <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded-lg mb-6">
                ℹ️ You have an existing diagnostic test. Click 'Resume Diagnostic' to continue.
              </div>
            ) : hasDiagnosticRun() && (
              <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg mb-6">
                ⚠️ Diagnostic has already been started in this session. Please complete the current test or close this tab/window to start a new session.
              </div>
            )}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {hasExistingDiagnostic ? (
                <Button
                  variant="primary"
                  onClick={handleResumeDiagnostic}
                  disabled={loading}
                  className="px-6 py-3"
                >
                  {loading ? 'Loading...' : 'Resume Diagnostic'}
                </Button>
              ) : (
                <Button
                  variant="primary"
                  onClick={handleStartDiagnostic}
                  disabled={loading || hasDiagnosticRun()}
                  className="px-6 py-3"
                >
                  {loading ? 'Starting...' : hasDiagnosticRun() ? 'Already Started' : 'Try Again'}
                </Button>
              )}
              <Button to="/dashboard" variant="outline" className="px-6 py-3">
                Back to Dashboard
              </Button>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  const questions = diagnostic?.diagnostic_test || []
  const answeredCount = Object.keys(answers).length
  const totalQuestions = questions.length

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <div className="flex-grow py-6 sm:py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 mb-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                  Diagnostic Test: {chapter}
                </h1>
                <p className="text-sm sm:text-base text-gray-600 mt-1">
                  {answeredCount} of {totalQuestions} questions answered
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="bg-red-50 border-2 border-red-200 rounded-lg px-4 py-2">
                  <span className="text-red-600 font-bold text-lg sm:text-xl">
                    {formatTime(timeLeft)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          {/* Questions */}
          <div className="space-y-6 mb-6">
            {questions.map((question, index) => {
              const questionId = index.toString()
              const selectedAnswer = answers[questionId] || ''

              return (
                <div
                  key={index}
                  className="bg-white rounded-xl shadow-lg p-4 sm:p-6"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs sm:text-sm font-semibold">
                          Question {index + 1}
                        </span>
                        <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-xs sm:text-sm font-semibold">
                          {question.bucket}
                        </span>
                        <span className="text-xs sm:text-sm text-gray-500">
                          {question.marks} mark{question.marks > 1 ? 's' : ''}
                        </span>
                      </div>
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                        {question.question}
                      </h3>
                    </div>
                  </div>

                  <div className="space-y-2 mt-4">
                    {question.options?.map((option, optIndex) => {
                      const optionValue = String.fromCharCode(65 + optIndex) // A, B, C, D
                      const isSelected = selectedAnswer === optionValue

                      return (
                        <label
                          key={optIndex}
                          className={`flex items-center p-3 sm:p-4 border-2 rounded-lg cursor-pointer transition-all ${
                            isSelected
                              ? 'border-blue-600 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <input
                            type="radio"
                            name={`question_${index}`}
                            value={optionValue}
                            checked={isSelected}
                            onChange={() => handleAnswerChange(questionId, optionValue)}
                            className="mr-3 h-4 w-4 text-blue-600 flex-shrink-0"
                          />
                          <span className="font-semibold text-gray-900 mr-2">
                            {optionValue}.
                          </span>
                          <span className="text-sm sm:text-base text-gray-900">
                            {option}
                          </span>
                        </label>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Submit Button */}
          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <p className="text-sm sm:text-base text-gray-600">
                {answeredCount === totalQuestions
                  ? 'All questions answered. Ready to submit!'
                  : `${totalQuestions - answeredCount} question(s) remaining`}
              </p>
              <Button
                variant="primary"
                onClick={handleSubmit}
                disabled={submitting || timeLeft <= 0}
                className="w-full sm:w-auto px-6 sm:px-8 py-3"
              >
                {submitting
                  ? 'Submitting...'
                  : timeLeft <= 0
                  ? 'Time Up - Auto Submitting'
                  : 'Submit Test'}
              </Button>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default DiagnosticTest

