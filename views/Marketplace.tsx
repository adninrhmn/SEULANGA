
import React, { useState, useMemo } from 'react';
import { MOCK_BUSINESSES } from '../constants';
import { BusinessCategory, Business } from '../types';

interface MarketplaceProps {
  onSelectProperty: (property: Business) => void;
}

export const Marketplace: React.FC<MarketplaceProps> = ({ onSelectProperty }) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<BusinessCategory | 'All'>('All');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000000000]);

  const filteredProperties = useMemo(() => {
    return MOCK_BUSINESSES.filter(b => {
      const matchSearch = b.name.toLowerCase().includes(search.toLowerCase()) || 
                          b.address.toLowerCase().includes(search.toLowerCase());
      const matchCategory = selectedCategory === 'All' || b.category === selectedCategory;
      return matchSearch && matchCategory;
    });
  }, [search, selectedCategory]);

  return (
    <div className="flex flex-col lg:flex-row gap-10 animate-fade-up">
      {/* Search & Filter Sidebar */}
      <aside className="w-full lg:w-80 space-y-8">
        <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm space-y-8">
          <div>
            <h3 className="text-xl font-black text-slate-900 mb-6 tracking-tight">Refine Search</h3>
            <div className="relative">
              <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
              <input 
                type="text" 
                placeholder="Region or Property Name" 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 pl-11 pr-4 text-xs font-bold text-slate-700 outline-none focus:ring-4 ring-indigo-50"
              />
            </div>
          </div>

          <div className="space-y-4">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Property Type</p>
            <div className="space-y-2">
              <button 
                onClick={() => setSelectedCategory('All')}
                className={`w-full text-left px-5 py-3 rounded-xl text-xs font-bold transition-all ${selectedCategory === 'All' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-slate-500 hover:bg-slate-50'}`}
              >
                All Categories
              </button>
              {Object.values(BusinessCategory).map(cat => (
                <button 
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`w-full text-left px-5 py-3 rounded-xl text-xs font-bold transition-all ${selectedCategory === cat ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-slate-500 hover:bg-slate-50'}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4 pt-6 border-t border-slate-50">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Price Point</p>
            <div className="flex items-center gap-2">
               <input type="number" placeholder="Min" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-[10px] font-bold" />
               <span className="text-slate-300">-</span>
               <input type="number" placeholder="Max" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-[10px] font-bold" />
            </div>
          </div>
        </div>

        <div className="bg-slate-950 p-8 rounded-[40px] shadow-2xl text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 rounded-full blur-3xl -mr-16 -mt-16"></div>
          <h4 className="font-black text-lg mb-4 relative z-10">Map Discovery</h4>
          <p className="text-indigo-200 text-xs font-medium mb-6 leading-relaxed relative z-10">View available properties in your vicinity with high-precision GPS.</p>
          <button className="w-full py-4 bg-white text-slate-900 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all relative z-10">
            Activate Map View
          </button>
        </div>
      </aside>

      {/* Main Grid */}
      <div className="flex-1 space-y-10">
        <div className="flex items-center justify-between">
           <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Showing {filteredProperties.length} Premium Listings</p>
           <div className="flex items-center gap-4">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sort by:</span>
              <select className="bg-transparent font-black text-xs text-slate-900 outline-none cursor-pointer">
                 <option>Recommended</option>
                 <option>Price: Low to High</option>
                 <option>Highest Rated</option>
                 <option>Newest Access</option>
              </select>
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           {filteredProperties.map(b => (
             <div key={b.id} onClick={() => onSelectProperty(b)} className="group bg-white rounded-[40px] border border-slate-100 overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 cursor-pointer">
                <div className="h-64 relative overflow-hidden">
                   <img src={b.images[0]} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                   <div className="absolute top-6 left-6 flex gap-2">
                      <span className="bg-white/90 backdrop-blur-md px-4 py-1.5 rounded-full text-[10px] font-black text-indigo-600 uppercase tracking-widest shadow-sm">{b.category}</span>
                   </div>
                   <div className="absolute bottom-6 right-6 w-10 h-10 bg-white/90 backdrop-blur-md rounded-xl flex items-center justify-center text-slate-400 group-hover:text-rose-500 transition-colors shadow-lg">
                      <i className="far fa-heart"></i>
                   </div>
                </div>
                <div className="p-8 space-y-6">
                   <div className="flex justify-between items-start">
                      <div>
                         <h3 className="text-2xl font-black text-slate-900 mb-1 group-hover:text-indigo-600 transition-colors">{b.name}</h3>
                         <p className="text-xs font-bold text-slate-400 flex items-center gap-2">
                            <i className="fas fa-location-dot text-indigo-500"></i>
                            {b.address}
                         </p>
                      </div>
                      <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-600 px-3 py-1 rounded-xl font-black text-sm">
                         <i className="fas fa-star text-[10px]"></i> {b.rating}
                      </div>
                   </div>
                   <div className="flex flex-wrap gap-2">
                      {b.tags?.map(t => (
                        <span key={t} className="px-3 py-1 bg-slate-50 text-slate-500 rounded-lg text-[10px] font-bold uppercase tracking-wider">{t}</span>
                      ))}
                   </div>
                   <div className="pt-6 border-t border-slate-50 flex items-center justify-between">
                      <div className="flex flex-col">
                         <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Entry Price</span>
                         <span className="text-xl font-black text-slate-900">Rp 1.2M<span className="text-sm font-medium text-slate-400">/night</span></span>
                      </div>
                      <button className="px-8 py-3 bg-slate-950 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-600 transition-all">Book Experience</button>
                   </div>
                </div>
             </div>
           ))}
        </div>
      </div>
    </div>
  );
};
