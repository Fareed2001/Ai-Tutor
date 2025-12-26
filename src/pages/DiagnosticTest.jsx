import { useState, useEffect, useCallback } from 'react'
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
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [diagnostic, setDiagnostic] = useState(null)
  const [answers, setAnswers] = useState({})
  const [timeLeft, setTimeLeft] = useState(30 * 60) // 30 minutes in seconds
  const [error, setError] = useState('')

  useEffect(() => {
    const loadDiagnostic = async () => {
      if (!user || !chapter) {
        navigate('/dashboard')
        return
      }

      try {
        const data = await api.generateDiagnostic(user.id, chapter)
        setDiagnostic(data)
        setTimeLeft(data.time_limit * 60)
        setLoading(false)
      } catch (err) {
        setError(err.message || 'Failed to load diagnostic')
        setLoading(false)
      }
    }

    loadDiagnostic()
  }, [user, chapter, navigate])

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
            <Button to="/dashboard" variant="primary">
              Back to Dashboard
            </Button>
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

