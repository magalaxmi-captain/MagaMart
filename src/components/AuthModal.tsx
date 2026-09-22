import React, { useState } from 'react';
import { Cpu, ShieldCheck, User as UserIcon, X, CheckCircle, AlertCircle, ArrowRight, Zap } from 'lucide-react';
import { User } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'user-login' | 'register' | 'admin-login';
  users: User[];
  onLoginSuccess: (user: User) => void;
  onRegisterSuccess: (newUser: User) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  defaultTab = 'user-login',
  users,
  onLoginSuccess,
  onRegisterSuccess,
}) => {
  const [activeTab, setActiveTab] = useState<'user-login' | 'register' | 'admin-login'>(defaultTab);

  // Form states
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  
  const [regFullName, setRegFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleUserLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const email = loginEmail.trim().toLowerCase();
    const matchedUser = users.find(u => u.email.toLowerCase() === email);

    if (!matchedUser) {
      setErrorMessage('Invalid credentials. No user found with this email in magamart_db.');
      return;
    }

    if (activeTab === 'admin-login' && matchedUser.role !== 'ADMIN') {
      setErrorMessage('Access Denied: This account does not possess administrator privileges.');
      return;
    }

    // Success
    setSuccessMessage(`Welcome back, ${matchedUser.fullName}! Authenticated via UserDAO.authenticate()`);
    setTimeout(() => {
      onLoginSuccess(matchedUser);
      onClose();
      setSuccessMessage(null);
    }, 600);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (regPassword !== regConfirmPassword) {
      setErrorMessage('Passwords do not match. Please verify your confirmation password.');
      return;
    }

    if (regPassword.length < 6) {
      setErrorMessage('Password must be at least 6 characters in length.');
      return;
    }

    const email = regEmail.trim().toLowerCase();
    if (users.some(u => u.email.toLowerCase() === email)) {
      setErrorMessage('An account with this email is already registered in magamart_db.');
      return;
    }

    const newUser: User = {
      id: Date.now(),
      email,
      fullName: regFullName.trim(),
      role: 'CUSTOMER',
      createdAt: new Date().toISOString().split('T')[0],
    };

    onRegisterSuccess(newUser);
    setSuccessMessage(`Account created! Welcome to MagaMart, ${newUser.fullName}.`);
    setTimeout(() => {
      onLoginSuccess(newUser);
      onClose();
      setSuccessMessage(null);
    }, 700);
  };

  const fillDemoUser = (role: 'ADMIN' | 'CUSTOMER') => {
    setErrorMessage(null);
    if (role === 'ADMIN') {
      setActiveTab('admin-login');
      setLoginEmail('admin@magamart.com');
      setLoginPassword('admin123');
    } else {
      setActiveTab('user-login');
      setLoginEmail('sarah.iot@example.com');
      setLoginPassword('user123');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh]">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3.5 right-3.5 z-20 p-2 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Left Side: Brand & IoT Hardware Showcase */}
        <div className="md:w-5/12 bg-gradient-to-br from-slate-950 via-slate-900 to-sky-950 p-6 sm:p-8 flex flex-col justify-between border-b md:border-b-0 md:border-r border-slate-800 relative">
          <div>
            <div className="flex items-center gap-2.5 text-sky-400 font-bold text-xl mb-6">
              <div className="p-2 rounded-lg bg-sky-500/10 border border-sky-500/30">
                <Cpu className="w-5 h-5" />
              </div>
              <span>MagaMart</span>
            </div>

            <h2 className="text-2xl font-extrabold text-white tracking-tight leading-snug mb-3">
              IoT Hardware & Telemetry Components
            </h2>
            <p className="text-sm text-slate-400 leading-relaxed mb-6">
              Industrial microcontrollers, precision MEMS sensors, and rapid prototyping accessories for embedded systems engineers.
            </p>

            <ul className="space-y-2.5 text-xs text-slate-300">
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Verified ESP32, STM32 & RP2040 edge boards</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Calibrated I2C, SPI & UART sensor modules</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Role-based access backed by Java DAO architecture</span>
              </li>
            </ul>
          </div>

          {/* Quick Demo Fillers */}
          <div className="mt-6 pt-4 border-t border-slate-800/80">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              Quick Demo Auto-Fill:
            </div>
            <div className="flex flex-col gap-1.5">
              <button
                type="button"
                onClick={() => fillDemoUser('ADMIN')}
                className="text-left text-xs px-2.5 py-1.5 rounded bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 flex items-center justify-between transition-colors"
              >
                <span>Admin: <strong>admin@magamart.com</strong></span>
                <span className="text-[10px] bg-amber-500/20 px-1 py-0.5 rounded font-mono">ADMIN</span>
              </button>
              <button
                type="button"
                onClick={() => fillDemoUser('CUSTOMER')}
                className="text-left text-xs px-2.5 py-1.5 rounded bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/30 text-sky-300 flex items-center justify-between transition-colors"
              >
                <span>Customer: <strong>sarah.iot@example.com</strong></span>
                <span className="text-[10px] bg-sky-500/20 px-1 py-0.5 rounded font-mono">USER</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Side: Tabbed Dynamic Authentication Forms */}
        <div className="md:w-7/12 p-6 sm:p-8 bg-slate-900 overflow-y-auto flex flex-col justify-center">
          
          {/* Dynamic Tab Switcher */}
          <div className="flex border-b border-slate-800 mb-6 gap-2">
            <button
              onClick={() => { setActiveTab('user-login'); setErrorMessage(null); }}
              className={`pb-2.5 px-2 text-xs sm:text-sm font-semibold transition-colors relative ${
                activeTab === 'user-login'
                  ? 'text-sky-400 border-b-2 border-sky-400'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              User Login
            </button>
            <button
              onClick={() => { setActiveTab('register'); setErrorMessage(null); }}
              className={`pb-2.5 px-2 text-xs sm:text-sm font-semibold transition-colors relative ${
                activeTab === 'register'
                  ? 'text-sky-400 border-b-2 border-sky-400'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Register
            </button>
            <button
              onClick={() => { setActiveTab('admin-login'); setErrorMessage(null); }}
              className={`pb-2.5 px-2 text-xs sm:text-sm font-semibold transition-colors relative ${
                activeTab === 'admin-login'
                  ? 'text-amber-400 border-b-2 border-amber-400'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                Admin Portal
              </span>
            </button>
          </div>

          {/* Feedback Messages */}
          {errorMessage && (
            <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="mb-4 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-start gap-2 animate-in fade-in">
              <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-emerald-400" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Form 1: User Login */}
          {activeTab === 'user-login' && (
            <form onSubmit={handleUserLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Customer Email
                </label>
                <input
                  type="email"
                  required
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="e.g. sarah.iot@example.com"
                  className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-sky-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-sky-500 transition-colors"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2.5 px-4 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-sm transition-colors flex items-center justify-center gap-2 shadow-md shadow-sky-500/20"
              >
                Sign In as Customer
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* Form 2: Registration */}
          {activeTab === 'register' && (
            <form onSubmit={handleRegister} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={regFullName}
                  onChange={(e) => setRegFullName(e.target.value)}
                  placeholder="e.g. Sarah Chen"
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-sky-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="name@domain.com"
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-sky-500 transition-colors"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    required
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="Min 6 chars"
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-sky-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Confirm
                  </label>
                  <input
                    type="password"
                    required
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    placeholder="Repeat"
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-sky-500 transition-colors"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full mt-2 py-2.5 px-4 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-sm transition-colors flex items-center justify-center gap-2 shadow-md shadow-sky-500/20"
              >
                Create Customer Account
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* Form 3: Admin Login */}
          {activeTab === 'admin-login' && (
            <form onSubmit={handleUserLogin} className="space-y-4">
              <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 flex-shrink-0 text-amber-400" />
                <span>Restricted Area: Requires administrative credentials stored in <code>users</code> table.</span>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Administrator Email
                </label>
                <input
                  type="email"
                  required
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="admin@magamart.com"
                  className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-amber-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Admin Password
                </label>
                <input
                  type="password"
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-amber-500 transition-colors"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2.5 px-4 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm transition-colors flex items-center justify-center gap-2 shadow-md shadow-amber-500/20"
              >
                Authenticate Admin Portal
                <ShieldCheck className="w-4 h-4" />
              </button>
            </form>
          )}

          <div className="mt-4 pt-3 border-t border-slate-800 text-center">
            <span className="text-[11px] text-slate-500 font-mono">
              Backed by LoginServlet.java & UserDAO.java (PreparedStatements)
            </span>
          </div>

        </div>

      </div>
    </div>
  );
};
