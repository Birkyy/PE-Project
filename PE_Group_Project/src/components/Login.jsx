import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../API/api';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [accountLocked, setAccountLocked] = useState(false);
  const [remainingAttempts, setRemainingAttempts] = useState(5);
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);

  // Login attempt management functions
  const getFailedAttempts = (email) => {
    const attempts = localStorage.getItem(`failedAttempts_${email}`);
    return attempts ? parseInt(attempts) : 0;
  };

  const setFailedAttempts = (email, count) => {
    localStorage.setItem(`failedAttempts_${email}`, count.toString());
  };

  const isAccountLocked = (email) => {
    const lockStatus = localStorage.getItem(`accountLocked_${email}`);
    return lockStatus === 'true';
  };

  const lockAccount = (email) => {
    localStorage.setItem(`accountLocked_${email}`, 'true');
    localStorage.setItem(`lockTime_${email}`, new Date().toISOString());
  };

  const unlockAccount = (email) => {
    localStorage.removeItem(`accountLocked_${email}`);
    localStorage.removeItem(`lockTime_${email}`);
    localStorage.removeItem(`failedAttempts_${email}`);
  };

  const resetFailedAttempts = (email) => {
    localStorage.removeItem(`failedAttempts_${email}`);
  };

  const checkAccountStatus = (email) => {
    if (isAccountLocked(email)) {
      setAccountLocked(true);
      setError('Account is locked due to multiple failed login attempts. Please contact an administrator to unlock your account.');
      return false;
    }
    const attempts = getFailedAttempts(email);
    setRemainingAttempts(5 - attempts);
    setAccountLocked(false);
    return true;
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    
    // Check account status when email changes
    if (e.target.name === 'email' && e.target.value) {
      checkAccountStatus(e.target.value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Check if account is locked before attempting login
    if (!checkAccountStatus(formData.email)) {
      setLoading(false);
      return;
    }

    try {
      const response = await api.post('/auth/login', formData);
      console.log('Login successful:', response.data);
      
      // Reset failed attempts on successful login
      resetFailedAttempts(formData.email);
      
      // Store token if provided
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
      }
      
      // Store user data
      if (response.data.user) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      
      // Navigate to dashboard after successful login
      navigate('/home');
    } catch (error) {
      // Handle failed login attempt
      const currentAttempts = getFailedAttempts(formData.email);
      const newAttempts = currentAttempts + 1;
      
      if (newAttempts >= 5) {
        // Lock account after 5 failed attempts
        lockAccount(formData.email);
        setAccountLocked(true);
        setError('Account has been locked due to 5 failed login attempts. Please contact an administrator to unlock your account.');
      } else {
        // Update failed attempts count
        setFailedAttempts(formData.email, newAttempts);
        const remaining = 5 - newAttempts;
        setRemainingAttempts(remaining);
        setError(`Invalid credentials. ${remaining} attempt${remaining !== 1 ? 's' : ''} remaining before account lockout.`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    // Set demo user data for skip functionality
    const demoUser = {
      username: 'Demo User',
      email: 'demo@taskio.com',
      role: 'project_member'
    };
    
    localStorage.setItem('token', 'demo-token');
    localStorage.setItem('user', JSON.stringify(demoUser));
    navigate('/home');
  };

  const handleForgotPassword = (e) => {
    e.preventDefault();
    setShowForgotPasswordModal(true);
  };

  const closeForgotPasswordModal = () => {
    setShowForgotPasswordModal(false);
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
            Task.io
          </h1>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-gray-800 border border-purple-500/30 py-8 px-4 shadow-xl sm:rounded-lg sm:px-10 backdrop-blur-sm">
          <h2 className="text-center text-3xl font-extrabold text-white mb-6">
            Sign in to your account
          </h2>
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className={`border px-4 py-3 rounded ${
                accountLocked 
                  ? 'bg-red-900/50 border-red-500/50 text-red-300' 
                  : 'bg-red-900/50 border-red-500/50 text-red-300'
              }`}>
                <div className="flex items-center">
                  {accountLocked && <span className="mr-2">🔒</span>}
                  <span>{error}</span>
                </div>
              </div>
            )}

            {formData.email && !accountLocked && remainingAttempts < 5 && remainingAttempts > 0 && (
              <div className="bg-yellow-900/50 border border-yellow-500/50 text-yellow-300 px-4 py-3 rounded">
                <div className="flex items-center">
                  <span className="mr-2">⚠️</span>
                  <span>Warning: {remainingAttempts} login attempt{remainingAttempts !== 1 ? 's' : ''} remaining</span>
                </div>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                Email address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="appearance-none block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md placeholder-gray-400 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 sm:text-sm transition-all duration-300"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300">
                Password
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="appearance-none block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md placeholder-gray-400 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 sm:text-sm transition-all duration-300"
                  placeholder="Enter your password"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="text-sm">
                <button 
                  type="button"
                  onClick={handleForgotPassword}
                  className="font-medium text-purple-400 hover:text-purple-300 transition-colors duration-300 underline"
                >
                  Forgot password?
                </button>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading || accountLocked}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/25"
              >
                {accountLocked ? '🔒 Account Locked' : loading ? 'Signing in...' : 'Sign in'}
              </button>
            </div>

            <div className="text-center space-y-3">
              <div>
                <span className="text-sm text-gray-400">
                  Don't have an account?{' '}
                  <Link to="/register" className="font-medium text-purple-400 hover:text-purple-300 transition-colors duration-300">
                    Sign up
                  </Link>
                </span>
              </div>
              
              {/* Demo Instructions */}
              <div className="border-t border-gray-700 pt-4 space-y-2">
                <p className="text-xs text-gray-500">
                  Test Account Locking: Use any email and try wrong passwords 5 times
                </p>
                <button
                  type="button"
                  onClick={handleSkip}
                  className="w-full py-2 px-4 text-sm text-gray-400 hover:text-white hover:bg-gray-700/50 border border-gray-600 rounded-md transition-all duration-300 hover:border-purple-500/50"
                >
                  🚀 Skip for now (Demo Mode)
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotPasswordModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 border border-purple-500/30 rounded-lg p-6 max-w-md w-full shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-white">Password Reset</h3>
              <button
                onClick={closeForgotPasswordModal}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <span className="text-2xl">&times;</span>
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="bg-blue-900/30 border border-blue-500/50 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <span className="text-blue-400 mr-2">ℹ️</span>
                  <h4 className="text-blue-300 font-semibold">Contact Administrator</h4>
                </div>
                <p className="text-gray-300 text-sm mb-3">
                  To reset your password, please contact our system administrator:
                </p>
                
                <div className="space-y-2">
                  <div className="flex items-center text-sm">
                    <span className="text-purple-400 mr-2">📞</span>
                    <span className="text-gray-300">Phone: </span>
                    <span className="text-white font-mono ml-1">+1 (555) 123-4567</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <span className="text-purple-400 mr-2">📧</span>
                    <span className="text-gray-300">Email: </span>
                    <span className="text-white font-mono ml-1">admin@taskio.com</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <span className="text-purple-400 mr-2">🕒</span>
                    <span className="text-gray-300">Hours: Mon-Fri 9AM-5PM EST</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-yellow-900/30 border border-yellow-500/50 rounded-lg p-3">
                <p className="text-yellow-300 text-xs">
                  💡 <strong>Tip:</strong> Have your username and registered email ready when you contact support.
                </p>
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <button
                onClick={closeForgotPasswordModal}
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 text-white rounded-md transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/25"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login; 