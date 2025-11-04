import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Scale, 
  FileText, 
  Newspaper, 
  Settings,
  Menu,
  X,
  User,
  Search,
  Bell,
  MessageSquare,
  Zap,
  Crown
} from 'lucide-react';

const menuItems = [
  { icon: Scale, label: 'Case Research', path: '/cases' },
  { icon: FileText, label: 'Contract Analysis', path: '/contracts' },
  { icon: Newspaper, label: 'Legal News', path: '/news' },
  { icon: LayoutDashboard, label: 'Find a Lawyer', path: '/find-lawyer' },
];

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        className="md:hidden fixed top-6 right-6 z-50 bg-slate-800/90 backdrop-blur-sm text-white p-3 rounded-xl border border-slate-700 shadow-lg hover:bg-slate-700 transition-all duration-200"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Sidebar */}
      <div className={`
        fixed md:static inset-y-0 left-0 z-40
        transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
        md:translate-x-0 transition-all duration-300 ease-in-out
        w-80 bg-slate-900 text-white p-6 flex flex-col
        overflow-y-auto min-h-screen md:min-h-0 border-r border-slate-700
        shadow-2xl
      `}>
        {/* Logo Section */}
        <div 
          className="flex items-center gap-3 mb-8 px-2 cursor-pointer group"
          onClick={() => {
            navigate('/');
            setIsOpen(false);
          }}
        >
          <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg group-hover:shadow-blue-500/30 transition-all duration-300">
            <Scale className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
              LegalAI Pro
            </h1>
            <p className="text-sm text-slate-400 mt-0.5 font-medium">Premium Legal Intelligence</p>
          </div>
        </div>

        {/* Premium Badge */}
        <div className="mb-6 p-4 bg-gradient-to-r from-blue-900/50 to-purple-900/50 rounded-xl border border-blue-700/30">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-500/20 rounded-lg">
              <Crown className="w-4 h-4 text-yellow-400" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-white">Premium Plan</p>
              <p className="text-xs text-blue-300">Unlimited access</p>
            </div>
            <Zap className="w-4 h-4 text-yellow-400" />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8 p-4 bg-slate-800/50 rounded-xl border border-slate-700">
          <div className="flex gap-3">
            <button className="flex-1 flex items-center justify-center gap-2 p-3 bg-slate-700 rounded-lg border border-slate-600 text-white hover:bg-slate-600 transition-all duration-200 shadow-sm hover:shadow-blue-500/10">
              <Search className="w-4 h-4" />
              <span className="text-sm font-semibold">Search</span>
            </button>
            <button className="flex-1 flex items-center justify-center gap-2 p-3 bg-slate-700 rounded-lg border border-slate-600 text-white hover:bg-slate-600 transition-all duration-200 shadow-sm hover:shadow-blue-500/10">
              <MessageSquare className="w-4 h-4" />
              <span className="text-sm font-semibold">Chat</span>
            </button>
          </div>
        </div>
        
        {/* Navigation Menu */}
        <nav className="flex-1">
          <div className="mb-4 px-2">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">MAIN NAVIGATION</h3>
          </div>
          <ul className="space-y-2">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <li key={item.label}>
                  <Link
                    to={item.path}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 group border ${
                      isActive
                        ? 'bg-blue-600 text-white border-blue-500 shadow-lg shadow-blue-500/30'
                        : 'text-slate-300 border-transparent hover:bg-slate-800 hover:border-slate-600 hover:text-white'
                    }`}
                  >
                    <div className={`p-2 rounded-lg transition-all duration-200 ${
                      isActive 
                        ? 'bg-white/20' 
                        : 'bg-slate-700 group-hover:bg-slate-600'
                    }`}>
                      <item.icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-300 group-hover:text-white'}`} />
                    </div>
                    <span className="font-semibold tracking-wide">{item.label}</span>
                    {isActive && (
                      <div className="ml-auto w-2 h-2 bg-blue-300 rounded-full animate-pulse" />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Bottom Section */}
        <div className="mt-auto space-y-4">
          {/* Stats Section */}
          <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-semibold text-slate-300">Today's Usage</span>
              <span className="text-xs text-green-400 font-semibold">12/∞ searches</span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-2">
              <div className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full w-3/4"></div>
            </div>
            <p className="text-xs text-slate-400 mt-2">Premium unlimited access</p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <button className="flex-1 flex items-center justify-center gap-2 p-3 bg-slate-800 rounded-xl text-slate-300 hover:bg-slate-700 hover:text-white transition-all duration-200 border border-slate-700">
              <Bell className="w-4 h-4" />
            </button>
            <button className="flex-1 flex items-center justify-center gap-2 p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-500 transition-all duration-200 border border-blue-500 font-semibold shadow-lg hover:shadow-blue-500/20">
              <User className="w-4 h-4" />
              <span>Profile</span>
            </button>
            <button className="flex-1 flex items-center justify-center gap-2 p-3 bg-slate-800 rounded-xl text-slate-300 hover:bg-slate-700 hover:text-white transition-all duration-200 border border-slate-700">
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}