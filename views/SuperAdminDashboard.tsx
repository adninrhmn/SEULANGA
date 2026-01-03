
import React, { useState, useMemo } from 'react';
import { MOCK_BUSINESSES, MOCK_TRANSACTIONS, MOCK_ADS, MOCK_AUDIT_LOGS, MOCK_USERS, MOCK_REVIEWS } from '../constants';
import { BusinessCategory, SubscriptionPlan, Business, AuditLog, UserRole, BusinessStatus, Review, Transaction } from '../types';
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

const userGrowthData = [
  { month: 'Jul', users: 850, partners: 42 },
  { month: 'Aug', users: 1100, partners: 58 },
  { month: 'Sep', users: 1450, partners: 75 },
  { month: 'Oct', users: 1900, partners: 92 },
  { month: 'Nov', users: 2400, partners: 115 },
  { month: 'Dec', users: 3100, partners: 148 },
];

interface SubPlan {
  id: string;
  name: string;
  price: string;
  billingCycle: 'Monthly' | 'Annually';
  trialPeriodDays: number;
  commission: string;
  maxUnits: number;
  features: string[];
  status: 'active' | 'archived';
}

const INITIAL_PLANS: SubPlan[] = [
  { id: 'p1', name: 'Basic Access', price: 'Free', billingCycle: 'Monthly', trialPeriodDays: 0, commission: '15%', maxUnits: 5, features: ['Community Support', 'Standard Marketplace Listing', 'Basic Analytics'], status: 'active' },
  { id: 'p2', name: 'Growth Professional', price: 'Rp 499.000', billingCycle: 'Monthly', trialPeriodDays: 14, commission: '10%', maxUnits: 50, features: ['Priority Support', 'Featured Search Results', 'Advanced Analytics', 'Commission Discount'], status: 'active' },
  { id: 'p3', name: 'Enterprise Premium', price: 'Rp 1.200.000', billingCycle: 'Monthly', trialPeriodDays: 30, commission: '5%', maxUnits: 999, features: ['24/7 Dedicated Support', 'Homepage Featured Ad', 'AI Business Insights', 'Custom Reports', 'API Access'], status: 'active' },
];

interface SuperAdminDashboardProps {
  activeTab: 'overview' | 'analytics' | 'monetization' | 'tenants' | 'reviews' | 'finance' | 'logs' | 'settings';
  onNavigate: (view: string, subView?: string) => void;
}

