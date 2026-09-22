import React from 'react';
import { Cpu, ShoppingBag, ShieldCheck, Database, Code2, User as UserIcon, LogOut, Terminal } from 'lucide-react';
import { User } from '../types';

interface HeaderProps {
  currentView: 'store' | 'admin' | 'code' | 'database';
  setCurrentView: (view: 'store' | 'admin' | 'code' | 'database') => void;
  currentUser: User | null;
  onOpenAuth: (defaultTab?: 'user-login' | 'register' | 'admin-login') => void;
  onLogout: () => void;
  cartCount: number;
  onOpenCart: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  setCurrentView,
  currentUser,
  onOpenAuth,
  onLogout,
  cartCount,
  onOpenCart,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo & Platform Title */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setCurrentView('store')}>
            <div className="w-10 h-10 rounded-lg bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400 shadow-sm shadow-sky-500/20">
              <Cpu className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg tracking-tight text-white">MagaMart</span>
                <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-800/60">
                  IoT & Sensors
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">Hardware Prototyping & Edge Components</p>
            </div>
          </div>

          {/* Navigation Views */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-950/80 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setCurrentView('store')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                currentView === 'store'
                  ? 'bg-sky-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Cpu className="w-3.5 h-3.5" />
              Storefront
            </button>

            <button
              onClick={() => {
                if (!currentUser?.role || currentUser.role !== 'ADMIN') {
                  onOpenAuth('admin-login');
                } else {
                  setCurrentView('admin');
                }
              }}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                currentView === 'admin'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              Admin Portal
              {currentUser?.role === 'ADMIN' && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              )}
            </button>

            <button
              onClick={() => setCurrentView('code')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                currentView === 'code'
                  ? 'bg-sky-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              Java MVC Architecture
            </button>

            <button
              onClick={() => setCurrentView('database')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                currentView === 'database'
                  ? 'bg-sky-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              magamart_db
            </button>
          </nav>

          {/* Action Tools & User Session */}
          <div className="flex items-center gap-2.5">
            {/* Cart Button */}
            <button
              onClick={onOpenCart}
              className="relative p-2 rounded-lg bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 text-slate-200 transition-colors"
              title="Shopping Cart"
              aria-label="Shopping Cart"
            >
              <ShoppingBag className="w-5 h-5 text-sky-400" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-sky-500 text-slate-950 text-xs font-bold rounded-full flex items-center justify-center shadow-md">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Auth / Profile Pill */}
            {currentUser ? (
              <div className="flex items-center gap-2 bg-slate-800/80 border border-slate-700/60 rounded-lg py-1 px-2.5">
                <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-sky-400">
                  {currentUser.fullName.charAt(0)}
                </div>
                <div className="text-left hidden sm:block">
                  <div className="text-xs font-semibold text-slate-200 leading-tight">
                    {currentUser.fullName}
                  </div>
                  <div className="text-[10px] font-mono text-slate-400">
                    {currentUser.role === 'ADMIN' ? (
                      <span className="text-amber-400 font-semibold">ROLE: ADMIN</span>
                    ) : (
                      'ROLE: CUSTOMER'
                    )}
                  </div>
                </div>
                <button
                  onClick={onLogout}
                  className="ml-1 p-1 hover:text-rose-400 text-slate-400 transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => onOpenAuth('user-login')}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-sky-500 hover:bg-sky-400 text-slate-950 rounded-lg transition-colors shadow-sm"
              >
                <UserIcon className="w-3.5 h-3.5" />
                Sign In
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile view subbar */}
      <div className="md:hidden flex items-center justify-around border-t border-slate-800 py-1.5 px-2 bg-slate-950 text-xs">
        <button
          onClick={() => setCurrentView('store')}
          className={`px-2 py-1 rounded font-medium ${currentView === 'store' ? 'text-sky-400' : 'text-slate-400'}`}
        >
          Store
        </button>
        <button
          onClick={() => {
            if (!currentUser?.role || currentUser.role !== 'ADMIN') {
              onOpenAuth('admin-login');
            } else {
              setCurrentView('admin');
            }
          }}
          className={`px-2 py-1 rounded font-medium ${currentView === 'admin' ? 'text-amber-400' : 'text-slate-400'}`}
        >
          Admin
        </button>
        <button
          onClick={() => setCurrentView('code')}
          className={`px-2 py-1 rounded font-medium ${currentView === 'code' ? 'text-sky-400' : 'text-slate-400'}`}
        >
          Java MVC
        </button>
        <button
          onClick={() => setCurrentView('database')}
          className={`px-2 py-1 rounded font-medium ${currentView === 'database' ? 'text-sky-400' : 'text-slate-400'}`}
        >
          DB
        </button>
      </div>
    </header>
  );
};
