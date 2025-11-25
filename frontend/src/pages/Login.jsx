import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Lock, User, ArrowRight } from 'lucide-react';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(username, password);
      navigate('/');
    } catch (err) {
      setError('Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center p-4">
      {/* Decorative Circles */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-900/20 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-md w-full bg-white/90 backdrop-blur-2xl rounded-3xl shadow-2xl overflow-hidden relative z-10 border border-white/50">
        <div className="p-8 pb-0 text-center">
          <div className="mx-auto bg-gradient-to-br from-indigo-500 to-purple-600 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-indigo-500/30 transform -rotate-3">
            <LayoutDashboard className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-extrabold text-slate-800">Welcome Back</h2>
          <p className="text-slate-500 mt-2">Enter your details to access the portal.</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {error && (
            <div className="p-4 bg-rose-50 text-rose-600 text-sm font-medium rounded-xl border border-rose-100 flex items-center animate-fade-in">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 ml-1">Username</label>
            <div className="relative group">
              <User className="w-5 h-5 text-slate-400 absolute left-4 top-3.5 group-focus-within:text-indigo-500 transition-colors" />
              <input
                type="text"
                required
                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all font-medium text-slate-700"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 ml-1">Password</label>
            <div className="relative group">
              <Lock className="w-5 h-5 text-slate-400 absolute left-4 top-3.5 group-focus-within:text-indigo-500 transition-colors" />
              <input
                type="password"
                required
                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all font-medium text-slate-700"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold py-4 rounded-xl transition-all shadow-xl shadow-indigo-500/30 flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed transform hover:-translate-y-1"
          >
            {loading ? 'Signing in...' : 'Sign In to Dashboard'}
            {!loading && <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
          </button>
        </form>
        <div className="bg-slate-50 p-4 text-center text-xs text-slate-400 font-medium">
          Protected by Enterprise Security
        </div>
      </div>
    </div>
  );
}