
import React, { useState, useMemo, useEffect } from 'react';
import { 
  MOCK_BOOKINGS, MOCK_UNITS, MOCK_BUSINESSES, MOCK_USERS, 
  MOCK_MAINTENANCE, MOCK_AUDIT_LOGS 
} from '../constants';
import { 
  BookingStatus, Unit, UnitStatus, Booking, User, 
  MaintenanceTicket, AuditLog, UserRole 
} from '../types';

type StaffModule = 'front-desk' | 'inventory' | 'guests' | 'maintenance' | 'payments' | 'settings';

export const StaffDashboard: React.FC = () => {
  const [activeModule, setActiveModule] = useState<StaffModule>('front-desk');
  const [businessId] = useState('b1'); // Isolated to current tenant
  
  // Scoped Data State
  const [units, setUnits] = useState<Unit[]>(MOCK_UNITS.filter(u => u.businessId === businessId));
  const [bookings, setBookings] = useState<Booking[]>(MOCK_BOOKINGS.filter(b => b.businessId === businessId));
  const [tickets, setTickets] = useState<MaintenanceTicket[]>(MOCK_MAINTENANCE.filter(t => units.some(u => u.id === t.unitId)));
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(MOCK_AUDIT_LOGS.filter(l => l.actorRole === UserRole.ADMIN_STAFF));

  // Modal States
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isCheckInOpen, setIsCheckInOpen] = useState(false);
  const [isCheckOutOpen, setIsCheckOutOpen] = useState(false);
  const [showIdentityScanner, setShowIdentityScanner] = useState(false);

  // Stats Calculations
  const today = new Date().toISOString().split('T')[0];
  const arrivals = bookings.filter(b => b.checkIn === today && b.status !== BookingStatus.CHECKED_IN);
  const departures = bookings.filter(b => b.checkOut === today && b.status === BookingStatus.CHECKED_IN);
  const inHouse = bookings.filter(b => b.status === BookingStatus.CHECKED_IN).length;

  const handleUpdateUnitStatus = (unitId: string, status: UnitStatus) => {
    setUnits(prev => prev.map(u => u.id === unitId ? { ...u, status, available: status === UnitStatus.READY } : u));
    logAction(`Changed Unit ${unitId} status to ${status}`, unitId);
  };

  const handleCheckInComplete = () => {
    if (!selectedBooking) return;
    setBookings(prev => prev.map(b => b.id === selectedBooking.id ? { ...b, status: BookingStatus.CHECKED_IN } : b));
    handleUpdateUnitStatus(selectedBooking.unitId, UnitStatus.BLOCKED);
    logAction(`Checked in guest for booking ${selectedBooking.id}`, selectedBooking.id);
    setIsCheckInOpen(false);
    setSelectedBooking(null);
  };

  const handleCheckOutComplete = () => {
    if (!selectedBooking) return;
    setBookings(prev => prev.map(b => b.id === selectedBooking.id ? { ...b, status: BookingStatus.COMPLETED } : b));
    handleUpdateUnitStatus(selectedBooking.unitId, UnitStatus.DIRTY);
    logAction(`Checked out guest for booking ${selectedBooking.id}`, selectedBooking.id);
    setIsCheckOutOpen(false);
    setSelectedBooking(null);
  };

  const logAction = (action: string, target: string) => {
    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      actorId: 'u3', // Assuming currently logged in staff
      actorName: 'Sarah Staff',
      actorRole: UserRole.ADMIN_STAFF,
      action,
      target,
      type: 'operational',
      timestamp: new Date().toISOString()
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  const renderModuleNavigation = () => (
    <div className="flex bg-white p-2 rounded-[28px] border border-slate-200/60 shadow-sm overflow-x-auto scrollbar-hide mb-8">
      {[
        { id: 'front-desk', label: 'Front Desk', icon: 'fa-calendar-day' },
        { id: 'inventory', label: 'Units & Cleaning', icon: 'fa-door-open' },
        { id: 'guests', label: 'Guest Book', icon: 'fa-address-book' },
        { id: 'maintenance', label: 'Maintenance', icon: 'fa-screwdriver-wrench' },
        { id: 'payments', label: 'Pay Verification', icon: 'fa-receipt' },
        { id: 'settings', label: 'My Ops', icon: 'fa-user-gear' }
      ].map(mod => (
        <button
          key={mod.id}
          onClick={() => setActiveModule(mod.id as StaffModule)}
          className={`flex-1 flex items-center justify-center gap-3 px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.15em] transition-all whitespace-nowrap ${
            activeModule === mod.id ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100' : 'text-slate-500 hover:bg-slate-50'
          }`}
        >
          <i className={`fas ${mod.icon} text-lg`}></i>
          <span>{mod.label}</span>
        </button>
      ))}
    </div>
  );

  const renderFrontDesk = () => (
    <div className="space-y-10 animate-fade-up">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Arrival Queue */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm">
             <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">Today's Arrivals</h3>
                <span className="px-4 py-1.5 bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase rounded-full border border-emerald-100">{arrivals.length} Expected</span>
             </div>
             <div className="space-y-4">
                {arrivals.map(bk => (
                  <div key={bk.id} className="flex items-center justify-between p-6 bg-slate-50 rounded-3xl border border-slate-100 hover:border-indigo-200 transition-all group">
                     <div className="flex items-center gap-6">
                        <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-indigo-600 shadow-sm border border-slate-200 font-black">
                           #{bk.id.slice(-2).toUpperCase()}
                        </div>
                        <div>
                           <p className="font-black text-slate-900 mb-1">{MOCK_USERS.find(u => u.id === bk.guestId)?.name || 'Walk-in Guest'}</p>
                           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Unit: {units.find(u => u.id === bk.unitId)?.name}</p>
                        </div>
                     </div>
                     <button 
                        onClick={() => { setSelectedBooking(bk); setIsCheckInOpen(true); }}
                        className="px-8 py-3 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 shadow-lg shadow-indigo-100"
                     >
                        Register
                     </button>
                  </div>
                ))}
                {arrivals.length === 0 && (
                  <div className="py-12 text-center">
                    <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">No more arrivals scheduled for today</p>
                  </div>
                )}
             </div>
          </div>

          <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm">
             <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">Pending Departures</h3>
                <span className="px-4 py-1.5 bg-amber-50 text-amber-600 text-[10px] font-black uppercase rounded-full border border-amber-100">{departures.length} Checking Out</span>
             </div>
             <div className="space-y-4">
                {departures.map(bk => (
                  <div key={bk.id} className="flex items-center justify-between p-6 bg-slate-50 rounded-3xl border border-slate-100 hover:border-amber-200 transition-all">
                     <div className="flex items-center gap-6">
                        <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-amber-600 shadow-sm border border-slate-200 font-black">
                           #{bk.id.slice(-2).toUpperCase()}
                        </div>
                        <div>
                           <p className="font-black text-slate-900 mb-1">{MOCK_USERS.find(u => u.id === bk.guestId)?.name}</p>
                           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Room: {units.find(u => u.id === bk.unitId)?.name}</p>
                        </div>
                     </div>
                     <button 
                        onClick={() => { setSelectedBooking(bk); setIsCheckOutOpen(true); }}
                        className="px-8 py-3 bg-slate-950 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-600 transition-all shadow-lg"
                     >
                        Check Out
                     </button>
                  </div>
                ))}
             </div>
          </div>
        </div>

        {/* Tactical Info Panel */}
        <div className="space-y-8">
           <div className="bg-slate-950 p-10 rounded-[48px] shadow-2xl text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl -mr-32 -mt-32"></div>
              <h3 className="font-black text-xl mb-8 relative z-10">Ops Intelligence</h3>
              <div className="space-y-6 relative z-10">
                 <div className="p-6 bg-white/5 rounded-3xl border border-white/10 flex items-center justify-between">
                    <span className="text-[10px] font-black text-indigo-300 uppercase tracking-widest">Guests In-House</span>
                    <span className="text-3xl font-black">{inHouse}</span>
                 </div>
                 <div className="p-6 bg-white/5 rounded-3xl border border-white/10 flex items-center justify-between">
                    <span className="text-[10px] font-black text-indigo-300 uppercase tracking-widest">Dirty Units</span>
                    <span className="text-3xl font-black text-rose-400">{units.filter(u => u.status === UnitStatus.DIRTY).length}</span>
                 </div>
                 <button className="w-full py-4 bg-white text-slate-900 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all">Download Daily Log</button>
              </div>
           </div>

           <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Internal Announcements</h4>
              <div className="space-y-6">
                 <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
                    <p className="text-xs font-bold text-slate-700 leading-relaxed mb-2">"Lobby renovation starts tomorrow. Ensure all checked-in guests are notified."</p>
                    <span className="text-[9px] font-black text-indigo-600 uppercase">From: Owner</span>
                 </div>
                 <div className="p-4 bg-rose-50 rounded-2xl border border-rose-100">
                    <p className="text-xs font-bold text-slate-700 leading-relaxed mb-2">"AC Maintenance for Cluster B scheduled for 14:00 today."</p>
                    <span className="text-[9px] font-black text-rose-600 uppercase">From: Management</span>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );

  const renderInventory = () => (
    <div className="space-y-8 animate-fade-up">
       <div className="flex items-center justify-between">
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Housekeeping Node</h2>
          <div className="flex gap-2">
             <button className="bg-slate-100 text-slate-600 px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-200 transition-all">Bulk Ready</button>
          </div>
       </div>
       <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {units.map(unit => (
            <div key={unit.id} className="bg-white p-8 rounded-[40px] border border-slate-100 hover:shadow-xl transition-all group flex flex-col space-y-6">
               <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-xl font-black text-slate-900 mb-1">{unit.name}</h4>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{unit.type}</span>
                  </div>
                  <span className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border ${
                    unit.status === UnitStatus.READY ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                    unit.status === UnitStatus.DIRTY ? 'bg-rose-50 text-rose-600 border-rose-100' :
                    unit.status === UnitStatus.CLEANING ? 'bg-indigo-50 text-indigo-600 border-indigo-100 animate-pulse' :
                    'bg-slate-100 text-slate-500 border-slate-200'
                  }`}>{unit.status}</span>
               </div>
               
               <div className="grid grid-cols-2 gap-2 pt-6 border-t border-slate-50">
                  <button 
                    onClick={() => handleUpdateUnitStatus(unit.id, UnitStatus.CLEANING)}
                    className="py-3 bg-slate-50 text-slate-500 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-indigo-50 hover:text-indigo-600 transition-all"
                  >
                    Start Clean
                  </button>
                  <button 
                    onClick={() => handleUpdateUnitStatus(unit.id, UnitStatus.READY)}
                    className="py-3 bg-slate-50 text-slate-500 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-emerald-50 hover:text-emerald-600 transition-all"
                  >
                    Ready
                  </button>
                  <button 
                    onClick={() => handleUpdateUnitStatus(unit.id, UnitStatus.MAINTENANCE)}
                    className="col-span-2 py-3 border border-slate-100 text-slate-400 rounded-xl text-[9px] font-black uppercase tracking-widest hover:border-rose-100 hover:text-rose-600 transition-all"
                  >
                    Maintenance Alert
                  </button>
               </div>
            </div>
          ))}
       </div>
    </div>
  );

  const renderMaintenance = () => (
    <div className="space-y-10 animate-fade-up">
       <div className="flex items-center justify-between">
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Maintenance Tickets</h2>
          <button className="bg-rose-600 text-white px-8 py-4 rounded-3xl font-black text-xs uppercase tracking-widest shadow-xl shadow-rose-100">Report Unit Issue</button>
       </div>
       <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {tickets.map(ticket => (
            <div key={ticket.id} className="bg-white p-10 rounded-[48px] border border-slate-100 shadow-sm flex flex-col md:flex-row gap-10 hover:shadow-2xl transition-all group relative overflow-hidden">
               <div className={`absolute top-0 left-0 w-2 h-full ${ticket.priority === 'high' ? 'bg-rose-500' : 'bg-amber-400'}`}></div>
               <div className="flex-1 space-y-6">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Ref: {ticket.id.toUpperCase()}</span>
                    <span className={`px-4 py-1 rounded-xl text-[9px] font-black uppercase tracking-widest ${
                      ticket.status === 'open' ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'
                    }`}>{ticket.status}</span>
                  </div>
                  <div>
                    <h4 className="text-2xl font-black text-slate-900 mb-2">{ticket.issue}</h4>
                    <p className="text-xs font-bold text-slate-400 flex items-center gap-3">
                       <i className="fas fa-door-open text-indigo-500"></i>
                       Room: {units.find(u => u.id === ticket.unitId)?.name}
                    </p>
                  </div>
                  <div className="pt-6 border-t border-slate-50 flex items-center justify-between">
                     <span className="text-[10px] font-black text-slate-400 uppercase">Reported: {ticket.createdAt}</span>
                     <button className="px-6 py-2.5 bg-slate-950 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all">Update Log</button>
                  </div>
               </div>
            </div>
          ))}
       </div>
    </div>
  );

  const renderPayments = () => (
    <div className="space-y-10 animate-fade-up">
       <div className="bg-white p-10 rounded-[48px] border border-slate-100 shadow-sm overflow-hidden">
          <div className="mb-10">
             <h3 className="text-3xl font-black text-slate-900 tracking-tight">Manual Pay Verification</h3>
             <p className="text-slate-500 font-medium">Review and verify bank transfer proofs uploaded by guests.</p>
          </div>
          <div className="overflow-x-auto">
             <table className="w-full text-left">
                <thead>
                   <tr className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                      <th className="px-10 py-6">Booking Ref</th>
                      <th className="px-10 py-6 text-right">Amount (IDR)</th>
                      <th className="px-10 py-6">Status</th>
                      <th className="px-10 py-6 text-right">Verification Protocol</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                   {bookings.map(bk => (
                     <tr key={bk.id} className="hover:bg-slate-50/50 transition-all">
                        <td className="px-10 py-8">
                           <p className="font-black text-slate-900 uppercase">{bk.id}</p>
                           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Guest#{bk.guestId}</p>
                        </td>
                        <td className="px-10 py-8 text-right font-black text-slate-900">Rp {bk.totalPrice.toLocaleString()}</td>
                        <td className="px-10 py-8">
                           <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                             bk.verifiedPayment ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'
                           }`}>{bk.verifiedPayment ? 'Verified' : 'Unverified Proof'}</span>
                        </td>
                        <td className="px-10 py-8 text-right">
                           <button className="px-6 py-3 bg-white border border-slate-200 text-slate-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:border-indigo-600 hover:text-indigo-600 transition-all">View Proof Attachment</button>
                        </td>
                     </tr>
                   ))}
                </tbody>
             </table>
          </div>
       </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-[#f8fafc] overflow-hidden">
      {/* Local Sidebar specifically for Operational Staff */}
      <aside className="w-80 bg-white border-r border-slate-200/60 transition-all duration-500 flex flex-col z-50 shadow-sm shrink-0">
        <div className="h-24 flex items-center px-8 border-b border-slate-50">
          <div className="flex items-center gap-4">
             <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl">
                <i className="fas fa-clipboard-check"></i>
             </div>
             <div className="flex flex-col">
                <span className="font-black text-lg tracking-tight text-slate-900 uppercase">Ops Desk</span>
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Grand Seulanga Node</span>
             </div>
          </div>
        </div>
        <nav className="flex-1 overflow-y-auto p-6 space-y-1.5 scrollbar-hide">
           {[
             { id: 'front-desk', label: 'Check-in Queue', icon: 'fa-calendar-check' },
             { id: 'inventory', label: 'Unit Readiness', icon: 'fa-broom' },
             { id: 'maintenance', label: 'Maintenance Hub', icon: 'fa-screwdriver-wrench' },
             { id: 'payments', label: 'Pay Verification', icon: 'fa-money-bill-transfer' },
             { id: 'guests', label: 'Guest Ledger', icon: 'fa-users-rectangle' },
             { id: 'settings', label: 'Personal Ops', icon: 'fa-gears' }
           ].map(item => (
             <button 
                key={item.id}
                onClick={() => setActiveModule(item.id as StaffModule)}
                className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${
                  activeModule === item.id ? 'bg-indigo-600 text-white shadow-2xl shadow-indigo-100' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                }`}
             >
                <i className={`fas ${item.icon} text-lg w-6`}></i>
                {item.label}
             </button>
           ))}
        </nav>
        <div className="p-8 border-t border-slate-50 bg-slate-50/30">
           <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-slate-200 border border-slate-300"></div>
              <div>
                 <p className="text-[10px] font-black text-slate-900 uppercase">Sarah Staff</p>
                 <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Active Shift: Desk 01</p>
              </div>
           </div>
        </div>
      </aside>

      {/* Primary Ops Content */}
      <main className="flex-1 overflow-y-auto scrollbar-hide p-12 max-w-[1600px] mx-auto w-full">
         <header className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12">
            <div>
               <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase mb-2">Platform Desk<span className="text-indigo-600">.</span></h1>
               <div className="flex items-center gap-3">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Operational Readiness Status: Optimal</p>
               </div>
            </div>
            <div className="flex items-center gap-4">
               <div className="bg-white border border-slate-200 rounded-2xl px-6 py-3 flex items-center gap-4 shadow-sm">
                  <i className="fas fa-clock text-indigo-600"></i>
                  <span className="text-xs font-black text-slate-700">{new Date().toLocaleTimeString()}</span>
               </div>
               <button className="w-12 h-12 bg-white border border-slate-200 rounded-2xl flex items-center justify-center text-slate-400 hover:text-indigo-600 transition-all shadow-sm">
                  <i className="fas fa-magnifying-glass"></i>
               </button>
            </div>
         </header>

         {activeModule === 'front-desk' && renderFrontDesk()}
         {activeModule === 'inventory' && renderInventory()}
         {activeModule === 'maintenance' && renderMaintenance()}
         {activeModule === 'payments' && renderPayments()}
         
         {['guests', 'settings'].includes(activeModule) && (
            <div className="py-40 text-center animate-fade-up">
               <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-8 text-slate-300">
                  <i className="fas fa-layer-group text-4xl"></i>
               </div>
               <h3 className="text-3xl font-black text-slate-900 mb-4 tracking-tighter uppercase">{activeModule} Module Node</h3>
               <p className="text-slate-500 font-medium max-w-md mx-auto">Accessing secure platform nodes for {activeModule} governance. Stand by for encrypted data sync.</p>
            </div>
         )}
      </main>

      {/* Operational Flow Modals */}
      {isCheckInOpen && selectedBooking && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300">
           <div className="bg-white w-full max-w-xl rounded-[48px] shadow-2xl p-12 space-y-10 border border-white">
              <div className="flex justify-between items-center">
                 <h3 className="text-3xl font-black text-slate-900 tracking-tighter">Identity Enrollment</h3>
                 <button onClick={() => setIsCheckInOpen(false)} className="text-slate-400 hover:text-indigo-600"><i className="fas fa-times text-xl"></i></button>
              </div>
              <div className="space-y-8">
                 <div className="p-8 bg-slate-50 rounded-[40px] space-y-6">
                    <div>
                       <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-1">Stay Identity</p>
                       <h4 className="text-2xl font-black text-slate-900 uppercase">{selectedBooking.id}</h4>
                    </div>
                    <div className="flex items-center gap-6 py-6 border-y border-slate-200">
                       <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Unit Assigned</p>
                          <p className="font-black text-slate-700">{units.find(u => u.id === selectedBooking.unitId)?.name}</p>
                       </div>
                       <i className="fas fa-long-arrow-right text-slate-300"></i>
                       <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Verification Status</p>
                          <p className="font-black text-emerald-600 uppercase text-xs">Verified Member</p>
                       </div>
                    </div>
                 </div>

                 <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Document Registry</label>
                    <div 
                      onClick={() => setShowIdentityScanner(!showIdentityScanner)}
                      className="h-44 border-2 border-dashed border-slate-200 rounded-[32px] flex flex-col items-center justify-center text-slate-300 hover:border-indigo-600 hover:text-indigo-600 cursor-pointer transition-all group"
                    >
                       <i className={`fas ${showIdentityScanner ? 'fa-camera animate-pulse' : 'fa-id-card'} text-4xl mb-4 group-hover:scale-110 transition-transform`}></i>
                       <span className="text-xs font-black uppercase tracking-widest">{showIdentityScanner ? 'Scanning Optical Data...' : 'Scan Passport / KTP'}</span>
                    </div>
                 </div>

                 <div className="p-6 bg-emerald-50 text-emerald-800 rounded-3xl border border-emerald-100 flex items-center gap-4">
                    <i className="fas fa-shield-check text-xl"></i>
                    <p className="text-xs font-black uppercase tracking-wider">Payment Verification Node Confirmed</p>
                 </div>
              </div>
              <div className="flex gap-4">
                 <button onClick={() => setIsCheckInOpen(false)} className="flex-1 py-5 bg-slate-100 text-slate-600 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-slate-200">Abort</button>
                 <button onClick={handleCheckInComplete} className="flex-1 py-5 bg-indigo-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-indigo-100">Finalize Identity Lock</button>
              </div>
           </div>
        </div>
      )}

      {isCheckOutOpen && selectedBooking && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300">
           <div className="bg-white w-full max-w-xl rounded-[48px] shadow-2xl p-12 space-y-10 border border-white">
              <div className="flex justify-between items-center">
                 <h3 className="text-3xl font-black text-slate-900 tracking-tighter">Departure Protocol</h3>
                 <button onClick={() => setIsCheckOutOpen(false)} className="text-slate-400 hover:text-indigo-600"><i className="fas fa-times text-xl"></i></button>
              </div>
              <div className="space-y-8">
                 <div className="p-8 bg-rose-50 rounded-[40px] space-y-6">
                    <div className="flex justify-between items-center">
                       <p className="text-[10px] font-black text-rose-600 uppercase tracking-widest">Unit Re-Asset</p>
                       <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{selectedBooking.id}</span>
                    </div>
                    <h4 className="text-2xl font-black text-slate-900">{units.find(u => u.id === selectedBooking.unitId)?.name}</h4>
                 </div>

                 <div className="space-y-6">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Observation Registry</p>
                    <div className="grid grid-cols-2 gap-4">
                       <button className="p-6 bg-slate-50 border border-slate-200 rounded-3xl flex flex-col items-center gap-3 hover:border-rose-500 hover:text-rose-600 transition-all group">
                          <i className="fas fa-house-circle-exclamation text-xl text-slate-300 group-hover:text-rose-500"></i>
                          <span className="text-[10px] font-black uppercase tracking-widest">Report Damage</span>
                       </button>
                       <button className="p-6 bg-slate-50 border border-slate-200 rounded-3xl flex flex-col items-center gap-3 hover:border-indigo-500 hover:text-indigo-600 transition-all group">
                          <i className="fas fa-box-open text-xl text-slate-300 group-hover:text-indigo-500"></i>
                          <span className="text-[10px] font-black uppercase tracking-widest">Lost & Found</span>
                       </button>
                    </div>
                 </div>

                 <div className="p-6 bg-indigo-50 rounded-3xl border border-indigo-100 flex items-start gap-4">
                    <i className="fas fa-info-circle text-indigo-600 mt-1"></i>
                    <p className="text-xs font-bold text-indigo-700 leading-relaxed uppercase tracking-wider">Checkout status will automatically flag the unit as "DIRTY" for the cleaning team.</p>
                 </div>
              </div>
              <div className="flex gap-4">
                 <button onClick={() => setIsCheckOutOpen(false)} className="flex-1 py-5 bg-slate-100 text-slate-600 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-slate-200">Wait</button>
                 <button onClick={handleCheckOutComplete} className="flex-1 py-5 bg-slate-950 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl">Complete Departure</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};
