import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Scale, 
  FileText, 
  Newspaper, 
  Search,
  User,
  Bell,
  Zap,
  TrendingUp,
  Clock,
  CheckCircle,
  Users,
  ArrowRight,
  Sparkles,
  Crown,
  Target,
  BarChart3
} from 'lucide-react';

// Mock user data - in real app, this would come from authentication context
const userData = {
  name: 'Balaji', // This will be dynamic
  role: 'Senior Legal Counsel',
  membership: 'Pro Member',
  joinDate: '2024',
  efficiency: '87%'
};

const features = [
  {
    icon: Scale,
    title: 'Case Research',
    description: 'AI-powered case law analysis and precedent research',
    color: 'from-blue-500 to-cyan-500',
    iconColor: 'text-blue-500',
    path: '/cases',
    gradient: 'bg-gradient-to-br from-blue-50 to-cyan-50',
    stats: '1,247+ cases analyzed'
  },
  {
    icon: FileText,
    title: 'Contract Analysis',
    description: 'Automated risk assessment and compliance checking',
    color: 'from-purple-500 to-pink-500',
    iconColor: 'text-purple-500',
    path: '/contracts',
    gradient: 'bg-gradient-to-br from-purple-50 to-pink-50',
    stats: '98% accuracy rate'
  },
  {
    icon: Newspaper,
    title: 'Legal News',
    description: 'AI-curated legal developments and updates',
    color: 'from-emerald-500 to-teal-500',
    iconColor: 'text-emerald-500',
    path: '/news',
    gradient: 'bg-gradient-to-br from-emerald-50 to-teal-50',
    stats: 'Updated daily'
  },
  {
    icon: Users,
    title: 'Find a Lawyer',
    description: 'Connect with verified legal experts',
    color: 'from-amber-500 to-orange-500',
    iconColor: 'text-amber-500',
    path: '/find-lawyer',
    gradient: 'bg-gradient-to-br from-amber-50 to-orange-50',
    stats: '500+ experts'
  }
];

const stats = [
  { 
    label: 'Cases Analyzed', 
    value: '2,547',
    change: '+12%',
    trend: 'up',
    icon: TrendingUp,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100'
  },
  { 
    label: 'Documents Processed', 
    value: '12,843',
    change: '+8%',
    trend: 'up',
    icon: BarChart3,
    color: 'text-purple-600',
    bgColor: 'bg-purple-100'
  },
  { 
    label: 'Time Saved', 
    value: '1,247h',
    change: '+15%',
    trend: 'up',
    icon: Clock,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-100'
  },
  { 
    label: 'Success Rate', 
    value: '94%',
    change: '+5%',
    trend: 'up',
    icon: Target,
    color: 'text-amber-600',
    bgColor: 'bg-amber-100'
  }
];

const recentActivities = [
  { action: 'Case Research Completed', time: '2 hours ago', status: 'completed', case: 'Smith vs State' },
  { action: 'Contract Review', time: '5 hours ago', status: 'completed', case: 'NDA Agreement' },
  { action: 'Document Comparison', time: '1 day ago', status: 'in-progress', case: 'Partnership Deed' },
  { action: 'Legal News Alert', time: '2 days ago', status: 'completed', case: 'Supreme Court Update' }
];

