
import React, { useState, useEffect, useMemo } from 'react';
import { 
  MOCK_BUSINESSES, MOCK_BOOKINGS, MOCK_UNITS, MOCK_TRANSACTIONS, 
  MOCK_USERS, MOCK_REVIEWS, MOCK_PROMOTIONS, MOCK_AUDIT_LOGS 
} from '../constants';
import { getBusinessInsights } from '../services/geminiService';
import { 
  BookingStatus, UserRole, Unit, Business, User, 
  Booking, VerificationStatus, Transaction, Promotion, 
  AuditLog, Review, SubscriptionPlan, SystemModule, CategoryModuleConfig 
} from '../types';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, BarChart, Bar, Cell
} from 'recharts';

const revenueData = [
  { name: 'Jul', revenue: 45000000, occupancy: 78 },
  { name: 'Aug', revenue: 52000000, occupancy: 82 },
  { name: 'Sep', revenue: 48000000, occupancy: 75 },
  { name: 'Oct', revenue: 61000000, occupancy: 88 },
  { name: 'Nov', revenue: 55000000, occupancy: 80 },
  { name: 'Dec', revenue: 78000000, occupancy: 95 },
];

type ModuleType = 'overview' | 'inventory' | 'bookings' | 'finance' | 'team' | 'profile' | 'marketing' | 'reviews' | 'audit' | 'subscription';

interface OwnerDashboardProps {
  businessId: string;
  moduleConfigs: CategoryModuleConfig;
}