export const SuperAdminDashboard: React.FC<SuperAdminDashboardProps> = ({ activeTab, onNavigate }) => {
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
  const [isOnboarding, setIsOnboarding] = useState(false);
  const [onboardingSuccessMsg, setOnboardingSuccessMsg] = useState<string | null>(null);

  // Review Moderation State
  const [reviews, setReviews] = useState<Review[]>(MOCK_REVIEWS);
  const [reviewFilters, setReviewFilters] = useState({
    status: 'All',
    search: ''
  });
  
  // Finance State
  const [transactions, setTransactions] = useState<Transaction[]>(MOCK_TRANSACTIONS);
  const [payoutRequests, setPayoutRequests] = useState([
    { id: 'po1', businessName: 'Grand Seulanga Hotel', amount: 12500000, status: 'pending', requestedAt: '2024-12-28' },
    { id: 'po2', businessName: 'Pine Hill Guesthouse', amount: 4200000, status: 'pending', requestedAt: '2024-12-29' }
  ]);

  // Tenant Specific Filters
  const [tenantFilters, setTenantFilters] = useState({
    category: 'All',
    status: 'All',
    search: ''
  });

  // Audit Logs State
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(MOCK_AUDIT_LOGS);
  const [showExportDropdown, setShowExportDropdown] = useState(false);
  
  // Platform Settings State
  const [platformSettings, setPlatformSettings] = useState({
    maintenanceMode: false,
    publicRegistration: true,
    aiInsightsEnabled: true,
    mfaRequired: false,
    commissionRate: 12,
    serviceFee: 25000,
    platformName: 'SEULANGA',
    legalEmail: 'legal@seulanga.com'
  });

  const stats = [
    { label: 'Total Revenue (ARR)', value: 'Rp 1.42B', trend: '+24%', icon: 'fa-money-bill-trend-up', color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Avg. Commission', value: '11.4%', trend: 'Stable', icon: 'fa-percentage', color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: 'Pending Payouts', value: 'Rp 82.4M', trend: 'Due', icon: 'fa-clock-rotate-left', color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Active Ad Campaigns', value: '18', trend: '+4 new', icon: 'fa-rectangle-ad', color: 'text-violet-600', bg: 'bg-violet-50' },
  ];

  const renderStatusBadge = (status: BusinessStatus) => {
    const configs: Record<string, { bg: string, text: string, border: string }> = {
      active: { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-100' },
      pending: { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-100' },
      suspended: { bg: 'bg-rose-50', text: 'text-rose-600', border: 'border-rose-100' },
      rejected: { bg: 'bg-slate-950', text: 'text-white', border: 'border-slate-800' },
      info_requested: { bg: 'bg-indigo-50', text: 'text-indigo-600', border: 'border-indigo-100' },
    };
    const config = configs[status] || { bg: 'bg-slate-50', text: 'text-slate-500', border: 'border-slate-100' };
    return (
      <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border shadow-sm ${config.bg} ${config.text} ${config.border}`}>
        {status.replace('_', ' ')}
      </span>
    );
  };

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

  const handleUpdateSettings = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const updatedSettings = {
        ...platformSettings,
        platformName: formData.get('platformName') as string,
        legalEmail: formData.get('legalEmail') as string,
        commissionRate: parseInt(formData.get('commissionRate') as string),
        serviceFee: parseInt(formData.get('serviceFee') as string),
    };
    setPlatformSettings(updatedSettings);
    addLog('Updated Global Platform Settings', 'System Configuration', 'management');
    alert('Platform configuration synchronized successfully.');
  };

  const updateBusinessStatus = async (id: string, status: BusinessStatus) => {
    const biz = businesses.find(b => b.id === id);
    if (!biz) return;
    if (status === 'active') setIsOnboarding(true);
    setBusinesses(businesses.map(b => b.id === id ? { ...b, status } : b));
    addLog(`Status: ${status.toUpperCase()}`, biz.name, 'management');
    if (status === 'active') {
      const owner = MOCK_USERS.find(u => u.id === biz.ownerId);
      const emailBody = await generateWelcomeEmail(owner?.name || 'Partner', biz.name, biz.category);
      await new Promise(res => setTimeout(res, 1500));
      setOnboardingSuccessMsg(emailBody);
      setIsOnboarding(false);
      setTimeout(() => setOnboardingSuccessMsg(null), 5000);
    }
    setReviewModalOpen(false);
  };

  const filteredBusinesses = useMemo(() => {
    return businesses.filter(b => {
      const matchCategory = tenantFilters.category === 'All' || b.category === tenantFilters.category;
      const matchStatus = tenantFilters.status === 'All' || b.status === tenantFilters.status.toLowerCase();
      const matchSearch = !tenantFilters.search || b.name.toLowerCase().includes(tenantFilters.search.toLowerCase());
      return matchCategory && matchStatus && matchSearch;
    });
  }, [businesses, tenantFilters]);

  const renderAnalytics = () => (
    <div className="space-y-10 animate-fade-up">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Active Businesses', value: businesses.length, trend: '+8.5%', icon: 'fa-building-circle-check', color: 'text-indigo-600', bg: 'bg-indigo-50' },
          { label: 'Monthly Users', value: '3,100', trend: '+12.4%', icon: 'fa-users', color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Global Revenue', value: 'Rp 137M', trend: '+15.2%', icon: 'fa-chart-line', color: 'text-violet-600', bg: 'bg-violet-50' },
          { label: 'Churn Rate', value: '1.2%', trend: '-0.3%', icon: 'fa-user-minus', color: 'text-rose-600', bg: 'bg-rose-50' },
        ].map((kpi, i) => (
          <div key={i} className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm">
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
      <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm h-[400px]">
         <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} />
              <YAxis axisLine={false} tickLine={false} />
              <Tooltip />
              <Area type="monotone" dataKey="mrr" stroke="#4f46e5" strokeWidth={4} fillOpacity={1} fill="url(#colorRevenue)" />
            </AreaChart>
         </ResponsiveContainer>
      </div>
    </div>
  );

  return (
    <div className="space-y-10 animate-fade-up">
      {/* Platform Governance Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-slate-900 p-10 rounded-[40px] shadow-2xl relative overflow-hidden text-white">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl -mr-32 -mt-32"></div>
        <div className="relative z-10 flex items-center gap-8">
          <div className="w-20 h-20 bg-white/10 backdrop-blur-xl rounded-[28px] flex items-center justify-center border border-white/20 shadow-inner">
            <i className="fas fa-shield-halved text-3xl text-indigo-400"></i>
          </div>
          <div>
            <h1 className="text-4xl font-black tracking-tight mb-2">Platform Registry & Governance</h1>
            <p className="text-indigo-200/80 font-medium">Global authority dashboard for SEULANGA multi-tenant ecosystem.</p>
          </div>
        </div>
        <div className="relative z-10 flex flex-wrap gap-4">
          <button 
            onClick={() => { setIsBackupRunning(true); setTimeout(() => setIsBackupRunning(false), 2000); }}
            className="bg-white/10 hover:bg-white/20 text-white px-8 py-4 rounded-2xl font-black text-sm transition-all border border-white/10 flex items-center gap-3"
          >
            <i className={`fas ${isBackupRunning ? 'fa-spinner fa-spin' : 'fa-database'}`}></i>
            Sync Node Registry
          </button>
          {/* FIXED: OnNavigate trigger correctly set to 'settings' subview */}
          <button 
            onClick={() => onNavigate('super-admin', 'settings')}
            className={`bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-2xl font-black text-sm transition-all shadow-xl shadow-indigo-900/40 flex items-center gap-3 ${activeTab === 'settings' ? 'ring-4 ring-indigo-400/50' : ''}`}
          >
            <i className="fas fa-gear"></i> Platform Settings
          </button>
        </div>
      </div>

      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, i) => (
            <div key={i} className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${stat.bg} ${stat.color}`}>
                <i className={`fas ${stat.icon} text-2xl`}></i>
              </div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
              <h3 className="text-3xl font-black text-slate-900 tracking-tight">{stat.value}</h3>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'analytics' && renderAnalytics()}

      {activeTab === 'tenants' && (
        <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-10 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-slate-50/20">
             <h3 className="font-black text-2xl text-slate-900">Tenant Management Ledger</h3>
             <div className="flex gap-4">
                <input 
                  type="text" 
                  placeholder="Filter by name..." 
                  onChange={(e) => setTenantFilters({...tenantFilters, search: e.target.value})}
                  className="bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm font-bold focus:ring-2 ring-indigo-50"
                />
             </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                  <th className="px-10 py-6">Business Entity</th>
                  <th className="px-10 py-6">Category</th>
                  <th className="px-10 py-6">Status</th>
                  <th className="px-10 py-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredBusinesses.map(biz => (
                  <tr key={biz.id} className="hover:bg-slate-50/50 transition-all">
                    <td className="px-10 py-6 flex items-center gap-4">
                      <img src={biz.images[0]} className="w-10 h-10 rounded-lg object-cover" />
                      <span className="font-black text-slate-900">{biz.name}</span>
                    </td>
                    <td className="px-10 py-6 text-xs font-bold text-slate-500">{biz.category}</td>
                    <td className="px-10 py-6">{renderStatusBadge(biz.status)}</td>
                    <td className="px-10 py-6 text-right">
                       <button 
                        onClick={() => { setSelectedBusiness(biz); setReviewModalOpen(true); }}
                        className="text-indigo-600 font-black text-[10px] uppercase tracking-widest hover:underline"
                       >
                         Manage Identity
                       </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="grid lg:grid-cols-3 gap-10 animate-fade-up">
          <div className="lg:col-span-2 space-y-10">
            <div className="bg-white p-10 rounded-[48px] border border-slate-100 shadow-sm">
              <h3 className="text-3xl font-black text-slate-900 tracking-tight mb-10">Global Platform Configuration</h3>
              <form onSubmit={handleUpdateSettings} className="space-y-12">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Master Platform Name</label>
                    <input name="platformName" defaultValue={platformSettings.platformName} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 font-bold text-slate-900 focus:ring-4 ring-indigo-50 outline-none" />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Legal Contact Relay</label>
                    <input name="legalEmail" type="email" defaultValue={platformSettings.legalEmail} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 font-bold text-slate-900 focus:ring-4 ring-indigo-50 outline-none" />
                  </div>
                </div>

                <div className="pt-10 border-t border-slate-50">
                  <h4 className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-6">Financial Settlement Protocol</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Default Commission Rate (%)</label>
                      <input name="commissionRate" type="number" defaultValue={platformSettings.commissionRate} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 font-bold text-slate-900" />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Standard Service Fee (IDR)</label>
                      <input name="serviceFee" type="number" defaultValue={platformSettings.serviceFee} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 font-bold text-slate-900" />
                    </div>
                  </div>
                </div>

                <div className="pt-10 border-t border-slate-50 space-y-6">
                  <h4 className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-2">Ecosystem Integrity Toggles</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     {[
                       { key: 'maintenanceMode', label: 'Global Maintenance Protocol', desc: 'Suspend public access for updates.' },
                       { key: 'publicRegistration', label: 'Open Onboarding Gateway', desc: 'Allow new business registrations.' },
                       { key: 'aiInsightsEnabled', label: 'Gemini Strategy engine', desc: 'Enable AI analysis for partners.' },
                       { key: 'mfaRequired', label: 'Compulsory MFA Auth', desc: 'Force 2FA for all admin accounts.' },
                     ].map(toggle => (
                       <div key={toggle.key} className="p-6 bg-slate-50 rounded-3xl border border-slate-100 flex items-center justify-between group">
                          <div className="space-y-1">
                             <p className="text-xs font-black text-slate-900">{toggle.label}</p>
                             <p className="text-[10px] text-slate-400 font-medium">{toggle.desc}</p>
                          </div>
                          <button 
                            type="button"
                            onClick={() => setPlatformSettings({...platformSettings, [toggle.key]: !(platformSettings as any)[toggle.key]})}
                            className={`w-14 h-8 rounded-full relative transition-all ${(platformSettings as any)[toggle.key] ? 'bg-indigo-600' : 'bg-slate-200'}`}
                          >
                             <div className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transition-all ${(platformSettings as any)[toggle.key] ? 'left-7' : 'left-1'}`}></div>
                          </button>
                       </div>
                     ))}
                  </div>
                </div>

                <div className="pt-10 border-t border-slate-50">
                  <button type="submit" className="px-12 py-5 bg-slate-950 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-600 shadow-2xl transition-all">Synchronize Global Policy</button>
                </div>
              </form>
            </div>
          </div>
          <div className="space-y-8">
            <div className="bg-slate-950 p-10 rounded-[48px] shadow-2xl text-white relative overflow-hidden">
               <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl -mr-32 -mt-32"></div>
               <h3 className="font-black text-2xl mb-8 relative z-10">Infrastructure Node</h3>
               <div className="space-y-6 relative z-10">
                  <div className="p-6 bg-white/5 rounded-3xl border border-white/10">
                     <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Status</p>
                     <p className="text-sm font-black text-emerald-400">Production Live (v4.0.2)</p>
                  </div>
                  <div className="p-6 bg-white/5 rounded-3xl border border-white/10">
                     <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Cluster</p>
                     <p className="text-sm font-black text-indigo-100">PostgreSQL Multi-tenant</p>
                  </div>
               </div>
            </div>
          </div>
        </div>
      )}

      {/* Review / Onboarding Modal */}
      {isReviewModalOpen && selectedBusiness && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm">
           <div className="bg-white w-full max-w-2xl rounded-[40px] shadow-2xl overflow-hidden p-10 space-y-8 relative">
              {isOnboarding && (
                 <div className="absolute inset-0 z-[110] bg-slate-950/90 backdrop-blur flex flex-col items-center justify-center text-white text-center p-10">
                    <div className="w-16 h-16 border-t-4 border-indigo-500 rounded-full animate-spin mb-6"></div>
                    <h3 className="text-2xl font-black mb-4">Drafting Onboarding Strategy</h3>
                    <p className="text-indigo-200/60 text-sm">Gemini AI is crafting the welcoming protocol for your new partner.</p>
                 </div>
              )}
              {onboardingSuccessMsg && (
                 <div className="absolute inset-0 z-[110] bg-emerald-950/95 backdrop-blur flex flex-col items-center justify-center text-white text-center p-10 overflow-y-auto">
                    <i className="fas fa-paper-plane text-4xl mb-6 text-emerald-400"></i>
                    <h3 className="text-2xl font-black mb-4">Welcome Packet Dispatched</h3>
                    <div className="text-left text-xs bg-white/5 p-6 rounded-2xl border border-white/10 max-h-64 overflow-y-auto">
                       {onboardingSuccessMsg}
                    </div>
                 </div>
              )}
              <div className="flex justify-between items-center">
                 <h3 className="text-3xl font-black text-slate-900">Entity Review</h3>
                 <button onClick={() => setReviewModalOpen(false)} className="text-slate-400 hover:text-rose-500"><i className="fas fa-times text-xl"></i></button>
              </div>
              <div className="p-8 bg-slate-50 rounded-3xl space-y-4">
                 <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Business Detail</p>
                 <h4 className="text-2xl font-black text-slate-900">{selectedBusiness.name}</h4>
                 <p className="text-sm font-medium text-slate-500 italic">"{selectedBusiness.description}"</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <button onClick={() => updateBusinessStatus(selectedBusiness.id, 'active')} className="py-4 bg-emerald-600 text-white rounded-2xl font-black uppercase text-xs">Finalize Approval</button>
                 <button onClick={() => updateBusinessStatus(selectedBusiness.id, 'rejected')} className="py-4 bg-rose-500 text-white rounded-2xl font-black uppercase text-xs">Reject Registration</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};
