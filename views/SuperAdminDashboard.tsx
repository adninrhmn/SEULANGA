
import React, { useState, useMemo } from 'react';
import { MOCK_BUSINESSES, MOCK_TRANSACTIONS, MOCK_ADS, MOCK_AUDIT_LOGS, MOCK_USERS, MOCK_REVIEWS, TRANSLATIONS } from '../constants';
import { BusinessCategory, SubscriptionPlan, Business, AuditLog, UserRole, BusinessStatus, Review, Transaction, User, VerificationStatus } from '../types';
import { generateWelcomeEmail } from '../services/geminiService';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, AreaChart, Area, PieChart, Pie, Cell, Legend } from 'recharts';

const revenueData = [
  { name: 'Jul', subs: 45000000, comm: 12000000, ads: 5000000, mrr: 62000000 },
  { name: 'Aug', subs: 52000000, comm: 18000000, ads: 8000000, mrr: 78000000 },
  { name: 'Sep', subs: 48000000, comm: 15000000, ads: 7000000, mrr: 70000000 },
  { name: 'Oct', subs: 61000000, comm: 22000000, ads: 12000000, mrr: 95000000 },
  { name: 'Nov', subs: 68000000, comm: 25000000, ads: 15000000, mrr: 108000000 },
  { name: 'Dec', subs: 85000000, comm: 32000000, ads: 20000000, mrr: 137000000 },
];

interface SuperAdminDashboardProps {
  activeTab: 'overview' | 'analytics' | 'monetization' | 'tenants' | 'reviews' | 'finance' | 'logs' | 'settings';
  onNavigate: (view: string, subView?: string) => void;
  language: 'id' | 'en';
}

