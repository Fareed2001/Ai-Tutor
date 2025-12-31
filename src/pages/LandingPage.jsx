import Header from '../components/Header'
import Footer from '../components/Footer'
import Button from '../components/Button'
import Card from '../components/Card'

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-blue-50 py-12 sm:py-20 md:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 sm:mb-6 leading-tight px-2">
              Your Personal AI Chemistry Tutor
              <span className="block text-blue-600 mt-2">for O Levels</span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-600 mb-6 sm:mb-8 max-w-3xl mx-auto px-2">
              Learn chemistry the way a real teacher teaches — step by step, based on your level, following the Cambridge syllabus.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center px-2">
              <Button to="/signup" variant="primary" className="text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 w-full sm:w-auto">
                Get Started
              </Button>
              <Button href="#how-it-works" variant="secondary" className="text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 w-full sm:w-auto">
                How It Works
              </Button>
            </div>
          </div>
        </div>
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
          <div className="absolute top-40 right-10 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-12 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
              How It Works
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-2xl mx-auto px-2">
              Three simple steps to master O Level Chemistry
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">📊</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Assess Your Level</h3>
              <p className="text-gray-600">
                Student selects studied chapters and answers a few questions to determine their current understanding.
              </p>
            </Card>
            <Card className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🎓</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Personalized Teaching</h3>
              <p className="text-gray-600">
                AI explains concepts using syllabus-based notes & whiteboard style, tailored to your learning pace.
              </p>
            </Card>
            <Card className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">📈</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Practice & Progress</h3>
              <p className="text-gray-600">
                Past paper questions + feedback + progress tracking to ensure you're exam-ready.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-12 sm:py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
              Powerful Features
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-2xl mx-auto px-2">
              Everything you need to excel in O Level Chemistry
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <div className="flex items-start space-x-4">
                <div className="text-4xl">📘</div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Cambridge O Level Aligned</h3>
                  <p className="text-gray-600">Content follows the official Cambridge O Level Chemistry syllabus.</p>
                </div>
              </div>
            </Card>
            <Card>
              <div className="flex items-start space-x-4">
                <div className="text-4xl">🧠</div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Smart Level Detection</h3>
                  <p className="text-gray-600">AI automatically assesses your level and adapts teaching accordingly.</p>
                </div>
              </div>
            </Card>
            <Card>
              <div className="flex items-start space-x-4">
                <div className="text-4xl">✍️</div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Whiteboard Style Teaching</h3>
                  <p className="text-gray-600">Learn with visual explanations just like a real teacher's whiteboard.</p>
                </div>
              </div>
            </Card>
            <Card>
              <div className="flex items-start space-x-4">
                <div className="text-4xl">📄</div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Past Paper Practice</h3>
                  <p className="text-gray-600">Access to real past papers with detailed solutions and explanations.</p>
                </div>
              </div>
            </Card>
            <Card>
              <div className="flex items-start space-x-4">
                <div className="text-4xl">🎯</div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Exam-Oriented Approach</h3>
                  <p className="text-gray-600">Focus on what matters most for your O Level Chemistry exam.</p>
                </div>
              </div>
            </Card>
            <Card>
              <div className="flex items-start space-x-4">
                <div className="text-4xl">🧪</div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Chemistry Specialist AI</h3>
                  <p className="text-gray-600">AI trained specifically for chemistry education and O Level requirements.</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Who Is This For Section */}
      <section className="py-12 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
              Who Is This For?
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-2xl mx-auto px-2">
              Perfect for every O Level Chemistry student
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="text-center">
              <div className="text-5xl mb-4">🏫</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">School Students</h3>
              <p className="text-gray-600">Supplement your school learning with personalized AI tutoring.</p>
            </Card>
            <Card className="text-center">
              <div className="text-5xl mb-4">👤</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Private Candidates</h3>
              <p className="text-gray-600">Study independently with a comprehensive AI tutor by your side.</p>
            </Card>
            <Card className="text-center">
              <div className="text-5xl mb-4">🔄</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Retake Students</h3>
              <p className="text-gray-600">Improve your grade with targeted practice and focused learning.</p>
            </Card>
            <Card className="text-center">
              <div className="text-5xl mb-4">🌱</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Beginners</h3>
              <p className="text-gray-600">Start your chemistry journey with step-by-step guidance.</p>
            </Card>
          </div>
        </div>
      </section>

      {/* Call To Action Section */}
      <section className="py-12 sm:py-20 bg-gradient-to-br from-blue-600 to-blue-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4 sm:mb-6 px-2">
            Start Learning Chemistry the Smart Way
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-blue-100 mb-6 sm:mb-8 px-2">
            Join thousands of students mastering O Level Chemistry with AI-powered personalized tutoring.
          </p>
          <Button to="/signup" variant="secondary" className="text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 bg-white text-blue-600 hover:bg-gray-100 w-full sm:w-auto">
            Start Now →
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  )
}

export default LandingPage

