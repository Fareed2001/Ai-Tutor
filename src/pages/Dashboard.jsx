import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import Button from '../components/Button'
import api from '../services/api'
import { useAuth } from '../hooks/useAuth'

const Dashboard = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [activeTab, setActiveTab] = useState('overview')
  const [loading, setLoading] = useState(true)
  const [generatingRoadmap, setGeneratingRoadmap] = useState(false)
  const [dashboardData, setDashboardData] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (searchParams.get('result')) {
      setActiveTab('test-details')
    }
  }, [searchParams])

  useEffect(() => {
    const loadDashboard = async () => {
      if (!user) return

      try {
        const data = await api.getDashboard(user.id)
        setDashboardData(data)
        setLoading(false)
      } catch (err) {
        setError(err.message || 'Failed to load dashboard')
        setLoading(false)
      }
    }

    loadDashboard()
  }, [user])

  const handleGenerateRoadmap = async () => {
    if (!user) return

    setGeneratingRoadmap(true)
    try {
      const result = await api.generateRoadmap(user.id)
      // Reload dashboard to get updated roadmap
      const data = await api.getDashboard(user.id)
      setDashboardData(data)
      setActiveTab('roadmap')
    } catch (err) {
      setError(err.message || 'Failed to generate roadmap')
    } finally {
      setGeneratingRoadmap(false)
    }
  }

  const handleStartDiagnostic = (chapter) => {
    navigate(`/diagnostic/${chapter}`)
  }

  const getAvailableChapters = () => {
    if (!dashboardData?.profile) return []
    
    const chapters = dashboardData.profile.chapters || {}
    const available = []
    
    for (const [chapter, status] of Object.entries(chapters)) {
      if (status === 'good' || status === 'weak') {
        available.push(chapter)
      }
    }
    
    return available
  }

  const calculateProgress = (result) => {
    if (!result) return 0
    return Math.round(result.percentage || 0)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  const results = dashboardData?.results || []
  const attemptedChapters = dashboardData?.attempted_chapters || []
  const passedChapters = dashboardData?.passed_chapters || []
  const roadmap = dashboardData?.roadmap
  const availableChapters = getAvailableChapters()

  // Overview Tab
  const renderOverview = () => (
    <div className="space-y-6">
      {/* Progress Rings */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {attemptedChapters.map((chapter) => {
          const result = results.find((r) => r.chapter === chapter)
          const progress = calculateProgress(result)
          const passed = result?.passed || false

          return (
            <div key={chapter} className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 text-center">
                {chapter}
              </h3>
              <div className="flex justify-center mb-4">
                <div className="relative w-32 h-32">
                  <svg className="transform -rotate-90 w-32 h-32">
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="transparent"
                      className="text-gray-200"
                    />
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="transparent"
                      strokeDasharray={`${2 * Math.PI * 56}`}
                      strokeDashoffset={`${2 * Math.PI * 56 * (1 - progress / 100)}`}
                      className={passed ? 'text-green-500' : 'text-red-500'}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className={`text-2xl font-bold ${passed ? 'text-green-600' : 'text-red-600'}`}>
                        {progress}%
                      </div>
                      <div className="text-xs text-gray-500">
                        {passed ? 'Passed' : 'Failed'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {attemptedChapters.length === 0 && (
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="text-5xl mb-4">📝</div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            No Diagnostics Attempted
          </h3>
          <p className="text-gray-600 mb-6">
            Start your diagnostic journey by taking a test for available chapters.
          </p>
          {availableChapters.length > 0 ? (
            <div className="space-y-3">
              {availableChapters.map((chapter) => (
                <Button
                  key={chapter}
                  variant="primary"
                  onClick={() => handleStartDiagnostic(chapter)}
                  className="w-full sm:w-auto"
                >
                  Start Diagnostic: {chapter}
                </Button>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">
              Complete your onboarding to see available chapters.
            </p>
          )}
        </div>
      )}

      {/* Available Chapters */}
      {availableChapters.length > 0 && attemptedChapters.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Available Chapters
          </h3>
          <div className="space-y-3">
            {availableChapters
              .filter((ch) => !attemptedChapters.includes(ch))
              .map((chapter) => (
                <Button
                  key={chapter}
                  variant="outline"
                  onClick={() => handleStartDiagnostic(chapter)}
                  className="w-full sm:w-auto"
                >
                  Start Diagnostic: {chapter}
                </Button>
              ))}
          </div>
        </div>
      )}
    </div>
  )

  // Test Details Tab
  const renderTestDetails = () => (
    <div className="space-y-6">
      {results.length === 0 ? (
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="text-5xl mb-4">📊</div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            No Test Results Yet
          </h3>
          <p className="text-gray-600">
            Complete a diagnostic test to see detailed results here.
          </p>
        </div>
      ) : (
        results.map((result) => (
          <div key={result.id} className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900">
                  {result.chapter}
                </h3>
                <p className="text-sm text-gray-600">
                  Submitted: {new Date(result.submitted_at).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className={`px-4 py-2 rounded-lg ${
                  result.passed
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  <span className="font-semibold">
                    {result.passed ? 'Passed' : 'Failed'} - {result.percentage}%
                  </span>
                </div>
              </div>
            </div>

            {/* Bucket Scores */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              {Object.keys(result.bucket_scores || {}).map((bucket) => {
                const score = result.bucket_scores[bucket] || 0
                const total = result.bucket_totals[bucket] || 1
                const percentage = Math.round((score / total) * 100)

                return (
                  <div key={bucket} className="bg-gray-50 rounded-lg p-4">
                    <div className="text-sm text-gray-600 mb-1">{bucket}</div>
                    <div className="text-2xl font-bold text-gray-900">
                      {score}/{total}
                    </div>
                    <div className="text-xs text-gray-500">{percentage}%</div>
                  </div>
                )
              })}
            </div>

            {/* Question Results */}
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900">Question Details:</h4>
              {(result.results || []).map((qResult, idx) => (
                <div
                  key={idx}
                  className={`border-2 rounded-lg p-4 ${
                    qResult.is_correct
                      ? 'border-green-200 bg-green-50'
                      : 'border-red-200 bg-red-50'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-semibold text-gray-900">
                          Q{idx + 1}
                        </span>
                        <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded">
                          {qResult.bucket}
                        </span>
                        {qResult.is_correct ? (
                          <span className="text-xs bg-green-200 text-green-800 px-2 py-1 rounded">
                            ✓ Correct
                          </span>
                        ) : (
                          <span className="text-xs bg-red-200 text-red-800 px-2 py-1 rounded">
                            ✗ Incorrect
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-900 mb-2">{qResult.question}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Your Answer: </span>
                      <span className={`font-semibold ${
                        qResult.is_correct ? 'text-green-700' : 'text-red-700'
                      }`}>
                        {qResult.user_answer || 'Not answered'}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Correct Answer: </span>
                      <span className="font-semibold text-green-700">
                        {qResult.correct_answer}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  )

  // Roadmap Tab
  const renderRoadmap = () => (
    <div className="space-y-6">
      {!roadmap ? (
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="text-5xl mb-4">🗺️</div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            No Roadmap Generated
          </h3>
          <p className="text-gray-600 mb-6">
            Generate a personalized learning roadmap based on your diagnostic results.
          </p>
          {results.length > 0 ? (
            <Button
              variant="primary"
              onClick={handleGenerateRoadmap}
              disabled={generatingRoadmap}
              className="px-6 py-3"
            >
              {generatingRoadmap ? 'Generating Roadmap...' : 'Generate Roadmap'}
            </Button>
          ) : (
            <p className="text-gray-500">
              Complete at least one diagnostic test to generate a roadmap.
            </p>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-gray-900">Your Learning Roadmap</h3>
            <Button
              variant="outline"
              onClick={handleGenerateRoadmap}
              disabled={generatingRoadmap}
              className="text-sm"
            >
              {generatingRoadmap ? 'Regenerating...' : 'Regenerate'}
            </Button>
          </div>

          {roadmap.weekly_roadmap && roadmap.weekly_roadmap.length > 0 ? (
            <div className="space-y-6">
              {roadmap.weekly_roadmap.map((week, idx) => (
                <div key={idx} className="border-l-4 border-blue-600 pl-4 sm:pl-6 py-2">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
                      Week {week.week}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      week.priority === 'high'
                        ? 'bg-red-100 text-red-800'
                        : week.priority === 'medium'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {week.priority} priority
                    </span>
                  </div>
                  <div className="mb-2">
                    <h4 className="font-semibold text-gray-900 mb-2">Topics:</h4>
                    <div className="flex flex-wrap gap-2">
                      {week.topics?.map((topic, topicIdx) => (
                        <span
                          key={topicIdx}
                          className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm"
                        >
                          {topic}
                        </span>
                      ))}
                    </div>
                  </div>
                  {week.reasoning && (
                    <p className="text-sm text-gray-600 italic">
                      {week.reasoning}
                    </p>
                  )}
                </div>
              ))}
              
              {roadmap.estimated_completion && (
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold">Estimated Completion:</span>{' '}
                    {roadmap.estimated_completion}
                  </p>
                </div>
              )}

              {roadmap.focus_areas && roadmap.focus_areas.length > 0 && (
                <div className="mt-6">
                  <h4 className="font-semibold text-gray-900 mb-3">Focus Areas:</h4>
                  <div className="flex flex-wrap gap-2">
                    {roadmap.focus_areas.map((area, idx) => (
                      <span
                        key={idx}
                        className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm"
                      >
                        {area}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p className="text-gray-600">Roadmap data is being generated...</p>
          )}
        </div>
      )}
    </div>
  )

  // Start Journey Tab
  const renderStartJourney = () => (
    <div className="bg-white rounded-xl shadow-lg p-8 text-center">
      <div className="text-6xl mb-6">🚀</div>
      <h3 className="text-2xl font-bold text-gray-900 mb-4">
        Learning Module Coming Soon
      </h3>
      <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
        We're working hard to bring you an interactive learning experience. 
        Complete your diagnostics and check your roadmap to prepare for when the module launches!
      </p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button
          variant="primary"
          onClick={() => setActiveTab('overview')}
          className="px-6 py-3"
        >
          View Diagnostics
        </Button>
        <Button
          variant="outline"
          onClick={() => setActiveTab('roadmap')}
          className="px-6 py-3"
        >
          View Roadmap
        </Button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <div className="flex-grow py-6 sm:py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Welcome to Your Dashboard
            </h1>
            <p className="mt-2 text-sm sm:text-base text-gray-600">
              Your personalized AI Chemistry Tutor is ready to help you learn.
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          {/* Tabs */}
          <div className="bg-white rounded-xl shadow-lg mb-6">
            <div className="border-b border-gray-200">
              <nav className="flex flex-wrap -mb-px">
                {[
                  { id: 'overview', label: 'Overview', icon: '📊' },
                  { id: 'test-details', label: 'Test Details', icon: '📝' },
                  { id: 'roadmap', label: 'Roadmap', icon: '🗺️' },
                  { id: 'start-journey', label: 'Start Journey', icon: '🚀' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 sm:flex-none px-4 sm:px-6 py-3 sm:py-4 text-sm sm:text-base font-medium border-b-2 transition-colors ${
                      activeTab === tab.id
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <span className="mr-2">{tab.icon}</span>
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>

            <div className="p-4 sm:p-6">
              {activeTab === 'overview' && renderOverview()}
              {activeTab === 'test-details' && renderTestDetails()}
              {activeTab === 'roadmap' && renderRoadmap()}
              {activeTab === 'start-journey' && renderStartJourney()}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default Dashboard
