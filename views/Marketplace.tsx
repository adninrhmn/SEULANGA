
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
  const [sortBy, setSortBy] = useState('Recommended');

  const filteredProperties = useMemo(() => {
    return MOCK_BUSINESSES.filter(b => {
      const matchSearch = b.name.toLowerCase().includes(search.toLowerCase()) || 
                          b.address.toLowerCase().includes(search.toLowerCase()) ||
                          b.tags?.some(t => t.toLowerCase().includes(search.toLowerCase()));
      const matchCategory = selectedCategory === 'All' || b.category === selectedCategory;
      return matchSearch && matchCategory;
    });
  }, [search, selectedCategory]);

  return (
    <div className="flex flex-col lg:flex-row gap-12 animate-fade-up">
      {/* Refined Discovery Sidebar */}
      <aside className="w-full lg:w-96 space-y-8 shrink-0">
        <div className="bg-white p-10 rounded-[48px] border border-slate-100 shadow-sm space-y-10 sticky top-24">
          <div>
            <div className="flex items-center gap-3 mb-8">
               <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center border border-indigo-100">
                  <i className="fas fa-sliders"></i>
               </div>
               <h3 className="text-2xl font-black text-slate-900 tracking-tighter">Discovery Filter</h3>
            </div>
            
            <div className="relative mb-10">
              <i className="fas fa-search absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
              <input 
                type="text" 
                placeholder="Region, Property, or Keywords..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 pl-14 pr-6 text-sm font-bold text-slate-700 outline-none focus:ring-4 ring-indigo-50 transition-all"
              />
            </div>
          </div>

          <div className="space-y-6">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Asset Topology</p>
            <div className="grid grid-cols-1 gap-2">
              <button 
                onClick={() => setSelectedCategory('All')}
                className={`w-full flex items-center justify-between px-6 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${selectedCategory === 'All' ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100' : 'text-slate-500 hover:bg-slate-50'}`}
              >
                <span>Universal Feed</span>
                {selectedCategory === 'All' && <i className="fas fa-check-circle"></i>}
              </button>
              {Object.values(BusinessCategory).map(cat => (
                <button 
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`w-full flex items-center justify-between px-6 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${selectedCategory === cat ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100' : 'text-slate-500 hover:bg-slate-50'}`}
                >
                  <span>{cat}</span>
                  {selectedCategory === cat && <i className="fas fa-check-circle"></i>}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-6 pt-10 border-t border-slate-50">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Economic Range</p>
            <div className="space-y-4">
               <div className="flex items-center gap-3">
                  <div className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl p-4">
                     <p className="text-[8px] font-black text-slate-400 uppercase mb-1">Floor</p>
                     <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-300">Rp</span>
                        <input type="number" placeholder="0" className="bg-transparent border-none outline-none w-full text-xs font-black text-slate-800" />
                     </div>
                  </div>
                  <div className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl p-4">
                     <p className="text-[8px] font-black text-slate-400 uppercase mb-1">Ceiling</p>
                     <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-300">Rp</span>
                        <input type="number" placeholder="99M" className="bg-transparent border-none outline-none w-full text-xs font-black text-slate-800" />
                     </div>
                  </div>
               </div>
               <button className="w-full py-4 bg-slate-950 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-xl">Apply Parameters</button>
            </div>
          </div>
        </div>

        <div className="bg-slate-900 p-10 rounded-[48px] shadow-2xl text-white relative overflow-hidden group">
          <div className="absolute inset-0 bg-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="relative z-10 flex flex-col h-full justify-between min-h-[300px]">
            <div>
               <div className="w-16 h-16 bg-white/10 rounded-3xl flex items-center justify-center border border-white/20 mb-10 shadow-inner group-hover:bg-white/20 transition-all">
                  <i className="fas fa-map-location-dot text-indigo-400 group-hover:text-white text-3xl"></i>
               </div>
               <h4 className="font-black text-3xl tracking-tighter mb-4 leading-tight">Geospatial Explorer</h4>
               <p className="text-indigo-200/60 group-hover:text-indigo-50 font-medium text-sm leading-relaxed mb-8">Synchronize with your current location to discover elite stays within a 10km radius.</p>
            </div>
            <button className="w-full py-5 bg-white text-slate-900 rounded-[24px] font-black text-[10px] uppercase tracking-widest hover:scale-[1.05] transition-transform shadow-2xl">
              Activate Map Node
            </button>
          </div>
        </div>
      </aside>

      {/* Main Exploration Grid */}
      <div className="flex-1 space-y-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-4">
           <div>
              <p className="text-slate-400 font-black uppercase tracking-[0.3em] text-[10px] mb-1">Global Marketplace Feed</p>
              <h2 className="text-3xl font-black text-slate-900 tracking-tighter">Verified Property Assets<span className="text-indigo-600">.</span></h2>
           </div>
           <div className="flex items-center gap-6 bg-white px-6 py-3 rounded-2xl border border-slate-100 shadow-sm">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Topology Sort:</span>
              <select 
               value={sortBy}
               onChange={(e) => setSortBy(e.target.value)}
               className="bg-transparent font-black text-xs text-indigo-600 outline-none cursor-pointer"
              >
                 <option>Recommended</option>
                 <option>Value: Low to High</option>
                 <option>Trust Rating</option>
                 <option>Registry Date</option>
              </select>
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 px-4">
           {filteredProperties.map(b => (
             <div key={b.id} onClick={() => onSelectProperty(b)} className="group bg-white rounded-[48px] border border-slate-100 overflow-hidden hover:shadow-2xl hover:-translate-y-2 transition-all duration-700 cursor-pointer flex flex-col shadow-sm">
                <div className="h-80 relative overflow-hidden shadow-inner">
                   <img src={b.images[0]} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
                   <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                   <div className="absolute top-8 left-8 flex gap-3">
                      <span className="bg-white/95 backdrop-blur-md px-5 py-2 rounded-full text-[9px] font-black text-indigo-600 uppercase tracking-[0.2em] border border-white shadow-xl">{b.category}</span>
                   </div>
                   <div className="absolute top-8 right-8 w-12 h-12 bg-white/40 backdrop-blur-md hover:bg-white text-white hover:text-rose-500 rounded-2xl flex items-center justify-center transition-all shadow-xl">
                      <i className="far fa-heart text-xl"></i>
                   </div>
                   <div className="absolute bottom-8 left-8 right-8 translate-y-6 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                      <div className="bg-white/95 backdrop-blur-md p-4 rounded-2xl flex items-center justify-between border border-white shadow-2xl">
                         <div className="flex flex-col">
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Entry Price</span>
                            <span className="text-lg font-black text-slate-900">Rp 1.5M<span className="text-xs font-medium text-slate-400">/nt</span></span>
                         </div>
                         <button className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg">Verify Dates</button>
                      </div>
                   </div>
                </div>
                <div className="p-10 space-y-8 flex-1 flex flex-col justify-between">
                   <div className="space-y-4">
                      <div className="flex justify-between items-start">
                         <div>
                            <h3 className="text-3xl font-black text-slate-900 mb-1 tracking-tighter group-hover:text-indigo-600 transition-colors">{b.name}</h3>
                            <p className="text-xs font-bold text-slate-400 flex items-center gap-2">
                               <i className="fas fa-location-dot text-indigo-400"></i>
                               {b.address}
                            </p>
                         </div>
                         <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-600 px-4 py-2 rounded-xl font-black text-sm border border-emerald-100">
                            <i className="fas fa-star text-xs"></i> {b.rating}
                         </div>
                      </div>
                      <div className="flex flex-wrap gap-2 pt-2">
                         {b.tags?.map(t => (
                           <span key={t} className="px-4 py-1.5 bg-slate-50 text-slate-500 rounded-xl text-[9px] font-black uppercase tracking-wider border border-slate-100">{t}</span>
                         ))}
                      </div>
                   </div>
                   <div className="pt-8 border-t border-slate-50 flex items-center justify-between group-hover:border-indigo-100 transition-colors">
                      <div className="flex -space-x-3">
                        {[1, 2, 3].map(i => (
                          <div key={i} className="w-10 h-10 rounded-full border-4 border-white overflow-hidden bg-slate-100 shadow-sm">
                            <img src={`https://i.pravatar.cc/100?u=g${i}`} className="w-full h-full object-cover" />
                          </div>
                        ))}
                        <div className="w-10 h-10 rounded-full border-4 border-white bg-indigo-600 flex items-center justify-center text-[10px] font-black text-white shadow-sm">+12</div>
                      </div>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Inquired by 1.2K+ Users</span>
                   </div>
                </div>
             </div>
           ))}
        </div>
      </div>
    </div>
  );
};
