
import React, { useState, useRef, useEffect } from 'react';
import { UserRole, User, AppNotification } from '../types';
import { APP_NAME, MOCK_NOTIFICATIONS } from '../constants';

interface LayoutProps {
  children: React.ReactNode;
  user: User | null;
  onLogout: () => void;
  onNavigate: (view: string) => void;
  currentView: string;
}

export const Layout: React.FC<LayoutProps> = ({ children, user, onLogout, onNavigate, currentView }) => {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>(MOCK_NOTIFICATIONS);
  const notificationRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navItems = [
    { label: 'Dashboard', icon: 'fa-grid-2', view: 'landing', roles: [UserRole.GUEST, null] },
    { label: 'Platform Controls', icon: 'fa-shield-halved', view: 'super-admin', roles: [UserRole.SUPER_ADMIN] },
    { label: 'Business Hub', icon: 'fa-hotel', view: 'owner-dash', roles: [UserRole.BUSINESS_OWNER] },
    { label: 'Ops Desk', icon: 'fa-clipboard-list', view: 'staff-dash', roles: [UserRole.ADMIN_STAFF] },
    { label: 'My Bookings', icon: 'fa-calendar-days', view: 'guest-dash', roles: [UserRole.GUEST] },
    { label: 'Marketplace', icon: 'fa-compass', view: 'explore', roles: [UserRole.GUEST, null] },
  ];

  const filteredNav = navItems.filter(item => 
    !item.roles.length || (user ? item.roles.includes(user.role) : item.roles.includes(null))
  );

  const markAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, isRead: true })));
  };

  const removeNotification = (id: string) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  const getNotificationIcon = (type: AppNotification['type']) => {
    switch (type) {
      case 'booking': return 'fa-calendar-check text-indigo-500 bg-indigo-50';
      case 'payment': return 'fa-receipt text-emerald-500 bg-emerald-50';
      case 'system': return 'fa-shield-halved text-amber-500 bg-amber-50';
      default: return 'fa-envelope text-slate-500 bg-slate-50';
    }
  };

  return (
    <div className="flex h-screen bg-[#f8fafc] overflow-hidden">
      {/* Sidebar */}
      {user && (
        <aside className={`${isSidebarOpen ? 'w-72' : 'w-24'} bg-white border-r border-slate-200/60 transition-all duration-500 ease-in-out flex flex-col z-50`}>
          <div className="h-20 flex items-center px-8 border-b border-slate-100/80 shrink-0">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200 rotate-3 transition-transform hover:rotate-0">
                <i className="fas fa-layer-group text-lg"></i>
              </div>
              {isSidebarOpen && (
                <span className="font-extrabold text-2xl tracking-tighter text-slate-900">
                  {APP_NAME}<span className="text-indigo-600">.</span>
                </span>
              )}
            </div>
          </div>

          <nav className="flex-1 overflow-y-auto py-8 px-4 space-y-1.5 scrollbar-hide">
            {filteredNav.map((item) => (
              <button
                key={item.view}
                onClick={() => onNavigate(item.view)}
                className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  currentView === item.view 
                    ? 'sidebar-item-active text-indigo-600' 
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <div className={`${currentView === item.view ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'}`}>
                   <i className={`fas ${item.icon} text-lg w-6`}></i>
                </div>
                {isSidebarOpen && <span>{item.label}</span>}
              </button>
            ))}
          </nav>

          <div className="p-6 m-4 bg-slate-50/50 rounded-2xl border border-slate-100">
            <div className="flex items-center gap-4 mb-4">
              <div className="relative">
                <img src={user.avatar} className="w-11 h-11 rounded-xl object-cover ring-2 ring-white shadow-md" />
                <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full shadow-sm"></div>
              </div>
              {isSidebarOpen && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-900 truncate">{user.name}</p>
                  <p className="text-[10px] uppercase tracking-widest font-bold text-indigo-600/70">{user.role.replace('_', ' ')}</p>
                </div>
              )}
            </div>
            <button 
              onClick={onLogout}
              className="w-full flex items-center justify-center gap-2 py-2.5 text-xs font-bold text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
            >
              <i className="fas fa-arrow-right-from-bracket"></i>
              {isSidebarOpen && <span>Sign Out</span>}
            </button>
          </div>
        </aside>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-20 bg-white/70 backdrop-blur-md border-b border-slate-200/50 flex items-center justify-between px-10 sticky top-0 z-40">
          <div className="flex items-center gap-6">
            {!user && (
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-md">
                   <i className="fas fa-layer-group"></i>
                </div>
                <span className="font-extrabold text-2xl tracking-tighter text-slate-900">{APP_NAME}.</span>
              </div>
            )}
            {user && (
              <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="w-10 h-10 flex items-center justify-center bg-slate-50 text-slate-400 hover:text-indigo-600 rounded-xl transition-all border border-slate-100">
                <i className={`fas ${isSidebarOpen ? 'fa-bars-staggered' : 'fa-bars'} text-lg`}></i>
              </button>
            )}
            <div className="hidden lg:flex items-center bg-slate-100/50 rounded-xl px-4 py-2 border border-slate-200/50 w-96 focus-within:ring-2 ring-indigo-100 transition-all">
              <i className="fas fa-magnifying-glass text-slate-400 mr-3"></i>
              <input 
                type="text" 
                placeholder="Find properties, bookings, or analytics..." 
                className="bg-transparent border-none focus:outline-none text-sm w-full text-slate-700"
              />
            </div>
          </div>

          <div className="flex items-center gap-5">
            {!user ? (
              <div className="flex items-center gap-3">
                <button onClick={() => onNavigate('login')} className="px-5 py-2.5 text-sm font-bold text-slate-600 hover:text-indigo-600 transition-all">Log In</button>
                <button onClick={() => onNavigate('register')} className="bg-slate-900 text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-indigo-600 shadow-xl shadow-slate-200 transition-all">Get Started</button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <div className="relative" ref={notificationRef}>
                  <button 
                    onClick={() => setShowNotifications(!showNotifications)}
                    className={`relative w-11 h-11 flex items-center justify-center bg-slate-50 text-slate-500 hover:text-indigo-600 rounded-xl transition-all border border-slate-200/50 ${showNotifications ? 'bg-indigo-50 text-indigo-600 ring-2 ring-indigo-100' : ''}`}
                  >
                    <i className="fas fa-bell"></i>
                    {unreadCount > 0 && (
                      <span className="absolute top-2.5 right-2.5 w-4 h-4 bg-rose-600 text-white text-[10px] font-black flex items-center justify-center rounded-full border-2 border-white shadow-sm animate-pulse">
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Notification Dropdown */}
                  {showNotifications && (
                    <div className="absolute right-0 mt-4 w-[420px] bg-white rounded-[32px] shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-200 origin-top-right z-[100]">
                      <div className="p-6 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                         <div>
                            <h4 className="font-black text-slate-900 uppercase tracking-tighter text-lg">Central Alerts</h4>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{unreadCount} New Protocol Updates</p>
                         </div>
                         <button 
                           onClick={markAllRead}
                           className="text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:underline"
                         >
                            Mark All Read
                         </button>
                      </div>
                      <div className="max-h-[480px] overflow-y-auto scrollbar-hide">
                         {notifications.length > 0 ? (
                           notifications.map(notif => (
                             <div key={notif.id} className={`p-6 border-b border-slate-50 flex gap-4 hover:bg-slate-50/50 transition-colors relative group ${!notif.isRead ? 'bg-indigo-50/20' : ''}`}>
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${getNotificationIcon(notif.type)}`}>
                                   <i className={`fas ${getNotificationIcon(notif.type).split(' ')[0]}`}></i>
                                </div>
                                <div className="flex-1 min-w-0">
                                   <div className="flex items-center justify-between mb-1">
                                      <h5 className="font-black text-slate-900 text-sm truncate">{notif.title}</h5>
                                      <span className="text-[10px] font-bold text-slate-300 whitespace-nowrap">{notif.createdAt}</span>
                                   </div>
                                   <p className="text-xs text-slate-500 font-medium leading-relaxed">{notif.message}</p>
                                </div>
                                <button 
                                  onClick={(e) => { e.stopPropagation(); removeNotification(notif.id); }}
                                  className="absolute right-4 bottom-4 opacity-0 group-hover:opacity-100 w-8 h-8 flex items-center justify-center bg-white rounded-lg text-slate-300 hover:text-rose-500 shadow-sm border border-slate-100 transition-all"
                                >
                                   <i className="fas fa-trash-can text-xs"></i>
                                </button>
                                {!notif.isRead && (
                                  <div className="absolute left-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-indigo-600 rounded-full shadow-sm"></div>
                                )}
                             </div>
                           ))
                         ) : (
                           <div className="py-20 text-center space-y-4">
                              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-200">
                                 <i className="fas fa-bell-slash text-2xl"></i>
                              </div>
                              <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">No notifications to relay.</p>
                           </div>
                         )}
                      </div>
                      <div className="p-4 bg-slate-50 text-center border-t border-slate-100">
                         <button className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] hover:text-indigo-600 transition-colors">
                            View All Ecosystem Activity
                         </button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center -space-x-2 mr-4 hidden md:flex">
                  {[1, 2, 3].map(i => (
                    <img key={i} src={`https://i.pravatar.cc/150?u=${i+10}`} className="w-8 h-8 rounded-full border-2 border-white" />
                  ))}
                  <div className="w-8 h-8 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-[10px] font-bold text-slate-500">+12</div>
                </div>
                
                <button className="w-11 h-11 flex items-center justify-center bg-slate-50 text-slate-500 hover:text-indigo-600 rounded-xl transition-all border border-slate-200/50">
                  <i className="fas fa-gear"></i>
                </button>
              </div>
            )}
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          <div className="max-w-[1600px] mx-auto p-6 md:p-10 animate-fade-up">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
