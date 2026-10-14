import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, ArrowRight, GraduationCap } from 'lucide-react';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login, quickDemoLogin } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = async (role) => {
    setError('');
    setLoading(true);
    try {
      await quickDemoLogin(role);
      navigate('/');
    } catch (err) {
      setError('Failed to log in with test account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 bg-slate-50">
      <div className="w-full max-w-md space-y-6">
        <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-xs">
          <div className="text-center mb-6">
            <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center mx-auto mb-3 text-blue-600">
              <GraduationCap className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900">Sign In to CampusPulse</h1>
            <p className="text-xs text-slate-500 mt-1">
              Enter your college student or coordinator credentials.
            </p>
          </div>

          {error && (
            <div className="mb-5 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs">
              {error}
            </div>
          )}

          {/* Quick Testing Accounts */}
          <div className="mb-6 p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
              <span className="w-2 h-2 rounded-full bg-blue-600 inline-block" />
              <span>Quick Login (Tester Accounts):</span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemo('student')}
                className="py-1.5 px-1 rounded-lg bg-white hover:bg-slate-100 text-slate-800 text-xs font-semibold transition border border-slate-300 shadow-2xs text-center"
              >
                🎓 Student
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemo('coordinator')}
                className="py-1.5 px-1 rounded-lg bg-white hover:bg-slate-100 text-slate-800 text-xs font-semibold transition border border-slate-300 shadow-2xs text-center"
              >
                👩‍💻 Coordinator
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemo('admin')}
                className="py-1.5 px-1 rounded-lg bg-white hover:bg-slate-100 text-slate-800 text-xs font-semibold transition border border-slate-300 shadow-2xs text-center"
              >
                👨‍💼 Admin
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                College Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  required
                  placeholder="name@college.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-600"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-xs transition"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          <p className="mt-5 text-center text-xs text-slate-500">
            Don't have an account?{' '}
            <Link to="/register" className="text-blue-600 hover:underline font-semibold">
              Register as Student / Society Lead
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
