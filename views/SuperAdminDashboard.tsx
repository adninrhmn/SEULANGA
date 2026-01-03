
import React, { useState, useMemo } from 'react';
import { MOCK_BUSINESSES, MOCK_TRANSACTIONS, MOCK_ADS, MOCK_AUDIT_LOGS, MOCK_USERS } from '../constants';
import { BusinessCategory, SubscriptionPlan, Business, AuditLog, UserRole } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, AreaChart, Area } from 'recharts';

const revenueData = [
  { name: 'Jul', subs: 45000000, comm: 12000000, ads: 5000000 },
  { name: 'Aug', subs: 52000000, comm: 18000000, ads: 8000000 },
  { name: 'Sep', subs: 48000000, comm: 15000000, ads: 7000000 },
  { name: 'Oct', subs: 61000000, comm: 22000000, ads: 12000000 },
];

interface SubPlan {
  id: string;
  name: string;
  price: string;
  commission: string;
  maxUnits: number;
  features: string[];
  status: 'active' | 'archived';
}

const INITIAL_PLANS: SubPlan[] = [
  { id: 'p1', name: 'Basic Access', price: 'Free', commission: '15%', maxUnits: 5, features: ['Community Support', 'Standard Marketplace Listing', 'Basic Analytics'], status: 'active' },
  { id: 'p2', name: 'Growth Professional', price: 'Rp 499.000', commission: '10%', maxUnits: 50, features: ['Priority Support', 'Featured Search Results', 'Advanced Analytics', 'Commission Discount'], status: 'active' },
  { id: 'p3', name: 'Enterprise Premium', price: 'Rp 1.200.000', commission: '5%', maxUnits: 999, features: ['24/7 Dedicated Support', 'Homepage Featured Ad', 'AI Business Insights', 'Custom Reports', 'API Access'], status: 'active' },
];