export default function Dashboard() {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);
  const [activeFeature, setActiveFeature] = useState(null);
  const [userName, setUserName] = useState(userData.name);

  // In real app, this would come from auth context
  useEffect(() => {
    setIsVisible(true);
    // Simulate dynamic username - in real app, this would be from context/API
    const storedName = localStorage.getItem('userName') || 'Balaji';
    setUserName(storedName);
  }, []);

  const handleFeatureClick = (path) => {
    navigate(path);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'text-emerald-600 bg-emerald-100';
      case 'in-progress': return 'text-amber-600 bg-amber-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return '✓';
      case 'in-progress': return '⟳';
      default: return '•';
    }
  };

  return (
    <div className="flex-1 p-6 bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Animated Header */}
        <header className="mb-8">
          <div className="flex justify-between items-center">
            <div className={`transition-all duration-1000 transform ${isVisible ? 'translate-x-0 opacity-100' : '-translate-x-10 opacity-0'}`}>
              <div className="flex items-center space-x-3 mb-2">
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-xl">
                  <Crown className="w-6 h-6 text-white" />
                </div>
                <span className="text-sm font-medium text-purple-600 bg-purple-100 px-3 py-1 rounded-full">
                  {userData.membership}
                </span>
              </div>
              <h1 className="text-4xl font-bold text-gray-900">
                Welcome back,{' '}
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Mr. {userName}
                </span>
                <Sparkles className="w-8 h-8 text-yellow-500 inline-block ml-2" />
              </h1>
              <p className="text-gray-600 mt-2 flex items-center space-x-4">
                <span className="flex items-center">
                  <User className="w-4 h-4 mr-2" />
                  {userData.role}
                </span>
                <span>•</span>
                <span>Member since {userData.joinDate}</span>
                <span>•</span>
                <span className="text-emerald-600 font-semibold">{userData.efficiency} Efficiency</span>
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative group">
                <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2 group-hover:text-blue-500 transition-colors" />
                <input
                  type="text"
                  placeholder="Search cases, contracts..."
                  className="pl-10 pr-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80 backdrop-blur-sm transition-all duration-300 w-64"
                />
              </div>
              <button className="relative p-3 text-gray-600 hover:text-gray-900 transition-colors bg-white/80 backdrop-blur-sm rounded-2xl hover:shadow-lg border border-gray-200">
                <Bell className="w-5 h-5" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
              </button>
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 cursor-pointer">
                {userName.charAt(0)}
              </div>
            </div>
          </div>
        </header>

        {/* Animated Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div
              key={stat.label}
              className={`bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <div className={`text-sm font-semibold px-2 py-1 rounded-full ${stat.trend === 'up' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                  {stat.change}
                </div>
              </div>
              <p className="text-gray-600 text-sm font-medium">{stat.label}</p>
              <p className="text-3xl font-bold mt-2 text-gray-900">{stat.value}</p>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                <div 
                  className={`h-2 rounded-full transition-all duration-1000 ${
                    stat.label === 'Cases Analyzed' ? 'bg-blue-500' :
                    stat.label === 'Documents Processed' ? 'bg-purple-500' :
                    stat.label === 'Time Saved' ? 'bg-emerald-500' : 'bg-amber-500'
                  }`}
                  style={{ 
                    width: isVisible ? 
                      (stat.label === 'Cases Analyzed' ? '85%' :
                       stat.label === 'Documents Processed' ? '78%' :
                       stat.label === 'Time Saved' ? '92%' : '94%') : '0%'
                  }}
                ></div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Features Grid */}
          <div className="lg:col-span-2">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                <Zap className="w-6 h-6 text-yellow-500 mr-2" />
                AI Legal Tools
              </h2>
              <button className="text-blue-600 hover:text-blue-700 font-medium flex items-center transition-all duration-300 group">
                Explore all features 
                <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {features.map((feature, index) => (
                <div
                  key={feature.title}
                  onClick={() => handleFeatureClick(feature.path)}
                  className={`bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 cursor-pointer group ${
                    isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
                  } ${activeFeature === index ? 'ring-2 ring-blue-500 scale-105' : ''}`}
                  style={{ transitionDelay: `${index * 150}ms` }}
                  onMouseEnter={() => setActiveFeature(index)}
                  onMouseLeave={() => setActiveFeature(null)}
                >
                  <div className={`p-6 ${feature.gradient} relative overflow-hidden`}>
                    <div className="absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 opacity-10 transform rotate-12">
                      <feature.icon className="w-full h-full" />
                    </div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 rounded-xl bg-white shadow-lg group-hover:shadow-xl transition-all duration-300">
                        <feature.icon className={`w-6 h-6 ${feature.iconColor} transform group-hover:scale-110 transition-transform`} />
                      </div>
                      <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                    </div>
                    <h3 className="font-bold text-xl mb-3 text-gray-900 group-hover:text-gray-800 transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                      {feature.description}
                    </p>
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-medium text-gray-500 bg-white/80 px-2 py-1 rounded-full">
                        {feature.stats}
                      </span>
                      <div className="bg-white text-gray-700 px-3 py-1 rounded-full text-sm font-medium group-hover:text-blue-600 transition-colors flex items-center">
                        Try Now
                        <ArrowRight className="w-3 h-3 ml-1 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Recent Activity */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-bold text-lg mb-4 text-gray-900 flex items-center">
                <Clock className="w-5 h-5 mr-2 text-blue-500" />
                Recent Activity
              </h3>
              <div className="space-y-4">
                {recentActivities.map((activity, index) => (
                  <div
                    key={index}
                    className={`flex items-start p-4 rounded-xl border transition-all duration-300 hover:shadow-md ${
                      activity.status === 'completed' 
                        ? 'border-emerald-200 bg-emerald-50/50' 
                        : 'border-amber-200 bg-amber-50/50'
                    } ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'}`}
                    style={{ transitionDelay: `${index * 200}ms` }}
                  >
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-3 mt-1 text-xs font-bold ${
                      activity.status === 'completed' 
                        ? 'bg-emerald-500 text-white' 
                        : 'bg-amber-500 text-white'
                    }`}>
                      {getStatusIcon(activity.status)}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm text-gray-900">{activity.action}</p>
                      <p className="text-xs text-gray-500 mt-1">{activity.case}</p>
                      <p className="text-xs text-gray-400 mt-1">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-xl p-6 text-white">
              <h3 className="font-bold text-lg mb-4 flex items-center">
                <Target className="w-5 h-5 mr-2" />
                Your Performance
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-blue-100">Task Completion</span>
                  <span className="font-bold">94%</span>
                </div>
                <div className="w-full bg-blue-400/30 rounded-full h-2">
                  <div className="bg-white h-2 rounded-full transition-all duration-1000" style={{ width: isVisible ? '94%' : '0%' }}></div>
                </div>
                
                <div className="flex justify-between items-center mt-4">
                  <span className="text-blue-100">Time Saved</span>
                  <span className="font-bold">1,247h</span>
                </div>
                <div className="w-full bg-blue-400/30 rounded-full h-2">
                  <div className="bg-emerald-400 h-2 rounded-full transition-all duration-1000" style={{ width: isVisible ? '87%' : '0%' }}></div>
                </div>
                
                <div className="flex justify-between items-center mt-4">
                  <span className="text-blue-100">Accuracy Rate</span>
                  <span className="font-bold">96%</span>
                </div>
                <div className="w-full bg-blue-400/30 rounded-full h-2">
                  <div className="bg-amber-400 h-2 rounded-full transition-all duration-1000" style={{ width: isVisible ? '96%' : '0%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}