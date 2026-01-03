import React, { useState, useMemo } from 'react';
import { MOCK_BUSINESSES, MOCK_TRANSACTIONS, MOCK_AUDIT_LOGS, MOCK_USERS, MOCK_REVIEWS, TRANSLATIONS, MOCK_BOOKINGS, DEFAULT_CATEGORY_MODULE_MAP } from '../constants';
import { BusinessCategory, SubscriptionPlan, Business, AuditLog, UserRole, BusinessStatus, Review, Transaction, User, VerificationStatus, CategoryModuleConfig, SystemModule, BookingStatus, Booking } from '../types';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, AreaChart, Area, ComposedChart, Line, Legend, PieChart, Pie, Cell
} from 'recharts';

// Enhanced mock data for trends
const platformTrendData = [
  { name: 'Jul', revenue: 450, commission: 67, bookings: 120 },
  { name: 'Aug', revenue: 520, commission: 78, bookings: 155 },
  { name: 'Sep', revenue: 480, commission: 72, bookings: 142 },
  { name: 'Oct', revenue: 610, commission: 91, bookings: 198 },
  { name: 'Nov', revenue: 680, commission: 102, bookings: 215 },
  { name: 'Dec', revenue: 850, commission: 127, bookings: 290 },
];

const revenueMixData = [
  { name: 'Subscriptions', value: 45, color: '#4f46e5' },
  { name: 'Commissions', value: 35, color: '#10b981' },
  { name: 'Featured Ads', value: 20, color: '#f59e0b' },
];

interface SubPlan {
  id: string;
  name: string;
  price: number;
  commission: number;
  features: string[];
  status: 'active' | 'archived';
}

const INITIAL_PLANS: SubPlan[] = [
  { id: 'p1', name: 'Basic Access', price: 0, commission: 15, features: ['Community Support', 'Standard Listing', 'Basic Analytics'], status: 'active' },
  { id: 'p2', name: 'Growth Pro', price: 499000, commission: 10, features: ['Priority Search', 'Staff Accounts (Max 10)', 'Advanced Analytics', 'SMS Alerts'], status: 'active' },
  { id: 'p3', name: 'Elite Premium', price: 1200000, commission: 5, features: ['24/7 Concierge', 'AI Insights', 'Custom Reports', 'Featured Ads (2/mo)', 'Zero Service Fee'], status: 'active' },
];

const PERMISSION_KEYS = [
  'platform_config',
  'user_termination',
  'audit_view',
  'business_mgmt',
  'revenue_payout',
  'staff_mgmt',
  'booking_mgmt',
  'review_mgmt',
  'listing_post'
];

interface SuperAdminDashboardProps {
  activeTab: 'overview' | 'analytics' | 'monetization' | 'tenants' | 'reviews' | 'finance' | 'logs' | 'settings' | 'profile' | 'engine' | 'accounts' | 'matrix' | 'oversight';
  onNavigate: (view: string, subView?: string) => void;
  language: 'id' | 'en';
  moduleConfigs: CategoryModuleConfig;
  onUpdateModuleConfigs: (configs: CategoryModuleConfig) => void;
  currentUser: User | null;
  onUpdateUser: (data: Partial<User>) => void;
}

