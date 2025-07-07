import { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import Layout from '../components/Layout';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import { getNames } from 'country-list';
import { Shield } from 'lucide-react';

const Profile = () => {
  const { darkMode } = useTheme();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  
  const [profileData, setProfileData] = useState({
    username: '',
    gender: '',
    phoneNumber: '',
    email: '',
    nationality: '',
    role: 'User',
    age: '',
  });

  // Get all countries from the library
  const countries = getNames();

  const handleChange = (e) => {
    setProfileData({
      ...profileData,
      [e.target.name]: e.target.value
    });
  };

  const handlePhoneChange = (value) => {
    setProfileData({
      ...profileData,
      phoneNumber: value || ''
    });
  };

  const handleSave = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Just log the data for now
      console.log('Profile data to save:', profileData);
      
      setSuccess('Profile updated successfully!');
      setIsEditing(false);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Update profile error:', err);
      setError('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setError('');
  };

  const getRoleBadgeColor = (role) => {
    switch (role?.toLowerCase()) {
      case 'admin':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-800 dark:text-purple-100';
      case 'user':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100';
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

              {/* Profile Form */}
              <div className="space-y-6">
                {/* Role Display */}
                <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                  <div className="flex items-center gap-2">
                    <Shield className={darkMode ? 'text-blue-400' : 'text-blue-500'} />
                    <div>
                      <div className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Account Role
                      </div>
                      <div className="mt-1">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColor(profileData.role)}`}>
                          {profileData.role}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Form Fields */}
                <div className="space-y-6">
                  {/* Username */}
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Username
                    </label>
                    <input
                      type="text"
                      name="username"
                      value={profileData.username}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className={`w-full px-3 py-2 rounded-md ${
                        darkMode 
                          ? `text-white ${
                              isEditing
                                ? 'bg-gray-700 border-gray-600'
                                : 'bg-gray-700/50 border-gray-600/50 cursor-not-allowed'
                            }`
                          : `text-gray-900 ${
                              isEditing
                                ? 'bg-white border-gray-300'
                                : 'bg-gray-100 border-gray-300 cursor-not-allowed'
                            }`
                      } border focus:ring-2 focus:ring-purple-500 focus:border-purple-500`}
                    />
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
                      className={`w-full px-3 py-2 rounded-md ${
                        darkMode 
                          ? `text-white ${
                              isEditing
                                ? 'bg-gray-700 border-gray-600'
                                : 'bg-gray-700/50 border-gray-600/50 cursor-not-allowed'
                            }`
                          : `text-gray-900 ${
                              isEditing
                                ? 'bg-white border-gray-300'
                                : 'bg-gray-100 border-gray-300 cursor-not-allowed'
                            }`
                      } border focus:ring-2 focus:ring-purple-500 focus:border-purple-500`}
                    />
                  </div>

                  {/* Age */}
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Age
                    </label>
                    <input
                      type="number"
                      name="age"
                      value={profileData.age}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className={`w-full px-3 py-2 rounded-md ${
                        darkMode 
                          ? `text-white ${
                              isEditing
                                ? 'bg-gray-700 border-gray-600'
                                : 'bg-gray-700/50 border-gray-600/50 cursor-not-allowed'
                            }`
                          : `text-gray-900 ${
                              isEditing
                                ? 'bg-white border-gray-300'
                                : 'bg-gray-100 border-gray-300 cursor-not-allowed'
                            }`
                      } border focus:ring-2 focus:ring-purple-500 focus:border-purple-500`}
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
                      className={`w-full px-3 py-2 rounded-md ${
                        darkMode 
                          ? `text-white ${
                              isEditing
                                ? 'bg-gray-700 border-gray-600'
                                : 'bg-gray-700/50 border-gray-600/50 cursor-not-allowed'
                            }`
                          : `text-gray-900 ${
                              isEditing
                                ? 'bg-white border-gray-300'
                                : 'bg-gray-100 border-gray-300 cursor-not-allowed'
                            }`
                      } border focus:ring-2 focus:ring-purple-500 focus:border-purple-500`}
                    >
                      <option value="">Select Gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                      <option value="prefer_not_to_say">Prefer not to say</option>
                    </select>
                  </div>

                  {/* Nationality */}
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Nationality
                    </label>
                    <select
                      name="nationality"
                      value={profileData.nationality}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className={`w-full px-3 py-2 rounded-md ${
                        darkMode 
                          ? `text-white ${
                              isEditing
                                ? 'bg-gray-700 border-gray-600'
                                : 'bg-gray-700/50 border-gray-600/50 cursor-not-allowed'
                            }`
                          : `text-gray-900 ${
                              isEditing
                                ? 'bg-white border-gray-300'
                                : 'bg-gray-100 border-gray-300 cursor-not-allowed'
                            }`
                      } border focus:ring-2 focus:ring-purple-500 focus:border-purple-500`}
                    >
                      <option value="">Select Nationality</option>
                      {countries.map((country) => (
                        <option key={country} value={country}>
                          {country}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Phone Number */}
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Phone Number
                    </label>
                    <div className={`phone-input-custom ${!isEditing ? 'disabled' : ''} ${darkMode ? 'dark' : 'light'}`}>
                      <PhoneInput
                        placeholder="Enter phone number"
                        value={profileData.phoneNumber}
                        onChange={handlePhoneChange}
                        disabled={!isEditing}
                        className={`w-full px-3 py-2 rounded-md ${
                          darkMode 
                            ? `text-white ${
                                isEditing
                                  ? 'bg-gray-700 border-gray-600'
                                  : 'bg-gray-700/50 border-gray-600/50 cursor-not-allowed'
                              }`
                            : `text-gray-900 ${
                                isEditing
                                  ? 'bg-white border-gray-300'
                                  : 'bg-gray-100 border-gray-300 cursor-not-allowed'
                              }`
                        } border focus:ring-2 focus:ring-purple-500 focus:border-purple-500`}
                      />
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-4 mt-8">
                  {!isEditing ? (
                    <button
                      onClick={() => setIsEditing(true)}
                      className={`px-4 py-2 rounded-md ${
                        darkMode
                          ? 'bg-purple-500 hover:bg-purple-600 text-white'
                          : 'bg-purple-600 hover:bg-purple-700 text-white'
                      }`}
                    >
                      Edit Profile
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={handleCancel}
                        className={`px-4 py-2 rounded-md ${
                          darkMode
                            ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                            : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                        }`}
                        disabled={loading}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSave}
                        className={`px-4 py-2 rounded-md ${
                          darkMode
                            ? 'bg-purple-500 hover:bg-purple-600 text-white'
                            : 'bg-purple-600 hover:bg-purple-700 text-white'
                        }`}
                        disabled={loading}
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