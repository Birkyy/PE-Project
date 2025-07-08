import { useState, useEffect } from "react";
import { useTheme } from "../context/ThemeContext";
import Layout from "../components/Layout";
import { useNavigate } from "react-router-dom";
import {
  Shield,
  Search,
  Edit2,
  Trash2,
  X,
  Eye,
  EyeOff,
  Unlock,
  Lock,
  Download,
} from "lucide-react";
import { userAPI } from "../API/apiService.js";

const UsersManagement = () => {
  const { darkMode } = useTheme();
  const navigate = useNavigate();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    age: "",
    gender: "",
    nationality: "",
    phoneNumber: "",
    role: "User",
  });
  const [editFormData, setEditFormData] = useState({
    username: "",
    email: "",
    password: "",
    age: "",
    gender: "",
    nationality: "",
    phoneNumber: "",
    role: "user",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [lockedAccounts, setLockedAccounts] = useState([]);
  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;

  // Check user permissions on component mount
  useEffect(() => {
    if (!user) {
      // No user found, redirect to login
      navigate("/login");
      return;
    }

    // Check if user is admin, if not redirect to dashboard
    if (user?.role?.toLowerCase() !== 'admin') {
      alert("Access denied. Only administrators can access user management.");
      navigate("/home");
      return;
    }
  }, [user, navigate]);

  // Fetch users from API
  const fetchUsers = async () => {
    try {
      setLoading(true);
      console.log("Fetching users from API...");
      const response = await userAPI.getAllUsers();
      console.log("API response:", response);

      // Handle if response or data is undefined
      const apiUsers = response?.data ?? response; // depending on how getAllUsers returns data

      if (!Array.isArray(apiUsers)) {
        throw new Error("API did not return a list of users.");
      }

      const transformedUsers = apiUsers.map((user) => ({
        id: user.userId,
        name: user.username,
        username: user.username,
        email: user.email,
        age: user.age,
        gender: user.gender,
        nationality: user.nationality,
        phoneNumber: user.phoneNumber,
        status: user.status,
        role: user.role,
      }));

      setUsers(transformedUsers);
      console.log("Users loaded successfully:", transformedUsers);
    } catch (err) {
      console.error("Error fetching users:", err);
      console.error("Error details:", {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
        url: err.config?.url,
      });
    } finally {
      setLoading(false);
    }
  };

  // Account lock management functions
  const getLockedAccounts = () => {
    const locked = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith("accountLocked_")) {
        const email = key.replace("accountLocked_", "");
        const lockTime = localStorage.getItem(`lockTime_${email}`);
        const failedAttempts = localStorage.getItem(`failedAttempts_${email}`);
        locked.push({
          email,
          lockTime: lockTime ? new Date(lockTime) : new Date(),
          failedAttempts: failedAttempts ? parseInt(failedAttempts) : 0,
        });
      }
    }
    return locked;
  };

  const unlockAccount = (email) => {
    localStorage.removeItem(`accountLocked_${email}`);
    localStorage.removeItem(`lockTime_${email}`);
    localStorage.removeItem(`failedAttempts_${email}`);

    // Update locked accounts list
    setLockedAccounts(getLockedAccounts());
    setSuccess(`Account ${email} has been unlocked successfully!`);

    // Clear success message after 3 seconds
    setTimeout(() => setSuccess(""), 3000);
  };

  // Load users and locked accounts on component mount
  useEffect(() => {
    fetchUsers();
    setLockedAccounts(getLockedAccounts());
  }, []);

  // Refresh locked accounts every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setLockedAccounts(getLockedAccounts());
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // Filter users based on search term
  const filteredUsers = users.filter((user) => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      (user.name && user.name.toLowerCase().includes(searchLower)) ||
      (user.username && user.username.toLowerCase().includes(searchLower)) ||
      (user.email && user.email.toLowerCase().includes(searchLower)) ||
      (user.role && user.role.toLowerCase().includes(searchLower)) ||
      (user.nationality && user.nationality.toLowerCase().includes(searchLower)) ||
      (user.phoneNumber && user.phoneNumber.toLowerCase().includes(searchLower)) ||
      (user.status && user.status.toLowerCase().includes(searchLower))
    );
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const requestData = {
        Username: formData.username,
        Email: formData.email,
        Password: formData.password,
        Role: formData.role,
      };

      const response = await userAPI.createUser(requestData);

      setSuccess("User created successfully!");
      setFormData({
        username: "",
        email: "",
        password: "",
        role: "User",
      });

      // Refresh users list
      await fetchUsers();

      // Close modal after 2 seconds
      setTimeout(() => {
        setShowCreateModal(false);
        setSuccess("");
      }, 1500);
    } catch (err) {
      console.error("Create user error:", err);
      let errorMessage = "Failed to create user. Please try again.";

      if (err.response?.data) {
        if (typeof err.response.data === "string") {
          errorMessage = err.response.data;
        } else if (err.response.data.message) {
          errorMessage = err.response.data.message;
        } else if (err.response.data.title) {
          errorMessage = err.response.data.title;
        }
      } else if (err.message) {
        errorMessage = err.message;
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleEditUser = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const updateData = {
        Username: editFormData.username,
        Email: editFormData.email,
        Role: editFormData.role || null,
      };

      // Only include password if it's provided
      if (editFormData.password && editFormData.password.trim() !== "") {
        updateData.Password = editFormData.password;
      }

      const response = await userAPI.updateUser(selectedUser.id, updateData);

      setSuccess("User updated successfully!");

      // Refresh users list to show updated data
      await fetchUsers();

      // Close modal after 2 seconds
      setTimeout(() => {
        setShowEditModal(false);
        setSuccess("");
        setSelectedUser(null);
      }, 2000);
    } catch (err) {
      console.error("Update user error:", err);
      let errorMessage = "Failed to update user. Please try again.";

      if (err.response?.data) {
        if (typeof err.response.data === "string") {
          errorMessage = err.response.data;
        } else if (err.response.data.message) {
          errorMessage = err.response.data.message;
        } else if (err.response.data.title) {
          errorMessage = err.response.data.title;
        }
      } else if (err.message) {
        errorMessage = err.message;
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setShowCreateModal(true);
    setError("");
    setSuccess("");
  };

  const closeCreateModal = () => {
    setShowCreateModal(false);
    setFormData({
      username: "",
      email: "",
      password: "",
      age: "",
      gender: "",
      nationality: "",
      phoneNumber: "",
      role: "User",
    });
    setError("");
    setSuccess("");
  };

  const openEditModal = async (user) => {
    try {
      setLoading(true);
      setError("");
      setSuccess("");

      // Try to fetch full user details from API
      try {
        const response = await userAPI.getUserById(user.id);
        const userData = response.data;

        setSelectedUser(user);
        setEditFormData({
          id: user.id,
          username: userData.username || user.name,
          email: userData.email,
          password: "",
          role: userData.role || "user",
        });
      } catch (apiError) {
        // If API call fails, use the user data we already have
        setSelectedUser(user);
        setEditFormData({
          username: user.name,
          email: user.email,
          password: "",
          role: user.role || "user",
        });
      }

      setShowEditModal(true);
    } catch (err) {
      setError("Failed to open edit modal. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setSelectedUser(null);
    setEditFormData({
      username: "",
      email: "",
      password: "",
      age: "",
      gender: "",
      nationality: "",
      phoneNumber: "",
      role: "user",
    });
    setError("");
    setSuccess("");
  };

  const openViewModal = async (user) => {
    try {
      setLoading(true);
      setError("");
      setSuccess("");

      // Try to fetch full user details from API
      try {
        const response = await userAPI.getUserById(user.id);
        const userData = response.data;

        setSelectedUser({
          ...user,
          ...userData,
          name: userData.username || user.name,
        });
      } catch (apiError) {
        // If API call fails, use the user data we already have
        setSelectedUser(user);
      }

      setShowViewModal(true);
    } catch (err) {
      setError("Failed to load user details. Please try again.");
      setSelectedUser(user); // Fallback to basic user data
      setShowViewModal(true);
    } finally {
      setLoading(false);
    }
  };

  const closeViewModal = () => {
    setShowViewModal(false);
    setSelectedUser(null);
    setError("");
    setSuccess("");
  };

  const handleEditClick = (user) => {
    setSelectedUser(user);
    setEditFormData({
      id: user.id,
      username: user.name,
      email: user.email,
      password: "",
      age: user.age || "",
      gender: user.gender || "",
      nationality: user.nationality || "",
      phoneNumber: user.phoneNumber || "",
      role: user.role || "user",
    });
    setShowEditModal(true);
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();

    // Validate password if it's being changed
    if (editFormData.password) {
      const passwordRegex =
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
      if (!passwordRegex.test(editFormData.password)) {
        alert(
          "Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number and one special character"
        );
        return;
      }
    }

    setUsers(
      users.map((user) => {
        if (user.id === selectedUser.id) {
          return {
            ...user,
            role: editFormData.role,
            // Password would be handled by the backend
          };
        }
        return user;
      })
    );

    setShowEditModal(false);
    setSelectedUser(null);
    setEditFormData({
      username: "",
      email: "",
      password: "",
      age: "",
      gender: "",
      nationality: "",
      phoneNumber: "",
      role: "user",
    });
  };

  const handleDeleteUser = (userId) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      setUsers(users.filter((user) => user.id !== userId));
    }
  };

  const getRoleBadgeColor = (role) => {
    switch (role?.toLowerCase()) {
      case "admin":
        return "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-800 dark:text-purple-100";
      case "user":
        return "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100";
      default:
        return "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100";
    }
  };

  // CSV Export Function
  const exportUsersToCSV = () => {
    try {
      // Define CSV headers
      const headers = [
        "Name",
        "Username",
        "Email",
        "Age",
        "Gender",
        "Nationality",
        "Phone Number",
        "Role",
        "Status",
      ];

      // Convert users data to CSV format
      const csvData = filteredUsers.map((user) => [
        user.name || "",
        user.username || user.name || "",
        user.email || "",
        user.age || "",
        user.gender || "",
        user.nationality || "",
        user.phoneNumber || "",
        user.role || "",
        user.status || "",
      ]);

      // Combine headers and data
      const csvContent = [headers, ...csvData]
        .map((row) =>
          row
            .map((field) => {
              // Escape quotes and wrap fields containing commas, quotes, or newlines
              const fieldStr = String(field);
              if (
                fieldStr.includes(",") ||
                fieldStr.includes('"') ||
                fieldStr.includes("\n")
              ) {
                return `"${fieldStr.replace(/"/g, '""')}"`;
              }
              return fieldStr;
            })
            .join(",")
        )
        .join("\n");

      // Create and download the file
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");

      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);

        // Generate filename with current date
        const currentDate = new Date().toISOString().split("T")[0];
        const filename = `users_export_${currentDate}.csv`;
        link.setAttribute("download", filename);

        link.style.visibility = "hidden";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Show success message
        setSuccess(`Users exported successfully! Downloaded as ${filename}`);
        setTimeout(() => setSuccess(""), 3000);
      }
    } catch (error) {
      console.error("Error exporting users to CSV:", error);
      setError("Failed to export users. Please try again.");
      setTimeout(() => setError(""), 3000);
    }
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="text-center mb-8">
            <h2
              className={`text-3xl font-extrabold mb-4 ${
                darkMode
                  ? "bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent"
                  : "text-gray-900"
              }`}
            >
              Users Management
            </h2>
            <div className="mb-8 flex justify-center">
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`px-4 py-2 w-96 rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${
                  darkMode
                    ? "bg-gray-700 border border-gray-600 placeholder-gray-400 text-white"
                    : "bg-white border border-gray-300 placeholder-gray-500 text-gray-900"
                }`}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mb-6 flex flex-col sm:flex-row gap-4 justify-between items-center">
            <div className="flex gap-4">
              <button
                onClick={openCreateModal}
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-cyan-600 text-white rounded-lg hover:from-purple-700 hover:to-cyan-700 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/25 focus:outline-none focus:ring-2 focus:ring-purple-400/50"
              >
                + Add User
              </button>
              <button
                onClick={exportUsersToCSV}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 ${
                  darkMode
                    ? "text-gray-400 border border-gray-600 hover:text-white hover:bg-gray-700/50 focus:ring-gray-400/50"
                    : "text-gray-600 border border-gray-300 hover:text-gray-900 hover:bg-gray-100 focus:ring-gray-400/50"
                }`}
              >
                <Download className="w-4 h-4" />
                Export Users
              </button>
            </div>
          </div>

          {/* Locked Accounts Section */}
          {lockedAccounts.length > 0 && (
            <div
              className={`mb-6 p-4 rounded-lg border ${
                darkMode
                  ? "bg-red-900/20 border-red-500/50"
                  : "bg-red-50 border-red-200"
              }`}
            >
              <div className="flex items-center mb-4">
                <Lock
                  className={`w-5 h-5 mr-2 ${
                    darkMode ? "text-red-400" : "text-red-600"
                  }`}
                />
                <h3
                  className={`font-semibold ${
                    darkMode ? "text-red-400" : "text-red-800"
                  }`}
                >
                  Locked Accounts ({lockedAccounts.length})
                </h3>
              </div>
              <div className="space-y-3">
                {lockedAccounts.map((account) => (
                  <div
                    key={account.email}
                    className={`flex items-center justify-between p-3 rounded-lg ${
                      darkMode ? "bg-gray-800/50" : "bg-white/80"
                    }`}
                  >
                    <div>
                      <p
                        className={`font-medium ${
                          darkMode ? "text-white" : "text-gray-900"
                        }`}
                      >
                        {account.email}
                      </p>
                      <p
                        className={`text-sm ${
                          darkMode ? "text-gray-400" : "text-gray-600"
                        }`}
                      >
                        Locked: {account.lockTime.toLocaleDateString()} at{" "}
                        {account.lockTime.toLocaleTimeString()}
                      </p>
                      <p
                        className={`text-xs ${
                          darkMode ? "text-red-400" : "text-red-600"
                        }`}
                      >
                        Failed attempts: {account.failedAttempts}
                      </p>
                    </div>
                    <button
                      onClick={() => unlockAccount(account.email)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        darkMode
                          ? "bg-green-600 text-white hover:bg-green-700"
                          : "bg-green-500 text-white hover:bg-green-600"
                      }`}
                    >
                      <Unlock className="w-4 h-4" />
                      Unlock
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-md">
              {success}
            </div>
          )}

          {/* Users Table */}
          <div
            className={`${
              darkMode
                ? "bg-gray-800 border-purple-500/30"
                : "bg-white border-purple-300"
            } border overflow-hidden shadow-xl rounded-lg`}
          >
            <div className="overflow-x-auto">
              <table
                className={`min-w-full divide-y divide-gray-200 ${
                  darkMode ? "dark:divide-gray-700" : ""
                }`}
              >
                <thead className={darkMode ? "bg-gray-800" : "bg-gray-50"}>
                  <tr>
                    <th
                      scope="col"
                      className={`px-6 py-3 text-left text-xs font-medium ${
                        darkMode ? "text-gray-300" : "text-gray-500"
                      } uppercase tracking-wider`}
                    >
                      Name
                    </th>
                    <th
                      scope="col"
                      className={`px-6 py-3 text-left text-xs font-medium ${
                        darkMode ? "text-gray-300" : "text-gray-500"
                      } uppercase tracking-wider`}
                    >
                      Email
                    </th>
                    <th
                      scope="col"
                      className={`px-6 py-3 text-left text-xs font-medium ${
                        darkMode ? "text-gray-300" : "text-gray-500"
                      } uppercase tracking-wider`}
                    >
                      Role
                    </th>
                    <th
                      scope="col"
                      className={`px-6 py-3 text-left text-xs font-medium ${
                        darkMode ? "text-gray-300" : "text-gray-500"
                      } uppercase tracking-wider`}
                    >
                      Status
                    </th>
                    <th
                      scope="col"
                      className={`px-6 py-3 text-left text-xs font-medium ${
                        darkMode ? "text-gray-300" : "text-gray-500"
                      } uppercase tracking-wider`}
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody
                  className={`divide-y divide-gray-200 ${
                    darkMode ? "dark:divide-gray-700" : ""
                  }`}
                >
                  {loading && users.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mb-4"></div>
                          <p
                            className={`text-sm ${
                              darkMode ? "text-gray-400" : "text-gray-600"
                            }`}
                          >
                            Loading users...
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center">
                        <p
                          className={`text-sm ${
                            darkMode ? "text-gray-400" : "text-gray-600"
                          }`}
                        >
                          {searchTerm
                            ? `No users found matching "${searchTerm}"`
                            : "No users found"}
                        </p>
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user) => (
                      <tr
                        key={user.username}
                        className={darkMode ? "bg-gray-800" : "bg-white"}
                      >
                        <td
                          className={`px-6 py-4 whitespace-nowrap text-sm ${
                            darkMode ? "text-gray-300" : "text-gray-900"
                          }`}
                        >
                          {user.name}
                        </td>
                        <td
                          className={`px-6 py-4 whitespace-nowrap text-sm ${
                            darkMode ? "text-gray-300" : "text-gray-900"
                          }`}
                        >
                          {user.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span className={getRoleBadgeColor(user.role)}>
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              user.status === "Active"
                                ? darkMode
                                  ? "bg-green-500/20 text-green-300"
                                  : "bg-green-100 text-green-800"
                                : darkMode
                                ? "bg-red-500/20 text-red-300"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {user.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleEditClick(user)}
                              className={`transition-colors duration-300 ${
                                darkMode
                                  ? "text-purple-400 hover:text-purple-300"
                                  : "text-purple-600 hover:text-purple-500"
                              }`}
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => openViewModal(user)}
                              className={`transition-colors duration-300 ${
                                darkMode
                                  ? "text-cyan-400 hover:text-cyan-300"
                                  : "text-cyan-600 hover:text-cyan-500"
                              }`}
                            >
                              View
                            </button>
                            <button
                              onClick={() => handleDeleteUser(user.id)}
                              className={`transition-colors duration-300 ${
                                darkMode
                                  ? "text-red-400 hover:text-red-300"
                                  : "text-red-600 hover:text-red-500"
                              }`}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          <div className="mt-6 flex items-center justify-between">
            <div
              className={`text-sm ${
                darkMode ? "text-gray-400" : "text-gray-600"
              }`}
            >
              Showing 1 to {filteredUsers.length} of {filteredUsers.length}{" "}
              results
              {searchTerm && ` (filtered from ${users.length} total users)`}
            </div>
            <div className="flex space-x-2">
              <button
                className={`px-3 py-1 rounded transition-all duration-300 ${
                  darkMode
                    ? "text-gray-400 border border-gray-600 hover:text-white hover:bg-gray-700/50"
                    : "text-gray-600 border border-gray-300 hover:text-gray-900 hover:bg-gray-100"
                }`}
              >
                Previous
              </button>
              <button className="px-3 py-1 bg-purple-600 text-white rounded hover:bg-purple-700 transition-all duration-300">
                1
              </button>
              <button
                className={`px-3 py-1 rounded transition-all duration-300 ${
                  darkMode
                    ? "text-gray-400 border border-gray-600 hover:text-white hover:bg-gray-700/50"
                    : "text-gray-600 border border-gray-300 hover:text-gray-900 hover:bg-gray-100"
                }`}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div
            className={`${
              darkMode
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-gray-200"
            } border rounded-xl shadow-2xl w-full max-w-md transform transition-all duration-300`}
          >
            <div
              className={`px-6 py-4 border-b ${
                darkMode ? "border-gray-700" : "border-gray-200"
              }`}
            >
              <div className="flex items-center justify-between">
                <h3
                  className={`text-lg font-semibold ${
                    darkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  Create New User
                </h3>
                <button
                  onClick={closeCreateModal}
                  className={`${
                    darkMode
                      ? "text-gray-400 hover:text-white"
                      : "text-gray-500 hover:text-gray-700"
                  } transition-colors duration-200`}
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>

            <form onSubmit={handleCreateUser} className="px-6 py-6">
              {error && (
                <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md">
                  {error}
                </div>
              )}

              {success && (
                <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-md">
                  {success}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label
                    className={`block text-sm font-medium mb-2 ${
                      darkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Username *
                  </label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    required
                    className={`w-full px-3 py-2 rounded-md border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${
                      darkMode
                        ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                        : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                    }`}
                    placeholder="Enter username"
                  />
                </div>

                <div>
                  <label
                    className={`block text-sm font-medium mb-2 ${
                      darkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className={`w-full px-3 py-2 rounded-md border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${
                      darkMode
                        ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                        : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                    }`}
                    placeholder="Enter email address"
                  />
                </div>

                <div>
                  <label
                    className={`block text-sm font-medium mb-2 ${
                      darkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Password *
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    className={`w-full px-3 py-2 rounded-md border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${
                      darkMode
                        ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                        : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                    }`}
                    placeholder="Enter password"
                  />
                </div>

                <div className="mb-4">
                  <label
                    className={`block text-sm font-medium ${
                      darkMode ? "text-gray-300" : "text-gray-700"
                    } mb-2`}
                  >
                    Role
                  </label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    className={`w-full p-2 border rounded-md ${
                      darkMode
                        ? "bg-gray-700 border-gray-600 text-white"
                        : "bg-white border-gray-300"
                    }`}
                    required
                  >
                    <option value="User">User</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={closeCreateModal}
                  className={`px-4 py-2 rounded-md transition-all duration-300 focus:outline-none focus:ring-2 ${
                    darkMode
                      ? "text-gray-400 border border-gray-600 hover:text-white hover:bg-gray-700/50 focus:ring-gray-400/50"
                      : "text-gray-600 border border-gray-300 hover:text-gray-900 hover:bg-gray-100 focus:ring-gray-400/50"
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-gradient-to-r from-purple-600 to-cyan-600 text-white rounded-md hover:from-purple-700 hover:to-cyan-700 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/25 focus:outline-none focus:ring-2 focus:ring-purple-400/50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Creating..." : "Create User"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div
            className={`${
              darkMode
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-gray-200"
            } border rounded-xl shadow-2xl w-full max-w-md transform transition-all duration-300`}
          >
            <div
              className={`px-6 py-4 border-b ${
                darkMode ? "border-gray-700" : "border-gray-200"
              }`}
            >
              <div className="flex items-center justify-between">
                <h3
                  className={`text-lg font-semibold ${
                    darkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  Edit User: {selectedUser.name}
                </h3>
                <button
                  onClick={closeEditModal}
                  className={`${
                    darkMode
                      ? "text-gray-400 hover:text-white"
                      : "text-gray-500 hover:text-gray-700"
                  } transition-colors duration-200`}
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>

            <form onSubmit={handleEditSubmit} className="px-6 py-6">
              {error && (
                <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md">
                  {error}
                </div>
              )}

              {success && (
                <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-md">
                  {success}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label
                    className={`block text-sm font-medium mb-2 ${
                      darkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Username *
                  </label>
                  <input
                    type="text"
                    name="username"
                    value={editFormData.username}
                    onChange={handleEditInputChange}
                    required
                    className={`w-full px-3 py-2 rounded-md border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${
                      darkMode
                        ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                        : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                    }`}
                    placeholder="Enter username"
                  />
                </div>

                <div>
                  <label
                    className={`block text-sm font-medium mb-2 ${
                      darkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={editFormData.email}
                    onChange={handleEditInputChange}
                    required
                    className={`w-full px-3 py-2 rounded-md border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${
                      darkMode
                        ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                        : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                    }`}
                    placeholder="Enter email address"
                  />
                </div>

                <div>
                  <label
                    className={`block text-sm font-medium mb-2 ${
                      darkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Password (leave empty to keep current)
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={editFormData.password}
                      onChange={handleEditInputChange}
                      className={`w-full pr-10 rounded-md border ${
                        darkMode
                          ? "bg-gray-700 border-gray-600 text-white"
                          : "bg-white border-gray-300 text-gray-900"
                      } p-2.5`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className={`absolute right-2 top-1/2 transform -translate-y-1/2 p-1 rounded-full ${
                        darkMode
                          ? "text-gray-400 hover:text-gray-300"
                          : "text-gray-600 hover:text-gray-900"
                      }`}
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label
                    className={`block text-sm font-medium mb-2 ${
                      darkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Role
                  </label>
                  <select
                    name="role"
                    value={editFormData.role}
                    onChange={handleEditInputChange}
                    className={`w-full rounded-lg border ${
                      darkMode
                        ? "bg-gray-700 border-gray-600 text-white"
                        : "bg-white border-gray-300 text-gray-900"
                    } p-2.5`}
                  >
                    <option value="user">User</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={closeEditModal}
                  className={`px-4 py-2 rounded-md transition-all duration-300 focus:outline-none focus:ring-2 ${
                    darkMode
                      ? "text-gray-400 border border-gray-600 hover:text-white hover:bg-gray-700/50 focus:ring-gray-400/50"
                      : "text-gray-600 border border-gray-300 hover:text-gray-900 hover:bg-gray-100 focus:ring-gray-400/50"
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  onClick={handleEditUser}
                  disabled={loading}
                  className="px-4 py-2 bg-gradient-to-r from-purple-600 to-cyan-600 text-white rounded-md hover:from-purple-700 hover:to-cyan-700 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/25 focus:outline-none focus:ring-2 focus:ring-purple-400/50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Updating..." : "Update User"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View User Modal */}
      {showViewModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div
            className={`${
              darkMode
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-gray-200"
            } border rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col transform transition-all duration-300`}
          >
            <div
              className={`px-6 py-4 border-b ${
                darkMode ? "border-gray-700" : "border-gray-200"
              }`}
            >
              <div className="flex items-center justify-between">
                <h3
                  className={`text-lg font-semibold ${
                    darkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  User Profile
                </h3>
                <button
                  onClick={closeViewModal}
                  className={`${
                    darkMode
                      ? "text-gray-400 hover:text-white"
                      : "text-gray-500 hover:text-gray-700"
                  } transition-colors duration-200`}
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-6">
              {error && (
                <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md">
                  {error}
                </div>
              )}

              {/* User Avatar and Basic Info */}
              <div className="text-center mb-6">
                <div className="h-20 w-20 mx-auto rounded-full bg-gradient-to-r from-purple-500 to-cyan-500 flex items-center justify-center text-white font-bold text-2xl mb-4">
                  {selectedUser.name
                    ? selectedUser.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                    : "U"}
                </div>
                <h4
                  className={`text-xl font-semibold ${
                    darkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  {selectedUser.name || selectedUser.username}
                </h4>
                <p
                  className={`text-sm ${
                    darkMode ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  {selectedUser.email}
                </p>
              </div>

              {/* User Details */}
              <div className="space-y-4">
                <div
                  className={`p-4 rounded-lg ${
                    darkMode ? "bg-gray-700/50" : "bg-gray-50"
                  }`}
                >
                  <h5
                    className={`text-sm font-medium mb-3 ${
                      darkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Personal Information
                  </h5>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label
                        className={`text-sm font-medium ${
                          darkMode ? "text-gray-300" : "text-gray-700"
                        }`}
                      >
                        Name
                      </label>
                      <p
                        className={`mt-1 text-sm ${
                          darkMode ? "text-white" : "text-gray-900"
                        }`}
                      >
                        {selectedUser.username || selectedUser.name}
                      </p>
                    </div>
                    <div>
                      <label
                        className={`text-sm font-medium ${
                          darkMode ? "text-gray-300" : "text-gray-700"
                        }`}
                      >
                        Email
                      </label>
                      <p
                        className={`mt-1 text-sm ${
                          darkMode ? "text-white" : "text-gray-900"
                        }`}
                      >
                        {selectedUser.email}
                      </p>
                    </div>
                    <div>
                      <label
                        className={`text-sm font-medium ${
                          darkMode ? "text-gray-300" : "text-gray-700"
                        }`}
                      >
                        Age
                      </label>
                      <p
                        className={`mt-1 text-sm ${
                          darkMode ? "text-white" : "text-gray-900"
                        }`}
                      >
                        {selectedUser.age || "Not specified"}
                      </p>
                    </div>
                    <div>
                      <label
                        className={`text-sm font-medium ${
                          darkMode ? "text-gray-300" : "text-gray-700"
                        }`}
                      >
                        Gender
                      </label>
                      <p
                        className={`mt-1 text-sm ${
                          darkMode ? "text-white" : "text-gray-900"
                        }`}
                      >
                        {selectedUser.gender || "Not specified"}
                      </p>
                    </div>
                    <div>
                      <label
                        className={`text-sm font-medium ${
                          darkMode ? "text-gray-300" : "text-gray-700"
                        }`}
                      >
                        Phone Number
                      </label>
                      <p
                        className={`mt-1 text-sm ${
                          darkMode ? "text-white" : "text-gray-900"
                        }`}
                      >
                        {selectedUser.phoneNumber || "Not specified"}
                      </p>
                    </div>
                    <div>
                      <label
                        className={`text-sm font-medium ${
                          darkMode ? "text-gray-300" : "text-gray-700"
                        }`}
                      >
                        Nationality
                      </label>
                      <p
                        className={`mt-1 text-sm ${
                          darkMode ? "text-white" : "text-gray-900"
                        }`}
                      >
                        {selectedUser.nationality || "Not specified"}
                      </p>
                    </div>
                  </div>
                </div>

                <div
                  className={`p-4 rounded-lg ${
                    darkMode ? "bg-gray-700/50" : "bg-gray-50"
                  }`}
                >
                  <h5
                    className={`text-sm font-medium mb-3 ${
                      darkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Account Information
                  </h5>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span
                        className={`text-sm ${
                          darkMode ? "text-gray-400" : "text-gray-600"
                        }`}
                      >
                        User ID:
                      </span>
                      <span
                        className={`text-sm ${
                          darkMode ? "text-white" : "text-gray-900"
                        }`}
                      >
                        #{selectedUser.id}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span
                        className={`text-sm ${
                          darkMode ? "text-gray-400" : "text-gray-600"
                        }`}
                      >
                        Account Created:
                      </span>
                      <span
                        className={`text-sm ${
                          darkMode ? "text-white" : "text-gray-900"
                        }`}
                      >
                        January 2024
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span
                        className={`text-sm ${
                          darkMode ? "text-gray-400" : "text-gray-600"
                        }`}
                      >
                        Last Login:
                      </span>
                      <span
                        className={`text-sm ${
                          darkMode ? "text-white" : "text-gray-900"
                        }`}
                      >
                        2 hours ago
                      </span>
                    </div>
                  </div>
                </div>

                <div
                  className={`p-4 rounded-lg ${
                    darkMode ? "bg-gray-700/50" : "bg-gray-50"
                  }`}
                >
                  <h5
                    className={`text-sm font-medium mb-3 ${
                      darkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Role
                  </h5>
                  <div>
                    <span
                      className={`font-medium ${
                        darkMode ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      Role:{" "}
                    </span>
                    <span className={`${getRoleBadgeColor(selectedUser.role)}`}>
                      {selectedUser.role}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer with Buttons */}
            <div
              className={`px-6 py-4 border-t ${
                darkMode ? "border-gray-700" : "border-gray-200"
              } flex justify-end space-x-3`}
            >
              <button
                onClick={closeViewModal}
                className={`px-4 py-2 rounded-md transition-all duration-300 focus:outline-none focus:ring-2 ${
                  darkMode
                    ? "text-gray-400 border border-gray-600 hover:text-white hover:bg-gray-700/50 focus:ring-gray-400/50"
                    : "text-gray-600 border border-gray-300 hover:text-gray-900 hover:bg-gray-100 focus:ring-gray-400/50"
                }`}
              >
                Close
              </button>
              <button
                onClick={() => {
                  closeViewModal();
                  openEditModal(selectedUser);
                }}
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-cyan-600 text-white rounded-md hover:from-purple-700 hover:to-cyan-700 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/25 focus:outline-none focus:ring-2 focus:ring-purple-400/50"
              >
                Edit User
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default UsersManagement;
