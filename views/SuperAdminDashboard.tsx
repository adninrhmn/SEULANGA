
import React, { useState, useMemo } from 'react';
import { MOCK_BUSINESSES, MOCK_TRANSACTIONS, MOCK_ADS, MOCK_AUDIT_LOGS, MOCK_USERS, MOCK_REVIEWS } from '../constants';
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
  const [isCreateBusinessModalOpen, setCreateBusinessModalOpen] = useState(false);
  const [selectedBusinessIds, setSelectedBusinessIds] = useState<string[]>([]);
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
  const [gatewayConfig, setGatewayConfig] = useState({
    provider: 'Stripe',
    status: 'Operational',
    mode: 'Live'
  });

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

  const handleSavePlan = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const planName = formData.get('name') as string;
    const planData: SubPlan = {
      id: editingPlan?.id || `p${Date.now()}`,
      name: planName,
      price: formData.get('price') as string,
      billingCycle: formData.get('billingCycle') as 'Monthly' | 'Annually',
      trialPeriodDays: parseInt(formData.get('trialPeriodDays') as string) || 0,
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

  const handleDeletePlan = (id: string) => {
    const plan = plans.find(p => p.id === id);
    if (plan && confirm(`Are you sure you want to archive the ${plan.name} plan?`)) {
      setPlans(plans.filter(p => p.id !== id));
      addLog('Archived Subscription Plan', plan.name, 'financial');
    }
  };

  const handleModerateReview = (id: string, status: 'approved' | 'rejected') => {
    const review = reviews.find(r => r.id === id);
    if (review) {
      setReviews(reviews.map(r => r.id === id ? { ...r, status } : r));
      addLog(`Review Moderation: ${status.toUpperCase()}`, `Review ID: ${id}`, 'management');
    }
  };

  const handleFlagReview = (id: string) => {
    const reason = prompt("Enter reason for flagging this review (e.g., Harassment, Fake Review, Spam):");
    if (!reason) return;

    setReviews(reviews.map(r => 
      r.id === id 
        ? { ...r, flags: [...(r.flags || []), reason], status: 'rejected' as const } 
        : r
    ));
    addLog(`Flagged Review`, `Review ID: ${id} - Reason: ${reason}`, 'security');
  };

  const handleApprovePayout = (id: string) => {
    const payout = payoutRequests.find(p => p.id === id);
    if (payout && confirm(`Confirm disbursement of Rp ${payout.amount.toLocaleString()} to ${payout.businessName}?`)) {
      setPayoutRequests(payoutRequests.map(p => p.id === id ? { ...p, status: 'settled' } : p));
      addLog('Approved Payout Request', payout.businessName, 'financial');
    }
  };

  const updateBusinessStatus = async (id: string, status: BusinessStatus) => {
    const biz = businesses.find(b => b.id === id);
    if (!biz) return;

    if (status === 'active') setIsOnboarding(true);

    setBusinesses(businesses.map(b => b.id === id ? { ...b, status } : b));
    
    let actionLabel = 'Updated Status';
    if (status === 'active') actionLabel = 'Approved Business Registration';
    else if (status === 'rejected') actionLabel = 'Rejected Business Registration';
    else if (status === 'info_requested') actionLabel = 'Requested Additional Business Info';
    else if (status === 'suspended') actionLabel = 'Suspended Business Account';
    
    addLog(actionLabel, biz.name, 'management');

    if (status === 'active') {
      const owner = MOCK_USERS.find(u => u.id === biz.ownerId);
      const emailBody = await generateWelcomeEmail(owner?.name || 'Partner', biz.name, biz.category);
      
      await new Promise(res => setTimeout(res, 1500));
      
      setOnboardingSuccessMsg(emailBody);
      setIsOnboarding(false);
      addLog('Dispatched Welcome Protocol', biz.name, 'system');
      
      setTimeout(() => {
        setOnboardingSuccessMsg(null);
        setReviewModalOpen(false);
        setSelectedBusiness(null);
      }, 5000);
    } else {
      setReviewModalOpen(false);
      setSelectedBusiness(null);
    }
  };

  const handleCreateBusiness = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const bizName = formData.get('name') as string;
    const bizCategory = formData.get('category') as BusinessCategory;
    const ownerName = formData.get('ownerName') as string;
    const ownerEmail = formData.get('ownerEmail') as string;

    const newOwnerId = `u-${Date.now()}`;
    const newBizId = `b-${Date.now()}`;

    const newBiz: Business = {
      id: newBizId,
      name: bizName,
      category: bizCategory,
      ownerId: newOwnerId,
      description: formData.get('description') as string,
      address: formData.get('address') as string,
      status: 'active',
      subscription: formData.get('subscription') as SubscriptionPlan,
      images: ['https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=2070'],
      rating: 0,
      location: { lat: 5.5483, lng: 95.3238 },
      registrationDate: new Date().toISOString().split('T')[0]
    };

    setBusinesses([...businesses, newBiz]);
    addLog('Manually Pre-Registered Business', bizName, 'management');
    setCreateBusinessModalOpen(false);
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
    alert('Platform configuration has been synchronized successfully.');
  };

  const handleBulkApprovePending = () => {
    const pendingBusinesses = businesses.filter(b => b.status === 'pending');
    if (pendingBusinesses.length === 0) return;
    
    setBusinesses(businesses.map(b => b.status === 'pending' ? { ...b, status: 'active' } : b));
    addLog('Bulk Approved Pending Businesses', `${pendingBusinesses.length} entities`, 'management');
    setSelectedBusinessIds([]);
  };

  const handleBulkSuspendSelected = () => {
    if (selectedBusinessIds.length === 0) return;
    if (!confirm(`Are you sure you want to suspend ${selectedBusinessIds.length} selected businesses?`)) return;

    setBusinesses(businesses.map(b => selectedBusinessIds.includes(b.id) ? { ...b, status: 'suspended' } : b));
    addLog('Bulk Suspended Businesses', `${selectedBusinessIds.length} entities`, 'management');
    setSelectedBusinessIds([]);
  };

  const handleBulkRejectSelected = () => {
    if (selectedBusinessIds.length === 0) return;
    if (!confirm(`Are you sure you want to permanently reject ${selectedBusinessIds.length} selected registrations?`)) return;

    setBusinesses(businesses.map(b => selectedBusinessIds.includes(b.id) ? { ...b, status: 'rejected' } : b));
    addLog('Bulk Rejected Registrations', `${selectedBusinessIds.length} entities`, 'management');
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

  const filteredReviews = useMemo(() => {
    return reviews.filter(r => {
      const matchStatus = reviewFilters.status === 'All' || r.status === reviewFilters.status.toLowerCase();
      const matchSearch = !reviewFilters.search || 
        r.guestName.toLowerCase().includes(reviewFilters.search.toLowerCase()) ||
        r.comment.toLowerCase().includes(reviewFilters.search.toLowerCase());
      return matchStatus && matchSearch;
    });
  }, [reviews, reviewFilters]);

  const handleExportJSON = () => {
    const dataStr = JSON.stringify(auditLogs, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `seulanga_audit_logs_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    addLog('Exported Audit Logs', 'JSON Format', 'system');
    setShowExportDropdown(false);
  };

  const handleExportCSV = () => {
    const headers = ['ID', 'Timestamp', 'Actor', 'Role', 'Action', 'Target', 'Type'];
    const rows = auditLogs.map(log => [
      log.id,
      log.timestamp,
      log.actorName,
      log.actorRole,
      log.action,
      log.target,
      log.type
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const dataBlob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `seulanga_audit_logs_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    addLog('Exported Audit Logs', 'CSV Format', 'system');
    setShowExportDropdown(false);
  };

  const renderAnalytics = () => (
    <div className="space-y-10 animate-fade-up">
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
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Base Price</label>
                  <input name="price" defaultValue={editingPlan?.price} placeholder="Rp 500.000" required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-900 outline-none focus:ring-2 ring-indigo-100" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Billing Cycle</label>
                  <select name="billingCycle" defaultValue={editingPlan?.billingCycle || 'Monthly'} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-900 outline-none focus:ring-2 ring-indigo-100">
                    <option value="Monthly">Monthly</option>
                    <option value="Annually">Annually</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Trial Period (Days)</label>
                  <input name="trialPeriodDays" type="number" defaultValue={editingPlan?.trialPeriodDays || 0} required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-900 outline-none focus:ring-2 ring-indigo-100" />
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

      {/* Manual Business Creation Modal */}
      {isCreateBusinessModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
           <div className="bg-white w-full max-w-2xl rounded-[40px] shadow-2xl overflow-hidden border border-white">
              <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                <h3 className="font-black text-2xl text-slate-900">Pre-Register New Business</h3>
                <button onClick={() => setCreateBusinessModalOpen(false)} className="text-slate-400 hover:text-indigo-600 transition-all"><i className="fas fa-times"></i></button>
              </div>
              <form onSubmit={handleCreateBusiness} className="p-8 space-y-6">
                 <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Business Name</label>
                       <input name="name" required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-900 focus:ring-2 ring-indigo-100 outline-none" />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Category</label>
                       <select name="category" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-900 focus:ring-2 ring-indigo-100 outline-none">
                          {Object.values(BusinessCategory).map(cat => <option key={cat} value={cat}>{cat}</option>)}
                       </select>
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Owner Name</label>
                       <input name="ownerName" required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-900 focus:ring-2 ring-indigo-100 outline-none" />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Owner Email</label>
                       <input name="ownerEmail" type="email" required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-900 focus:ring-2 ring-indigo-100 outline-none" />
                    </div>
                    <div className="space-y-2 col-span-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Subscription Tier</label>
                       <select name="subscription" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-900 focus:ring-2 ring-indigo-100 outline-none">
                          {Object.values(SubscriptionPlan).map(plan => <option key={plan} value={plan}>{plan}</option>)}
                       </select>
                    </div>
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Physical Address</label>
                    <input name="address" required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-900 focus:ring-2 ring-indigo-100 outline-none" />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Short Description</label>
                    <textarea name="description" rows={3} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-900 focus:ring-2 ring-indigo-100 outline-none resize-none" />
                 </div>
                 <div className="flex gap-4 pt-4">
                    <button type="button" onClick={() => setCreateBusinessModalOpen(false)} className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black text-sm uppercase">Abort</button>
                    <button type="submit" className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-black text-sm shadow-xl shadow-indigo-200 uppercase">Create & Activate</button>
                 </div>
              </form>
           </div>
        </div>
      )}

      {/* Business Review/Verification Modal */}
      {isReviewModalOpen && selectedBusiness && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
           <div className="bg-white w-full max-w-4xl rounded-[40px] shadow-2xl overflow-hidden border border-white flex flex-col md:flex-row h-[80vh] relative">
              
              {/* Automated Onboarding Overlay */}
              {(isOnboarding || onboardingSuccessMsg) && (
                <div className="absolute inset-0 z-[110] bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-10 text-center">
                  <div className="max-w-md animate-fade-up">
                    {isOnboarding ? (
                      <div className="space-y-6">
                        <div className="w-24 h-24 border-t-4 border-indigo-500 rounded-full animate-spin mx-auto"></div>
                        <h3 className="text-2xl font-black text-white">Deploying Welcome Protocol...</h3>
                        <p className="text-indigo-200/60 font-medium">Gemini AI is crafting a personalized onboarding experience for your new partner.</p>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        <div className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center text-white text-3xl mx-auto shadow-2xl shadow-emerald-500/20">
                          <i className="fas fa-paper-plane"></i>
                        </div>
                        <h3 className="text-2xl font-black text-white">Welcome Packet Dispatched</h3>
                        <div className="bg-white/5 border border-white/10 rounded-3xl p-6 text-left max-h-64 overflow-y-auto scrollbar-hide">
                          <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-4">Transmission Summary:</p>
                          <p className="text-xs text-indigo-50 font-medium whitespace-pre-wrap leading-relaxed">
                            {onboardingSuccessMsg}
                          </p>
                        </div>
                        <p className="text-indigo-200/60 text-xs font-bold uppercase tracking-widest">Partner will be notified via secure relay.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="md:w-1/2 bg-slate-50 border-r border-slate-100 flex flex-col">
                <div className="h-64 relative overflow-hidden">
                   <img src={selectedBusiness.images[0]} className="w-full h-full object-cover" />
                   <div className="absolute top-6 left-6">
                      {renderStatusBadge(selectedBusiness.status)}
                   </div>
                </div>
                <div className="p-8 space-y-6 overflow-y-auto flex-1 scrollbar-hide">
                   <div>
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Entity Description</h4>
                      <p className="text-sm font-medium text-slate-700 leading-relaxed">{selectedBusiness.description}</p>
                   </div>
                   <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-white rounded-2xl border border-slate-100">
                         <p className="text-[8px] font-black text-slate-400 uppercase mb-1">Category</p>
                         <p className="text-xs font-bold text-slate-900">{selectedBusiness.category}</p>
                      </div>
                      <div className="p-4 bg-white rounded-2xl border border-slate-100">
                         <p className="text-[8px] font-black text-slate-400 uppercase mb-1">Subscription</p>
                         <p className="text-xs font-bold text-slate-900">{selectedBusiness.subscription}</p>
                      </div>
                   </div>
                   <div>
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Official Address</h4>
                      <p className="text-xs font-bold text-slate-800">{selectedBusiness.address}</p>
                   </div>
                </div>
              </div>

              <div className="md:w-1/2 p-10 flex flex-col">
                 <div className="flex justify-between items-start mb-10">
                    <div>
                       <h3 className="text-2xl font-black text-slate-900 tracking-tight">Governance Review</h3>
                       <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mt-1">Verification Workflow: {selectedBusiness.name}</p>
                    </div>
                    <button onClick={() => setReviewModalOpen(false)} className="text-slate-300 hover:text-rose-500 transition-all"><i className="fas fa-times text-xl"></i></button>
                 </div>

                 <div className="space-y-4 mb-auto">
                    <p className="text-xs font-bold text-slate-500 leading-relaxed">
                       Review the business entity documents and physical address verification. You can approve for live access, reject based on policy, or request further technical clarification from the business owner.
                    </p>
                    
                    <div className="space-y-3">
                       <button 
                         onClick={() => updateBusinessStatus(selectedBusiness.id, 'active')}
                         className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-emerald-100 hover:bg-emerald-700 transition-all flex items-center justify-center gap-3"
                       >
                          <i className="fas fa-check-double"></i> Finalize Approval
                       </button>
                       <button 
                         onClick={() => updateBusinessStatus(selectedBusiness.id, 'info_requested')}
                         className="w-full py-4 bg-indigo-50 text-indigo-600 rounded-2xl font-black text-xs uppercase tracking-widest border border-indigo-100 hover:bg-indigo-100 transition-all flex items-center justify-center gap-3"
                       >
                          <i className="fas fa-file-signature"></i> Request Technical Info
                       </button>
                    </div>
                 </div>

                 <div className="pt-8 border-t border-slate-50 space-y-3">
                    <h4 className="text-[10px] font-black text-rose-400 uppercase tracking-widest text-center mb-2">Policy Enforcement</h4>
                    <button 
                      onClick={() => updateBusinessStatus(selectedBusiness.id, 'suspended')}
                      className="w-full py-4 bg-white border border-slate-200 text-slate-500 rounded-2xl font-black text-xs uppercase tracking-widest hover:border-rose-500 hover:text-rose-500 transition-all flex items-center justify-center gap-3"
                    >
                       <i className="fas fa-ban"></i> Suspend Account
                    </button>
                    <button 
                      onClick={() => updateBusinessStatus(selectedBusiness.id, 'rejected')}
                      className="w-full py-4 bg-rose-50 text-rose-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-rose-100 transition-all flex items-center justify-center gap-3"
                    >
                       <i className="fas fa-times-circle"></i> Permanent Reject
                    </button>
                 </div>
              </div>
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
            onClick={() => onNavigate('super-admin', 'settings')}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-2xl font-black text-sm transition-all shadow-xl shadow-indigo-900/40 flex items-center gap-3"
          >
            <i className="fas fa-gear"></i> Platform Settings
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
              <span className={`text-xs font-black ${stat.trend.includes('+') ? 'text-emerald-600' : 'text-slate-50'}`}>{stat.trend}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Tab Contents - Now controlled via sidebar navigation */}
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
          <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm space-y-8">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-2xl text-slate-900 tracking-tight">Tenant Verification Filter</h3>
              <div className="flex items-center gap-4">
                 <button 
                  onClick={() => setCreateBusinessModalOpen(true)}
                  className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all flex items-center gap-2 shadow-lg shadow-indigo-100"
                 >
                    <i className="fas fa-plus-circle"></i> Create Business
                 </button>
                 <button 
                  onClick={() => setTenantFilters({category: 'All', status: 'All', search: ''})}
                  className="text-xs font-black text-indigo-600 uppercase tracking-widest hover:underline"
                 >
                  Clear Filters
                 </button>
              </div>
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
                  <option value="pending">Pending Review</option>
                  <option value="active">Approved</option>
                  <option value="rejected">Rejected</option>
                  <option value="suspended">Suspended</option>
                  <option value="info_requested">Info Requested</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Global Search</label>
                <div className="relative">
                  <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm"></i>
                  <input 
                    type="text" 
                    placeholder="Search name, ID, or email..."
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
              <div className="flex items-center gap-6">
                <div>
                  <h3 className="font-black text-2xl text-slate-900 tracking-tight">Ecosystem Ledger</h3>
                  <p className="text-slate-400 font-medium text-sm">Managing {filteredBusinesses.length} business entities.</p>
                </div>
                {selectedBusinessIds.length > 0 && (
                  <div className="flex items-center gap-2 bg-indigo-50 px-4 py-2 rounded-2xl border border-indigo-100 animate-in slide-in-from-left duration-200">
                    <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">{selectedBusinessIds.length} Selected</span>
                    <button onClick={() => setSelectedBusinessIds([])} className="text-indigo-400 hover:text-indigo-600"><i className="fas fa-times-circle"></i></button>
                  </div>
                )}
              </div>
              
              <div className="flex flex-wrap gap-3">
                {selectedBusinessIds.length > 0 ? (
                  <>
                    <button 
                      onClick={handleBulkSuspendSelected}
                      className="px-6 py-3 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-600 transition-all flex items-center gap-2 shadow-lg shadow-slate-200"
                    >
                      <i className="fas fa-ban"></i> Suspend Selected
                    </button>
                    <button 
                      onClick={handleBulkRejectSelected}
                      className="px-6 py-3 bg-white border border-rose-200 text-rose-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-50 transition-all flex items-center gap-2"
                    >
                      <i className="fas fa-times-circle"></i> Reject Selected
                    </button>
                  </>
                ) : (
                  <button 
                    onClick={handleBulkApprovePending}
                    className="px-6 py-3 bg-emerald-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 transition-all flex items-center gap-2 shadow-lg shadow-emerald-100"
                  >
                    <i className="fas fa-check-double"></i> Fast-Track Pending
                  </button>
                )}
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
                        className="w-5 h-5 rounded-md border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                      />
                    </th>
                    <th className="px-10 py-6">Business Entity</th>
                    <th className="px-10 py-6">Business ID</th>
                    <th className="px-10 py-6">Category</th>
                    <th className="px-10 py-6">Owner Identity</th>
                    <th className="px-10 py-6">Verification Status</th>
                    <th className="px-10 py-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredBusinesses.map(biz => {
                    const owner = MOCK_USERS.find(u => u.id === biz.ownerId);
                    return (
                      <tr key={biz.id} className={`transition-all group ${selectedBusinessIds.includes(biz.id) ? 'bg-indigo-50/40' : 'hover:bg-slate-50/50'}`}>
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
                            <img src={biz.images[0]} className="w-12 h-12 rounded-xl object-cover shadow-sm" />
                            <p className="font-black text-slate-900 leading-none text-base group-hover:text-indigo-600 transition-colors">{biz.name}</p>
                          </div>
                        </td>
                        <td className="px-10 py-7 text-[10px] font-bold text-slate-400">ID-{biz.id.toUpperCase()}</td>
                        <td className="px-10 py-7 text-xs font-bold text-slate-600">{biz.category}</td>
                        <td className="px-10 py-7">
                           <div className="flex items-center gap-3">
                              <img src={owner?.avatar || 'https://i.pravatar.cc/150'} className="w-8 h-8 rounded-full grayscale group-hover:grayscale-0 transition-all" />
                              <div>
                                <p className="text-xs font-black text-slate-700 leading-tight">{owner?.name || 'External Partner'}</p>
                                <p className="text-[10px] font-bold text-slate-400">{owner?.email || 'no-email@seulanga.com'}</p>
                              </div>
                           </div>
                        </td>
                        <td className="px-10 py-7">
                           {renderStatusBadge(biz.status)}
                        </td>
                        <td className="px-10 py-7 text-right">
                           <button 
                             onClick={() => { setSelectedBusiness(biz); setReviewModalOpen(true); }}
                             className="px-6 py-2.5 bg-slate-100 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all shadow-sm group-hover:scale-105"
                           >
                             Case Detail
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

      {activeTab === 'reviews' && (
        <div className="space-y-8 animate-fade-up">
           <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm space-y-8">
              <h3 className="font-black text-2xl text-slate-900 tracking-tight">Review Moderation Matrix</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Protocol Status</label>
                  <select 
                    value={reviewFilters.status}
                    onChange={(e) => setReviewFilters({...reviewFilters, status: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-700 outline-none focus:ring-4 ring-indigo-50"
                  >
                    <option value="All">All Feedbacks</option>
                    <option value="pending">Awaiting Verification</option>
                    <option value="approved">Whitelisted</option>
                    <option value="rejected">Blacklisted</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Search Guest</label>
                  <input 
                    type="text" 
                    placeholder="Search by name..."
                    value={reviewFilters.search}
                    onChange={(e) => setReviewFilters({...reviewFilters, search: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-6 font-bold text-slate-700 outline-none focus:ring-4 ring-indigo-50"
                  />
                </div>
              </div>
           </div>

           <div className="grid gap-6">
              {filteredReviews.map(review => {
                const business = MOCK_BUSINESSES.find(b => b.id === review.businessId);
                return (
                  <div key={review.id} className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm transition-all flex flex-col md:flex-row gap-8">
                    <div className="flex-1 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                           <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black">
                             {review.guestName[0]}
                           </div>
                           <div>
                              <p className="font-black text-slate-900">{review.guestName}</p>
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Entity: {business?.name}</p>
                           </div>
                        </div>
                        <div className="flex items-center gap-1.5 bg-amber-50 text-amber-600 px-3 py-1 rounded-lg font-black text-sm">
                           <i className="fas fa-star"></i> {review.rating}
                        </div>
                      </div>
                      <p className="text-slate-700 font-medium italic">"{review.comment}"</p>
                    </div>
                    <div className="md:w-64 shrink-0 flex flex-col justify-center gap-3 border-t md:border-t-0 md:border-l border-slate-50 md:pl-8 pt-6 md:pt-0">
                      {review.status === 'pending' ? (
                        <>
                          <button onClick={() => handleModerateReview(review.id, 'approved')} className="w-full py-3 bg-emerald-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-700 transition-all">Whitelist</button>
                          <button onClick={() => handleFlagReview(review.id)} className="w-full py-3 bg-white border border-rose-100 text-rose-600 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-rose-50 transition-all">Flag Violation</button>
                        </>
                      ) : (
                        <span className={`text-center py-2 rounded-xl text-[10px] font-black uppercase ${review.status === 'approved' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>{review.status}</span>
                      )}
                    </div>
                  </div>
                );
              })}
           </div>
        </div>
      )}

      {activeTab === 'monetization' && (
        <div className="space-y-10 animate-fade-up">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">Subscription Architecture</h2>
              <p className="text-slate-500 font-medium">Define global pricing tiers and platform rules.</p>
            </div>
            <button 
              onClick={() => { setEditingPlan(null); setPlanModalOpen(true); }}
              className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black text-sm flex items-center gap-3 shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all"
            >
              <i className="fas fa-plus"></i> Architect New Tier
            </button>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
             {plans.map(plan => (
               <div key={plan.id} className="bg-white p-10 rounded-[40px] border border-slate-100 shadow-sm flex flex-col justify-between group hover:shadow-2xl transition-all relative">
                  <div className="absolute top-8 right-8 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => { setEditingPlan(plan); setPlanModalOpen(true); }} className="w-10 h-10 bg-slate-50 text-slate-400 hover:text-indigo-600 rounded-xl flex items-center justify-center border border-slate-100 shadow-sm"><i className="fas fa-edit"></i></button>
                    <button onClick={() => handleDeletePlan(plan.id)} className="w-10 h-10 bg-slate-50 text-slate-400 hover:text-rose-600 rounded-xl flex items-center justify-center border border-slate-100 shadow-sm"><i className="fas fa-trash-alt"></i></button>
                  </div>
                  <div>
                     <div className="flex items-center gap-3 mb-2">
                        <h4 className="text-2xl font-black text-slate-900">{plan.name}</h4>
                        {plan.trialPeriodDays > 0 && (
                          <span className="px-3 py-1 bg-amber-50 text-amber-600 text-[8px] font-black uppercase rounded-full border border-amber-100">{plan.trialPeriodDays} Day Trial</span>
                        )}
                     </div>
                     <div className="flex items-end gap-2 mb-8">
                        <span className="text-4xl font-black text-indigo-600 tracking-tighter">{plan.price}</span>
                        <span className="text-xs font-bold text-slate-400 mb-1">/ {plan.billingCycle.toLowerCase()}</span>
                     </div>
                     
                     <div className="space-y-4 mb-8">
                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Ecosystem Rules</p>
                          <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                             <span>Commission: {plan.commission}</span>
                             <span>Max Units: {plan.maxUnits}</span>
                          </div>
                        </div>
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
                     Configure Tier Details
                  </button>
               </div>
             ))}
          </div>
        </div>
      )}

      {activeTab === 'finance' && (
        <div className="space-y-10 animate-fade-up">
           <div className="grid lg:grid-cols-3 gap-8">
              {[
                { label: 'Platform Processed (GTV)', value: 'Rp 4.82B', icon: 'fa-vault', color: 'text-indigo-600', bg: 'bg-indigo-50' },
                { label: 'Revenue Net (Commission)', value: 'Rp 542M', icon: 'fa-piggy-bank', color: 'text-emerald-600', bg: 'bg-emerald-50' },
                { label: 'Unsettled Liability', value: 'Rp 82.4M', icon: 'fa-money-bill-transfer', color: 'text-amber-600', bg: 'bg-amber-50' },
              ].map((kpi, i) => (
                <div key={i} className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 ${kpi.bg} ${kpi.color}`}>
                    <i className={`fas ${kpi.icon} text-lg`}></i>
                  </div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{kpi.label}</p>
                  <h3 className="text-3xl font-black text-slate-900 tracking-tighter">{kpi.value}</h3>
                </div>
              ))}
           </div>

           <div className="grid lg:grid-cols-3 gap-10">
              <div className="lg:col-span-2 space-y-10">
                 <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
                    <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
                       <h3 className="font-black text-xl text-slate-900 tracking-tight">Financial Ledger</h3>
                    </div>
                    <div className="overflow-x-auto">
                       <table className="w-full text-left">
                          <thead>
                             <tr className="bg-slate-50/50 text-slate-400 text-[9px] font-black uppercase tracking-widest">
                                <th className="px-8 py-5">TXID</th>
                                <th className="px-8 py-5">Category</th>
                                <th className="px-8 py-5 text-right">Value</th>
                                <th className="px-8 py-5">Status</th>
                             </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-50">
                             {transactions.map(tx => (
                               <tr key={tx.id} className="hover:bg-slate-50/50 transition-all">
                                  <td className="px-8 py-6 font-bold text-slate-400 text-xs">{tx.id.toUpperCase()}</td>
                                  <td className="px-8 py-6">
                                     <p className="text-xs font-black text-slate-800 leading-none mb-1">{tx.type.replace('_', ' ').toUpperCase()}</p>
                                     <p className="text-[10px] text-slate-400 font-medium">{tx.createdAt}</p>
                                  </td>
                                  <td className="px-8 py-6 text-right font-black text-slate-900 text-xs">Rp {tx.amount.toLocaleString()}</td>
                                  <td className="px-8 py-6">
                                     <span className={`px-2 py-1 rounded text-[8px] font-black uppercase border ${
                                       tx.status === 'completed' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'
                                     }`}>{tx.status}</span>
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
                    <h3 className="font-black text-2xl tracking-tight mb-8 relative z-10">Gateway Hub</h3>
                    <div className="space-y-6 relative z-10">
                       <div className="p-6 bg-white/5 rounded-3xl border border-white/10 space-y-4">
                          <div className="flex justify-between items-center">
                             <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Active Provider</span>
                             <span className="px-2 py-0.5 bg-emerald-500 text-white text-[8px] font-black rounded uppercase">Live</span>
                          </div>
                          <div className="flex items-center gap-4">
                             <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-slate-900 font-black italic">S.</div>
                             <div>
                                <p className="font-black">Stripe Integration</p>
                                <p className="text-[10px] text-slate-400">Merchant: SEULANGA_TREASURY</p>
                             </div>
                          </div>
                       </div>
                       <button className="w-full py-4 bg-white text-slate-950 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all">Configure Keys</button>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* Audit Logs View */}
      {activeTab === 'logs' && (
        <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden animate-fade-up">
           <div className="p-10 border-b border-slate-50 flex items-center justify-between bg-slate-50/20">
              <div>
                <h3 className="font-black text-2xl text-slate-900 tracking-tight">System Audit Matrix</h3>
                <p className="text-slate-400 font-medium text-sm">Real-time security and management activity log.</p>
              </div>
              <div className="relative">
                <button 
                  onClick={() => setShowExportDropdown(!showExportDropdown)}
                  className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black text-sm flex items-center gap-3 shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all"
                >
                  <i className="fas fa-download"></i> Export Logs
                </button>
                {showExportDropdown && (
                  <div className="absolute right-0 mt-3 w-48 bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden z-50 p-2 animate-in zoom-in-95 duration-200 origin-top-right">
                    <button 
                      onClick={handleExportCSV}
                      className="w-full flex items-center gap-3 p-4 hover:bg-slate-50 rounded-2xl transition-all group"
                    >
                      <div className="w-8 h-8 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all">
                        <i className="fas fa-file-csv"></i>
                      </div>
                      <span className="text-xs font-bold text-slate-700">Export as CSV</span>
                    </button>
                    <button 
                      onClick={handleExportJSON}
                      className="w-full flex items-center gap-3 p-4 hover:bg-slate-50 rounded-2xl transition-all group"
                    >
                      <div className="w-8 h-8 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-all">
                        <i className="fas fa-file-code"></i>
                      </div>
                      <span className="text-xs font-bold text-slate-700">Export as JSON</span>
                    </button>
                  </div>
                )}
              </div>
           </div>
           <div className="overflow-x-auto">
              <table className="w-full text-left">
                 <thead>
                    <tr className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                       <th className="px-10 py-6">Timestamp</th>
                       <th className="px-10 py-6">Administrator</th>
                       <th className="px-10 py-6">Action Protocol</th>
                       <th className="px-10 py-6">Target Entity</th>
                       <th className="px-10 py-6">Log Class</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-50">
                    {auditLogs.map(log => (
                       <tr key={log.id} className="hover:bg-slate-50/50 transition-all">
                          <td className="px-10 py-6 text-xs font-bold text-slate-500">{log.timestamp}</td>
                          <td className="px-10 py-6">
                             <div className="flex items-center gap-3">
                                <span className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-black text-[10px]">{log.actorName[0]}</span>
                                <span className="text-xs font-bold text-slate-700">{log.actorName}</span>
                             </div>
                          </td>
                          <td className="px-10 py-6 text-xs font-black text-slate-900">{log.action}</td>
                          <td className="px-10 py-6 text-xs font-bold text-slate-500">{log.target}</td>
                          <td className="px-10 py-6">
                             <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                               log.type === 'financial' ? 'bg-emerald-50 text-emerald-600' :
                               log.type === 'security' ? 'bg-rose-50 text-rose-600' :
                               'bg-indigo-50 text-indigo-600'
                             }`}>
                                {log.type}
                             </span>
                          </td>
                       </tr>
                    ))}
                 </tbody>
              </table>
           </div>
        </div>
      )}

      {/* Global Settings Center */}
      {activeTab === 'settings' && (
        <div className="grid lg:grid-cols-3 gap-10 animate-fade-up">
          <div className="lg:col-span-2 space-y-10">
            <div className="bg-white p-10 rounded-[48px] border border-slate-100 shadow-sm">
              <h3 className="text-3xl font-black text-slate-900 tracking-tight mb-10">Global Platform Configuration</h3>
              <form onSubmit={handleUpdateSettings} className="space-y-12">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Master Platform Branding</label>
                    <input name="platformName" defaultValue={platformSettings.platformName} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 font-bold text-slate-900 focus:outline-none focus:ring-4 ring-indigo-50 transition-all" />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Governance Correspondence</label>
                    <input name="legalEmail" type="email" defaultValue={platformSettings.legalEmail} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 font-bold text-slate-900 focus:outline-none focus:ring-4 ring-indigo-50 transition-all" />
                  </div>
                </div>

                <div className="pt-10 border-t border-slate-50">
                  <h4 className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-6">Financial Settlement Protocol</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Base Commission Rate (%)</label>
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
                       { key: 'maintenanceMode', label: 'Global Maintenance Protocol', desc: 'Lock platform for infrastructure updates.' },
                       { key: 'publicRegistration', label: 'Open Partner Onboarding', desc: 'Allow businesses to submit registration requests.' },
                       { key: 'aiInsightsEnabled', label: 'Gemini Strategy Engine', desc: 'Activate AI business analysis for partners.' },
                       { key: 'mfaRequired', label: 'Compulsory MFA Auth', desc: 'Enforce 2FA for all administrative accounts.' },
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
                  <button type="submit" className="px-12 py-5 bg-slate-950 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-600 shadow-2xl shadow-indigo-100 transition-all">Synchronize Global Policy</button>
                </div>
              </form>
            </div>
          </div>

          <div className="space-y-8">
            <div className="bg-slate-950 p-10 rounded-[48px] shadow-2xl text-white relative overflow-hidden">
               <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl -mr-32 -mt-32"></div>
               <h3 className="font-black text-2xl tracking-tight mb-8 relative z-10">Infrastructure Node</h3>
               <div className="space-y-6 relative z-10">
                  <div className="p-6 bg-white/5 rounded-3xl border border-white/10 space-y-2">
                     <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Environment Status</p>
                     <p className="text-sm font-black text-emerald-400">Production Live (V.3.1.2)</p>
                  </div>
                  <div className="p-6 bg-white/5 rounded-3xl border border-white/10 space-y-2">
                     <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Primary Database</p>
                     <p className="text-sm font-black text-indigo-100">Multi-tenant PostgreSQL Cluster</p>
                  </div>
                  <button className="w-full py-4 bg-white/5 border border-white/10 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-white/10 transition-all">Flush System Cache</button>
               </div>
            </div>

            <div className="bg-white p-10 rounded-[48px] border border-slate-100 shadow-sm flex flex-col items-center text-center">
               <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 mb-6">
                  <i className="fas fa-file-shield text-2xl"></i>
               </div>
               <h4 className="font-black text-xl text-slate-900 mb-2">Policy Archives</h4>
               <p className="text-slate-500 text-xs font-medium mb-8 leading-relaxed">Update the legal framework and service agreements for the entire SEULANGA ecosystem.</p>
               <button className="w-full py-4 bg-slate-50 text-slate-900 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-50 hover:text-indigo-600 transition-all">Configure Terms</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
