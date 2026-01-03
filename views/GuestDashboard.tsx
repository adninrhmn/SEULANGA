
import React, { useState, useMemo } from 'react';
import { MOCK_BOOKINGS, MOCK_BUSINESSES, MOCK_UNITS, MOCK_USERS } from '../constants';
import { BookingStatus, VerificationStatus, Booking, Inquiry } from '../types';

type GuestTab = 'overview' | 'bookings' | 'wishlist' | 'inquiries' | 'profile' | 'support';

const MOCK_INQUIRIES: Inquiry[] = [
  { id: 'inq1', guestId: 'u4', businessId: 'b1', type: 'visit', status: 'responded', message: 'I would like to visit the unit tomorrow at 10 AM.', createdAt: '2024-12-28' },
];

export const GuestDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<GuestTab>('overview');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  
  const user = MOCK_USERS.find(u => u.id === 'u4')!;
  const myBookings = MOCK_BOOKINGS.filter(b => b.guestId === user.id);
  const wishlistItems = MOCK_BUSINESSES.filter(b => user.wishlist?.includes(b.id));
  const myInquiries = MOCK_INQUIRIES.filter(i => i.guestId === user.id);
  
  const stats = [
    { label: 'Upcoming Stays', value: myBookings.filter(b => b.status === BookingStatus.CONFIRMED).length, icon: 'fa-calendar-check', color: 'text-indigo-600' },
    { label: 'Pending Payments', value: myBookings.filter(b => !b.verifiedPayment && b.status !== BookingStatus.CANCELLED).length, icon: 'fa-money-bill-wave', color: 'text-amber-600' },
    { label: 'Saved Items', value: wishlistItems.length, icon: 'fa-heart', color: 'text-rose-600' },
    { label: 'Active Inquiries', value: myInquiries.filter(i => i.status !== 'closed').length, icon: 'fa-message', color: 'text-emerald-600' },
  ];

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
             <div className="bg-white rounded-[48px] border border-slate-100 overflow-hidden shadow-sm">
                <div className="divide-y divide-slate-50">
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
                        <div className="text-right">
                           <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                              bk.status === BookingStatus.CONFIRMED ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-50 text-slate-400 border-slate-100'
                           }`}>{bk.status}</span>
                        </div>
                     </div>
                   ))}
                </div>
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

  const renderBookings = () => (
    <div className="space-y-10 animate-fade-up">
       <div className="flex items-center justify-between">
          <h3 className="text-3xl font-black text-slate-900 tracking-tight">Stay & Inquiry Ledger</h3>
          <div className="flex gap-2">
             <button className="px-6 py-3 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl">Download Itinerary</button>
          </div>
       </div>
       <div className="grid gap-8">
          {myBookings.map(bk => {
            const business = MOCK_BUSINESSES.find(b => b.id === bk.businessId);
            const unit = MOCK_UNITS.find(u => u.id === bk.unitId);
            return (
              <div key={bk.id} className="bg-white rounded-[48px] border border-slate-100 p-10 flex flex-col xl:flex-row gap-10 hover:shadow-2xl transition-all group overflow-hidden relative">
                <div className="w-full xl:w-80 h-64 rounded-[32px] overflow-hidden shrink-0 relative shadow-inner border border-slate-50">
                  <img src={unit?.images[0]} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                  <div className="absolute top-6 right-6 px-4 py-1.5 bg-white/95 backdrop-blur text-[9px] font-black text-indigo-600 uppercase tracking-[0.2em] rounded-full shadow-lg border border-white">
                     {business?.category}
                  </div>
                </div>
                <div className="flex-1 flex flex-col justify-between space-y-8">
                   <div className="space-y-4">
                      <div className="flex justify-between items-start">
                         <div className="space-y-2">
                            <div className="flex items-center gap-3">
                               <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                                 bk.status === BookingStatus.CONFIRMED ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                                 bk.status === BookingStatus.PENDING ? 'bg-amber-50 text-amber-600 border-amber-100' :
                                 'bg-slate-100 text-slate-400 border-slate-200'
                               }`}>{bk.status}</span>
                               <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">ID: #{bk.id.slice(-4).toUpperCase()}</span>
                            </div>
                            <h3 className="text-4xl font-black text-slate-900 tracking-tighter group-hover:text-indigo-600 transition-colors">{business?.name}</h3>
                            <p className="text-slate-500 font-bold flex items-center gap-3">
                               <i className="fas fa-door-open text-indigo-400"></i>
                               {unit?.name}
                            </p>
                         </div>
                         <div className="text-right">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Due</p>
                            <p className="text-3xl font-black text-slate-900 tracking-tighter">Rp {bk.totalPrice.toLocaleString()}</p>
                         </div>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-8 py-8 border-y border-slate-50">
                         <div>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Check-in</p>
                            <p className="font-black text-slate-700">{bk.checkIn}</p>
                         </div>
                         <div>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Check-out</p>
                            <p className="font-black text-slate-700">{bk.checkOut}</p>
                         </div>
                         <div className="hidden md:block">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Payment</p>
                            <div className="flex items-center gap-2">
                               <span className={`w-2 h-2 rounded-full ${bk.verifiedPayment ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                               <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">{bk.verifiedPayment ? 'Verified' : 'Pending Proof'}</span>
                            </div>
                         </div>
                      </div>
                   </div>
                   
                   <div className="flex flex-wrap gap-4 pt-4">
                      {!bk.verifiedPayment && bk.status !== BookingStatus.CANCELLED && (
                         <button className="flex-1 md:flex-none px-10 py-4 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-700 shadow-xl shadow-indigo-100">Upload Proof</button>
                      )}
                      <button className="flex-1 md:flex-none px-10 py-4 border border-slate-200 text-slate-600 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:border-indigo-600 hover:text-indigo-600 transition-all">Support Chat</button>
                      {bk.status === BookingStatus.COMPLETED && (
                         <button className="flex-1 md:flex-none px-10 py-4 bg-emerald-50 text-emerald-600 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-100 transition-all">Review Stay</button>
                      )}
                   </div>
                </div>
              </div>
            );
          })}
       </div>
    </div>
  );

  const renderWishlist = () => (
    <div className="space-y-10 animate-fade-up">
       <div className="flex items-center justify-between">
          <h3 className="text-3xl font-black text-slate-900 tracking-tight">Personal Matrix</h3>
          <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">{wishlistItems.length} Entities Saved</p>
       </div>
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {wishlistItems.map(b => (
            <div key={b.id} className="group bg-white rounded-[40px] border border-slate-100 overflow-hidden hover:shadow-2xl transition-all duration-500 flex flex-col">
               <div className="h-64 relative overflow-hidden shadow-inner">
                  <img src={b.images[0]} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
                  <div className="absolute top-6 left-6">
                     <span className="bg-white/95 backdrop-blur-md px-4 py-1.5 rounded-full text-[9px] font-black text-indigo-600 uppercase tracking-widest border border-white shadow-lg">{b.category}</span>
                  </div>
                  <button className="absolute top-6 right-6 w-12 h-12 bg-rose-500 text-white rounded-2xl flex items-center justify-center shadow-2xl transform group-hover:scale-110 transition-all border border-rose-400">
                     <i className="fas fa-heart"></i>
                  </button>
               </div>
               <div className="p-8 space-y-6 flex-1 flex flex-col justify-between">
                  <div>
                    <h4 className="text-2xl font-black text-slate-900 mb-1 group-hover:text-indigo-600 transition-colors">{b.name}</h4>
                    <p className="text-xs font-bold text-slate-400 flex items-center gap-2">
                       <i className="fas fa-location-dot text-indigo-400"></i>
                       {b.address}
                    </p>
                  </div>
                  <button className="w-full py-4 bg-slate-950 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-xl">Secure Dates</button>
               </div>
            </div>
          ))}
       </div>
    </div>
  );

  const renderInquiries = () => (
    <div className="space-y-10 animate-fade-up">
       <div className="flex items-center justify-between">
          <h3 className="text-3xl font-black text-slate-900 tracking-tight">Property Inquiries</h3>
          <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Leads & Sales Visits</p>
       </div>
       <div className="bg-white rounded-[48px] border border-slate-100 overflow-hidden shadow-sm">
          <table className="w-full text-left">
             <thead>
                <tr className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">
                   <th className="px-10 py-6">Target Entity</th>
                   <th className="px-10 py-6">Inquiry Mode</th>
                   <th className="px-10 py-6">Status Node</th>
                   <th className="px-10 py-6 text-right">Inquiry Date</th>
                </tr>
             </thead>
             <tbody className="divide-y divide-slate-50">
                {myInquiries.map(inq => (
                  <tr key={inq.id} className="hover:bg-slate-50/50 transition-all">
                     <td className="px-10 py-8">
                        <p className="font-black text-slate-900">{MOCK_BUSINESSES.find(b => b.id === inq.businessId)?.name}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">ID: {inq.id.toUpperCase()}</p>
                     </td>
                     <td className="px-10 py-8">
                        <span className="px-3 py-1 bg-slate-100 text-slate-600 text-[9px] font-black uppercase rounded-lg border border-slate-200">{inq.type}</span>
                     </td>
                     <td className="px-10 py-8">
                        <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                          inq.status === 'responded' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'
                        }`}>{inq.status}</span>
                     </td>
                     <td className="px-10 py-8 text-right font-bold text-slate-400 text-xs">{inq.createdAt}</td>
                  </tr>
                ))}
             </tbody>
          </table>
       </div>
    </div>
  );

  const renderProfile = () => (
    <div className="max-w-4xl mx-auto space-y-12 animate-fade-up">
       <div className="bg-white p-12 rounded-[48px] border border-slate-100 shadow-sm space-y-12">
          <div className="flex items-center justify-between">
             <h3 className="text-4xl font-black text-slate-900 tracking-tighter">Account Governance</h3>
             <button className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all">Update Identity</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
             <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Legal Identity Name</label>
                <input type="text" defaultValue={user.name} className="w-full bg-slate-50 border border-slate-200 rounded-3xl px-6 py-4 font-bold text-slate-900 focus:outline-none focus:ring-4 ring-indigo-50" />
             </div>
             <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Verified Communication</label>
                <input type="email" defaultValue={user.email} disabled className="w-full bg-slate-100 border border-slate-200 rounded-3xl px-6 py-4 font-bold text-slate-400 cursor-not-allowed shadow-inner" />
             </div>
             <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Mobile Node</label>
                <input type="text" defaultValue={user.phoneNumber} className="w-full bg-slate-50 border border-slate-200 rounded-3xl px-6 py-4 font-bold text-slate-900 focus:outline-none focus:ring-4 ring-indigo-50" />
             </div>
          </div>
       </div>

       <div className="bg-slate-950 p-12 rounded-[48px] shadow-2xl text-white flex flex-col md:flex-row items-center gap-12 border border-white/5">
          <div className="w-32 h-32 rounded-[40px] bg-white/10 p-1.5 rotate-3 hover:rotate-0 transition-transform shadow-2xl shrink-0">
             <img src={user.avatar} className="w-full h-full object-cover rounded-[34px]" />
          </div>
          <div className="flex-1 text-center md:text-left">
             <h4 className="text-3xl font-black tracking-tight mb-2">Digital Vault Verification</h4>
             <p className="text-indigo-200/60 font-medium mb-8 leading-relaxed">Secure your identity node to unlock verified properties and rapid check-in protocols.</p>
             <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                <div className="px-6 py-3 bg-white/5 border border-white/10 rounded-2xl flex items-center gap-3">
                   <i className="fas fa-id-card text-indigo-400"></i>
                   <span className="text-[10px] font-black uppercase tracking-widest text-indigo-100">Passport Status: Not Uploaded</span>
                </div>
                <button className="px-10 py-4 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-white hover:text-slate-950 transition-all shadow-xl">Initiate KYC Scan</button>
             </div>
          </div>
       </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-[#f8fafc] overflow-hidden">
       {/* Guest-Specific Sidebar */}
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
          <div className="p-8 border-t border-slate-50">
             <div className="bg-slate-50 p-4 rounded-2xl flex items-center gap-4">
                <img src={user.avatar} className="w-10 h-10 rounded-xl object-cover ring-4 ring-white shadow-sm" />
                <div className="overflow-hidden">
                   <p className="text-[10px] font-black text-slate-900 uppercase truncate">Alice Guest</p>
                   <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">ID: 41920X</p>
                </div>
             </div>
          </div>
       </aside>

       {/* Main Content Area */}
       <main className="flex-1 overflow-y-auto bg-[#f8fafc] scrollbar-hide">
          <header className="h-24 bg-white/70 backdrop-blur-md border-b border-slate-200/50 flex items-center justify-between px-12 sticky top-0 z-40">
             <div className="flex flex-col">
                <h1 className="text-2xl font-black text-slate-900 tracking-tighter uppercase leading-none">Guest Operations</h1>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mt-1">Status: Identity {user.verificationStatus}</span>
             </div>
             <div className="flex items-center gap-4">
                <div className="hidden lg:flex items-center bg-slate-100 border border-slate-200 px-6 py-2.5 rounded-2xl group focus-within:ring-4 ring-indigo-50 transition-all">
                   <i className="fas fa-search text-slate-400 mr-3 group-focus-within:text-indigo-600"></i>
                   <input type="text" placeholder="Scan ecosystem..." className="bg-transparent border-none focus:outline-none text-[11px] font-black w-48 text-slate-700" />
                </div>
                <button className="w-12 h-12 bg-white border border-slate-200 rounded-2xl flex items-center justify-center text-slate-400 hover:text-indigo-600 transition-all shadow-sm">
                   <i className="fas fa-bell"></i>
                </button>
             </div>
          </header>

          <div className="p-12 max-w-[1400px] mx-auto">
             {activeTab === 'overview' && renderOverview()}
             {activeTab === 'bookings' && renderBookings()}
             {activeTab === 'wishlist' && renderWishlist()}
             {activeTab === 'inquiries' && renderInquiries()}
             {activeTab === 'profile' && renderProfile()}
             
             {activeTab === 'support' && (
                <div className="py-40 text-center animate-fade-up">
                   <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-8 text-slate-300">
                      <i className="fas fa-headset text-4xl"></i>
                   </div>
                   <h3 className="text-3xl font-black text-slate-900 mb-4 tracking-tighter uppercase">Support Governance Node</h3>
                   <p className="text-slate-500 font-medium max-w-md mx-auto">Accessing secure communication protocols for guest assistance. Stand by for agent synchronization.</p>
                </div>
             )}
          </div>
       </main>
    </div>
  );
};
