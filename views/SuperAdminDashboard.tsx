
import React, { useState, useMemo } from 'react';
// Removed MOCK_ADS from the imports as it does not exist in constants.tsx
import { MOCK_BUSINESSES, MOCK_TRANSACTIONS, MOCK_AUDIT_LOGS, MOCK_USERS, MOCK_REVIEWS, TRANSLATIONS } from '../constants';
import { BusinessCategory, SubscriptionPlan, Business, AuditLog, UserRole, BusinessStatus, Review, Transaction, User, VerificationStatus } from '../types';
import { generateWelcomeEmail } from '../services/geminiService';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

const revenueData = [
  { name: 'Jul', subs: 45000000, comm: 12000000, mrr: 62000000 },
  { name: 'Aug', subs: 52000000, comm: 18000000, mrr: 78000000 },
  { name: 'Sep', subs: 48000000, comm: 15000000, mrr: 70000000 },
  { name: 'Oct', subs: 61000000, comm: 22000000, mrr: 95000000 },
  { name: 'Nov', subs: 68000000, comm: 25000000, mrr: 108000000 },
  { name: 'Dec', subs: 85000000, comm: 32000000, mrr: 137000000 },
];

interface SubPlan {
  id: string;
  name: string;
  price: string;
  commission: string;
  features: string[];
  status: 'active' | 'archived';
}

const INITIAL_PLANS: SubPlan[] = [
  { id: 'p1', name: 'Basic Access', price: 'Free', commission: '15%', features: ['Community Support', 'Standard Listing', 'Basic Analytics'], status: 'active' },
  { id: 'p2', name: 'Growth Professional', price: 'Rp 499.000', commission: '10%', features: ['Priority Search', 'Staff Accounts (Max 10)', 'Advanced Analytics'], status: 'active' },
  { id: 'p3', name: 'Enterprise Premium', price: 'Rp 1.200.000', commission: '5%', features: ['24/7 Support', 'AI Insights', 'Custom Reports', 'Featured Ads'], status: 'active' },
];

interface SuperAdminDashboardProps {
  activeTab: 'overview' | 'analytics' | 'monetization' | 'tenants' | 'reviews' | 'finance' | 'logs' | 'settings';
  onNavigate: (view: string, subView?: string) => void;
  language: 'id' | 'en';
}

