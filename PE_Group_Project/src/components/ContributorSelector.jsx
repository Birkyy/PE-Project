import { useState, useRef, useEffect } from "react";
import { useTheme } from "../context/ThemeContext";
import { Search, X, Users, ChevronDown } from "lucide-react";

const ContributorSelector = ({
  availableUsers = [],
  selectedContributors = [],
  onChange,
  disabled = false,
  loading = false,
  error = null,
  placeholder = "Search contributors..."
}) => {
  const { darkMode } = useTheme();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef(null);

  // Filter users based on search term and exclude already selected
  const filteredUsers = availableUsers.filter(user => {
    const userName = user.username || user.Username || "";
    const userEmail = user.email || user.Email || "";
    const searchMatch = userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       userEmail.toLowerCase().includes(searchTerm.toLowerCase());
    const notSelected = !selectedContributors.some(
      selected => (selected.userId || selected.UserId || selected.id) === (user.userId || user.UserId || user.id)
    );
    return searchMatch && notSelected;
  });

  // Handle clicking outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
        setSearchTerm("");
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleUserSelect = (user) => {
    const contributorToAdd = {
      id: user.userId || user.UserId || user.id,
      userId: user.userId || user.UserId || user.id,
      UserId: user.userId || user.UserId || user.id,
      username: user.username || user.Username,
      Username: user.username || user.Username,
      email: user.email || user.Email,
      Email: user.email || user.Email
    };
    
    const newContributors = [...selectedContributors, contributorToAdd];
    onChange(newContributors);
    setSearchTerm("");
    setIsDropdownOpen(false);
  };

  const handleUserRemove = (contributorId) => {
    const newContributors = selectedContributors.filter(
      contributor => (contributor.userId || contributor.UserId || contributor.id) !== contributorId
    );
    onChange(newContributors);
  };

  // Get user display information
  const getUserInfo = (user) => {
    const id = user.userId || user.UserId || user.id;
    const name = user.username || user.Username || "Unknown User";
    const email = user.email || user.Email || "";
    return { id, name, email };
  };

  return (
    <div className="space-y-3">
      {/* Search Input */}
      <div className="relative" ref={dropdownRef}>
        <div className="relative">
          <input
            type="text"
            placeholder={placeholder}
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setIsDropdownOpen(true);
            }}
            onFocus={() => setIsDropdownOpen(true)}
            disabled={disabled || loading}
            className={`w-full px-3 py-2 pl-10 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400/50 transition-all duration-300 ${
              darkMode
                ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
            } ${disabled || loading ? "opacity-50 cursor-not-allowed" : ""}`}
          />
          <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${
            darkMode ? "text-gray-400" : "text-gray-500"
          }`} />
          <ChevronDown className={`absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 transition-transform ${
            isDropdownOpen ? "rotate-180" : ""
          } ${darkMode ? "text-gray-400" : "text-gray-500"}`} />
        </div>

        {/* Dropdown */}
        {isDropdownOpen && !disabled && !loading && (
          <div className={`absolute z-10 w-full mt-1 max-h-60 overflow-y-auto rounded-lg border shadow-lg ${
            darkMode
              ? "bg-gray-700 border-gray-600"
              : "bg-white border-gray-300"
          }`}>
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => {
                const { id, name, email } = getUserInfo(user);
                return (
                  <div
                    key={id}
                    onClick={() => handleUserSelect(user)}
                    className={`px-4 py-3 cursor-pointer transition-colors ${
                      darkMode
                        ? "hover:bg-gray-600 text-white"
                        : "hover:bg-gray-50 text-gray-900"
                    }`}
                  >
                    <div className="font-medium">{name}</div>
                    {email && (
                      <div className={`text-sm ${
                        darkMode ? "text-gray-400" : "text-gray-600"
                      }`}>
                        {email}
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className={`px-4 py-3 text-center ${
                darkMode ? "text-gray-400" : "text-gray-500"
              }`}>
                {searchTerm ? "No users found" : "No more contributors available"}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Loading/Error Messages */}
      {loading && (
        <p className="text-xs text-gray-400">Loading users...</p>
      )}
      {error && (
        <p className="text-xs text-red-400">{error}</p>
      )}

      {/* Selected Contributors Cards */}
      {selectedContributors.length > 0 && (
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${
            darkMode ? "text-gray-300" : "text-gray-700"
          }`}>
            <Users className="w-4 h-4 inline mr-2" />
            Selected Contributors ({selectedContributors.length})
          </label>
          <div className="flex flex-wrap gap-2">
            {selectedContributors.map((contributor) => {
              const { id, name, email } = getUserInfo(contributor);
              return (
                <div
                  key={id}
                  className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border transition-all duration-200 ${
                    darkMode
                      ? "bg-gray-700 border-gray-600 text-white"
                      : "bg-gray-50 border-gray-200 text-gray-900"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      darkMode
                        ? "bg-purple-600 text-white"
                        : "bg-purple-100 text-purple-600"
                    }`}>
                      {name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="font-medium text-sm truncate">{name}</div>
                      {email && (
                        <div className={`text-xs truncate ${
                          darkMode ? "text-gray-400" : "text-gray-600"
                        }`}>
                          {email}
                        </div>
                      )}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleUserRemove(id)}
                    disabled={disabled}
                    className={`p-1 rounded-full transition-colors ${
                      darkMode
                        ? "hover:bg-gray-600 text-gray-400 hover:text-white"
                        : "hover:bg-gray-200 text-gray-500 hover:text-gray-700"
                    } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default ContributorSelector; 