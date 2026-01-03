
import React, { useState } from 'react';
import { MOCK_BOOKINGS, MOCK_BUSINESSES, MOCK_UNITS, MOCK_USERS } from '../constants';
import { BookingStatus, VerificationStatus } from '../types';

export const GuestDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'bookings' | 'wishlist' | 'profile' | 'support'>('bookings');
  
  const user = MOCK_USERS.find(u => u.id === 'u4')!;
  const myBookings = MOCK_BOOKINGS.filter(b => b.guestId === user.id);
  const wishlistItems = MOCK_BUSINESSES.filter(b => user.wishlist?.includes(b.id));
  
  const renderBookings = () => (
    <div className="space-y-8 animate-fade-up">
      <div className="flex items-center justify-between">
         <h3 className="text-2xl font-black text-slate-900 tracking-tight">Stay History & Upcoming</h3>
         <div className="flex bg-slate-100 p-1 rounded-xl gap-1">
            {['All', 'Upcoming', 'Completed'].map(f => (
              <button key={f} className={`px-5 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${f === 'All' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`}>{f}</button>
            ))}
         </div>
      </div>
      <div className="grid gap-8">
        {myBookings.map(bk => {
          const business = MOCK_BUSINESSES.find(b => b.id === bk.businessId);
          const unit = MOCK_UNITS.find(u => u.id === bk.unitId);
          
          return (
            <div key={bk.id} className="bg-white rounded-[48px] border border-slate-100 p-10 flex flex-col xl:flex-row gap-10 hover:shadow-2xl transition-all group overflow-hidden relative">
              <div className="w-full xl:w-80 h-64 rounded-[32px] overflow-hidden shrink-0 relative">
                <img src={unit?.images[0]} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                <div className="absolute top-4 right-4 px-4 py-1.5 bg-white/90 backdrop-blur text-[10px] font-black text-indigo-600 uppercase tracking-widest rounded-full shadow-lg">
                   {business?.category}
                </div>
              </div>
              <div className="flex-1 flex flex-col justify-between space-y-8">
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border ${
                          bk.status === BookingStatus.CONFIRMED ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                          bk.status === BookingStatus.COMPLETED ? 'bg-indigo-50 text-indigo-600 border-indigo-100' :
                          'bg-slate-100 text-slate-500 border-slate-200'
                        }`}>
                          {bk.status}
                        </span>
                        <span className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.3em]">Ref: {bk.id.toUpperCase()}</span>
                      </div>
                      <h3 className="text-4xl font-black text-slate-900 tracking-tighter group-hover:text-indigo-600 transition-colors">{business?.name}</h3>
                      <p className="text-slate-500 font-bold flex items-center gap-3">
                         <i className="fas fa-door-open text-indigo-400"></i>
                         {unit?.name}
                      </p>
                    </div>
                    <div className="text-right">
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Transaction Value</p>
                       <p className="text-3xl font-black text-slate-900 tracking-tighter">Rp {bk.totalPrice.toLocaleString()}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-6 py-8 border-y border-slate-50">
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Arrival</p>
                      <p className="text-lg font-black text-slate-700">{new Date(bk.checkIn).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Departure</p>
                      <p className="text-lg font-black text-slate-700">{new Date(bk.checkOut).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                    </div>
                    <div className="space-y-1 hidden md:block">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Guests</p>
                      <p className="text-lg font-black text-slate-700">{unit?.capacity} Persons</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-4">
                  <button className="flex-1 md:flex-none px-10 py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-xl shadow-slate-200">Manage Experience</button>
                  <button className="flex-1 md:flex-none px-10 py-4 border border-slate-200 text-slate-500 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:border-indigo-600 hover:text-indigo-600 transition-all">Support & Inquiries</button>
                  {bk.status === BookingStatus.COMPLETED && (
                    <button className="flex-1 md:flex-none px-10 py-4 bg-emerald-50 text-emerald-600 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-100 transition-all">Leave Review</button>
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
          <h3 className="text-2xl font-black text-slate-900 tracking-tight">Syncronized Wishlist</h3>
          <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">{wishlistItems.length} Saved Collections</p>
       </div>
       <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
          {wishlistItems.map(b => (
            <div key={b.id} className="group bg-white rounded-[40px] border border-slate-100 overflow-hidden hover:shadow-2xl transition-all duration-500">
               <div className="h-64 relative overflow-hidden">
                  <img src={b.images[0]} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  <div className="absolute top-6 left-6">
                     <span className="bg-white/90 backdrop-blur-md px-4 py-1.5 rounded-full text-[10px] font-black text-indigo-600 uppercase tracking-widest">{b.category}</span>
                  </div>
                  <button className="absolute top-6 right-6 w-10 h-10 bg-rose-500 text-white rounded-xl flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-all">
                     <i className="fas fa-heart"></i>
                  </button>
               </div>
               <div className="p-8 space-y-6">
                  <div>
                    <h4 className="text-2xl font-black text-slate-900 mb-1">{b.name}</h4>
                    <p className="text-xs font-bold text-slate-400">{b.address}</p>
                  </div>
                  <button className="w-full py-4 bg-slate-50 text-slate-900 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all">Check Availability</button>
               </div>
            </div>
          ))}
          {wishlistItems.length === 0 && (
            <div className="lg:col-span-3 text-center py-32 bg-white rounded-[48px] border-2 border-dashed border-slate-100">
               <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-8 text-slate-200">
                  <i className="fas fa-heart text-4xl"></i>
               </div>
               <h3 className="text-2xl font-black text-slate-900 mb-4 tracking-tight">Your Matrix is Empty</h3>
               <p className="text-slate-500 font-medium max-w-sm mx-auto mb-10">Discover properties in the marketplace to populate your personal luxury collection.</p>
               <button onClick={() => setActiveTab('bookings')} className="bg-slate-950 text-white px-10 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-slate-200">Browse Marketplace</button>
            </div>
          )}
       </div>
    </div>
  );

  return (
    <div className="space-y-12 animate-fade-up">
      {/* Dynamic Identity Header */}
      <div className="bg-white p-10 rounded-[48px] border border-slate-100 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-50 rounded-full blur-3xl -mr-40 -mt-40"></div>
        <div className="relative z-10 flex flex-col xl:flex-row xl:items-center justify-between gap-10">
          <div className="flex items-center gap-8">
            <div className="relative">
              <div className="w-28 h-28 rounded-[36px] bg-slate-900 p-1.5 rotate-3 hover:rotate-0 transition-transform shadow-2xl">
                <img src={user.avatar} className="w-full h-full object-cover rounded-[30px]" />
              </div>
              <div className={`absolute -bottom-2 -right-2 w-10 h-10 ${user.verificationStatus === VerificationStatus.VERIFIED ? 'bg-emerald-500' : 'bg-amber-500'} border-4 border-white rounded-full flex items-center justify-center text-white shadow-lg`}>
                <i className={`fas ${user.verificationStatus === VerificationStatus.VERIFIED ? 'fa-check-double' : 'fa-hourglass-half'} text-xs`}></i>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-4 mb-2">
                <h1 className="text-5xl font-black text-slate-900 tracking-tighter">Alice Guest<span className="text-indigo-600">.</span></h1>
                <span className="px-5 py-1.5 bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase rounded-full tracking-[0.2em] border border-indigo-100">Premium Member</span>
              </div>
              <p className="text-slate-500 font-medium text-lg flex items-center gap-3">
                <i className="fas fa-fingerprint text-indigo-400"></i>
                Account ID: SEU-{user.id.toUpperCase()}
                <span className="mx-2 text-slate-200">|</span>
                <span className={`${user.verificationStatus === VerificationStatus.VERIFIED ? 'text-emerald-600' : 'text-amber-500'} font-black text-sm uppercase tracking-widest`}>Identity {user.verificationStatus}</span>
              </p>
            </div>
          </div>
          <div className="flex bg-slate-100/80 backdrop-blur p-2 rounded-[28px] border border-slate-200/40 gap-1 overflow-x-auto scrollbar-hide">
            {[
              { id: 'bookings', label: 'Stay History', icon: 'fa-calendar-check' },
              { id: 'wishlist', label: 'My Matrix', icon: 'fa-heart' },
              { id: 'profile', label: 'Security & Profile', icon: 'fa-user-shield' },
              { id: 'support', label: 'Help Center', icon: 'fa-headset' }
            ].map(t => (
              <button 
                key={t.id}
                onClick={() => setActiveTab(t.id as any)}
                className={`flex items-center gap-3 px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                  activeTab === t.id ? 'bg-indigo-600 text-white shadow-2xl shadow-indigo-100' : 'text-slate-500 hover:bg-white hover:text-slate-900'
                }`}
              >
                <i className={`fas ${t.icon}`}></i>
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto">
        {activeTab === 'bookings' && renderBookings()}
        {activeTab === 'wishlist' && renderWishlist()}
        
        {activeTab === 'profile' && (
          <div className="grid lg:grid-cols-3 gap-10 animate-fade-up">
             <div className="lg:col-span-2 space-y-10">
                <div className="bg-white p-12 rounded-[48px] border border-slate-100 shadow-sm space-y-10">
                   <h3 className="text-3xl font-black text-slate-900 tracking-tight">Identity & Contacts</h3>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-3">
                         <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Legal Full Name</label>
                         <input type="text" defaultValue={user.name} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 font-bold text-slate-900 focus:outline-none focus:ring-4 ring-indigo-50 transition-all" />
                      </div>
                      <div className="space-y-3">
                         <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Verified Email</label>
                         <input type="email" defaultValue={user.email} disabled className="w-full bg-slate-100 border border-slate-200 rounded-2xl px-6 py-4 font-bold text-slate-400 cursor-not-allowed" />
                      </div>
                      <div className="space-y-3">
                         <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Phone Number</label>
                         <input type="text" defaultValue={user.phoneNumber} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 font-bold text-slate-900 focus:outline-none focus:ring-4 ring-indigo-50" />
                      </div>
                      <div className="space-y-3">
                         <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Preferred Language</label>
                         <select className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 font-bold text-slate-900 focus:outline-none focus:ring-4 ring-indigo-50">
                            <option>English (UK)</option>
                            <option>Bahasa Indonesia</option>
                            <option>Malay</option>
                         </select>
                      </div>
                   </div>
                   <div className="pt-8 border-t border-slate-50">
                      <button className="bg-slate-950 text-white px-12 py-5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-600 shadow-2xl shadow-slate-200 transition-all">Update Identity Matrix</button>
                   </div>
                </div>
             </div>
             <div className="space-y-10">
                <div className="bg-slate-950 p-10 rounded-[48px] shadow-2xl text-white space-y-8 relative overflow-hidden">
                   <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl -mr-32 -mt-32"></div>
                   <h3 className="font-black text-2xl tracking-tight relative z-10">Trust & Safety</h3>
                   <div className="space-y-6 relative z-10">
                      <div className="p-6 bg-white/5 rounded-3xl border border-white/10 flex items-center justify-between">
                         <div className="flex items-center gap-4">
                            <i className="fas fa-shield-halved text-indigo-400"></i>
                            <span className="text-xs font-bold text-slate-300">2FA Protection</span>
                         </div>
                         <button className="text-[10px] font-black uppercase text-indigo-400 hover:underline">Manage</button>
                      </div>
                      <div className="p-6 bg-white/5 rounded-3xl border border-white/10 flex items-center justify-between">
                         <div className="flex items-center gap-4">
                            <i className="fas fa-id-card text-indigo-400"></i>
                            <span className="text-xs font-bold text-slate-300">KYC Verification</span>
                         </div>
                         <span className="text-[10px] font-black uppercase text-emerald-500">Verified</span>
                      </div>
                   </div>
                </div>
                <div className="bg-white p-10 rounded-[48px] border border-slate-100 shadow-sm flex flex-col items-center text-center">
                   <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 mb-6">
                      <i className="fas fa-key text-2xl"></i>
                   </div>
                   <h4 className="font-black text-xl text-slate-900 mb-2">Login Credentials</h4>
                   <p className="text-slate-500 text-xs font-medium mb-8 leading-relaxed">Update your access key periodically for enhanced account integrity.</p>
                   <button className="px-8 py-3.5 bg-slate-100 text-slate-900 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-200 transition-all">Change Access Key</button>
                </div>
             </div>
          </div>
        )}

        {activeTab === 'support' && (
          <div className="grid lg:grid-cols-2 gap-10 animate-fade-up">
             <div className="bg-white p-12 rounded-[48px] border border-slate-100 shadow-sm space-y-12">
                <h3 className="text-3xl font-black text-slate-900 tracking-tight">Concierge & Assistance</h3>
                <div className="grid gap-6">
                   {[
                     { q: "How do I verify my identity?", a: "Navigate to Security settings and upload a high-resolution scan of your national ID or passport.", icon: "fa-id-badge" },
                     { q: "Payment proof verification time?", a: "Typically reviewed within 2-6 hours by the business owner or platform administrators.", icon: "fa-clock" },
                     { q: "Cancellation & refund policies?", a: "Each business sets their own rules. Review the House Protocol on the property detail page before booking.", icon: "fa-receipt" }
                   ].map((faq, i) => (
                     <div key={i} className="p-8 bg-slate-50 rounded-[32px] space-y-4 hover:bg-indigo-50 transition-colors border border-slate-100">
                        <div className="flex items-center gap-4">
                           <i className={`fas ${faq.icon} text-indigo-600`}></i>
                           <p className="font-black text-slate-900">{faq.q}</p>
                        </div>
                        <p className="text-sm font-medium text-slate-500 leading-relaxed">{faq.a}</p>
                     </div>
                   ))}
                </div>
             </div>
             <div className="bg-slate-950 p-12 rounded-[48px] shadow-2xl text-white space-y-10">
                <div className="space-y-4">
                   <h3 className="text-3xl font-black tracking-tight">Submit Inquiry</h3>
                   <p className="text-slate-400 font-medium leading-relaxed">Our system governance team is available 24/7 for platform-level disputes or account assistance.</p>
                </div>
                <form className="space-y-6">
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Inquiry Subject</label>
                      <input type="text" placeholder="Booking Dispute, System Error, etc." className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 font-bold text-white outline-none focus:ring-4 ring-indigo-500/20" />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Detailed Narrative</label>
                      <textarea rows={5} placeholder="Describe your experience or requirement in detail..." className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 font-bold text-white outline-none focus:ring-4 ring-indigo-500/20 resize-none" />
                   </div>
                   <button className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-indigo-900/40 hover:bg-indigo-700 transition-all">Relay to Governance Team</button>
                </form>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};
