
import React, { useState, useEffect } from 'react';
import { MOCK_BOOKINGS, MOCK_BUSINESSES, MOCK_UNITS, MOCK_USERS } from '../constants';
import { BookingStatus, VerificationStatus, Booking, Inquiry, User } from '../types';

type GuestTab = 'overview' | 'bookings' | 'wishlist' | 'inquiries' | 'profile' | 'support';

interface GuestDashboardProps {
  currentUser: User | null;
  onUpdateUser: (data: Partial<User>) => void;
  initialTab?: GuestTab;
}

const MOCK_INQUIRIES: Inquiry[] = [
  { id: 'inq1', guestId: 'u4', businessId: 'b1', type: 'visit', status: 'responded', message: 'I would like to visit the unit tomorrow at 10 AM.', createdAt: '2024-12-28' },
];

export const GuestDashboard: React.FC<GuestDashboardProps> = ({ currentUser, onUpdateUser, initialTab = 'overview' }) => {
  const [activeTab, setActiveTab] = useState<GuestTab>(initialTab);
  
  // Profile Form States
  const [profileName, setProfileName] = useState(currentUser?.name || '');
  const [profilePhone, setProfilePhone] = useState(currentUser?.phoneNumber || '');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  const user = currentUser || MOCK_USERS.find(u => u.id === 'u4')!;
  const myBookings = MOCK_BOOKINGS.filter(b => b.guestId === user.id);
  const wishlistItems = MOCK_BUSINESSES.filter(b => user.wishlist?.includes(b.id));
  const myInquiries = MOCK_INQUIRIES.filter(i => i.guestId === user.id);
  
  const stats = [
    { label: 'Upcoming Stays', value: myBookings.filter(b => b.status === BookingStatus.CONFIRMED).length, icon: 'fa-calendar-check', color: 'text-indigo-600' },
    { label: 'Pending Payments', value: myBookings.filter(b => !b.verifiedPayment && b.status !== BookingStatus.CANCELLED).length, icon: 'fa-money-bill-wave', color: 'text-amber-600' },
    { label: 'Saved Items', value: wishlistItems.length, icon: 'fa-heart', color: 'text-rose-600' },
    { label: 'Active Inquiries', value: myInquiries.filter(i => i.status !== 'closed').length, icon: 'fa-message', color: 'text-emerald-600' },
  ];

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    await new Promise(r => setTimeout(r, 1000));
    onUpdateUser({ name: profileName, phoneNumber: profilePhone });
    setIsSaving(false);
    alert('Identity Node Updated.');
  };

  const renderOverview = () => (
    <div className="space-y-12 animate-fade-up">
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, i) => (
            <div key={i} className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm hover:shadow-xl transition-all group">
               <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 bg-slate-50 ${stat.color} group-hover:scale-110 transition-transform`}>
                  <i className={`fas ${stat.icon} text-xl`}></i>
               </div>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
               <h3 className="text-3xl font-black text-slate-900 tracking-tighter">{stat.value}</h3>
            </div>
          ))}
       </div>

       <div className="grid lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-8">
             <div className="flex items-center justify-between">
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">Recent Activity</h3>
                <button onClick={() => setActiveTab('bookings')} className="text-indigo-600 text-[10px] font-black uppercase tracking-widest hover:underline">View All History</button>
             </div>
             <div className="bg-white rounded-[48px] border border-slate-100 overflow-hidden shadow-sm divide-y divide-slate-50">
                {myBookings.slice(0, 3).map(bk => (
                  <div key={bk.id} className="p-8 flex items-center justify-between hover:bg-slate-50/50 transition-all">
                     <div className="flex items-center gap-6">
                        <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center text-xl font-black shadow-inner">
                           <i className="fas fa-hotel"></i>
                        </div>
                        <div>
                           <p className="font-black text-slate-900 mb-1">{MOCK_BUSINESSES.find(b => b.id === bk.businessId)?.name}</p>
                           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{bk.checkIn} — {bk.checkOut}</p>
                        </div>
                     </div>
                     <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                        bk.status === BookingStatus.CONFIRMED ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-50 text-slate-400 border-slate-100'
                     }`}>{bk.status}</span>
                  </div>
                ))}
             </div>
          </div>

          <div className="bg-slate-950 p-10 rounded-[48px] shadow-2xl text-white relative overflow-hidden flex flex-col justify-between h-full">
             <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
             <div className="relative z-10">
                <div className="w-14 h-14 bg-white/10 backdrop-blur-xl rounded-2xl flex items-center justify-center border border-white/20 mb-8 shadow-inner">
                   <i className="fas fa-gift text-indigo-400 text-xl"></i>
                </div>
                <h3 className="text-3xl font-black tracking-tighter mb-4 leading-tight">Premium Rewards</h3>
                <p className="text-indigo-200/60 font-medium mb-10 text-sm">Unlock secret member-only rates by completing your identity verification.</p>
                <div className="p-6 bg-white/5 rounded-3xl border border-white/10">
                   <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-4">Verification Score</p>
                   <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden mb-2">
                      <div className="h-full bg-indigo-500 w-[75%] rounded-full shadow-[0_0_15px_rgba(99,102,241,0.5)]"></div>
                   </div>
                   <p className="text-right text-[10px] font-black text-indigo-200 uppercase">75% Trusted</p>
                </div>
             </div>
             <button onClick={() => setActiveTab('profile')} className="w-full py-4 bg-white text-slate-950 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all mt-10">Complete Profile</button>
          </div>
       </div>
    </div>
  );

  const renderProfile = () => (
    <div className="max-w-4xl mx-auto space-y-12 animate-fade-up">
       <div className="bg-white p-12 rounded-[48px] border border-slate-100 shadow-sm space-y-12 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-slate-50 rounded-full blur-3xl -mr-40 -mt-40"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-10 mb-12">
             <img src={user.avatar} className="w-32 h-32 rounded-[40px] object-cover border-8 border-slate-50 shadow-2xl" />
             <div className="text-center md:text-left">
                <h3 className="text-4xl font-black text-slate-900 tracking-tighter mb-2">{user.name}</h3>
                <p className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.3em] mb-4">Member ID: #{user.id.toUpperCase()}</p>
                <div className="flex gap-3 justify-center md:justify-start">
                   <span className="px-4 py-1 bg-emerald-50 text-emerald-600 text-[9px] font-black uppercase rounded-full border border-emerald-100">IDENTITY VERIFIED</span>
                </div>
             </div>
          </div>

          <form onSubmit={handleUpdateProfile} className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-10">
             <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Legal Identity Name</label>
                <input 
                  type="text" 
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-3xl px-6 py-4 font-bold text-slate-900 focus:outline-none focus:ring-4 ring-indigo-50 transition-all" 
                />
             </div>
             <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Communication Node (Email)</label>
                <input 
                  type="email" 
                  defaultValue={user.email} 
                  disabled 
                  className="w-full bg-slate-100 border border-slate-200 rounded-3xl px-6 py-4 font-bold text-slate-400 cursor-not-allowed" 
                />
             </div>
             <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Mobile Access Number</label>
                <input 
                  type="text" 
                  value={profilePhone}
                  onChange={(e) => setProfilePhone(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-3xl px-6 py-4 font-bold text-slate-900 focus:outline-none focus:ring-4 ring-indigo-50 transition-all" 
                />
             </div>
             <div className="flex items-end">
                <button 
                  disabled={isSaving}
                  className="w-full py-5 bg-slate-950 text-white rounded-3xl font-black text-xs uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-xl disabled:opacity-50"
                >
                   {isSaving ? <i className="fas fa-spinner fa-spin mr-2"></i> : <i className="fas fa-id-card mr-2"></i>}
                   Update Identity Node
                </button>
             </div>
          </form>
       </div>

       <div className="bg-slate-950 p-12 rounded-[48px] shadow-2xl text-white flex flex-col md:flex-row items-center gap-12 border border-white/5">
          <div className="flex-1 text-center md:text-left">
             <h4 className="text-3xl font-black tracking-tight mb-2 uppercase">Digital KYC Vault</h4>
             <p className="text-indigo-200/60 font-medium mb-8 leading-relaxed">Security protocol requires periodic identity scans for premium tier access.</p>
             <button className="px-12 py-5 bg-indigo-600 text-white rounded-3xl font-black text-[10px] uppercase tracking-widest hover:bg-white hover:text-slate-950 transition-all shadow-xl">Initiate Biometric Scan</button>
          </div>
          <div className="w-40 h-40 bg-white/10 rounded-[48px] flex items-center justify-center border border-white/10 shrink-0">
             <i className="fas fa-user-shield text-5xl text-indigo-400"></i>
          </div>
       </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-[#f8fafc] overflow-hidden">
       <aside className="w-80 bg-white border-r border-slate-200/60 transition-all duration-500 flex flex-col z-50 shadow-sm shrink-0">
          <div className="h-24 flex items-center px-10 border-b border-slate-50 shrink-0">
             <div className="flex items-center gap-4">
                <div className="w-11 h-11 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-100">
                   <i className="fas fa-fingerprint"></i>
                </div>
                <div>
                   <span className="font-black text-lg tracking-tight text-slate-900 block leading-none">Guest Hub</span>
                   <span className="text-[9px] font-black text-indigo-500 uppercase tracking-widest">Premium Node</span>
                </div>
             </div>
          </div>
          <nav className="flex-1 overflow-y-auto p-6 space-y-1.5 scrollbar-hide">
             {[
               { id: 'overview', label: 'Ecosystem Pulse', icon: 'fa-gauge-high' },
               { id: 'bookings', label: 'My Reservations', icon: 'fa-calendar-check' },
               { id: 'wishlist', label: 'Personal Matrix', icon: 'fa-heart' },
               { id: 'inquiries', label: 'Property Leads', icon: 'fa-building-circle-check' },
               { id: 'profile', label: 'Identity & Vault', icon: 'fa-user-shield' },
               { id: 'support', label: 'Help Node', icon: 'fa-headset' }
             ].map(item => (
               <button 
                  key={item.id}
                  onClick={() => setActiveTab(item.id as GuestTab)}
                  className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all ${
                    activeTab === item.id ? 'bg-indigo-600 text-white shadow-2xl shadow-indigo-100' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                  }`}
               >
                  <i className={`fas ${item.icon} text-lg w-6`}></i>
                  {item.label}
               </button>
             ))}
          </nav>
       </aside>

       <main className="flex-1 overflow-y-auto bg-[#f8fafc] scrollbar-hide">
          <header className="h-24 bg-white/70 backdrop-blur-md border-b border-slate-200/50 flex items-center justify-between px-12 sticky top-0 z-40">
             <h1 className="text-2xl font-black text-slate-900 tracking-tighter uppercase">{activeTab} Matrix</h1>
          </header>

          <div className="p-12 max-w-[1400px] mx-auto">
             {activeTab === 'overview' && renderOverview()}
             {activeTab === 'profile' && renderProfile()}
             {activeTab !== 'overview' && activeTab !== 'profile' && (
                <div className="py-40 text-center animate-fade-up">
                   <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-8 text-slate-300">
                      <i className={`fas fa-layer-group text-4xl`}></i>
                   </div>
                   <h3 className="text-3xl font-black text-slate-900 mb-4 tracking-tighter uppercase">{activeTab} Module Node</h3>
                   <p className="text-slate-500 font-medium max-w-md mx-auto">Accessing secure platform nodes for {activeTab} governance.</p>
                </div>
             )}
          </div>
       </main>
    </div>
  );
};
