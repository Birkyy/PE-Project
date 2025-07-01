import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Pages/Dashboard';
import Profile from './components/Pages/Profile';
import MyProjects from './components/Pages/MyProjects';
import AddProject from './components/Pages/AddProject';
import UsersManagement from './components/Pages/UsersManagement';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <ThemeProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Protected Routes */}
            <Route path="/home" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/my-projects" element={
              <ProtectedRoute>
                <MyProjects />
              </ProtectedRoute>
            } />
            <Route path="/add-project" element={
              <ProtectedRoute>
                <AddProject />
              </ProtectedRoute>
            } />
            <Route path="/users-management" element={
              <ProtectedRoute>
                <UsersManagement />
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } />
          </Routes>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;