export const SuperAdminDashboard: React.FC<SuperAdminDashboardProps> = ({ activeTab, onNavigate, language }) => {
  const [businesses, setBusinesses] = useState<Business[]>(MOCK_BUSINESSES);
  const [plans, setPlans] = useState<SubPlan[]>(INITIAL_PLANS);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(MOCK_AUDIT_LOGS);
  const [isBackupRunning, setIsBackupRunning] = useState(false);
  const [isMaintenanceMode, setIsMaintenanceMode] = useState(false);
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

  const handleProcessPayout = async (id: string) => {
    const payout = payoutRequests.find(p => p.id === id);
    if (!payout) return;
    setPayoutRequests(prev => prev.map(p => p.id === id ? { ...p, processing: true } : p));
    await new Promise(res => setTimeout(res, 2000));
    setPayoutRequests(prev => prev.map(p => p.id === id ? { ...p, status: 'settled', processing: false } : p));
    
    const newLog: AuditLog = {
      id: `log${Date.now()}`,
      actorId: 'u1',
      actorName: 'Zian Ali',
      actorRole: UserRole.SUPER_ADMIN,
      action: 'Batch Payout Executed',
      target: payout.businessName,
      type: 'financial',
      timestamp: new Date().toLocaleString()
    };
    setAuditLogs([newLog, ...auditLogs]);
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
              <h3 className="font-black text-2xl text-slate-900 tracking-tight">MRR Expansion Strategy</h3>
              <p className="text-slate-400 font-medium">Subscription revenue vs. Commission stream trends.</p>
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
                <Area type="monotone" dataKey="mrr" stroke="#4f46e5" strokeWidth={4} fillOpacity={1} fill="url(#colorSubs)" name="Total MRR" />
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
              <h3 className="text-3xl font-black tracking-tight mb-4 leading-tight">Infrastructure Health</h3>
              <p className="text-indigo-200/60 font-medium mb-10">All platform modules operating at peak efficiency across clusters.</p>
              
              <div className="space-y-6">
                 {[
                   { label: 'API Latency', value: '38ms', color: 'text-emerald-400' },
                   { label: 'DB Connections', value: '422 Active', color: 'text-indigo-400' },
                   { label: 'Cloud Backup', value: '4h ago (Auto)', color: 'text-amber-400' }
                 ].map(i => (
                   <div key={i.label} className="flex justify-between border-b border-white/5 pb-4">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">{i.label}</span>
                      <span className={`text-xs font-black ${i.color}`}>{i.value}</span>
                   </div>
                 ))}
              </div>
            </div>
            <button 
              onClick={() => { setIsBackupRunning(true); setTimeout(() => setIsBackupRunning(false), 2000); }}
              className="w-full py-5 bg-white/5 border border-white/10 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-white/10 transition-all mt-10"
            >
               {isBackupRunning ? <i className="fas fa-spinner fa-spin mr-2"></i> : <i className="fas fa-cloud-arrow-up mr-2"></i>}
               Manual System Sync
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTenants = () => (
    <div className="space-y-8 animate-fade-up">
      <div className="flex items-center justify-between">
         <h2 className="text-3xl font-black text-slate-900 tracking-tight">Tenant Lifecycle Registry</h2>
         <div className="flex gap-4">
            <button className="bg-slate-950 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-600 shadow-xl transition-all">Pre-Register Partner</button>
         </div>
      </div>
      
      <div className="bg-white rounded-[48px] border border-slate-100 shadow-sm overflow-hidden">
         <div className="p-10 border-b border-slate-50 bg-slate-50/30 flex items-center justify-between">
            <div className="relative w-96">
               <i className="fas fa-search absolute left-5 top-1/2 -translate-y-1/2 text-slate-400"></i>
               <input 
                  type="text" 
                  placeholder="Filter by Entity Name or Entity ID..." 
                  className="w-full bg-white border border-slate-200 rounded-2xl py-3 pl-14 pr-6 text-sm font-bold focus:ring-4 ring-indigo-50 outline-none"
               />
            </div>
            <div className="flex gap-2">
               {Object.values(SubscriptionPlan).map(plan => (
                 <span key={plan} className="px-4 py-1.5 bg-slate-50 text-slate-400 text-[10px] font-black uppercase rounded-lg border border-slate-100">{plan}</span>
               ))}
            </div>
         </div>
         <div className="overflow-x-auto">
            <table className="w-full text-left">
               <thead>
                  <tr className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                     <th className="px-10 py-6">Partner Entity</th>
                     <th className="px-10 py-6">Category</th>
                     <th className="px-10 py-6">Identity Status</th>
                     <th className="px-10 py-6">Verification</th>
                     <th className="px-10 py-6 text-right">Action Protocol</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-50">
                  {businesses.map(biz => (
                    <tr key={biz.id} className="hover:bg-slate-50/50 transition-all group">
                       <td className="px-10 py-7">
                          <div className="flex items-center gap-4">
                             <img src={biz.images[0]} className="w-14 h-14 rounded-2xl object-cover shadow-sm group-hover:scale-105 transition-transform" />
                             <div>
                                <p className="font-black text-slate-900 text-lg group-hover:text-indigo-600 transition-colors">{biz.name}</p>
                                <p className="text-[10px] font-bold text-slate-400 uppercase">Registered: {biz.registrationDate || '2024-12-01'}</p>
                             </div>
                          </div>
                       </td>
                       <td className="px-10 py-7 text-xs font-bold text-slate-600 uppercase tracking-widest">{biz.category}</td>
                       <td className="px-10 py-7">
                          <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase ${
                            biz.subscription === SubscriptionPlan.PREMIUM ? 'bg-indigo-50 text-indigo-600' :
                            biz.subscription === SubscriptionPlan.PRO ? 'bg-amber-50 text-amber-600' :
                            'bg-slate-100 text-slate-500'
                          }`}>{biz.subscription}</span>
                       </td>
                       <td className="px-10 py-7">{renderStatusBadge(biz.status)}</td>
                       <td className="px-10 py-7 text-right">
                          <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                             <button className="w-10 h-10 bg-white border border-slate-200 text-slate-400 rounded-xl hover:text-indigo-600 hover:border-indigo-600 transition-all"><i className="fas fa-eye"></i></button>
                             <button className="w-10 h-10 bg-white border border-slate-200 text-slate-400 rounded-xl hover:text-rose-600 hover:border-rose-600 transition-all"><i className="fas fa-ban"></i></button>
                          </div>
                       </td>
                    </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </div>
    </div>
  );

  const renderMonetization = () => (
    <div className="space-y-10 animate-fade-up">
       <div className="flex items-center justify-between">
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Monetization Engine</h2>
          <button className="bg-indigo-600 text-white px-8 py-4 rounded-3xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 shadow-2xl transition-all">Create New Plan</button>
       </div>
       
       <div className="grid lg:grid-cols-3 gap-8">
          {plans.map(plan => (
            <div key={plan.id} className="bg-white p-12 rounded-[48px] border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-2xl transition-all">
               <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:scale-150 transition-transform"></div>
               <div className="flex justify-between items-start mb-6">
                  <h3 className="text-2xl font-black text-slate-900">{plan.name}</h3>
                  <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-black rounded-lg uppercase tracking-widest">{plan.status}</span>
               </div>
               <div className="flex items-end gap-2 mb-8">
                  <span className="text-5xl font-black text-slate-900 tracking-tighter">{plan.price}</span>
                  <span className="text-slate-400 text-sm font-bold mb-2">/month</span>
               </div>
               <div className="p-4 bg-indigo-50 rounded-2xl mb-8 border border-indigo-100">
                  <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Standard Commission</p>
                  <p className="text-2xl font-black text-indigo-600">{plan.commission}</p>
               </div>
               <div className="space-y-4 mb-12">
                  {plan.features.map(f => (
                    <div key={f} className="flex items-center gap-3">
                       <i className="fas fa-check-circle text-emerald-500"></i>
                       <span className="text-sm font-medium text-slate-500">{f}</span>
                    </div>
                  ))}
               </div>
               <button className="w-full py-4 bg-slate-950 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-600 transition-all">Modify Protocol</button>
            </div>
          ))}
       </div>
    </div>
  );

  const renderLogs = () => (
    <div className="bg-white rounded-[48px] border border-slate-100 shadow-sm overflow-hidden animate-fade-up">
       <div className="p-10 border-b border-slate-50 flex items-center justify-between">
          <h3 className="font-black text-2xl text-slate-900 tracking-tight">Governance Event Stream</h3>
          <button className="text-indigo-600 font-black text-xs uppercase tracking-widest hover:underline">Download System Audit</button>
       </div>
       <div className="overflow-x-auto">
          <table className="w-full text-left">
             <thead>
                <tr className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                   <th className="px-10 py-6">Timestamp</th>
                   <th className="px-10 py-6">Administrator</th>
                   <th className="px-10 py-6">Operation Matrix</th>
                   <th className="px-10 py-6">Target Entity</th>
                   <th className="px-10 py-6">Severity Class</th>
                </tr>
             </thead>
             <tbody className="divide-y divide-slate-50">
                {auditLogs.map(log => (
                  <tr key={log.id} className="hover:bg-slate-50/50 transition-all">
                     <td className="px-10 py-6 text-xs font-bold text-slate-400">{log.timestamp}</td>
                     <td className="px-10 py-6">
                        <div className="flex items-center gap-3">
                           <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-black text-[10px]">{log.actorName[0]}</div>
                           <span className="text-xs font-black text-slate-800">{log.actorName}</span>
                        </div>
                     </td>
                     <td className="px-10 py-6 text-xs font-bold text-slate-700">{log.action}</td>
                     <td className="px-10 py-6 text-xs font-bold text-slate-500 uppercase">{log.target}</td>
                     <td className="px-10 py-6">
                        <span className={`px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest ${
                          log.type === 'security' ? 'bg-rose-50 text-rose-600' :
                          log.type === 'financial' ? 'bg-emerald-50 text-emerald-600' :
                          'bg-indigo-50 text-indigo-600'
                        }`}>{log.type}</span>
                     </td>
                  </tr>
                ))}
             </tbody>
          </table>
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
              <div className={`absolute -bottom-2 -right-2 w-10 h-10 ${isMaintenanceMode ? 'bg-rose-500' : 'bg-emerald-500'} border-4 border-white rounded-full flex items-center justify-center text-white shadow-lg`}>
                <i className={`fas ${isMaintenanceMode ? 'fa-tools' : 'fa-check-double'} text-xs`}></i>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-4 mb-2">
                <h1 className="text-5xl font-black text-slate-900 tracking-tighter">Governance Node<span className="text-indigo-600">.</span></h1>
                <span className="px-5 py-1.5 bg-slate-950 text-white text-[10px] font-black uppercase rounded-full tracking-[0.2em]">{t.absolute_authority}</span>
              </div>
              <p className="text-slate-500 font-medium text-lg flex items-center gap-3">
                <i className="fas fa-fingerprint text-indigo-400"></i>
                Platform Operator ID: SEU-SYS-001
                <span className="mx-2 text-slate-200">|</span>
                <span className={`${isMaintenanceMode ? 'text-rose-500' : 'text-emerald-600'} font-black text-sm uppercase tracking-widest`}>Mode: {isMaintenanceMode ? 'Maintenance' : 'Production Live'}</span>
              </p>
            </div>
          </div>
          <div className="flex bg-slate-100/80 backdrop-blur p-2 rounded-[28px] border border-slate-200/40 gap-1 overflow-x-auto scrollbar-hide">
            {[
              { id: 'overview', label: t.ecosystem, icon: 'fa-brain' },
              { id: 'tenants', label: 'Tenants', icon: 'fa-building-shield' },
              { id: 'monetization', label: 'Monetization', icon: 'fa-gem' },
              { id: 'finance', label: t.treasury, icon: 'fa-receipt' },
              { id: 'logs', label: 'Audit Logs', icon: 'fa-shield-halved' },
              { id: 'settings', label: t.settings, icon: 'fa-gear' }
            ].map(tab => (
              <button 
                key={tab.id}
                onClick={() => onNavigate('super-admin', tab.id)}
                className={`flex items-center gap-3 px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                  activeTab === tab.id ? 'bg-indigo-600 text-white shadow-2xl shadow-indigo-100' : 'text-slate-500 hover:bg-white hover:text-slate-900'
                }`}
              >
                <i className={`fas ${tab.icon}`}></i>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-[1500px] mx-auto">
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'tenants' && renderTenants()}
        {activeTab === 'monetization' && renderMonetization()}
        {activeTab === 'logs' && renderLogs()}
        
        {activeTab === 'finance' && (
           <div className="space-y-10 animate-fade-up">
              <div className="grid lg:grid-cols-3 gap-10">
                 <div className="lg:col-span-2 space-y-10">
                    <div className="bg-white rounded-[48px] border border-slate-100 shadow-sm overflow-hidden">
                       <div className="p-10 border-b border-slate-50 bg-slate-50/30">
                          <h3 className="font-black text-2xl text-slate-900 tracking-tight">Settlement Queue</h3>
                       </div>
                       <div className="overflow-x-auto">
                          <table className="w-full text-left">
                             <thead>
                                <tr className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                                   <th className="px-10 py-6">Partner Entity</th>
                                   <th className="px-10 py-6 text-right">Liability (IDR)</th>
                                   <th className="px-10 py-6">Status</th>
                                   <th className="px-10 py-6 text-right">Action Protocol</th>
                                </tr>
                             </thead>
                             <tbody className="divide-y divide-slate-50">
                                {payoutRequests.map(po => (
                                  <tr key={po.id} className="hover:bg-slate-50/50 transition-all">
                                     <td className="px-10 py-8">
                                        <p className="font-black text-slate-800">{po.businessName}</p>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase">Ref: {po.id.toUpperCase()}</p>
                                     </td>
                                     <td className="px-10 py-8 text-right font-black text-slate-900">Rp {po.amount.toLocaleString()}</td>
                                     <td className="px-10 py-8">
                                        <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase border ${
                                          po.status === 'settled' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'
                                        }`}>{po.status}</span>
                                     </td>
                                     <td className="px-10 py-8 text-right">
                                        {po.status === 'pending' && (
                                          <button 
                                           onClick={() => handleProcessPayout(po.id)}
                                           disabled={po.processing}
                                           className="px-6 py-3 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all flex items-center gap-2 ml-auto"
                                          >
                                             {po.processing ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-paper-plane"></i>}
                                             {po.processing ? 'Processing...' : 'Disburse via Gateway'}
                                          </button>
                                        )}
                                     </td>
                                  </tr>
                                ))}
                             </tbody>
                          </table>
                       </div>
                    </div>
                 </div>
                 <div className="space-y-8">
                    <div className="bg-slate-950 p-10 rounded-[48px] shadow-2xl text-white relative overflow-hidden">
                       <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl -mr-32 -mt-32"></div>
                       <div className="relative z-10 space-y-8">
                          <h3 className="font-black text-2xl tracking-tight">Treasury Status</h3>
                          <div className="p-8 bg-white/5 rounded-[32px] border border-white/10 space-y-6">
                             <div className="flex justify-between items-center">
                                <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Master Gateway</span>
                                <span className="px-3 py-1 bg-emerald-500 text-white text-[9px] font-black rounded-lg uppercase">Online</span>
                             </div>
                             <div className="flex items-center gap-4">
                                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-slate-900 shadow-xl">
                                   <i className="fab fa-stripe-s text-2xl"></i>
                                </div>
                                <div>
                                   <p className="font-black text-lg">Stripe Connect</p>
                                   <p className="text-[10px] text-slate-400 uppercase tracking-widest">Platform Payout Node</p>
                                </div>
                             </div>
                          </div>
                          <button className="w-full py-5 bg-white text-slate-950 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all">Configure Security Keys</button>
                       </div>
                    </div>
                 </div>
              </div>
           </div>
        )}

        {activeTab === 'settings' && (
           <div className="grid lg:grid-cols-3 gap-10 animate-fade-up">
              <div className="lg:col-span-2 bg-white p-12 rounded-[48px] border border-slate-100 shadow-sm space-y-12">
                 <h3 className="text-4xl font-black text-slate-900 tracking-tighter">Global Node Config</h3>
                 <form className="space-y-12">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                       <div className="space-y-3">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Master Brand Identity</label>
                          <input type="text" defaultValue="SEULANGA" className="w-full bg-slate-50 border border-slate-200 rounded-3xl px-6 py-4 font-bold text-slate-900 focus:outline-none focus:ring-4 ring-indigo-50" />
                       </div>
                       <div className="space-y-3">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Legal Governance Email</label>
                          <input type="email" defaultValue="compliance@seulanga.com" className="w-full bg-slate-50 border border-slate-200 rounded-3xl px-6 py-4 font-bold text-slate-900 focus:outline-none focus:ring-4 ring-indigo-50" />
                       </div>
                    </div>
                    <div className="pt-10 border-t border-slate-50 space-y-10">
                       <h4 className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.3em]">Policy Control</h4>
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {[
                            { id: 'maintenance', label: 'Ecosystem Maintenance Mode', desc: 'Lock platform access for all non-governor roles.', checked: isMaintenanceMode, action: setIsMaintenanceMode },
                            { id: 'reg', label: 'Open Public Partner Registration', desc: 'Allow businesses to submit pre-registration KYC.', checked: true },
                            { id: 'ai', label: 'Gemini Strategy Engine', desc: 'Activate AI-driven consultant for all tenants.', checked: true },
                            { id: 'mfa', label: 'Enforce Global MFA', desc: 'Require 2FA for all प्रशासनिक accounts.', checked: false },
                          ].map(toggle => (
                            <div key={toggle.id} className="p-6 bg-slate-50 rounded-3xl border border-slate-100 flex items-center justify-between">
                               <div>
                                  <p className="text-xs font-black text-slate-900">{toggle.label}</p>
                                  <p className="text-[10px] text-slate-400 font-medium">{toggle.desc}</p>
                               </div>
                               <button 
                                type="button"
                                onClick={() => toggle.action && toggle.action(!toggle.checked)}
                                className={`w-14 h-8 rounded-full relative transition-all ${toggle.checked ? 'bg-indigo-600' : 'bg-slate-200'}`}
                               >
                                  <div className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transition-all ${toggle.checked ? 'left-7' : 'left-1'}`}></div>
                               </button>
                            </div>
                          ))}
                       </div>
                    </div>
                    <div className="pt-10 border-t border-slate-50">
                       <button type="button" className="px-12 py-5 bg-slate-950 text-white rounded-3xl font-black text-xs uppercase tracking-widest hover:bg-indigo-600 shadow-2xl transition-all">Synchronize Global Policy</button>
                    </div>
                 </form>
              </div>
              <div className="space-y-10">
                 <div className="bg-rose-50 p-10 rounded-[48px] border border-rose-100 flex flex-col items-center text-center">
                    <div className="w-20 h-20 bg-rose-500 rounded-3xl flex items-center justify-center text-white mb-8 shadow-xl shadow-rose-200">
                       <i className="fas fa-radiation text-3xl"></i>
                    </div>
                    <h4 className="font-black text-2xl text-rose-900 mb-4 tracking-tight">System Kill Switch</h4>
                    <p className="text-rose-600 font-medium mb-10 leading-relaxed text-sm">Force global logout and terminate all active database write instances. Use only in catastrophic emergency.</p>
                    <button className="w-full py-5 bg-rose-600 text-white rounded-3xl font-black text-[10px] uppercase tracking-widest hover:bg-rose-700 transition-all shadow-xl shadow-rose-100">Initiate Cluster Lock</button>
                 </div>
              </div>
           </div>
        )}
      </div>
    </div>
  );
};
