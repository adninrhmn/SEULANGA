
import React, { useState, useEffect, useMemo } from 'react';
import { MOCK_BUSINESSES, MOCK_BOOKINGS, MOCK_UNITS, MOCK_TRANSACTIONS, MOCK_USERS } from '../constants';
import { getBusinessInsights } from '../services/geminiService';
import { BookingStatus, UserRole, Unit, Business, User, BusinessCategory, Booking, VerificationStatus } from '../types';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer 
} from 'recharts';

const revenueData = [
  { name: 'Jul', revenue: 45000000, occupancy: 78 },
  { name: 'Aug', revenue: 52000000, occupancy: 82 },
  { name: 'Sep', revenue: 48000000, occupancy: 75 },
  { name: 'Oct', revenue: 61000000, occupancy: 88 },
  { name: 'Nov', revenue: 55000000, occupancy: 80 },
  { name: 'Dec', revenue: 78000000, occupancy: 95 },
];

export const OwnerDashboard: React.FC = () => {
  const [activeModule, setActiveModule] = useState<'overview' | 'inventory' | 'bookings' | 'finance' | 'team' | 'settings'>('overview');
  const [insights, setInsights] = useState<string>('Analyzing market data for your properties...');
  const [activeChart, setActiveChart] = useState<'revenue' | 'occupancy'>('revenue');
  
  // Local Data State
  const [business, setBusiness] = useState<Business>(MOCK_BUSINESSES[0]);
  const [units, setUnits] = useState<Unit[]>(MOCK_UNITS.filter(u => u.businessId === MOCK_BUSINESSES[0].id));
  const [bookings, setBookings] = useState<Booking[]>(MOCK_BOOKINGS.filter(b => b.businessId === MOCK_BUSINESSES[0].id));
  const [team, setTeam] = useState<User[]>(MOCK_USERS.filter(u => u.businessId === MOCK_BUSINESSES[0].id));

  // Modals State
  const [showUnitModal, setShowUnitModal] = useState(false);
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null);
  const [blockedDates, setBlockedDates] = useState<string[]>([]);
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  // Calendar State for UI
  const [currentCalendarDate, setCurrentCalendarDate] = useState(new Date());

  useEffect(() => {
    fetchInsights();
  }, [business.category]);

  useEffect(() => {
    if (editingUnit) {
      setBlockedDates(editingUnit.blockedDates || []);
    } else {
      setBlockedDates([]);
    }
  }, [editingUnit]);

  const fetchInsights = async () => {
    setInsights("Connecting to Gemini AI Engine...");
    const text = await getBusinessInsights({
      revenue: revenueData[revenueData.length-1].revenue,
      occupancy: `${revenueData[revenueData.length-1].occupancy}%`,
      unitCount: units.length,
      category: business.category,
      name: business.name
    });
    setInsights(text || "AI Insights currently unavailable.");
  };

  const handleSaveUnit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const unitData: Unit = {
      id: editingUnit?.id || `un-${Date.now()}`,
      businessId: business.id,
      name: formData.get('name') as string,
      type: formData.get('type') as string,
      price: parseInt(formData.get('price') as string),
      capacity: parseInt(formData.get('capacity') as string),
      available: editingUnit ? editingUnit.available : true,
      amenities: (formData.get('amenities') as string).split(',').map(s => s.trim()),
      images: editingUnit?.images || ['https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?q=80&w=2071'],
      description: formData.get('description') as string,
      blockedDates: blockedDates
    };

    if (editingUnit) {
      setUnits(units.map(u => u.id === editingUnit.id ? unitData : u));
    } else {
      setUnits([...units, unitData]);
    }
    
    setShowUnitModal(false);
    setEditingUnit(null);
    setBlockedDates([]);
  };

  const toggleBlockedDate = (dateStr: string) => {
    setBlockedDates(prev => 
      prev.includes(dateStr) 
        ? prev.filter(d => d !== dateStr) 
        : [...prev, dateStr]
    );
  };

  const handleDeleteUnit = (id: string) => {
    if (window.confirm("Are you sure you want to permanently remove this unit? This action cannot be undone.")) {
      setUnits(units.filter(u => u.id !== id));
    }
  };

  const handleAddTeamMember = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newMember: User = {
      id: `u-staff-${Date.now()}`,
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      role: UserRole.ADMIN_STAFF,
      businessId: business.id,
      avatar: `https://i.pravatar.cc/150?u=${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
      verificationStatus: VerificationStatus.VERIFIED
    };
    setTeam([...team, newMember]);
    setShowTeamModal(false);
  };

  const handleUpdateBookingStatus = (id: string, status: BookingStatus) => {
    setBookings(bookings.map(b => b.id === id ? { ...b, status } : b));
    setSelectedBooking(null);
  };

  const toggleStaffStatus = (id: string) => {
    setTeam(team.map(u => {
      if (u.id === id) {
        return { 
          ...u, 
          role: u.role === UserRole.ADMIN_STAFF ? UserRole.GUEST : UserRole.ADMIN_STAFF 
        };
      }
      return u;
    }));
  };

  const renderCalendar = () => {
    const year = currentCalendarDate.getFullYear();
    const month = currentCalendarDate.getMonth();
    
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    
    const monthName = currentCalendarDate.toLocaleString('default', { month: 'long' });
    
    const calendarDays = [];
    // Padding for first week
    for (let i = 0; i < firstDayOfMonth; i++) {
      calendarDays.push(<div key={`empty-${i}`} className="h-12 w-full"></div>);
    }
    
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateStr = date.toISOString().split('T')[0];
      const isBlocked = blockedDates.includes(dateStr);
      const isToday = new Date().toISOString().split('T')[0] === dateStr;
      
      calendarDays.push(
        <button
          key={day}
          type="button"
          onClick={() => toggleBlockedDate(dateStr)}
          className={`h-12 w-full rounded-xl flex flex-col items-center justify-center relative transition-all border ${
            isBlocked 
              ? 'bg-rose-50 border-rose-200 text-rose-600' 
              : 'bg-white border-slate-100 text-slate-700 hover:border-indigo-200 hover:bg-indigo-50/30'
          } ${isToday ? 'ring-2 ring-indigo-500 ring-offset-2' : ''}`}
        >
          <span className={`text-xs font-bold ${isBlocked ? 'font-black' : ''}`}>{day}</span>
          {isBlocked && (
            <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-rose-500 rounded-full"></div>
          )}
        </button>
      );
    }

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
           <div className="flex flex-col">
              <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight">Availability Protocol</h4>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{monthName} {year}</p>
           </div>
           <div className="flex gap-2">
              <button 
                type="button" 
                onClick={() => setCurrentCalendarDate(new Date(year, month - 1))}
                className="w-8 h-8 flex items-center justify-center bg-slate-50 text-slate-400 rounded-lg hover:bg-indigo-50 hover:text-indigo-600 transition-all"
              >
                <i className="fas fa-chevron-left text-[10px]"></i>
              </button>
              <button 
                type="button" 
                onClick={() => setCurrentCalendarDate(new Date(year, month + 1))}
                className="w-8 h-8 flex items-center justify-center bg-slate-50 text-slate-400 rounded-lg hover:bg-indigo-50 hover:text-indigo-600 transition-all"
              >
                <i className="fas fa-chevron-right text-[10px]"></i>
              </button>
           </div>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center mb-2">
          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
            <span key={d} className="text-[8px] font-black text-slate-300 uppercase">{d}</span>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {calendarDays}
        </div>
        <div className="flex items-center gap-4 pt-2">
           <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-rose-500 rounded-full"></div>
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Blocked / Maintenance</span>
           </div>
           <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-slate-200 rounded-full"></div>
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Available</span>
           </div>
        </div>
      </div>
    );
  };

  const renderOverview = () => (
    <div className="space-y-10 animate-fade-up">
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 bg-white p-10 rounded-[40px] border border-slate-100 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full blur-3xl -mr-16 -mt-16"></div>
        <div className="relative z-10 flex items-center gap-8">
          <div className="w-24 h-24 rounded-[32px] bg-indigo-600 flex items-center justify-center text-white shadow-2xl shadow-indigo-100 rotate-2 group hover:rotate-0 transition-transform">
            <i className="fas fa-hotel text-4xl group-hover:scale-110 transition-transform"></i>
          </div>
          <div>
            <div className="flex items-center gap-4 mb-2">
              <h1 className="text-4xl font-black text-slate-900 tracking-tighter">{business.name}</h1>
              <span className="px-4 py-1.5 bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase rounded-full tracking-widest border border-emerald-100 flex items-center gap-2">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                Status: {business.status.toUpperCase()}
              </span>
            </div>
            <p className="text-slate-500 font-medium text-lg flex items-center gap-3">
              <i className="fas fa-location-dot text-indigo-500"></i>
              {business.address}
            </p>
          </div>
        </div>
        <div className="relative z-10 flex flex-wrap gap-4">
          <button onClick={fetchInsights} className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-8 py-4 rounded-2xl font-black text-sm transition-all flex items-center gap-3">
            <i className="fas fa-sync"></i> Refresh Insights
          </button>
          <button onClick={() => { setEditingUnit(null); setShowUnitModal(true); }} className="bg-slate-950 text-white px-10 py-4 rounded-2xl font-black text-sm hover:bg-indigo-600 shadow-xl shadow-slate-200 transition-all flex items-center gap-3">
            <i className="fas fa-plus"></i> New Unit
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Revenue (MTD)', value: `Rp ${(revenueData[5].revenue / 1000000).toFixed(1)}M`, trend: '+15.2%', icon: 'fa-sack-dollar', color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Active Bookings', value: bookings.length, trend: '+12.4%', icon: 'fa-calendar-check', color: 'text-indigo-600', bg: 'bg-indigo-50' },
          { label: 'Occupancy Rate', value: `${revenueData[5].occupancy}%`, trend: '+3.8%', icon: 'fa-door-open', color: 'text-violet-600', bg: 'bg-violet-50' },
          { label: 'Inventory Size', value: units.length, trend: 'Stable', icon: 'fa-boxes-stacked', color: 'text-rose-500', bg: 'bg-rose-50' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-8 rounded-[36px] border border-slate-50 shadow-sm hover:shadow-2xl transition-all group overflow-hidden relative">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${stat.bg} ${stat.color}`}>
              <i className={`fas ${stat.icon} text-2xl`}></i>
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
              <h3 className="text-3xl font-black text-slate-900 tracking-tight">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 bg-white p-10 rounded-[48px] border border-slate-50 shadow-sm">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h3 className="font-black text-2xl text-slate-900 tracking-tight">Ecosystem Growth</h3>
              <p className="text-slate-400 text-sm font-medium">Real-time performance data from SEULANGA Engine</p>
            </div>
            <div className="flex bg-slate-100 p-1.5 rounded-2xl gap-1">
              {['Revenue', 'Occupancy'].map(t => (
                <button 
                  key={t}
                  onClick={() => setActiveChart(t.toLowerCase() as any)}
                  className={`px-8 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeChart === t.toLowerCase() ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="6 6" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 800}} dy={15} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 800}} />
                <Tooltip 
                  contentStyle={{borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.15)', padding: '20px'}}
                />
                <Area 
                  type="monotone" 
                  dataKey={activeChart} 
                  stroke="#4f46e5" 
                  strokeWidth={5} 
                  fillOpacity={1} 
                  fill="url(#chartFill)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="space-y-8">
          <div className="ai-gradient text-white p-10 rounded-[48px] shadow-2xl relative overflow-hidden flex flex-col min-h-[400px]">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
            <div className="relative z-10 flex flex-col h-full">
              <div className="flex items-center gap-5 mb-8">
                <div className="w-14 h-14 bg-white/20 backdrop-blur-xl rounded-2xl flex items-center justify-center border border-white/30 shadow-inner">
                  <i className="fas fa-wand-magic-sparkles text-white text-xl"></i>
                </div>
                <div>
                  <h3 className="font-black text-2xl tracking-tighter">Gemini Intelligence</h3>
                  <p className="text-indigo-200/80 text-[10px] font-bold uppercase tracking-widest">Property Advisory</p>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto scrollbar-hide mb-6">
                <p className="text-sm leading-relaxed text-indigo-50 font-medium italic">
                  "{insights}"
                </p>
              </div>
              <button onClick={fetchInsights} className="w-full py-4 bg-white text-indigo-600 rounded-2xl font-black text-sm shadow-xl hover:scale-[1.02] transition-transform">
                Generate New Strategy
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderInventory = () => (
    <div className="space-y-8 animate-fade-up">
      <div className="flex items-center justify-between mb-4">
         <div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Unit Management Matrix</h2>
            <p className="text-slate-500 font-medium">Add, configure, or retire your property assets.</p>
         </div>
         <button onClick={() => { setEditingUnit(null); setShowUnitModal(true); }} className="bg-slate-900 text-white px-8 py-3.5 rounded-2xl font-black text-sm flex items-center gap-3 hover:bg-indigo-600 transition-all shadow-xl shadow-slate-200">
            <i className="fas fa-plus"></i> Architect New Asset
         </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {units.map(unit => (
          <div key={unit.id} className="bg-white rounded-[40px] overflow-hidden border border-slate-100 hover:shadow-2xl transition-all group flex flex-col h-full">
            <div className="h-64 relative overflow-hidden">
               <img src={unit.images[0]} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
               <div className="absolute top-6 left-6 flex flex-col gap-2">
                 <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border backdrop-blur-md ${unit.available ? 'bg-emerald-50/80 text-emerald-700 border-emerald-100' : 'bg-rose-50/80 text-rose-700 border-rose-100'}`}>
                    {unit.available ? 'Active' : 'Offline'}
                 </span>
                 {unit.blockedDates && unit.blockedDates.length > 0 && (
                   <span className="px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border backdrop-blur-md bg-amber-50/80 text-amber-700 border-amber-100">
                     {unit.blockedDates.length} Dates Blocked
                   </span>
                 )}
               </div>
               <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                 <button onClick={() => { setEditingUnit(unit); setShowUnitModal(true); }} className="w-10 h-10 bg-white text-slate-900 rounded-xl flex items-center justify-center hover:bg-indigo-600 hover:text-white transition-all shadow-lg">
                   <i className="fas fa-edit"></i>
                 </button>
                 <button onClick={() => handleDeleteUnit(unit.id)} className="w-10 h-10 bg-white text-rose-600 rounded-xl flex items-center justify-center hover:bg-rose-600 hover:text-white transition-all shadow-lg">
                   <i className="fas fa-trash-alt"></i>
                 </button>
               </div>
               <div className="absolute bottom-0 inset-x-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
                  <p className="text-white text-2xl font-black">Rp {unit.price.toLocaleString()}<span className="text-xs font-normal text-slate-300 ml-1">/ night</span></p>
               </div>
            </div>
            <div className="p-8 flex flex-col flex-1">
              <div className="flex justify-between items-start mb-4">
                <div>
                   <h3 className="text-2xl font-black text-slate-900 leading-tight">{unit.name}</h3>
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{unit.type}</p>
                </div>
                <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1 rounded-lg">
                   <i className="fas fa-users text-slate-400 text-xs"></i>
                   <span className="text-xs font-black text-slate-600">{unit.capacity}</span>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2 mb-6">
                 {unit.amenities.map(a => (
                   <span key={a} className="px-3 py-1 bg-slate-50 text-slate-500 rounded-lg text-[10px] font-bold uppercase tracking-wider">{a}</span>
                 ))}
              </div>

              <p className="text-sm text-slate-500 font-medium line-clamp-2 mb-8 flex-1">
                {unit.description || "No description provided for this unit asset."}
              </p>
              
              <div className="flex gap-3 mt-auto">
                 <button 
                  onClick={() => { setEditingUnit(unit); setShowUnitModal(true); }}
                  className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all"
                 >
                    Configure
                 </button>
                 <button onClick={() => setUnits(units.map(u => u.id === unit.id ? {...u, available: !u.available} : u))} className={`flex-1 py-3 border border-slate-200 text-slate-900 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${unit.available ? 'hover:border-rose-600 hover:text-rose-600' : 'hover:border-emerald-600 hover:text-emerald-600'}`}>
                    {unit.available ? 'Go Offline' : 'Activate'}
                 </button>
              </div>
            </div>
          </div>
        ))}
        {units.length === 0 && (
          <div className="col-span-full py-32 bg-white rounded-[48px] border-2 border-dashed border-slate-100 flex flex-col items-center text-center">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6 text-slate-300">
               <i className="fas fa-boxes-stacked text-3xl"></i>
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-2">Inventory Void</h3>
            <p className="text-slate-500 font-medium max-w-sm">No units found for this property. Click the button above to begin architecting your first asset.</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderBookings = () => (
    <div className="bg-white rounded-[40px] border border-slate-50 shadow-sm overflow-hidden animate-fade-up">
      <div className="p-10 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-slate-50/20">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Stay Ledger</h2>
          <p className="text-slate-500 font-medium">Control the booking lifecycle of your guests.</p>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">
              <th className="px-10 py-6">Reference</th>
              <th className="px-10 py-6">Check-in / Out</th>
              <th className="px-10 py-6">Unit</th>
              <th className="px-10 py-6">Status</th>
              <th className="px-10 py-6 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {bookings.map(bk => (
              <tr key={bk.id} className="hover:bg-slate-50 transition-all">
                <td className="px-10 py-8">
                   <p className="font-black text-slate-900 leading-none mb-1">#{bk.id.toUpperCase()}</p>
                   <p className="text-[10px] font-bold text-slate-400 uppercase">Guest#{bk.guestId}</p>
                </td>
                <td className="px-10 py-8 text-xs font-bold text-slate-600">
                   {bk.checkIn} <i className="fas fa-arrow-right mx-1 text-[8px]"></i> {bk.checkOut}
                </td>
                <td className="px-10 py-8 font-black text-slate-900 text-sm">
                   {units.find(u => u.id === bk.unitId)?.name || 'Unknown'}
                </td>
                <td className="px-10 py-8">
                   <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase border ${
                     bk.status === BookingStatus.CONFIRMED ? 'bg-indigo-50 text-indigo-600 border-indigo-100' : 
                     bk.status === BookingStatus.PENDING ? 'bg-amber-50 text-amber-600 border-amber-100' :
                     bk.status === BookingStatus.CHECKED_IN ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                     'bg-slate-50 text-slate-500 border-slate-100'
                   }`}>
                     {bk.status}
                   </span>
                </td>
                <td className="px-10 py-8 text-right">
                   <button onClick={() => setSelectedBooking(bk)} className="px-6 py-2.5 bg-slate-950 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all">
                      Manage
                   </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderTeam = () => (
    <div className="space-y-10 animate-fade-up">
      <div className="flex items-center justify-between mb-4">
         <div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Ops Team Matrix</h2>
            <p className="text-slate-500 font-medium">Coordinate roles and access permissions.</p>
         </div>
         <button onClick={() => setShowTeamModal(true)} className="bg-indigo-600 text-white px-8 py-3.5 rounded-2xl font-black text-sm flex items-center gap-3 shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all">
            <i className="fas fa-user-plus"></i> Recruit Member
         </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {team.map(member => (
          <div key={member.id} className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm group hover:shadow-xl transition-all">
            <div className="flex items-center gap-5 mb-8">
               <img src={member.avatar} className="w-16 h-16 rounded-2xl object-cover ring-4 ring-slate-50" />
               <div>
                  <h4 className="font-black text-xl text-slate-900 mb-1">{member.name}</h4>
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${member.role === UserRole.ADMIN_STAFF ? 'bg-indigo-50 text-indigo-600 border-indigo-100' : 'bg-rose-50 text-rose-600 border-rose-100'}`}>
                      {member.role === UserRole.ADMIN_STAFF ? 'Staff Active' : 'Suspended'}
                    </span>
                  </div>
               </div>
            </div>
            <div className="space-y-3 mb-8">
               <p className="text-xs font-bold text-slate-400 flex items-center gap-2">
                 <i className="fas fa-envelope text-indigo-400"></i> {member.email}
               </p>
               <p className="text-xs font-bold text-slate-400 flex items-center gap-2">
                 <i className="fas fa-calendar-alt text-indigo-400"></i> Joined {member.createdAt}
               </p>
            </div>
            <div className="flex gap-3">
               <button onClick={() => toggleStaffStatus(member.id)} className={`flex-1 py-3.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${member.role === UserRole.ADMIN_STAFF ? 'bg-rose-50 text-rose-600 border border-rose-100 hover:bg-rose-100' : 'bg-emerald-50 text-emerald-600 border border-emerald-100 hover:bg-emerald-100'}`}>
                  {member.role === UserRole.ADMIN_STAFF ? 'Suspend Access' : 'Reactivate'}
               </button>
               <button className="flex-1 py-3.5 bg-white border border-slate-200 text-slate-900 rounded-xl font-black text-[10px] uppercase tracking-widest hover:border-indigo-600 transition-all">Permissions</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen bg-[#f8fafc]">
      <div className="px-10 py-6 border-b border-slate-200/50 bg-white/30 backdrop-blur-md sticky top-0 z-30">
         <div className="flex items-center gap-4 max-w-fit mx-auto overflow-x-auto scrollbar-hide">
            {[
              { id: 'overview', label: 'Dashboard', icon: 'fa-chess-king' },
              { id: 'inventory', label: 'Unit Management', icon: 'fa-door-open' },
              { id: 'bookings', label: 'Stay Ledger', icon: 'fa-book-open' },
              { id: 'team', label: 'Ops Matrix', icon: 'fa-users-gear' },
              { id: 'settings', label: 'Identity', icon: 'fa-sliders' }
            ].map(mod => (
              <button 
                key={mod.id}
                onClick={() => setActiveModule(mod.id as any)}
                className={`flex items-center gap-3 px-8 py-4 rounded-2xl text-sm font-black transition-all whitespace-nowrap ${
                  activeModule === mod.id 
                  ? 'bg-indigo-600 text-white shadow-2xl shadow-indigo-100' 
                  : 'text-slate-500 hover:bg-white hover:text-slate-900 border border-transparent'
                }`}
              >
                 <i className={`fas ${mod.icon}`}></i>
                 {mod.label}
              </button>
            ))}
         </div>
      </div>

      <main className="flex-1 p-10 max-w-[1400px] mx-auto w-full">
        {activeModule === 'overview' && renderOverview()}
        {activeModule === 'inventory' && renderInventory()}
        {activeModule === 'bookings' && renderBookings()}
        {activeModule === 'team' && renderTeam()}
        {activeModule === 'settings' && <div className="p-20 text-center font-black text-slate-300">Property Configuration Portal coming in the next security patch.</div>}
      </main>

      {/* Team Member Modal */}
      {showTeamModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-lg rounded-[40px] shadow-2xl p-10 space-y-8">
            <div className="flex justify-between items-center">
              <h3 className="text-3xl font-black text-slate-900">Recruit Staff</h3>
              <button onClick={() => setShowTeamModal(false)} className="text-slate-400 hover:text-indigo-600"><i className="fas fa-times text-xl"></i></button>
            </div>
            <form onSubmit={handleAddTeamMember} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Full Name</label>
                <input name="name" required className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 font-bold text-slate-900 focus:outline-none focus:ring-4 ring-indigo-50" placeholder="Ex: Siti Aminah" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Email Address</label>
                <input name="email" type="email" required className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 font-bold text-slate-900 focus:outline-none focus:ring-4 ring-indigo-50" placeholder="siti@business.com" />
              </div>
              <div className="p-5 bg-indigo-50 rounded-2xl border border-indigo-100 flex items-start gap-4">
                 <i className="fas fa-info-circle text-indigo-600 mt-1"></i>
                 <p className="text-[10px] font-bold text-indigo-700 leading-relaxed uppercase tracking-wider">
                   Staff added will automatically receive access to the 'Ops Desk' to manage daily reservations.
                 </p>
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setShowTeamModal(false)} className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black uppercase text-xs">Cancel</button>
                <button type="submit" className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase text-xs shadow-xl shadow-indigo-100">Confirm Recruit</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Unit Modal (Combined Add/Edit + Availability Calendar) */}
      {showUnitModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-5xl rounded-[40px] shadow-2xl overflow-hidden border border-white flex flex-col lg:flex-row h-[85vh]">
            
            {/* Form Section */}
            <div className="flex-1 flex flex-col border-r border-slate-100">
              <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50 shrink-0">
                <h3 className="text-3xl font-black text-slate-900 tracking-tighter">
                  {editingUnit ? 'Refine Asset Strategy' : 'Architect New Asset'}
                </h3>
              </div>
              <form id="unitForm" onSubmit={handleSaveUnit} className="p-8 space-y-8 overflow-y-auto scrollbar-hide flex-1">
                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Unit Designation</label>
                    <input name="name" defaultValue={editingUnit?.name} required className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 font-bold text-slate-900 focus:outline-none focus:ring-4 ring-indigo-50" placeholder="Ex: Deluxe Sea View #204" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Asset Type</label>
                    <select name="type" defaultValue={editingUnit?.type || 'Room'} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 font-bold text-slate-900 focus:outline-none focus:ring-4 ring-indigo-50">
                      <option value="Room">Standard Room</option>
                      <option value="Suite">Premium Suite</option>
                      <option value="House">Residential Unit</option>
                      <option value="Villa">Private Villa</option>
                      <option value="Apartment">Service Apartment</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-8">
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pricing Strategy (IDR / Night)</label>
                      <input name="price" type="number" defaultValue={editingUnit?.price} required className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 font-bold text-slate-900 focus:outline-none" placeholder="1500000" />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Operational Capacity (Pax)</label>
                      <input name="capacity" type="number" defaultValue={editingUnit?.capacity} required className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 font-bold text-slate-900 focus:outline-none" placeholder="2" />
                   </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Amenities Matrix (Comma Separated)</label>
                  <input name="amenities" defaultValue={editingUnit?.amenities.join(', ')} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 font-bold text-slate-900 focus:outline-none" placeholder="WiFi, AC, Rooftop Access, Minibar" />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Technical Description</label>
                  <textarea name="description" defaultValue={editingUnit?.description} rows={3} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 font-bold text-slate-900 focus:outline-none resize-none" placeholder="Describe the layout and key features of this specific unit..." />
                </div>

                <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 flex items-center gap-4">
                   <i className="fas fa-camera text-slate-400 text-xl"></i>
                   <div className="flex-1">
                      <p className="text-[10px] font-black text-slate-900 uppercase tracking-tight">Gallery Protocol</p>
                      <p className="text-xs text-slate-400 font-medium">Marketplace standards require high-resolution visuals.</p>
                   </div>
                   <button type="button" className="px-5 py-2.5 bg-white border border-slate-200 text-indigo-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:border-indigo-600 transition-all">Upload</button>
                </div>
              </form>
              <div className="p-8 bg-slate-50/50 border-t border-slate-100 flex gap-4 shrink-0">
                <button type="button" onClick={() => { setShowUnitModal(false); setEditingUnit(null); }} className="flex-1 py-4 bg-white border border-slate-200 text-slate-600 rounded-2xl font-black uppercase text-xs tracking-widest">Abort</button>
                <button form="unitForm" type="submit" className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all">
                  {editingUnit ? 'Finalize Re-Strategy' : 'Deploy Asset'}
                </button>
              </div>
            </div>

            {/* Calendar Section */}
            <div className="w-full lg:w-[400px] bg-slate-50/30 p-8 flex flex-col space-y-8">
               <div className="flex justify-between items-center lg:hidden">
                  <h3 className="font-black text-slate-900">Availability</h3>
                  <button onClick={() => { setShowUnitModal(false); setEditingUnit(null); }} className="text-slate-400"><i className="fas fa-times"></i></button>
               </div>
               
               <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm">
                  {renderCalendar()}
               </div>

               <div className="p-6 bg-indigo-600 rounded-[32px] shadow-2xl text-white space-y-4">
                  <div className="flex items-center gap-3">
                     <i className="fas fa-shield-halved"></i>
                     <h4 className="font-black text-sm uppercase tracking-widest">Governance Rule</h4>
                  </div>
                  <p className="text-xs text-indigo-100 leading-relaxed font-medium">
                     Blocked dates will be instantly removed from the SEULANGA marketplace. Use this to handle maintenance, private bookings, or seasonal adjustments.
                  </p>
                  <div className="pt-2">
                     <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest bg-white/10 p-3 rounded-xl border border-white/10">
                        <span>Total Blocked</span>
                        <span className="bg-white text-indigo-600 px-2 py-0.5 rounded-md">{blockedDates.length} Days</span>
                     </div>
                  </div>
               </div>
               
               <div className="mt-auto text-center">
                  <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">Managed via SEULANGA Core</p>
               </div>
            </div>
          </div>
        </div>
      )}

      {/* Booking Detail Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-xl rounded-[40px] shadow-2xl p-10 space-y-8">
            <div className="flex justify-between items-center">
               <h3 className="text-3xl font-black text-slate-900">Stay Protocol</h3>
               <button onClick={() => setSelectedBooking(null)} className="text-slate-400 hover:text-indigo-600"><i className="fas fa-times text-xl"></i></button>
            </div>
            <div className="p-8 bg-slate-50 rounded-[32px] space-y-4">
               <p className="text-xs font-black text-indigo-600 uppercase tracking-[0.2em]">Reservation Identity</p>
               <h4 className="text-2xl font-black text-slate-900">Ref: {selectedBooking.id.toUpperCase()}</h4>
               <div className="flex items-center gap-6 py-4 border-y border-slate-200">
                  <div className="space-y-1">
                     <p className="text-[10px] font-black text-slate-400 uppercase">Check-in</p>
                     <p className="font-bold text-slate-700">{selectedBooking.checkIn}</p>
                  </div>
                  <i className="fas fa-long-arrow-right text-slate-300"></i>
                  <div className="space-y-1">
                     <p className="text-[10px] font-black text-slate-400 uppercase">Check-out</p>
                     <p className="font-bold text-slate-700">{selectedBooking.checkOut}</p>
                  </div>
               </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
               {selectedBooking.status === BookingStatus.PENDING && (
                 <>
                   <button onClick={() => handleUpdateBookingStatus(selectedBooking.id, BookingStatus.CONFIRMED)} className="py-4 bg-emerald-600 text-white rounded-2xl font-black uppercase text-xs shadow-xl shadow-emerald-100">Confirm Booking</button>
                   <button onClick={() => handleUpdateBookingStatus(selectedBooking.id, BookingStatus.CANCELLED)} className="py-4 bg-rose-500 text-white rounded-2xl font-black uppercase text-xs shadow-xl shadow-rose-100">Reject</button>
                 </>
               )}
               {selectedBooking.status === BookingStatus.CONFIRMED && (
                 <button onClick={() => handleUpdateBookingStatus(selectedBooking.id, BookingStatus.CHECKED_IN)} className="col-span-2 py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase text-xs shadow-xl shadow-indigo-100">Register Guest (Check-in)</button>
               )}
               {selectedBooking.status === BookingStatus.CHECKED_IN && (
                 <button onClick={() => handleUpdateBookingStatus(selectedBooking.id, BookingStatus.COMPLETED)} className="col-span-2 py-4 bg-slate-900 text-white rounded-2xl font-black uppercase text-xs shadow-xl shadow-slate-200">Finalize Stay (Check-out)</button>
               )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
