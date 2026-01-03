
import React, { useState, useEffect, useMemo } from 'react';
import { 
  MOCK_BUSINESSES, MOCK_BOOKINGS, MOCK_UNITS, MOCK_TRANSACTIONS, 
  MOCK_USERS, MOCK_REVIEWS, MOCK_PROMOTIONS, MOCK_AUDIT_LOGS 
} from '../constants';
import { getBusinessInsights } from '../services/geminiService';
import { 
  BookingStatus, UserRole, Unit, Business, User, 
  Booking, VerificationStatus, Transaction, Promotion, 
  AuditLog, Review, SubscriptionPlan 
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

export const OwnerDashboard: React.FC = () => {
  const [activeModule, setActiveModule] = useState<ModuleType>('overview');
  const [insights, setInsights] = useState<string>('Analyzing market data for your properties...');
  const [activeChart, setActiveChart] = useState<'revenue' | 'occupancy'>('revenue');
  
  // Scoped Data State (simulating tenant isolation)
  const businessId = MOCK_BUSINESSES[0].id; 
  const [business, setBusiness] = useState<Business>(MOCK_BUSINESSES[0]);
  const [units, setUnits] = useState<Unit[]>(MOCK_UNITS.filter(u => u.businessId === businessId));
  const [bookings, setBookings] = useState<Booking[]>(MOCK_BOOKINGS.filter(b => b.businessId === businessId));
  const [team, setTeam] = useState<User[]>(MOCK_USERS.filter(u => u.businessId === businessId));
  const [transactions, setTransactions] = useState<Transaction[]>(MOCK_TRANSACTIONS.filter(t => t.businessId === businessId));
  const [promotions, setPromotions] = useState<Promotion[]>(MOCK_PROMOTIONS.filter(p => p.businessId === businessId));
  const [reviews, setReviews] = useState<Review[]>(MOCK_REVIEWS.filter(r => r.businessId === businessId));
  const [auditLogs] = useState<AuditLog[]>(MOCK_AUDIT_LOGS.filter(l => l.actorId === business.ownerId));

  // Edit/Modal States
  const [isSaving, setIsSaving] = useState(false);
  const [showUnitModal, setShowUnitModal] = useState(false);
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null);
  const [showPromoModal, setShowPromoModal] = useState(false);
  const [showTeamModal, setShowTeamModal] = useState(false);
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

  const navItems = [
    { id: 'overview', label: 'Dashboard', icon: 'fa-chess-king' },
    { id: 'bookings', label: 'Reservations', icon: 'fa-calendar-check' },
    { id: 'inventory', label: 'Asset Matrix', icon: 'fa-door-open' },
    { id: 'finance', label: 'Treasury', icon: 'fa-receipt' },
    { id: 'team', label: 'Operations Team', icon: 'fa-users-gear' },
    { id: 'marketing', label: 'Growth & Ads', icon: 'fa-rocket' },
    { id: 'profile', label: 'Brand Identity', icon: 'fa-id-card' },
    { id: 'reviews', label: 'Guest Feedback', icon: 'fa-comment-dots' },
    { id: 'audit', label: 'Security Logs', icon: 'fa-shield-halved' },
    { id: 'subscription', label: 'Plan & Billing', icon: 'fa-gem' },
  ];

  // Modules
  const renderOverview = () => (
    <div className="space-y-10 animate-fade-up">
      {/* Dynamic Summary Cards */}
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
          <div className="flex gap-2">
             <button className="px-6 py-3 bg-slate-950 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all">Export Report</button>
          </div>
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
                   <th className="px-10 py-6 text-right">Action</th>
                </tr>
             </thead>
             <tbody className="divide-y divide-slate-50">
                {bookings.map(bk => (
                  <tr key={bk.id} className="hover:bg-slate-50/50 transition-all group">
                     <td className="px-10 py-8">
                        <div className="flex items-center gap-4">
                           <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black text-xs">#{bk.id.slice(-2)}</div>
                           <div>
                              <p className="font-black text-slate-900 leading-none mb-1 uppercase text-sm">{bk.id}</p>
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">ID: {bk.guestId}</p>
                           </div>
                        </div>
                     </td>
                     <td className="px-10 py-8 font-black text-slate-800 text-sm">{units.find(u => u.id === bk.unitId)?.name || 'Unknown'}</td>
                     <td className="px-10 py-8 text-xs font-bold text-slate-500">{bk.checkIn} → {bk.checkOut}</td>
                     <td className="px-10 py-8 font-black text-slate-900">Rp {bk.totalPrice.toLocaleString()}</td>
                     <td className="px-10 py-8">
                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                          bk.status === BookingStatus.CONFIRMED ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                          bk.status === BookingStatus.PENDING ? 'bg-amber-50 text-amber-600 border-amber-100' :
                          bk.status === BookingStatus.CHECKED_IN ? 'bg-indigo-50 text-indigo-600 border-indigo-100' :
                          'bg-slate-100 text-slate-400 border-slate-200'
                        }`}>{bk.status}</span>
                     </td>
                     <td className="px-10 py-8 text-right">
                        <button onClick={() => setSelectedBooking(bk)} className="w-10 h-10 bg-white border border-slate-200 text-slate-400 rounded-xl flex items-center justify-center hover:text-indigo-600 hover:border-indigo-600 transition-all shadow-sm">
                           <i className="fas fa-ellipsis-h"></i>
                        </button>
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
          <button onClick={() => { setEditingUnit(null); setShowUnitModal(true); }} className="bg-slate-950 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-600 shadow-xl transition-all">Architect New Asset</button>
       </div>
       <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {units.map(unit => (
            <div key={unit.id} className="bg-white rounded-[40px] overflow-hidden border border-slate-100 hover:shadow-2xl transition-all group flex flex-col">
               <div className="h-64 relative overflow-hidden">
                  <img src={unit.images[0]} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  <div className="absolute top-6 left-6">
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border backdrop-blur-md ${unit.available ? 'bg-emerald-50/80 text-emerald-700 border-emerald-100' : 'bg-rose-50/80 text-rose-700 border-rose-100'}`}>
                        {unit.available ? 'In Circulation' : 'Maintenance'}
                    </span>
                  </div>
                  <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                     <button className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-slate-900 hover:bg-indigo-600 hover:text-white transition-all shadow-xl"><i className="fas fa-edit"></i></button>
                     <button className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-rose-600 hover:bg-rose-600 hover:text-white transition-all shadow-xl"><i className="fas fa-trash"></i></button>
                  </div>
               </div>
               <div className="p-8 space-y-6 flex-1 flex flex-col">
                  <div>
                    <h4 className="text-2xl font-black text-slate-900 leading-tight mb-1">{unit.name}</h4>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{unit.type} • Up to {unit.capacity} Pax</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                     {unit.amenities.map(a => <span key={a} className="px-3 py-1 bg-slate-50 text-slate-500 rounded-lg text-[10px] font-bold uppercase tracking-wider">{a}</span>)}
                  </div>
                  <div className="pt-6 border-t border-slate-50 mt-auto flex items-center justify-between">
                     <div className="flex flex-col">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Base Rate</span>
                        <span className="text-xl font-black text-slate-900">Rp {unit.price.toLocaleString()}</span>
                     </div>
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
             <button className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all">Synchronize Branding</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
             <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Business Entity Name</label>
                <input type="text" defaultValue={business.name} className="w-full bg-slate-50 border border-slate-200 rounded-3xl px-6 py-4 font-bold text-slate-900 focus:outline-none focus:ring-4 ring-indigo-50" />
             </div>
             <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Primary Contact Node</label>
                <input type="text" defaultValue={business.contactPhone} className="w-full bg-slate-50 border border-slate-200 rounded-3xl px-6 py-4 font-bold text-slate-900 focus:outline-none focus:ring-4 ring-indigo-50" />
             </div>
             <div className="md:col-span-2 space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Global Narrative / Description</label>
                <textarea rows={4} defaultValue={business.description} className="w-full bg-slate-50 border border-slate-200 rounded-3xl px-6 py-4 font-bold text-slate-900 focus:outline-none focus:ring-4 ring-indigo-50 resize-none" />
             </div>
          </div>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="bg-slate-950 p-10 rounded-[48px] text-white flex flex-col items-center text-center space-y-6">
             <div className="w-24 h-24 bg-white/10 rounded-3xl flex items-center justify-center text-indigo-400 border border-white/20 relative group overflow-hidden">
                <i className="fas fa-camera text-3xl"></i>
             </div>
             <h4 className="font-black text-xl">Entity Mark</h4>
             <p className="text-indigo-200/60 text-xs font-medium">Standard 512x512px Mark.</p>
             <button className="px-8 py-3 bg-white text-slate-950 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all">Replace Mark</button>
          </div>
          <div className="bg-white p-10 rounded-[48px] border border-slate-100 flex flex-col items-center text-center space-y-6">
             <div className="w-full h-24 bg-slate-100 rounded-3xl flex items-center justify-center text-slate-300 border border-slate-200 overflow-hidden">
                <img src={business.images[0]} className="w-full h-full object-cover" />
             </div>
             <h4 className="font-black text-xl text-slate-900">Marketplace Hero</h4>
             <p className="text-slate-400 text-xs font-medium">Secondary cover asset.</p>
             <button className="px-8 py-3 bg-slate-50 text-indigo-600 border border-indigo-100 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-50 transition-all">Update Hero</button>
          </div>
       </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-[#f8fafc] overflow-hidden">
      {/* Local Sidebar (Scoped for Business Owner) */}
      <aside className="w-80 bg-white border-r border-slate-200/60 transition-all duration-500 flex flex-col z-50 shadow-sm shrink-0">
        <div className="h-24 flex items-center px-8 border-b border-slate-50">
          <div className="flex items-center gap-4">
             <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl rotate-3">
                <i className="fas fa-hotel"></i>
             </div>
             <div className="flex flex-col">
                <span className="font-black text-lg tracking-tight text-slate-900">Partner Node</span>
                <span className="text-[9px] font-black text-indigo-600 uppercase tracking-widest bg-indigo-50 px-2 py-0.5 rounded-md self-start">Premium Hub</span>
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
        <div className="p-8 border-t border-slate-50">
           <div className="bg-slate-50 p-4 rounded-2xl flex items-center gap-4">
              <img src={business.ownerId === 'u2' ? MOCK_USERS[1].avatar : ''} className="w-10 h-10 rounded-xl object-cover ring-2 ring-white shadow-sm" />
              <div>
                 <p className="text-[10px] font-black text-slate-900 uppercase">John Doe</p>
                 <p className="text-[8px] font-bold text-slate-400 uppercase">Principal Owner</p>
              </div>
           </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-[#f8fafc] scrollbar-hide">
         <header className="h-24 bg-white/70 backdrop-blur-md border-b border-slate-200/50 flex items-center justify-between px-10 sticky top-0 z-40">
            <div>
               <h1 className="text-2xl font-black text-slate-900 tracking-tight">{business.name}</h1>
               <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Global Status: Active</span>
               </div>
            </div>
            <div className="flex items-center gap-4">
               <div className="hidden lg:flex items-center bg-slate-100 px-5 py-2.5 rounded-2xl border border-slate-200">
                  <i className="fas fa-search text-slate-400 mr-3"></i>
                  <input type="text" placeholder="Scan node data..." className="bg-transparent border-none focus:outline-none text-xs font-black w-48 text-slate-700" />
               </div>
               <button className="w-12 h-12 bg-white border border-slate-200 rounded-2xl flex items-center justify-center text-slate-400 hover:text-indigo-600 transition-all shadow-sm">
                  <i className="fas fa-bell"></i>
               </button>
            </div>
         </header>

         <div className="p-12 max-w-[1600px] mx-auto">
            {activeModule === 'overview' && renderOverview()}
            {activeModule === 'bookings' && renderBookings()}
            {activeModule === 'inventory' && renderInventory()}
            {activeModule === 'profile' && renderProfile()}

            {/* Other modules would be implemented similarly with specialized UIs */}
            {['finance', 'team', 'marketing', 'reviews', 'audit', 'subscription'].includes(activeModule) && (
              <div className="py-40 text-center animate-fade-up">
                 <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-8 text-slate-300">
                    <i className={`fas ${navItems.find(n => n.id === activeModule)?.icon} text-4xl`}></i>
                 </div>
                 <h3 className="text-3xl font-black text-slate-900 mb-4 uppercase tracking-tighter">{activeModule} Core Node</h3>
                 <p className="text-slate-500 font-medium max-w-md mx-auto">Detailed interface for {activeModule} management is being synchronized with the SEULANGA platform standards.</p>
              </div>
            )}
         </div>
      </main>

      {/* Detail Modals (Global Layer) */}
      {selectedBooking && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300">
           <div className="bg-white w-full max-w-xl rounded-[40px] shadow-2xl p-10 space-y-8">
              <div className="flex justify-between items-center">
                 <h3 className="text-3xl font-black text-slate-900">Reservation Intelligence</h3>
                 <button onClick={() => setSelectedBooking(null)} className="text-slate-400 hover:text-indigo-600 transition-all"><i className="fas fa-times text-xl"></i></button>
              </div>
              <div className="p-8 bg-slate-50 rounded-[32px] space-y-6">
                 <div>
                    <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-1">Stay Identity</p>
                    <h4 className="text-2xl font-black text-slate-900 uppercase">{selectedBooking.id}</h4>
                 </div>
                 <div className="grid grid-cols-2 gap-6 py-6 border-y border-slate-200">
                    <div>
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Check-in</p>
                       <p className="font-bold text-slate-700">{selectedBooking.checkIn}</p>
                    </div>
                    <div>
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Check-out</p>
                       <p className="font-bold text-slate-700">{selectedBooking.checkOut}</p>
                    </div>
                 </div>
                 {selectedBooking.notes && (
                    <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100 italic text-indigo-700 text-xs">"{selectedBooking.notes}"</div>
                 )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                 {selectedBooking.status === BookingStatus.PENDING ? (
                   <>
                     <button onClick={() => handleUpdateBookingStatus(selectedBooking.id, BookingStatus.CONFIRMED)} className="py-4 bg-emerald-600 text-white rounded-2xl font-black uppercase text-xs shadow-xl">Confirm Reservation</button>
                     <button onClick={() => handleUpdateBookingStatus(selectedBooking.id, BookingStatus.CANCELLED)} className="py-4 bg-rose-500 text-white rounded-2xl font-black uppercase text-xs shadow-xl">Decline</button>
                   </>
                 ) : selectedBooking.status === BookingStatus.CONFIRMED ? (
                   <button onClick={() => handleUpdateBookingStatus(selectedBooking.id, BookingStatus.CHECKED_IN)} className="col-span-2 py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase text-xs shadow-xl">Register Check-in</button>
                 ) : (
                   <button className="col-span-2 py-4 bg-slate-100 text-slate-400 rounded-2xl font-black uppercase text-xs cursor-not-allowed">Stay in Progress</button>
                 )}
              </div>
           </div>
        </div>
      )}
    </div>
  );
};
