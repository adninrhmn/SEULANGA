import React, { useState, useEffect, useMemo } from 'react';
import { 
  MOCK_BUSINESSES, MOCK_BOOKINGS, MOCK_UNITS, MOCK_TRANSACTIONS, 
  MOCK_USERS, MOCK_REVIEWS, MOCK_PROMOTIONS, MOCK_AUDIT_LOGS, MOCK_NOTIFICATIONS
} from '../constants';
import { getBusinessInsights } from '../services/geminiService';
import { 
  BookingStatus, UserRole, Unit, Business, User, 
  Booking, VerificationStatus, Transaction, Promotion, 
  AuditLog, Review, SubscriptionPlan, SystemModule, CategoryModuleConfig 
} from '../types';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, BarChart, Bar
} from 'recharts';

const revenueData = [
  { name: 'Jul', revenue: 45000000, occupancy: 78, bookings: 42 },
  { name: 'Aug', revenue: 52000000, occupancy: 82, bookings: 48 },
  { name: 'Sep', revenue: 48000000, occupancy: 75, bookings: 39 },
  { name: 'Oct', revenue: 61000000, occupancy: 88, bookings: 55 },
  { name: 'Nov', revenue: 55000000, occupancy: 80, bookings: 50 },
  { name: 'Dec', revenue: 78000000, occupancy: 95, bookings: 72 },
];

type ModuleType = 'overview' | 'inventory' | 'bookings' | 'finance' | 'team' | 'profile' | 'marketing' | 'reviews' | 'audit' | 'subscription';

interface OwnerDashboardProps {
  businessId: string;
  moduleConfigs: CategoryModuleConfig;
  currentUser: User | null;
  onUpdateUser: (data: Partial<User>) => void;
}

