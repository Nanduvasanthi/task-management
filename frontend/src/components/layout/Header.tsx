"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { FaUser, FaSignOutAlt, FaBars, FaTimes, FaHome, FaTasks } from "react-icons/fa";
import authService from "../../services/authService";

const Header: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      const auth = authService.isAuthenticated();
      setIsAuthenticated(auth);
      if (auth) {
        setUser(authService.getCurrentUser());
      }
    };

    checkAuth();
    window.addEventListener("storage", checkAuth);
    window.addEventListener("authStateChange", checkAuth); 
    return () => {
       window.removeEventListener("storage", checkAuth);
       window.removeEventListener("authStateChange", checkAuth);
    };
    
  }, []);

  const handleLogout = () => {
    authService.logout();
    setIsAuthenticated(false);
    setUser(null);
    setIsUserDropdownOpen(false);
    window.dispatchEvent(new Event('authStateChange'));
    router.push("/login");
    router.refresh();
  };

  const NavLink = ({ href, children, icon }: { href: string; children: React.ReactNode; icon?: React.ReactNode }) => {
    const isActive = pathname === href;
    return (
      <Link
        href={href}
        className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
          isActive
            ? "bg-blue-100 text-blue-700"
            : "text-gray-700 hover:text-blue-600 hover:bg-gray-50"
        }`}
      >
        {icon && <span className="mr-2">{icon}</span>}
        {children}
      </Link>
    );
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <nav className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <span className="text-xl font-bold text-gray-900 hidden sm:inline">Task Management</span>
            </Link>
          </div>

          {/* Desktop Navigation - DIFFERENT FOR LOGGED IN/OUT */}
          <div className="hidden md:flex items-center space-x-1">
            {/* Always show Home */}
            <NavLink href="/" icon={<FaHome className="w-4 h-4" />}>
              Home
            </NavLink>
            
            {isAuthenticated ? (
              // LOGGED IN: Show Dashboard + User Profile Dropdown
              <>
                <NavLink href="/dashboard" icon={<FaTasks className="w-4 h-4" />}>
                  Dashboard
                </NavLink>
                
                {/* User Profile Dropdown */}
                <div className="relative ml-2">
                  <button
                    onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                    className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-r from-blue-100 to-indigo-100 hover:from-blue-200 hover:to-indigo-200 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    aria-label="User menu"
                  >
                    {user?.name ? (
                      <span className="font-semibold text-blue-700">
                        {user.name.charAt(0).toUpperCase()}
                      </span>
                    ) : (
                      <FaUser className="w-5 h-5 text-blue-600" />
                    )}
                  </button>

                  {isUserDropdownOpen && (
                    <>
                      {/* Overlay to close dropdown when clicking outside */}
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setIsUserDropdownOpen(false)}
                      ></div>
                      
                      {/* Dropdown Menu */}
                      <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg py-2 z-20 border border-gray-200 animate-fadeIn">
                        {/* User Info */}
                        <div className="px-4 py-3 border-b border-gray-100">
                          <p className="text-sm font-semibold text-gray-900 truncate">{user?.name}</p>
                          <p className="text-xs text-gray-500 truncate mt-1">{user?.email}</p>
                        </div>
                        
                        {/* Menu Items */}
                        <div className="py-1">
                          <Link
                            href="/profile"
                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                            onClick={() => setIsUserDropdownOpen(false)}
                          >
                            <FaUser className="w-4 h-4 mr-3 text-gray-400" />
                            Profile
                          </Link>
                          
                          <button
                            onClick={handleLogout}
                            className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-50"
                          >
                            <FaSignOutAlt className="w-4 h-4 mr-3" />
                            Logout
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </>
            ) : (
              // NOT LOGGED IN: Show Login/Register
              <>
                <NavLink href="/login">
                  Login
                </NavLink>
                <Link
                  href="/register"
                  className="ml-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-sm font-medium rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all shadow-sm"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-md text-gray-700 hover:text-blue-600 hover:bg-gray-100 focus:outline-none"
              aria-label="Menu"
            >
              {isMenuOpen ? (
                <FaTimes className="w-5 h-5" />
              ) : (
                <FaBars className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4 animate-slideDown">
            <div className="space-y-1">
              <Link
                href="/"
                className={`flex items-center px-3 py-3 rounded-md text-base font-medium ${
                  pathname === "/"
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                <FaHome className="w-5 h-5 mr-3" />
                Home
              </Link>
              
              {isAuthenticated ? (
                <>
                  <Link
                    href="/dashboard"
                    className={`flex items-center px-3 py-3 rounded-md text-base font-medium ${
                      pathname === "/dashboard"
                        ? "bg-blue-100 text-blue-700"
                        : "text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <FaTasks className="w-5 h-5 mr-3" />
                    Dashboard
                  </Link>

                  <Link
                    href="/profile"
                    className={`flex items-center px-3 py-3 rounded-md text-base font-medium ${
                      pathname === "/profile"
                        ? "bg-blue-100 text-blue-700"
                        : "text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <FaUser className="w-5 h-5 mr-3" />
                    Profile
                  </Link>
                  
                  {/* User Info in Mobile */}
                  <div className="px-3 py-3 border-t border-gray-100">
                    <p className="text-sm font-semibold text-gray-900">{user?.name}</p>
                    <p className="text-xs text-gray-500 mt-1">{user?.email}</p>
                  </div>
                  
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full px-3 py-3 rounded-md text-base font-medium text-red-600 hover:bg-gray-50"
                  >
                    <FaSignOutAlt className="w-5 h-5 mr-3" />
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className={`flex items-center px-3 py-3 rounded-md text-base font-medium ${
                      pathname === "/login"
                        ? "bg-blue-100 text-blue-700"
                        : "text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    className="block mx-3 mt-2 px-4 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-base font-medium rounded-lg hover:from-blue-600 hover:to-indigo-700 text-center"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </nav>
      
      {/* Add some CSS for animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }
      `}</style>
    </header>
  );
};

export default Header;