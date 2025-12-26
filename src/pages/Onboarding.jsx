import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import Button from '../components/Button'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'

const CHAPTERS = [
  'States of Matter',
  'Atoms, Elements and Compounds',
  'Stoichiometry',
  'Electrochemistry',
  'Chemical Energetics',
  'Chemical Reactions',
  'Acids, Bases and Salts',
  'Periodic Table',
  'Metals',
  'Chemistry of the Environment',
  'Organic Chemistry',
  'Experimental Techniques & Chemical Analysis'
]

const DIFFICULT_AREAS = [
  'Definitions',
  'Numericals',
  'Theory',
  'MCQs',
  'Past paper questions'
]

const Onboarding = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    student_type: '',
    studied_chemistry_before: null,
    confidence_level: '',
    difficult_areas: [],
    chapters: {},
    target_grade: '',
    study_hours: '',
    exam_session: ''
  })

  const totalSteps = 5

  const updateFormData = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return formData.student_type && formData.studied_chemistry_before !== null
      case 2:
        return formData.confidence_level && formData.difficult_areas.length > 0
      case 3:
        return Object.keys(formData.chapters).length > 0
      case 4:
        return formData.target_grade && formData.study_hours
      case 5:
        return formData.exam_session
      default:
        return false
    }
  }

  const handleNext = () => {
    if (canProceed() && currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async () => {
    if (!canProceed() || !user) return

    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('student_profile')
        .upsert({
          user_id: user.id,
          student_type: formData.student_type,
          studied_chemistry_before: formData.studied_chemistry_before,
          confidence_level: formData.confidence_level,
          difficult_areas: formData.difficult_areas,
          chapters: formData.chapters,
          target_grade: formData.target_grade,
          study_hours: formData.study_hours,
          exam_session: formData.exam_session,
          onboarding_completed: true
        }, {
          onConflict: 'user_id'
        })
        .select()
        .single()

      if (error) throw error

      // Verify the update was successful before navigating
      if (data && data.onboarding_completed === true) {
        // Small delay to ensure database update is propagated
        await new Promise(resolve => setTimeout(resolve, 500))
        navigate('/dashboard', { replace: true })
      } else {
        throw new Error('Failed to update onboarding status')
      }
    } catch (err) {
      console.error('Error saving onboarding data:', err)
      alert('Error saving your information. Please try again.')
      setLoading(false)
    }
  }

  // Step 1: Student Background
  const renderStep1 = () => (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Are you:</h3>
        <div className="space-y-2 sm:space-y-3">
          {['School student', 'Private candidate'].map(option => (
            <label
              key={option}
              className={`flex items-center p-3 sm:p-4 border-2 rounded-lg cursor-pointer transition-all ${
                formData.student_type === option
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <input
                type="radio"
                name="student_type"
                value={option}
                checked={formData.student_type === option}
                onChange={(e) => updateFormData('student_type', e.target.value)}
                className="mr-3 h-4 w-4 text-blue-600 flex-shrink-0"
              />
              <span className="text-sm sm:text-base text-gray-900">{option}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Have you studied Chemistry before?</h3>
        <div className="space-y-2 sm:space-y-3">
          {[
            { label: 'Yes', value: true },
            { label: 'No', value: false }
          ].map(option => (
            <label
              key={option.label}
              className={`flex items-center p-3 sm:p-4 border-2 rounded-lg cursor-pointer transition-all ${
                formData.studied_chemistry_before === option.value
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <input
                type="radio"
                name="studied_chemistry_before"
                checked={formData.studied_chemistry_before === option.value}
                onChange={() => updateFormData('studied_chemistry_before', option.value)}
                className="mr-3 h-4 w-4 text-blue-600 flex-shrink-0"
              />
              <span className="text-sm sm:text-base text-gray-900">{option.label}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  )

  // Step 2: Confidence & Difficulty
  const renderStep2 = () => (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">How confident are you in Chemistry?</h3>
        <div className="space-y-2 sm:space-y-3">
          {['Very weak', 'Average', 'Good', 'Very confident'].map(option => (
            <label
              key={option}
              className={`flex items-center p-3 sm:p-4 border-2 rounded-lg cursor-pointer transition-all ${
                formData.confidence_level === option
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <input
                type="radio"
                name="confidence_level"
                value={option}
                checked={formData.confidence_level === option}
                onChange={(e) => updateFormData('confidence_level', e.target.value)}
                className="mr-3 h-4 w-4 text-blue-600 flex-shrink-0"
              />
              <span className="text-sm sm:text-base text-gray-900">{option}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Which type of questions do you find difficult? (Select all that apply)</h3>
        <div className="space-y-2 sm:space-y-3">
          {DIFFICULT_AREAS.map(area => (
            <label
              key={area}
              className={`flex items-center p-3 sm:p-4 border-2 rounded-lg cursor-pointer transition-all ${
                formData.difficult_areas.includes(area)
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <input
                type="checkbox"
                checked={formData.difficult_areas.includes(area)}
                onChange={(e) => {
                  const newAreas = e.target.checked
                    ? [...formData.difficult_areas, area]
                    : formData.difficult_areas.filter(a => a !== area)
                  updateFormData('difficult_areas', newAreas)
                }}
                className="mr-3 h-4 w-4 text-blue-600 flex-shrink-0"
              />
              <span className="text-sm sm:text-base text-gray-900">{area}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  )

  // Step 3: Syllabus Coverage
  const renderStep3 = () => (
    <div className="space-y-4 sm:space-y-6">
      <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">Select the chapters you've studied and indicate your understanding level:</p>
      <div className="space-y-3 sm:space-y-4">
        {CHAPTERS.map(chapter => (
          <div key={chapter} className="border-2 border-gray-200 rounded-lg p-3 sm:p-4">
            <h4 className="text-sm sm:text-base font-semibold text-gray-900 mb-2 sm:mb-3">{chapter}</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
              {[
                { label: 'Understood well', value: 'good' },
                { label: 'Need revision', value: 'weak' },
                { label: 'Not studied', value: 'not_studied' }
              ].map(option => (
                <label
                  key={option.value}
                  className={`flex items-center p-3 border-2 rounded-lg cursor-pointer transition-all ${
                    formData.chapters[chapter] === option.value
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name={`chapter_${chapter}`}
                    checked={formData.chapters[chapter] === option.value}
                    onChange={() => {
                      const newChapters = { ...formData.chapters, [chapter]: option.value }
                      updateFormData('chapters', newChapters)
                    }}
                    className="mr-2 h-4 w-4 text-blue-600"
                  />
                  <span className="text-sm text-gray-900">{option.label}</span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  // Step 4: Goals
  const renderStep4 = () => (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Target grade:</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
          {['A*', 'A', 'B', 'Pass'].map(grade => (
            <label
              key={grade}
              className={`flex items-center justify-center p-3 sm:p-4 border-2 rounded-lg cursor-pointer transition-all ${
                formData.target_grade === grade
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <input
                type="radio"
                name="target_grade"
                value={grade}
                checked={formData.target_grade === grade}
                onChange={(e) => updateFormData('target_grade', e.target.value)}
                className="mr-2 h-4 w-4 text-blue-600 flex-shrink-0"
              />
              <span className="text-sm sm:text-base text-gray-900 font-semibold">{grade}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Weekly study time:</h3>
        <div className="space-y-2 sm:space-y-3">
          {['1–2 hours', '3–5 hours', '6–10 hours'].map(option => (
            <label
              key={option}
              className={`flex items-center p-3 sm:p-4 border-2 rounded-lg cursor-pointer transition-all ${
                formData.study_hours === option
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <input
                type="radio"
                name="study_hours"
                value={option}
                checked={formData.study_hours === option}
                onChange={(e) => updateFormData('study_hours', e.target.value)}
                className="mr-3 h-4 w-4 text-blue-600 flex-shrink-0"
              />
              <span className="text-sm sm:text-base text-gray-900">{option}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  )

  // Step 5: Exam Session
  const renderStep5 = () => (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Exam session:</h3>
        <div className="space-y-2 sm:space-y-3">
          {['May / June 2026', 'Oct / Nov 2026', '2027'].map(option => (
            <label
              key={option}
              className={`flex items-center p-3 sm:p-4 border-2 rounded-lg cursor-pointer transition-all ${
                formData.exam_session === option
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <input
                type="radio"
                name="exam_session"
                value={option}
                checked={formData.exam_session === option}
                onChange={(e) => updateFormData('exam_session', e.target.value)}
                className="mr-3 h-4 w-4 text-blue-600 flex-shrink-0"
              />
              <span className="text-sm sm:text-base text-gray-900">{option}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  )

  const renderStepContent = () => {
    switch (currentStep) {
      case 1: return renderStep1()
      case 2: return renderStep2()
      case 3: return renderStep3()
      case 4: return renderStep4()
      case 5: return renderStep5()
      default: return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <div className="flex-grow py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Progress Indicator */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-blue-600">
                Step {currentStep} of {totalSteps}
              </span>
              <span className="text-sm text-gray-500">
                {Math.round((currentStep / totalSteps) * 100)}% Complete
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(currentStep / totalSteps) * 100}%` }}
              />
            </div>
          </div>

          {/* Step Content */}
          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 lg:p-8 mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">
              {currentStep === 1 && 'Student Background'}
              {currentStep === 2 && 'Confidence & Difficulty'}
              {currentStep === 3 && 'Syllabus Coverage'}
              {currentStep === 4 && 'Goals'}
              {currentStep === 5 && 'Exam Session'}
            </h2>
            {renderStepContent()}
          </div>

          {/* Navigation Buttons */}
          <div className="flex flex-col sm:flex-row justify-between gap-3 sm:gap-0">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 1}
              className="px-4 sm:px-6 py-2 sm:py-3 w-full sm:w-auto"
            >
              Back
            </Button>
            {currentStep < totalSteps ? (
              <Button
                variant="primary"
                onClick={handleNext}
                disabled={!canProceed()}
                className="px-4 sm:px-6 py-2 sm:py-3 w-full sm:w-auto"
              >
                Next
              </Button>
            ) : (
              <Button
                variant="primary"
                onClick={handleSubmit}
                disabled={!canProceed() || loading}
                className="px-4 sm:px-6 py-2 sm:py-3 w-full sm:w-auto"
              >
                {loading ? 'Saving...' : 'Complete Onboarding'}
              </Button>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default Onboarding

