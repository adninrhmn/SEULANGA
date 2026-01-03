
import React, { useState, useRef, useEffect } from 'react';
import { UserRole, User, AppNotification } from '../types';
import { APP_NAME, MOCK_NOTIFICATIONS, TRANSLATIONS } from '../constants';

interface LayoutProps {
  children: React.ReactNode;
  user: User | null;
  onLogout: () => void;
  onNavigate: (view: string, subView?: string) => void;
  currentView: string;
  currentSubView?: string;
  language: 'id' | 'en';
  onLanguageChange: (lang: 'id' | 'en') => void;
}

export const Layout: React.FC<LayoutProps> = ({ 
  children, user, onLogout, onNavigate, currentView, currentSubView, language, onLanguageChange 
}) => {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>(MOCK_NOTIFICATIONS);
  const [scrolled, setScrolled] = useState(false);
  
  const notificationRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const langRef = useRef<HTMLDivElement>(null);

  const t = TRANSLATIONS[language];
  const unreadCount = notifications.filter(n => !n.isRead).length;

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (notificationRef.current && !notificationRef.current.contains(target)) setShowNotifications(false);
      if (profileRef.current && !profileRef.current.contains(target)) setShowProfileMenu(false);
      if (langRef.current && !langRef.current.contains(target)) setShowLangMenu(false);
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const navItems = [
    { label: t.dashboard, icon: 'fa-grid-2', view: 'landing', roles: [UserRole.GUEST, null] },
    { 
      label: t.governance, 
      icon: 'fa-shield-halved', 
      view: 'super-admin', 
      roles: [UserRole.SUPER_ADMIN],
      children: [
        { id: 'overview', label: t.ecosystem, icon: 'fa-brain' },
        { id: 'analytics', label: t.analytics, icon: 'fa-chart-pie' },
        { id: 'tenants', label: t.tenants, icon: 'fa-id-badge' },
        { id: 'finance', label: t.treasury, icon: 'fa-receipt' },
        { id: 'settings', label: t.settings, icon: 'fa-gear' }
      ]
    },
    { label: t.business_hub, icon: 'fa-hotel', view: 'owner-dash', roles: [UserRole.BUSINESS_OWNER] },
    { label: t.ops_desk, icon: 'fa-clipboard-list', view: 'staff-dash', roles: [UserRole.ADMIN_STAFF] },
    { label: t.my_bookings, icon: 'fa-calendar-days', view: 'guest-dash', roles: [UserRole.GUEST] },
    { label: t.marketplace, icon: 'fa-compass', view: 'explore', roles: [UserRole.GUEST, null] },
  ];

  const filteredNav = navItems.filter(item => 
    !item.roles.length || (user ? item.roles.includes(user.role) : item.roles.includes(null))
  );

  return (
    <div className="flex h-screen bg-[#f8fafc] overflow-hidden selection:bg-indigo-100 selection:text-indigo-700">
      {/* Sidebar */}
      {user && (
        <aside 
          className={`sidebar-transition relative z-50 flex flex-col h-screen
          ${isSidebarOpen ? 'w-[320px] px-6' : 'w-[100px] px-4'} 
          bg-white border-r border-slate-200/50 shadow-premium`}
        >
          {/* Logo Section */}
          <div className="h-24 flex items-center justify-center shrink-0">
            <div 
              onClick={() => onNavigate('landing')}
              className="flex items-center gap-4 cursor-pointer group"
            >
              <div className="w-12 h-12 bg-indigo-600 rounded-[18px] flex items-center justify-center text-white shadow-lg shadow-indigo-100 rotate-3 transition-all group-hover:rotate-0 group-hover:scale-110">
                <i className="fas fa-layer-group text-xl"></i>
              </div>
              {isSidebarOpen && (
                <span className="font-black text-2xl tracking-tighter text-slate-900 group-hover:text-indigo-600 transition-colors">
                  {APP_NAME}<span className="text-indigo-600">.</span>
                </span>
              )}
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-6 space-y-2 scrollbar-hide">
            {filteredNav.map((item) => (
              <React.Fragment key={item.view}>
                <button
                  onClick={() => onNavigate(item.view)}
                  className={`w-full flex items-center gap-4 px-5 py-4 rounded-[20px] text-sm font-bold transition-all duration-300 group
                    ${currentView === item.view 
                      ? 'nav-item-active text-indigo-600' 
                      : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                >
                  <div className={`transition-transform duration-300 ${currentView === item.view ? 'scale-110 text-indigo-600' : 'text-slate-400 group-hover:scale-110 group-hover:text-slate-600'}`}>
                    <i className={`fas ${item.icon} text-xl w-6 flex justify-center`}></i>
                  </div>
                  {isSidebarOpen && <span className="tracking-tight">{item.label}</span>}
                </button>
                
                {/* Sub-navigation */}
                {isSidebarOpen && item.children && currentView === item.view && (
                  <div className="mt-2 ml-6 space-y-1.5 border-l border-indigo-100 pl-4 animate-in slide-in-from-left-4 duration-500">
                    {item.children.map(child => (
                      <button
                        key={child.id}
                        onClick={() => onNavigate(item.view, child.id)}
                        className={`w-full text-left px-4 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all
                          ${currentSubView === child.id 
                            ? 'bg-indigo-600 text-white shadow-md' 
                            : 'text-slate-400 hover:bg-slate-100 hover:text-indigo-600'
                          }`}
                      >
                        <div className="flex items-center gap-3">
                          <i className={`fas ${child.icon} w-4 flex justify-center`}></i>
                          {child.label}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </React.Fragment>
            ))}
          </nav>

          {/* Bottom Sidebar */}
          {isSidebarOpen && (
            <div className="p-6 mt-auto border-t border-slate-50">
               <div className="bg-slate-50/80 rounded-[24px] p-5 border border-slate-100">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">System Node</p>
                  <div className="flex items-center gap-3">
                     <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                     <span className="text-[11px] font-bold text-slate-600">Encrypted Connection</span>
                  </div>
               </div>
            </div>
          )}
        </aside>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#f8fafc]">
        {/* Header */}
        <header className={`h-24 sticky top-0 z-40 px-10 flex items-center justify-between transition-all duration-300
          ${scrolled ? 'glass-panel shadow-premium mt-0 rounded-none' : 'bg-transparent'}`}
        >
          <div className="flex items-center gap-8">
            {!user && (
              <div className="flex items-center gap-4 cursor-pointer" onClick={() => onNavigate('landing')}>
                <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-100">
                   <i className="fas fa-layer-group"></i>
                </div>
                <span className="font-black text-2xl tracking-tighter text-slate-900">{APP_NAME}.</span>
              </div>
            )}
            
            {user && (
              <button 
                onClick={() => setSidebarOpen(!isSidebarOpen)} 
                className="w-12 h-12 flex items-center justify-center bg-white text-slate-500 hover:text-indigo-600 rounded-2xl transition-all border border-slate-200/50 shadow-sm group hover:scale-105"
              >
                <i className={`fas ${isSidebarOpen ? 'fa-bars-staggered' : 'fa-bars'} text-lg transition-transform duration-300`}></i>
              </button>
            )}
            
            {/* Elegant Search */}
            <div className="hidden lg:flex items-center bg-white/50 border border-slate-200/50 rounded-2xl px-6 py-3 w-[440px] focus-within:w-[500px] focus-within:bg-white focus-within:ring-4 ring-indigo-50 transition-all duration-500 group shadow-sm">
              <i className="fas fa-magnifying-glass text-slate-400 mr-4 group-focus-within:text-indigo-600 group-focus-within:scale-110 transition-all"></i>
              <input 
                type="text" 
                placeholder={t.search_placeholder} 
                className="bg-transparent border-none focus:outline-none text-sm w-full text-slate-700 font-semibold placeholder:text-slate-400 placeholder:font-medium"
              />
            </div>
          </div>

          <div className="flex items-center gap-5">
            {/* Notification Center */}
            {user && (
              <div className="relative" ref={notificationRef}>
                <button 
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="w-12 h-12 flex items-center justify-center bg-white border border-slate-200/50 rounded-2xl hover:border-indigo-600 hover:scale-105 transition-all shadow-sm relative group"
                >
                  <i className="fas fa-bell text-slate-400 group-hover:text-indigo-600"></i>
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-6 h-6 bg-rose-500 text-white text-[10px] font-black rounded-full flex items-center justify-center border-4 border-white shadow-md animate-bounce">
                      {unreadCount}
                    </span>
                  )}
                </button>
                
                {showNotifications && (
                  <div className="absolute right-0 mt-4 w-[420px] bg-white rounded-[32px] shadow-premium border border-slate-100 overflow-hidden animate-in zoom-in-95 fade-in duration-300 origin-top-right z-50">
                    <div className="p-8 border-b border-slate-50 bg-slate-50/50 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                         <h4 className="font-black text-slate-900 text-base tracking-tight uppercase">Recent Alerts</h4>
                         <span className="bg-indigo-600 text-white text-[9px] px-2 py-0.5 rounded-full font-black">{unreadCount} NEW</span>
                      </div>
                      <button onClick={markAllAsRead} className="text-[10px] font-black text-indigo-600 uppercase hover:underline tracking-widest">Clear All</button>
                    </div>
                    <div className="max-h-[440px] overflow-y-auto scrollbar-hide">
                      {notifications.length > 0 ? (
                        notifications.map(notif => (
                          <div 
                            key={notif.id} 
                            onClick={() => markAsRead(notif.id)}
                            className={`p-6 flex items-start gap-5 hover:bg-slate-50 transition-all cursor-pointer border-b border-slate-50 last:border-none ${!notif.isRead ? 'bg-indigo-50/20' : ''}`}
                          >
                            <div className={`w-12 h-12 rounded-[18px] flex items-center justify-center shrink-0 shadow-sm ${
                              notif.type === 'booking' ? 'bg-emerald-50 text-emerald-600' :
                              notif.type === 'payment' ? 'bg-amber-50 text-amber-600' :
                              notif.type === 'maintenance' ? 'bg-rose-50 text-rose-600' :
                              'bg-indigo-50 text-indigo-600'
                            }`}>
                              <i className={`fas ${
                                notif.type === 'booking' ? 'fa-calendar-check' :
                                notif.type === 'payment' ? 'fa-receipt' :
                                notif.type === 'maintenance' ? 'fa-screwdriver-wrench' :
                                'fa-circle-info'
                              } text-lg`}></i>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className={`text-sm font-black text-slate-900 mb-1 leading-tight truncate ${!notif.isRead ? 'pr-4' : ''}`}>
                                {notif.title}
                                {!notif.isRead && <span className="inline-block w-1.5 h-1.5 bg-indigo-600 rounded-full ml-2 align-middle"></span>}
                              </p>
                              <p className="text-xs text-slate-500 font-medium leading-relaxed mb-2 line-clamp-2">{notif.message}</p>
                              <div className="flex items-center gap-2">
                                 <i className="far fa-clock text-[10px] text-slate-400"></i>
                                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{notif.createdAt}</p>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-16 text-center">
                          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <i className="fas fa-bell-slash text-slate-200 text-3xl"></i>
                          </div>
                          <p className="text-sm font-black text-slate-400 uppercase tracking-widest">No New Notifications</p>
                        </div>
                      )}
                    </div>
                    <div className="p-6 bg-slate-50/80 text-center border-t border-slate-100">
                       <button className="text-[11px] font-black text-indigo-600 uppercase tracking-[0.2em] hover:text-indigo-800 transition-colors">See Master Audit Log</button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Language Selection */}
            <div className="relative" ref={langRef}>
               <button 
                onClick={() => setShowLangMenu(!showLangMenu)}
                className="h-12 flex items-center px-4 bg-white border border-slate-200/50 rounded-2xl hover:border-indigo-600 transition-all shadow-sm gap-3 group"
               >
                 <img src={language === 'id' ? "https://flagcdn.com/w40/id.png" : "https://flagcdn.com/w40/us.png"} className="w-5 h-3.5 object-cover rounded shadow-sm" alt="flag" />
                 <span className="text-[11px] font-black uppercase tracking-widest text-slate-700 group-hover:text-indigo-600">{language}</span>
                 <i className={`fas fa-chevron-down text-[10px] text-slate-300 transition-transform duration-300 ${showLangMenu ? 'rotate-180' : ''}`}></i>
               </button>
               {showLangMenu && (
                  <div className="absolute right-0 mt-4 w-56 bg-white rounded-[24px] shadow-premium border border-slate-100 overflow-hidden animate-in zoom-in-95 fade-in duration-300 origin-top-right z-50 p-2">
                     {[
                       { code: 'id', label: 'Indonesian', flag: 'id' },
                       { code: 'en', label: 'English (US)', flag: 'us' }
                     ].map(l => (
                       <button 
                          key={l.code}
                          onClick={() => { onLanguageChange(l.code as any); setShowLangMenu(false); }}
                          className={`w-full flex items-center gap-4 p-4 rounded-xl text-left transition-all 
                            ${language === l.code ? 'bg-indigo-50 text-indigo-600' : 'hover:bg-slate-50 text-slate-600'}`}
                       >
                          <img src={`https://flagcdn.com/w40/${l.flag}.png`} className="w-6 h-4 rounded shadow-sm" />
                          <span className="text-xs font-black tracking-tight">{l.label}</span>
                          {language === l.code && <i className="fas fa-check ml-auto text-indigo-500"></i>}
                       </button>
                     ))}
                  </div>
               )}
            </div>

            <div className="w-px h-8 bg-slate-200/60 mx-1 hidden sm:block"></div>

            {/* Profile Section */}
            {!user ? (
              <div className="flex items-center gap-4">
                <button onClick={() => onNavigate('login')} className="px-6 py-3 text-sm font-black text-slate-600 hover:text-indigo-600 transition-all uppercase tracking-widest">{t.log_in}</button>
                <button onClick={() => onNavigate('register')} className="bg-slate-950 text-white px-8 py-3.5 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-indigo-600 shadow-xl shadow-slate-200 transition-all active:scale-95">{t.get_started}</button>
              </div>
            ) : (
              <div className="relative" ref={profileRef}>
                <button 
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center gap-4 p-1.5 pl-5 bg-white border border-slate-200/60 rounded-[22px] hover:border-indigo-600 transition-all shadow-sm group active:scale-95"
                >
                   <div className="hidden sm:block text-right">
                      <p className="text-[11px] font-black text-slate-900 uppercase tracking-tight">{user.name.split(' ')[0]}</p>
                      <p className="text-[9px] font-bold text-indigo-500 uppercase tracking-[0.2em]">{user.role.replace('_', ' ')}</p>
                   </div>
                   <div className="relative">
                      <img src={user.avatar} className="w-11 h-11 rounded-[16px] object-cover ring-2 ring-slate-100 shadow-md transition-transform group-hover:scale-105" />
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full"></div>
                   </div>
                </button>

                {showProfileMenu && (
                  <div className="absolute right-0 mt-4 w-80 bg-white rounded-[32px] shadow-premium border border-slate-100 overflow-hidden animate-in zoom-in-95 fade-in duration-300 origin-top-right z-50">
                    <div className="p-8 bg-slate-50/50 border-b border-slate-100 flex flex-col items-center text-center">
                       <img src={user.avatar} className="w-20 h-20 rounded-[28px] object-cover border-4 border-white shadow-xl mb-4" />
                       <p className="font-black text-slate-900 text-lg tracking-tight mb-1">{user.name}</p>
                       <span className="bg-indigo-100 text-indigo-600 text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest">{user.role}</span>
                       <p className="text-xs font-medium text-slate-400 mt-2">{user.email}</p>
                    </div>
                    <div className="p-3">
                       <button 
                         onClick={() => onNavigate('guest-dash', 'profile')}
                         className="w-full flex items-center gap-4 p-4 hover:bg-slate-50 rounded-2xl text-slate-700 text-sm font-bold transition-all group"
                       >
                          <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all"><i className="fas fa-user-gear"></i></div>
                          Profile Settings
                       </button>
                       <button 
                         onClick={onLogout}
                         className="w-full flex items-center gap-4 p-4 hover:bg-rose-50 rounded-2xl text-rose-600 text-sm font-black transition-all group"
                       >
                          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center group-hover:bg-rose-600 group-hover:text-white transition-all"><i className="fas fa-power-off"></i></div>
                          {t.terminate}
                       </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-[#f8fafc] scroll-smooth">
          <div className="max-w-[1650px] mx-auto p-8 md:p-12 animate-fade-up">
            {children}
          </div>
          
          {/* Subtle Footer for App Context */}
          <footer className="max-w-[1650px] mx-auto px-12 py-10 flex flex-col md:flex-row justify-between items-center gap-6 border-t border-slate-100 opacity-50">
             <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-slate-950 rounded-lg flex items-center justify-center text-white text-xs">
                   <i className="fas fa-layer-group"></i>
                </div>
                <span className="font-black text-sm tracking-tighter">{APP_NAME}. <span className="text-[10px] font-bold text-slate-400">OPERATING SYSTEM</span></span>
             </div>
             <div className="flex gap-8 text-[10px] font-black uppercase tracking-widest text-slate-500">
                <a href="#" className="hover:text-indigo-600">Privacy Policy</a>
                <a href="#" className="hover:text-indigo-600">Governance Terms</a>
                <a href="#" className="hover:text-indigo-600">API Documentation</a>
             </div>
             <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-300">© 2024 SEULANGA ENTERPRISE CORE</p>
          </footer>
        </main>
      </div>
    </div>
  );
};
