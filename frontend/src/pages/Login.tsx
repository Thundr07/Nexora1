import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Sparkles, GraduationCap, ShieldAlert, Eye, EyeOff } from 'lucide-react';

const Login: React.FC = () => {
  const { login, logout } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Mode state: 'student' or 'admin'
  const [mode, setMode] = useState<'student' | 'admin'>('student');
  const [isRegistering, setIsRegistering] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [departmentCode, setDepartmentCode] = useState('CS');
  const [year, setYear] = useState('3');
  const [semester, setSemester] = useState('5');

  // Sync mode with URL query search params (?mode=admin)
  useEffect(() => {
    const urlMode = searchParams.get('mode');
    if (urlMode === 'admin') {
      setMode('admin');
      setIsRegistering(false);
    } else {
      setMode('student');
    }
  }, [searchParams]);

  // Handle Tab Switch
  const handleModeSwitch = (targetMode: 'student' | 'admin') => {
    setMode(targetMode);
    setIsRegistering(false);
    setError(null);
    setSuccess(null);
    setPassword('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      if (isRegistering && mode === 'student') {
        // Register Student
        await registerUser();
      } else {
        // Sign In (Unified for both student and admin)
        const userProfile = await login(email, password);

        if (mode === 'admin') {
          if (userProfile.role === 'admin') {
            navigate('/admin');
          } else {
            // Student tried logging into admin mode
            logout();
            setError('Access Denied: You do not have administrator permissions for the Control Console.');
          }
        } else {
          // Student Mode login
          if (userProfile.role === 'admin') {
            // If admin logs in under student, redirect to admin console for correctness
            navigate('/admin');
          } else {
            navigate('/dashboard');
          }
        }
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please verify credentials.');
      logout();
    } finally {
      setLoading(false);
    }
  };

  const registerUser = async () => {
    try {
      await axios.post('/api/auth/register', {
        name,
        rollNumber,
        departmentCode,
        year: parseInt(year),
        semester: parseInt(semester),
        email,
        password,
      });
      setSuccess('Profile registered successfully! You can sign in now.');
      setIsRegistering(false);
      setPassword('');
    } catch (err: any) {
      throw new Error(err.response?.data?.error || 'Registration failed.');
    }
  };

  return (
    <div className="min-h-screen bg-midnight relative flex items-center justify-center p-4 overflow-hidden">
      {/* Dynamic background lights matching active mode */}
      <div className={`absolute top-0 right-0 w-[500px] h-[500px] opacity-20 blur-[150px] rounded-full transition-colors duration-500 ${
        mode === 'admin' ? 'bg-red-950' : 'bg-surface-accent'
      }`}></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-surface-primary/10 opacity-20 blur-[120px] rounded-full"></div>
      <div className="noise-bg"></div>

      <div className="w-full max-w-lg z-10">
        {/* Portal Branding */}
        <div className="text-center mb-8">
          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border backdrop-blur-md mb-4 transition-all duration-300 ${
            mode === 'admin' 
              ? 'bg-red-950/20 border-red-800/30 text-red-400' 
              : 'bg-surface-primary/60 border-surface-accent/20 text-accent'
          }`}>
            <Sparkles className="w-4 h-4 animate-pulse" />
            <span className="text-[9px] uppercase tracking-widest font-black font-mono">
              {mode === 'admin' ? 'System Console Terminal' : 'Nexora Student Ecosystem'}
            </span>
          </div>
          <h1 className="text-5xl font-extrabold tracking-tighter text-warm-white mb-2 font-sans">NEXORA</h1>
          <p className="text-surface-accent text-sm tracking-wide">Modern Swiss Editorial College Ecosystem</p>
        </div>

        {/* Unified Login Card Container */}
        <div className={`glass-card p-8 bg-surface-primary/30 border rounded-xl transition-colors duration-300 ${
          mode === 'admin' ? 'border-red-900/35 shadow-glow' : 'border-surface-accent/15'
        }`}>
          
          {/* TAB SELECTOR */}
          <div className="flex border border-surface-accent/10 rounded-lg p-1 bg-midnight/40 mb-6 gap-1">
            <button
              onClick={() => handleModeSwitch('student')}
              className={`flex-1 py-2.5 rounded text-xs uppercase tracking-wider font-extrabold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                mode === 'student'
                  ? 'bg-btn-gradient text-midnight shadow-md'
                  : 'text-surface-accent hover:text-warm-white'
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              Student Portal
            </button>
            <button
              onClick={() => handleModeSwitch('admin')}
              className={`flex-1 py-2.5 rounded text-xs uppercase tracking-wider font-extrabold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                mode === 'admin'
                  ? 'bg-red-950/60 border border-red-800/30 text-red-300'
                  : 'text-surface-accent hover:text-warm-white'
              }`}
            >
              <ShieldAlert className="w-4 h-4" />
              Admin Console
            </button>
          </div>

          <h2 className="text-2xl font-bold tracking-tight text-warm-white mb-6 text-left">
            {mode === 'admin' ? 'Administrative Access' : isRegistering ? 'Create Student Profile' : 'Sign In'}
          </h2>

          {error && (
            <div className="p-3 mb-5 rounded bg-red-950/40 border border-red-800/40 text-red-200 text-xs tracking-wide">
              {error}
            </div>
          )}

          {success && (
            <div className="p-3 mb-5 rounded bg-emerald-950/40 border border-emerald-800/40 text-emerald-200 text-xs tracking-wide">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegistering && mode === 'student' && (
              <>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-surface-accent font-semibold mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Alice Vance"
                    className="w-full bg-midnight/50 border border-surface-accent/20 rounded px-4 py-2.5 text-sm text-warm-white placeholder-surface-accent/40 focus:outline-none focus:border-accent transition-colors"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-surface-accent font-semibold mb-1">Roll Number</label>
                    <input
                      type="text"
                      required
                      value={rollNumber}
                      onChange={(e) => setRollNumber(e.target.value)}
                      placeholder="CS2024001"
                      className="w-full bg-midnight/50 border border-surface-accent/20 rounded px-4 py-2.5 text-sm text-warm-white placeholder-surface-accent/40 focus:outline-none focus:border-accent transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-surface-accent font-semibold mb-1">Department</label>
                    <select
                      value={departmentCode}
                      onChange={(e) => setDepartmentCode(e.target.value)}
                      className="w-full bg-midnight/50 border border-surface-accent/20 rounded px-4 py-2.5 text-sm text-warm-white focus:outline-none focus:border-accent transition-colors cursor-pointer"
                    >
                      <option value="CS">CSE (Computer Science)</option>
                      <option value="EE">EEE (Electrical)</option>
                      <option value="ME">ME (Mechanical)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-surface-accent font-semibold mb-1">Year</label>
                    <select
                      value={year}
                      onChange={(e) => setYear(e.target.value)}
                      className="w-full bg-midnight/50 border border-surface-accent/20 rounded px-4 py-2.5 text-sm text-warm-white focus:outline-none focus:border-accent transition-colors cursor-pointer"
                    >
                      <option value="1">Year 1</option>
                      <option value="2">Year 2</option>
                      <option value="3">Year 3</option>
                      <option value="4">Year 4</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-surface-accent font-semibold mb-1">Semester</label>
                    <select
                      value={semester}
                      onChange={(e) => setSemester(e.target.value)}
                      className="w-full bg-midnight/50 border border-surface-accent/20 rounded px-4 py-2.5 text-sm text-warm-white focus:outline-none focus:border-accent transition-colors cursor-pointer"
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
                        <option key={s} value={s.toString()}>Sem {s}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-[10px] uppercase tracking-widest text-surface-accent font-bold mb-1.5">
                {mode === 'admin' ? 'Admin Email' : 'College Email'}
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={mode === 'admin' ? 'admin@nexora.edu' : 'alice@nexora.edu'}
                className={`w-full bg-midnight/50 border rounded px-4 py-2.5 text-sm text-warm-white placeholder-surface-accent/30 focus:outline-none transition-colors ${
                  mode === 'admin' ? 'border-red-900/30 focus:border-red-500 font-mono' : 'border-surface-accent/20 focus:border-accent'
                }`}
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-widest text-surface-accent font-bold mb-1.5">
                {mode === 'admin' ? 'System Passcode' : 'Security Password'}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={`w-full bg-midnight/50 border rounded px-4 py-2.5 text-sm text-warm-white placeholder-surface-accent/30 focus:outline-none transition-colors pr-10 ${
                    mode === 'admin' ? 'border-red-900/30 focus:border-red-500 font-mono' : 'border-surface-accent/20 focus:border-accent'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-surface-accent hover:text-warm-white cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full mt-6 py-3 rounded active:scale-[0.99] transition-all uppercase tracking-widest text-xs flex items-center justify-center gap-2 font-bold cursor-pointer ${
                mode === 'admin' 
                  ? 'bg-red-950/60 hover:bg-red-950/80 border border-red-700/40 text-red-200 font-mono' 
                  : 'bg-btn-gradient text-midnight hover:opacity-90'
              }`}
            >
              {loading ? (
                <div className={`w-4 h-4 rounded-full border-2 border-t-transparent animate-spin ${
                  mode === 'admin' ? 'border-red-400' : 'border-midnight'
                }`}></div>
              ) : mode === 'admin' ? (
                'Authenticate Admin'
              ) : isRegistering ? (
                'Register Profile'
              ) : (
                'Student Log In'
              )}
            </button>
          </form>

          {/* Toggle registration link */}
          {mode === 'student' && (
            <div className="mt-6 text-center border-t border-surface-accent/5 pt-4">
              <button
                onClick={() => {
                  setIsRegistering(!isRegistering);
                  setError(null);
                  setSuccess(null);
                }}
                className="text-[10px] text-accent hover:underline uppercase tracking-widest font-semibold transition-colors"
              >
                {isRegistering ? 'Already registered? Student Sign In' : 'New student? Register Profile'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
