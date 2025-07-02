import { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import Layout from '../Layout';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import { getNames } from 'country-list';

const Profile = () => {
  const { darkMode } = useTheme();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  
  const [profileData, setProfileData] = useState({
    username: '',
    role: '',
    gender: '',
    phone: '',
    email: '',
    nationality: ''
  });

  // Get all countries from the library
  const countries = getNames();

  useEffect(() => {
    // Load user data from localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      const user = JSON.parse(userData);
      setProfileData({
        username: user.username || 'Demo User',
        role: user.role || 'project_member',
        gender: user.gender || '',
        phone: user.phone || '',
        email: user.email || 'demo@taskio.com',
        nationality: user.nationality || ''
      });
    }
  }, []);

  const handleChange = (e) => {
    setProfileData({
      ...profileData,
      [e.target.name]: e.target.value
    });
  };

  const handlePhoneChange = (value) => {
    setProfileData({
      ...profileData,
      phone: value || ''
    });
  };

  const handleSave = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Simulate API call - replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update localStorage
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      const updatedUser = { ...currentUser, ...profileData };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      setSuccess('Profile updated successfully!');
      setIsEditing(false);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    // Reset form data
    const userData = localStorage.getItem('user');
    if (userData) {
      const user = JSON.parse(userData);
      setProfileData({
        username: user.username || 'Demo User',
        role: user.role || 'project_member',
        gender: user.gender || '',
        phone: user.phone || '',
        email: user.email || 'demo@taskio.com',
        nationality: user.nationality || ''
      });
    }
    setIsEditing(false);
    setError('');
  };

  const getRoleDisplayName = (role) => {
    switch(role) {
      case 'project_member': return 'Project Member';
      case 'project_admin': return 'Project Admin';
      case 'team_lead': return 'Team Lead';
      default: return role;
    }
  };

  return (
    <Layout>
      {/* Profile Content */}
      <div className="max-w-3xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Header */}
          <div className="text-center mb-8">
            <h2 className={`text-3xl font-extrabold mb-2 ${
              darkMode 
                ? 'bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent'
                : 'text-gray-900'
            }`}>
              User Profile
            </h2>

          </div>

          {/* Profile Card */}
          <div className={`${darkMode ? 'bg-gray-800 border-purple-500/30' : 'bg-white border-purple-300'} border overflow-hidden shadow-xl rounded-lg`}>
            <div className="px-6 py-8">
              {/* Success/Error Messages */}
              {success && (
                <div className={`mb-6 px-4 py-3 rounded ${
                  darkMode 
                    ? 'bg-green-900/50 border border-green-500/50 text-green-300'
                    : 'bg-green-100 border border-green-300 text-green-700'
                }`}>
                  {success}
                </div>
              )}

              {error && (
                <div className={`mb-6 px-4 py-3 rounded ${
                  darkMode 
                    ? 'bg-red-900/50 border border-red-500/50 text-red-300'
                    : 'bg-red-100 border border-red-300 text-red-700'
                }`}>
                  {error}
                </div>
              )}

              {/* Profile Form - Single Column Layout */}
              <div className="space-y-6">
                {/* User Name */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    User Name
                  </label>
                  <input
                    type="text"
                    name="username"
                    value={profileData.username}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className={`w-full px-3 py-2 rounded-md transition-all duration-300 ${
                      darkMode 
                        ? `text-white ${
                            isEditing
                              ? 'bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500'
                              : 'bg-gray-700/50 border border-gray-600/50 cursor-not-allowed'
                          }`
                        : `text-gray-900 ${
                            isEditing
                              ? 'bg-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500'
                              : 'bg-gray-100 border border-gray-300 cursor-not-allowed'
                          }`
                    }`}
                  />
                </div>

                {/* Role - Read Only */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Role
                    <span className={`text-xs ml-2 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>(Cannot be changed)</span>
                  </label>
                  <input
                    type="text"
                    value={getRoleDisplayName(profileData.role)}
                    disabled={true}
                    className={`w-full px-3 py-2 rounded-md cursor-not-allowed ${
                      darkMode 
                        ? 'text-gray-400 bg-gray-700/30 border border-gray-600/30'
                        : 'text-gray-500 bg-gray-100 border border-gray-300'
                    }`}
                  />
                </div>

                {/* Gender */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Gender
                  </label>
                  <select
                    name="gender"
                    value={profileData.gender}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className={`w-full px-3 py-2 rounded-md transition-all duration-300 ${
                      darkMode 
                        ? `text-white ${
                            isEditing
                              ? 'bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500'
                              : 'bg-gray-700/50 border border-gray-600/50 cursor-not-allowed'
                          }`
                        : `text-gray-900 ${
                            isEditing
                              ? 'bg-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500'
                              : 'bg-gray-100 border border-gray-300 cursor-not-allowed'
                          }`
                    }`}
                  >
                    <option value="" className={`${darkMode ? 'bg-gray-700' : 'bg-white'}`}>Select Gender</option>
                    <option value="male" className={`${darkMode ? 'bg-gray-700' : 'bg-white'}`}>Male</option>
                    <option value="female" className={`${darkMode ? 'bg-gray-700' : 'bg-white'}`}>Female</option>
                    <option value="other" className={`${darkMode ? 'bg-gray-700' : 'bg-white'}`}>Other</option>
                    <option value="prefer_not_to_say" className={`${darkMode ? 'bg-gray-700' : 'bg-white'}`}>Prefer not to say</option>
                  </select>
                </div>

                {/* Phone Number with Full Country Support */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Phone Number
                  </label>
                  <div className={`phone-input-custom ${!isEditing ? 'disabled' : ''} ${darkMode ? 'dark' : 'light'}`}>
                    <PhoneInput
                      placeholder="Enter phone number"
                      value={profileData.phone}
                      onChange={handlePhoneChange}
                      disabled={!isEditing}
                      defaultCountry="US"
                      international
                      countryCallingCodeEditable={false}
                      className={`w-full ${
                        isEditing
                          ? darkMode ? 'text-white' : 'text-gray-900'
                          : darkMode ? 'text-gray-400 pointer-events-none' : 'text-gray-500 pointer-events-none'
                      }`}
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={profileData.email}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className={`w-full px-3 py-2 rounded-md transition-all duration-300 ${
                      darkMode 
                        ? `text-white ${
                            isEditing
                              ? 'bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500'
                              : 'bg-gray-700/50 border border-gray-600/50 cursor-not-allowed'
                          }`
                        : `text-gray-900 ${
                            isEditing
                              ? 'bg-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500'
                              : 'bg-gray-100 border border-gray-300 cursor-not-allowed'
                          }`
                    }`}
                  />
                </div>

                {/* Nationality - Full Country List */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Nationality
                  </label>
                  <select
                    name="nationality"
                    value={profileData.nationality}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className={`w-full px-3 py-2 rounded-md transition-all duration-300 ${
                      darkMode 
                        ? `text-white ${
                            isEditing
                              ? 'bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500'
                              : 'bg-gray-700/50 border border-gray-600/50 cursor-not-allowed'
                          }`
                        : `text-gray-900 ${
                            isEditing
                              ? 'bg-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500'
                              : 'bg-gray-100 border border-gray-300 cursor-not-allowed'
                          }`
                    }`}
                  >
                    <option value="" className={`${darkMode ? 'bg-gray-700' : 'bg-white'}`}>Select Country</option>
                    {countries.map((country) => (
                      <option key={country} value={country} className={`${darkMode ? 'bg-gray-700' : 'bg-white'}`}>
                        {country}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-8 flex justify-end space-x-4">
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className={`px-6 py-2 bg-gradient-to-r from-purple-600 to-cyan-600 text-white rounded-lg hover:from-purple-700 hover:to-cyan-700 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/25 focus:outline-none focus:ring-2 focus:ring-purple-400/50`}
                  >
                    Edit Profile
                  </button>
                ) : (
                  <>
                    <button
                      onClick={handleCancel}
                      className={`px-6 py-2 rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 ${
                        darkMode
                          ? 'text-gray-400 border border-gray-600 hover:text-white hover:bg-gray-700/50 focus:ring-gray-400/50'
                          : 'text-gray-600 border border-gray-300 hover:text-gray-900 hover:bg-gray-100 focus:ring-gray-400/50'
                      }`}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={loading}
                      className="px-6 py-2 bg-gradient-to-r from-purple-600 to-cyan-600 text-white rounded-lg hover:from-purple-700 hover:to-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/25 focus:outline-none focus:ring-2 focus:ring-purple-400/50"
                    >
                      {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Custom Styles for Phone Input */}
      <style jsx>{`
        .phone-input-custom.dark .PhoneInputInput {
          background-color: ${isEditing ? '#374151' : 'rgba(55, 65, 81, 0.5)'};
          border: 1px solid ${isEditing ? '#4B5563' : 'rgba(75, 85, 99, 0.5)'};
          border-radius: 0.375rem;
          color: white;
          padding: 0.5rem 0.75rem;
          transition: all 0.3s;
        }
        
        .phone-input-custom.light .PhoneInputInput {
          background-color: ${isEditing ? '#FFFFFF' : '#F3F4F6'};
          border: 1px solid ${isEditing ? '#D1D5DB' : '#D1D5DB'};
          border-radius: 0.375rem;
          color: #111827;
          padding: 0.5rem 0.75rem;
          transition: all 0.3s;
        }
        
        .phone-input-custom .PhoneInputInput:focus {
          outline: none;
          ring: 2px;
          ring-color: rgb(147, 51, 234);
          border-color: rgb(147, 51, 234);
        }
        
        .phone-input-custom.dark .PhoneInputCountrySelect {
          background-color: ${isEditing ? '#374151' : 'rgba(55, 65, 81, 0.5)'};
          border: 1px solid ${isEditing ? '#4B5563' : 'rgba(75, 85, 99, 0.5)'};
          border-radius: 0.375rem;
          color: white;
        }
        
        .phone-input-custom.light .PhoneInputCountrySelect {
          background-color: ${isEditing ? '#FFFFFF' : '#F3F4F6'};
          border: 1px solid ${isEditing ? '#D1D5DB' : '#D1D5DB'};
          border-radius: 0.375rem;
          color: #111827;
        }
        
        .phone-input-custom.disabled {
          pointer-events: none;
          opacity: 0.6;
        }
        
        .phone-input-custom.dark .PhoneInputCountrySelectArrow {
          color: #9CA3AF;
        }
        
        .phone-input-custom.light .PhoneInputCountrySelectArrow {
          color: #6B7280;
        }
      `}</style>
    </Layout>
  );
};

export default Profile; 