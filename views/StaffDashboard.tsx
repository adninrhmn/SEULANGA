
import React, { useState, useMemo, useEffect } from 'react';
import { 
  MOCK_BOOKINGS, MOCK_UNITS, MOCK_BUSINESSES, MOCK_USERS, 
  MOCK_MAINTENANCE, MOCK_AUDIT_LOGS 
} from '../constants';
import { 
  BookingStatus, Unit, UnitStatus, Booking, User, 
  MaintenanceTicket, AuditLog, UserRole 
} from '../types';

type StaffModule = 'front-desk' | 'inventory' | 'guests' | 'maintenance' | 'payments' | 'settings' | 'profile';

interface StaffDashboardProps {
    currentUser: User | null;
    onUpdateUser: (data: Partial<User>) => void;
}

export const StaffDashboard: React.FC<StaffDashboardProps> = ({ currentUser, onUpdateUser }) => {
  const [activeModule, setActiveModule] = useState<StaffModule>('front-desk');
  const [businessId] = useState('b1'); 
  
  const [units, setUnits] = useState<Unit[]>(MOCK_UNITS.filter(u => u.businessId === businessId));
  const [bookings, setBookings] = useState<Booking[]>(MOCK_BOOKINGS.filter(b => b.businessId === businessId));
  const [tickets] = useState<MaintenanceTicket[]>(MOCK_MAINTENANCE.filter(t => units.some(u => u.id === t.unitId)));
  
  // Form states
  const [profileName, setProfileName] = useState(currentUser?.name || '');
  const [isSaving, setIsSaving] = useState(false);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    await new Promise(r => setTimeout(r, 1000));
    onUpdateUser({ name: profileName });
    setIsSaving(false);
    alert('Ops Profile Updated.');
  };

  const renderFrontDesk = () => (
    <div className="space-y-10 animate-fade-up">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm">
             <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-8">Today's Arrivals</h3>
             <div className="space-y-4 text-center py-20">
                <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">No more arrivals scheduled for today</p>
             </div>
          </div>
        </div>
        <div className="bg-slate-950 p-10 rounded-[48px] shadow-2xl text-white relative overflow-hidden">
           <h3 className="font-black text-xl mb-8 relative z-10">Ops Intelligence</h3>
           <div className="space-y-6 relative z-10">
              <div className="p-6 bg-white/5 rounded-3xl border border-white/10 flex items-center justify-between">
                 <span className="text-[10px] font-black text-indigo-300 uppercase tracking-widest">Guests In-House</span>
                 <span className="text-3xl font-black">12</span>
              </div>
              <button className="w-full py-4 bg-white text-slate-900 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all">Download Daily Log</button>
           </div>
        </div>
      </div>
    </div>
  );

  const renderProfile = () => (
    <div className="max-w-4xl mx-auto space-y-10 animate-fade-up">
       <div className="bg-white p-12 rounded-[48px] border border-slate-100 shadow-sm space-y-10">
          <div className="flex items-center gap-8 pb-10 border-b border-slate-50">
             <img src={currentUser?.avatar} className="w-24 h-24 rounded-3xl object-cover ring-4 ring-slate-50 shadow-xl" />
             <div>
                <h3 className="text-3xl font-black text-slate-900 tracking-tighter mb-1">{currentUser?.name}</h3>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Operational Desk #011</p>
             </div>
          </div>
          
          <form onSubmit={handleUpdateProfile} className="space-y-8">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Operator Name</label>
                   <input 
                     type="text" 
                     value={profileName}
                     onChange={(e) => setProfileName(e.target.value)}
                     className="w-full bg-slate-50 border border-slate-200 rounded-3xl px-6 py-4 font-bold text-slate-900 focus:outline-none focus:ring-4 ring-indigo-50" 
                   />
                </div>
                <div className="space-y-3">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Shift Responsibility</label>
                   <input type="text" value="Morning Operations (08:00 - 16:00)" disabled className="w-full bg-slate-100 border border-slate-200 rounded-3xl px-6 py-4 font-bold text-slate-400 cursor-not-allowed" />
                </div>
             </div>
             <div className="p-6 bg-indigo-50 rounded-3xl border border-indigo-100">
                <h4 className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-4">Assigned Permissions</h4>
                <div className="flex flex-wrap gap-2">
                   {['Check-in', 'Check-out', 'Payment Verification', 'Housekeeping Logs'].map(p => (
                      <span key={p} className="px-4 py-1.5 bg-white text-slate-600 text-[9px] font-black uppercase rounded-lg border border-indigo-100">{p}</span>
                   ))}
                </div>
             </div>
             <button 
               disabled={isSaving}
               className="w-full py-5 bg-slate-950 text-white rounded-3xl font-black text-xs uppercase tracking-widest shadow-xl hover:bg-indigo-600 transition-all"
             >
                {isSaving ? <i className="fas fa-spinner fa-spin mr-2"></i> : <i className="fas fa-sync mr-2"></i>}
                Synchronize Ops Identity
             </button>
          </form>
       </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-[#f8fafc] overflow-hidden">
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
             { id: 'profile', label: 'Personal Ops', icon: 'fa-user-gear' }
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
      </aside>

      <main className="flex-1 overflow-y-auto bg-[#f8fafc] scrollbar-hide p-12">
         <header className="mb-12">
            <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">{activeModule} Module</h1>
         </header>
         {activeModule === 'front-desk' && renderFrontDesk()}
         {activeModule === 'profile' && renderProfile()}
         {activeModule !== 'front-desk' && activeModule !== 'profile' && (
            <div className="py-40 text-center animate-fade-up">
               <h3 className="text-3xl font-black text-slate-900 mb-4 tracking-tighter uppercase">{activeModule} Node</h3>
               <p className="text-slate-500 font-medium max-w-md mx-auto">Accessing operational protocols for {activeModule}.</p>
            </div>
         )}
      </main>
    </div>
  );
};
