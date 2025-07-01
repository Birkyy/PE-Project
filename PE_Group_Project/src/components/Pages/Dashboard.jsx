import { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import Layout from '../Layout';
import { 
  Calendar, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  TrendingUp, 
  Users, 
  Target,
  Activity,
  BarChart3,
  PieChart
} from 'lucide-react';
import {
  BarChart,
  Bar,
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

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const { darkMode } = useTheme();

  useEffect(() => {
    // Load user data
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  // Sample data for analytics
  const taskProgressData = [
    { name: 'Mon', completed: 12, pending: 8 },
    { name: 'Tue', completed: 15, pending: 5 },
    { name: 'Wed', completed: 8, pending: 12 },
    { name: 'Thu', completed: 20, pending: 3 },
    { name: 'Fri', completed: 18, pending: 7 },
    { name: 'Sat', completed: 5, pending: 2 },
    { name: 'Sun', completed: 3, pending: 1 }
  ];

  const projectDistributionData = [
    { name: 'Development', value: 35, color: '#8B5CF6' },
    { name: 'Design', value: 25, color: '#06B6D4' },
    { name: 'Testing', value: 20, color: '#EC4899' },
    { name: 'Documentation', value: 15, color: '#10B981' },
    { name: 'Research', value: 5, color: '#F59E0B' }
  ];

  const weeklyProgressData = [
    { day: 'Mon', tasks: 20 },
    { day: 'Tue', tasks: 35 },
    { day: 'Wed', tasks: 28 },
    { day: 'Thu', tasks: 42 },
    { day: 'Fri', tasks: 38 },
    { day: 'Sat', tasks: 15 },
    { day: 'Sun', tasks: 8 }
  ];

  const upcomingTasks = [
    { id: 1, title: 'Complete API Integration', project: 'E-commerce App', due: '2024-12-20', priority: 'high' },
    { id: 2, title: 'Review UI Components', project: 'Dashboard System', due: '2024-12-21', priority: 'medium' },
    { id: 3, title: 'Database Migration', project: 'Analytics Platform', due: '2024-12-22', priority: 'high' },
    { id: 4, title: 'User Testing Session', project: 'Mobile App', due: '2024-12-23', priority: 'low' }
  ];

  const overdueTasks = [
    { id: 5, title: 'Fix Login Bug', project: 'Web Portal', due: '2024-12-15', priority: 'critical' },
    { id: 6, title: 'Update Documentation', project: 'API Service', due: '2024-12-17', priority: 'medium' }
  ];

  const recentActivity = [
    { id: 1, action: 'Completed', item: 'User Authentication Module', time: '2 hours ago', type: 'completed' },
    { id: 2, action: 'Updated', item: 'Project Timeline', time: '4 hours ago', type: 'updated' },
    { id: 3, action: 'Created', item: 'New Task: Frontend Testing', time: '1 day ago', type: 'created' },
    { id: 4, action: 'Assigned', item: 'Database Optimization Task', time: '2 days ago', type: 'assigned' }
  ];

  const getActivityIcon = (type) => {
    switch (type) {
      case 'completed': return <CheckCircle2 className="w-4 h-4 text-green-400" />;
      case 'updated': return <Activity className="w-4 h-4 text-blue-400" />;
      case 'created': return <Target className="w-4 h-4 text-purple-400" />;
      case 'assigned': return <Users className="w-4 h-4 text-cyan-400" />;
      default: return <Activity className="w-4 h-4 text-gray-400" />;
    }
  };

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
                <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>127</p>
              </div>
              <Target className="w-8 h-8 text-purple-400" />
            </div>
          </div>

          <div className={`${darkMode ? 'bg-gray-800 border-cyan-500/30' : 'bg-white border-cyan-300'} border rounded-lg p-6 hover:shadow-lg ${darkMode ? 'hover:shadow-cyan-500/20' : 'hover:shadow-cyan-300/30'} transition-all duration-300`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Completed</p>
                <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>89</p>
              </div>
              <CheckCircle2 className="w-8 h-8 text-cyan-400" />
            </div>
          </div>

          <div className={`${darkMode ? 'bg-gray-800 border-yellow-500/30' : 'bg-white border-yellow-300'} border rounded-lg p-6 hover:shadow-lg ${darkMode ? 'hover:shadow-yellow-500/20' : 'hover:shadow-yellow-300/30'} transition-all duration-300`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>In Progress</p>
                <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>32</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-400" />
            </div>
          </div>

          <div className={`${darkMode ? 'bg-gray-800 border-red-500/30' : 'bg-white border-red-300'} border rounded-lg p-6 hover:shadow-lg ${darkMode ? 'hover:shadow-red-500/20' : 'hover:shadow-red-300/30'} transition-all duration-300`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Overdue</p>
                <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>6</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-400" />
            </div>
          </div>
        </div>

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Personal Dashboard */}
          <div className="lg:col-span-2 space-y-6">
            {/* Upcoming Tasks */}
            <div className={`${darkMode ? 'bg-gray-800 border-purple-500/30' : 'bg-white border-purple-300'} border rounded-lg p-6`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className={`text-lg font-semibold flex items-center ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  <Calendar className="w-5 h-5 mr-2 text-purple-400" />
                  Upcoming Tasks
                </h3>
                <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{upcomingTasks.length} tasks</span>
              </div>
              <div className="space-y-3">
                {upcomingTasks.map((task) => (
                  <div key={task.id} className={`flex items-center justify-between p-3 rounded-lg border ${darkMode ? 'bg-gray-700/50 border-gray-600/50' : 'bg-gray-50 border-gray-200'}`}>
                    <div className="flex-1">
                      <h4 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{task.title}</h4>
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{task.project}</p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{task.due}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Overdue Tasks */}
            {overdueTasks.length > 0 && (
              <div className={`${darkMode ? 'bg-gray-800 border-red-500/30' : 'bg-white border-red-300'} border rounded-lg p-6`}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className={`text-lg font-semibold flex items-center ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    <AlertTriangle className="w-5 h-5 mr-2 text-red-400" />
                    Overdue Tasks
                  </h3>
                  <span className="text-sm text-red-400">{overdueTasks.length} overdue</span>
                </div>
                <div className="space-y-3">
                  {overdueTasks.map((task) => (
                    <div key={task.id} className={`flex items-center justify-between p-3 rounded-lg border ${darkMode ? 'bg-red-900/20 border-red-500/30' : 'bg-red-50 border-red-200'}`}>
                      <div className="flex-1">
                        <h4 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{task.title}</h4>
                        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{task.project}</p>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className="text-red-400 text-sm">Due: {task.due}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Recent Activity */}
          <div className={`${darkMode ? 'bg-gray-800 border-cyan-500/30' : 'bg-white border-cyan-300'} border rounded-lg p-6`}>
            <h3 className={`text-lg font-semibold flex items-center mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              <Activity className="w-5 h-5 mr-2 text-cyan-400" />
              Recent Activity
            </h3>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-1">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      <span className="font-medium">{activity.action}</span> {activity.item}
                    </p>
                    <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Visual Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Weekly Progress Chart */}
          <div className={`${darkMode ? 'bg-gray-800 border-purple-500/30' : 'bg-white border-purple-300'} border rounded-lg p-6`}>
            <h3 className={`text-lg font-semibold flex items-center mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              <BarChart3 className="w-5 h-5 mr-2 text-purple-400" />
              Weekly Task Progress
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={weeklyProgressData}>
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
              Project Distribution
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsPieChart>
                <Pie
                  data={projectDistributionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {projectDistributionData.map((entry, index) => (
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
              {projectDistributionData.map((item) => (
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

        {/* Task Completion Trends */}
        <div className={`${darkMode ? 'bg-gray-800 border-pink-500/30' : 'bg-white border-pink-300'} border rounded-lg p-6`}>
          <h3 className={`text-lg font-semibold flex items-center mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            <TrendingUp className="w-5 h-5 mr-2 text-pink-400" />
            Task Completion Trends
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={taskProgressData}>
              <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? "#374151" : "#E5E7EB"} />
              <XAxis dataKey="name" stroke={darkMode ? "#9CA3AF" : "#6B7280"} />
              <YAxis stroke={darkMode ? "#9CA3AF" : "#6B7280"} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: darkMode ? '#1F2937' : '#FFFFFF', 
                  border: darkMode ? '1px solid #6B7280' : '1px solid #D1D5DB', 
                  borderRadius: '8px',
                  color: darkMode ? '#F3F4F6' : '#111827'
                }} 
              />
              <Bar dataKey="completed" stackId="a" fill="#06B6D4" name="Completed" />
              <Bar dataKey="pending" stackId="a" fill="#EC4899" name="Pending" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard; 