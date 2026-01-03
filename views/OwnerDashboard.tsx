
import React, { useState, useEffect } from 'react';
import { MOCK_BUSINESSES, MOCK_BOOKINGS, MOCK_UNITS } from '../constants';
import { getBusinessInsights } from '../services/geminiService';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';

const revenueData = [
  { name: 'Jan', revenue: 45000000, bookings: 42 },
  { name: 'Feb', revenue: 52000000, bookings: 48 },
  { name: 'Mar', revenue: 48000000, bookings: 45 },
  { name: 'Apr', revenue: 61000000, bookings: 55 },
  { name: 'May', revenue: 55000000, bookings: 51 },
  { name: 'Jun', revenue: 67000000, bookings: 62 },
];

export const OwnerDashboard: React.FC = () => {
  const [insights, setInsights] = useState<string>('Analyzing your market position...');
  const [activeTab, setActiveTab] = useState('overview');
  const business = MOCK_BUSINESSES[0];

  useEffect(() => {
    const fetchInsights = async () => {
      const text = await getBusinessInsights({
        revenue: 67000000,
        occupancy: '92%',
        bookings: 62,
        category: business.category,
        period: 'Q2 2024'
      });
      setInsights(text || "Strategic data unavailable.");
    };
    fetchInsights();
  }, [business.category]);

  return (
    <div className="space-y-10">
      {/* Dynamic Header */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 bg-white p-8 rounded-[32px] border border-slate-200/60 shadow-sm">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 rounded-3xl bg-indigo-600 flex items-center justify-center text-white shadow-xl shadow-indigo-100 rotate-2">
            <i className="fas fa-hotel text-3xl"></i>
          </div>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">{business.name}</h1>
              <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-[10px] font-black uppercase rounded-full tracking-widest border border-emerald-200">Verified</span>
            </div>
            <p className="text-slate-500 font-medium flex items-center gap-2">
              <i className="fas fa-location-dot text-indigo-500"></i>
              {business.address}
              <span className="mx-2 text-slate-300">•</span>
              <span className="text-indigo-600 font-bold uppercase text-xs tracking-widest">{business.subscription} Plan</span>
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <button className="flex-1 md:flex-none bg-slate-50 text-slate-700 px-6 py-3.5 rounded-2xl border border-slate-200 font-bold hover:bg-white transition-all flex items-center justify-center gap-2">
            <i className="fas fa-chart-pie"></i> Analytics
          </button>
          <button className="flex-1 md:flex-none bg-indigo-600 text-white px-8 py-3.5 rounded-2xl font-bold hover:bg-indigo-700 shadow-xl shadow-indigo-200 transition-all flex items-center justify-center gap-3">
            <i className="fas fa-plus"></i> New Listing
          </button>
        </div>
      </div>

      {/* Stats Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Net Revenue', value: 'Rp 67.2M', trend: '+12.4%', icon: 'fa-sack-dollar', color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Active Bookings', value: '62', trend: '+8.1%', icon: 'fa-calendar-check', color: 'text-indigo-600', bg: 'bg-indigo-50' },
          { label: 'Occupancy Rate', value: '92.4%', trend: '+4.3%', icon: 'fa-door-open', color: 'text-violet-600', bg: 'bg-violet-50' },
          { label: 'Guest Rating', value: '4.9/5', trend: 'Steady', icon: 'fa-star', color: 'text-amber-500', bg: 'bg-amber-50' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-xl hover:border-indigo-100 transition-all group">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110 ${stat.bg} ${stat.color}`}>
              <i className={`fas ${stat.icon} text-2xl`}></i>
            </div>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                <h3 className="text-3xl font-black text-slate-900">{stat.value}</h3>
              </div>
              <span className={`text-xs font-black ${stat.trend.startsWith('+') ? 'text-emerald-600' : 'text-slate-400'}`}>
                {stat.trend}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-10">
        {/* Advanced Charting */}
        <div className="lg:col-span-2 bg-white p-10 rounded-[40px] border border-slate-200/60 shadow-sm">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h3 className="font-black text-2xl text-slate-900 tracking-tight">Financial Performance</h3>
              <p className="text-slate-400 text-sm font-medium">Revenue and volume analysis for 2024</p>
            </div>
            <div className="flex bg-slate-50 p-1.5 rounded-2xl gap-1">
              {['Revenue', 'Bookings'].map(t => (
                <button 
                  key={t}
                  onClick={() => setActiveTab(t.toLowerCase())}
                  className={`px-6 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === t.toLowerCase() ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
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
                  <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="5 5" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 700}} 
                  dy={15} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 700}} 
                  tickFormatter={(val) => `Rp ${val/1000000}M`}
                />
                <Tooltip 
                  cursor={{ stroke: '#4f46e5', strokeWidth: 2, strokeDasharray: '5 5' }}
                  contentStyle={{borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.15)', padding: '20px'}}
                />
                <Area 
                  type="monotone" 
                  dataKey={activeTab === 'revenue' ? 'revenue' : 'bookings'} 
                  stroke="#4f46e5" 
                  strokeWidth={4} 
                  fillOpacity={1} 
                  fill="url(#chartGradient)" 
                  animationDuration={2000}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AI Command Center */}
        <div className="ai-gradient text-white p-10 rounded-[40px] shadow-2xl flex flex-col relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-400/20 rounded-full blur-3xl -ml-32 -mb-32"></div>
          
          <div className="relative z-10 flex flex-col h-full">
            <div className="flex items-center gap-4 mb-10">
              <div className="w-14 h-14 bg-white/20 backdrop-blur-xl rounded-[20px] flex items-center justify-center border border-white/30 shadow-inner">
                <i className="fas fa-brain text-white text-xl"></i>
              </div>
              <div>
                <h3 className="font-black text-2xl tracking-tight">AI Command<span className="text-indigo-200">.</span></h3>
                <p className="text-indigo-200/80 text-[10px] font-bold uppercase tracking-widest">Active Intelligence</p>
              </div>
            </div>
            
            <div className="flex-1 bg-white/10 backdrop-blur-2xl p-8 rounded-[32px] border border-white/20 shadow-inner mb-8">
              <p className="text-sm leading-[1.8] text-indigo-50 font-medium italic whitespace-pre-line">
                "{insights}"
              </p>
            </div>
            
            <div className="space-y-3">
              <button className="w-full py-4 bg-white text-indigo-600 rounded-2xl font-black text-sm transition-all hover:scale-[1.02] shadow-xl">
                Run Predictive Analysis
              </button>
              <button className="w-full py-4 bg-transparent border border-white/30 text-white rounded-2xl font-black text-sm hover:bg-white/10 transition-all">
                Export Strategic Insights
              </button>
            </div>
            
            <div className="mt-10 flex items-center justify-between text-[10px] font-bold text-indigo-200/60 uppercase tracking-widest">
              <span>Seulanga Brain v3.4</span>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping"></span>
                Connected
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Inventory Control */}
      <div className="bg-white rounded-[40px] border border-slate-200/60 shadow-sm overflow-hidden">
        <div className="px-10 py-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
          <div>
            <h3 className="font-black text-2xl text-slate-900 tracking-tight">Inventory Matrix</h3>
            <p className="text-slate-400 text-sm font-medium">Real-time availability tracking across all units</p>
          </div>
          <div className="flex gap-4">
             <button className="w-12 h-12 flex items-center justify-center bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-indigo-600 transition-all">
               <i className="fas fa-sliders"></i>
             </button>
             <button className="px-6 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 hover:border-indigo-600 transition-all">
               View Full Matrix
             </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">
                <th className="px-10 py-6">Identity</th>
                <th className="px-10 py-6">Type</th>
                <th className="px-10 py-6">Pricing Index</th>
                <th className="px-10 py-6">Utilization</th>
                <th className="px-10 py-6">State</th>
                <th className="px-10 py-6">Command</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {MOCK_UNITS.map((unit) => (
                <tr key={unit.id} className="hover:bg-slate-50/80 transition-all group">
                  <td className="px-10 py-7">
                    <div className="flex items-center gap-5">
                      <div className="relative">
                        <img src={unit.images[0]} className="w-16 h-16 rounded-2xl object-cover shadow-md group-hover:scale-110 transition-transform" />
                        <div className="absolute -top-2 -right-2 w-6 h-6 bg-white rounded-full border border-slate-100 flex items-center justify-center text-[10px] font-black text-indigo-600 shadow-sm">
                           <i className="fas fa-check"></i>
                        </div>
                      </div>
                      <span className="font-extrabold text-slate-900 text-lg">{unit.name}</span>
                    </div>
                  </td>
                  <td className="px-10 py-7">
                    <span className="px-4 py-1.5 bg-slate-100 text-slate-500 rounded-xl text-xs font-black uppercase tracking-widest">{unit.type}</span>
                  </td>
                  <td className="px-10 py-7">
                    <div className="flex flex-col">
                       <span className="font-black text-slate-900 text-lg">Rp {unit.price.toLocaleString()}</span>
                       <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Base Rate</span>
                    </div>
                  </td>
                  <td className="px-10 py-7">
                    <div className="w-32">
                       <div className="flex justify-between text-[10px] font-black text-slate-400 mb-1.5 uppercase tracking-widest">
                          <span>Occupancy</span>
                          <span className="text-indigo-600">84%</span>
                       </div>
                       <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-indigo-600 rounded-full" style={{width: '84%'}}></div>
                       </div>
                    </div>
                  </td>
                  <td className="px-10 py-7">
                    <span className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-100/50 text-emerald-700 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-emerald-100">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                      Ready
                    </span>
                  </td>
                  <td className="px-10 py-7 text-right">
                    <button className="w-12 h-12 rounded-2xl hover:bg-indigo-50 text-slate-400 hover:text-indigo-600 transition-all flex items-center justify-center ml-auto">
                      <i className="fas fa-ellipsis-v text-xl"></i>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
