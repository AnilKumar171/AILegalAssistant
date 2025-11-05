import React, { useEffect, useState } from 'react';
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
import { useAuth } from '../contexts/AuthContext';

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
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const { user, logout, updateProfile, updatePassword } = useAuth();

  // Theme state
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const stored = localStorage.getItem('theme');
    return stored ? stored === 'dark' : false;
  });

  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  // Listen for global openProfile events (e.g., from Dashboard avatar click)
  useEffect(() => {
    const handler = () => setIsProfileOpen(true);
    // @ts-ignore - Custom event not in Window typing here
    window.addEventListener('openProfile', handler as EventListener);
    return () => {
      // @ts-ignore
      window.removeEventListener('openProfile', handler as EventListener);
    };
  }, []);

  // Profile form state
  const [profileName, setProfileName] = useState(user?.name || '');
  const [profileEmail, setProfileEmail] = useState(user?.email || '');
  const [profileDob, setProfileDob] = useState(user?.dob || '');
  const [avatarPreview, setAvatarPreview] = useState<string | undefined>(user?.avatarUrl);
  const [newPassword, setNewPassword] = useState('');
  const [initialAvatar, setInitialAvatar] = useState<string | undefined>(user?.avatarUrl);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    // sync when modal opens or user changes
    if (isProfileOpen) {
      setProfileName(user?.name || '');
      setProfileEmail(user?.email || '');
      setProfileDob(user?.dob || '');
      setAvatarPreview(user?.avatarUrl);
      setInitialAvatar(user?.avatarUrl);
    }
  }, [isProfileOpen, user]);

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
            <button
              className="flex-1 flex items-center justify-center gap-2 p-3 bg-slate-700 rounded-lg border border-slate-600 text-white hover:bg-slate-600 transition-all duration-200 shadow-sm hover:shadow-blue-500/10"
              onClick={() => {
                const evt = new Event('openChat');
                window.dispatchEvent(evt);
                setIsOpen(false);
              }}
            >
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
            <button className="flex-1 flex items-center justify-center gap-2 p-3 bg-slate-800 rounded-xl text-slate-300 hover:bg-slate-700 hover:text-white transition-all duration-200 border border-slate-700" onClick={() => setIsProfileOpen(true)}>
              <Bell className="w-4 h-4" />
            </button>
            <button className="flex-1 flex items-center justify-center gap-2 p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-500 transition-all duration-200 border border-blue-500 font-semibold shadow-lg hover:shadow-blue-500/20" onClick={() => setIsProfileOpen(true)}>
              <User className="w-4 h-4" />
              <span>Profile</span>
            </button>
            <button className="flex-1 flex items-center justify-center gap-2 p-3 bg-slate-800 rounded-xl text-slate-300 hover:bg-slate-700 hover:text-white transition-all duration-200 border border-slate-700" onClick={() => setIsSettingsOpen(true)}>
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Profile Modal */}
      {isProfileOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setIsProfileOpen(false)} />
          <div className="relative z-10 w-full max-w-lg mx-auto bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-6 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Profile</h3>
              <button className="text-slate-500 hover:text-slate-300" onClick={() => setIsProfileOpen(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex items-center gap-4 mb-6">
              <label className="relative cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onload = () => setAvatarPreview(reader.result as string);
                    reader.readAsDataURL(file);
                  }}
                />
                {avatarPreview ? (
                  <img src={avatarPreview} alt="avatar" className="w-16 h-16 rounded-xl object-cover border border-slate-200 dark:border-slate-700" />
                ) : (
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white flex items-center justify-center text-xl font-bold">
                    {(profileName || 'U').charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="absolute -bottom-2 left-0 text-xs bg-slate-900 text-white px-2 py-0.5 rounded">Change</span>
              </label>
              <div className="flex-1 grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-600 dark:text-slate-300 mb-1">Name</label>
                  <input className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100" value={profileName} onChange={e => setProfileName(e.target.value)} />
                </div>
                <div>
                  <label className="block text-xs text-slate-600 dark:text-slate-300 mb-1">Email</label>
                  <input type="email" className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100" value={profileEmail} onChange={e => setProfileEmail(e.target.value)} />
                </div>
                <div>
                  <label className="block text-xs text-slate-600 dark:text-slate-300 mb-1">Date of Birth</label>
                  <input type="date" className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100" value={profileDob} onChange={e => setProfileDob(e.target.value)} />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 mb-2">
              <button className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-100 hover:bg-slate-200 dark:hover:bg-slate-700" onClick={() => setAvatarPreview(initialAvatar)}>
                Keep Photo
              </button>
              <button className="px-3 py-1.5 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 border border-red-200" onClick={() => setAvatarPreview(undefined)}>
                Remove Photo
              </button>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-semibold text-slate-800 dark:text-slate-100 mb-2">Update Password</label>
              <input type="password" className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100" placeholder="New password" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
            </div>

            <div className="mt-6 flex items-center justify-between gap-3">
              <button
                className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700"
                onClick={() => {
                  setIsProfileOpen(false);
                  logout();
                  navigate('/');
                }}
              >Logout</button>
              <div className="flex gap-2">
                <button className="px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-100 hover:bg-slate-200 dark:hover:bg-slate-700" onClick={() => setIsProfileOpen(false)}>Cancel</button>
                <button
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
                  disabled={saving}
                  onClick={async () => {
                    try {
                      setSaving(true);
                      await updateProfile({ name: profileName, email: profileEmail, dob: profileDob, avatarUrl: avatarPreview });
                      if (newPassword) {
                        await updatePassword(newPassword);
                        setNewPassword('');
                      }
                      setIsProfileOpen(false);
                    } finally {
                      setSaving(false);
                    }
                  }}
                >Save Changes</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setIsSettingsOpen(false)} />
          <div className="relative z-10 w-full max-w-md mx-auto bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-6 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Settings</h3>
              <button className="text-slate-500 hover:text-slate-300" onClick={() => setIsSettingsOpen(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-700 dark:text-slate-200">Dark Mode</span>
                <input type="checkbox" checked={darkMode} onChange={() => setDarkMode(v => !v)} className="h-4 w-4" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-700 dark:text-slate-200">Notifications</span>
                <input type="checkbox" defaultChecked className="h-4 w-4" />
              </div>
              <div>
                <label className="block text-sm text-slate-700 dark:text-slate-200 mb-1">Feedback</label>
                <textarea className="w-full min-h-24 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100" placeholder="Tell us what to improve..." value={feedback} onChange={e => setFeedback(e.target.value)} />
                <div className="mt-2 flex justify-end">
                  <button className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-100 hover:bg-slate-200 dark:hover:bg-slate-700" onClick={() => setFeedback('')}>Clear</button>
                </div>
              </div>
              <div className="pt-2 border-t border-slate-200 dark:border-slate-800 mt-2">
                <button
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700"
                  onClick={() => {
                    logout();
                    setIsSettingsOpen(false);
                    navigate('/');
                  }}
                >
                  <X className="w-4 h-4" />
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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