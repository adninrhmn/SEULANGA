
import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { User, UserRole, Business, CategoryModuleConfig } from './types';
import { LandingPage } from './views/LandingPage';
import { OwnerDashboard } from './views/OwnerDashboard';
import { SuperAdminDashboard } from './views/SuperAdminDashboard';
import { StaffDashboard } from './views/StaffDashboard';
import { GuestDashboard } from './views/GuestDashboard';
import { PropertyDetail } from './views/PropertyDetail';
import { Marketplace } from './views/Marketplace';
import { Auth } from './views/Auth';
import { MOCK_USERS, DEFAULT_CATEGORY_MODULE_MAP } from './constants';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<string>('landing');
  const [adminSubView, setAdminSubView] = useState<string>('overview');
  const [selectedProperty, setSelectedProperty] = useState<Business | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [language, setLanguage] = useState<'id' | 'en'>('id');
  
  const [moduleConfigs, setModuleConfigs] = useState<CategoryModuleConfig>(DEFAULT_CATEGORY_MODULE_MAP);

  useEffect(() => {
    const savedLang = localStorage.getItem('seulanga_lang') as 'id' | 'en';
    if (savedLang) setLanguage(savedLang);
    
    setTimeout(() => {
      setIsLoading(false);
    }, 1200);
  }, []);

  const handleLanguageChange = (lang: 'id' | 'en') => {
    setLanguage(lang);
    localStorage.setItem('seulanga_lang', lang);
  };

  const handleUpdateUser = (updatedData: Partial<User>) => {
    if (!currentUser) return;
    setCurrentUser({ ...currentUser, ...updatedData });
  };

  const handleLogin = (role: UserRole, email?: string) => {
    const user = MOCK_USERS.find(u => u.role === role) || {
      id: `u-gen-${Date.now()}`,
      name: email?.split('@')[0] || 'Authenticated User',
      email: email || 'user@example.com',
      role: role,
      avatar: 'https://i.pravatar.cc/150?u=newuser',
      createdAt: new Date().toISOString(),
    };

    setCurrentUser(user as User);
    
    if (selectedProperty) {
      setCurrentView('property-detail');
    } else if (role === UserRole.BUSINESS_OWNER) {
      setCurrentView('owner-dash');
    } else if (role === UserRole.SUPER_ADMIN) {
      setCurrentView('super-admin');
      setAdminSubView('overview');
    } else if (role === UserRole.ADMIN_STAFF) {
      setCurrentView('staff-dash');
    } else if (role === UserRole.GUEST) {
      setCurrentView('guest-dash');
    } else {
      setCurrentView('landing');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentView('landing');
    setSelectedProperty(null);
  };

  const handleNavigate = (view: string, subView?: string) => {
    setCurrentView(view);
    if (view === 'super-admin' && subView) {
      setAdminSubView(subView);
    } else if (view === 'super-admin' && !subView) {
      setAdminSubView('overview');
    }
    // Handle link from Layout profile settings
    if (view === 'guest-dash' && subView === 'profile') {
        // Just let it fall through to renderView
    }
  };

  const navigateToProperty = (property: Business) => {
    setSelectedProperty(property);
    setCurrentView('property-detail');
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
      </div>
    );
  }

  const renderView = () => {
    switch (currentView) {
      case 'landing':
        return <LandingPage onNavigate={handleNavigate} onSelectProperty={navigateToProperty} />;
      case 'owner-dash':
        return <OwnerDashboard businessId={currentUser?.businessId || "b1"} moduleConfigs={moduleConfigs} currentUser={currentUser} onUpdateUser={handleUpdateUser} />;
      case 'super-admin':
        return (
          <SuperAdminDashboard 
            activeTab={adminSubView as any} 
            onNavigate={handleNavigate} 
            language={language}
            moduleConfigs={moduleConfigs}
            onUpdateModuleConfigs={setModuleConfigs}
            currentUser={currentUser}
            onUpdateUser={handleUpdateUser}
          />
        );
      case 'staff-dash':
        return <StaffDashboard currentUser={currentUser} onUpdateUser={handleUpdateUser} />;
      case 'guest-dash':
        return <GuestDashboard currentUser={currentUser} onUpdateUser={handleUpdateUser} initialTab={adminSubView === 'profile' ? 'profile' : 'overview'} />;
      case 'property-detail':
        return selectedProperty ? (
          <PropertyDetail 
            property={selectedProperty} 
            onBack={() => handleNavigate('explore')} 
            currentUser={currentUser}
            onLoginRequired={() => handleNavigate('login')}
          />
        ) : <LandingPage onNavigate={handleNavigate} onSelectProperty={navigateToProperty} />;
      case 'explore':
        return <Marketplace onSelectProperty={navigateToProperty} />;
      case 'login':
      case 'register':
        return <Auth onLogin={handleLogin} onNavigateLanding={() => handleNavigate('landing')} />;
      default:
        return <LandingPage onNavigate={handleNavigate} onSelectProperty={navigateToProperty} />;
    }
  };

  return (
    <Layout 
      user={currentUser} 
      onLogout={handleLogout} 
      onNavigate={handleNavigate}
      currentView={currentView}
      currentSubView={adminSubView}
      language={language}
      onLanguageChange={handleLanguageChange}
    >
      {renderView()}
    </Layout>
  );
};

export default App;
