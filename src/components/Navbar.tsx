import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { LayoutDashboard, BarChart3, Settings, LogOut, GraduationCap, Trophy, Sun, Moon, BookOpen, Menu, X, Home, Info, MessageSquare, UserPlus, LogIn } from 'lucide-react';
import { getProfileAvatarUrl } from '../utils/avatar';

const Navbar: React.FC = () => {
  const { profile, isAdmin, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setMobileOpen(false);
    navigate('/');
  };

  const closeMobile = () => setMobileOpen(false);

  const isActive = (path: string) => location.pathname === path;

  const linkCls = (path: string) =>
    `flex items-center gap-1.5 transition-colors ${
      isActive(path)
        ? 'text-indigo-600 dark:text-indigo-400 font-bold'
        : 'text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400'
    }`;

  return (
    <nav className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50 transition-colors duration-300">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2" onClick={closeMobile}>
            <GraduationCap className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600 dark:from-indigo-400 dark:to-violet-400">
              Scorelytics
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-5">
            {/* Theme toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </button>

            {profile ? (
              /* ── Authenticated links ── */
              <>
                <Link to="/home" className={linkCls('/home')}>
                  <Home className="w-4 h-4" />
                  <span>Home</span>
                </Link>
                <Link to="/dashboard" className={linkCls('/dashboard')}>
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Dashboard</span>
                </Link>
                <Link to="/resources" className={linkCls('/resources')}>
                  <BookOpen className="w-4 h-4" />
                  <span>Resources</span>
                </Link>
                <Link to="/results" className={linkCls('/results')}>
                  <BarChart3 className="w-4 h-4" />
                  <span>Analytics</span>
                </Link>
                {!isAdmin && (
                  <Link to="/leaderboard" className={linkCls('/leaderboard')}>
                    <Trophy className="w-4 h-4 text-amber-500" />
                    <span>Leaderboard</span>
                  </Link>
                )}
                {isAdmin && (
                  <Link to="/admin" className={linkCls('/admin')}>
                    <Settings className="w-4 h-4" />
                    <span>Admin</span>
                  </Link>
                )}
                <Link to="/profile" className="flex items-center gap-2 group">
                  <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 group-hover:border-indigo-300 dark:group-hover:border-indigo-500 transition-all">
                    <img src={getProfileAvatarUrl(profile)} alt="Profile avatar" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                  <span className="hidden lg:inline text-sm font-bold text-slate-700 dark:text-slate-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {profile?.name?.split(' ')[0]}
                  </span>
                </Link>
                <button onClick={handleLogout} className="text-slate-600 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 flex items-center gap-1 transition-colors">
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              /* ── Public links ── */
              <>
                <Link to="/" className={linkCls('/')}>
                  <Home className="w-4 h-4" /><span>Home</span>
                </Link>
                <Link to="/about" className={linkCls('/about')}>
                  <Info className="w-4 h-4" /><span>About</span>
                </Link>
                <Link to="/contact" className={linkCls('/contact')}>
                  <MessageSquare className="w-4 h-4" /><span>Contact</span>
                </Link>
                <Link
                  to="/login"
                  className="px-5 py-2 border-2 border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 rounded-xl font-bold text-sm hover:border-indigo-400 dark:hover:border-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 transition-all"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-5 py-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white rounded-xl font-bold text-sm shadow-md shadow-indigo-500/20 hover:shadow-indigo-500/30 transition-all"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile toggle */}
          <div className="flex items-center gap-3 md:hidden">
            <button type="button" onClick={toggleTheme} className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 transition-all" aria-label="Toggle theme">
              {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </button>
            <button type="button" onClick={() => setMobileOpen(!mobileOpen)} className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 transition-all" aria-label="Toggle menu">
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-slate-200 dark:border-slate-800 py-4 space-y-2">
            {profile ? (
              <>
                <Link to="/home" onClick={closeMobile} className={`block px-3 py-2 rounded-lg ${linkCls('/home')}`}><Home className="w-4 h-4" /> Home</Link>
                <Link to="/dashboard" onClick={closeMobile} className={`block px-3 py-2 rounded-lg ${linkCls('/dashboard')}`}><LayoutDashboard className="w-4 h-4" /> Dashboard</Link>
                <Link to="/resources" onClick={closeMobile} className={`block px-3 py-2 rounded-lg ${linkCls('/resources')}`}><BookOpen className="w-4 h-4" /> Resources</Link>
                <Link to="/results" onClick={closeMobile} className={`block px-3 py-2 rounded-lg ${linkCls('/results')}`}><BarChart3 className="w-4 h-4" /> Analytics</Link>
                {!isAdmin && <Link to="/leaderboard" onClick={closeMobile} className={`block px-3 py-2 rounded-lg ${linkCls('/leaderboard')}`}><Trophy className="w-4 h-4" /> Leaderboard</Link>}
                {isAdmin && <Link to="/admin" onClick={closeMobile} className={`block px-3 py-2 rounded-lg ${linkCls('/admin')}`}><Settings className="w-4 h-4" /> Admin</Link>}
                <Link to="/profile" onClick={closeMobile} className={`block px-3 py-2 rounded-lg ${linkCls('/profile')}`}><GraduationCap className="w-4 h-4" /> Profile</Link>
                <button onClick={handleLogout} className="w-full text-left px-3 py-2 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 flex items-center gap-1.5 transition-colors"><LogOut className="w-4 h-4" /> Logout</button>
              </>
            ) : (
              <>
                <Link to="/" onClick={closeMobile} className={`block px-3 py-2 rounded-lg ${linkCls('/')}`}><Home className="w-4 h-4" /> Home</Link>
                <Link to="/about" onClick={closeMobile} className={`block px-3 py-2 rounded-lg ${linkCls('/about')}`}><Info className="w-4 h-4" /> About</Link>
                <Link to="/contact" onClick={closeMobile} className={`block px-3 py-2 rounded-lg ${linkCls('/contact')}`}><MessageSquare className="w-4 h-4" /> Contact</Link>
                <div className="pt-2 space-y-2">
                  <Link to="/login" onClick={closeMobile} className="block w-full text-center px-5 py-2.5 border-2 border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 rounded-xl font-bold text-sm transition-all"><LogIn className="w-4 h-4 inline mr-1.5" />Sign In</Link>
                  <Link to="/register" onClick={closeMobile} className="block w-full text-center px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl font-bold text-sm shadow-md transition-all"><UserPlus className="w-4 h-4 inline mr-1.5" />Sign Up</Link>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
