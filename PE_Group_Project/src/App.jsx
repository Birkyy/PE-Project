import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './Pages/Dashboard';
import Profile from './Pages/Profile';
import MyProjects from './Pages/MyProjects';
import AddProject from './pages/AddProject';
import Project from './pages/Project';
import UsersManagement from './pages/UsersManagement';
import ProtectedRoute from './components/ProtectedRoute';
import MyTask from './pages/MyTask';
import Privacy from './pages/Privacy';
import HelpSupport from './pages/HelpSupport';

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
            <Route path="/project/:id" element={
              <ProtectedRoute>
                <Project />
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
            <Route path="/my-tasks/:projectName" element={
              <ProtectedRoute>
                <MyTask />
              </ProtectedRoute>
            } />
            <Route path="/privacy" element={
              <ProtectedRoute>
                <Privacy />
              </ProtectedRoute>
            } />
            <Route path="/help-support" element={
              <ProtectedRoute>
                <HelpSupport />
              </ProtectedRoute>
            } />
          </Routes>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;