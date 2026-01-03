
import React, { useState, useRef, useEffect } from 'react';
import { UserRole, User, AppNotification } from '../types';
import { APP_NAME, MOCK_NOTIFICATIONS } from '../constants';

interface LayoutProps {
  children: React.ReactNode;
  user: User | null;
  onLogout: () => void;
  onNavigate: (view: string, subView?: string) => void;
  currentView: string;
  currentSubView?: string;
}

export const Layout: React.FC<LayoutProps> = ({ children, user, onLogout, onNavigate, currentView, currentSubView }) => {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showQuickAction, setShowQuickAction] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>(MOCK_NOTIFICATIONS);
  
  const notificationRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const quickActionRef = useRef<HTMLDivElement>(null);
  const langRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (notificationRef.current && !notificationRef.current.contains(target)) setShowNotifications(false);
      if (profileRef.current && !profileRef.current.contains(target)) setShowProfileMenu(false);
      if (quickActionRef.current && !quickActionRef.current.contains(target)) setShowQuickAction(false);
      if (langRef.current && !langRef.current.contains(target)) setShowLangMenu(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navItems = [
    { label: 'Dashboard', icon: 'fa-grid-2', view: 'landing', roles: [UserRole.GUEST, null] },
    { 
      label: 'Platform Controls', 
      icon: 'fa-shield-halved', 
      view: 'super-admin', 
      roles: [UserRole.SUPER_ADMIN],
      children: [
        { id: 'overview', label: 'Ecosystem Intelligence', icon: 'fa-brain' },
        { id: 'analytics', label: 'Platform Analytics', icon: 'fa-chart-pie' },
        { id: 'monetization', label: 'Subscription Plans', icon: 'fa-sack-dollar' },
        { id: 'tenants', label: 'Tenant Onboarding', icon: 'fa-id-badge' },
        { id: 'reviews', label: 'Review Moderation', icon: 'fa-star-half-stroke' },
        { id: 'finance', label: 'Payouts & Flows', icon: 'fa-receipt' },
        { id: 'logs', label: 'System Audit Logs', icon: 'fa-clock-rotate-left' },
        { id: 'settings', label: 'Platform Settings', icon: 'fa-gear' }
      ]
    },
    { label: 'Business Hub', icon: 'fa-hotel', view: 'owner-dash', roles: [UserRole.BUSINESS_OWNER] },
    { label: 'Ops Desk', icon: 'fa-clipboard-list', view: 'staff-dash', roles: [UserRole.ADMIN_STAFF] },
    { label: 'My Bookings', icon: 'fa-calendar-days', view: 'guest-dash', roles: [UserRole.GUEST] },
    { label: 'Marketplace', icon: 'fa-compass', view: 'explore', roles: [UserRole.GUEST, null] },
  ];

  const filteredNav = navItems.filter(item => 
    !item.roles.length || (user ? item.roles.includes(user.role) : item.roles.includes(null))
  );

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
        <aside className={`${isSidebarOpen ? 'w-72' : 'w-24'} bg-white border-r border-slate-200/60 transition-all duration-500 ease-in-out flex flex-col z-50 shadow-sm`}>
          <div className="h-20 flex items-center px-8 border-b border-slate-100/80 shrink-0">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200 rotate-3 transition-transform hover:rotate-0 cursor-pointer" onClick={() => onNavigate('landing')}>
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
              <React.Fragment key={item.view}>
                <button
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
                
                {/* Sub-menu implementation */}
                {isSidebarOpen && item.children && currentView === item.view && (
                  <div className="ml-6 mt-1 space-y-1 border-l-2 border-slate-100 pl-4 animate-in slide-in-from-left-2 duration-300">
                    {item.children.map(child => (
                      <button
                        key={child.id}
                        onClick={() => onNavigate(item.view, child.id)}
                        className={`w-full text-left px-4 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${
                          currentSubView === child.id 
                            ? 'bg-indigo-50 text-indigo-600' 
                            : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <i className={`fas ${child.icon} w-4`}></i>
                          {child.label}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </React.Fragment>
            ))}
          </nav>

          <div className="p-4 border-t border-slate-100">
             <div className={`flex flex-col gap-2 ${!isSidebarOpen && 'items-center'}`}>
                <button className="flex items-center gap-3 p-3 rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all">
                   <i className="fas fa-circle-question text-lg w-6"></i>
                   {isSidebarOpen && <span className="text-xs font-bold uppercase tracking-widest">Help Center</span>}
                </button>
             </div>
          </div>
        </aside>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-20 bg-white/70 backdrop-blur-md border-b border-slate-200/50 flex items-center justify-between px-10 sticky top-0 z-40">
          <div className="flex items-center gap-6">
            {!user && (
              <div className="flex items-center gap-3 cursor-pointer" onClick={() => onNavigate('landing')}>
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
            
            <div className="hidden lg:flex items-center bg-slate-100/50 rounded-xl px-4 py-2.5 border border-slate-200/50 w-80 xl:w-[450px] focus-within:ring-2 ring-indigo-100 transition-all group">
              <i className="fas fa-magnifying-glass text-slate-400 mr-3 group-focus-within:text-indigo-600 transition-colors"></i>
              <input 
                type="text" 
                placeholder="Search resources, bookings, or data..." 
                className="bg-transparent border-none focus:outline-none text-sm w-full text-slate-700 font-medium"
              />
              <span className="hidden xl:block text-[10px] font-black text-slate-300 bg-white px-2 py-1 rounded-md border border-slate-100 ml-2 uppercase tracking-tighter">⌘K</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Quick Actions (Owner/Staff Only) */}
            {user && (user.role === UserRole.BUSINESS_OWNER || user.role === UserRole.ADMIN_STAFF) && (
              <div className="relative" ref={quickActionRef}>
                <button 
                  onClick={() => setShowQuickAction(!showQuickAction)}
                  className="w-11 h-11 bg-indigo-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all"
                >
                  <i className={`fas ${showQuickAction ? 'fa-times' : 'fa-plus'} transition-transform duration-300`}></i>
                </button>
                {showQuickAction && (
                  <div className="absolute right-0 mt-4 w-64 bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-200 origin-top-right z-50 p-2">
                     <button className="w-full flex items-center gap-4 p-4 hover:bg-slate-50 rounded-2xl transition-all group">
                        <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all"><i className="fas fa-calendar-plus"></i></div>
                        <span className="text-sm font-bold text-slate-700">New Reservation</span>
                     </button>
                     <button className="w-full flex items-center gap-4 p-4 hover:bg-slate-50 rounded-2xl transition-all group">
                        <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-all"><i className="fas fa-door-open"></i></div>
                        <span className="text-sm font-bold text-slate-700">Add Unit / Room</span>
                     </button>
                     <button className="w-full flex items-center gap-4 p-4 hover:bg-slate-50 rounded-2xl transition-all group">
                        <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center group-hover:bg-amber-600 group-hover:text-white transition-all"><i className="fas fa-file-invoice-dollar"></i></div>
                        <span className="text-sm font-bold text-slate-700">Generate Report</span>
                     </button>
                  </div>
                )}
              </div>
            )}

            {/* Language Switcher */}
            <div className="relative" ref={langRef}>
               <button 
                onClick={() => setShowLangMenu(!showLangMenu)}
                className="w-11 h-11 flex items-center justify-center bg-slate-50 text-slate-500 hover:text-indigo-600 rounded-xl transition-all border border-slate-200/50"
               >
                 <span className="text-[10px] font-black uppercase tracking-widest">ID</span>
               </button>
               {showLangMenu && (
                  <div className="absolute right-0 mt-4 w-40 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-200 origin-top-right z-50 p-2">
                     <button className="w-full flex items-center gap-3 p-3 hover:bg-slate-50 rounded-xl text-left transition-all">
                        <span className="w-6 h-4 bg-red-600 rounded-sm"></span>
                        <span className="text-xs font-bold text-slate-700">Indonesia</span>
                     </button>
                     <button className="w-full flex items-center gap-3 p-3 hover:bg-slate-50 rounded-xl text-left transition-all">
                        <span className="w-6 h-4 bg-blue-600 rounded-sm"></span>
                        <span className="text-xs font-bold text-slate-700">English (US)</span>
                     </button>
                  </div>
               )}
            </div>

            {/* Notifications */}
            {user && (
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

                {showNotifications && (
                  <div className="absolute right-0 mt-4 w-[420px] bg-white rounded-[32px] shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-200 origin-top-right z-[100]">
                    <div className="p-6 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                       <div>
                          <h4 className="font-black text-slate-900 uppercase tracking-tighter text-lg">Central Alerts</h4>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{unreadCount} New Protocol Updates</p>
                       </div>
                    </div>
                    <div className="max-h-[400px] overflow-y-auto scrollbar-hide">
                       {notifications.map(notif => (
                         <div key={notif.id} className="p-5 border-b border-slate-50 flex gap-4 hover:bg-slate-50 transition-colors">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${getNotificationIcon(notif.type)}`}>
                               <i className={`fas ${getNotificationIcon(notif.type).split(' ')[0]}`}></i>
                            </div>
                            <div className="min-w-0">
                               <p className="font-bold text-slate-900 text-sm">{notif.title}</p>
                               <p className="text-xs text-slate-500 truncate">{notif.message}</p>
                               <p className="text-[10px] text-slate-300 font-bold mt-1 uppercase tracking-widest">{notif.createdAt}</p>
                            </div>
                         </div>
                       ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {!user ? (
              <div className="flex items-center gap-3 ml-2">
                <button onClick={() => onNavigate('login')} className="px-5 py-2.5 text-sm font-bold text-slate-600 hover:text-indigo-600 transition-all">Log In</button>
                <button onClick={() => onNavigate('register')} className="bg-slate-950 text-white px-6 py-3 rounded-xl text-sm font-bold hover:bg-indigo-600 shadow-xl shadow-slate-200 transition-all">Get Started</button>
              </div>
            ) : (
              <div className="relative ml-2" ref={profileRef}>
                <button 
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center gap-3 p-1 pl-3 bg-white border border-slate-200/60 rounded-2xl hover:border-indigo-600 transition-all shadow-sm"
                >
                   <div className="hidden sm:block text-right">
                      <p className="text-[10px] font-black text-slate-900 uppercase tracking-tight">{user.name.split(' ')[0]}</p>
                      <p className="text-[8px] font-bold text-indigo-500 uppercase tracking-widest">{user.role.split('_')[0]}</p>
                   </div>
                   <img src={user.avatar} className="w-10 h-10 rounded-xl object-cover ring-2 ring-slate-50 shadow-md" />
                </button>

                {showProfileMenu && (
                  <div className="absolute right-0 mt-4 w-64 bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-200 origin-top-right z-50">
                    <div className="p-6 bg-slate-50/50 border-b border-slate-100">
                       <p className="font-black text-slate-900 text-sm truncate">{user.name}</p>
                       <p className="text-xs font-medium text-slate-400">{user.email}</p>
                    </div>
                    <div className="p-2">
                       <button className="w-full flex items-center gap-3 p-4 hover:bg-slate-50 rounded-2xl text-slate-600 text-sm font-bold transition-all">
                          <i className="fas fa-user-circle text-indigo-400"></i> My Profile
                       </button>
                       <button className="w-full flex items-center gap-3 p-4 hover:bg-slate-50 rounded-2xl text-slate-600 text-sm font-bold transition-all">
                          <i className="fas fa-shield-halved text-indigo-400"></i> Account Security
                       </button>
                       <div className="my-2 border-t border-slate-50"></div>
                       <button 
                         onClick={onLogout}
                         className="w-full flex items-center gap-3 p-4 hover:bg-rose-50 rounded-2xl text-rose-600 text-sm font-black transition-all"
                       >
                          <i className="fas fa-power-off"></i> Terminate Session
                       </button>
                    </div>
                  </div>
                )}
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