export const SuperAdminDashboard: React.FC<SuperAdminDashboardProps> = ({ 
  activeTab, 
  onNavigate, 
  language,
  moduleConfigs,
  onUpdateModuleConfigs,
  currentUser,
  onUpdateUser
}) => {
  const [businesses] = useState<Business[]>(MOCK_BUSINESSES);
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const [bookings] = useState<Booking[]>(MOCK_BOOKINGS);
  const [plans, setPlans] = useState<SubPlan[]>(INITIAL_PLANS);
  const [transactions] = useState<Transaction[]>(MOCK_TRANSACTIONS);
  
  // Monetization States
  const [globalCommission, setGlobalCommission] = useState(12);
  const [adSlotPrice, setAdSlotPrice] = useState(75000);
  
  // Oversight Filter States
  const [oversightBizFilter, setOversightBizFilter] = useState<string>('ALL');
  const [oversightDateFilter, setOversightDateFilter] = useState<string>('');
  const [showAnomaliesOnly, setShowAnomaliesOnly] = useState(false);

  const [categories, setCategories] = useState<string[]>(Object.values(BusinessCategory));
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  
  const [planModuleMapping] = useState<Record<SubscriptionPlan, SystemModule[]>>({
    [SubscriptionPlan.BASIC]: [SystemModule.BOOKING, SystemModule.REVIEWS],
    [SubscriptionPlan.PRO]: [SystemModule.BOOKING, SystemModule.REVIEWS, SystemModule.PAYMENT, SystemModule.MARKETING],
    [SubscriptionPlan.PREMIUM]: Object.values(SystemModule)
  });

  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);
  const [isAddingBusiness, setIsAddingBusiness] = useState(false);
  const [isAddingOwner, setIsAddingOwner] = useState(false);
  const [accountSearch, setAccountSearch] = useState('');
  const [accountFilter, setAccountFilter] = useState<UserRole | 'ALL'>('ALL');
  
  const [newOwnerData, setNewOwnerData] = useState({ name: '', email: '', password: '' });
  const [newBizData, setNewBizData] = useState({ name: '', category: BusinessCategory.HOTEL, address: '', ownerEmail: '', subscription: SubscriptionPlan.BASIC });
  
  const [rolePermissions, setRolePermissions] = useState<Record<UserRole, string[]>>({
    [UserRole.SUPER_ADMIN]: PERMISSION_KEYS,
    [UserRole.BUSINESS_OWNER]: ['business_mgmt', 'revenue_payout', 'staff_mgmt', 'booking_mgmt', 'review_mgmt'],
    [UserRole.ADMIN_STAFF]: ['booking_mgmt', 'review_mgmt'],
    [UserRole.GUEST]: ['booking_mgmt', 'listing_post']
  });

  const [profileName, setProfileName] = useState(currentUser?.name || '');
  const [isSaving, setIsSaving] = useState(false);

  const t = TRANSLATIONS[language];

  // Global Oversight Logic
  const filteredBookings = useMemo(() => {
    return bookings.filter(bk => {
      const matchBiz = oversightBizFilter === 'ALL' || bk.businessId === oversightBizFilter;
      const matchDate = !oversightDateFilter || bk.checkIn.includes(oversightDateFilter);
      
      // Anomaly Heuristics
      const isOutlierPrice = bk.totalPrice > 4000000;
      const isUnverifiedPayment = !bk.verifiedPayment && bk.status === BookingStatus.CONFIRMED;
      const isAnomaly = isOutlierPrice || isUnverifiedPayment;

      if (showAnomaliesOnly) return matchBiz && matchDate && isAnomaly;
      return matchBiz && matchDate;
    });
  }, [bookings, oversightBizFilter, oversightDateFilter, showAnomaliesOnly]);

  const detectAnomalyReason = (bk: Booking) => {
    const reasons = [];
    if (bk.totalPrice > 4000000) reasons.push("Extreme Price (Outlier)");
    if (!bk.verifiedPayment && bk.status === BookingStatus.CONFIRMED) reasons.push("Confirmed w/o Proof");
    return reasons.join(", ");
  };

  const handleUpdatePlanPrice = (id: string, newPrice: number) => {
    setPlans(prev => prev.map(p => p.id === id ? { ...p, price: newPrice } : p));
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    await new Promise(r => setTimeout(r, 1000));
    onUpdateUser({ name: profileName });
    setIsSaving(false);
    alert('Governing Identity Updated.');
  };

  const renderOversight = () => (
    <div className="space-y-10 animate-fade-up">
       <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
             <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">Cross-Business Surveillance</h2>
             <p className="text-slate-400 text-xs font-medium">Unified monitoring of all operational nodes</p>
          </div>
          <div className="flex gap-4">
             <button 
                onClick={() => alert('Compiling global ledger for export... CSV Authorized.')}
                className="px-8 py-4 bg-slate-100 text-slate-900 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-slate-200 transition-all"
             >
                <i className="fas fa-file-export mr-2"></i> Export Data
             </button>
             <button 
                onClick={() => setShowAnomaliesOnly(!showAnomaliesOnly)}
                className={`px-8 py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all shadow-xl ${
                  showAnomaliesOnly ? 'bg-rose-600 text-white shadow-rose-100' : 'bg-white border border-slate-200 text-slate-400'
                }`}
             >
                <i className="fas fa-radar mr-2"></i> {showAnomaliesOnly ? 'Anomaly Lock Active' : 'Normal Monitoring'}
             </button>
          </div>
       </div>

       <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Business Entity Cluster</label>
             <select 
                value={oversightBizFilter}
                onChange={(e) => setOversightBizFilter(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-xs font-bold outline-none focus:ring-4 ring-indigo-50"
             >
                <option value="ALL">All Active Hubs</option>
                {businesses.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
             </select>
          </div>
          <div className="space-y-2">
             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Temporal Filter</label>
             <input 
                type="date"
                value={oversightDateFilter}
                onChange={(e) => setOversightDateFilter(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-xs font-bold outline-none focus:ring-4 ring-indigo-50"
             />
          </div>
          <div className="flex items-end">
             <div className="w-full p-4 bg-indigo-50 rounded-2xl border border-indigo-100 flex items-center justify-between">
                <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Active Threads</span>
                <span className="text-xl font-black text-indigo-700">{filteredBookings.length} Bookings</span>
             </div>
          </div>
       </div>

       <div className="bg-white rounded-[48px] border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
             <table className="w-full text-left">
                <thead className="bg-slate-50/50 border-b border-slate-100">
                   <tr>
                      <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Entity / Node</th>
                      <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Guest Context</th>
                      <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Value (GTV)</th>
                      <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Protocol</th>
                      <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Heuristic Check</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                   {filteredBookings.map(bk => {
                     const biz = businesses.find(b => b.id === bk.businessId);
                     const anomalyReason = detectAnomalyReason(bk);
                     return (
                       <tr key={bk.id} className={`hover:bg-slate-50/50 transition-colors ${anomalyReason ? 'bg-rose-50/20' : ''}`}>
                          <td className="px-8 py-6">
                             <div>
                                <p className="font-black text-slate-900">{biz?.name}</p>
                                <p className="text-[10px] font-bold text-slate-400 uppercase">{bk.id}</p>
                             </div>
                          </td>
                          <td className="px-8 py-6">
                             <div>
                                <p className="font-black text-slate-700">G-NODE-{bk.guestId.toUpperCase()}</p>
                                <p className="text-[10px] font-bold text-slate-400 uppercase">{bk.checkIn} → {bk.checkOut}</p>
                             </div>
                          </td>
                          <td className="px-8 py-6 font-black text-slate-900">
                             Rp {bk.totalPrice.toLocaleString()}
                          </td>
                          <td className="px-8 py-6">
                             <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                               bk.status === BookingStatus.CONFIRMED ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-50 text-slate-400 border-slate-100'
                             }`}>
                                {bk.status}
                             </span>
                          </td>
                          <td className="px-8 py-6">
                             {anomalyReason ? (
                               <div className="flex items-center gap-2 text-rose-500 animate-pulse">
                                  <i className="fas fa-triangle-exclamation"></i>
                                  <span className="text-[10px] font-black uppercase tracking-tight">{anomalyReason}</span>
                               </div>
                             ) : (
                               <div className="flex items-center gap-2 text-emerald-500">
                                  <i className="fas fa-circle-check"></i>
                                  <span className="text-[10px] font-black uppercase tracking-tight">Pattern Normal</span>
                               </div>
                             )}
                          </td>
                       </tr>
                     );
                   })}
                </tbody>
             </table>
          </div>
       </div>
    </div>
  );

  const renderMonetization = () => (
    <div className="space-y-12 animate-fade-up">
       <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div className="bg-white p-10 rounded-[48px] border border-slate-100 shadow-sm space-y-10">
             <div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tighter uppercase">Economic Logic Control</h3>
                <p className="text-slate-400 text-xs font-medium">Define transaction tax and recurring billing</p>
             </div>
             
             <div className="space-y-8">
                <div className="p-8 bg-indigo-50 rounded-[32px] border border-indigo-100 flex items-center justify-between">
                   <div>
                      <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Base Platform Commission</p>
                      <h4 className="text-4xl font-black text-indigo-700">{globalCommission}%</h4>
                   </div>
                   <input 
                      type="range" min="1" max="30" value={globalCommission} 
                      onChange={(e) => setGlobalCommission(parseInt(e.target.value))}
                      className="w-48 h-2 bg-indigo-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                   />
                </div>
                
                <div className="p-8 bg-amber-50 rounded-[32px] border border-amber-100 flex items-center justify-between">
                   <div>
                      <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-1">Featured Listing (Daily)</p>
                      <h4 className="text-3xl font-black text-amber-700">Rp {adSlotPrice.toLocaleString()}</h4>
                   </div>
                   <div className="flex items-center gap-3">
                      <button onClick={() => setAdSlotPrice(p => p - 5000)} className="w-10 h-10 bg-white border border-amber-200 text-amber-600 rounded-xl">-</button>
                      <button onClick={() => setAdSlotPrice(p => p + 5000)} className="w-10 h-10 bg-white border border-amber-200 text-amber-600 rounded-xl">+</button>
                   </div>
                </div>
             </div>
          </div>

          <div className="bg-slate-950 p-10 rounded-[48px] shadow-2xl text-white space-y-10 relative overflow-hidden">
             <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
             <div className="relative z-10">
                <h3 className="text-2xl font-black tracking-tighter uppercase">Subscription Tier Architect</h3>
                <p className="text-indigo-200/40 text-xs font-medium mb-10">Manage recurring access logic</p>
                
                <div className="space-y-4">
                   {plans.map(plan => (
                     <div key={plan.id} className="p-6 bg-white/5 border border-white/10 rounded-3xl hover:bg-white/10 transition-all">
                        <div className="flex items-center justify-between mb-4">
                           <p className="font-black uppercase text-xs tracking-tight">{plan.name}</p>
                           <div className="flex items-center gap-2">
                              <span className="text-[10px] font-black opacity-40">Rp</span>
                              <input 
                                 type="number" value={plan.price} 
                                 onChange={(e) => handleUpdatePlanPrice(plan.id, parseInt(e.target.value))}
                                 className="bg-transparent border-b border-white/20 text-xl font-black text-right w-32 outline-none focus:border-indigo-500"
                              />
                           </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                           {plan.features.slice(0, 3).map(f => (
                             <span key={f} className="text-[8px] font-black uppercase tracking-widest text-indigo-300 bg-indigo-950/50 px-2 py-1 rounded-md border border-indigo-500/20">{f}</span>
                           ))}
                        </div>
                     </div>
                   ))}
                </div>
             </div>
          </div>
       </div>
    </div>
  );

  const renderFinance = () => (
    <div className="space-y-12 animate-fade-up">
       <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {[
            { label: 'Platform Net GTV', value: 'Rp 8.4B', trend: '+22%', color: 'text-indigo-600', icon: 'fa-globe' },
            { label: 'Gross Commission', value: 'Rp 426M', trend: '+12%', color: 'text-emerald-600', icon: 'fa-sack-dollar' },
            { label: 'Subscription Rev', value: 'Rp 280M', trend: '+5%', color: 'text-violet-600', icon: 'fa-gem' },
            { label: 'Pending Payouts', value: 'Rp 1.1B', trend: 'Audit Req', color: 'text-amber-600', icon: 'fa-vault' },
          ].map((stat, i) => (
            <div key={i} className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm">
               <div className="flex items-center justify-between mb-6">
                  <div className={`w-12 h-12 bg-slate-50 ${stat.color} rounded-2xl flex items-center justify-center text-lg`}>
                     <i className={`fas ${stat.icon}`}></i>
                  </div>
                  <span className="text-[10px] font-black text-slate-300">{stat.trend}</span>
               </div>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
               <h3 className="text-3xl font-black text-slate-900 tracking-tighter">{stat.value}</h3>
            </div>
          ))}
       </div>

       <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 bg-white p-12 rounded-[48px] border border-slate-100 shadow-sm">
             <div className="flex items-center justify-between mb-12">
                <div>
                   <h3 className="text-2xl font-black text-slate-900 tracking-tighter uppercase">Revenue Growth Analysis</h3>
                   <p className="text-slate-400 text-xs font-medium">Platform-wide income performance</p>
                </div>
             </div>
             <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                   <AreaChart data={platformTrendData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 800}} />
                      <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 800}} />
                      <Tooltip />
                      <Area type="monotone" dataKey="revenue" stroke="#4f46e5" strokeWidth={4} fillOpacity={0.1} fill="#4f46e5" />
                      <Area type="monotone" dataKey="commission" stroke="#10b981" strokeWidth={4} fillOpacity={0} />
                   </AreaChart>
                </ResponsiveContainer>
             </div>
          </div>

          <div className="bg-white p-12 rounded-[48px] border border-slate-100 shadow-sm">
             <h3 className="text-xl font-black text-slate-900 tracking-tighter uppercase mb-10 text-center">Revenue Mix</h3>
             <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                   <PieChart>
                      <Pie data={revenueMixData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={8} dataKey="value">
                         {revenueMixData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                      </Pie>
                      <Tooltip />
                   </PieChart>
                </ResponsiveContainer>
             </div>
             <div className="mt-8 space-y-4">
                {revenueMixData.map(item => (
                  <div key={item.name} className="flex items-center justify-between">
                     <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full" style={{backgroundColor: item.color}}></div>
                        <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest">{item.name}</span>
                     </div>
                     <span className="text-xs font-black text-slate-900">{item.value}%</span>
                  </div>
                ))}
             </div>
          </div>
       </div>

       <div className="bg-slate-950 p-12 rounded-[48px] shadow-2xl text-white space-y-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
             <div>
                <h3 className="text-3xl font-black tracking-tighter uppercase">Partner Payout Ledger</h3>
                <p className="text-indigo-200/40 text-xs font-medium">Verify and release funds to entity owners</p>
             </div>
             <button className="px-8 py-4 bg-white text-slate-900 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all">Process Cycle Payouts</button>
          </div>

          <div className="overflow-x-auto rounded-[32px] border border-white/10 bg-white/5">
             <table className="w-full text-left">
                <thead className="border-b border-white/10 bg-white/5">
                   <tr>
                      <th className="px-8 py-6 text-[10px] font-black text-indigo-300 uppercase tracking-widest">Partner Node</th>
                      <th className="px-8 py-6 text-[10px] font-black text-indigo-300 uppercase tracking-widest">Net Payable</th>
                      <th className="px-8 py-6 text-[10px] font-black text-indigo-300 uppercase tracking-widest">Status</th>
                      <th className="px-8 py-6 text-[10px] font-black text-indigo-300 uppercase tracking-widest text-right">Authorize</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                   {businesses.map(b => (
                     <tr key={b.id} className="hover:bg-white/5 transition-all">
                        <td className="px-8 py-6">
                           <p className="font-black text-white">{b.name}</p>
                           <p className="text-[10px] text-white/30 uppercase">{b.id}</p>
                        </td>
                        <td className="px-8 py-6 font-black text-emerald-400">
                           Rp {(Math.random() * 50000000 + 10000000).toLocaleString()}
                        </td>
                        <td className="px-8 py-6">
                           <span className="px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border bg-amber-500/10 text-amber-500 border-amber-500/20">VERIFICATION</span>
                        </td>
                        <td className="px-8 py-6 text-right">
                           <button className="p-3 bg-white/10 text-white rounded-xl hover:bg-indigo-600 transition-all">
                              <i className="fas fa-check-double text-xs"></i>
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

  const renderOverview = () => (
    <div className="space-y-10 animate-fade-up">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm relative overflow-hidden group">
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-8">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Business Topology</h4>
              <i className="fas fa-building-circle-check text-indigo-200 text-xl group-hover:text-indigo-600 transition-colors"></i>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-3xl font-black text-slate-900">{businesses.filter(b => b.status === 'active').length}</p>
                <p className="text-[9px] font-bold text-emerald-500 uppercase mt-1">Active</p>
              </div>
              <div className="text-center border-x border-slate-50">
                <p className="text-3xl font-black text-slate-900">{businesses.filter(b => b.status === 'pending').length}</p>
                <p className="text-[9px] font-bold text-amber-500 uppercase mt-1">Pending</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-black text-slate-900">{businesses.filter(b => b.status === 'suspended').length}</p>
                <p className="text-[9px] font-bold text-rose-500 uppercase mt-1">Suspended</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm relative overflow-hidden group">
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-8">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">User Nodes</h4>
              <i className="fas fa-users-viewfinder text-indigo-200 text-xl group-hover:text-indigo-600 transition-colors"></i>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-3xl font-black text-slate-900">{users.filter(u => u.role === UserRole.BUSINESS_OWNER).length}</p>
                <p className="text-[9px] font-bold text-slate-400 uppercase mt-1">Owners</p>
              </div>
              <div className="text-center border-x border-slate-50">
                <p className="text-3xl font-black text-slate-900">{users.filter(u => u.role === UserRole.SUPER_ADMIN || u.role === UserRole.ADMIN_STAFF).length}</p>
                <p className="text-[9px] font-bold text-slate-400 uppercase mt-1">Admins</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-black text-slate-900">{users.filter(u => u.role === UserRole.GUEST).length}</p>
                <p className="text-[9px] font-bold text-slate-400 uppercase mt-1">Guests</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-slate-950 p-8 rounded-[40px] shadow-xl relative overflow-hidden text-white">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <h4 className="text-[10px] font-black text-indigo-300 uppercase tracking-widest">Net Revenue Hub</h4>
              <span className="bg-indigo-600/20 text-indigo-400 text-[9px] px-2 py-0.5 rounded-md font-black">LIVE</span>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-[9px] font-black text-slate-500 uppercase mb-1">Total Platform Revenue</p>
                <p className="text-2xl font-black">Rp 842.2M</p>
              </div>
              <div className="pt-4 border-t border-white/5">
                <p className="text-[9px] font-black text-indigo-400 uppercase mb-1">SEULANGA Commission</p>
                <p className="text-xl font-black text-emerald-400">Rp 126.3M</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-10 rounded-[48px] border border-slate-100 shadow-sm">
           <div className="flex items-center justify-between mb-10">
              <h3 className="text-xl font-black text-slate-900 tracking-tighter uppercase">Global Performance</h3>
           </div>
           <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                 <ComposedChart data={platformTrendData}>
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 900}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 900}} />
                    <Tooltip />
                    <Bar dataKey="revenue" fill="#4f46e5" radius={[10, 10, 0, 0]} barSize={30} />
                    <Line type="monotone" dataKey="bookings" stroke="#10b981" strokeWidth={4} dot={{r: 6, fill: '#10b981', strokeWidth: 4, stroke: '#fff'}} />
                 </ComposedChart>
              </ResponsiveContainer>
           </div>
        </div>

        <div className="space-y-8">
           <div onClick={() => onNavigate('super-admin', 'oversight')} className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm flex items-center justify-between group cursor-pointer hover:border-indigo-600 transition-all">
              <div className="flex items-center gap-6">
                 <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center text-xl shadow-inner group-hover:bg-indigo-600 group-hover:text-white transition-all">
                    <i className="fas fa-eye"></i>
                 </div>
                 <div>
                    <h4 className="font-black text-slate-900 uppercase text-xs tracking-widest">Cross-Business Oversight</h4>
                    <p className="text-[10px] font-bold text-slate-400 mt-1">Analyze global ecosystem behaviors</p>
                 </div>
              </div>
              <button className="w-10 h-10 bg-slate-50 text-slate-400 rounded-xl flex items-center justify-center group-hover:bg-slate-900 group-hover:text-white transition-all">
                 <i className="fas fa-chevron-right text-xs"></i>
              </button>
           </div>

           <div onClick={() => onNavigate('super-admin', 'finance')} className="bg-indigo-600 p-8 rounded-[40px] shadow-2xl text-white relative overflow-hidden group cursor-pointer">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700"></div>
              <div className="relative z-10 flex flex-col justify-between h-full min-h-[160px]">
                 <div>
                    <h4 className="text-2xl font-black tracking-tighter uppercase mb-2">Treasury HUD</h4>
                    <p className="text-indigo-100/60 text-[10px] font-bold uppercase tracking-widest">Real-time revenue stream</p>
                 </div>
                 <div className="flex items-end justify-between">
                    <span className="text-4xl font-black tracking-tighter">Rp 426M</span>
                    <i className="fas fa-vault text-4xl text-white/20"></i>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );

  const renderProfile = () => (
    <div className="max-w-4xl mx-auto space-y-10 animate-fade-up">
       <div className="bg-white p-12 rounded-[48px] border border-slate-100 shadow-sm overflow-hidden relative">
          <div className="absolute top-0 right-0 w-80 h-80 bg-slate-50 rounded-full blur-3xl -mr-40 -mt-40"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-10 mb-12 pb-12 border-b border-slate-50">
             <div className="relative group">
                <img src={currentUser?.avatar} className="w-32 h-32 rounded-[40px] object-cover ring-8 ring-slate-50 shadow-xl" />
                <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center shadow-lg border-4 border-white">
                   <i className="fas fa-shield-check text-xs"></i>
                </div>
             </div>
             <div>
                <h3 className="text-4xl font-black text-slate-900 tracking-tighter mb-2">{currentUser?.name}</h3>
                <div className="flex flex-wrap gap-4">
                   <span className="px-4 py-1.5 bg-indigo-600 text-white text-[10px] font-black uppercase rounded-full">SUPER ADMIN</span>
                   <span className="px-4 py-1.5 bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase rounded-full border border-emerald-100">PLATFORM MASTER</span>
                </div>
             </div>
          </div>

          <form onSubmit={handleUpdateProfile} className="relative z-10 space-y-8">
             <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Administrative Identity Name</label>
                <div className="relative">
                   <i className="fas fa-user-shield absolute left-6 top-1/2 -translate-y-1/2 text-slate-300"></i>
                   <input 
                      type="text" value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-3xl px-14 py-4 font-bold text-slate-900 focus:outline-none focus:ring-4 ring-indigo-50"
                   />
                </div>
             </div>
             <button disabled={isSaving} className="w-full py-5 bg-slate-950 text-white rounded-3xl font-black text-xs uppercase tracking-widest shadow-xl hover:bg-indigo-600 transition-all">
                {isSaving ? <i className="fas fa-spinner fa-spin mr-2"></i> : <i className="fas fa-save mr-2"></i>}
                Sync Governing Profile
             </button>
          </form>
       </div>
    </div>
  );

  return (
    <div className="space-y-12 animate-fade-up">
      <div className="bg-white p-10 rounded-[48px] border border-slate-100 shadow-sm relative overflow-hidden">
        <div className="relative z-10 flex flex-col xl:flex-row xl:items-center justify-between gap-10">
          <div className="flex items-center gap-8">
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter">Governance Node<span className="text-indigo-600">.</span></h1>
          </div>
          <div className="flex bg-slate-100/80 backdrop-blur p-2 rounded-[28px] border border-slate-200/40 gap-1 overflow-x-auto scrollbar-hide">
            {[
              { id: 'overview', label: t.ecosystem, icon: 'fa-brain' },
              { id: 'oversight', label: 'Oversight', icon: 'fa-crosshairs' },
              { id: 'monetization', label: 'Monetization', icon: 'fa-coins' },
              { id: 'finance', label: t.treasury, icon: 'fa-receipt' },
              { id: 'engine', label: 'Flex Engine', icon: 'fa-microchip' },
              { id: 'tenants', label: 'Tenants', icon: 'fa-building-shield' },
              { id: 'accounts', label: 'Accounts', icon: 'fa-users-gear' },
              { id: 'profile', label: 'My Identity', icon: 'fa-user-lock' }
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

      <div className="max-w-[1500px] mx-auto pb-20">
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'oversight' && renderOversight()}
        {activeTab === 'monetization' && renderMonetization()}
        {activeTab === 'finance' && renderFinance()}
        {activeTab === 'engine' && (
           <div className="py-40 text-center animate-fade-up">
              <h3 className="text-3xl font-black text-slate-900 mb-4 tracking-tighter uppercase">Topology Engine</h3>
              <p className="text-slate-500 font-medium">Modular category and system permission architect.</p>
           </div>
        )}
        {activeTab === 'tenants' && (
           <div className="py-40 text-center animate-fade-up">
              <h3 className="text-3xl font-black text-slate-900 mb-4 tracking-tighter uppercase">Tenant Management</h3>
              <p className="text-slate-500 font-medium">Global entity registry and audit control.</p>
           </div>
        )}
        {activeTab === 'accounts' && (
           <div className="py-40 text-center animate-fade-up">
              <h3 className="text-3xl font-black text-slate-900 mb-4 tracking-tighter uppercase">Account Governance</h3>
              <p className="text-slate-500 font-medium">RBAC matrix and identity termination protocols.</p>
           </div>
        )}
        {activeTab === 'profile' && renderProfile()}
      </div>
    </div>
  );
};