export const SuperAdminDashboard: React.FC<SuperAdminDashboardProps> = ({ activeTab, onNavigate, language }) => {
  const [businesses, setBusinesses] = useState<Business[]>(MOCK_BUSINESSES);
  const [payoutRequests, setPayoutRequests] = useState([
    { id: 'po1', businessName: 'Grand Seulanga Hotel', amount: 12500000, status: 'pending', requestedAt: '2024-12-28', processing: false },
    { id: 'po2', businessName: 'Pine Hill Guesthouse', amount: 4200000, status: 'pending', requestedAt: '2024-12-29', processing: false }
  ]);
  
  const t = TRANSLATIONS[language];

  const stats = [
    { label: t.platform_gtv, value: 'Rp 4.82B', trend: '+18.4%', icon: 'fa-vault', color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: t.revenue_net, value: 'Rp 542M', trend: '+12.1%', icon: 'fa-piggy-bank', color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: t.active_tenants, value: businesses.length, trend: '+4 new', icon: 'fa-building-shield', color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: t.security_health, value: '99.9%', trend: 'Optimal', icon: 'fa-shield-heart', color: 'text-rose-600', bg: 'bg-rose-50' },
  ];

  const renderStatusBadge = (status: BusinessStatus) => {
    const configs: Record<string, { bg: string, text: string, border: string }> = {
      active: { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-100' },
      pending: { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-100' },
      suspended: { bg: 'bg-rose-50', text: 'text-rose-600', border: 'border-rose-100' },
      rejected: { bg: 'bg-slate-950', text: 'text-white', border: 'border-slate-800' },
    };
    const config = configs[status] || { bg: 'bg-slate-50', text: 'text-slate-500', border: 'border-slate-100' };
    return (
      <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border shadow-sm ${config.bg} ${config.text} ${config.border}`}>
        {status.replace('_', ' ')}
      </span>
    );
  };

  const renderOverview = () => (
    <div className="space-y-10 animate-fade-up">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm hover:shadow-xl transition-all group">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform`}>
              <i className={`fas ${stat.icon} text-2xl`}></i>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{stat.label}</p>
            <div className="flex items-end justify-between">
              <h3 className="text-3xl font-black text-slate-900 tracking-tight">{stat.value}</h3>
              <span className={`text-xs font-black ${stat.trend.includes('+') ? 'text-emerald-600' : 'text-slate-400'}`}>{stat.trend}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 bg-white p-10 rounded-[48px] border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h3 className="font-black text-2xl text-slate-900 tracking-tight">{t.ecosystem} Growth Matrix</h3>
              <p className="text-slate-400 font-medium">Consolidated MRR and Partner acquisition trends.</p>
            </div>
          </div>
          <div className="h-[450px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="colorSubs" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3}/><stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/></linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="5 5" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}} dy={15} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}} tickFormatter={(val) => `Rp${val/1000000}M`} />
                <Tooltip contentStyle={{borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.15)', padding: '20px'}} />
                <Area type="monotone" dataKey="mrr" stroke="#4f46e5" strokeWidth={4} fillOpacity={1} fill="url(#colorSubs)" name="Recurring Revenue" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="space-y-8">
          <div className="bg-slate-950 p-10 rounded-[48px] shadow-2xl text-white relative overflow-hidden h-full flex flex-col justify-between">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl -mr-32 -mt-32"></div>
            <div className="relative z-10">
              <div className="w-14 h-14 bg-white/10 backdrop-blur-xl rounded-2xl flex items-center justify-center border border-white/20 mb-8">
                 <i className="fas fa-microchip text-indigo-400 text-xl"></i>
              </div>
              <h3 className="text-3xl font-black tracking-tight mb-4 leading-tight">Infrastructure Snapshot</h3>
              <p className="text-indigo-200/60 font-medium mb-10">All platform nodes are operating at peak efficiency across the SEULANGA cluster.</p>
              
              <div className="space-y-6">
                 {[
                   { label: 'API Latency', value: '42ms', color: 'text-emerald-400' },
                   { label: 'Storage Used', value: '4.2 TB / 10 TB', color: 'text-indigo-400' },
                   { label: 'Active Sessions', value: '1,420', color: 'text-amber-400' }
                 ].map(i => (
                   <div key={i.label} className="flex justify-between border-b border-white/5 pb-4">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">{i.label}</span>
                      <span className={`text-xs font-black ${i.color}`}>{i.value}</span>
                   </div>
                 ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-12 animate-fade-up">
      <div className="bg-white p-10 rounded-[48px] border border-slate-100 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-slate-50 rounded-full blur-3xl -mr-40 -mt-40"></div>
        <div className="relative z-10 flex flex-col xl:flex-row xl:items-center justify-between gap-10">
          <div className="flex items-center gap-8">
            <div className="relative">
              <div className="w-28 h-28 rounded-[36px] bg-slate-950 p-1.5 rotate-3 hover:rotate-0 transition-transform shadow-2xl flex items-center justify-center">
                 <i className="fas fa-shield-halved text-white text-4xl"></i>
              </div>
              <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-emerald-500 border-4 border-white rounded-full flex items-center justify-center text-white shadow-lg">
                <i className="fas fa-check-double text-xs"></i>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-4 mb-2">
                <h1 className="text-5xl font-black text-slate-900 tracking-tighter">System Governor<span className="text-indigo-600">.</span></h1>
                <span className="px-5 py-1.5 bg-slate-950 text-white text-[10px] font-black uppercase rounded-full tracking-[0.2em]">{t.absolute_authority}</span>
              </div>
              <p className="text-slate-500 font-medium text-lg flex items-center gap-3">
                <i className="fas fa-fingerprint text-indigo-400"></i>
                Cluster ID: SEU-MAIN-001
                <span className="mx-2 text-slate-200">|</span>
                <span className="text-emerald-600 font-black text-sm uppercase tracking-widest">{t.identity_verified}</span>
              </p>
            </div>
          </div>
          <div className="flex bg-slate-100/80 backdrop-blur p-2 rounded-[28px] border border-slate-200/40 gap-1 overflow-x-auto scrollbar-hide">
            {[
              { id: 'overview', label: t.ecosystem, icon: 'fa-brain' },
              { id: 'analytics', label: t.analytics, icon: 'fa-chart-pie' },
              { id: 'tenants', label: t.tenants, icon: 'fa-id-badge' },
              { id: 'finance', label: t.treasury, icon: 'fa-receipt' },
              { id: 'settings', label: t.settings, icon: 'fa-gear' }
            ].map(t => (
              <button 
                key={t.id}
                onClick={() => onNavigate('super-admin', t.id)}
                className={`flex items-center gap-3 px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                  activeTab === t.id ? 'bg-indigo-600 text-white shadow-2xl shadow-indigo-100' : 'text-slate-500 hover:bg-white hover:text-slate-900'
                }`}
              >
                <i className={`fas ${t.icon}`}></i>
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-[1500px] mx-auto">
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'tenants' && (
           <div className="p-20 text-center font-black text-slate-300">Tenant Management Protocol synchronized in {language.toUpperCase()}</div>
        )}
      </div>
    </div>
  );
};
