import { Crown, Home, Send, Award, User, BarChart3, Bell, LogOut, ChevronRight } from 'lucide-react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAppStore } from '@/store/useAppStore';
import { ROLE_LABEL } from '@/lib/constants';
import { UserSwitcher } from './UserSwitcher';
import { NotificationDrawer } from './NotificationDrawer';
import { Bell as BellIcon } from 'lucide-react';
import { useState } from 'react';

export function Layout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, unreadCount, showNotificationDrawer, actions } = useAppStore();
  const [showSwitcher, setShowSwitcher] = useState(false);
  const toggleDrawer = actions.toggleNotificationDrawer;

  const navItems = [
    { path: '/', icon: Home, label: '荣誉墙' },
    { path: '/send-thanks', icon: Send, label: '发送感谢卡' },
    ...(currentUser?.role === 'manager' ? [{ path: '/recognition', icon: Award, label: '正式表彰' }] : []),
    ...(['hr', 'manager'].includes(currentUser?.role || '') ? [{ path: '/hr-analytics', icon: BarChart3, label: 'HR数据中心' }] : []),
  ];

  const handleLogout = () => {
    localStorage.removeItem('currentUserId');
    window.location.reload();
  };

  if (!currentUser) {
    return <div className="min-h-screen flex items-center justify-center"><UserSwitcher /></div>;
  }

  return (
    <div className="min-h-screen flex">
      <aside className="w-64 bg-white border-r border-champagne-100 flex flex-col fixed h-full z-20 shadow-sm">
        <div className="p-6 border-b border-champagne-50">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gold-gradient flex items-center justify-center shadow-gold">
              <Crown className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="heading-serif text-xl text-jade-600">荣耀墙</h1>
              <p className="text-xs text-gray-400 mt-0.5">Honor Wall System</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group
                ${location.pathname === item.path
                  ? 'bg-gold-soft text-champagne-700 font-semibold shadow-sm'
                  : 'text-gray-600 hover:bg-warmGray hover:text-gray-800'
                }`}
            >
              <item.icon className={`w-5 h-5 ${location.pathname === item.path ? 'text-champagne-500' : 'text-gray-400 group-hover:text-champagne-500'}`} />
              <span className="text-sm">{item.label}</span>
              <ChevronRight className={`w-4 h-4 ml-auto opacity-0 group-hover:opacity-50 transition-opacity ${location.pathname === item.path ? 'opacity-70' : ''}`} />
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-champagne-50">
          <div
            className="flex items-center gap-3 p-3 rounded-xl bg-warmGray cursor-pointer hover:bg-champagne-50 transition-all group"
            onClick={() => setShowSwitcher(true)}
          >
            <img src={currentUser.avatar} alt="" className="w-10 h-10 rounded-full border-2 border-white shadow-md" />
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-800 text-sm truncate">{currentUser.name}</p>
              <p className="text-xs text-gray-500 truncate">
                <span className="inline-block px-1.5 py-0.5 rounded bg-champagne-100 text-champagne-600 text-[10px] font-medium mr-1">
                  {ROLE_LABEL[currentUser.role]}
                </span>
                {currentUser.department}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
              title="切换用户"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      <div className="flex-1 ml-64 flex flex-col">
        <header className="h-16 bg-white/80 backdrop-blur-xl border-b border-champagne-100 sticky top-0 z-10 flex items-center justify-between px-8">
          <div>
            <h2 className="heading-serif text-lg text-gray-800">
              {navItems.find(i => i.path === location.pathname)?.label || '荣誉墙'}
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => toggleDrawer(true)}
              className="relative p-2.5 rounded-xl bg-warmGray hover:bg-champagne-50 transition-all group"
            >
              <Bell className="w-5 h-5 text-gray-600 group-hover:text-champagne-600" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center animate-bounce-soft shadow-md">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </button>
            <NavLink to={`/profile/${currentUser.id}`}>
              <button className="flex items-center gap-2 px-3 py-2 rounded-xl bg-warmGray hover:bg-champagne-50 transition-all">
                <User className="w-4 h-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">我的主页</span>
              </button>
            </NavLink>
          </div>
        </header>

        <main className="flex-1 p-8">
          {children}
        </main>
      </div>

      {showSwitcher && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowSwitcher(false)}>
          <div onClick={e => e.stopPropagation()}>
            <UserSwitcher onClose={() => setShowSwitcher(false)} />
          </div>
        </div>
      )}

      <NotificationDrawer />
    </div>
  );
}
