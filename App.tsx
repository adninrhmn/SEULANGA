
import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { User, UserRole } from './types';
import { LandingPage } from './views/LandingPage';
import { OwnerDashboard } from './views/OwnerDashboard';
import { MOCK_USERS } from './constants';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<string>('landing');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setIsLoading(false);
    }, 1200);
  }, []);

  const handleLogin = (role: UserRole) => {
    const user = MOCK_USERS.find(u => u.role === role);
    if (user) {
      setCurrentUser(user);
      if (role === UserRole.BUSINESS_OWNER) setCurrentView('owner-dash');
      else if (role === UserRole.SUPER_ADMIN) setCurrentView('super-admin');
      else setCurrentView('landing');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentView('landing');
  };

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-slate-950">
        <div className="relative">
          <div className="w-24 h-24 border-2 border-indigo-500/20 rounded-[32px] absolute inset-0 animate-ping"></div>
          <div className="w-24 h-24 border-b-4 border-indigo-500 rounded-[32px] animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
             <i className="fas fa-layer-group text-indigo-500 text-3xl"></i>
          </div>
        </div>
        <p className="mt-8 text-white font-black text-3xl tracking-tighter animate-pulse">
          SEULANGA<span className="text-indigo-500">.</span>
        </p>
        <p className="mt-2 text-slate-500 text-xs font-bold uppercase tracking-[0.4em]">Initializing Ecosystem</p>
      </div>
    );
  }

  const renderView = () => {
    switch (currentView) {
      case 'landing':
        return <LandingPage onNavigate={setCurrentView} />;
      case 'owner-dash':
        return <OwnerDashboard />;
      case 'login':
        return (
          <div className="max-w-xl mx-auto py-20 px-6">
            <div className="text-center mb-16">
              <div className="w-20 h-20 bg-indigo-600 rounded-[28px] flex items-center justify-center text-white mx-auto shadow-2xl shadow-indigo-200 rotate-6 mb-8">
                 <i className="fas fa-layer-group text-3xl"></i>
              </div>
              <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tighter">Enter the Portal<span className="text-indigo-600">.</span></h2>
              <p className="text-slate-500 font-medium">Select your professional identity to begin.</p>
            </div>
            
            <div className="grid gap-4">
              {[
                { 
                  role: UserRole.BUSINESS_OWNER, 
                  label: 'Enterprise Partner', 
                  desc: 'Complete property control & scaling tools', 
                  icon: 'fa-hotel', 
                  color: 'bg-indigo-600' 
                },
                { 
                  role: UserRole.GUEST, 
                  label: 'Premium Guest', 
                  desc: 'Luxury stays & verified property rentals', 
                  icon: 'fa-star', 
                  color: 'bg-emerald-600' 
                },
                { 
                  role: UserRole.SUPER_ADMIN, 
                  label: 'System Governor', 
                  desc: 'Platform-wide oversight & policy control', 
                  icon: 'fa-shield-halved', 
                  color: 'bg-slate-950' 
                }
              ].map((persona) => (
                <button 
                  key={persona.role}
                  onClick={() => handleLogin(persona.role)}
                  className="group relative flex items-center p-8 bg-white border border-slate-200 rounded-[32px] hover:border-indigo-600 hover:shadow-2xl transition-all duration-300 text-left overflow-hidden"
                >
                  <div className={`w-16 h-16 ${persona.color} rounded-2xl flex items-center justify-center text-white text-2xl shadow-lg mr-8 group-hover:rotate-6 transition-transform`}>
                    <i className={`fas ${persona.icon}`}></i>
                  </div>
                  <div>
                    <h4 className="font-black text-xl text-slate-900 mb-1 group-hover:text-indigo-600 transition-colors">{persona.label}</h4>
                    <p className="text-slate-500 text-sm font-medium">{persona.desc}</p>
                  </div>
                  <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                    <i className="fas fa-arrow-right text-indigo-600"></i>
                  </div>
                </button>
              ))}
            </div>
          </div>
        );
      default:
        return <LandingPage onNavigate={setCurrentView} />;
    }
  };

  return (
    <Layout 
      user={currentUser} 
      onLogout={handleLogout} 
      onNavigate={setCurrentView}
      currentView={currentView}
    >
      {renderView()}
    </Layout>
  );
};

export default App;
