
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

// Permissions Matrix Setup
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
  activeTab: 'overview' | 'analytics' | 'monetization' | 'tenants' | 'reviews' | 'finance' | 'logs' | 'settings' | 'profile' | 'engine' | 'accounts' | 'matrix';
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
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
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

  // Accounts & Management States
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);
  const [isAddingBusiness, setIsAddingBusiness] = useState(false);
  const [isAddingOwner, setIsAddingOwner] = useState(false);
  const [accountSearch, setAccountSearch] = useState('');
  const [accountFilter, setAccountFilter] = useState<UserRole | 'ALL'>('ALL');
  
  const [newOwnerData, setNewOwnerData] = useState({
    name: '',
    email: '',
    password: ''
  });

  const [newBizData, setNewBizData] = useState({
    name: '',
    category: BusinessCategory.HOTEL,
    address: '',
    ownerEmail: '',
    subscription: SubscriptionPlan.BASIC
  });
  
  const [rolePermissions, setRolePermissions] = useState<Record<UserRole, string[]>>({
    [UserRole.SUPER_ADMIN]: PERMISSION_KEYS,
    [UserRole.BUSINESS_OWNER]: ['business_mgmt', 'revenue_payout', 'staff_mgmt', 'booking_mgmt', 'review_mgmt'],
    [UserRole.ADMIN_STAFF]: ['booking_mgmt', 'review_mgmt'],
    [UserRole.GUEST]: ['booking_mgmt', 'listing_post']
  });

  // Profile States
  const [profileName, setProfileName] = useState(currentUser?.name || '');
  const [isSaving, setIsSaving] = useState(false);

  const t = TRANSLATIONS[language];

  // User Control Logic
  const handleToggleUserStatus = (userId: string) => {
    setUsers(prev => prev.map(u => {
      if (u.id === userId) {
        const isSuspended = u.verificationStatus === VerificationStatus.REJECTED;
        return { ...u, verificationStatus: isSuspended ? VerificationStatus.VERIFIED : VerificationStatus.REJECTED };
      }
      return u;
    }));
  };

  const handleResetPassword = (email: string) => {
    alert(`Decryption payload sent to ${email}. Security protocol initialized.`);
  };

  const handleCreateOwner = (e: React.FormEvent) => {
    e.preventDefault();
    const newUser: User = {
      id: `u-${Date.now()}`,
      name: newOwnerData.name,
      email: newOwnerData.email,
      role: UserRole.BUSINESS_OWNER,
      avatar: `https://i.pravatar.cc/150?u=${Date.now()}`,
      createdAt: new Date().toISOString(),
      verificationStatus: VerificationStatus.VERIFIED
    };
    setUsers([newUser, ...users]);
    setIsAddingOwner(false);
    setNewOwnerData({ name: '', email: '', password: '' });
    alert('Owner identity authorized and injected into the ecosystem.');
  };

  const handleTogglePermission = (role: UserRole, permission: string) => {
    setRolePermissions(prev => {
      const current = prev[role] || [];
      const updated = current.includes(permission) 
        ? current.filter(p => p !== permission)
        : [...current, permission];
      return { ...prev, [role]: updated };
    });
  };

  // Logic Handlers (Engine & Businesses)
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

  // Fix: Implemented handleUpdateProfile and the missing renderProfile function.
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    await new Promise(r => setTimeout(r, 1000));
    onUpdateUser({ name: profileName });
    setIsSaving(false);
    alert('Governing Identity Updated.');
  };

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
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Legal Administrative Name</label>
                <div className="relative">
                   <i className="fas fa-user-shield absolute left-6 top-1/2 -translate-y-1/2 text-slate-300"></i>
                   <input 
                      type="text" 
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-3xl px-14 py-4 font-bold text-slate-900 focus:outline-none focus:ring-4 ring-indigo-50 transition-all" 
                   />
                </div>
             </div>
             <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Corporate Credential (Email)</label>
                <div className="relative">
                   <i className="fas fa-envelope absolute left-6 top-1/2 -translate-y-1/2 text-slate-300"></i>
                   <input 
                      type="email" 
                      value={currentUser?.email}
                      disabled
                      className="w-full bg-slate-100 border border-slate-200 rounded-3xl px-14 py-4 font-bold text-slate-400 cursor-not-allowed" 
                   />
                </div>
             </div>
             <button 
                disabled={isSaving}
                className="w-full py-5 bg-slate-950 text-white rounded-3xl font-black text-xs uppercase tracking-widest shadow-xl hover:bg-indigo-600 transition-all disabled:opacity-50"
             >
                {isSaving ? <i className="fas fa-spinner fa-spin mr-2"></i> : <i className="fas fa-save mr-2"></i>}
                Update Governing Identity
             </button>
          </form>
       </div>
    </div>
  );

  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      const matchSearch = u.name.toLowerCase().includes(accountSearch.toLowerCase()) || u.email.toLowerCase().includes(accountSearch.toLowerCase());
      const matchRole = accountFilter === 'ALL' || u.role === accountFilter;
      return matchSearch && matchRole;
    });
  }, [users, accountSearch, accountFilter]);

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
      {/* ...existing charts... */}
    </div>
  );

  const renderAccounts = () => (
    <div className="space-y-10 animate-fade-up">
       <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
             <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">Account Governance</h2>
             <p className="text-slate-400 text-xs font-medium">Platform-wide user registry and identity control</p>
          </div>
          <button 
            onClick={() => setIsAddingOwner(true)}
            className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl shadow-indigo-100"
          >
             Initialize Owner Node
          </button>
       </div>

       <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm space-y-8">
          <div className="flex flex-col md:flex-row gap-6">
             <div className="flex-1 relative">
                <i className="fas fa-search absolute left-6 top-1/2 -translate-y-1/2 text-slate-400"></i>
                <input 
                  type="text" 
                  placeholder="Search identity or credential..." 
                  value={accountSearch}
                  onChange={(e) => setAccountSearch(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-14 py-4 text-xs font-bold outline-none focus:ring-4 ring-indigo-50"
                />
             </div>
             <div className="flex bg-slate-100 p-1.5 rounded-2xl gap-1">
                {['ALL', UserRole.BUSINESS_OWNER, UserRole.ADMIN_STAFF, UserRole.GUEST].map(r => (
                  <button 
                    key={r}
                    onClick={() => setAccountFilter(r as any)}
                    className={`px-6 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${accountFilter === r ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}
                  >
                    {r.replace('BUSINESS_', '').replace('ADMIN_', '')}
                  </button>
                ))}
             </div>
          </div>

          <div className="overflow-x-auto rounded-3xl border border-slate-50">
             <table className="w-full text-left">
                <thead className="bg-slate-50 text-slate-400 text-[9px] font-black uppercase tracking-[0.2em]">
                   <tr>
                      <th className="px-8 py-5">Identity Node</th>
                      <th className="px-8 py-5">Protocol / Role</th>
                      <th className="px-8 py-5">Node Status</th>
                      <th className="px-8 py-5 text-right">Governance Actions</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                   {filteredUsers.map(u => (
                     <tr key={u.id} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="px-8 py-6">
                           <div className="flex items-center gap-4">
                              <img src={u.avatar} className="w-10 h-10 rounded-xl object-cover shadow-sm border border-slate-200" />
                              <div>
                                 <p className="font-black text-slate-900 group-hover:text-indigo-600 transition-colors">{u.name}</p>
                                 <p className="text-[10px] font-bold text-slate-400">{u.email}</p>
                              </div>
                           </div>
                        </td>
                        <td className="px-8 py-6">
                           <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{u.role}</span>
                        </td>
                        <td className="px-8 py-6">
                           <span className={`px-4 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border ${
                             u.verificationStatus === VerificationStatus.REJECTED ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                           }`}>
                              {u.verificationStatus === VerificationStatus.REJECTED ? 'SUSPENDED' : 'OPERATIONAL'}
                           </span>
                        </td>
                        <td className="px-8 py-6 text-right space-x-2">
                           <button 
                             onClick={() => handleResetPassword(u.email)}
                             className="p-3 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-indigo-600 hover:border-indigo-200 transition-all shadow-sm"
                             title="Reset Encryption"
                           >
                              <i className="fas fa-key text-xs"></i>
                           </button>
                           <button 
                             onClick={() => handleToggleUserStatus(u.id)}
                             className={`p-3 rounded-xl transition-all shadow-sm ${
                               u.verificationStatus === VerificationStatus.REJECTED 
                               ? 'bg-emerald-600 text-white shadow-emerald-100' 
                               : 'bg-rose-50 text-rose-600 border border-rose-100 hover:bg-rose-600 hover:text-white'
                             }`}
                             title={u.verificationStatus === VerificationStatus.REJECTED ? 'Restore Node' : 'Suspend Node'}
                           >
                              <i className={`fas ${u.verificationStatus === VerificationStatus.REJECTED ? 'fa-user-check' : 'fa-user-slash'} text-xs`}></i>
                           </button>
                        </td>
                     </tr>
                   ))}
                </tbody>
             </table>
          </div>
       </div>

       {/* Owner Create Modal */}
       {isAddingOwner && (
         <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-6">
            <div className="bg-white w-full max-w-md rounded-[48px] p-12 space-y-8 shadow-2xl animate-in zoom-in-95">
               <div className="text-center">
                  <h3 className="text-2xl font-black text-slate-900 tracking-tighter uppercase">Initialize Owner Identity</h3>
                  <p className="text-slate-400 text-sm font-medium">Create a new business partner profile</p>
               </div>
               <form onSubmit={handleCreateOwner} className="space-y-4">
                  <input required placeholder="Legal Full Name" value={newOwnerData.name} onChange={e => setNewOwnerData({...newOwnerData, name: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-3xl px-8 py-5 font-black text-slate-900 outline-none" />
                  <input required type="email" placeholder="Corporate Email" value={newOwnerData.email} onChange={e => setNewOwnerData({...newOwnerData, email: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-3xl px-8 py-5 font-black text-slate-900 outline-none" />
                  <input required type="password" placeholder="Initial Security Key" value={newOwnerData.password} onChange={e => setNewOwnerData({...newOwnerData, password: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-3xl px-8 py-5 font-black text-slate-900 outline-none" />
                  <div className="flex gap-4 pt-4">
                     <button type="button" onClick={() => setIsAddingOwner(false)} className="flex-1 py-4 bg-slate-100 text-slate-500 rounded-2xl font-black uppercase text-xs">Abort</button>
                     <button type="submit" className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase text-xs shadow-xl shadow-indigo-100">Authorize</button>
                  </div>
               </form>
            </div>
         </div>
       )}
    </div>
  );

  const renderMatrix = () => (
    <div className="space-y-12 animate-fade-up">
       <div className="bg-white p-12 rounded-[48px] border border-slate-100 shadow-sm space-y-10">
          <div>
             <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">Role Permission Matrix</h2>
             <p className="text-slate-400 text-xs font-medium">Define governance logic across platform hierarchies</p>
          </div>

          <div className="overflow-x-auto rounded-3xl border border-slate-100">
             <table className="w-full text-left">
                <thead className="bg-slate-50">
                   <tr>
                      <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest border-r border-slate-100">Permission Protocol</th>
                      {Object.values(UserRole).map(role => (
                        <th key={role} className="px-8 py-6 text-center">
                           <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">{role.replace('_', ' ')}</span>
                        </th>
                      ))}
                   </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                   {PERMISSION_KEYS.map(perm => (
                     <tr key={perm} className="hover:bg-slate-50 transition-colors">
                        <td className="px-8 py-5 border-r border-slate-100">
                           <p className="text-[11px] font-black text-slate-700 uppercase tracking-tight">{perm.replace('_', ' ')}</p>
                        </td>
                        {Object.values(UserRole).map(role => (
                          <td key={`${role}-${perm}`} className="px-8 py-5 text-center">
                             <button 
                               onClick={() => handleTogglePermission(role, perm)}
                               disabled={role === UserRole.SUPER_ADMIN}
                               className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${
                                 rolePermissions[role]?.includes(perm)
                                 ? 'bg-indigo-600 text-white shadow-lg'
                                 : 'bg-slate-100 text-slate-300'
                               } ${role === UserRole.SUPER_ADMIN ? 'cursor-not-allowed opacity-100' : 'hover:scale-110'}`}
                             >
                                <i className={`fas ${rolePermissions[role]?.includes(perm) ? 'fa-check' : 'fa-minus'} text-[10px]`}></i>
                             </button>
                          </td>
                        ))}
                     </tr>
                   ))}
                </tbody>
             </table>
          </div>
       </div>
    </div>
  );

  const renderEngine = () => (
    <div className="space-y-12 animate-fade-up">
       {/* ...existing Engine content... */}
       <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
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
       {/* ...existing Detail View... */}
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
              { id: 'accounts', label: 'Accounts', icon: 'fa-users-gear' },
              { id: 'matrix', label: 'Matrix', icon: 'fa-table-list' },
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
        {activeTab === 'accounts' && renderAccounts()}
        {activeTab === 'matrix' && renderMatrix()}
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
