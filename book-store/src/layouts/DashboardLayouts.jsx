import React, { useState, useContext } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../AuthContext';
import { 
  HiUserCircle, 
  HiShoppingBag, 
  HiHeart, 
  HiCog, 
  HiLogout,
  HiHome,
  HiMenu,
  HiX
} from 'react-icons/hi';

const DashboardLayout = () => {
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const menuItems = [
    { path: '/dashboard', icon: HiHome, label: 'Overview' },
    { path: '/dashboard/profile', icon: HiUserCircle, label: 'Profile' },
    { path: '/dashboard/orders', icon: HiShoppingBag, label: 'Orders' },
    { path: '/dashboard/wishlist', icon: HiHeart, label: 'Wishlist' },
    { path: '/dashboard/settings', icon: HiCog, label: 'Settings' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex">
      {/* Sidebar - Fixed width on desktop, overlay on mobile */}
      <div className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:fixed md:inset-y-0 md:left-0 md:z-30 md:w-64 md:shadow-lg
      `}>
        {/* Sidebar Header */}
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center">
              <span className="text-white text-xl font-bold"><img src="/estarr.jpeg" alt="Estarr BookArt Logo" className="w-full h-full object-contain" /></span>
            </div>
            <div>
              <h2 className="font-bold text-gray-900">Estarr BookArt</h2>
              <p className="text-sm text-gray-500">User Dashboard</p>
            </div>
          </div>
        </div>

        {/* User Info */}
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-full bg-gradient-to-r from-blue-100 to-blue-50 border-4 border-white flex items-center justify-center">
              <HiUserCircle className="w-8 h-8 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">{user?.name || user?.username || 'User'}</h3>
            </div>
          </div>
          <div className="mt-4 bg-blue-50 rounded-lg p-3">
            <div className="text-sm text-blue-700 font-medium">Member Since: {user?.createdAt && new Date(user.createdAt).toLocaleDateString()}</div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4">
          <ul className="space-y-2">
            {menuItems.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  end={item.path === '/dashboard'}
                  className={({ isActive }) => `
                    flex items-center gap-3 px-4 py-3 rounded-xl transition-colors
                    ${isActive 
                      ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg' 
                      : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
                    }
                  `}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* Logout */}
        <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-slate-200 bg-white">
          <button
            onClick={() => {
              logout();
              navigate('/login');
            }}
            className="flex items-center gap-3 w-full px-4 py-3 text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors font-medium"
          >
            <HiLogout className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Mobile Sidebar Toggle */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-lg bg-white/60 shadow-lg"
        >
          {sidebarOpen ? (
            <HiX className="w-6 h-6 text-gray-700" />
          ) : (
            <HiMenu className="w-6 h-6 text-gray-700" />
          )}
        </button>
      </div>

      {/* Main Content - Should appear next to sidebar on desktop */}
      <div className="flex-1 flex flex-col overflow-hidden md:ml-64">
        {/* Top Bar */}
        <header className="bg-white shadow-sm border-b border-slate-200">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-gray-600">Manage your account and collections</p>
              </div>
              <div className="flex items-center gap-4">
                <button className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <div className="w-2 h-2 bg-red-500 rounded-full absolute top-2 right-2"></div>
                  🔔
                </button>
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-600 to-blue-500 shadow-md"></div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default DashboardLayout;