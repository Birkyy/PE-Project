import { useState, useEffect } from 'react';
import { Shield, Users, Trash2, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import Layout from '../components/Layout';

const Privacy = () => {
  const navigate = useNavigate();
  const { darkMode } = useTheme();
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');

  // State for privacy settings
  const [privacySettings, setPrivacySettings] = useState({
    dataSharing: false,
    twoFactorAuth: false,
    activityLog: true
  });

  // Load saved settings on component mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('privacySettings');
    if (savedSettings) {
      setPrivacySettings(JSON.parse(savedSettings));
    }
  }, []);

  // Handle toggle changes
  const handleToggle = (setting) => {
    setPrivacySettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
    // Clear any previous save status when settings change
    setSaveStatus('');
  };

  const handleBack = () => {
    navigate(-1); // Go back to the previous page
  };

  // Save changes
  const handleSave = async () => {
    setIsSaving(true);
    setSaveStatus('');

    try {
      // Save to localStorage
      localStorage.setItem('privacySettings', JSON.stringify(privacySettings));
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setSaveStatus('success');
      setTimeout(() => setSaveStatus(''), 3000); // Clear success message after 3 seconds
    } catch (error) {
      setSaveStatus('error');
    } finally {
      setIsSaving(false);
    }
  };

  const content = (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header with Back Button */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-6">
            <button
              onClick={handleBack}
              className={`p-2 rounded-lg transition-all duration-200 ${
                darkMode 
                  ? 'text-gray-400 hover:text-white hover:bg-gray-800' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
              aria-label="Go back"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Privacy Settings
            </h1>
          </div>
          <p className={`mt-2 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Manage your privacy preferences and control how your information is handled.
          </p>
        </div>

        {/* Settings Sections */}
        <div className="space-y-6">
          {/* Data Sharing */}
          <div className={`p-6 rounded-lg border ${
            darkMode ? 'bg-gray-800 border-purple-500/30' : 'bg-white border-gray-200'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Shield className={darkMode ? 'text-purple-400' : 'text-purple-600'} />
                <div>
                  <h3 className={`text-lg font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    Data Sharing
                  </h3>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Allow sharing of non-sensitive data to improve our services
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleToggle('dataSharing')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${
                  privacySettings.dataSharing ? 'bg-purple-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    privacySettings.dataSharing ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Two-Factor Authentication */}
          <div className={`p-6 rounded-lg border ${
            darkMode ? 'bg-gray-800 border-purple-500/30' : 'bg-white border-gray-200'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Users className={darkMode ? 'text-purple-400' : 'text-purple-600'} />
                <div>
                  <h3 className={`text-lg font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    Two-Factor Authentication
                  </h3>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Add an extra layer of security to your account
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleToggle('twoFactorAuth')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${
                  privacySettings.twoFactorAuth ? 'bg-purple-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    privacySettings.twoFactorAuth ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Activity Log */}
          <div className={`p-6 rounded-lg border ${
            darkMode ? 'bg-gray-800 border-purple-500/30' : 'bg-white border-gray-200'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Trash2 className={darkMode ? 'text-purple-400' : 'text-purple-600'} />
                <div>
                  <h3 className={`text-lg font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    Activity Log
                  </h3>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Keep track of your account activity
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleToggle('activityLog')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${
                  privacySettings.activityLog ? 'bg-purple-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    privacySettings.activityLog ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Save Button and Status */}
          <div className="flex justify-end items-center space-x-4">
            {saveStatus === 'success' && (
              <p className={`text-sm ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
                Settings saved successfully!
              </p>
            )}
            {saveStatus === 'error' && (
              <p className={`text-sm ${darkMode ? 'text-red-400' : 'text-red-600'}`}>
                Failed to save settings. Please try again.
              </p>
            )}
            <button
              onClick={handleSave}
              disabled={isSaving}
              className={`px-4 py-2 rounded-md font-medium transition-all duration-200 ${
                darkMode
                  ? 'bg-purple-600 hover:bg-purple-700 text-white disabled:bg-purple-500/50'
                  : 'bg-purple-600 hover:bg-purple-700 text-white disabled:bg-purple-400'
              } disabled:cursor-not-allowed`}
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return <Layout>{content}</Layout>;
};

export default Privacy; 