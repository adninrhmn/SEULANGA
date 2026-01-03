
import React, { useState, useMemo } from 'react';
import { MOCK_BUSINESSES } from '../constants';
import { BusinessCategory, Business } from '../types';

interface LandingPageProps {
  onNavigate: (view: string) => void;
  onSelectProperty: (property: Business) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate, onSelectProperty }) => {
  const [activeCategory, setActiveCategory] = useState<BusinessCategory | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState('');

  // Function to filter businesses based on category and search
  const filteredBusinesses = useMemo(() => {
    return MOCK_BUSINESSES.filter((b) => {
      const matchesCategory = activeCategory === 'All' || b.category === activeCategory;
      const matchesSearch = b.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          b.address.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    }).slice(0, 6); // Limit to 6 for landing page aesthetics
  }, [activeCategory, searchQuery]);

  const handleCategoryClick = (cat: BusinessCategory) => {
    if (activeCategory === cat) setActiveCategory('All');
    else setActiveCategory(cat);
  };

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onNavigate('explore');
  };

  return (
    <div className="space-y-24 pb-20">
      {/* Hero Section */}
      <section className="relative rounded-[40px] overflow-hidden shadow-2xl h-[640px]">
        <img 
          src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=2070&auto=format&fit=crop" 
          className="absolute inset-0 w-full h-full object-cover scale-105" 
          alt="Luxury Resort"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/40 via-slate-900/20 to-slate-950/80"></div>
        <div className="absolute inset-0 flex flex-col justify-center items-center text-center px-6">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20 text-white text-xs font-bold uppercase tracking-widest mb-8">
            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
            Now Live in Northern Sumatra
          </div>
          <h1 className="text-5xl md:text-8xl font-black text-white mb-8 tracking-tighter leading-[0.9]">
            REDEFINING <br/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-indigo-500">HOSPITALITY.</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-200 mb-12 max-w-2xl font-medium leading-relaxed">
            The elite multi-tenant ecosystem for premium property management and unforgettable guest experiences.
          </p>
          
          {/* Advanced Search Bar */}
          <form onSubmit={handleHeroSearch} className="w-full max-w-4xl bg-white/90 backdrop-blur-2xl p-3 rounded-3xl shadow-2xl flex flex-col md:flex-row items-center gap-2 border border-white">
            <div className="flex-1 flex items-center px-5 py-4 gap-4 border-b md:border-b-0 md:border-r border-slate-200">
              <i className="fas fa-location-dot text-indigo-600"></i>
              <div className="text-left">
                <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Location</p>
                <input 
                  type="text" 
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Where are you going?" 
                  className="bg-transparent border-none focus:outline-none text-sm font-bold text-slate-800 w-full" 
                />
              </div>
            </div>
            <div className="flex-1 flex items-center px-5 py-4 gap-4 border-b md:border-b-0 md:border-r border-slate-200">
              <i className="fas fa-calendar text-indigo-600"></i>
              <div className="text-left">
                <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Dates</p>
                <input type="text" placeholder="Add dates" className="bg-transparent border-none focus:outline-none text-sm font-bold text-slate-800 w-full" />
              </div>
            </div>
            <div className="flex-1 flex items-center px-5 py-4 gap-4">
              <i className="fas fa-user-group text-indigo-600"></i>
              <div className="text-left">
                <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Guests</p>
                <input type="text" placeholder="Add guests" className="bg-transparent border-none focus:outline-none text-sm font-bold text-slate-800 w-full" />
              </div>
            </div>
            <button type="submit" className="w-full md:w-auto bg-indigo-600 hover:bg-indigo-700 text-white px-10 py-5 rounded-2xl font-bold transition-all flex items-center justify-center gap-3 shadow-lg shadow-indigo-200">
              <i className="fas fa-magnifying-glass"></i>
              <span>Search</span>
            </button>
          </form>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="px-4">
        <div className="flex items-center justify-center gap-4 mb-16 overflow-x-auto pb-4 scrollbar-hide">
          <button 
            onClick={() => setActiveCategory('All')}
            className={`group shrink-0 flex flex-col items-center px-8 py-6 rounded-[32px] border transition-all duration-300 ${activeCategory === 'All' ? 'bg-indigo-600 text-white border-indigo-600 shadow-xl' : 'bg-white border-slate-100 hover:border-indigo-100 text-slate-700'}`}
          >
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition-all ${activeCategory === 'All' ? 'bg-white/20 text-white' : 'bg-slate-50 text-slate-400'}`}>
              <i className="fas fa-border-all text-2xl"></i>
            </div>
            <span className="text-sm font-bold whitespace-nowrap">All Collections</span>
          </button>
          {Object.values(BusinessCategory).map((cat) => (
            <button 
              key={cat} 
              onClick={() => handleCategoryClick(cat)}
              className={`group shrink-0 flex flex-col items-center px-8 py-6 rounded-[32px] border transition-all duration-300 ${activeCategory === cat ? 'bg-indigo-600 text-white border-indigo-600 shadow-xl' : 'bg-white border-slate-100 hover:border-indigo-100 text-slate-700'}`}
            >
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition-all ${activeCategory === cat ? 'bg-white/20 text-white' : 'bg-slate-50 text-slate-400'}`}>
                <i className={`fas ${
                  cat === BusinessCategory.HOTEL ? 'fa-building' : 
                  cat === BusinessCategory.HOMESTAY ? 'fa-house-chimney' :
                  cat === BusinessCategory.KOST ? 'fa-bed' :
                  cat === BusinessCategory.RENTAL ? 'fa-key' :
                  cat === BusinessCategory.SALES ? 'fa-city' :
                  'fa-house-flag'
                } text-2xl`}></i>
              </div>
              <span className="text-sm font-bold whitespace-nowrap">{cat}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Feature Section */}
      <section>
        <div className="flex flex-col md:flex-row items-end justify-between mb-12 px-4">
          <div className="max-w-xl">
            <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">Curated Collections<span className="text-indigo-600">.</span></h2>
            <p className="text-slate-500 font-medium">Hand-picked premium listings with verified standards and AI-assisted descriptions.</p>
          </div>
          <button onClick={() => onNavigate('explore')} className="mt-6 md:mt-0 px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-2xl transition-all flex items-center gap-3">
            Explore All 
            <i className="fas fa-arrow-right text-xs"></i>
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 px-4">
          {filteredBusinesses.map((b) => (
            <div key={b.id} onClick={() => onSelectProperty(b)} className="group cursor-pointer flex flex-col bg-white rounded-[32px] overflow-hidden border border-slate-100 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 shadow-sm">
              <div className="relative h-80 overflow-hidden">
                <img src={b.images[0]} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt={b.name} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="absolute top-6 left-6 flex gap-2">
                  <div className="bg-white/90 backdrop-blur px-4 py-1.5 rounded-full text-[10px] font-black text-indigo-600 uppercase tracking-widest shadow-sm">
                    {b.category}
                  </div>
                  {b.subscription === 'Premium' && (
                    <div className="bg-indigo-600 px-4 py-1.5 rounded-full text-[10px] font-black text-white uppercase tracking-widest shadow-sm">
                      Diamond
                    </div>
                  )}
                </div>
                <button 
                  onClick={(e) => { e.stopPropagation(); }} 
                  className="absolute top-6 right-6 w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md hover:bg-white text-white hover:text-rose-500 transition-all shadow-lg flex items-center justify-center"
                >
                  <i className="far fa-heart text-xl"></i>
                </button>
                <div className="absolute bottom-6 left-6 right-6 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                   <button className="w-full bg-white text-slate-900 py-4 rounded-2xl font-bold text-sm shadow-xl hover:bg-indigo-600 hover:text-white transition-colors">
                     Quick Preview
                   </button>
                </div>
              </div>
              <div className="p-8">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-extrabold text-2xl text-slate-900 mb-1 group-hover:text-indigo-600 transition-colors">{b.name}</h3>
                    <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-wide">
                      <i className="fas fa-map-marker-alt text-indigo-600"></i>
                      {b.address.split(',')[1] || b.address}
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-600 px-3 py-1 rounded-lg font-black text-sm">
                      <i className="fas fa-star text-xs"></i> {b.rating}
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 mt-1">Verified Stay</span>
                  </div>
                </div>
                <p className="text-slate-500 text-sm mb-8 line-clamp-2 leading-relaxed font-medium">{b.description}</p>
                <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                   <div className="flex flex-col">
                     <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Starts from</span>
                     <span className="text-xl font-black text-slate-900">Rp 1.500K<span className="text-sm font-medium text-slate-400">/night</span></span>
                   </div>
                   <button className="w-12 h-12 rounded-2xl bg-slate-950 text-white flex items-center justify-center hover:bg-indigo-600 transition-all">
                     <i className="fas fa-chevron-right"></i>
                   </button>
                </div>
              </div>
            </div>
          ))}
          {filteredBusinesses.length === 0 && (
            <div className="col-span-full py-20 text-center">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-200">
                <i className="fas fa-search text-3xl"></i>
              </div>
              <p className="text-slate-400 font-bold uppercase tracking-widest">No properties found matching your selection</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
