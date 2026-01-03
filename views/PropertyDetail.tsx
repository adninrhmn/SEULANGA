
import React, { useState, useEffect } from 'react';
import { Business, Unit, User } from '../types';
import { MOCK_UNITS } from '../constants';

interface PropertyDetailProps {
  property: Business;
  onBack: () => void;
  currentUser: User | null;
  onLoginRequired: () => void;
}

export const PropertyDetail: React.FC<PropertyDetailProps> = ({ property, onBack, currentUser, onLoginRequired }) => {
  const propertyUnits = MOCK_UNITS.filter(u => u.businessId === property.id);
  const [selectedUnit, setSelectedUnit] = useState<Unit>(propertyUnits[0] || MOCK_UNITS[0]);
  const [isBookingSuccess, setIsBookingSuccess] = useState(false);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const [showAuthAlert, setShowAuthAlert] = useState(false);

  const handleBook = () => {
    if (!currentUser) {
      setShowAuthAlert(true);
      return;
    }
    setIsBookingSuccess(true);
    setTimeout(() => setIsBookingSuccess(false), 3000);
  };

  const nextPhoto = () => {
    setActivePhotoIndex((prev) => (prev + 1) % property.images.length);
  };

  const prevPhoto = () => {
    setActivePhotoIndex((prev) => (prev - 1 + property.images.length) % property.images.length);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isGalleryOpen) return;
      if (e.key === 'ArrowRight') nextPhoto();
      if (e.key === 'ArrowLeft') prevPhoto();
      if (e.key === 'Escape') setIsGalleryOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isGalleryOpen]);

  return (
    <div className="max-w-6xl mx-auto space-y-12 animate-fade-up pb-20">
      <button onClick={onBack} className="flex items-center gap-3 text-slate-400 hover:text-indigo-600 font-black uppercase tracking-widest text-[10px] transition-colors">
        <i className="fas fa-arrow-left"></i> Back to Marketplace
      </button>

      {/* Hero Gallery */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[500px]">
        <div 
          onClick={() => { setActivePhotoIndex(0); setIsGalleryOpen(true); }}
          className="md:col-span-2 rounded-[40px] overflow-hidden shadow-2xl relative cursor-pointer group"
        >
          <img src={property.images[0]} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="Main property" />
          <div className="absolute top-8 left-8 flex gap-3">
             <span className="bg-white/90 backdrop-blur-md px-5 py-2 rounded-full text-[10px] font-black text-indigo-600 uppercase tracking-widest shadow-lg">{property.category}</span>
             <span className="bg-indigo-600 px-5 py-2 rounded-full text-[10px] font-black text-white uppercase tracking-widest shadow-lg">Verified Luxury</span>
          </div>
          <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
             <i className="fas fa-expand text-white text-3xl"></i>
          </div>
        </div>
        <div className="grid grid-rows-2 gap-4">
          <div 
            onClick={() => { setActivePhotoIndex(1); setIsGalleryOpen(true); }}
            className="rounded-[40px] overflow-hidden shadow-xl cursor-pointer group relative"
          >
             <img src={property.images[1] || property.images[0]} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="Gallery image 1" />
             <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <i className="fas fa-expand text-white text-2xl"></i>
             </div>
          </div>
          <div 
            onClick={() => { setActivePhotoIndex(0); setIsGalleryOpen(true); }}
            className="rounded-[40px] overflow-hidden shadow-xl relative group cursor-pointer"
          >
             <img src={property.images[0]} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="Gallery image 2" />
             <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center transition-all group-hover:bg-slate-950/20">
                <span className="text-white font-black uppercase tracking-[0.2em] text-xs">View {property.images.length}+ Photos</span>
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
                    onChange={(e) => {
                      const unit = propertyUnits.find(u => u.id === e.target.value);
                      if (unit) setSelectedUnit(unit);
                    }}
                    className="w-full bg-transparent font-black text-sm text-slate-800 outline-none"
                   >
                     {propertyUnits.map(u => (
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
                className={`w-full py-5 text-white rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl transition-all ${
                  isBookingSuccess ? 'bg-emerald-600' : 'bg-indigo-600 hover:scale-[1.02] shadow-indigo-100'
                }`}
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

      {/* Auth Requirement Alert Modal */}
      {showAuthAlert && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300">
           <div className="bg-white w-full max-w-md rounded-[40px] shadow-2xl p-10 text-center space-y-8 border border-slate-100">
              <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-3xl flex items-center justify-center mx-auto text-3xl">
                 <i className="fas fa-user-lock"></i>
              </div>
              <div>
                 <h3 className="text-2xl font-black text-slate-900 tracking-tighter uppercase mb-2">Login Required</h3>
                 <p className="text-slate-500 font-medium">Silakan login sebagai tamu terlebih dahulu untuk melakukan pemesanan properti.</p>
              </div>
              <div className="flex flex-col gap-3">
                 <button 
                   onClick={onLoginRequired}
                   className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-indigo-100"
                 >
                   Login Sekarang
                 </button>
                 <button 
                   onClick={() => setShowAuthAlert(false)}
                   className="w-full py-4 bg-slate-100 text-slate-600 rounded-2xl font-black uppercase text-xs tracking-widest"
                 >
                   Kembali
                 </button>
              </div>
           </div>
        </div>
      )}

      {/* Photo Gallery Modal */}
      {isGalleryOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/95 backdrop-blur-xl animate-in fade-in duration-300">
           {/* Close Button */}
           <button 
             onClick={() => setIsGalleryOpen(false)}
             className="absolute top-10 right-10 w-14 h-14 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white text-2xl transition-all z-[110]"
           >
             <i className="fas fa-times"></i>
           </button>

           {/* Navigation Controls */}
           <button 
             onClick={(e) => { e.stopPropagation(); prevPhoto(); }}
             className="absolute left-10 top-1/2 -translate-y-1/2 w-16 h-16 bg-white/10 hover:bg-white/20 rounded-2xl flex items-center justify-center text-white text-3xl transition-all group z-[110]"
           >
             <i className="fas fa-chevron-left group-hover:-translate-x-1 transition-transform"></i>
           </button>
           <button 
             onClick={(e) => { e.stopPropagation(); nextPhoto(); }}
             className="absolute right-10 top-1/2 -translate-y-1/2 w-16 h-16 bg-white/10 hover:bg-white/20 rounded-2xl flex items-center justify-center text-white text-3xl transition-all group z-[110]"
           >
             <i className="fas fa-chevron-right group-hover:translate-x-1 transition-transform"></i>
           </button>

           {/* Image Container */}
           <div className="relative w-full max-w-7xl h-[80vh] flex flex-col items-center justify-center p-6">
              <div className="w-full h-full relative overflow-hidden rounded-[40px] shadow-2xl">
                 <img 
                   src={property.images[activePhotoIndex]} 
                   className="w-full h-full object-contain select-none transition-all duration-500" 
                   alt={`Gallery view ${activePhotoIndex + 1}`} 
                 />
              </div>

              {/* Thumbnails / Progress */}
              <div className="mt-10 flex gap-4 overflow-x-auto scrollbar-hide p-4 max-w-full">
                 {property.images.map((img, i) => (
                   <button 
                     key={i} 
                     onClick={() => setActivePhotoIndex(i)}
                     className={`w-24 h-16 rounded-xl overflow-hidden shrink-0 transition-all border-2 ${
                       activePhotoIndex === i ? 'border-indigo-500 scale-110 shadow-lg shadow-indigo-500/20' : 'border-transparent opacity-50 hover:opacity-100'
                     }`}
                   >
                     <img src={img} className="w-full h-full object-cover" alt={`Thumbnail ${i + 1}`} />
                   </button>
                 ))}
              </div>

              <div className="absolute bottom-[-60px] text-white/50 font-black tracking-widest text-[10px] uppercase">
                 Asset {activePhotoIndex + 1} of {property.images.length} • {property.name}
              </div>
           </div>
        </div>
      )}
    </div>
  );
};
