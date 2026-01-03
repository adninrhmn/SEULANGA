
import React, { useState, useMemo } from 'react';
import { MOCK_BUSINESSES, MOCK_TRANSACTIONS, MOCK_ADS, MOCK_AUDIT_LOGS, MOCK_USERS } from '../constants';
import { BusinessCategory, SubscriptionPlan, Business, AuditLog, UserRole, BusinessStatus } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, AreaChart, Area, PieChart, Pie, Cell, Legend } from 'recharts';

const revenueData = [
  { name: 'Jul', subs: 45000000, comm: 12000000, ads: 5000000, mrr: 62000000 },
  { name: 'Aug', subs: 52000000, comm: 18000000, ads: 8000000, mrr: 78000000 },
  { name: 'Sep', subs: 48000000, comm: 15000000, ads: 7000000, mrr: 70000000 },
  { name: 'Oct', subs: 61000000, comm: 22000000, ads: 12000000, mrr: 95000000 },
  { name: 'Nov', subs: 68000000, comm: 25000000, ads: 15000000, mrr: 108000000 },
  { name: 'Dec', subs: 85000000, comm: 32000000, ads: 20000000, mrr: 137000000 },
];

const userGrowthData = [
  { month: 'Jul', users: 850, partners: 42 },
  { month: 'Aug', users: 1100, partners: 58 },
  { month: 'Sep', users: 1450, partners: 75 },
  { month: 'Oct', users: 1900, partners: 92 },
  { month: 'Nov', users: 2400, partners: 115 },
  { month: 'Dec', users: 3100, partners: 148 },
];

