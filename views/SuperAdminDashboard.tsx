
import React, { useState, useMemo } from 'react';
import { MOCK_BUSINESSES, MOCK_TRANSACTIONS, MOCK_AUDIT_LOGS, MOCK_USERS, MOCK_REVIEWS, TRANSLATIONS, MOCK_BOOKINGS, DEFAULT_CATEGORY_MODULE_MAP } from '../constants';
import { BusinessCategory, SubscriptionPlan, Business, AuditLog, UserRole, BusinessStatus, Review, Transaction, User, VerificationStatus, CategoryModuleConfig, SystemModule, BookingStatus, Booking, SEOMetadata, HomepageBanner } from '../types';
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
  activeTab: 'overview' | 'analytics' | 'monetization' | 'tenants' | 'reviews' | 'finance' | 'logs' | 'settings' | 'profile' | 'engine' | 'accounts' | 'matrix' | 'oversight' | 'quality';
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
  const [businesses, setBusinesses] = useState<Business[]>(MOCK_BUSINESSES.map(b => ({
    ...b,
    subscriptionExpiry: b.subscriptionExpiry || '2025-12-31',
    isTrial: b.isTrial || false,
    isFeaturedRequested: Math.random() > 0.7,
    status: Math.random() > 0.8 ? 'pending' : b.status
  })));
  
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const [bookings] = useState<Booking[]>(MOCK_BOOKINGS);
  const [plans, setPlans] = useState<SubPlan[]>(INITIAL_PLANS);
  const [transactions] = useState<Transaction[]>(MOCK_TRANSACTIONS);
  
  // Platform Quality States
  const [seoMetadata, setSeoMetadata] = useState<SEOMetadata>({
    title: "SEULANGA | Elite Property & Hospitality OS",
    description: "Multi-tenant SaaS ecosystem for premium property management in Northern Sumatra.",
    keywords: ["SaaS", "Property", "Hospitality", "Aceh", "Sumatra", "Luxury"]
  });

  const [banners, setBanners] = useState<HomepageBanner[]>([
    { id: 'b-1', title: 'REDEFINING HOSPITALITY.', subtitle: 'The elite multi-tenant ecosystem for premium property management.', imageUrl: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=2070', isActive: true, order: 1 }
  ]);

  // Monetization States
  const [globalCommission, setGlobalCommission] = useState(12);
  const [adSlotPrice, setAdSlotPrice] = useState(75000);
  
  // Oversight Filter States
  const [oversightBizFilter, setOversightBizFilter] = useState<string>('ALL');
  const [oversightDateFilter, setOversightDateFilter] = useState<string>('');
  const [showAnomaliesOnly, setShowAnomaliesOnly] = useState(false);

  // Subscription Control States
  const [isSubModalOpen, setIsSubModalOpen] = useState(false);
  const [activeBizForSub, setActiveBizForSub] = useState<Business | null>(null);

  const t = TRANSLATIONS[language];

  // Logic for Global Oversight & Anomaly Detection
  const filteredBookings = useMemo(() => {
    return bookings.filter(bk => {
      const matchBiz = oversightBizFilter === 'ALL' || bk.businessId === oversightBizFilter;
      const matchDate = !oversightDateFilter || bk.checkIn.includes(oversightDateFilter);
      const isOutlierPrice = bk.totalPrice > 4000000;
      const isUnverifiedPayment = !bk.verifiedPayment && bk.status === BookingStatus.CONFIRMED;
      const isAnomaly = isOutlierPrice || isUnverifiedPayment;
      if (showAnomaliesOnly) return matchBiz && matchDate && isAnomaly;
      return matchBiz && matchDate;
    });
  }, [bookings, oversightBizFilter, oversightDateFilter, showAnomaliesOnly]);

  const detectAnomalyReason = (bk: Booking) => {
    const reasons = [];
    if (bk.totalPrice > 4000000) reasons.push("Price Outlier (>4M)");
    if (!bk.verifiedPayment && bk.status === BookingStatus.CONFIRMED) reasons.push("Unverified Payment Pattern");
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

  const handleModerateListing = (bizId: string, status: BusinessStatus) => {
    setBusinesses(prev => prev.map(b => b.id === bizId ? { ...b, status } : b));
    alert(`Listing ${bizId} moderation: ${status.toUpperCase()}`);
  };

  const handleApproveFeatured = (bizId: string) => {
    setBusinesses(prev => prev.map(b => b.id === bizId ? { ...b, isFeatured: true, isFeaturedRequested: false } : b));
    alert(`Featured status approved for node ${bizId}.`);
  };

  const [profileName, setProfileName] = useState(currentUser?.name || '');
  const [isSaving, setIsSaving] = useState(false);

  // Subscription Control Actions
  const handleUpdateTenantSubscription = (bizId: string, plan: SubscriptionPlan, expiry: string, isTrial: boolean) => {
    setBusinesses(prev => prev.map(b => b.id === bizId ? { ...b, subscription: plan, subscriptionExpiry: expiry, isTrial } : b));
    setIsSubModalOpen(false);
    alert(`Ecosystem protocol updated for ${bizId}. ${plan} node authorized until ${expiry}.`);
  };

  const handleGenerateInvoice = (biz: Business) => {
    alert(`Generating invoice sequence [INV-${Date.now()}] for ${biz.name}. Treasury notification dispatched.`);
  };

  const handleManualSuspend = (bizId: string) => {
    setBusinesses(prev => prev.map(b => b.id === bizId ? { ...b, status: b.status === 'suspended' ? 'active' : 'suspended' } : b));
    alert(`Entity ${bizId} status toggled. Ecosystem node access restricted/restored.`);
  };

  const renderQuality = () => (
    <div className="space-y-12 animate-fade-up">
       <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Moderation Module */}
          <div className="bg-white p-10 rounded-[48px] border border-slate-100 shadow-sm space-y-8">
             <div className="flex items-center justify-between">
                <div>
                   <h3 className="text-2xl font-black text-slate-900 tracking-tighter uppercase">Listing Moderation</h3>
                   <p className="text-slate-400 text-xs font-medium">Approve or reject pending property nodes</p>
                </div>
                <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
                   <i className="fas fa-gavel"></i>
                </div>
             </div>

             <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 scrollbar-hide">
                {businesses.filter(b => b.status === 'pending').length > 0 ? (
                  businesses.filter(b => b.status === 'pending').map(b => (
                    <div key={b.id} className="p-6 bg-slate-50 border border-slate-100 rounded-3xl flex items-center justify-between group hover:border-indigo-200 transition-all">
                       <div className="flex items-center gap-4">
                          <img src={b.images[0]} className="w-14 h-14 rounded-2xl object-cover shadow-sm" />
                          <div>
                             <h4 className="font-black text-slate-900 text-sm uppercase">{b.name}</h4>
                             <p className="text-[10px] text-slate-400 font-bold uppercase">{b.category} • {b.address.split(',')[0]}</p>
                          </div>
                       </div>
                       <div className="flex gap-2">
                          <button onClick={() => handleModerateListing(b.id, 'rejected')} className="w-10 h-10 bg-white text-rose-500 rounded-xl hover:bg-rose-500 hover:text-white transition-all shadow-sm border border-rose-100">
                             <i className="fas fa-times text-xs"></i>
                          </button>
                          <button onClick={() => handleModerateListing(b.id, 'active')} className="w-10 h-10 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all shadow-lg">
                             <i className="fas fa-check text-xs"></i>
                          </button>
                       </div>
                    </div>
                  ))
                ) : (
                  <div className="py-10 text-center text-slate-300 font-black text-[10px] uppercase tracking-widest">No listings requiring attention</div>
                )}
             </div>
          </div>

          {/* Featured Approvals */}
          <div className="bg-white p-10 rounded-[48px] border border-slate-100 shadow-sm space-y-8">
             <div className="flex items-center justify-between">
                <div>
                   <h3 className="text-2xl font-black text-slate-900 tracking-tighter uppercase">Featured Property Queue</h3>
                   <p className="text-slate-400 text-xs font-medium">Verify paid status and approve visibility boosts</p>
                </div>
                <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center">
                   <i className="fas fa-star"></i>
                </div>
             </div>

             <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 scrollbar-hide">
                {businesses.filter(b => b.isFeaturedRequested).length > 0 ? (
                  businesses.filter(b => b.isFeaturedRequested).map(b => (
                    <div key={b.id} className="p-6 bg-amber-50/50 border border-amber-100 rounded-3xl flex items-center justify-between group hover:border-amber-300 transition-all">
                       <div className="flex items-center gap-4">
                          <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-amber-600 shadow-sm">
                             <i className="fas fa-gem"></i>
                          </div>
                          <div>
                             <h4 className="font-black text-slate-900 text-sm uppercase">{b.name}</h4>
                             <p className="text-[10px] text-amber-600 font-bold uppercase">{b.subscription} Plan Request</p>
                          </div>
                       </div>
                       <button onClick={() => handleApproveFeatured(b.id)} className="px-5 py-2.5 bg-amber-600 text-white rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg hover:bg-amber-700 transition-all">Grant Boost</button>
                    </div>
                  ))
                ) : (
                  <div className="py-10 text-center text-slate-300 font-black text-[10px] uppercase tracking-widest">No pending featured requests</div>
                )}
             </div>
          </div>
       </div>

       <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Banner Homepage Architect */}
          <div className="lg:col-span-2 bg-slate-950 p-12 rounded-[48px] shadow-2xl text-white space-y-10">
             <div className="flex items-center justify-between">
                <div>
                   <h3 className="text-3xl font-black tracking-tighter uppercase">Banner Architect</h3>
                   <p className="text-indigo-200/40 text-xs font-medium">Control the visual narrative of the landing node</p>
                </div>
                <button className="px-6 py-3 bg-white text-slate-900 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all">Create New Frame</button>
             </div>

             <div className="space-y-6">
                {banners.map(b => (
                  <div key={b.id} className="p-8 bg-white/5 border border-white/10 rounded-[40px] flex gap-8 items-center">
                     <img src={b.imageUrl} className="w-40 h-24 rounded-2xl object-cover border border-white/20" />
                     <div className="flex-1">
                        <div className="flex justify-between items-start mb-2">
                           <h4 className="font-black text-xl uppercase tracking-tighter leading-none">{b.title}</h4>
                           <span className="text-[10px] font-black text-indigo-400 bg-indigo-400/10 px-3 py-1 rounded-full uppercase">ORDER #{b.order}</span>
                        </div>
                        <p className="text-xs text-white/40 mb-4">{b.subtitle}</p>
                        <div className="flex gap-4">
                           <button className="text-[10px] font-black text-white/60 hover:text-white uppercase tracking-widest transition-all">Edit Mapping</button>
                           <button className="text-[10px] font-black text-rose-400/60 hover:text-rose-400 uppercase tracking-widest transition-all">Archive Frame</button>
                        </div>
                     </div>
                  </div>
                ))}
             </div>
          </div>

          {/* SEO Metadata Control */}
          <div className="bg-white p-12 rounded-[48px] border border-slate-100 shadow-sm space-y-8">
             <div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tighter uppercase">SEO Metadata Hub</h3>
                <p className="text-slate-400 text-xs font-medium">Platform-wide organic discovery settings</p>
             </div>

             <div className="space-y-6">
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Master Title Node</label>
                   <input 
                      type="text" value={seoMetadata.title}
                      onChange={(e) => setSeoMetadata({...seoMetadata, title: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-xs font-bold outline-none focus:ring-4 ring-indigo-50"
                   />
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Meta Description</label>
                   <textarea 
                      rows={3} value={seoMetadata.description}
                      onChange={(e) => setSeoMetadata({...seoMetadata, description: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-xs font-bold outline-none focus:ring-4 ring-indigo-50 resize-none"
                   />
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Indexing Keywords</label>
                   <div className="flex flex-wrap gap-2 p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                      {seoMetadata.keywords.map(kw => (
                        <span key={kw} className="px-3 py-1 bg-white text-slate-600 text-[10px] font-black rounded-lg border border-slate-100 shadow-sm">{kw}</span>
                      ))}
                      <button className="text-[10px] text-indigo-600 font-black px-2 hover:underline">+ ADD</button>
                   </div>
                </div>
                <button className="w-full py-4 bg-slate-950 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:bg-indigo-600 transition-all">Synchronize SEO Node</button>
             </div>
          </div>
       </div>
    </div>
  );

  const renderMonetization = () => (
    <div className="space-y-12 animate-fade-up">
       <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div className="bg-white p-10 rounded-[48px] border border-slate-100 shadow-sm space-y-10">
             <div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tighter uppercase">Commission Protocol</h3>
                <p className="text-slate-400 text-xs font-medium">Define platform transaction tax across all nodes</p>
             </div>
             
             <div className="space-y-8">
                <div className="p-8 bg-indigo-50 rounded-[32px] border border-indigo-100 flex items-center justify-between">
                   <div>
                      <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Global Base Commission</p>
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
                      <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-1">Featured Ad Slot (Daily)</p>
                      <h4 className="text-3xl font-black text-amber-700">Rp {adSlotPrice.toLocaleString()}</h4>
                   </div>
                   <div className="flex items-center gap-3">
                      <button onClick={() => setAdSlotPrice(prev => prev - 5000)} className="w-10 h-10 bg-white border border-amber-200 text-amber-600 rounded-xl hover:bg-amber-100 transition-all">-</button>
                      <button onClick={() => setAdSlotPrice(prev => prev + 5000)} className="w-10 h-10 bg-white border border-amber-200 text-amber-600 rounded-xl hover:bg-amber-100 transition-all">+</button>
                   </div>
                </div>
             </div>
          </div>

          <div className="bg-slate-950 p-10 rounded-[48px] shadow-2xl text-white space-y-8 relative overflow-hidden">
             <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
             <div className="relative z-10">
                <h3 className="text-2xl font-black tracking-tighter uppercase">Subscription Tiers</h3>
                <p className="text-indigo-200/40 text-xs font-medium mb-10">Manage access recurring revenue logic</p>
                
                <div className="space-y-4">
                   {plans.map(plan => (
                     <div key={plan.id} className="p-6 bg-white/5 border border-white/10 rounded-3xl hover:bg-white/10 transition-all group">
                        <div className="flex items-center justify-between mb-4">
                           <div className="flex items-center gap-4">
                              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${plan.price === 0 ? 'bg-slate-800' : 'bg-indigo-600'}`}>
                                 <i className={`fas ${plan.price === 0 ? 'fa-leaf' : 'fa-gem'}`}></i>
                              </div>
                              <div>
                                 <p className="font-black uppercase text-xs tracking-tight">{plan.name}</p>
                                 <p className="text-[10px] text-white/40 font-bold">{plan.commission}% Commission</p>
                              </div>
                           </div>
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

       <div className="bg-slate-950 p-12 rounded-[48px] shadow-2xl text-white space-y-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
             <div>
                <h3 className="text-3xl font-black tracking-tighter uppercase">Partner Payout Ledger</h3>
                <p className="text-indigo-200/40 text-xs font-medium">Verify and release funds to business owners</p>
             </div>
             <button className="px-8 py-4 bg-white text-slate-900 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all">Process All Payouts</button>
          </div>

          <div className="overflow-x-auto rounded-[32px] border border-white/10 bg-white/5">
             <table className="w-full text-left">
                <thead className="border-b border-white/10 bg-white/5">
                   <tr>
                      <th className="px-8 py-6 text-[10px] font-black text-indigo-300 uppercase tracking-widest">Business Partner</th>
                      <th className="px-8 py-6 text-[10px] font-black text-indigo-300 uppercase tracking-widest">Topology</th>
                      <th className="px-8 py-6 text-[10px] font-black text-indigo-300 uppercase tracking-widest">Net Payable</th>
                      <th className="px-8 py-6 text-[10px] font-black text-indigo-300 uppercase tracking-widest">Cycle Status</th>
                      <th className="px-8 py-6 text-[10px] font-black text-indigo-300 uppercase tracking-widest text-right">Protocol</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                   {businesses.map(b => (
                     <tr key={b.id} className="hover:bg-white/5 transition-all group">
                        <td className="px-8 py-6">
                           <div>
                              <p className="font-black text-white">{b.name}</p>
                              <p className="text-[10px] text-white/30 font-bold uppercase">{b.id}</p>
                           </div>
                        </td>
                        <td className="px-8 py-6">
                           <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">{b.category}</span>
                        </td>
                        <td className="px-8 py-6">
                           <p className="font-black text-emerald-400">Rp {(Math.random() * 50000000 + 10000000).toLocaleString()}</p>
                        </td>
                        <td className="px-8 py-6">
                           <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                             Math.random() > 0.3 ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                           }`}>
                              {Math.random() > 0.3 ? 'VERIFICATION' : 'READY TO PAY'}
                           </span>
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

  const renderOversight = () => (
    <div className="space-y-10 animate-fade-up">
       <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
             <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">Cross-Business Surveillance</h2>
             <p className="text-slate-400 text-xs font-medium">Unified monitoring of all operational nodes</p>
          </div>
          <div className="flex gap-4">
             <button onClick={() => alert('Compiling global ledger for export... CSV Authorized.')} className="px-8 py-4 bg-slate-100 text-slate-900 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-slate-200 transition-all">
                <i className="fas fa-file-export mr-2"></i> Export Data
             </button>
             <button onClick={() => setShowAnomaliesOnly(!showAnomaliesOnly)} className={`px-8 py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all shadow-xl ${showAnomaliesOnly ? 'bg-rose-600 text-white shadow-rose-100' : 'bg-white border border-slate-200 text-slate-400'}`}>
                <i className="fas fa-radar mr-2"></i> {showAnomaliesOnly ? 'Anomaly Lock Active' : 'Normal Monitoring'}
             </button>
          </div>
       </div>

       <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Business Cluster</label>
             <select value={oversightBizFilter} onChange={(e) => setOversightBizFilter(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-xs font-bold outline-none focus:ring-4 ring-indigo-50">
                <option value="ALL">All Active Hubs</option>
                {businesses.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
             </select>
          </div>
          <div className="space-y-2">
             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Temporal Filter</label>
             <input type="date" value={oversightDateFilter} onChange={(e) => setOversightDateFilter(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-xs font-bold outline-none focus:ring-4 ring-indigo-50" />
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
                             <p className="font-black text-slate-700">G-NODE-{bk.guestId.toUpperCase()}</p>
                             <p className="text-[10px] font-bold text-slate-400 uppercase">{bk.checkIn} → {bk.checkOut}</p>
                          </td>
                          <td className="px-8 py-6 font-black text-slate-900">Rp {bk.totalPrice.toLocaleString()}</td>
                          <td className="px-8 py-6">
                             <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${bk.status === BookingStatus.CONFIRMED ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-50 text-slate-400 border-slate-100'}`}>{bk.status}</span>
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

  const renderTenants = () => (
    <div className="space-y-10 animate-fade-up">
       <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
             <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">Tenant Governance & Subscription</h2>
             <p className="text-slate-400 text-xs font-medium">Control ecosystem nodes, billing cycles, and access tiers</p>
          </div>
          <button className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl shadow-indigo-100">Register Manual Entity</button>
       </div>

       <div className="bg-white rounded-[48px] border border-slate-100 shadow-sm overflow-hidden">
          <table className="w-full text-left">
             <thead className="bg-slate-50/50 border-b border-slate-100">
                <tr>
                   <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Business Entity</th>
                   <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Subscription Tier</th>
                   <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Temporal Cycle</th>
                   <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status Node</th>
                   <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Governance Actions</th>
                </tr>
             </thead>
             <tbody className="divide-y divide-slate-50">
                {businesses.map(b => (
                  <tr key={b.id} className="hover:bg-slate-50/50 transition-colors">
                     <td className="px-8 py-6">
                        <div>
                           <p className="font-black text-slate-900">{b.name}</p>
                           <p className="text-[10px] font-bold text-slate-400 uppercase">{b.category}</p>
                        </div>
                     </td>
                     <td className="px-8 py-6">
                        <div className="flex items-center gap-3">
                           <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                             b.subscription === SubscriptionPlan.PREMIUM ? 'bg-indigo-50 text-indigo-600 border-indigo-100' : 
                             b.subscription === SubscriptionPlan.PRO ? 'bg-violet-50 text-violet-600 border-violet-100' : 
                             'bg-slate-50 text-slate-500 border-slate-100'
                           }`}>
                              {b.subscription} {b.isTrial ? ' TRIAL' : ''}
                           </span>
                        </div>
                     </td>
                     <td className="px-8 py-6">
                        <div>
                           <p className="text-xs font-black text-slate-700">Expires: {b.subscriptionExpiry}</p>
                           <p className="text-[9px] font-bold text-slate-400 uppercase">Registered: 2024-01-10</p>
                        </div>
                     </td>
                     <td className="px-8 py-6">
                        <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                          b.status === 'active' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                          b.status === 'suspended' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                          'bg-amber-50 text-amber-600 border-amber-100'
                        }`}>
                           {b.status}
                        </span>
                     </td>
                     <td className="px-8 py-6 text-right space-x-2">
                        <button 
                           onClick={() => { setActiveBizForSub(b); setIsSubModalOpen(true); }}
                           className="p-3 bg-white border border-slate-200 text-slate-400 rounded-xl hover:text-indigo-600 hover:border-indigo-600 transition-all shadow-sm"
                           title="Control Subscription"
                        >
                           <i className="fas fa-gem text-xs"></i>
                        </button>
                        <button 
                           onClick={() => handleGenerateInvoice(b)}
                           className="p-3 bg-white border border-slate-200 text-slate-400 rounded-xl hover:text-emerald-600 hover:border-emerald-600 transition-all shadow-sm"
                           title="Generate Invoice"
                        >
                           <i className="fas fa-file-invoice-dollar text-xs"></i>
                        </button>
                        <button 
                           onClick={() => handleManualSuspend(b.id)}
                           className={`p-3 rounded-xl transition-all shadow-sm ${
                             b.status === 'suspended' ? 'bg-emerald-600 text-white shadow-emerald-100' : 'bg-rose-50 text-rose-600 border border-rose-100 hover:bg-rose-600 hover:text-white'
                           }`}
                           title={b.status === 'suspended' ? 'Activate Node' : 'Suspend Node'}
                        >
                           <i className={`fas ${b.status === 'suspended' ? 'fa-bolt' : 'fa-ban'} text-xs`}></i>
                        </button>
                     </td>
                  </tr>
                ))}
             </tbody>
          </table>
       </div>

       {/* Subscription Management Modal */}
       {isSubModalOpen && activeBizForSub && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-6">
             <div className="bg-white w-full max-w-xl rounded-[48px] p-12 space-y-10 shadow-2xl animate-in zoom-in-95">
                <div>
                   <h3 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">Subscription Protocol</h3>
                   <p className="text-slate-400 text-sm font-medium">Overriding access tier for {activeBizForSub.name}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-8">
                   <div className="space-y-4">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Ecosystem Plan</label>
                      <select 
                        defaultValue={activeBizForSub.subscription}
                        id="plan-select"
                        className="w-full bg-slate-50 border border-slate-200 rounded-3xl px-8 py-5 font-black text-slate-900 outline-none focus:ring-4 ring-indigo-50"
                      >
                         {Object.values(SubscriptionPlan).map(p => <option key={p} value={p}>{p} Plan</option>)}
                      </select>
                   </div>
                   <div className="space-y-4">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Temporal Expiry (Date)</label>
                      <input 
                         type="date" 
                         defaultValue={activeBizForSub.subscriptionExpiry} 
                         id="expiry-select"
                         className="w-full bg-slate-50 border border-slate-200 rounded-3xl px-8 py-5 font-black text-slate-900 outline-none focus:ring-4 ring-indigo-50" 
                      />
                   </div>
                </div>

                <div className="p-8 bg-indigo-50 rounded-[32px] border border-indigo-100 flex items-center justify-between">
                   <div>
                      <h4 className="font-black text-indigo-900 uppercase text-xs tracking-tight">Active Trial Status</h4>
                      <p className="text-indigo-400 text-[10px] font-bold">Enables zero-cost initial access</p>
                   </div>
                   <input type="checkbox" id="trial-toggle" defaultChecked={activeBizForSub.isTrial} className="w-10 h-10 rounded-xl accent-indigo-600" />
                </div>

                <div className="flex gap-4 pt-6">
                   <button onClick={() => setIsSubModalOpen(false)} className="flex-1 py-5 bg-slate-100 text-slate-500 rounded-3xl font-black uppercase text-xs tracking-widest">Abort Cycle</button>
                   <button 
                     onClick={() => {
                       const plan = (document.getElementById('plan-select') as HTMLSelectElement).value as SubscriptionPlan;
                       const expiry = (document.getElementById('expiry-select') as HTMLInputElement).value;
                       const isTrial = (document.getElementById('trial-toggle') as HTMLInputElement).checked;
                       handleUpdateTenantSubscription(activeBizForSub.id, plan, expiry, isTrial);
                     }}
                     className="flex-1 py-5 bg-slate-950 text-white rounded-3xl font-black uppercase text-xs tracking-widest shadow-xl shadow-slate-200"
                   >
                      Authorize Protocol
                   </button>
                </div>
             </div>
          </div>
       )}
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
              { id: 'quality', label: 'Quality Control', icon: 'fa-certificate' },
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
        {activeTab === 'quality' && renderQuality()}
        {activeTab === 'monetization' && renderMonetization()}
        {activeTab === 'finance' && renderFinance()}
        {activeTab === 'tenants' && renderTenants()}
        {activeTab === 'engine' && (
           <div className="py-40 text-center animate-fade-up">
              <h3 className="text-3xl font-black text-slate-900 mb-4 tracking-tighter uppercase">Topology Engine</h3>
              <p className="text-slate-500 font-medium">Modular category and system permission architect.</p>
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
