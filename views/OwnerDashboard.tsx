
import React, { useState, useEffect } from 'react';
import { MOCK_BUSINESSES, MOCK_BOOKINGS, MOCK_UNITS, MOCK_TRANSACTIONS, MOCK_USERS } from '../constants';
import { getBusinessInsights } from '../services/geminiService';
import { BookingStatus, UserRole } from '../types';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, BarChart, Bar, Cell, PieChart, Pie 
} from 'recharts';

const revenueData = [
  { name: 'Jul', revenue: 45000000, bookings: 42, occupancy: 78 },
  { name: 'Aug', revenue: 52000000, bookings: 48, occupancy: 82 },
  { name: 'Sep', revenue: 48000000, bookings: 45, occupancy: 75 },
  { name: 'Oct', revenue: 61000000, bookings: 55, occupancy: 88 },
  { name: 'Nov', revenue: 55000000, bookings: 51, occupancy: 80 },
  { name: 'Dec', revenue: 78000000, bookings: 72, occupancy: 95 },
];

const unitStatusData = [
  { name: 'Available', value: 12, color: '#10b981' },
  { name: 'Occupied', value: 8, color: '#4f46e5' },
  { name: 'Maintenance', value: 2, color: '#f59e0b' },
];

export const OwnerDashboard: React.FC = () => {
  const [activeModule, setActiveModule] = useState<'overview' | 'inventory' | 'bookings' | 'finance' | 'team' | 'marketing' | 'settings'>('overview');
  const [insights, setInsights] = useState<string>('Synthesizing market data for your specific business niche...');
  const [activeChart, setActiveChart] = useState<'revenue' | 'occupancy'>('revenue');
  const business = MOCK_BUSINESSES[0];
  const staff = MOCK_USERS.filter(u => u.businessId === business.id);

  useEffect(() => {
    const fetchInsights = async () => {
      const text = await getBusinessInsights({
        revenue: 78000000,
        occupancy: '95%',
        bookings: 72,
        category: business.category,
        period: 'Q4 2024',
        name: business.name
      });
      setInsights(text || "AI Insights temporarily cached. Refresh to sync.");
    };
    fetchInsights();
  }, [business.category]);

  const renderModule = () => {
    switch (activeModule) {
      case 'overview': return renderOverview();
      case 'inventory': return renderInventory();
      case 'bookings': return renderBookings();
      case 'finance': return renderFinance();
      case 'team': return renderTeam();
      case 'settings': return renderSettings();
      default: return renderOverview();
    }
  };

  const renderOverview = () => (
    <div className="space-y-10 animate-fade-up">
      {/* Dynamic Header */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 bg-white p-10 rounded-[40px] border border-slate-100 shadow-sm overflow-hidden relative">
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full blur-3xl -mr-16 -mt-16"></div>
        <div className="relative z-10 flex items-center gap-8">
          <div className="w-24 h-24 rounded-[32px] bg-indigo-600 flex items-center justify-center text-white shadow-2xl shadow-indigo-100 rotate-2 group hover:rotate-0 transition-transform cursor-pointer">
            <i className="fas fa-hotel text-4xl group-hover:scale-110 transition-transform"></i>
          </div>
          <div>
            <div className="flex items-center gap-4 mb-2">
              <h1 className="text-4xl font-black text-slate-900 tracking-tighter">{business.name}</h1>
              <span className="px-4 py-1.5 bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase rounded-full tracking-widest border border-emerald-100 flex items-center gap-2">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                Operational
              </span>
            </div>
            <p className="text-slate-500 font-medium text-lg flex items-center gap-3">
              <i className="fas fa-location-dot text-indigo-500"></i>
              {business.address}
              <span className="mx-2 text-slate-200">|</span>
              <span className="text-indigo-600 font-black uppercase text-sm tracking-[0.2em]">{business.subscription} Tier Access</span>
            </p>
          </div>
        </div>
        <div className="relative z-10 flex flex-wrap gap-4">
          <button className="flex-1 md:flex-none bg-slate-100 hover:bg-slate-200 text-slate-700 px-8 py-4 rounded-2xl font-black text-sm transition-all flex items-center justify-center gap-3">
            <i className="fas fa-file-export"></i> Report
          </button>
          <button onClick={() => setActiveModule('inventory')} className="flex-1 md:flex-none bg-slate-950 text-white px-10 py-4 rounded-2xl font-black text-sm hover:bg-indigo-600 shadow-xl shadow-slate-200 transition-all flex items-center justify-center gap-3">
            <i className="fas fa-plus"></i> Add Unit
          </button>
        </div>
      </div>

      {/* Stats Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Revenue (MTD)', value: 'Rp 78.4M', trend: '+15.2%', icon: 'fa-sack-dollar', color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Confirmed Stays', value: '72', trend: '+12.4%', icon: 'fa-calendar-check', color: 'text-indigo-600', bg: 'bg-indigo-50' },
          { label: 'Avg. Occupancy', value: '95.1%', trend: '+3.8%', icon: 'fa-door-open', color: 'text-violet-600', bg: 'bg-violet-50' },
          { label: 'Trust Score', value: '4.8/5', trend: 'Stable', icon: 'fa-heart', color: 'text-rose-500', bg: 'bg-rose-50' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-8 rounded-[36px] border border-slate-50 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all group overflow-hidden relative">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110 ${stat.bg} ${stat.color}`}>
              <i className={`fas ${stat.icon} text-2xl`}></i>
            </div>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                <h3 className="text-3xl font-black text-slate-900 tracking-tight">{stat.value}</h3>
              </div>
              <div className={`flex items-center gap-1 text-[10px] font-black ${stat.trend.startsWith('+') ? 'text-emerald-600' : 'text-slate-400'}`}>
                <i className={`fas ${stat.trend.startsWith('+') ? 'fa-arrow-up' : 'fa-minus'} text-[8px]`}></i>
                {stat.trend}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-10">
        {/* Main Analytics Engine */}
        <div className="lg:col-span-2 bg-white p-10 rounded-[48px] border border-slate-50 shadow-sm">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h3 className="font-black text-2xl text-slate-900 tracking-tight">Performance Vector</h3>
              <p className="text-slate-400 text-sm font-medium">Comparative historical data for Q3-Q4 2024</p>
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
          <div className="h-[450px]">
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
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 800}} tickFormatter={(val) => activeChart === 'revenue' ? `Rp ${val/1000000}M` : `${val}%`} />
                <Tooltip 
                  contentStyle={{borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.15)', padding: '20px'}}
                  itemStyle={{fontFamily: 'Plus Jakarta Sans', fontWeight: 800, color: '#1e293b'}}
                />
                <Area 
                  type="monotone" 
                  dataKey={activeChart} 
                  stroke="#4f46e5" 
                  strokeWidth={5} 
                  fillOpacity={1} 
                  fill="url(#chartFill)" 
                  animationDuration={1500}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AI Insight Engine & Real-time Log */}
        <div className="space-y-8">
          <div className="ai-gradient text-white p-10 rounded-[48px] shadow-2xl relative overflow-hidden h-[380px] flex flex-col">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
            <div className="relative z-10 flex flex-col h-full">
              <div className="flex items-center gap-5 mb-8">
                <div className="w-14 h-14 bg-white/20 backdrop-blur-xl rounded-2xl flex items-center justify-center border border-white/30 shadow-inner">
                  <i className="fas fa-wand-magic-sparkles text-white text-xl"></i>
                </div>
                <div>
                  <h3 className="font-black text-2xl tracking-tighter">Gemini Insight<span className="text-indigo-200">.</span></h3>
                  <p className="text-indigo-200/80 text-[10px] font-bold uppercase tracking-widest">Active Intelligence</p>
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto scrollbar-hide mb-6">
                <p className="text-sm leading-relaxed text-indigo-50 font-medium italic">
                  "{insights}"
                </p>
              </div>

              <button className="w-full py-4 bg-white text-indigo-600 rounded-2xl font-black text-sm shadow-xl hover:scale-[1.02] transition-transform">
                Regenerate Strategy
              </button>
            </div>
          </div>

          <div className="bg-white p-8 rounded-[40px] border border-slate-50 shadow-sm flex flex-col justify-center text-center py-10">
             <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-6 text-slate-300">
                <i className="fas fa-bell text-2xl"></i>
             </div>
             <h4 className="font-black text-xl text-slate-900 mb-2">Recent Alerts</h4>
             <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-amber-50 text-amber-800 rounded-xl text-xs font-bold border border-amber-100">
                   <i className="fas fa-exclamation-triangle"></i>
                   Maintenance needed: Suite 201
                </div>
                <div className="flex items-center gap-3 p-3 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-bold border border-emerald-100">
                   <i className="fas fa-check-circle"></i>
                   Payment verified for #BK12
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderInventory = () => (
    <div className="space-y-8 animate-fade-up">
      <div className="flex items-center justify-between mb-4 px-4">
         <div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Inventory Matrix</h2>
            <p className="text-slate-500 font-medium">Manage and monitor {MOCK_UNITS.length} property units.</p>
         </div>
         <button className="bg-slate-900 text-white px-8 py-3.5 rounded-2xl font-black text-sm flex items-center gap-3 hover:bg-indigo-600 transition-all">
            <i className="fas fa-plus"></i> New Unit
         </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {MOCK_UNITS.map(unit => (
          <div key={unit.id} className="bg-white rounded-[40px] overflow-hidden border border-slate-100 hover:shadow-2xl transition-all group">
            <div className="h-64 relative overflow-hidden">
               <img src={unit.images[0]} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
               <div className="absolute top-6 left-6 flex gap-2">
                 <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border backdrop-blur-md ${unit.available ? 'bg-emerald-50/80 text-emerald-700 border-emerald-100' : 'bg-rose-50/80 text-rose-700 border-rose-100'}`}>
                    {unit.available ? 'Available' : 'Occupied'}
                 </span>
                 <span className="px-4 py-1.5 bg-slate-900/80 backdrop-blur-md text-white rounded-full text-[10px] font-black uppercase tracking-widest">
                    {unit.type}
                 </span>
               </div>
               <div className="absolute bottom-0 inset-x-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
                  <p className="text-white/70 text-[10px] font-black uppercase tracking-widest mb-1">Nightly Rate</p>
                  <p className="text-white text-2xl font-black">Rp {unit.price.toLocaleString()}</p>
               </div>
            </div>
            <div className="p-8 space-y-6">
              <div className="flex justify-between items-start">
                 <h3 className="text-2xl font-black text-slate-900">{unit.name}</h3>
                 <div className="flex items-center gap-1.5 text-slate-400 font-bold text-sm">
                    <i className="fas fa-user-group text-xs"></i>
                    {unit.capacity}
                 </div>
              </div>
              <div className="flex flex-wrap gap-2">
                 {unit.amenities.map(a => (
                   <span key={a} className="px-3 py-1 bg-slate-50 text-slate-500 rounded-lg text-[10px] font-bold uppercase tracking-wider">{a}</span>
                 ))}
              </div>
              <div className="flex gap-3 pt-4 border-t border-slate-50">
                 <button className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-200 transition-all">Edit</button>
                 <button className="flex-1 py-3 border border-slate-200 text-slate-900 rounded-xl text-xs font-black uppercase tracking-widest hover:border-indigo-600 transition-all">Availability</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderBookings = () => (
    <div className="bg-white rounded-[40px] border border-slate-50 shadow-sm overflow-hidden animate-fade-up">
      <div className="p-10 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-slate-50/20">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Stay Ledger</h2>
          <p className="text-slate-500 font-medium">Track reservations, inquiries, and check-ins.</p>
        </div>
        <div className="flex bg-slate-100 p-1.5 rounded-2xl gap-1">
          {['All', 'Pending', 'Confirmed', 'Completed'].map(status => (
            <button key={status} className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${status === 'All' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}>{status}</button>
          ))}
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">
              <th className="px-10 py-6">Guest / Reference</th>
              <th className="px-10 py-6">Check-in / Out</th>
              <th className="px-10 py-6">Unit</th>
              <th className="px-10 py-6">Payment Status</th>
              <th className="px-10 py-6">Stay Status</th>
              <th className="px-10 py-6 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {MOCK_BOOKINGS.map(bk => (
              <tr key={bk.id} className="hover:bg-slate-50 transition-all group">
                <td className="px-10 py-8">
                   <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center font-black text-slate-500 text-xs">
                         {bk.guestId.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                         <p className="font-black text-slate-900 leading-none mb-1">ID: {bk.id.toUpperCase()}</p>
                         <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Guest#{bk.guestId}</p>
                      </div>
                   </div>
                </td>
                <td className="px-10 py-8 text-xs font-bold text-slate-600">
                   <div className="flex flex-col">
                      <span>{bk.checkIn}</span>
                      <span className="text-slate-300 font-medium">to {bk.checkOut}</span>
                   </div>
                </td>
                <td className="px-10 py-8 font-black text-slate-900 text-sm">Unit {bk.unitId}</td>
                <td className="px-10 py-8">
                   <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-[10px] font-black uppercase tracking-widest border border-emerald-100">Paid In Full</span>
                </td>
                <td className="px-10 py-8">
                   <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase border ${
                     bk.status === BookingStatus.CONFIRMED ? 'bg-indigo-50 text-indigo-600 border-indigo-100' : 
                     bk.status === BookingStatus.PENDING ? 'bg-amber-50 text-amber-600 border-amber-100' :
                     'bg-slate-50 text-slate-500 border-slate-100'
                   }`}>
                     {bk.status}
                   </span>
                </td>
                <td className="px-10 py-8 text-right">
                   <button className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-100 text-slate-400 hover:text-indigo-600 hover:bg-white border border-transparent hover:border-indigo-100 transition-all">
                      <i className="fas fa-ellipsis-v"></i>
                   </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderFinance = () => (
    <div className="space-y-8 animate-fade-up">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-10 rounded-[40px] border border-slate-100 shadow-sm space-y-10">
           <div>
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">Transactional Ledger</h2>
              <p className="text-slate-500 font-medium">Review income stream and platform commissions.</p>
           </div>
           <div className="overflow-x-auto">
             <table className="w-full text-left">
               <thead className="text-slate-400 text-[10px] font-black uppercase tracking-widest">
                  <tr>
                    <th className="pb-6">Trace ID</th>
                    <th className="pb-6">Description</th>
                    <th className="pb-6">Amount</th>
                    <th className="pb-6">Deduction</th>
                    <th className="pb-6">Status</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-50">
                  {MOCK_TRANSACTIONS.filter(t => t.businessId === business.id).map(tx => (
                    <tr key={tx.id} className="text-sm">
                       <td className="py-6 font-mono text-xs text-slate-400">{tx.id.toUpperCase()}</td>
                       <td className="py-6 font-bold text-slate-700">{tx.description}</td>
                       <td className="py-6 font-black text-slate-900">Rp {tx.amount.toLocaleString()}</td>
                       <td className="py-6 text-rose-500 font-bold">- Rp {(tx.amount * 0.1).toLocaleString()}</td>
                       <td className="py-6">
                          <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-[10px] font-black uppercase tracking-widest">{tx.status}</span>
                       </td>
                    </tr>
                  ))}
               </tbody>
             </table>
           </div>
        </div>
        <div className="space-y-8">
           <div className="bg-slate-950 p-10 rounded-[40px] shadow-2xl text-white">
              <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-2">Net Income Forecast</p>
              <h3 className="text-4xl font-black mb-10 tracking-tighter leading-none">Rp 124.5M<br/><span className="text-sm font-medium text-slate-500">Scheduled Payouts</span></h3>
              <div className="space-y-6">
                 <div className="flex justify-between items-center text-sm font-bold border-b border-white/10 pb-4">
                    <span className="text-slate-400">Total Commissions</span>
                    <span className="text-indigo-400">Rp 12.4M</span>
                 </div>
                 <div className="flex justify-between items-center text-sm font-bold">
                    <span className="text-slate-400">Platform Fees</span>
                    <span className="text-indigo-400">Rp 1.5M</span>
                 </div>
                 <button className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-sm shadow-xl shadow-indigo-900/40 hover:bg-indigo-700 transition-all mt-4">Manual Settlement Request</button>
              </div>
           </div>
           <div className="bg-white p-10 rounded-[40px] border border-slate-100 shadow-sm flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 mb-6">
                 <i className="fas fa-file-invoice-dollar text-2xl"></i>
              </div>
              <h4 className="font-black text-xl text-slate-900 mb-2">Tax Statements</h4>
              <p className="text-slate-500 text-xs font-medium mb-6 leading-relaxed">Download your monthly tax invoices and reporting summaries.</p>
              <button className="px-8 py-3 bg-slate-100 text-slate-900 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all">Download PDF</button>
           </div>
        </div>
      </div>
    </div>
  );

  const renderTeam = () => (
    <div className="space-y-10 animate-fade-up">
      <div className="flex items-center justify-between mb-4 px-4">
         <div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Internal Staff</h2>
            <p className="text-slate-500 font-medium">Manage access and operations for {staff.length} team members.</p>
         </div>
         <button className="bg-indigo-600 text-white px-8 py-3.5 rounded-2xl font-black text-sm flex items-center gap-3 shadow-xl shadow-indigo-100">
            <i className="fas fa-user-plus"></i> Recruit Member
         </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {staff.map(member => (
          <div key={member.id} className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-slate-50 rounded-full blur-2xl -mr-12 -mt-12 transition-colors group-hover:bg-indigo-50"></div>
            <div className="relative z-10 flex items-center gap-5 mb-8">
               <img src={member.avatar} className="w-16 h-16 rounded-2xl object-cover shadow-lg group-hover:scale-105 transition-transform" />
               <div>
                  <h4 className="font-black text-xl text-slate-900 leading-none mb-2">{member.name}</h4>
                  <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[10px] font-black uppercase tracking-widest border border-indigo-100">
                    {member.role.replace('_', ' ')}
                  </span>
               </div>
            </div>
            <div className="space-y-4 text-sm font-medium text-slate-500 relative z-10">
               <div className="flex justify-between items-center pb-4 border-b border-slate-50">
                  <span className="flex items-center gap-2"><i className="fas fa-envelope text-[10px]"></i> Email</span>
                  <span className="text-slate-900">{member.email}</span>
               </div>
               <div className="flex justify-between items-center pb-4 border-b border-slate-50">
                  <span className="flex items-center gap-2"><i className="fas fa-calendar-day text-[10px]"></i> Joined</span>
                  <span className="text-slate-900">{member.createdAt}</span>
               </div>
               <div className="flex justify-between items-center">
                  <span className="flex items-center gap-2"><i className="fas fa-shield-halved text-[10px]"></i> Permission</span>
                  <span className="text-indigo-600 font-bold uppercase text-[10px]">Restricted Ops</span>
               </div>
            </div>
            <div className="flex gap-3 mt-8 relative z-10">
               <button className="flex-1 py-3.5 bg-slate-50 text-slate-500 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-100 transition-all">Suspend</button>
               <button className="flex-1 py-3.5 bg-white border border-slate-200 text-slate-900 rounded-xl font-black text-[10px] uppercase tracking-widest hover:border-indigo-600 transition-all">Edit Access</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="grid lg:grid-cols-3 gap-10 animate-fade-up">
       <div className="lg:col-span-2 space-y-8">
          <div className="bg-white p-10 rounded-[40px] border border-slate-100 shadow-sm space-y-10">
             <div>
                <h2 className="text-3xl font-black text-slate-900 tracking-tight">Business Identity</h2>
                <p className="text-slate-500 font-medium">Control your platform branding and global policies.</p>
             </div>
             <form className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Legal Trading Name</label>
                      <input type="text" defaultValue={business.name} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 font-bold text-slate-900 focus:outline-none focus:ring-4 ring-indigo-50 transition-all" />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Business Category</label>
                      <input type="text" value={business.category} disabled className="w-full bg-slate-100 border border-slate-200 rounded-2xl px-5 py-4 font-bold text-slate-400 cursor-not-allowed" />
                   </div>
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Official Description</label>
                   <textarea rows={4} defaultValue={business.description} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 font-bold text-slate-900 focus:outline-none focus:ring-4 ring-indigo-50 transition-all resize-none" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Check-in Policy</label>
                      <select className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 font-bold text-slate-900 focus:outline-none focus:ring-4 ring-indigo-50">
                         <option>Flexible (24h)</option>
                         <option>Standard (14:00)</option>
                         <option>Afternoon (16:00)</option>
                      </select>
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Min. Stay Rule</label>
                      <input type="number" defaultValue={1} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 font-bold text-slate-900 focus:outline-none focus:ring-4 ring-indigo-50" />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Booking Mode</label>
                      <select className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 font-bold text-slate-900 focus:outline-none focus:ring-4 ring-indigo-50">
                         <option>Instant Approval</option>
                         <option>Manual Review</option>
                      </select>
                   </div>
                </div>
                <div className="pt-6 border-t border-slate-50">
                   <button className="bg-slate-950 text-white px-12 py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-indigo-600 transition-all">Sync Identity</button>
                </div>
             </form>
          </div>
       </div>
       <div className="space-y-8">
          <div className="bg-white p-10 rounded-[40px] border border-slate-100 shadow-sm space-y-8">
             <h3 className="font-black text-2xl text-slate-900 tracking-tight">Visual Asset Hub</h3>
             <div className="grid grid-cols-2 gap-4">
                {business.images.map((img, i) => (
                  <div key={i} className="aspect-square rounded-2xl overflow-hidden relative group">
                    <img src={img} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                    <button className="absolute top-2 right-2 w-8 h-8 bg-white/20 backdrop-blur-md rounded-lg text-white opacity-0 group-hover:opacity-100 transition-opacity">
                      <i className="fas fa-times text-xs"></i>
                    </button>
                  </div>
                ))}
                <button className="aspect-square border-2 border-dashed border-slate-100 rounded-2xl flex flex-col items-center justify-center text-slate-300 hover:border-indigo-600 hover:text-indigo-600 transition-all">
                   <i className="fas fa-upload mb-2"></i>
                   <span className="text-[10px] font-black uppercase">Add Photo</span>
                </button>
             </div>
          </div>
          <div className="bg-indigo-600 p-10 rounded-[40px] shadow-2xl text-white">
             <h4 className="font-black text-xl mb-4">Account Security</h4>
             <p className="text-indigo-200 text-sm font-medium mb-8 leading-relaxed">Ensure your internal audit logs are reviewed weekly for staff compliance.</p>
             <button className="w-full py-4 bg-white/10 border border-white/30 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-white/20 transition-all">Access Audit Vault</button>
          </div>
       </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-[#f8fafc] overflow-hidden">
      {/* Internal Owner Navigation (Horizontal Matrix) */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="px-10 py-6 border-b border-slate-200/50 bg-white/30 backdrop-blur-md sticky top-0 z-30 overflow-x-auto scrollbar-hide">
           <div className="flex items-center gap-4 max-w-fit mx-auto">
              {[
                { id: 'overview', label: 'Strategic Overview', icon: 'fa-chess-king' },
                { id: 'inventory', label: 'Unit Management', icon: 'fa-door-open' },
                { id: 'bookings', label: 'Stay Ledger', icon: 'fa-book-open' },
                { id: 'finance', label: 'Financial Hub', icon: 'fa-sack-dollar' },
                { id: 'team', label: 'Team Matrix', icon: 'fa-users-gear' },
                { id: 'settings', label: 'Identity & Logic', icon: 'fa-sliders' }
              ].map(mod => (
                <button 
                  key={mod.id}
                  onClick={() => setActiveModule(mod.id as any)}
                  className={`flex items-center gap-3 px-8 py-4 rounded-2xl text-sm font-black transition-all whitespace-nowrap ${
                    activeModule === mod.id 
                    ? 'bg-indigo-600 text-white shadow-2xl shadow-indigo-100 scale-105' 
                    : 'text-slate-500 hover:bg-white hover:text-slate-900 border border-transparent'
                  }`}
                >
                   <i className={`fas ${mod.icon}`}></i>
                   {mod.label}
                </button>
              ))}
           </div>
        </div>

        <main className="flex-1 overflow-y-auto p-10">
          <div className="max-w-[1400px] mx-auto">
            {renderModule()}
          </div>
        </main>
      </div>
    </div>
  );
};