const subDistribution = [
  { name: 'Basic', value: 45, color: '#94a3b8' },
  { name: 'Pro', value: 35, color: '#6366f1' },
  { name: 'Premium', value: 20, color: '#4f46e5' },
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
  const [activeTab, setActiveTab] = useState<'overview' | 'analytics' | 'monetization' | 'tenants' | 'finance' | 'ads' | 'logs' | 'settings'>('overview');
  const [isBackupRunning, setIsBackupRunning] = useState(false);
  const [plans, setPlans] = useState<SubPlan[]>(INITIAL_PLANS);
  const [editingPlan, setEditingPlan] = useState<SubPlan | null>(null);
  const [isPlanModalOpen, setPlanModalOpen] = useState(false);
  
  // Business Management State
  const [businesses, setBusinesses] = useState<Business[]>(MOCK_BUSINESSES.map(b => ({
    ...b,
    registrationDate: b.registrationDate || '2024-10-01'
  })));
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);
  const [isReviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedBusinessIds, setSelectedBusinessIds] = useState<string[]>([]);
  
  // Tenant Specific Filters
  const [tenantFilters, setTenantFilters] = useState({
    category: 'All',
    status: 'All',
    search: ''
  });

  // Audit Logs State
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(MOCK_AUDIT_LOGS);
  
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

  const updateBusinessStatus = (id: string, status: BusinessStatus) => {
    const biz = businesses.find(b => b.id === id);
    setBusinesses(businesses.map(b => b.id === id ? { ...b, status } : b));
    if (biz) {
        let actionLabel = 'Updated Status';
        if (status === 'active') actionLabel = 'Approved Business';
        else if (status === 'rejected') actionLabel = 'Rejected Registration';
        else if (status === 'info_requested') actionLabel = 'Requested More Information';
        else if (status === 'suspended') actionLabel = 'Suspended Business';
        
        addLog(actionLabel, biz.name, 'management');
    }
    setReviewModalOpen(false);
    setSelectedBusiness(null);
  };

  const handleBulkApprovePending = () => {
    const pendingIds = businesses.filter(b => b.status === 'pending').map(b => b.id);
    if (pendingIds.length === 0) return;
    
    setBusinesses(businesses.map(b => b.status === 'pending' ? { ...b, status: 'active' } : b));
    addLog('Bulk Approved Pending Businesses', `${pendingIds.length} entities`, 'management');
    setSelectedBusinessIds([]);
  };

  const toggleSelectBusiness = (id: string) => {
    setSelectedBusinessIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAllBusinesses = () => {
    if (selectedBusinessIds.length === filteredBusinesses.length && filteredBusinesses.length > 0) {
      setSelectedBusinessIds([]);
    } else {
      setSelectedBusinessIds(filteredBusinesses.map(b => b.id));
    }
  };

  const renderStatusBadge = (status: BusinessStatus) => {
    switch (status) {
      case 'active':
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase rounded-full border border-emerald-100 shadow-sm">
            <i className="fas fa-check-circle text-[8px]"></i> Approved
          </span>
        );
      case 'rejected':
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 bg-rose-50 text-rose-600 text-[10px] font-black uppercase rounded-full border border-rose-100 shadow-sm">
            <i className="fas fa-times-circle text-[8px]"></i> Rejected
          </span>
        );
      case 'suspended':
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-500 text-[10px] font-black uppercase rounded-full border border-slate-200 shadow-sm">
            <i className="fas fa-ban text-[8px]"></i> Suspended
          </span>
        );
      case 'info_requested':
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase rounded-full border border-indigo-100 shadow-sm">
            <i className="fas fa-question-circle text-[8px]"></i> Pending Info Request
          </span>
        );
      case 'pending':
      default:
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-600 text-[10px] font-black uppercase rounded-full border border-amber-100 shadow-sm">
            <i className="fas fa-clock text-[8px]"></i> Pending Review
          </span>
        );
    }
  };

  const filteredBusinesses = useMemo(() => {
    return businesses.filter(b => {
      const matchCategory = tenantFilters.category === 'All' || b.category === tenantFilters.category;
      const matchStatus = tenantFilters.status === 'All' || b.status === tenantFilters.status.toLowerCase();
      const matchSearch = !tenantFilters.search || 
        b.name.toLowerCase().includes(tenantFilters.search.toLowerCase()) || 
        b.id.toLowerCase().includes(tenantFilters.search.toLowerCase());
      return matchCategory && matchStatus && matchSearch;
    });
  }, [businesses, tenantFilters]);

  const renderAnalytics = () => (
    <div className="space-y-10 animate-fade-up">
      {/* Analytics KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Businesses', value: businesses.length, trend: '+8.5%', icon: 'fa-building-circle-check', color: 'text-indigo-600', bg: 'bg-indigo-50' },
          { label: 'Active Users', value: '3,100', trend: '+12.4%', icon: 'fa-users', color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Monthly Revenue', value: 'Rp 137M', trend: '+15.2%', icon: 'fa-chart-line', color: 'text-violet-600', bg: 'bg-violet-50' },
          { label: 'Subscription Rate', value: '78%', trend: '+3.1%', icon: 'fa-calendar-check', color: 'text-amber-600', bg: 'bg-amber-50' },
        ].map((kpi, i) => (
          <div key={i} className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-lg transition-all">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 ${kpi.bg} ${kpi.color}`}>
              <i className={`fas ${kpi.icon} text-xl`}></i>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{kpi.label}</p>
            <div className="flex items-end justify-between">
               <h3 className="text-3xl font-black text-slate-900 tracking-tight">{kpi.value}</h3>
               <span className="text-xs font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">{kpi.trend}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* MRR Trends Chart */}
        <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="font-black text-xl text-slate-900 tracking-tight">MRR Growth Trends</h3>
              <p className="text-slate-400 text-xs font-medium">Monthly Recurring Revenue over last 6 months.</p>
            </div>
            <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
              <i className="fas fa-sack-dollar"></i>
            </div>
          </div>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="colorMrr" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="5 5" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}} tickFormatter={(val) => `${val/1000000}M`} />
                <Tooltip contentStyle={{borderRadius: '20px', border: 'none', boxShadow: '0 20px 40px -10px rgba(0,0,0,0.1)'}} />
                <Area type="monotone" dataKey="mrr" stroke="#4f46e5" strokeWidth={4} fillOpacity={1} fill="url(#colorMrr)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* User Growth Chart */}
        <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="font-black text-xl text-slate-900 tracking-tight">Ecosystem Population</h3>
              <p className="text-slate-400 text-xs font-medium">Growth of Guests and Business Partners.</p>
            </div>
            <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
              <i className="fas fa-users-line"></i>
            </div>
          </div>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={userGrowthData}>
                <CartesianGrid strokeDasharray="5 5" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}} />
                <Tooltip contentStyle={{borderRadius: '20px', border: 'none', boxShadow: '0 20px 40px -10px rgba(0,0,0,0.1)'}} />
                <Legend iconType="circle" wrapperStyle={{fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', paddingTop: '20px'}} />
                <Line type="monotone" dataKey="users" name="Total Guests" stroke="#4f46e5" strokeWidth={4} dot={{r: 4, strokeWidth: 2, fill: '#fff'}} activeDot={{r: 6}} />
                <Line type="monotone" dataKey="partners" name="Business Partners" stroke="#10b981" strokeWidth={4} dot={{r: 4, strokeWidth: 2, fill: '#fff'}} activeDot={{r: 6}} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Subscription Tier Distribution */}
        <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="font-black text-xl text-slate-900 tracking-tight">Subscription Tier Matrix</h3>
              <p className="text-slate-400 text-xs font-medium">Active plan distribution across the platform.</p>
            </div>
            <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
              <i className="fas fa-crown"></i>
            </div>
          </div>
          <div className="h-[300px] flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={subDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={100}
                  paddingAngle={8}
                  dataKey="value"
                >
                  {subDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{borderRadius: '20px', border: 'none'}} />
                <Legend iconType="circle" layout="vertical" align="right" verticalAlign="middle" wrapperStyle={{fontSize: '10px', fontWeight: 'bold'}} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Share */}
        <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="font-black text-xl text-slate-900 tracking-tight">Business Category Share</h3>
              <p className="text-slate-400 text-xs font-medium">Percentage of businesses by industry type.</p>
            </div>
            <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
              <i className="fas fa-tags"></i>
            </div>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={[
                { name: 'Hotel', count: 42 },
                { name: 'Homestay', count: 28 },
                { name: 'Kost', count: 54 },
                { name: 'Rental', count: 12 },
                { name: 'Sales', count: 8 },
              ]}>
                <CartesianGrid strokeDasharray="5 5" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}} dy={10} />
                <YAxis hide />
                <Tooltip cursor={{fill: 'transparent'}} contentStyle={{borderRadius: '20px', border: 'none'}} />
                <Bar dataKey="count" fill="#6366f1" radius={[10, 10, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );

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
          { id: 'analytics', label: 'Platform Analytics', icon: 'fa-chart-pie' },
          { id: 'monetization', label: 'Subscription Tiers', icon: 'fa-sack-dollar' },
          { id: 'tenants', label: 'Tenant Onboarding', icon: 'fa-id-badge' },
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
          </div>
        </div>
      )}

      {activeTab === 'analytics' && renderAnalytics()}

      {activeTab === 'tenants' && (
        <div className="space-y-8 animate-fade-up">
          {/* Tenant Onboarding Filtering Panel */}
          <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm space-y-8">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-2xl text-slate-900 tracking-tight">Tenant Onboarding Filters</h3>
              <button 
                onClick={() => setTenantFilters({category: 'All', status: 'All', search: ''})}
                className="text-xs font-black text-indigo-600 uppercase tracking-widest hover:underline"
              >
                Clear Filters
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Business Category</label>
                <select 
                  value={tenantFilters.category}
                  onChange={(e) => setTenantFilters({...tenantFilters, category: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-700 outline-none focus:ring-4 ring-indigo-50 transition-all"
                >
                  <option value="All">All Categories</option>
                  {Object.values(BusinessCategory).map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Verification Status</label>
                <select 
                  value={tenantFilters.status}
                  onChange={(e) => setTenantFilters({...tenantFilters, status: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-700 outline-none focus:ring-4 ring-indigo-50 transition-all"
                >
                  <option value="All">All Statuses</option>
                  <option value="active">Approved</option>
                  <option value="pending">Pending Review</option>
                  <option value="rejected">Rejected</option>
                  <option value="info_requested">Pending Info Request</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Global Search</label>
                <div className="relative">
                  <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm"></i>
                  <input 
                    type="text" 
                    placeholder="Search name or ID..."
                    value={tenantFilters.search}
                    onChange={(e) => setTenantFilters({...tenantFilters, search: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-11 pr-4 font-bold text-slate-700 outline-none focus:ring-4 ring-indigo-50 transition-all"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-10 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-slate-50/20">
              <div>
                <h3 className="font-black text-2xl text-slate-900 tracking-tight">Tenant Onboarding Ledger</h3>
                <p className="text-slate-400 font-medium text-sm">Reviewing {filteredBusinesses.length} business registration applications.</p>
              </div>
              
              <div className="flex flex-wrap gap-3">
                <button 
                  onClick={handleBulkApprovePending}
                  className="px-6 py-3 bg-emerald-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 transition-all flex items-center gap-2 shadow-lg shadow-emerald-100"
                >
                  <i className="fas fa-check-double"></i> Bulk Approve Pending
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">
                    <th className="px-10 py-6 w-12">
                      <input 
                        type="checkbox" 
                        checked={selectedBusinessIds.length === filteredBusinesses.length && filteredBusinesses.length > 0} 
                        onChange={toggleSelectAllBusinesses}
                        className="w-5 h-5 rounded-md border-slate-300 text-indigo-600 focus:ring-indigo-500"
                      />
                    </th>
                    <th className="px-10 py-6">Business Entity</th>
                    <th className="px-10 py-6">Category</th>
                    <th className="px-10 py-6">Business Owner</th>
                    <th className="px-10 py-6">Registration Date</th>
                    <th className="px-10 py-6">Verification Status</th>
                    <th className="px-10 py-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredBusinesses.map(biz => {
                    const owner = MOCK_USERS.find(u => u.id === biz.ownerId);
                    return (
                      <tr key={biz.id} className={`transition-all group ${selectedBusinessIds.includes(biz.id) ? 'bg-indigo-50/30' : 'hover:bg-slate-50/50'}`}>
                        <td className="px-10 py-7">
                          <input 
                            type="checkbox" 
                            checked={selectedBusinessIds.includes(biz.id)} 
                            onChange={() => toggleSelectBusiness(biz.id)}
                            className="w-5 h-5 rounded-md border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                          />
                        </td>
                        <td className="px-10 py-7">
                          <div className="flex items-center gap-4">
                            <img src={biz.images[0]} className="w-12 h-12 rounded-xl object-cover shadow-sm ring-2 ring-white" />
                            <div>
                              <p className="font-black text-slate-900 leading-none mb-1 text-base">{biz.name}</p>
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">ID: {biz.id.toUpperCase()}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-10 py-7">
                           <span className="text-xs font-bold text-slate-600">{biz.category}</span>
                        </td>
                        <td className="px-10 py-7">
                           <div className="flex items-center gap-3">
                              <img src={owner?.avatar} className="w-8 h-8 rounded-full object-cover" />
                              <span className="text-xs font-bold text-slate-700">{owner?.name || 'Unknown Owner'}</span>
                           </div>
                        </td>
                        <td className="px-10 py-7 text-xs font-bold text-slate-500 uppercase tracking-wider">
                           {biz.registrationDate}
                        </td>
                        <td className="px-10 py-7">
                           {renderStatusBadge(biz.status)}
                        </td>
                        <td className="px-10 py-7 text-right">
                           <button 
                             onClick={() => { setSelectedBusiness(biz); setReviewModalOpen(true); }}
                             className="px-6 py-2.5 bg-slate-950 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-md group-hover:scale-105"
                           >
                             Review Detail
                           </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Placeholder for other tabs if they were partially implemented in prior changes */}
      {activeTab === 'monetization' && (
        <div className="grid lg:grid-cols-3 gap-8">
           {plans.map(plan => (
             <div key={plan.id} className="bg-white p-10 rounded-[40px] border border-slate-100 shadow-sm flex flex-col justify-between">
                <div>
                   <h4 className="text-2xl font-black text-slate-900 mb-2">{plan.name}</h4>
                   <p className="text-3xl font-black text-indigo-600 mb-8">{plan.price}</p>
                   <div className="space-y-4 mb-8">
                      {plan.features.map(f => (
                        <div key={f} className="flex items-center gap-3 text-sm font-medium text-slate-500">
                           <i className="fas fa-check-circle text-indigo-400"></i>
                           {f}
                        </div>
                      ))}
                   </div>
                </div>
                <button 
                  onClick={() => { setEditingPlan(plan); setPlanModalOpen(true); }}
                  className="w-full py-4 border-2 border-slate-100 text-slate-900 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all"
                >
                   Modify Tier Details
                </button>
             </div>
           ))}
        </div>
      )}

      {/* Review Modal is already handled inside activeTab === 'tenants' scope but can be made global if needed */}
    </div>
  );
};
