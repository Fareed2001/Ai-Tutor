import { Link } from 'react-router-dom'

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
          <div className="col-span-1 sm:col-span-2 md:col-span-2">
            <div className="flex items-center space-x-2 mb-3 sm:mb-4">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-base sm:text-lg">C</span>
              </div>
              <span className="text-lg sm:text-xl font-bold text-white">ChemMentor AI</span>
            </div>
            <p className="text-sm sm:text-base text-gray-400 max-w-md">
              Your personal AI Chemistry Tutor for O Levels. Learn chemistry the way a real teacher teaches.
            </p>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-4">Company</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="hover:text-white transition-colors">About</a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">Contact</a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-4">Legal</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="hover:text-white transition-colors">Privacy</a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">Terms</a>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <p className="text-gray-400">© 2025 ChemMentor AI. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer

