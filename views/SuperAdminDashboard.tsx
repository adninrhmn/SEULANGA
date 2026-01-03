
import React, { useState, useMemo } from 'react';
import { MOCK_BUSINESSES, MOCK_TRANSACTIONS, MOCK_AUDIT_LOGS, MOCK_USERS, MOCK_REVIEWS, TRANSLATIONS, MOCK_BOOKINGS, DEFAULT_CATEGORY_MODULE_MAP } from '../constants';
import { BusinessCategory, SubscriptionPlan, Business, AuditLog, UserRole, BusinessStatus, Review, Transaction, User, VerificationStatus, CategoryModuleConfig, SystemModule, BookingStatus } from '../types';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, AreaChart, Area, ComposedChart, Line, Legend 
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
  activeTab: 'overview' | 'analytics' | 'monetization' | 'tenants' | 'reviews' | 'finance' | 'logs' | 'settings' | 'profile' | 'engine';
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
  const [businesses, setBusinesses] = useState<Business[]>(MOCK_BUSINESSES);
  const [users] = useState<User[]>(MOCK_USERS);
  const [plans] = useState<SubPlan[]>(INITIAL_PLANS);
  const [auditLogs] = useState<AuditLog[]>(MOCK_AUDIT_LOGS);
  
  // New States for Platform Flexibility
  const [categories, setCategories] = useState<string[]>(Object.values(BusinessCategory));
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  
  const [planModuleMapping, setPlanModuleMapping] = useState<Record<SubscriptionPlan, SystemModule[]>>({
    [SubscriptionPlan.BASIC]: [SystemModule.BOOKING, SystemModule.REVIEWS],
    [SubscriptionPlan.PRO]: [SystemModule.BOOKING, SystemModule.REVIEWS, SystemModule.PAYMENT, SystemModule.MARKETING],
    [SubscriptionPlan.PREMIUM]: Object.values(SystemModule)
  });

  // Management States
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);
  const [isAddingBusiness, setIsAddingBusiness] = useState(false);
  const [newBizData, setNewBizData] = useState({
    name: '',
    category: BusinessCategory.HOTEL,
    address: '',
    ownerEmail: '',
    subscription: SubscriptionPlan.BASIC
  });
  
  // Profile States
  const [profileName, setProfileName] = useState(currentUser?.name || '');
  const [isSaving, setIsSaving] = useState(false);

  const t = TRANSLATIONS[language];

  // Logic Handlers
  const handleToggleModule = (cat: string, module: SystemModule) => {
    const currentModules = moduleConfigs[cat as BusinessCategory] || [];
    const newModules = currentModules.includes(module)
      ? currentModules.filter(m => m !== module)
      : [...currentModules, module];
    
    onUpdateModuleConfigs({
      ...moduleConfigs,
      [cat]: newModules
    });
  };

  const handleTogglePlanModule = (plan: SubscriptionPlan, module: SystemModule) => {
    const current = planModuleMapping[plan] || [];
    const updated = current.includes(module)
      ? current.filter(m => m !== module)
      : [...current, module];
    
    setPlanModuleMapping({
      ...planModuleMapping,
      [plan]: updated
    });
  };

  const handleAddCategory = () => {
    if (newCategoryName && !categories.includes(newCategoryName)) {
      setCategories([...categories, newCategoryName]);
      onUpdateModuleConfigs({
        ...moduleConfigs,
        [newCategoryName as BusinessCategory]: []
      });
      setNewCategoryName('');
      setIsAddingCategory(false);
    }
  };

  const handleRemoveCategory = (cat: string) => {
    if (window.confirm(`Are you sure you want to terminate the ${cat} topology?`)) {
      setCategories(categories.filter(c => c !== cat));
    }
  };

  const handleUpdateBizStatus = (id: string, status: BusinessStatus) => {
    setBusinesses(prev => prev.map(b => b.id === id ? { ...b, status } : b));
    if (selectedBusiness?.id === id) setSelectedBusiness({ ...selectedBusiness, status });
  };

  const handleCreateBusiness = (e: React.FormEvent) => {
    e.preventDefault();
    const newBiz: Business = {
      id: `b-${Date.now()}`,
      name: newBizData.name,
      category: newBizData.category,
      ownerId: 'u-placeholder',
      description: 'Manually added by Super Admin.',
      address: newBizData.address,
      status: 'active',
      subscription: newBizData.subscription,
      images: ['https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=2070'],
      rating: 0,
      location: { lat: 0, lng: 0 },
      registrationDate: new Date().toISOString()
    };
    setBusinesses([newBiz, ...businesses]);
    setIsAddingBusiness(false);
    setNewBizData({ name: '', category: BusinessCategory.HOTEL, address: '', ownerEmail: '', subscription: SubscriptionPlan.BASIC });
    alert('Entity manual berhasil ditambahkan ke cluster.');
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    await new Promise(r => setTimeout(r, 1000));
    onUpdateUser({ name: profileName });
    setIsSaving(false);
    alert('Governing Identity Updated.');
  };

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

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
        <div className="xl:col-span-2 space-y-8">
           <div className="bg-white p-10 rounded-[48px] border border-slate-100 shadow-sm">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                 <div>
                    <h3 className="text-2xl font-black text-slate-900 tracking-tighter uppercase">Platform Telemetry</h3>
                    <p className="text-slate-400 text-xs font-medium">Monthly correlation between Booking Volume & Revenue</p>
                 </div>
              </div>
              <div className="h-[440px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={platformTrendData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 800}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 800}} />
                    <Tooltip contentStyle={{borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.15)', padding: '20px'}} />
                    <Area type="monotone" dataKey="revenue" fill="#4f46e520" stroke="#4f46e5" strokeWidth={4} />
                    <Bar dataKey="bookings" barSize={40} fill="#10b981" radius={[8, 8, 0, 0]} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
           </div>
        </div>
        <div className="space-y-8">
           <div className="bg-slate-950 p-10 rounded-[48px] shadow-2xl text-white">
              <h4 className="font-black text-xl tracking-tight uppercase mb-8">System Health</h4>
              <div className="space-y-6">
                 {['Cloud Server Cluster', 'Task Queue Workers', 'Error Rate (Nominal)', 'DB Replication'].map(sys => (
                   <div key={sys} className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-300">{sys}</span>
                      <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                   </div>
                 ))}
              </div>
           </div>
        </div>
      </div>
    </div>
  );

  const renderEngine = () => (
    <div className="space-y-12 animate-fade-up">
       <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Topology Governance */}
          <div className="bg-white p-10 rounded-[48px] border border-slate-100 shadow-sm space-y-8">
             <div className="flex items-center justify-between">
                <div>
                   <h3 className="text-2xl font-black text-slate-900 tracking-tighter uppercase">Topology Engine</h3>
                   <p className="text-slate-400 text-xs font-medium">Define and modularize business categories</p>
                </div>
                <button 
                  onClick={() => setIsAddingCategory(true)}
                  className="w-12 h-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-lg hover:rotate-90 transition-all"
                >
                   <i className="fas fa-plus"></i>
                </button>
             </div>

             <div className="space-y-4">
                {categories.map(cat => (
                  <div key={cat} className="p-6 bg-slate-50 rounded-[32px] border border-slate-100 space-y-6 group">
                     <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                           <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-indigo-600 shadow-sm border border-slate-200">
                              <i className="fas fa-layer-group"></i>
                           </div>
                           <span className="font-black text-slate-900 uppercase text-xs">{cat}</span>
                        </div>
                        <button onClick={() => handleRemoveCategory(cat)} className="text-slate-300 hover:text-rose-500 transition-colors">
                           <i className="fas fa-trash-can text-sm"></i>
                        </button>
                     </div>
                     <div className="flex flex-wrap gap-2">
                        {Object.values(SystemModule).map(mod => (
                          <button 
                            key={mod}
                            onClick={() => handleToggleModule(cat, mod)}
                            className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border transition-all ${
                              (moduleConfigs[cat as BusinessCategory] || []).includes(mod)
                              ? 'bg-indigo-600 text-white border-indigo-700'
                              : 'bg-white text-slate-400 border-slate-200 hover:border-indigo-300'
                            }`}
                          >
                             {mod}
                          </button>
                        ))}
                     </div>
                  </div>
                ))}
             </div>
          </div>

          {/* Plan Feature Mapping */}
          <div className="bg-slate-950 p-10 rounded-[48px] shadow-2xl text-white space-y-8">
             <div>
                <h3 className="text-2xl font-black tracking-tighter uppercase">Access Tier Logic</h3>
                <p className="text-indigo-200/40 text-xs font-medium">Map system modules to subscription plans</p>
             </div>

             <div className="space-y-8">
                {Object.values(SubscriptionPlan).map(plan => (
                  <div key={plan} className="p-8 bg-white/5 border border-white/10 rounded-[40px] space-y-6">
                     <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                           <i className="fas fa-gem text-xl"></i>
                        </div>
                        <h4 className="font-black text-xl uppercase tracking-tighter">{plan} Plan</h4>
                     </div>
                     <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {Object.values(SystemModule).map(mod => (
                          <button 
                            key={mod}
                            onClick={() => handleTogglePlanModule(plan, mod)}
                            className={`p-3 rounded-2xl text-[9px] font-black uppercase tracking-widest border transition-all text-center ${
                              (planModuleMapping[plan] || []).includes(mod)
                              ? 'bg-white text-slate-950 border-white shadow-[0_0_20px_rgba(255,255,255,0.2)]'
                              : 'bg-transparent text-white/30 border-white/10 hover:border-white/30'
                            }`}
                          >
                             {mod}
                          </button>
                        ))}
                     </div>
                  </div>
                ))}
             </div>
          </div>
       </div>

       {/* Category Add Modal */}
       {isAddingCategory && (
         <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-6">
            <div className="bg-white w-full max-w-md rounded-[48px] p-12 space-y-8 shadow-2xl animate-in zoom-in-95">
               <div className="text-center">
                  <h3 className="text-2xl font-black text-slate-900 tracking-tighter uppercase">Add New Topology</h3>
                  <p className="text-slate-400 text-sm font-medium">Register a new business category node</p>
               </div>
               <input 
                 autoFocus
                 type="text" 
                 value={newCategoryName}
                 onChange={(e) => setNewCategoryName(e.target.value)}
                 placeholder="e.g. Workspace, Coworking..."
                 className="w-full bg-slate-50 border border-slate-200 rounded-3xl px-8 py-5 font-black text-slate-900 focus:ring-4 ring-indigo-50 outline-none"
               />
               <div className="flex gap-4">
                  <button onClick={() => setIsAddingCategory(false)} className="flex-1 py-4 bg-slate-100 text-slate-500 rounded-2xl font-black uppercase text-xs">Abort</button>
                  <button onClick={handleAddCategory} className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase text-xs shadow-xl shadow-indigo-100">Initialize</button>
               </div>
            </div>
         </div>
       )}
    </div>
  );

  const renderTenants = () => (
    <div className="space-y-10 animate-fade-up">
       <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
             <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">Tenant Governance</h2>
             <p className="text-slate-400 text-xs font-medium">Global entity registry and operational control center</p>
          </div>
          <button onClick={() => setIsAddingBusiness(true)} className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl shadow-indigo-100">Register Manual Entity</button>
       </div>

       <div className="bg-white rounded-[48px] border border-slate-100 shadow-sm overflow-hidden">
          <table className="w-full text-left">
             <thead className="bg-slate-50/50 border-b border-slate-100">
                <tr>
                   <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Business Entity</th>
                   <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Topology</th>
                   <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Subscription</th>
                   <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Governance</th>
                </tr>
             </thead>
             <tbody className="divide-y divide-slate-50">
                {businesses.map(b => (
                  <tr key={b.id} className="hover:bg-slate-50/50 transition-colors">
                     <td className="px-8 py-6 font-black text-slate-900">{b.name}</td>
                     <td className="px-8 py-6 uppercase text-[10px] font-black text-slate-500">{b.category}</td>
                     <td className="px-8 py-6 uppercase text-[10px] font-black text-indigo-600">{b.subscription}</td>
                     <td className="px-8 py-6 text-right">
                        <button onClick={() => setSelectedBusiness(b)} className="px-5 py-2.5 bg-white border border-slate-200 text-slate-900 rounded-xl text-[10px] font-black uppercase tracking-widest hover:border-indigo-600 transition-all shadow-sm">Manage Node</button>
                     </td>
                  </tr>
                ))}
             </tbody>
          </table>
       </div>

       {/* Business Detail View Overlay */}
       {selectedBusiness && (
         <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-6">
            <div className="bg-white w-full max-w-6xl h-[90vh] rounded-[48px] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95">
               <div className="p-10 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">{selectedBusiness.name} <span className="text-slate-300 ml-4">Detailed View</span></h3>
                  <button onClick={() => setSelectedBusiness(null)} className="w-12 h-12 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center hover:bg-slate-100"><i className="fas fa-times text-xl"></i></button>
               </div>
               <div className="flex-1 overflow-y-auto p-12 space-y-12 scrollbar-hide">
                  <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                     <div className="lg:col-span-1 p-8 bg-slate-50 rounded-[40px] space-y-6">
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ownership Information</h4>
                        <div className="flex items-center gap-4">
                           <img src={`https://i.pravatar.cc/150?u=${selectedBusiness.ownerId}`} className="w-14 h-14 rounded-2xl object-cover ring-4 ring-white" />
                           <div>
                              <p className="font-black text-slate-900 text-sm">Property Owner</p>
                              <p className="text-[9px] font-bold text-slate-400 uppercase">Registered Partner</p>
                           </div>
                        </div>
                        <div className="pt-6 border-t border-slate-200 space-y-4">
                           <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                              <span className="text-slate-400">Plan:</span>
                              <span className="text-indigo-600">{selectedBusiness.subscription}</span>
                           </div>
                           <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                              <span className="text-slate-400">Status:</span>
                              <span className={selectedBusiness.status === 'active' ? 'text-emerald-600' : 'text-rose-600'}>{selectedBusiness.status}</span>
                           </div>
                        </div>
                     </div>
                     <div className="lg:col-span-3 space-y-10">
                        <div className="grid grid-cols-3 gap-6">
                           <div className="p-8 bg-white border border-slate-100 rounded-[40px] shadow-sm">
                              <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Lifetime Revenue</p>
                              <p className="text-2xl font-black text-slate-900">Rp 42.8M</p>
                           </div>
                           <div className="p-8 bg-white border border-slate-100 rounded-[40px] shadow-sm">
                              <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Active Bookings</p>
                              <p className="text-2xl font-black text-slate-900">12</p>
                           </div>
                           <div className="p-8 bg-white border border-slate-100 rounded-[40px] shadow-sm">
                              <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Security Score</p>
                              <p className="text-2xl font-black text-emerald-600">98%</p>
                           </div>
                        </div>
                        <div className="p-10 bg-slate-50 rounded-[40px] border border-slate-100">
                           <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Recent Audit Events</h4>
                           <div className="space-y-4">
                              {['System Login', 'Unit Price Updated', 'Payout Requested', 'Module Activated'].map((ev, i) => (
                                <div key={i} className="flex justify-between items-center py-3 border-b border-slate-200 last:border-none">
                                   <span className="text-xs font-bold text-slate-700">{ev}</span>
                                   <span className="text-[9px] font-black text-slate-400 uppercase">{i + 2} hours ago</span>
                                </div>
                              ))}
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
               <div className="p-10 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex gap-4">
                     {selectedBusiness.status === 'pending' && <button onClick={() => handleUpdateBizStatus(selectedBusiness.id, 'active')} className="px-10 py-5 bg-emerald-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-emerald-100">Approve Access</button>}
                     {selectedBusiness.status === 'active' && <button onClick={() => handleUpdateBizStatus(selectedBusiness.id, 'suspended')} className="px-10 py-5 bg-rose-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-rose-100">Suspend Node</button>}
                     {selectedBusiness.status === 'suspended' && <button onClick={() => handleUpdateBizStatus(selectedBusiness.id, 'active')} className="px-10 py-5 bg-emerald-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest">Restore Access</button>}
                  </div>
                  <button className="px-10 py-5 bg-slate-950 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl">Terminate Forever</button>
               </div>
            </div>
         </div>
       )}
    </div>
  );

  const renderProfile = () => (
    <div className="max-w-4xl mx-auto space-y-12 animate-fade-up">
       <div className="bg-white p-12 rounded-[48px] border border-slate-100 shadow-sm space-y-12">
          <div className="flex items-center gap-10 pb-12 border-b border-slate-50">
             <div className="relative">
                <img src={currentUser?.avatar} className="w-32 h-32 rounded-[40px] object-cover border-8 border-slate-50 shadow-2xl" />
                <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center border-4 border-white shadow-lg"><i className="fas fa-crown text-xs"></i></div>
             </div>
             <div>
                <h3 className="text-4xl font-black text-slate-900 tracking-tighter mb-2">{currentUser?.name}</h3>
                <p className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.4em]">Absolute Platform Governor</p>
             </div>
          </div>
          
          <form onSubmit={handleUpdateProfile} className="grid grid-cols-1 md:grid-cols-2 gap-10">
             <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Administrator Alias</label>
                <input 
                  type="text" 
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-3xl px-6 py-4 font-bold text-slate-900 focus:outline-none focus:ring-4 ring-indigo-50" 
                />
             </div>
             <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Governance Access Level</label>
                <input type="text" value="Level 0 - Total Authority" disabled className="w-full bg-slate-100 border border-slate-200 rounded-3xl px-6 py-4 font-bold text-slate-400 cursor-not-allowed" />
             </div>
             <button 
               disabled={isSaving}
               className="md:col-span-2 py-5 bg-slate-950 text-white rounded-3xl font-black text-xs uppercase tracking-widest shadow-xl hover:bg-indigo-600 transition-all"
             >
                {isSaving ? <i className="fas fa-spinner fa-spin mr-2"></i> : <i className="fas fa-shield-halved mr-2"></i>}
                Update Governing Credentials
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
              { id: 'engine', label: 'Flex Engine', icon: 'fa-microchip' },
              { id: 'tenants', label: 'Tenants', icon: 'fa-building-shield' },
              { id: 'finance', label: t.treasury, icon: 'fa-receipt' },
              { id: 'logs', label: 'Audit Logs', icon: 'fa-shield-halved' },
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

      <div className="max-w-[1500px] mx-auto">
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'engine' && renderEngine()}
        {activeTab === 'tenants' && renderTenants()}
        {activeTab === 'profile' && renderProfile()}
        {['finance', 'logs', 'settings'].includes(activeTab) && (
           <div className="py-40 text-center animate-fade-up">
              <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-8 text-slate-200">
                 <i className="fas fa-layer-group text-4xl"></i>
              </div>
              <h3 className="text-3xl font-black text-slate-900 mb-4 tracking-tighter uppercase">{activeTab} Interface</h3>
              <p className="text-slate-500 font-medium">Platform administrator node for {activeTab}.</p>
           </div>
        )}
      </div>
    </div>
  );
};
