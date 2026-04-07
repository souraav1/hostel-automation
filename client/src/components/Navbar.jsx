import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Menu, 
  X, 
  LogOut, 
  User, 
  Bell,
  Home,
  Building,
  Users,
  Settings
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Button from './Button';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const getNavigationItems = () => {
    if (!user) return [];

    const baseItems = [
      { name: 'Dashboard', href: '/dashboard', icon: Home }
    ];

    switch (user.role) {
      case 'student':
        return [
          ...baseItems,
          { name: 'Book Room', href: '/student/rooms', icon: Building },
          { name: 'Complaints', href: '/student/complaints', icon: Bell },
          { name: 'Leave/Outing Applications', href: '/student/leaves', icon: User }
        ];
      case 'warden':
        return [
          ...baseItems,
          { name: 'Complaints', href: '/warden/complaints', icon: Bell },
          { name: 'Leave Requests', href: '/warden/leaves', icon: User },
          { name: 'Students', href: '/warden/students', icon: Users },
          { name: 'Announcements', href: '/warden/announcements', icon: Settings }
        ];
      case 'superuser':
        return [
          ...baseItems,
          { name: 'Students', href: '/superuser/students', icon: Users },
          { name: 'Hostels', href: '/superuser/hostels', icon: Building },
          { name: 'Users', href: '/superuser/users', icon: User },
          { name: 'System', href: '/superuser/system', icon: Settings }
        ];
      default:
        return baseItems;
    }
  };

  const navigationItems = getNavigationItems();

  const isActiveRoute = (href) => {
    return location.pathname === href || location.pathname.startsWith(href + '/');
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and main navigation */}
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="text-xl font-bold text-primary-600">
                HostelAS
              </Link>
            </div>
            
            {/* Desktop navigation */}
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-200 ${
                      isActiveRoute(item.href)
                        ? 'border-primary-500 text-gray-900'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    }`}
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* User menu */}
          <div className="flex items-center space-x-4">
            {user && (
              <div className="hidden sm:flex sm:items-center sm:space-x-4">
                <span className="text-sm text-gray-700">
                  Welcome, <span className="font-medium">{user.username}</span>
                </span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                  {user.role}
                </span>
              </div>
            )}
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="hidden sm:inline-flex items-center"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="sm:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="sm:hidden">
          <div className="pt-2 pb-3 space-y-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium transition-colors duration-200 ${
                    isActiveRoute(item.href)
                      ? 'bg-primary-50 border-primary-500 text-primary-700'
                      : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <div className="flex items-center">
                    <Icon className="h-5 w-5 mr-3" />
                    {item.name}
                  </div>
                </Link>
              );
            })}
          </div>
          
          {user && (
            <div className="pt-4 pb-3 border-t border-gray-200">
              <div className="flex items-center px-4">
                <div className="flex-shrink-0">
                  <User className="h-8 w-8 text-gray-400" />
                </div>
                <div className="ml-3">
                  <div className="text-base font-medium text-gray-800">
                    {user.username}
                  </div>
                  <div className="text-sm text-gray-500">{user.role}</div>
                </div>
              </div>
              <div className="mt-3 space-y-1">
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                >
                  <LogOut className="h-4 w-4 mr-3 inline" />
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