export const OwnerDashboard: React.FC<OwnerDashboardProps> = ({ businessId, moduleConfigs, currentUser, onUpdateUser }) => {
  const [activeModule, setActiveModule] = useState<ModuleType>('overview');
  const [insights, setInsights] = useState<string>('Analyzing market data for your properties...');
  
  const [business, setBusiness] = useState<Business>(MOCK_BUSINESSES.find(b => b.id === businessId) || MOCK_BUSINESSES[0]);
  const [units] = useState<Unit[]>(MOCK_UNITS.filter(u => u.businessId === business.id));
  const [bookings] = useState<Booking[]>(MOCK_BOOKINGS.filter(b => b.businessId === business.id));
  
  // Profile Form States
  const [profileName, setProfileName] = useState(currentUser?.name || '');
  const [profilePhone, setProfilePhone] = useState(currentUser?.phoneNumber || '');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchInsights();
  }, [business.category]);

  const fetchInsights = async () => {
    setInsights("Connecting to Gemini AI Engine...");
    const text = await getBusinessInsights({
      revenue: revenueData[revenueData.length-1].revenue,
      occupancy: `${revenueData[revenueData.length-1].occupancy}%`,
      unitCount: units.length,
      category: business.category,
      name: business.name
    });
    setInsights(text || "AI Insights currently unavailable.");
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    await new Promise(r => setTimeout(r, 1000));
    onUpdateUser({ name: profileName, phoneNumber: profilePhone });
    setIsSaving(false);
    alert('Profile updated successfully!');
  };

  const navItems = useMemo(() => {
    const activeModules = moduleConfigs[business.category] || [];
    const items = [
      { id: 'overview', label: 'Dashboard', icon: 'fa-chess-king', module: null },
      { id: 'bookings', label: 'Reservations', icon: 'fa-calendar-check', module: SystemModule.BOOKING },
      { id: 'inventory', label: 'Asset Matrix', icon: 'fa-door-open', module: SystemModule.INVENTORY },
      { id: 'finance', label: 'Treasury', icon: 'fa-receipt', module: SystemModule.PAYMENT },
      { id: 'team', label: 'Operations Team', icon: 'fa-users-gear', module: SystemModule.TEAM },
      { id: 'marketing', label: 'Growth & Ads', icon: 'fa-rocket', module: SystemModule.MARKETING },
      { id: 'profile', label: 'Brand Identity', icon: 'fa-id-card', module: null },
      { id: 'reviews', label: 'Guest Feedback', icon: 'fa-comment-dots', module: SystemModule.REVIEWS },
      { id: 'audit', label: 'Security Logs', icon: 'fa-shield-halved', module: null },
      { id: 'subscription', label: 'Plan & Billing', icon: 'fa-gem', module: null },
    ];
    return items.filter(item => !item.module || activeModules.includes(item.module));
  }, [business.category, moduleConfigs]);

  const renderOverview = () => {
    const bookingsToday = bookings.filter(b => b.createdAt === new Date().toISOString().split('T')[0]).length;
    const bookingsMonth = revenueData[5].bookings;
    const unitLimit = business.subscription === SubscriptionPlan.PREMIUM ? 'Unlimited' : business.subscription === SubscriptionPlan.PRO ? '50' : '10';

    return (
      <div className="space-y-10 animate-fade-up">
        {/* Top Performance Summary Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-8 rounded-[36px] border border-slate-100 shadow-sm group hover:shadow-xl transition-all">
             <div className="flex justify-between items-start mb-6">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                   <i className="fas fa-sack-dollar text-xl"></i>
                </div>
                <span className="text-[10px] font-black text-emerald-500 bg-emerald-50 px-2 py-1 rounded-lg">+12.5%</span>
             </div>
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Pendapatan (Bulan Ini)</p>
             <h3 className="text-2xl font-black text-slate-900 tracking-tight">Rp {(revenueData[5].revenue / 1000000).toFixed(1)}M</h3>
          </div>

          <div className="bg-white p-8 rounded-[36px] border border-slate-100 shadow-sm group hover:shadow-xl transition-all">
             <div className="flex justify-between items-start mb-6">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                   <i className="fas fa-calendar-check text-xl"></i>
                </div>
                <div className="text-right">
                   <p className="text-[10px] font-black text-indigo-600 uppercase">{bookingsToday} Today</p>
                </div>
             </div>
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Ringkasan Booking</p>
             <h3 className="text-2xl font-black text-slate-900 tracking-tight">{bookingsMonth} <span className="text-sm text-slate-400 font-bold">Reservasi</span></h3>
          </div>

          <div className="bg-white p-8 rounded-[36px] border border-slate-100 shadow-sm group hover:shadow-xl transition-all">
             <div className="flex justify-between items-start mb-6">
                <div className="w-12 h-12 rounded-2xl bg-violet-50 text-violet-600 flex items-center justify-center">
                   <i className="fas fa-door-open text-xl"></i>
                </div>
                <span className="text-[10px] font-black text-violet-500 bg-violet-50 px-2 py-1 rounded-lg">High Demand</span>
             </div>
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Tingkat Okupansi</p>
             <h3 className="text-2xl font-black text-slate-900 tracking-tight">{revenueData[5].occupancy}% <span className="text-sm text-slate-400 font-bold">Terisi</span></h3>
          </div>

          <div className="bg-slate-950 p-8 rounded-[36px] shadow-xl text-white relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
             <div className="relative z-10">
                <div className="flex justify-between items-center mb-6">
                   <span className={`text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${business.status === 'active' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'}`}>
                      {business.status === 'active' ? 'Operational' : 'Suspended'}
                   </span>
                   <i className="fas fa-shield-check text-indigo-400"></i>
                </div>
                <p className="text-[10px] font-black text-indigo-300 uppercase tracking-widest mb-1">{business.subscription} Plan</p>
                <h3 className="text-xl font-black mb-4">Quota: {units.length} / {unitLimit} Units</h3>
                <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                   <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${(units.length / (parseInt(unitLimit) || 100)) * 100}%` }}></div>
                </div>
             </div>
          </div>
        </div>

        {/* Chart & Insights Row */}
        <div className="grid lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 bg-white p-10 rounded-[48px] border border-slate-100 shadow-sm space-y-8">
            <div className="flex items-center justify-between">
               <div>
                  <h3 className="text-2xl font-black text-slate-900 tracking-tighter uppercase">Tren Reservasi & Revenue</h3>
                  <p className="text-slate-400 text-sm font-medium">Visualisasi performa operasional 6 bulan terakhir</p>
               </div>
               <div className="flex bg-slate-50 p-1 rounded-xl">
                  <button className="px-4 py-2 bg-white shadow-sm rounded-lg text-[10px] font-black uppercase text-indigo-600">Monthly</button>
                  <button className="px-4 py-2 text-[10px] font-black uppercase text-slate-400 hover:text-slate-600">Weekly</button>
               </div>
            </div>
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 800}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 800}} />
                  <Tooltip 
                     contentStyle={{borderRadius: '24px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '20px'}}
                     itemStyle={{fontWeight: 800, fontSize: '12px'}}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#4f46e5" strokeWidth={4} fillOpacity={1} fill="url(#colorRev)" />
                  <Area type="monotone" dataKey="occupancy" stroke="#10b981" strokeWidth={4} fill="transparent" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="space-y-8">
             {/* Critical Notifications Section */}
             <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                   <h4 className="font-black text-slate-900 uppercase text-xs tracking-widest">Peringatan Sistem</h4>
                   <span className="w-2 h-2 bg-rose-500 rounded-full animate-ping"></span>
                </div>
                <div className="space-y-4">
                   {[
                      { title: 'Pembayaran Tertunda', desc: '3 reservasi menunggu verifikasi manual.', type: 'payment', icon: 'fa-clock' },
                      { title: 'Limit Hampir Tercapai', desc: 'Anda telah menggunakan 90% kuota unit.', type: 'system', icon: 'fa-triangle-exclamation' }
                   ].map((notif, idx) => (
                      <div key={idx} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex gap-4 hover:border-indigo-200 transition-colors cursor-pointer">
                         <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-slate-400 shrink-0">
                            <i className={`fas ${notif.icon} text-xs`}></i>
                         </div>
                         <div>
                            <p className="text-[10px] font-black text-slate-900 uppercase">{notif.title}</p>
                            <p className="text-[10px] text-slate-500 font-medium leading-tight mt-0.5">{notif.desc}</p>
                         </div>
                      </div>
                   ))}
                </div>
             </div>

             {/* Gemini AI Insights */}
             <div className="bg-indigo-600 p-8 rounded-[40px] shadow-xl text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
                <div className="relative z-10">
                   <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
                         <i className="fas fa-wand-magic-sparkles"></i>
                      </div>
                      <h4 className="font-black text-sm uppercase tracking-tighter">AI Strategist</h4>
                   </div>
                   <p className="text-xs leading-relaxed font-medium italic opacity-90 mb-8">
                      "{insights}"
                   </p>
                   <button onClick={fetchInsights} className="w-full py-3 bg-white text-indigo-600 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-50 transition-all">
                      Sync AI Logic
                   </button>
                </div>
             </div>
          </div>
        </div>
      </div>
    );
  };

  const renderProfile = () => (
    <div className="max-w-5xl mx-auto space-y-10 animate-fade-up">
       <div className="bg-white p-12 rounded-[48px] border border-slate-100 shadow-sm overflow-hidden relative">
          <div className="absolute top-0 right-0 w-80 h-80 bg-slate-50 rounded-full blur-3xl -mr-40 -mt-40"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-10 mb-12 pb-12 border-b border-slate-50">
             <div className="relative group">
                <img src={currentUser?.avatar} className="w-32 h-32 rounded-[40px] object-cover ring-8 ring-slate-50 shadow-xl group-hover:scale-105 transition-transform" />
                <button className="absolute -bottom-2 -right-2 w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center shadow-lg border-4 border-white">
                   <i className="fas fa-camera text-xs"></i>
                </button>
             </div>
             <div>
                <h3 className="text-4xl font-black text-slate-900 tracking-tighter mb-2">{currentUser?.name}</h3>
                <div className="flex flex-wrap gap-4">
                   <span className="px-4 py-1.5 bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase rounded-full border border-indigo-100">{currentUser?.role}</span>
                   <span className="px-4 py-1.5 bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase rounded-full border border-emerald-100">ID VERIFIED</span>
                </div>
             </div>
          </div>

          <form onSubmit={handleUpdateProfile} className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-10">
             <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Legal Identity Name</label>
                <div className="relative">
                   <i className="fas fa-user absolute left-6 top-1/2 -translate-y-1/2 text-slate-300"></i>
                   <input 
                      type="text" 
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-3xl px-14 py-4 font-bold text-slate-900 focus:outline-none focus:ring-4 ring-indigo-50 transition-all" 
                   />
                </div>
             </div>
             <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Contact Protocol (Phone)</label>
                <div className="relative">
                   <i className="fas fa-phone absolute left-6 top-1/2 -translate-y-1/2 text-slate-300"></i>
                   <input 
                      type="text" 
                      value={profilePhone}
                      onChange={(e) => setProfilePhone(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-3xl px-14 py-4 font-bold text-slate-900 focus:outline-none focus:ring-4 ring-indigo-50 transition-all" 
                   />
                </div>
             </div>
             <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Business Narrative (Description)</label>
                <textarea 
                   rows={4} 
                   value={business.description}
                   onChange={(e) => setBusiness({...business, description: e.target.value})}
                   className="w-full bg-slate-50 border border-slate-200 rounded-3xl px-8 py-4 font-bold text-slate-900 focus:outline-none focus:ring-4 ring-indigo-50 transition-all resize-none" 
                />
             </div>
             <div className="space-y-6">
                <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Subscription Plan</p>
                   <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                         <div className="w-10 h-10 bg-slate-950 text-white rounded-xl flex items-center justify-center"><i className="fas fa-gem"></i></div>
                         <p className="font-black text-slate-900 uppercase text-xs">{business.subscription}</p>
                      </div>
                      <button className="text-[10px] font-black text-indigo-600 uppercase hover:underline">Manage Plan</button>
                   </div>
                </div>
                <button 
                  disabled={isSaving}
                  className="w-full py-5 bg-slate-950 text-white rounded-3xl font-black text-xs uppercase tracking-widest shadow-xl hover:bg-indigo-600 transition-all disabled:opacity-50"
                >
                   {isSaving ? <i className="fas fa-spinner fa-spin mr-2"></i> : <i className="fas fa-save mr-2"></i>}
                   Sync Profile Node
                </button>
             </div>
          </form>
       </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-[#f8fafc] overflow-hidden">
      <aside className="w-80 bg-white border-r border-slate-200/60 transition-all duration-500 flex flex-col z-50 shadow-sm shrink-0">
        <div className="h-24 flex items-center px-8 border-b border-slate-50">
          <div className="flex items-center gap-4">
             <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl rotate-3">
                <i className="fas fa-hotel"></i>
             </div>
             <div className="flex flex-col">
                <span className="font-black text-lg tracking-tight text-slate-900">Partner Node</span>
                <span className="text-[9px] font-black text-indigo-600 uppercase tracking-widest bg-indigo-50 px-2 py-0.5 rounded-md self-start">{business.category} Hub</span>
             </div>
          </div>
        </div>
        <nav className="flex-1 overflow-y-auto p-6 space-y-1.5 scrollbar-hide">
           {navItems.map(item => (
             <button 
                key={item.id}
                onClick={() => setActiveModule(item.id as ModuleType)}
                className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${
                  activeModule === item.id ? 'bg-indigo-600 text-white shadow-2xl shadow-indigo-100' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                }`}
             >
                <i className={`fas ${item.icon} text-lg w-6`}></i>
                {item.label}
             </button>
           ))}
        </nav>
      </aside>

      <main className="flex-1 overflow-y-auto bg-[#f8fafc] scrollbar-hide">
         <header className="h-24 bg-white/70 backdrop-blur-md border-b border-slate-200/50 flex items-center justify-between px-10 sticky top-0 z-40">
            <div>
               <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase">{activeModule} Matrix</h1>
            </div>
            <div className="flex items-center gap-6">
                <div className="flex flex-col items-end">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Network Status</p>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                        <span className="text-xs font-black text-slate-900 uppercase">Operational</span>
                    </div>
                </div>
            </div>
         </header>

         <div className="p-12 max-w-[1600px] mx-auto">
            {activeModule === 'overview' && renderOverview()}
            {activeModule === 'profile' && renderProfile()}
            {['bookings', 'inventory', 'finance', 'team', 'marketing', 'reviews', 'audit', 'subscription'].includes(activeModule) && activeModule !== 'profile' && (
              <div className="py-40 text-center animate-fade-up">
                 <h3 className="text-3xl font-black text-slate-900 mb-4 uppercase tracking-tighter">{activeModule} Core Node</h3>
                 <p className="text-slate-500 font-medium max-w-md mx-auto">Interface for {activeModule} management.</p>
              </div>
            )}
         </div>
      </main>
    </div>
  );
};