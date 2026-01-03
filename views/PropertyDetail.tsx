
import React, { useState } from 'react';
import { Business, Unit } from '../types';
import { MOCK_UNITS } from '../constants';

interface PropertyDetailProps {
  property: Business;
  onBack: () => void;
}

export const PropertyDetail: React.FC<PropertyDetailProps> = ({ property, onBack }) => {
  const [selectedUnit, setSelectedUnit] = useState<Unit>(MOCK_UNITS.filter(u => u.businessId === property.id)[0]);
  const [isBookingSuccess, setIsBookingSuccess] = useState(false);

  const handleBook = () => {
    setIsBookingSuccess(true);
    setTimeout(() => setIsBookingSuccess(false), 3000);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-12 animate-fade-up pb-20">
      <button onClick={onBack} className="flex items-center gap-3 text-slate-400 hover:text-indigo-600 font-black uppercase tracking-widest text-[10px] transition-colors">
        <i className="fas fa-arrow-left"></i> Back to Marketplace
      </button>

      {/* Hero Gallery */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[500px]">
        <div className="md:col-span-2 rounded-[40px] overflow-hidden shadow-2xl relative">
          <img src={property.images[0]} className="w-full h-full object-cover" />
          <div className="absolute top-8 left-8 flex gap-3">
             <span className="bg-white/90 backdrop-blur-md px-5 py-2 rounded-full text-[10px] font-black text-indigo-600 uppercase tracking-widest shadow-lg">{property.category}</span>
             <span className="bg-indigo-600 px-5 py-2 rounded-full text-[10px] font-black text-white uppercase tracking-widest shadow-lg">Verified Luxury</span>
          </div>
        </div>
        <div className="grid grid-rows-2 gap-4">
          <div className="rounded-[40px] overflow-hidden shadow-xl">
             <img src={property.images[1] || property.images[0]} className="w-full h-full object-cover" />
          </div>
          <div className="rounded-[40px] overflow-hidden shadow-xl relative group cursor-pointer">
             <img src={property.images[0]} className="w-full h-full object-cover" />
             <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-white font-black uppercase tracking-[0.2em] text-xs">View 12+ Photos</span>
             </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-12">
        {/* Info Column */}
        <div className="lg:col-span-2 space-y-12">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-5xl font-black text-slate-900 tracking-tighter mb-4">{property.name}</h1>
              <p className="flex items-center gap-3 text-slate-500 font-medium">
                <i className="fas fa-location-dot text-indigo-500"></i>
                {property.address}
              </p>
            </div>
            <div className="flex items-center gap-2 bg-emerald-50 text-emerald-600 px-5 py-2.5 rounded-2xl font-black text-lg border border-emerald-100">
              <i className="fas fa-star"></i> {property.rating}
            </div>
          </div>

          <div className="p-8 bg-white rounded-[40px] border border-slate-100 shadow-sm space-y-6">
            <h3 className="text-xl font-black text-slate-900 tracking-tight">Narrative Experience</h3>
            <p className="text-slate-600 leading-relaxed font-medium">
              {property.description}
            </p>
          </div>

          <div className="space-y-6">
             <h3 className="text-xl font-black text-slate-900 tracking-tight">Ecosystem Amenities</h3>
             <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {['WiFi', 'Free Parking', 'Airport Transfer', 'AC', 'Infinity Pool', 'Gym Access', 'Smart TV', '24/7 Support'].map(a => (
                  <div key={a} className="p-5 bg-white border border-slate-100 rounded-3xl flex flex-col gap-3 group hover:border-indigo-600 transition-all">
                    <i className="fas fa-check-circle text-indigo-400 group-hover:text-indigo-600"></i>
                    <span className="text-[10px] font-black uppercase text-slate-500 group-hover:text-slate-900">{a}</span>
                  </div>
                ))}
             </div>
          </div>
        </div>

        {/* Booking Widget */}
        <div className="space-y-8">
           <div className="bg-white p-10 rounded-[48px] border border-slate-100 shadow-2xl space-y-8 sticky top-32">
              <div className="flex items-end gap-2 mb-6">
                 <span className="text-4xl font-black text-slate-900 tracking-tighter">Rp {selectedUnit.price.toLocaleString()}</span>
                 <span className="text-sm font-bold text-slate-400 mb-2">/ night</span>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 bg-slate-50 rounded-3xl overflow-hidden border border-slate-100">
                  <div className="p-4 border-r border-slate-200">
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Check-In</p>
                    <p className="text-sm font-black text-slate-800">24 Dec 2024</p>
                  </div>
                  <div className="p-4">
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Check-Out</p>
                    <p className="text-sm font-black text-slate-800">26 Dec 2024</p>
                  </div>
                </div>
                
                <div className="p-4 bg-slate-50 rounded-3xl border border-slate-100">
                   <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Room / Unit Type</p>
                   <select 
                    value={selectedUnit.id}
                    onChange={(e) => setSelectedUnit(MOCK_UNITS.find(u => u.id === e.target.value)!)}
                    className="w-full bg-transparent font-black text-sm text-slate-800 outline-none"
                   >
                     {MOCK_UNITS.filter(u => u.businessId === property.id).map(u => (
                       <option key={u.id} value={u.id}>{u.name} (Max {u.capacity})</option>
                     ))}
                   </select>
                </div>
              </div>

              <div className="space-y-4 py-6 border-t border-slate-50">
                <div className="flex justify-between text-sm font-bold text-slate-500">
                   <span>2 Nights x Rp {selectedUnit.price.toLocaleString()}</span>
                   <span>Rp {(selectedUnit.price * 2).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-slate-500">
                   <span>Platform Service Fee</span>
                   <span>Rp 25.000</span>
                </div>
                <div className="flex justify-between text-xl font-black text-slate-900 pt-4 border-t border-slate-50">
                   <span>Total</span>
                   <span className="text-indigo-600">Rp {(selectedUnit.price * 2 + 25000).toLocaleString()}</span>
                </div>
              </div>

              <button 
                onClick={handleBook}
                className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl shadow-indigo-100 hover:scale-[1.02] active:scale-95 transition-all"
              >
                {isBookingSuccess ? 'Success! Redirecting...' : 'Initiate Booking'}
              </button>
              
              <p className="text-center text-[10px] font-bold text-slate-400">You won't be charged yet</p>
           </div>

           <div className="bg-slate-950 p-8 rounded-[40px] shadow-2xl text-white space-y-6">
              <h4 className="font-black text-lg tracking-tight">House Protocol</h4>
              <div className="space-y-4">
                 <div className="flex items-center gap-4 text-xs font-medium">
                    <i className="fas fa-clock text-indigo-400"></i>
                    Check-in: 14:00 - 20:00
                 </div>
                 <div className="flex items-center gap-4 text-xs font-medium">
                    <i className="fas fa-ban text-rose-400"></i>
                    No smoking in rooms
                 </div>
                 <div className="flex items-center gap-4 text-xs font-medium">
                    <i className="fas fa-paw text-emerald-400"></i>
                    Pets allowed (Premium only)
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};
