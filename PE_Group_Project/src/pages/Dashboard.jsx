import { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { 
  Calendar, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Users, 
  Target,
  BarChart3,
  PieChart,
  Bell
} from 'lucide-react';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart
} from 'recharts';
import { projectAPI, taskAPI } from '../API/apiService';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const { darkMode } = useTheme();
  const navigate = useNavigate();
  
  // Real data states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [taskStats, setTaskStats] = useState({
    total: 0,
    completed: 0,
    inProgress: 0,
    overdue: 0,
    todo: 0
  });
  const [upcomingTasks, setUpcomingTasks] = useState([]);
  const [overdueTasks, setOverdueTasks] = useState([]);
  const [projectDistribution, setProjectDistribution] = useState([]);
  const [weeklyProgress, setWeeklyProgress] = useState([]);

  useEffect(() => {
    // Load user data
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  // Fetch all data when component mounts
  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get current user ID
      const userId = user?.userId || user?.id || user?.UserId;

      // Fetch projects and tasks in parallel
      const [projectsData, tasksData] = await Promise.all([
        projectAPI.getAllProjects(userId),
        taskAPI.getAllTasks()
      ]);

      setProjects(projectsData || []);
      
      // Filter tasks to only include those assigned to the current user
      const userTasks = (tasksData || []).filter(task => {
        // Check if task is assigned to current user via PIC field
        return task.PIC === userId || task.pic === userId;
      });
      
      setTasks(userTasks);

      // Calculate task statistics for user's tasks only
      calculateTaskStats(userTasks);
      
      // Calculate upcoming and overdue tasks for user's tasks only
      calculateTaskLists(userTasks);
      
      // Calculate project distribution for user's projects and tasks
      calculateProjectDistribution(projectsData || [], userTasks);
      
      // Calculate weekly progress for user's tasks only
      calculateWeeklyProgress(userTasks);

    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const calculateTaskStats = (allTasks) => {
    const total = allTasks.length;
    const completed = allTasks.filter(task => task.status === 'Completed').length;
    const inProgress = allTasks.filter(task => 
      task.status === 'In Progress' || task.status === 'InProgress'
    ).length;
    const todo = allTasks.filter(task => task.status === 'Todo').length;
    
    // Calculate overdue tasks
    const overdue = allTasks.filter(task => {
      if (task.status === 'Completed') return false;
      if (!task.deadline) return false;
      return new Date(task.deadline) < new Date();
    }).length;

    setTaskStats({
      total,
      completed,
      inProgress,
      overdue,
      todo
    });
  };

  const calculateTaskLists = (allTasks) => {
    const now = new Date();

    // Upcoming tasks (all non-completed tasks)
    const upcoming = allTasks.filter(task => {
      if (task.status === 'Completed') return false;
      return true; // Include all non-completed tasks
    }).slice(0, 10); // Limit to 10 tasks

    // Overdue tasks - show all overdue tasks for the user
    const overdue = allTasks.filter(task => {
      if (task.status === 'Completed') return false;
      if (!task.deadline) return false;
      return new Date(task.deadline) < now;
    }); // Removed the .slice(0, 5) limit to show all overdue tasks

    setUpcomingTasks(upcoming);
    setOverdueTasks(overdue);
  };

  const calculateProjectDistribution = (allProjects, userTasks) => {
    const projectStats = allProjects.map(project => {
      // Only count tasks assigned to the current user in this project
      const userProjectTasks = userTasks.filter(task => task.projectId === project.projectId);
      const completedUserTasks = userProjectTasks.filter(task => task.status === 'Completed').length;
      const totalUserTasks = userProjectTasks.length;
      const progress = totalUserTasks > 0 ? Math.round((completedUserTasks / totalUserTasks) * 100) : 0;
      
      return {
        name: project.projectName,
        value: progress,
        color: getProjectColor(project.projectId),
        totalTasks: totalUserTasks,
        completedTasks: completedUserTasks
      };
    });

    // Sort by progress and take top 5
    const topProjects = projectStats
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);

    setProjectDistribution(topProjects);
  };

  const calculateWeeklyProgress = (allTasks) => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const weeklyData = days.map(day => {
      // For now, generate random data based on actual task count
      // In a real app, you'd track daily task completion
      const baseCount = Math.floor(allTasks.length / 7);
      const randomVariation = Math.floor(Math.random() * baseCount);
      return {
        day,
        tasks: Math.max(0, baseCount + randomVariation)
      };
    });

    setWeeklyProgress(weeklyData);
  };

  const getProjectColor = (projectId) => {
    const colors = ['#8B5CF6', '#06B6D4', '#EC4899', '#10B981', '#F59E0B', '#EF4444', '#3B82F6'];
    const index = projectId ? projectId.charCodeAt(0) % colors.length : 0;
    return colors[index];
  };

  const getNotificationStatusColor = (status) => {
    switch (status) {
      case 'unread': return 'bg-blue-500';
      case 'read': return 'bg-gray-400';
      default: return 'bg-gray-400';
    }
  };

  const getNotificationTypeIcon = (type) => {
    switch (type) {
      case 'task': return '📋';
      case 'comment': return '💬';
      case 'meeting': return '👥';
      case 'system': return '⚙️';
      case 'alert': return '⚠️';
      case 'team': return '👤';
      default: return '🔔';
    }
  };

  // Generate notifications based on real data
  const generateNotifications = () => {
    const notifications = [];
    
    // Add overdue task notifications
    overdueTasks.forEach(task => {
      notifications.push({
        id: `overdue-${task.projectTaskId || task.id}`,
        message: `Task "${task.taskName || task.title}" is overdue`,
        type: 'alert',
        time: '1 day ago',
        status: 'unread'
      });
    });

    // Add upcoming task notifications
    upcomingTasks.slice(0, 2).forEach(task => {
      notifications.push({
        id: `upcoming-${task.projectTaskId || task.id}`,
        message: `Task "${task.taskName || task.title}" is due soon`,
        type: 'task',
        time: '2 hours ago',
        status: 'unread'
      });
    });

    // Add project completion notifications
    projectDistribution.forEach(project => {
      if (project.value === 100) {
        notifications.push({
          id: `completed-${project.name}`,
          message: `Project "${project.name}" has been completed!`,
          type: 'system',
          time: '3 hours ago',
          status: 'read'
        });
      }
    });

    return notifications.slice(0, 6); // Limit to 6 notifications
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No date set';
    return new Date(dateString).toLocaleDateString();
  };

  const handleTaskClick = (task) => {
    // Navigate to the project that contains this task
    if (task.projectId) {
      navigate(`/project/${task.projectId}`);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className={`text-center ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
            <p>Loading dashboard...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className={`text-center ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            <p className="text-red-500 mb-4">{error}</p>
            <button
              onClick={fetchDashboardData}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  const notifications = generateNotifications();

  return (
    <Layout>
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className={`text-3xl font-bold mb-2 ${
            darkMode 
              ? 'text-white'
              : 'text-black'
          }`}>
            Welcome back, {user?.username || 'User'}!
          </h1>
          <p className={`text-lg ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Here's what's happening with your projects today.</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className={`${darkMode ? 'bg-gray-800 border-purple-500/30' : 'bg-white border-purple-300'} border rounded-lg p-6 hover:shadow-lg ${darkMode ? 'hover:shadow-purple-500/20' : 'hover:shadow-purple-300/30'} transition-all duration-300`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Tasks</p>
                <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{taskStats.total}</p>
              </div>
              <Target className="w-8 h-8 text-purple-400" />
            </div>
          </div>

          <div className={`${darkMode ? 'bg-gray-800 border-cyan-500/30' : 'bg-white border-cyan-300'} border rounded-lg p-6 hover:shadow-lg ${darkMode ? 'hover:shadow-cyan-500/20' : 'hover:shadow-cyan-300/30'} transition-all duration-300`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Completed</p>
                <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{taskStats.completed}</p>
              </div>
              <CheckCircle2 className="w-8 h-8 text-cyan-400" />
            </div>
          </div>

          <div className={`${darkMode ? 'bg-gray-800 border-yellow-500/30' : 'bg-white border-yellow-300'} border rounded-lg p-6 hover:shadow-lg ${darkMode ? 'hover:shadow-yellow-500/20' : 'hover:shadow-yellow-300/30'} transition-all duration-300`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>In Progress</p>
                <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{taskStats.inProgress}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-400" />
            </div>
          </div>

          <div className={`${darkMode ? 'bg-gray-800 border-red-500/30' : 'bg-white border-red-300'} border rounded-lg p-6 hover:shadow-lg ${darkMode ? 'hover:shadow-red-500/20' : 'hover:shadow-red-300/30'} transition-all duration-300`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Overdue</p>
                <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{taskStats.overdue}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-400" />
            </div>
          </div>
        </div>

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mb-8">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8">
            {/* Tasks Section - Side by Side */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Upcoming Tasks */}
            <div className={`${darkMode ? 'bg-gray-800 border-yellow-500/30' : 'bg-white border-yellow-300'} border rounded-lg p-6`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className={`text-lg font-semibold flex items-center ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  <Clock className="w-5 h-5 mr-2 text-yellow-400" />
                  Upcoming Tasks
                </h3>
                <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{upcomingTasks.length} tasks</span>
              </div>
              <div className="space-y-3">
                {upcomingTasks.length > 0 ? (
                  upcomingTasks.map((task) => (
                    <div 
                      key={task.projectTaskId || task.id} 
                      className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer hover:shadow-md transition-all duration-200 ${darkMode ? 'bg-gray-700/50 border-gray-600/50 hover:bg-gray-600/50' : 'bg-gray-50 border-gray-200 hover:bg-gray-100'}`}
                      onClick={() => handleTaskClick(task)}
                    >
                      <div className="flex-1">
                        <h4 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{task.taskName || task.title}</h4>
                        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          {projects.find(p => p.projectId === task.projectId)?.projectName || 'Unknown Project'}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            task.status === 'Todo' 
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                              : task.status === 'In Progress' || task.status === 'InProgress'
                              ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                              : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                          }`}>
                            {task.status}
                          </span>
                          {task.deadline && (
                            <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                              Due: {formatDate(task.deadline)}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          Click to view project
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className={`text-center py-8 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    <Clock className="w-12 h-12 mx-auto mb-3 text-gray-400 opacity-50" />
                    <p>No tasks assigned to you</p>
                  </div>
                )}
              </div>
            </div>

            {/* Overdue Tasks */}
            <div className={`${darkMode ? 'bg-gray-800 border-red-500/30' : 'bg-white border-red-300'} border rounded-lg p-6`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className={`text-lg font-semibold flex items-center ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  <AlertTriangle className="w-5 h-5 mr-2 text-red-400" />
                  Overdue Tasks
                </h3>
                <span className="text-sm text-red-400">{overdueTasks.length} overdue</span>
              </div>
              <div className="space-y-3">
                {overdueTasks.length > 0 ? (
                  overdueTasks.map((task) => (
                    <div key={task.projectTaskId || task.id} className={`flex items-center justify-between p-3 rounded-lg border ${darkMode ? 'bg-red-900/20 border-red-500/30' : 'bg-red-50 border-red-200'}`}>
                      <div className="flex-1">
                        <h4 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{task.taskName || task.title}</h4>
                        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          {projects.find(p => p.projectId === task.projectId)?.projectName || 'Unknown Project'}
                        </p>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className="text-red-400 text-sm">Due: {formatDate(task.deadline)}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className={`text-center py-8 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    <AlertTriangle className="w-12 h-12 mx-auto mb-3 text-gray-400 opacity-50" />
                    <p>No overdue tasks</p>
                  </div>
                )}
              </div>
            </div>
          </div>

            {/* Visual Analytics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Weekly Progress Chart */}
              <div className={`${darkMode ? 'bg-gray-800 border-purple-500/30' : 'bg-white border-purple-300'} border rounded-lg p-6`}>
                <h3 className={`text-lg font-semibold flex items-center mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  <BarChart3 className="w-5 h-5 mr-2 text-purple-400" />
                  Weekly Task Progress
                </h3>
                                 <ResponsiveContainer width="100%" height={350}>
                   <AreaChart data={weeklyProgress}>
                    <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? "#374151" : "#E5E7EB"} />
                    <XAxis dataKey="day" stroke={darkMode ? "#9CA3AF" : "#6B7280"} />
                    <YAxis stroke={darkMode ? "#9CA3AF" : "#6B7280"} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: darkMode ? '#1F2937' : '#FFFFFF', 
                        border: darkMode ? '1px solid #6B7280' : '1px solid #D1D5DB', 
                        borderRadius: '8px',
                        color: darkMode ? '#F3F4F6' : '#111827'
                      }} 
                    />
                    <Area 
                      type="monotone" 
                      dataKey="tasks" 
                      stroke="#8B5CF6" 
                      fill="url(#colorGradient)" 
                      strokeWidth={2}
                    />
                    <defs>
                      <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Project Distribution */}
              <div className={`${darkMode ? 'bg-gray-800 border-cyan-500/30' : 'bg-white border-cyan-300'} border rounded-lg p-6`}>
                <h3 className={`text-lg font-semibold flex items-center mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  <PieChart className="w-5 h-5 mr-2 text-cyan-400" />
                  Project Progress
                </h3>
                                 <ResponsiveContainer width="100%" height={350}>
                   <RechartsPieChart>
                    <Pie
                      data={projectDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {projectDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: darkMode ? '#1F2937' : '#FFFFFF', 
                        border: darkMode ? '1px solid #6B7280' : '1px solid #D1D5DB', 
                        borderRadius: '8px',
                        color: darkMode ? '#F3F4F6' : '#111827'
                      }} 
                    />
                  </RechartsPieChart>
                </ResponsiveContainer>
                <div className="mt-4 space-y-2">
                  {projectDistribution.map((item) => (
                    <div key={item.name} className="flex items-center justify-between text-sm">
                      <div className="flex items-center">
                        <div 
                          className="w-3 h-3 rounded-full mr-2" 
                          style={{ backgroundColor: item.color }}
                        ></div>
                        <span className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{item.name}</span>
                      </div>
                      <span className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{item.value}%</span>
                    </div>
                  ))}
                </div>
              </div>


            </div>
          </div>

          {/* Right Sidebar - Notifications */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <div className="flex items-center justify-between mb-6">
                <h3 className={`text-lg font-semibold flex items-center ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  <Bell className="w-5 h-5 mr-2 text-indigo-400" />
                  Notifications
                </h3>
              </div>
              <div className={`text-xs mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {notifications.filter(n => n.status === 'unread').length} unread notifications
              </div>
              
              <div className="relative">
                {/* Notification line */}
                <div className={`absolute left-6 top-0 bottom-0 w-0.5 ${darkMode ? 'bg-gray-600' : 'bg-gray-300'}`}></div>
                
                {/* Notification items */}
                <div className="space-y-6">
                  {notifications.map((item, index) => (
                    <div key={item.id} className="relative flex items-start">
                      {/* Notification dot */}
                      <div className={`relative z-10 w-3 h-3 rounded-full border-2 ${getNotificationStatusColor(item.status)} ${darkMode ? 'border-gray-900' : 'border-gray-50'} shadow-sm`}></div>
                      
                      {/* Notification content */}
                      <div className="ml-6 flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="text-sm">{getNotificationTypeIcon(item.type)}</span>
                          <span className={`text-xs font-medium ${darkMode ? 'text-indigo-400' : 'text-indigo-600'}`}>
                            {item.time}
                          </span>
                        </div>
                        <p className={`text-sm font-medium mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {item.message}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            item.status === 'unread' 
                              ? 'bg-blue-100 text-blue-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {item.status}
                          </span>
                          <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            {item.type}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </Layout>
  );
};

export default Dashboard; 