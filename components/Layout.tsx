
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
  const [showQuickAction, setShowQuickAction] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>(MOCK_NOTIFICATIONS);
  
  const notificationRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const quickActionRef = useRef<HTMLDivElement>(null);
  const langRef = useRef<HTMLDivElement>(null);

  const t = TRANSLATIONS[language];
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
    <div className="flex h-screen bg-[#f8fafc] overflow-hidden">
      {/* Sidebar */}
      {user && (
        <aside className={`${isSidebarOpen ? 'w-80' : 'w-24'} bg-white border-r border-slate-200/60 transition-all duration-500 ease-in-out flex flex-col z-50 shadow-sm`}>
          <div className="h-24 flex items-center px-8 shrink-0">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-100 rotate-3 transition-transform hover:rotate-0 cursor-pointer" onClick={() => onNavigate('landing')}>
                <i className="fas fa-layer-group text-xl"></i>
              </div>
              {isSidebarOpen && (
                <span className="font-black text-3xl tracking-tighter text-slate-900">
                  {APP_NAME}<span className="text-indigo-600">.</span>
                </span>
              )}
            </div>
          </div>

          <nav className="flex-1 overflow-y-auto py-8 px-6 space-y-1.5 scrollbar-hide">
            {filteredNav.map((item) => (
              <React.Fragment key={item.view}>
                <button
                  onClick={() => onNavigate(item.view)}
                  className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-sm font-bold transition-all duration-200 ${
                    currentView === item.view 
                      ? 'bg-indigo-50 text-indigo-600 shadow-sm' 
                      : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <div className={`${currentView === item.view ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'}`}>
                    <i className={`fas ${item.icon} text-xl w-6`}></i>
                  </div>
                  {isSidebarOpen && <span>{item.label}</span>}
                </button>
                
                {isSidebarOpen && item.children && currentView === item.view && (
                  <div className="mt-3 ml-4 space-y-1.5 border-l-2 border-indigo-100/50 pl-4 animate-in slide-in-from-left-4 duration-500">
                    {item.children.map(child => (
                      <button
                        key={child.id}
                        onClick={() => onNavigate(item.view, child.id)}
                        className={`w-full text-left px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                          currentSubView === child.id 
                            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' 
                            : 'text-slate-400 hover:bg-slate-100/50 hover:text-indigo-600'
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
              <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="w-11 h-11 flex items-center justify-center bg-slate-50 text-slate-500 hover:text-indigo-600 rounded-xl transition-all border border-slate-200/50 shadow-sm">
                <i className={`fas ${isSidebarOpen ? 'fa-bars-staggered' : 'fa-bars'} text-lg`}></i>
              </button>
            )}
            
            <div className="hidden lg:flex items-center bg-slate-100/50 rounded-2xl px-5 py-2.5 border border-slate-200/50 w-80 xl:w-[500px] focus-within:ring-4 ring-indigo-50 transition-all group">
              <i className="fas fa-magnifying-glass text-slate-400 mr-3 group-focus-within:text-indigo-600 transition-colors"></i>
              <input 
                type="text" 
                placeholder={t.search_placeholder} 
                className="bg-transparent border-none focus:outline-none text-sm w-full text-slate-700 font-bold"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Language Switcher */}
            <div className="relative" ref={langRef}>
               <button 
                onClick={() => setShowLangMenu(!showLangMenu)}
                className="w-14 h-12 flex items-center justify-center bg-white border border-slate-200/50 rounded-2xl hover:border-indigo-600 transition-all shadow-sm gap-2"
               >
                 <img src={language === 'id' ? "https://flagcdn.com/w40/id.png" : "https://flagcdn.com/w40/us.png"} className="w-5 h-3.5 object-cover rounded-sm" alt="flag" />
                 <span className="text-[10px] font-black uppercase tracking-widest text-slate-900">{language}</span>
               </button>
               {showLangMenu && (
                  <div className="absolute right-0 mt-4 w-44 bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-200 origin-top-right z-50 p-2">
                     <button 
                        onClick={() => { onLanguageChange('id'); setShowLangMenu(false); }}
                        className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all ${language === 'id' ? 'bg-indigo-50 text-indigo-600' : 'hover:bg-slate-50 text-slate-700'}`}
                     >
                        <img src="https://flagcdn.com/w40/id.png" className="w-5 h-3.5 rounded-sm" />
                        <span className="text-xs font-black">Bahasa Indonesia</span>
                     </button>
                     <button 
                        onClick={() => { onLanguageChange('en'); setShowLangMenu(false); }}
                        className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all ${language === 'en' ? 'bg-indigo-50 text-indigo-600' : 'hover:bg-slate-50 text-slate-700'}`}
                     >
                        <img src="https://flagcdn.com/w40/us.png" className="w-5 h-3.5 rounded-sm" />
                        <span className="text-xs font-black">English (US)</span>
                     </button>
                  </div>
               )}
            </div>

            {!user ? (
              <div className="flex items-center gap-3 ml-2">
                <button onClick={() => onNavigate('login')} className="px-6 py-3 text-sm font-black text-slate-600 hover:text-indigo-600 transition-all uppercase tracking-widest">{t.log_in}</button>
                <button onClick={() => onNavigate('register')} className="bg-slate-950 text-white px-8 py-3.5 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-indigo-600 shadow-xl shadow-slate-200 transition-all">{t.get_started}</button>
              </div>
            ) : (
              <div className="relative ml-2" ref={profileRef}>
                <button 
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center gap-4 p-1.5 pl-4 bg-white border border-slate-200/60 rounded-[20px] hover:border-indigo-600 transition-all shadow-sm"
                >
                   <div className="hidden sm:block text-right">
                      <p className="text-[11px] font-black text-slate-900 uppercase tracking-tight">{user.name.split(' ')[0]}</p>
                      <p className="text-[9px] font-bold text-indigo-500 uppercase tracking-[0.2em]">{user.role.replace('_', ' ')}</p>
                   </div>
                   <img src={user.avatar} className="w-11 h-11 rounded-[14px] object-cover ring-4 ring-slate-50 shadow-md" />
                </button>

                {showProfileMenu && (
                  <div className="absolute right-0 mt-4 w-72 bg-white rounded-[32px] shadow-[0_30px_100px_-15px_rgba(0,0,0,0.2)] border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-200 origin-top-right z-50">
                    <div className="p-8 bg-slate-50/50 border-b border-slate-100">
                       <p className="font-black text-slate-900 text-base leading-none mb-1">{user.name}</p>
                       <p className="text-xs font-bold text-slate-400">{user.email}</p>
                    </div>
                    <div className="p-3">
                       <button 
                         onClick={onLogout}
                         className="w-full flex items-center gap-4 p-4 hover:bg-rose-50 rounded-2xl text-rose-600 text-sm font-black transition-all group"
                       >
                          <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center group-hover:bg-rose-600 group-hover:text-white transition-all"><i className="fas fa-power-off"></i></div>
                          {t.terminate}
                       </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-[#f8fafc]">
          <div className="max-w-[1650px] mx-auto p-6 md:p-12 animate-fade-up">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};