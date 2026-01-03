
import React, { useState, useEffect } from 'react';
import { UserRole, BusinessCategory, BusinessStatus } from '../types';

interface AuthProps {
  onLogin: (role: UserRole, email: string) => void;
  onNavigateLanding: () => void;
}

type AuthMode = 'login' | 'register' | 'forgot-password';
type RegistrationType = 'guest' | 'owner';

export const Auth: React.FC<AuthProps> = ({ onLogin, onNavigateLanding }) => {
  const [mode, setMode] = useState<AuthMode>('login');
  const [regType, setRegType] = useState<RegistrationType>('guest');
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Form States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [businessCategory, setBusinessCategory] = useState<BusinessCategory>(BusinessCategory.HOTEL);

  const handleAuthAction = async (e: React.FormEvent) => {
    e.preventDefault();
    await executeLogin(email);
  };

  const executeLogin = async (targetEmail: string) => {
    setIsLoading(true);
    // Simulate API Latency
    await new Promise(res => setTimeout(res, 1000));
    
    // Mock role detection logic based on email for demo
    let role = UserRole.GUEST;
    const lowerEmail = targetEmail.toLowerCase();
    
    if (lowerEmail.includes('admin')) role = UserRole.SUPER_ADMIN;
    else if (lowerEmail.includes('owner') || lowerEmail.includes('john')) role = UserRole.BUSINESS_OWNER;
    else if (lowerEmail.includes('staff') || lowerEmail.includes('sarah')) role = UserRole.ADMIN_STAFF;
    
    onLogin(role, targetEmail);
    setIsLoading(false);
  };

  const renderLogin = () => (
    <div className="space-y-6 animate-fade-up">
      <form onSubmit={handleAuthAction} className="space-y-6">
        <div className="space-y-4">
          <div className="relative group">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Identity Node (Email)</label>
            <div className="relative">
              <i className="fas fa-at absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 transition-colors"></i>
              <input 
                required
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="operator@seulanga.com" 
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 pl-14 pr-6 text-sm font-bold text-slate-700 focus:ring-4 ring-indigo-50 outline-none transition-all"
              />
            </div>
          </div>
          <div className="relative group">
            <div className="flex justify-between items-center mb-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 block">Security Key</label>
              <button type="button" onClick={() => setMode('forgot-password')} className="text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:underline">Lost Access?</button>
            </div>
            <div className="relative">
              <i className="fas fa-lock absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 transition-colors"></i>
              <input 
                required
                type={showPassword ? "text" : "password"} 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••" 
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 pl-14 pr-14 text-sm font-bold text-slate-700 focus:ring-4 ring-indigo-50 outline-none transition-all"
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600"
              >
                <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
           <input type="checkbox" id="remember" className="w-5 h-5 rounded-lg border-slate-200 text-indigo-600 focus:ring-indigo-50" />
           <label htmlFor="remember" className="text-xs font-bold text-slate-500 cursor-pointer">Stay Persisted on this Node</label>
        </div>

        <button 
          type="submit"
          disabled={isLoading}
          className="w-full py-5 bg-slate-950 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-2xl hover:bg-indigo-600 transition-all flex items-center justify-center gap-3"
        >
          {isLoading ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-fingerprint"></i>}
          {isLoading ? 'Decrypting...' : 'Initiate Session'}
        </button>
      </form>

      {/* Developer Quick Access Node */}
      <div className="mt-8 p-6 bg-indigo-50/50 border border-indigo-100 rounded-[32px] space-y-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white text-[10px]">
            <i className="fas fa-code"></i>
          </div>
          <p className="text-[10px] font-black text-indigo-900 uppercase tracking-widest">Developer Access Node</p>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <button 
            onClick={() => executeLogin('admin@seulanga.com')}
            className="py-3 bg-indigo-600 text-white rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all"
          >
            Super Admin Access
          </button>
          <button 
            onClick={() => executeLogin('owner@hotel.com')}
            className="py-3 bg-white border border-indigo-200 text-indigo-600 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-indigo-50 transition-all"
          >
            Business Owner
          </button>
          <button 
            onClick={() => executeLogin('staff@hotel.com')}
            className="py-3 bg-white border border-indigo-200 text-indigo-600 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-indigo-50 transition-all"
          >
            Ops Staff Desk
          </button>
          <button 
            onClick={() => executeLogin('alice@guest.com')}
            className="py-3 bg-white border border-indigo-200 text-indigo-600 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-indigo-50 transition-all"
          >
            Guest Portal
          </button>
        </div>
      </div>

      <div className="text-center pt-2">
        <p className="text-xs font-bold text-slate-400">
          New to the Ecosystem? 
          <button type="button" onClick={() => setMode('register')} className="ml-2 text-indigo-600 font-black uppercase tracking-widest hover:underline">Enroll Now</button>
        </p>
      </div>
    </div>
  );

  const renderRegister = () => (
    <div className="space-y-8 animate-fade-up">
       {/* Type Selector */}
       <div className="flex bg-slate-100 p-1.5 rounded-2xl gap-1">
          <button 
            onClick={() => { setRegType('guest'); setStep(1); }}
            className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${regType === 'guest' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}
          >
            Individual Guest
          </button>
          <button 
            onClick={() => { setRegType('owner'); setStep(1); }}
            className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${regType === 'owner' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}
          >
            Business Owner
          </button>
       </div>

       {regType === 'guest' ? (
         <form onSubmit={handleAuthAction} className="space-y-6">
            <div className="grid grid-cols-1 gap-4">
               <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Full Name</label>
                  <input required type="text" placeholder="Alice Traveler" className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 px-6 text-sm font-bold focus:ring-4 ring-indigo-50 outline-none" />
               </div>
               <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Email Node</label>
                  <input required type="email" placeholder="alice@example.com" className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 px-6 text-sm font-bold focus:ring-4 ring-indigo-50 outline-none" />
               </div>
               <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Master Key</label>
                  <input required type="password" placeholder="••••••••••••" className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 px-6 text-sm font-bold focus:ring-4 ring-indigo-50 outline-none" />
               </div>
            </div>
            <button type="submit" className="w-full py-5 bg-emerald-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl hover:bg-emerald-700 transition-all">
               Finalize Registration
            </button>
         </form>
       ) : (
         <div className="space-y-8">
            {/* Owner Multi-step Wizard */}
            <div className="flex justify-between mb-8">
               {[1, 2, 3].map(s => (
                 <div key={s} className="flex flex-col items-center gap-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black border-2 transition-all ${step >= s ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-200 text-slate-300'}`}>{s}</div>
                    <span className={`text-[8px] font-black uppercase tracking-widest ${step >= s ? 'text-indigo-600' : 'text-slate-300'}`}>
                      {s === 1 ? 'Founder' : s === 2 ? 'Entity' : 'Review'}
                    </span>
                 </div>
               ))}
            </div>

            {step === 1 && (
              <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Full Legal Name</label>
                    <input type="text" placeholder="John Proprietor" className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 px-6 text-sm font-bold" />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Corporate Email</label>
                    <input type="email" placeholder="john@business.com" className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 px-6 text-sm font-bold" />
                 </div>
                 <button onClick={() => setStep(2)} className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest">Next Phase</button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Business Legal Entity Name</label>
                    <input type="text" placeholder="Grand Vista Resort" className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 px-6 text-sm font-bold" />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Entity Topology (Category)</label>
                    <select 
                      value={businessCategory}
                      onChange={(e) => setBusinessCategory(e.target.value as BusinessCategory)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 px-6 text-sm font-bold outline-none"
                    >
                       {Object.values(BusinessCategory).map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <button onClick={() => setStep(1)} className="py-4 bg-slate-100 text-slate-600 rounded-2xl font-black text-[10px] uppercase tracking-widest">Back</button>
                    <button onClick={() => setStep(3)} className="py-4 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest">Final Step</button>
                 </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
                 <div className="p-6 bg-amber-50 rounded-3xl border border-amber-100 flex items-start gap-4">
                    <i className="fas fa-shield-halved text-amber-600 mt-1"></i>
                    <div>
                       <p className="text-xs font-black text-amber-900 uppercase mb-1">Verification Required</p>
                       <p className="text-[10px] font-medium text-amber-700 leading-relaxed">Your account will be set to 'Pending' status. A Super Admin will review your legal credentials before full activation.</p>
                    </div>
                 </div>
                 <div className="p-8 bg-slate-50 rounded-[32px] space-y-4">
                    <div className="flex justify-between items-center text-xs">
                       <span className="font-bold text-slate-400">Founder:</span>
                       <span className="font-black text-slate-900">John Proprietor</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                       <span className="font-bold text-slate-400">Entity:</span>
                       <span className="font-black text-slate-900">Grand Vista Resort</span>
                    </div>
                 </div>
                 <button onClick={handleAuthAction} className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl">Submit for Governance Review</button>
              </div>
            )}
         </div>
       )}

       <div className="text-center">
         <button onClick={() => setMode('login')} className="text-xs font-black text-slate-400 uppercase tracking-widest hover:text-indigo-600">Already have an ID? Login</button>
       </div>
    </div>
  );

  const renderForgotPassword = () => (
    <div className="space-y-10 animate-fade-up">
       <div className="text-center">
          <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
             <i className="fas fa-key text-2xl"></i>
          </div>
          <h3 className="text-2xl font-black text-slate-900 tracking-tight">Access Recovery</h3>
          <p className="text-slate-500 font-medium text-sm">Enter your email node to receive a decryption token.</p>
       </div>
       <div className="space-y-6">
          <div className="space-y-2">
             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Email Node</label>
             <input type="email" placeholder="operator@seulanga.com" className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 px-6 text-sm font-bold focus:ring-4 ring-indigo-50 outline-none" />
          </div>
          <button className="w-full py-5 bg-slate-950 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl">Send Recovery Payload</button>
          <button onClick={() => setMode('login')} className="w-full text-xs font-black text-slate-400 uppercase tracking-widest hover:underline">Return to Entry</button>
       </div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Visual Narrative Side */}
      <div className="hidden lg:flex w-[45%] bg-slate-950 relative overflow-hidden flex-col justify-between p-20 text-white">
         <div className="absolute inset-0 bg-cover bg-center opacity-40 scale-110" style={{backgroundImage: 'url(https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=2070)'}}></div>
         <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/80 via-slate-950/90 to-black"></div>
         
         <div className="relative z-10">
            <div 
              onClick={onNavigateLanding}
              className="flex items-center gap-4 cursor-pointer hover:opacity-80 transition-opacity"
            >
               <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-slate-950 shadow-2xl">
                  <i className="fas fa-layer-group text-xl"></i>
               </div>
               <span className="font-black text-4xl tracking-tighter">SEULANGA<span className="text-indigo-500">.</span></span>
            </div>
         </div>

         <div className="relative z-10 max-w-md">
            <h2 className="text-6xl font-black leading-[0.9] tracking-tighter mb-8 uppercase">The Core <br/> Hospitality <br/> <span className="text-indigo-500">Node.</span></h2>
            <p className="text-indigo-200/60 font-medium leading-relaxed mb-12">Empowering business owners and guests through a unified, high-security property management ecosystem.</p>
            
            <div className="space-y-6">
               {[
                  { icon: 'fa-shield-check', text: 'Military-Grade Identity Security' },
                  { icon: 'fa-microchip', text: 'AI-Enhanced Asset Intelligence' },
                  { icon: 'fa-globe', text: 'Global Marketplace Connectivity' }
               ].map((item, i) => (
                  <div key={i} className="flex items-center gap-4 text-xs font-black uppercase tracking-widest text-white/40">
                     <i className={`fas ${item.icon} text-indigo-500 w-6 text-lg`}></i>
                     {item.text}
                  </div>
               ))}
            </div>
         </div>

         <div className="relative z-10 flex gap-4 text-[10px] font-black uppercase tracking-widest text-white/30">
            <span>© 2024 SEULANGA OS</span>
            <span>•</span>
            <span>V2.4.0-Stable</span>
         </div>
      </div>

      {/* Auth Interaction Side */}
      <div className="flex-1 bg-white flex flex-col justify-center p-8 lg:p-24 relative overflow-hidden">
         {/* Background Decor */}
         <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-50 rounded-full blur-3xl -mr-48 -mt-48 opacity-50"></div>
         <div className="absolute bottom-0 left-0 w-96 h-96 bg-slate-50 rounded-full blur-3xl -ml-48 -mb-48 opacity-50"></div>

         <div className="w-full max-w-md mx-auto relative z-10">
            <div className="mb-12">
               <h2 className="text-4xl font-black text-slate-900 tracking-tighter mb-4">
                 {mode === 'login' ? 'Authentication Required' : mode === 'register' ? 'Ecosystem Enrollment' : 'Identity Recovery'}
                 <span className="text-indigo-600">.</span>
               </h2>
               <p className="text-slate-500 font-medium leading-relaxed">
                 {mode === 'login' ? 'Synchronize your credentials to access your designated governance node.' : 
                  mode === 'register' ? 'Join the leading Sumatra-focused hospitality network.' : 
                  'We will help you regain access to your property assets.'}
               </p>
            </div>

            {mode === 'login' && renderLogin()}
            {mode === 'register' && renderRegister()}
            {mode === 'forgot-password' && renderForgotPassword()}

            {/* Language Selection & Legal */}
            <div className="mt-20 pt-10 border-t border-slate-100 flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-300">
               <div className="flex gap-4">
                  <button className="hover:text-indigo-600 transition-colors">Privacy Node</button>
                  <button className="hover:text-indigo-600 transition-colors">Terms of Governance</button>
               </div>
               <div className="flex items-center gap-2 text-slate-400">
                  <i className="fas fa-globe"></i>
                  <span>Global (EN)</span>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};