export const OwnerDashboard: React.FC<OwnerDashboardProps> = ({ businessId, moduleConfigs }) => {
  const [activeModule, setActiveModule] = useState<ModuleType>('overview');
  const [insights, setInsights] = useState<string>('Analyzing market data for your properties...');
  const [activeChart, setActiveChart] = useState<'revenue' | 'occupancy'>('revenue');
  
  const [business] = useState<Business>(MOCK_BUSINESSES.find(b => b.id === businessId) || MOCK_BUSINESSES[0]);
  const [units] = useState<Unit[]>(MOCK_UNITS.filter(u => u.businessId === business.id));
  const [bookings, setBookings] = useState<Booking[]>(MOCK_BOOKINGS.filter(b => b.businessId === business.id));
  const [transactions] = useState<Transaction[]>(MOCK_TRANSACTIONS.filter(t => t.businessId === business.id));
  
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

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

  const handleUpdateBookingStatus = (id: string, status: BookingStatus) => {
    setBookings(bookings.map(b => b.id === id ? { ...b, status } : b));
    setSelectedBooking(null);
  };

  // Dynamic Navigation filtering based on Super Admin mapping
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

  const renderOverview = () => (
    <div className="space-y-10 animate-fade-up">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Revenue (MTD)', value: `Rp ${(revenueData[5].revenue / 1000000).toFixed(1)}M`, trend: '+15.2%', icon: 'fa-sack-dollar', color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Active Bookings', value: bookings.filter(b => b.status === BookingStatus.CONFIRMED).length, trend: '+4 today', icon: 'fa-calendar-check', color: 'text-indigo-600', bg: 'bg-indigo-50' },
          { label: 'Occupancy Rate', value: `${revenueData[5].occupancy}%`, trend: '+3.8%', icon: 'fa-door-open', color: 'text-violet-600', bg: 'bg-violet-50' },
          { label: 'Pending Payouts', value: 'Rp 12.4M', trend: 'Processing', icon: 'fa-vault', color: 'text-amber-600', bg: 'bg-amber-50' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-8 rounded-[36px] border border-slate-50 shadow-sm hover:shadow-xl transition-all group overflow-hidden relative">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${stat.bg} ${stat.color}`}>
              <i className={`fas ${stat.icon} text-2xl`}></i>
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
              <div className="flex items-end justify-between">
                <h3 className="text-3xl font-black text-slate-900 tracking-tight">{stat.value}</h3>
                <span className="text-[10px] font-black text-slate-300">{stat.trend}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 bg-white p-10 rounded-[48px] border border-slate-50 shadow-sm">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h3 className="font-black text-2xl text-slate-900 tracking-tight">Growth Telemetry</h3>
              <p className="text-slate-400 text-sm font-medium">Platform-synced performance metrics</p>
            </div>
            <div className="flex bg-slate-100 p-1.5 rounded-2xl gap-1">
              {['Revenue', 'Occupancy'].map(t => (
                <button 
                  key={t}
                  onClick={() => setActiveChart(t.toLowerCase() as any)}
                  className={`px-8 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeChart === t.toLowerCase() ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="6 6" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 800}} dy={15} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 800}} />
                <Tooltip contentStyle={{borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.15)', padding: '20px'}} />
                <Area type="monotone" dataKey={activeChart} stroke="#4f46e5" strokeWidth={5} fillOpacity={1} fill="url(#chartFill)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="space-y-8">
          <div className="ai-gradient text-white p-10 rounded-[48px] shadow-2xl relative overflow-hidden flex flex-col min-h-[400px]">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
            <div className="relative z-10 flex flex-col h-full">
              <div className="flex items-center gap-5 mb-8">
                <div className="w-14 h-14 bg-white/20 backdrop-blur-xl rounded-2xl flex items-center justify-center border border-white/30 shadow-inner">
                  <i className="fas fa-wand-magic-sparkles text-white text-xl"></i>
                </div>
                <div>
                  <h3 className="font-black text-2xl tracking-tighter">Gemini Strategy</h3>
                  <p className="text-indigo-200/80 text-[10px] font-bold uppercase tracking-widest">Business Advisor</p>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto scrollbar-hide mb-6">
                <p className="text-sm leading-relaxed text-indigo-50 font-medium italic">
                  "{insights}"
                </p>
              </div>
              <button onClick={fetchInsights} className="w-full py-4 bg-white text-indigo-600 rounded-2xl font-black text-sm shadow-xl hover:scale-[1.02] transition-transform">
                Regenerate Guidance
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderBookings = () => (
    <div className="bg-white rounded-[48px] border border-slate-100 shadow-sm overflow-hidden animate-fade-up">
       <div className="p-10 border-b border-slate-50 flex items-center justify-between">
          <h3 className="text-3xl font-black text-slate-900 tracking-tight">Lifecycle Ledger</h3>
       </div>
       <div className="overflow-x-auto">
          <table className="w-full text-left">
             <thead>
                <tr className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                   <th className="px-10 py-6">ID / Guest</th>
                   <th className="px-10 py-6">Unit</th>
                   <th className="px-10 py-6">Stay Period</th>
                   <th className="px-10 py-6">Financials</th>
                   <th className="px-10 py-6">Status</th>
                </tr>
             </thead>
             <tbody className="divide-y divide-slate-50">
                {bookings.map(bk => (
                  <tr key={bk.id} className="hover:bg-slate-50/50 transition-all group">
                     <td className="px-10 py-8 text-sm font-black text-slate-900">{bk.id}</td>
                     <td className="px-10 py-8 font-black text-slate-800 text-sm">{units.find(u => u.id === bk.unitId)?.name || 'Unknown'}</td>
                     <td className="px-10 py-8 text-xs font-bold text-slate-500">{bk.checkIn} → {bk.checkOut}</td>
                     <td className="px-10 py-8 font-black text-slate-900">Rp {bk.totalPrice.toLocaleString()}</td>
                     <td className="px-10 py-8">
                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                          bk.status === BookingStatus.CONFIRMED ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-100 text-slate-400 border-slate-200'
                        }`}>{bk.status}</span>
                     </td>
                  </tr>
                ))}
             </tbody>
          </table>
       </div>
    </div>
  );

  const renderInventory = () => (
    <div className="space-y-8 animate-fade-up">
       <div className="flex items-center justify-between">
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Asset Management Node</h2>
          <button className="bg-slate-950 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-600 shadow-xl transition-all">Architect New Asset</button>
       </div>
       <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {units.map(unit => (
            <div key={unit.id} className="bg-white rounded-[40px] overflow-hidden border border-slate-100 hover:shadow-2xl transition-all group flex flex-col">
               <div className="h-64 relative overflow-hidden">
                  <img src={unit.images[0]} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
               </div>
               <div className="p-8 space-y-6 flex-1 flex flex-col">
                  <div>
                    <h4 className="text-2xl font-black text-slate-900 leading-tight mb-1">{unit.name}</h4>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{unit.type} • Up to {unit.capacity} Pax</p>
                  </div>
                  <div className="pt-6 border-t border-slate-50 mt-auto flex items-center justify-between">
                     <span className="text-xl font-black text-slate-900">Rp {unit.price.toLocaleString()}</span>
                     <button className="px-6 py-3 bg-slate-100 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all">Configure</button>
                  </div>
               </div>
            </div>
          ))}
       </div>
    </div>
  );

  const renderProfile = () => (
    <div className="max-w-4xl mx-auto space-y-12 animate-fade-up">
       <div className="bg-white p-12 rounded-[48px] border border-slate-100 shadow-sm space-y-12">
          <div className="flex items-center justify-between">
             <h3 className="text-4xl font-black text-slate-900 tracking-tighter">Identity Config</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
             <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Business Entity Name</label>
                <input type="text" defaultValue={business.name} className="w-full bg-slate-50 border border-slate-200 rounded-3xl px-6 py-4 font-bold text-slate-900 focus:outline-none focus:ring-4 ring-indigo-50" />
             </div>
             <div className="md:col-span-2 space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Global Narrative</label>
                <textarea rows={4} defaultValue={business.description} className="w-full bg-slate-50 border border-slate-200 rounded-3xl px-6 py-4 font-bold text-slate-900 focus:outline-none focus:ring-4 ring-indigo-50 resize-none" />
             </div>
          </div>
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
               <h1 className="text-2xl font-black text-slate-900 tracking-tight">{business.name}</h1>
            </div>
         </header>

         <div className="p-12 max-w-[1600px] mx-auto">
            {activeModule === 'overview' && renderOverview()}
            {activeModule === 'bookings' && renderBookings()}
            {activeModule === 'inventory' && renderInventory()}
            {activeModule === 'profile' && renderProfile()}

            {['finance', 'team', 'marketing', 'reviews', 'audit', 'subscription'].includes(activeModule) && (
              <div className="py-40 text-center animate-fade-up">
                 <h3 className="text-3xl font-black text-slate-900 mb-4 uppercase tracking-tighter">{activeModule} Core Node</h3>
                 <p className="text-slate-500 font-medium max-w-md mx-auto">Interface for {activeModule} management.</p>
              </div>
            )}
         </div>
      </main>

      {selectedBooking && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300">
           <div className="bg-white w-full max-w-xl rounded-[40px] shadow-2xl p-10 space-y-8">
              <div className="flex justify-between items-center">
                 <h3 className="text-3xl font-black text-slate-900">Reservation Intelligence</h3>
                 <button onClick={() => setSelectedBooking(null)} className="text-slate-400 hover:text-indigo-600 transition-all"><i className="fas fa-times text-xl"></i></button>
              </div>
              <button onClick={() => setSelectedBooking(null)} className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black uppercase text-xs shadow-xl">Close</button>
           </div>
        </div>
      )}
    </div>
  );
};
