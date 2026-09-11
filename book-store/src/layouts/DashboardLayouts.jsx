import React, { useState, useContext } from 'react';
import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../AuthContext';
import { 
  HiUserCircle, 
  HiShoppingBag, 
  HiHeart, 
  HiCog, 
  HiLogout,
  HiHome,
  HiMenu,
  HiX,
  HiBookOpen,
  HiBell,
  HiArrowRight
} from 'react-icons/hi';

const DashboardLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useContext(AuthContext);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const menuItems = [
    { path: '/dashboard', icon: HiHome, label: 'Overview' },
    { path: '/dashboard/profile', icon: HiUserCircle, label: 'Profile' },
    { path: '/dashboard/orders', icon: HiShoppingBag, label: 'Orders' },
    { path: '/dashboard/wishlist', icon: HiHeart, label: 'Wishlist' },
    { path: '/dashboard/settings', icon: HiCog, label: 'Settings' },
  ];

  const currentPage = menuItems.find((item) => {
    if (item.path === '/dashboard') return location.pathname === item.path;
    return location.pathname.startsWith(item.path);
  });

  return (
    <div className="dashboard-shell min-h-screen flex bg-[#faf9f7] text-[#28202f]">
      {/* Sidebar - Fixed width on desktop, overlay on mobile */}
      <div className={`
        dashboard-sidebar fixed inset-y-0 left-0 z-40 w-72 bg-[#28202f] text-white transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:fixed md:inset-y-0 md:left-0 md:z-30 md:w-72 shadow-2xl
      `}>
        {/* Sidebar Header */}
        <div className="p-7 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#d7f36a] flex items-center justify-center overflow-hidden">
              <img src="/estarr.jpeg" alt="Estarr BookArt Logo" className="w-full h-full object-contain mix-blend-multiply" />
            </div>
            <div>
              <h2 className="font-serif text-lg font-semibold text-white">Estarr Bookart</h2>
              <p className="text-xs uppercase tracking-[0.18em] text-white/50">Your reading room</p>
            </div>
          </div>
        </div>

        {/* User Info */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center">
              <HiUserCircle className="w-7 h-7 text-[#d7f36a]" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-white truncate">{user?.name || user?.username || 'Reader'}</h3>
              <p className="text-xs text-white/50">Member account</p>
            </div>
          </div>
          <div className="mt-5 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5">
            <div className="text-xs text-white/50 uppercase tracking-wider">Member since</div>
            <div className="mt-1 text-sm text-[#d7f36a] font-medium">{user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Recently'}</div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-5">
          <p className="px-3 mb-3 text-[10px] uppercase tracking-[0.22em] text-white/35">Your account</p>
          <ul className="space-y-1.5">
            {menuItems.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  end={item.path === '/dashboard'}
                  className={({ isActive }) => `
                    flex items-center gap-3 px-4 py-3 rounded-xl transition-colors
                    ${isActive 
                      ? 'bg-[#d7f36a] text-[#28202f] shadow-lg shadow-black/10'
                      : 'text-white/65 hover:bg-white/10 hover:text-white'
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
        <div className="absolute bottom-0 left-0 right-0 p-5 border-t border-white/10 bg-[#28202f]">
          <button
            onClick={() => {
              logout();
              navigate('/login');
            }}
            className="flex items-center gap-3 w-full px-4 py-3 text-white/60 hover:text-white hover:bg-white/10 rounded-xl transition-colors font-medium"
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
          className="p-3 rounded-xl bg-[#28202f] text-white shadow-lg"
        >
          {sidebarOpen ? (
            <HiX className="w-6 h-6 text-gray-700" />
          ) : (
            <HiMenu className="w-6 h-6 text-gray-700" />
          )}
        </button>
      </div>

      {/* Main Content - Should appear next to sidebar on desktop */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden md:ml-72">
        {/* Top Bar */}
        <header className="dashboard-topbar sticky top-0 z-20 bg-[#faf9f7]/90 backdrop-blur-xl border-b border-[#e8e3dc]">
          <div className="px-5 py-4 sm:px-8">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-[#7b7180]">
                  <HiBookOpen className="w-4 h-4 text-[#5b21b6]" />
                  Account space
                </div>
                <h1 className="mt-1 font-serif text-2xl sm:text-3xl font-semibold text-[#28202f]">{currentPage?.label || 'Dashboard'}</h1>
              </div>
              <div className="flex items-center gap-4">
                <button aria-label="Notifications" className="relative p-3 hover:bg-white rounded-xl transition-colors text-[#5b21b6]">
                  <div className="w-2 h-2 bg-[#d97706] rounded-full absolute top-2.5 right-2.5 ring-2 ring-[#faf9f7]"></div>
                  <HiBell className="w-5 h-5" />
                </button>
                <div className="hidden sm:flex items-center gap-3 border-l border-[#e8e3dc] pl-4">
                  <div className="w-10 h-10 rounded-xl bg-[#5b21b6] text-white flex items-center justify-center font-semibold">
                    {(user?.name || 'R').charAt(0).toUpperCase()}
                  </div>
                  <div className="hidden lg:block">
                    <p className="text-sm font-semibold text-[#28202f]">{user?.name || 'Reader'}</p>
                    <p className="text-xs text-[#7b7180]">Personal library</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="dashboard-content flex-1 overflow-auto p-5 sm:p-8">
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