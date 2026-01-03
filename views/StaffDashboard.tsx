
import React, { useState, useMemo } from 'react';
import { MOCK_BOOKINGS, MOCK_UNITS, MOCK_BUSINESSES, MOCK_USERS } from '../constants';
import { BookingStatus, Unit } from '../types';

interface OperationalNote {
  id: string;
  author: string;
  text: string;
  time: string;
}

export const StaffDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'daily' | 'inventory' | 'guests'>('daily');
  const [units, setUnits] = useState<Unit[]>(MOCK_UNITS.filter(u => u.businessId === 'b1'));
  const [bookings, setBookings] = useState(MOCK_BOOKINGS.filter(b => b.businessId === 'b1'));
  const [notes, setNotes] = useState<OperationalNote[]>([
    { id: 'n1', author: 'Budi S.', text: 'Room 201 guest requested extra towels for 18:00.', time: '09:30' },
    { id: 'n2', author: 'Sarah S.', text: 'Maintenance fixing AC in 305. Do not assign.', time: '11:15' }
  ]);
  const [isCheckInModalOpen, setCheckInModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);

  const business = MOCK_BUSINESSES[0];

  const dailyStats = useMemo(() => ({
    arrivals: bookings.filter(b => b.status === BookingStatus.CONFIRMED || b.status === BookingStatus.PENDING).length,
    departures: bookings.filter(b => b.status === BookingStatus.CHECKED_IN).length,
    inHouse: bookings.filter(b => b.status === BookingStatus.CHECKED_IN).length,
    dirty: 3 // Mocked for demo
  }), [bookings]);

  const updateUnitStatus = (id: string, available: boolean) => {
    setUnits(units.map(u => u.id === id ? { ...u, available } : u));
  };

  const handleCheckIn = (bookingId: string) => {
    setBookings(bookings.map(b => b.id === bookingId ? { ...b, status: BookingStatus.CHECKED_IN } : b));
    setCheckInModalOpen(false);
  };

  return (
    <div className="space-y-10 animate-fade-up">
      {/* Shift Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 bg-slate-900 p-10 rounded-[40px] shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
        <div className="relative z-10">
          <h1 className="text-4xl font-black text-white tracking-tighter mb-2">Ops Desk<span className="text-indigo-500">.</span></h1>
          <p className="text-indigo-200/60 font-medium">Managing front-desk for <span className="text-white font-bold">{business.name}</span></p>
        </div>
        <div className="relative z-10 flex gap-4 overflow-x-auto scrollbar-hide pb-2">
          {[
            { label: 'Arrivals Today', value: dailyStats.arrivals, icon: 'fa-plane-arrival', color: 'text-emerald-400' },
            { label: 'Stay-overs', value: dailyStats.inHouse, icon: 'fa-bed', color: 'text-indigo-400' },
            { label: 'Departures', value: dailyStats.departures, icon: 'fa-plane-departure', color: 'text-amber-400' }
          ].map((stat, i) => (
            <div key={i} className="bg-white/5 border border-white/10 backdrop-blur-xl px-8 py-5 rounded-3xl min-w-[180px]">
              <div className="flex items-center gap-3 mb-2">
                <i className={`fas ${stat.icon} ${stat.color} text-sm`}></i>
                <span className="text-[10px] font-black text-indigo-200/50 uppercase tracking-widest">{stat.label}</span>
              </div>
              <span className="text-3xl font-black text-white">{stat.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Primary Actions & Notes */}
      <div className="grid lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 space-y-8">
           {/* Ops Navigation */}
           <div className="flex bg-white p-2 rounded-[28px] border border-slate-200/60 shadow-sm">
             {[
               { id: 'daily', label: 'Daily Operations', icon: 'fa-calendar-day' },
               { id: 'inventory', label: 'Real-time Inventory', icon: 'fa-door-open' },
               { id: 'guests', label: 'Guest Directory', icon: 'fa-address-book' }
             ].map(t => (
               <button 
                 key={t.id}
                 onClick={() => setActiveTab(t.id as any)}
                 className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-2xl text-xs font-black transition-all ${
                   activeTab === t.id ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100' : 'text-slate-500 hover:bg-slate-50'
                 }`}
               >
                 <i className={`fas ${t.icon}`}></i>
                 <span className="hidden sm:inline uppercase tracking-widest">{t.label}</span>
               </button>
             ))}
           </div>

           {/* Tab Content */}
           {activeTab === 'daily' && (
             <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                   <h3 className="font-black text-xl text-slate-900 tracking-tight">Today's Reservations</h3>
                   <div className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Live Updates</span>
                   </div>
                </div>
                <div className="overflow-x-auto">
                   <table className="w-full text-left">
                      <thead>
                         <tr className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                            <th className="px-8 py-6">Reference / Guest</th>
                            <th className="px-8 py-6">Unit Assignment</th>
                            <th className="px-8 py-6">Stay Period</th>
                            <th className="px-8 py-6">Status</th>
                            <th className="px-8 py-6 text-right">Action</th>
                         </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                         {bookings.map(bk => (
                            <tr key={bk.id} className="hover:bg-slate-50/50 transition-all group">
                               <td className="px-8 py-6">
                                  <div className="flex items-center gap-4">
                                     <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black text-xs">
                                        {bk.id.slice(-2).toUpperCase()}
                                     </div>
                                     <div>
                                        <p className="font-black text-slate-900 leading-none mb-1 uppercase text-sm">{bk.id}</p>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase">Guest ID: {bk.guestId}</p>
                                     </div>
                                  </div>
                               </td>
                               <td className="px-8 py-6 font-bold text-slate-700 text-sm">
                                  {units.find(u => u.id === bk.unitId)?.name || 'Unassigned'}
                               </td>
                               <td className="px-8 py-6 text-xs font-bold text-slate-500">
                                  {bk.checkIn} <i className="fas fa-arrow-right mx-1 text-[8px] text-slate-300"></i> {bk.checkOut}
                               </td>
                               <td className="px-8 py-6">
                                  <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase border ${
                                     bk.status === BookingStatus.CHECKED_IN ? 'bg-indigo-50 text-indigo-600 border-indigo-100' :
                                     bk.status === BookingStatus.CONFIRMED ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                     'bg-slate-100 text-slate-500 border-slate-200'
                                  }`}>
                                     {bk.status}
                                  </span>
                               </td>
                               <td className="px-8 py-6 text-right">
                                  {bk.status === BookingStatus.CONFIRMED ? (
                                     <button 
                                        onClick={() => { setSelectedBooking(bk); setCheckInModalOpen(true); }}
                                        className="px-5 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all"
                                     >
                                        Check-in
                                     </button>
                                  ) : bk.status === BookingStatus.CHECKED_IN ? (
                                     <button className="px-5 py-2 bg-white border border-rose-100 text-rose-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-50 transition-all">
                                        Check-out
                                     </button>
                                  ) : (
                                     <button className="text-slate-300 hover:text-indigo-600 transition-all">
                                        <i className="fas fa-eye"></i>
                                     </button>
                                  )}
                               </td>
                            </tr>
                         ))}
                      </tbody>
                   </table>
                </div>
             </div>
           )}

           {activeTab === 'inventory' && (
             <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {units.map(unit => (
                   <div key={unit.id} className="bg-white rounded-3xl border border-slate-100 p-6 space-y-6 hover:shadow-xl transition-all group">
                      <div className="flex items-center justify-between">
                         <h4 className="font-black text-lg text-slate-900">{unit.name}</h4>
                         <span className={`w-3 h-3 rounded-full ${unit.available ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-indigo-600'}`}></span>
                      </div>
                      <div className="h-40 rounded-2xl overflow-hidden relative">
                         <img src={unit.images[0]} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                         {!unit.available && (
                           <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center">
                              <span className="text-white font-black uppercase text-xs tracking-widest border border-white/20 px-4 py-2 rounded-xl">Occupied</span>
                           </div>
                         )}
                      </div>
                      <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                         <div className="flex flex-col">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Housekeeping</span>
                            <span className="text-xs font-bold text-slate-700">Clean & Ready</span>
                         </div>
                         <button 
                            onClick={() => updateUnitStatus(unit.id, !unit.available)}
                            className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all ${
                               unit.available ? 'bg-slate-50 text-slate-400 hover:bg-indigo-50 hover:text-indigo-600' : 'bg-indigo-600 text-white'
                            }`}
                         >
                            <i className="fas fa-power-off"></i>
                         </button>
                      </div>
                   </div>
                ))}
             </div>
           )}

           {activeTab === 'guests' && (
             <div className="bg-white p-10 rounded-[40px] border border-slate-100 text-center py-20">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
                   <i className="fas fa-users text-3xl"></i>
                </div>
                <h3 className="font-black text-2xl text-slate-900 mb-4 tracking-tight">Guest Intelligence System</h3>
                <p className="text-slate-500 font-medium max-w-md mx-auto mb-8 text-sm">Accessing the centralized guest directory for identity verification and stay history.</p>
                <div className="max-w-md mx-auto relative">
                   <i className="fas fa-search absolute left-5 top-1/2 -translate-y-1/2 text-slate-400"></i>
                   <input type="text" placeholder="Search by name, ID, or phone..." className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 pl-14 pr-6 text-sm font-bold focus:outline-none focus:ring-4 ring-indigo-50" />
                </div>
             </div>
           )}
        </div>

        {/* Ops Sidebar */}
        <div className="space-y-8">
           {/* Shift Notes */}
           <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm space-y-8">
              <div className="flex items-center justify-between">
                 <h3 className="font-black text-xl text-slate-900 tracking-tight">Shift Notes</h3>
                 <button className="text-indigo-600 hover:rotate-12 transition-transform"><i className="fas fa-plus-circle text-xl"></i></button>
              </div>
              <div className="space-y-6">
                 {notes.map(note => (
                   <div key={note.id} className="relative pl-6 border-l-2 border-indigo-100">
                      <div className="absolute left-[-5px] top-0 w-2 h-2 rounded-full bg-indigo-600"></div>
                      <p className="text-sm font-bold text-slate-800 mb-1 leading-relaxed">"{note.text}"</p>
                      <div className="flex items-center justify-between">
                         <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">{note.author}</span>
                         <span className="text-[10px] font-bold text-slate-300">{note.time}</span>
                      </div>
                   </div>
                 ))}
              </div>
           </div>

           {/* Quick Actions */}
           <div className="bg-indigo-600 p-8 rounded-[40px] shadow-2xl text-white space-y-6">
              <h4 className="font-black text-lg">Staff Hotline</h4>
              <p className="text-indigo-100/70 text-xs font-medium leading-relaxed">Emergency contact or operational escalation directly to management.</p>
              <div className="grid grid-cols-2 gap-4">
                 <button className="flex flex-col items-center justify-center p-4 bg-white/10 border border-white/20 rounded-2xl hover:bg-white/20 transition-all">
                    <i className="fas fa-headset mb-2"></i>
                    <span className="text-[10px] font-black uppercase">Owner</span>
                 </button>
                 <button className="flex flex-col items-center justify-center p-4 bg-white/10 border border-white/20 rounded-2xl hover:bg-white/20 transition-all">
                    <i className="fas fa-screwdriver-wrench mb-2"></i>
                    <span className="text-[10px] font-black uppercase">Service</span>
                 </button>
              </div>
           </div>

           <div className="bg-slate-50 p-8 rounded-[40px] border border-slate-200 border-dashed text-center">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4">Accountability Log</p>
              <div className="flex flex-col items-center gap-2">
                 <span className="text-xs font-bold text-slate-600">Active Session: 4h 22m</span>
                 <button className="text-rose-500 font-black text-[10px] uppercase tracking-widest hover:underline">Log Out Shift</button>
              </div>
           </div>
        </div>
      </div>

      {/* Check-in Modal */}
      {isCheckInModalOpen && selectedBooking && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300">
           <div className="bg-white w-full max-w-xl rounded-[40px] shadow-2xl overflow-hidden border border-white p-10 space-y-8">
              <div className="flex justify-between items-center">
                 <h3 className="font-black text-2xl text-slate-900 tracking-tighter">Guest Registration</h3>
                 <button onClick={() => setCheckInModalOpen(false)} className="text-slate-400 hover:text-indigo-600 transition-all"><i className="fas fa-times text-xl"></i></button>
              </div>
              <div className="space-y-6">
                 <div className="p-6 bg-slate-50 rounded-3xl space-y-4">
                    <div className="flex justify-between items-center">
                       <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Guest Detail</span>
                       <span className="text-xs font-black text-indigo-600 uppercase">Verified Member</span>
                    </div>
                    <p className="text-xl font-black text-slate-900 leading-none">Booking Ref: {selectedBooking.id.toUpperCase()}</p>
                    <div className="flex items-center gap-4 text-sm font-bold text-slate-500">
                       <i className="fas fa-calendar-check text-indigo-500"></i>
                       {selectedBooking.checkIn} — {selectedBooking.checkOut}
                    </div>
                 </div>

                 <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Guest ID Verification</label>
                    <div className="h-40 border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center text-slate-300 group cursor-pointer hover:border-indigo-600 hover:text-indigo-600 transition-all">
                       <i className="fas fa-id-card text-3xl mb-3"></i>
                       <span className="text-xs font-black uppercase">Scan or Upload Passport / ID</span>
                    </div>
                 </div>

                 <div className="flex items-center gap-4 p-4 bg-emerald-50 text-emerald-800 rounded-2xl border border-emerald-100">
                    <i className="fas fa-circle-check"></i>
                    <p className="text-xs font-bold">Full Payment Received: Rp {selectedBooking.totalPrice.toLocaleString()}</p>
                 </div>
              </div>
              <div className="flex gap-4">
                 <button 
                   onClick={() => setCheckInModalOpen(false)}
                   className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-slate-200 transition-all"
                 >
                    Cancel
                 </button>
                 <button 
                   onClick={() => handleCheckIn(selectedBooking.id)}
                   className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all"
                 >
                    Complete Check-in
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};