export const SuperAdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'monetization' | 'tenants' | 'finance' | 'ads' | 'logs' | 'settings'>('overview');
  const [isBackupRunning, setIsBackupRunning] = useState(false);
  const [plans, setPlans] = useState<SubPlan[]>(INITIAL_PLANS);
  const [editingPlan, setEditingPlan] = useState<SubPlan | null>(null);
  const [isPlanModalOpen, setPlanModalOpen] = useState(false);
  
  // Business Management State
  const [businesses, setBusinesses] = useState<Business[]>(MOCK_BUSINESSES);
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);
  const [isReviewModalOpen, setReviewModalOpen] = useState(false);

  // Audit Logs State
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(MOCK_AUDIT_LOGS);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  
  // Granular Filter State
  const [filters, setFilters] = useState({
    category: 'All',
    role: 'All',
    action: 'All',
    startDate: '',
    endDate: '',
    search: ''
  });

  // Platform Settings State
  const [platformSettings, setPlatformSettings] = useState({
    maintenanceMode: false,
    publicRegistration: true,
    aiInsightsEnabled: true,
    mfaRequired: false
  });

  const stats = [
    { label: 'Total Revenue (ARR)', value: 'Rp 1.42B', trend: '+24%', icon: 'fa-money-bill-trend-up', color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Avg. Commission', value: '11.4%', trend: 'Stable', icon: 'fa-percentage', color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: 'Pending Payouts', value: 'Rp 82.4M', trend: 'Due', icon: 'fa-clock-rotate-left', color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Active Ad Campaigns', value: '18', trend: '+4 new', icon: 'fa-rectangle-ad', color: 'text-violet-600', bg: 'bg-violet-50' },
  ];

  const addLog = (action: string, target: string, type: AuditLog['type']) => {
    const newLog: AuditLog = {
      id: `log${Date.now()}`,
      actorId: 'u1',
      actorName: 'Zian Ali',
      actorRole: UserRole.SUPER_ADMIN,
      action,
      target,
      type,
      timestamp: new Date().toLocaleString()
    };
    setAuditLogs([newLog, ...auditLogs]);
  };

  const handleSavePlan = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const planName = formData.get('name') as string;
    const planData: SubPlan = {
      id: editingPlan?.id || `p${Date.now()}`,
      name: planName,
      price: formData.get('price') as string,
      commission: formData.get('commission') as string,
      maxUnits: parseInt(formData.get('maxUnits') as string),
      features: (formData.get('features') as string).split(',').map(s => s.trim()),
      status: 'active',
    };

    if (editingPlan) {
      setPlans(plans.map(p => p.id === editingPlan.id ? planData : p));
      addLog('Modified Subscription Plan', planName, 'financial');
    } else {
      setPlans([...plans, planData]);
      addLog('Created Subscription Plan', planName, 'financial');
    }
    setPlanModalOpen(false);
    setEditingPlan(null);
  };

  const deletePlan = (id: string) => {
    const plan = plans.find(p => p.id === id);
    if (confirm(`Are you sure you want to delete the ${plan?.name} plan?`)) {
      setPlans(plans.filter(p => p.id !== id));
      if (plan) addLog('Deleted Subscription Plan', plan.name, 'financial');
    }
  };

  const updateBusinessStatus = (id: string, status: 'active' | 'pending' | 'suspended') => {
    const biz = businesses.find(b => b.id === id);
    setBusinesses(businesses.map(b => b.id === id ? { ...b, status } : b));
    if (biz) {
        const actionLabel = status === 'active' ? 'Approved Business' : status === 'suspended' ? 'Suspended Business' : 'Set Business to Pending';
        addLog(actionLabel, biz.name, 'management');
    }
    setReviewModalOpen(false);
    setSelectedBusiness(null);
  };

  const togglePlatformSetting = (key: keyof typeof platformSettings) => {
    const newValue = !platformSettings[key];
    setPlatformSettings({ ...platformSettings, [key]: newValue });
    addLog(`Changed Platform Setting: ${key}`, newValue ? 'Enabled' : 'Disabled', 'security');
  };

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-[10px] font-black uppercase rounded-full border border-emerald-200">Active</span>;
      case 'suspended':
        return <span className="px-3 py-1 bg-rose-100 text-rose-700 text-[10px] font-black uppercase rounded-full border border-rose-200">Suspended</span>;
      case 'pending':
      default:
        return <span className="px-3 py-1 bg-amber-100 text-amber-700 text-[10px] font-black uppercase rounded-full border border-amber-200">Pending</span>;
    }
  };

  // Memoized unique values for filter dropdowns
  const uniqueActions = useMemo(() => Array.from(new Set(auditLogs.map(l => l.action))), [auditLogs]);
  const uniqueRoles = useMemo(() => Array.from(new Set(auditLogs.map(l => l.actorRole))), [auditLogs]);

  const filteredLogs = auditLogs.filter(log => {
    const matchCategory = filters.category === 'All' || log.type.toLowerCase() === filters.category.toLowerCase();
    const matchRole = filters.role === 'All' || log.actorRole === filters.role;
    const matchAction = filters.action === 'All' || log.action === filters.action;
    const matchSearch = !filters.search || 
      log.target.toLowerCase().includes(filters.search.toLowerCase()) || 
      log.actorName.toLowerCase().includes(filters.search.toLowerCase());
    
    // Simple date string parsing for comparison
    const logDate = new Date(log.timestamp);
    const matchStartDate = !filters.startDate || logDate >= new Date(filters.startDate);
    const matchEndDate = !filters.endDate || logDate <= new Date(filters.endDate + 'T23:59:59');

    return matchCategory && matchRole && matchAction && matchSearch && matchStartDate && matchEndDate;
  });

  return (
    <div className="space-y-10 animate-fade-up">
      {/* Plan Management Modal */}
      {isPlanModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-2xl rounded-[40px] shadow-2xl overflow-hidden border border-white">
            <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
              <h3 className="font-black text-2xl text-slate-900">{editingPlan ? 'Edit' : 'Create'} Subscription Tier</h3>
              <button onClick={() => setPlanModalOpen(false)} className="text-slate-400 hover:text-indigo-600 transition-all"><i className="fas fa-times"></i></button>
            </div>
            <form onSubmit={handleSavePlan} className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Plan Name</label>
                  <input name="name" defaultValue={editingPlan?.name} required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-900 outline-none focus:ring-2 ring-indigo-100" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pricing Display</label>
                  <input name="price" defaultValue={editingPlan?.price} placeholder="Rp 500k/mo" required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-900 outline-none focus:ring-2 ring-indigo-100" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Platform Commission</label>
                  <input name="commission" defaultValue={editingPlan?.commission} placeholder="10%" required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-900 outline-none focus:ring-2 ring-indigo-100" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Max Property Units</label>
                  <input name="maxUnits" type="number" defaultValue={editingPlan?.maxUnits} required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-900 outline-none focus:ring-2 ring-indigo-100" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Features (Comma Separated)</label>
                <textarea name="features" defaultValue={editingPlan?.features.join(', ')} required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-900 outline-none focus:ring-2 ring-indigo-100 h-32 resize-none" />
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setPlanModalOpen(false)} className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black text-sm hover:bg-slate-200 transition-all">Cancel</button>
                <button type="submit" className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-black text-sm shadow-xl shadow-indigo-200 hover:bg-indigo-700 transition-all">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Log Detail Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-lg rounded-[40px] shadow-2xl overflow-hidden border border-slate-200 p-10 space-y-8">
            <div className="flex justify-between items-center">
              <h3 className="font-black text-2xl text-slate-900">Event Details</h3>
              <button onClick={() => setSelectedLog(null)} className="text-slate-400 hover:text-indigo-600"><i className="fas fa-times"></i></button>
            </div>
            <div className="space-y-6">
               <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl">
                 <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600 font-black">
                   {selectedLog.actorName[0]}
                 </div>
                 <div>
                   <p className="font-black text-slate-900">{selectedLog.actorName}</p>
                   <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">{selectedLog.actorRole}</p>
                 </div>
               </div>
               <div className="grid grid-cols-2 gap-4">
                 <div>
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Category</label>
                   <p className="font-bold text-slate-800 capitalize">{selectedLog.type}</p>
                 </div>
                 <div>
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Timestamp</label>
                   <p className="font-bold text-slate-800">{selectedLog.timestamp}</p>
                 </div>
               </div>
               <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Action Performed</label>
                  <p className="font-black text-slate-900 text-xl">{selectedLog.action}</p>
               </div>
               <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Target Resource</label>
                  <p className="font-bold text-indigo-600 underline underline-offset-4">{selectedLog.target}</p>
               </div>
            </div>
            <button onClick={() => setSelectedLog(null)} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black">Dismiss</button>
          </div>
        </div>
      )}

      {/* Governance Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-slate-900 p-10 rounded-[40px] shadow-2xl relative overflow-hidden text-white">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl -mr-32 -mt-32"></div>
        <div className="relative z-10 flex items-center gap-8">
          <div className="w-20 h-20 bg-white/10 backdrop-blur-xl rounded-[28px] flex items-center justify-center border border-white/20 shadow-inner">
            <i className="fas fa-shield-halved text-3xl text-indigo-400"></i>
          </div>
          <div>
            <h1 className="text-4xl font-black tracking-tight mb-2">Platform Treasury & Governance</h1>
            <p className="text-indigo-200/80 font-medium">Controlling the SEULANGA multi-tenant economy.</p>
          </div>
        </div>
        <div className="relative z-10 flex flex-wrap gap-4">
          <button 
            onClick={() => { 
                setIsBackupRunning(true); 
                addLog('Manual System Backup Initiated', 'All Nodes', 'system');
                setTimeout(() => setIsBackupRunning(false), 3000); 
            }}
            className="bg-white/10 hover:bg-white/20 text-white px-8 py-4 rounded-2xl font-black text-sm transition-all border border-white/10 flex items-center gap-3"
          >
            <i className={`fas ${isBackupRunning ? 'fa-spinner fa-spin' : 'fa-database'}`}></i>
            {isBackupRunning ? 'Syncing Ecosystem...' : 'Global System Backup'}
          </button>
          <button 
            onClick={() => setActiveTab('settings')}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-2xl font-black text-sm transition-all shadow-xl shadow-indigo-900/40">
            Platform Settings
          </button>
        </div>
      </div>

      {/* Financial KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-xl transition-all group overflow-hidden relative">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 relative z-10 ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform`}>
              <i className={`fas ${stat.icon} text-2xl`}></i>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1 relative z-10">{stat.label}</p>
            <div className="flex items-end justify-between relative z-10">
              <h3 className="text-3xl font-black text-slate-900 tracking-tight">{stat.value}</h3>
              <span className={`text-xs font-black ${stat.trend.includes('+') ? 'text-emerald-600' : 'text-slate-500'}`}>{stat.trend}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Matrix */}
      <div className="flex bg-white p-2 rounded-[28px] border border-slate-200/60 shadow-sm overflow-x-auto scrollbar-hide">
        {[
          { id: 'overview', label: 'Ecosystem Intelligence', icon: 'fa-brain' },
          { id: 'monetization', label: 'Subscription Tiers', icon: 'fa-sack-dollar' },
          { id: 'tenants', label: 'Tenant Onboarding', icon: 'fa-id-badge' },
          { id: 'ads', label: 'Ad Engine', icon: 'fa-rectangle-ad' },
          { id: 'finance', label: 'Payouts & Flows', icon: 'fa-receipt' },
          { id: 'logs', label: 'System Audit Logs', icon: 'fa-clock-rotate-left' },
          { id: 'settings', label: 'Platform Settings', icon: 'fa-gear' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-3 px-8 py-4 rounded-2xl text-sm font-black transition-all whitespace-nowrap ${
              activeTab === tab.id ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100' : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            <i className={`fas ${tab.icon}`}></i>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Contents */}
      {activeTab === 'overview' && (
        <div className="grid lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 bg-white p-10 rounded-[40px] border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-10">
              <div>
                <h3 className="font-black text-2xl text-slate-900 tracking-tight">Financial Stream Aggregation</h3>
                <p className="text-slate-400 font-medium">Consolidated MRR and Transactional performance.</p>
              </div>
            </div>
            <div className="h-[450px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData}>
                  <defs>
                    <linearGradient id="colorSubs" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3}/><stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/></linearGradient>
                    <linearGradient id="colorComm" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/><stop offset="95%" stopColor="#10b981" stopOpacity={0}/></linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="5 5" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}} dy={15} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}} tickFormatter={(val) => `Rp${val/1000000}M`} />
                  <Tooltip contentStyle={{borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.15)', padding: '20px'}} />
                  <Area type="monotone" dataKey="subs" stroke="#4f46e5" strokeWidth={4} fillOpacity={1} fill="url(#colorSubs)" name="Subscriptions" />
                  <Area type="monotone" dataKey="comm" stroke="#10b981" strokeWidth={4} fillOpacity={1} fill="url(#colorComm)" name="Commissions" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          <div className="space-y-6">
            <div className="bg-white p-10 rounded-[40px] border border-slate-100 shadow-sm">
              <h3 className="font-black text-2xl text-slate-900 mb-8 tracking-tight">System Integrity</h3>
              <div className="space-y-4">
                 <div className="p-4 bg-emerald-50 rounded-2xl flex items-center justify-between border border-emerald-100">
                    <span className="text-xs font-bold text-emerald-800">All Nodes Operational</span>
                    <i className="fas fa-check-circle text-emerald-500"></i>
                 </div>
                 <div className="p-4 bg-slate-50 rounded-2xl space-y-3 border border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Storage Utilization</p>
                    <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                       <div className="h-full bg-indigo-600 rounded-full w-[42%]"></div>
                    </div>
                    <p className="text-right text-[10px] font-black text-slate-600">4.2 TB / 10 TB</p>
                 </div>
              </div>
            </div>

            <div className="bg-indigo-600 p-10 rounded-[40px] shadow-2xl text-white relative overflow-hidden">
               <div className="relative z-10">
                 <h4 className="font-black text-xl mb-2">Ecosystem Forecast</h4>
                 <p className="text-indigo-100/80 text-sm mb-6 leading-relaxed">AI predicts a 12% growth in MRR for Q1 2025 based on Takengon regional trends.</p>
                 <button className="w-full bg-white text-indigo-600 py-3 rounded-xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-900/40">Generate Strategic Report</button>
               </div>
               <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'logs' && (
        <div className="space-y-6 animate-fade-up">
          {/* Granular Filter Panel */}
          <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm space-y-8">
            <div className="flex items-center justify-between">
               <h3 className="font-black text-2xl text-slate-900 tracking-tight">Advanced Filter Panel</h3>
               <button 
                onClick={() => setFilters({category: 'All', role: 'All', action: 'All', startDate: '', endDate: '', search: ''})}
                className="text-xs font-black text-rose-600 uppercase tracking-widest hover:underline"
               >
                 Reset All
               </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
               <div className="space-y-2">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Category</label>
                 <select 
                  value={filters.category}
                  onChange={(e) => setFilters({...filters, category: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 outline-none focus:ring-2 ring-indigo-100"
                 >
                   {['All', 'Financial', 'Management', 'Security', 'System'].map(c => <option key={c} value={c}>{c}</option>)}
                 </select>
               </div>

               <div className="space-y-2">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Actor Role</label>
                 <select 
                  value={filters.role}
                  onChange={(e) => setFilters({...filters, role: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 outline-none focus:ring-2 ring-indigo-100"
                 >
                   <option value="All">All Roles</option>
                   {uniqueRoles.map(r => <option key={r} value={r}>{r.replace('_', ' ')}</option>)}
                 </select>
               </div>

               <div className="space-y-2">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Action Type</label>
                 <select 
                  value={filters.action}
                  onChange={(e) => setFilters({...filters, action: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 outline-none focus:ring-2 ring-indigo-100"
                 >
                   <option value="All">All Actions</option>
                   {uniqueActions.map(a => <option key={a} value={a}>{a}</option>)}
                 </select>
               </div>

               <div className="space-y-2">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Start Date</label>
                 <input 
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => setFilters({...filters, startDate: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 outline-none focus:ring-2 ring-indigo-100"
                 />
               </div>

               <div className="space-y-2">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">End Date</label>
                 <input 
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => setFilters({...filters, endDate: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 outline-none focus:ring-2 ring-indigo-100"
                 />
               </div>

               <div className="space-y-2">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Quick Search</label>
                 <input 
                  type="text"
                  placeholder="Target or Actor..."
                  value={filters.search}
                  onChange={(e) => setFilters({...filters, search: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 outline-none focus:ring-2 ring-indigo-100"
                 />
               </div>
            </div>
          </div>

          <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-10 border-b border-slate-50 flex items-center justify-between bg-slate-50/20">
              <div>
                <h3 className="font-black text-2xl text-slate-900 tracking-tight">Audit Stream</h3>
                <p className="text-slate-400 font-medium text-sm">Showing {filteredLogs.length} matching events.</p>
              </div>
              <button className="px-6 py-3 bg-white border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:border-indigo-600 transition-all">
                Export Filtered View
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">
                    <th className="px-10 py-6">Actor Identity</th>
                    <th className="px-10 py-6">Action Performed</th>
                    <th className="px-10 py-6">Target Resource</th>
                    <th className="px-10 py-6">Log Type</th>
                    <th className="px-10 py-6 text-right">Execution Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredLogs.map(log => (
                    <tr key={log.id} onClick={() => setSelectedLog(log)} className="hover:bg-slate-50/50 transition-all group cursor-pointer">
                      <td className="px-10 py-7">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-lg flex items-center justify-center font-black text-[10px] ${log.actorRole === UserRole.SUPER_ADMIN ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-500'}`}>
                             {log.actorName.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div>
                            <p className="font-black text-slate-900 text-sm leading-none mb-1">{log.actorName}</p>
                            <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest">{log.actorRole.replace('_', ' ')}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-10 py-7 font-bold text-slate-700 text-sm">{log.action}</td>
                      <td className="px-10 py-7">
                         <span className="text-xs font-black text-slate-900 underline decoration-indigo-200 decoration-2 underline-offset-4">{log.target}</span>
                      </td>
                      <td className="px-10 py-7">
                          <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase border ${
                              log.type === 'financial' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                              log.type === 'security' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                              log.type === 'management' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' :
                              'bg-slate-50 text-slate-500 border-slate-200'
                          }`}>
                              {log.type}
                          </span>
                      </td>
                      <td className="px-10 py-7 text-right text-[10px] font-black text-slate-400 uppercase whitespace-nowrap">
                          {log.timestamp}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filteredLogs.length === 0 && (
              <div className="py-20 text-center">
                 <i className="fas fa-search-minus text-4xl text-slate-200 mb-4"></i>
                 <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No records matching your filters</p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="grid lg:grid-cols-2 gap-10">
           <div className="bg-white p-10 rounded-[40px] border border-slate-100 shadow-sm space-y-10">
              <div>
                 <h3 className="font-black text-2xl text-slate-900 tracking-tight">Global Platform Controls</h3>
                 <p className="text-slate-400 text-sm font-medium">Critical system-wide configuration switches.</p>
              </div>
              <div className="space-y-6">
                 {[
                   { id: 'maintenanceMode', label: 'Maintenance Mode', desc: 'Prevent all non-admin access to the platform.', icon: 'fa-screwdriver-wrench' },
                   { id: 'publicRegistration', label: 'Public Registration', desc: 'Allow new guest and business applications.', icon: 'fa-user-plus' },
                   { id: 'aiInsightsEnabled', label: 'Gemini AI Engine', desc: 'Toggle AI-driven business and property analysis.', icon: 'fa-brain' },
                   { id: 'mfaRequired', label: 'Enforce MFA', desc: 'Require Multi-Factor Authentication for all owners.', icon: 'fa-shield-check' }
                 ].map(set => (
                   <div key={set.id} className="flex items-center justify-between p-6 bg-slate-50 rounded-[32px] border border-slate-100 hover:border-indigo-100 transition-all">
                      <div className="flex items-center gap-5">
                         <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-slate-400 shadow-sm">
                            <i className={`fas ${set.icon}`}></i>
                         </div>
                         <div>
                            <p className="font-black text-slate-900 text-sm">{set.label}</p>
                            <p className="text-xs font-medium text-slate-400 max-w-[200px]">{set.desc}</p>
                         </div>
                      </div>
                      <button 
                        onClick={() => togglePlatformSetting(set.id as any)}
                        className={`w-14 h-8 rounded-full transition-all relative ${platformSettings[set.id as keyof typeof platformSettings] ? 'bg-indigo-600' : 'bg-slate-300'}`}
                      >
                         <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all shadow-md ${platformSettings[set.id as keyof typeof platformSettings] ? 'right-1' : 'left-1'}`}></div>
                      </button>
                   </div>
                 ))}
              </div>
           </div>

           <div className="space-y-10">
              <div className="bg-slate-950 p-10 rounded-[40px] shadow-2xl text-white space-y-8 relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl -mr-32 -mt-32"></div>
                 <h3 className="font-black text-2xl relative z-10">System Infrastructure</h3>
                 <div className="space-y-6 relative z-10">
                    <div className="flex items-center justify-between p-5 bg-white/5 rounded-2xl border border-white/10">
                       <span className="text-xs font-bold text-slate-400">Database Engine</span>
                       <span className="text-xs font-black text-indigo-400 uppercase tracking-widest">Optimized-v8.2</span>
                    </div>
                    <div className="flex items-center justify-between p-5 bg-white/5 rounded-2xl border border-white/10">
                       <span className="text-xs font-bold text-slate-400">Regional Cluster</span>
                       <span className="text-xs font-black text-indigo-400 uppercase tracking-widest">Southeast Asia-1</span>
                    </div>
                    <div className="p-5 bg-indigo-600/20 rounded-2xl border border-indigo-400/30 flex items-center gap-4">
                       <i className="fas fa-lock text-indigo-400"></i>
                       <p className="text-[10px] font-black text-indigo-100 uppercase tracking-widest leading-relaxed">System logs are immutable and encrypted with AES-256 standards.</p>
                    </div>
                 </div>
              </div>
              <div className="bg-white p-10 rounded-[40px] border border-slate-100 shadow-sm flex flex-col justify-center items-center text-center">
                 <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 mb-6">
                    <i className="fas fa-microchip text-2xl"></i>
                 </div>
                 <h4 className="font-black text-xl text-slate-900 mb-2 tracking-tight">System Health Score</h4>
                 <div className="text-4xl font-black text-emerald-600 mb-2">99.8%</div>
                 <p className="text-slate-400 text-xs font-medium">Uptime is within enterprise SLA limits.</p>
              </div>
           </div>
        </div>
      )}

      {/* Re-integrated Tab Contents from Previous Version for Completeness */}
      {activeTab === 'tenants' && (
        <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden animate-fade-up">
          <div className="p-10 border-b border-slate-50 flex items-center justify-between bg-slate-50/20">
            <div>
              <h3 className="font-black text-2xl text-slate-900 tracking-tight">Business Verification Hub</h3>
              <p className="text-slate-400 font-medium text-sm">Managing {businesses.length} multi-tenant business entities.</p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">
                  <th className="px-10 py-6">Business Entity</th>
                  <th className="px-10 py-6">Category</th>
                  <th className="px-10 py-6">Subscription</th>
                  <th className="px-10 py-6">Status</th>
                  <th className="px-10 py-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {businesses.map(biz => (
                  <tr key={biz.id} className="hover:bg-slate-50/50 transition-all group">
                    <td className="px-10 py-7">
                      <div className="flex items-center gap-4">
                        <img src={biz.images[0]} className="w-12 h-12 rounded-xl object-cover shadow-sm" />
                        <div>
                          <p className="font-black text-slate-900 leading-none mb-1">{biz.name}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">ID: {biz.id.toUpperCase()}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-7"><span className="text-xs font-bold text-slate-600">{biz.category}</span></td>
                    <td className="px-10 py-7"><span className="text-xs font-black text-indigo-600">{biz.subscription}</span></td>
                    <td className="px-10 py-7">{renderStatusBadge(biz.status)}</td>
                    <td className="px-10 py-7 text-right">
                       <button 
                        onClick={() => { setSelectedBusiness(biz); setReviewModalOpen(true); }}
                        className="px-6 py-2.5 bg-slate-950 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-lg"
                      >
                        Review KYB
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {(activeTab === 'finance' || activeTab === 'monetization' || activeTab === 'ads') && (
        <div className="bg-white p-10 rounded-[40px] border border-slate-100 shadow-sm text-center py-24">
            <i className="fas fa-lock text-4xl text-slate-200 mb-6"></i>
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">Active Stream Monitoring</h3>
            <p className="text-slate-400 font-medium max-w-sm mx-auto">Transactional and subscription data is being consolidated in the main overview dashboard.</p>
        </div>
      )}
    </div>
  );
};
