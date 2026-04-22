import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin, CredentialResponse } from '@react-oauth/google';
import { useAuth } from '../../contexts/AuthContext';
import {
  Mail,
  Lock,
  User,
  Loader,
  ArrowRight,
  Github,
} from 'lucide-react';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { login, signup, googleLogin } = useAuth();

  const [formData, setFormData] = useState({ email: '', password: '', name: '' });

  // ── Email/Password submit ─────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (isLogin) {
        await login(formData.email, formData.password);
      } else {
        await signup(formData.email, formData.name, formData.password);
      }
      console.log('[Auth] Email/password auth success, navigating to /dashboard');
      navigate('/dashboard');
    } catch (err: any) {
      console.error('[Auth] Email/password auth error:', err);
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

  // ── Google credential flow (send credential to backend to store user) ─────
  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    console.log('[Auth] Google credential response received:', credentialResponse);
    setError(null);
    setLoading(true);
    try {
      if (!credentialResponse.credential) {
        throw new Error('No credential returned from Google');
      }
      await googleLogin(credentialResponse.credential);
      console.log('[Auth] googleLogin() success, navigating to /dashboard');
      navigate('/dashboard');
    } catch (err: any) {
      console.error('[Auth] Google login decode error:', err);
      setError(err.message || 'Google sign-in failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    console.error('[Auth] Google sign-in failed or was cancelled');
    setError('Google sign-in failed. Please try again.');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">

        {/* Card */}
        <div className="bg-white/95 backdrop-blur rounded-2xl shadow-2xl p-8 relative">

          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900">
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </h2>
            <p className="text-gray-500 mt-2">
              {isLogin ? 'Login to continue' : 'Sign up to start using the platform'}
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm transition-all">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <div>
                <label className="text-sm font-medium text-gray-700">Full Name</label>
                <div className="relative mt-1">
                  <User className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required={!isLogin}
                    placeholder="John Doe"
                    disabled={loading}
                    className="w-full pl-10 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="text-sm font-medium text-gray-700">Email</label>
              <div className="relative mt-1">
                <Mail className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="you@email.com"
                  disabled={loading}
                  className="w-full pl-10 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Password</label>
              <div className="relative mt-1">
                <Lock className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  placeholder="••••••••"
                  disabled={loading}
                  className="w-full pl-10 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg flex items-center justify-center gap-2 transition disabled:opacity-60"
            >
              {loading ? (
                <Loader className="animate-spin w-5 h-5" />
              ) : (
                <>
                  {isLogin ? 'Sign In' : 'Create Account'}
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center my-6">
            <div className="flex-grow border-t border-gray-200" />
            <span className="mx-3 text-sm text-gray-500">OR</span>
            <div className="flex-grow border-t border-gray-200" />
          </div>

          {/* Social Auth */}
          <div className="space-y-3">
            <div className="flex justify-center relative z-10 pointer-events-auto">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                width="368"
                theme="outline"
                size="large"
                text="continue_with"
                shape="rectangular"
                logo_alignment="left"
              />
            </div>

            {/* GitHub (placeholder) */}
            <button
              id="github-signin-btn"
              type="button"
              disabled={loading}
              className="w-full border border-gray-300 py-2 rounded-lg flex items-center justify-center gap-3 hover:bg-gray-50 transition disabled:opacity-60"
            >
              <Github className="w-5 h-5" />
              <span className="text-sm font-medium text-gray-700">
                Continue with GitHub
              </span>
            </button>
          </div>

          {/* Switch */}
          <div className="mt-6 text-center">
            <button
              type="button"
              disabled={loading}
              onClick={() => { setIsLogin(!isLogin); setError(null); }}
              className="text-blue-600 hover:text-blue-700 font-medium text-sm disabled:opacity-60"
            >
              {isLogin ? "Don't have an account? Sign Up" : 'Already have an account? Sign In'}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
// import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { useAuth } from '../../contexts/AuthContext';
// import { Mail, Lock, User, Loader, ArrowRight } from 'lucide-react';

// export default function Auth() {
//   const [isLogin, setIsLogin] = useState(true);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const navigate = useNavigate();
//   const { login, signup } = useAuth();

//   const [formData, setFormData] = useState({
//     email: '',
//     password: '',
//     name: '',
//     username: '',
//   });

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setError(null);
//     setLoading(true);

//     try {
//       if (isLogin) {
//         await login(formData.email, formData.username || formData.name || formData.email.split('@')[0], formData.password);
//       } else {
//         await signup(formData.email, formData.name, formData.password);
//       }
//       navigate('/dashboard');
//     } catch (err) {
//       setError(err instanceof Error ? err.message : 'An error occurred');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     setFormData(prev => ({
//       ...prev,
//       [e.target.name]: e.target.value
//     }));
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex items-center justify-center p-4">
//       <div className="max-w-md w-full">
//         <div className="bg-white rounded-2xl shadow-xl p-8">
//           <div className="text-center mb-8">
//             <h2 className="text-3xl font-bold text-gray-900">
//               {isLogin ? 'Welcome back' : 'Create an account'}
//             </h2>
//             <p className="text-gray-600 mt-2">
//               {isLogin ? 'Sign in to access your account' : 'Sign up to get started'}
//             </p>
//           </div>

//           {error && (
//             <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 text-red-700">
//               {error}
//             </div>
//           )}

//           <form onSubmit={handleSubmit} className="space-y-6">
//             {isLogin ? (
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Username
//                 </label>
//                 <div className="relative">
//                   <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
//                   <input
//                     type="text"
//                     name="username"
//                     value={formData.username}
//                     onChange={handleChange}
//                     className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                     placeholder="Your username"
//                     required
//                   />
//                 </div>
//               </div>
//             ) : (
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Full Name
//                 </label>
//                 <div className="relative">
//                   <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
//                   <input
//                     type="text"
//                     name="name"
//                     value={formData.name}
//                     onChange={handleChange}
//                     className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                     placeholder="John Doe"
//                     required={!isLogin}
//                   />
//                 </div>
//               </div>
//             )}

//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Email Address
//               </label>
//               <div className="relative">
//                 <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
//                 <input
//                   type="email"
//                   name="email"
//                   value={formData.email}
//                   onChange={handleChange}
//                   className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                   placeholder="you@example.com"
//                   required
//                 />
//               </div>
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Password
//               </label>
//               <div className="relative">
//                 <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
//                 <input
//                   type="password"
//                   name="password"
//                   value={formData.password}
//                   onChange={handleChange}
//                   className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                   placeholder="••••••••"
//                   required
//                 />
//               </div>
//             </div>

//             <button
//               type="submit"
//               disabled={loading}
//               className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
//             >
//               {loading ? (
//                 <Loader className="w-5 h-5 animate-spin" />
//               ) : (
//                 <>
//                   {isLogin ? 'Sign In' : 'Create Account'}
//                   <ArrowRight className="w-5 h-5" />
//                 </>
//               )}
//             </button>
//           </form>

//           <div className="mt-6 text-center">
//             <button
//               onClick={() => setIsLogin(!isLogin)}
//               className="text-blue-600 hover:text-blue-700 font-medium"
//             >
//               {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }