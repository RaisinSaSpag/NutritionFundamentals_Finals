import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Apple, Calendar, ClipboardList, LogOut, Menu, User, Video, X } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <nav className="bg-emerald-800 text-white shadow-md" aria-label="Main Navigation">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3">
            <Link
              to="/"
              className="flex items-center space-x-2 text-white font-bold text-xl tracking-tight focus:ring-2 focus:ring-white rounded p-1"
            >
              <Apple className="w-6 h-6 text-emerald-300" aria-hidden="true" />
              <span>Tele-Nutrition</span>
            </Link>
            <span className="hidden md:inline-block px-2 py-0.5 text-xs bg-emerald-900 text-emerald-200 rounded font-medium border border-emerald-700">
              Health Informatics MVP
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <>
                {user.role === 'CONSUMER' && (
                  <>
                    <Link
                      to="/dashboard"
                      className="px-3 py-2 rounded-md text-sm font-medium hover:bg-emerald-700 focus:bg-emerald-700"
                    >
                      My Nutrition
                    </Link>
                    <Link
                      to="/meals/log"
                      className="px-3 py-2 rounded-md text-sm font-medium hover:bg-emerald-700 focus:bg-emerald-700"
                    >
                      Log Meal
                    </Link>
                    <Link
                      to="/appointments/book"
                      className="px-3 py-2 rounded-md text-sm font-medium hover:bg-emerald-700 focus:bg-emerald-700"
                    >
                      Book Consult
                    </Link>
                  </>
                )}

                {user.role === 'PROVIDER' && (
                  <>
                    <Link
                      to="/provider"
                      className="px-3 py-2 rounded-md text-sm font-medium hover:bg-emerald-700 focus:bg-emerald-700"
                    >
                      Patient Dashboard
                    </Link>
                  </>
                )}

                <div className="flex items-center space-x-3 pl-4 border-l border-emerald-700">
                  <span className="text-xs text-emerald-200">
                    {user.profile?.firstName} ({user.role})
                  </span>
                  <button
                    onClick={handleLogout}
                    className="inline-flex items-center space-x-1 px-3 py-1.5 text-xs font-semibold bg-emerald-900 hover:bg-emerald-950 border border-emerald-600 rounded-md focus:outline-none focus:ring-2 focus:ring-white"
                    aria-label="Log out of account"
                  >
                    <LogOut className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Logout</span>
                  </button>
                </div>
              </>
            ) : (
              <div className="space-x-3">
                <Link
                  to="/login"
                  className="px-3 py-2 rounded-md text-sm font-medium hover:bg-emerald-700 focus:ring-2 focus:ring-white"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="px-3 py-1.5 rounded-md text-sm font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-900 focus:ring-2 focus:ring-white"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile hamburger */}
          <div className="flex md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-md text-emerald-200 hover:text-white hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-white"
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden px-2 pt-2 pb-3 space-y-1 bg-emerald-900 border-t border-emerald-800">
          {user ? (
            <>
              {user.role === 'CONSUMER' && (
                <>
                  <Link
                    to="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-md text-base font-medium text-white hover:bg-emerald-700"
                  >
                    My Nutrition
                  </Link>
                  <Link
                    to="/meals/log"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-md text-base font-medium text-white hover:bg-emerald-700"
                  >
                    Log Meal
                  </Link>
                  <Link
                    to="/appointments/book"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-md text-base font-medium text-white hover:bg-emerald-700"
                  >
                    Book Consult
                  </Link>
                </>
              )}
              {user.role === 'PROVIDER' && (
                <Link
                  to="/provider"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-md text-base font-medium text-white hover:bg-emerald-700"
                >
                  Patient Dashboard
                </Link>
              )}
              <div className="pt-2 border-t border-emerald-800 flex justify-between items-center px-3">
                <span className="text-xs text-emerald-300">
                  {user.profile?.firstName} ({user.role})
                </span>
                <button
                  onClick={handleLogout}
                  className="px-3 py-1 text-xs bg-emerald-800 hover:bg-emerald-700 rounded text-white"
                >
                  Logout
                </button>
              </div>
            </>
          ) : (
            <div className="space-y-2 pt-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-center px-3 py-2 rounded-md text-base font-medium text-white bg-emerald-800"
              >
                Log In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-center px-3 py-2 rounded-md text-base font-medium text-slate-900 bg-emerald-400"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};
