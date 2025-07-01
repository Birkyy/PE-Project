import { useTheme } from '../context/ThemeContext';
import { Star, Zap, Shield, Cpu } from 'lucide-react';

const TailwindShowcase = () => {
  const { darkMode } = useTheme();

  return (
    <div className={`min-h-screen p-8 ${darkMode ? 'bg-gradient-cyberpunk' : 'bg-gray-50'}`}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in">
          <h1 className={`text-4xl font-bold mb-4 ${
            darkMode ? 'text-gradient-cyber text-glow-purple' : 'text-gray-900'
          }`}>
            Tailwind CSS Enhanced Features
          </h1>
          <p className={`text-lg text-responsive-lg ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Showcase of custom Tailwind utilities and cyberpunk theme
          </p>
        </div>

        {/* Buttons Section */}
        <div className="mb-12">
          <h2 className={`text-2xl font-semibold mb-6 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
            Custom Buttons
          </h2>
          <div className="flex flex-wrap gap-4">
            <button className="btn-cyberpunk">
              <Zap className="w-5 h-5 mr-2 inline" />
              Cyberpunk Button
            </button>
            <button className={`px-6 py-3 rounded-lg transition-all duration-300 ${
              darkMode 
                ? 'bg-purple-600 hover:bg-purple-700 hover:shadow-glow-purple text-white' 
                : 'bg-purple-500 hover:bg-purple-600 text-white hover:shadow-lg'
            }`}>
              <Star className="w-5 h-5 mr-2 inline" />
              Standard Button
            </button>
          </div>
        </div>

        {/* Cards Section */}
        <div className="mb-12">
          <h2 className={`text-2xl font-semibold mb-6 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
            Custom Cards
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className={`${darkMode ? 'card-cyberpunk' : 'bg-white border-2 border-purple-200 rounded-xl hover:shadow-lg'} p-6 animate-fade-in`}>
              <Shield className="w-8 h-8 text-purple-400 mb-4 animate-float" />
              <h3 className={`text-lg font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                Purple Card
              </h3>
              <p className={`text-responsive ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Card with purple cyberpunk styling and glow effects.
              </p>
            </div>

            <div className={`${darkMode ? 'card-cyberpunk-cyan' : 'bg-white border-2 border-cyan-200 rounded-xl hover:shadow-lg'} p-6 animate-fade-in`}>
              <Cpu className="w-8 h-8 text-cyan-400 mb-4 animate-float" />
              <h3 className={`text-lg font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                Cyan Card
              </h3>
              <p className={`text-responsive ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Card with cyan cyberpunk styling and hover effects.
              </p>
            </div>

            <div className={`${darkMode ? 'glass-dark' : 'glass'} p-6 rounded-xl animate-fade-in`}>
              <Star className="w-8 h-8 text-pink-400 mb-4 animate-float" />
              <h3 className={`text-lg font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                Glass Card
              </h3>
              <p className={`text-responsive ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Glassmorphism effect with backdrop blur.
              </p>
            </div>
          </div>
        </div>

        {/* Form Elements */}
        <div className="mb-12">
          <h2 className={`text-2xl font-semibold mb-6 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
            Form Elements
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Cyberpunk Input
              </label>
              <input 
                type="text" 
                placeholder="Enter text here..."
                className={`w-full ${darkMode ? 'input-cyberpunk' : 'border-2 border-gray-300 rounded-lg px-4 py-2 focus:border-purple-500 focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50'}`}
              />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Select with Custom Styling
              </label>
              <select className={`w-full ${darkMode ? 'input-cyberpunk' : 'border-2 border-gray-300 rounded-lg px-4 py-2 focus:border-purple-500 focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50'}`}>
                <option>Option 1</option>
                <option>Option 2</option>
                <option>Option 3</option>
              </select>
            </div>
          </div>
        </div>

        {/* Status Indicators */}
        <div className="mb-12">
          <h2 className={`text-2xl font-semibold mb-6 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
            Status Indicators
          </h2>
          <div className="flex flex-wrap gap-4">
            <span className="status-success px-4 py-2 rounded-lg text-sm font-medium">
              Success Status
            </span>
            <span className="status-warning px-4 py-2 rounded-lg text-sm font-medium">
              Warning Status
            </span>
            <span className="status-error px-4 py-2 rounded-lg text-sm font-medium">
              Error Status
            </span>
            <span className="status-info px-4 py-2 rounded-lg text-sm font-medium">
              Info Status
            </span>
          </div>
        </div>

        {/* Animations */}
        <div className="mb-12">
          <h2 className={`text-2xl font-semibold mb-6 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
            Animations
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} p-4 rounded-lg text-center border animate-pulse-slow`}>
              <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Slow Pulse</p>
            </div>
            <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} p-4 rounded-lg text-center border animate-bounce-gentle`}>
              <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Gentle Bounce</p>
            </div>
            <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} p-4 rounded-lg text-center border animate-float`}>
              <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Float</p>
            </div>
            <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} p-4 rounded-lg text-center border animate-glow`}>
              <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Glow Effect</p>
            </div>
          </div>
        </div>

        {/* Text Effects */}
        <div className="text-center">
          <h2 className={`text-2xl font-semibold mb-6 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
            Text Effects
          </h2>
          <div className="space-y-4">
            <p className={`text-xl ${darkMode ? 'text-gradient-purple' : 'text-purple-600'}`}>
              Purple Gradient Text
            </p>
            <p className={`text-xl ${darkMode ? 'text-gradient-cyber' : 'text-purple-600'}`}>
              Cyberpunk Gradient Text
            </p>
            <p className={`text-xl ${darkMode ? 'text-glow-purple text-purple-400' : 'text-purple-600'}`}>
              Glowing Purple Text
            </p>
            <p className={`text-xl ${darkMode ? 'text-glow-cyan text-cyan-400' : 'text-cyan-600'}`}>
              Glowing Cyan Text
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TailwindShowcase; 