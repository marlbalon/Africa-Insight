import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Sidebar } from './components/Sidebar';
import { Home } from './pages/Home';
import { HealthDashboard } from './pages/HealthDashboard';
import { AgricultureDashboard } from './pages/AgricultureDashboard';
import { EducationDashboard } from './pages/EducationDashboard';
import { InfrastructureDashboard } from './pages/InfrastructureDashboard';
import { InteractiveMaps } from './pages/InteractiveMaps';
import { AIReports } from './pages/AIReports';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { CommunityReports } from './pages/CommunityReports';
import { SignupModal } from './components/SignupModal';
import { AIChatbot } from './components/AIChatbot';
import { Search, Bell, User, Settings, X, MapPin, LogOut, LogIn } from 'lucide-react';
import { Toaster, toast } from 'sonner';
import { auth, db } from './firebase';
import { onAuthStateChanged, signOut, User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { cn } from './utils';

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [globalSearchQuery, setGlobalSearchQuery] = useState('');
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [userLocality, setUserLocality] = useState<string | null>(localStorage.getItem('user_locality'));
  const [viewPreference, setViewPreference] = useState<'country' | 'africa'>(
    (localStorage.getItem('user_locality') ? (localStorage.getItem('view_preference') as 'country' | 'africa') : 'africa') || 'africa'
  );
  const [isSignupOpen, setIsSignupOpen] = useState(false);

  // Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log('Auth state changed:', firebaseUser?.uid);
      setUser(firebaseUser);
      
      if (firebaseUser) {
        try {
          // Fetch profile from Firestore
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            setUserLocality(data.locality);
            setViewPreference(data.viewPreference);
            localStorage.setItem('user_locality', data.locality);
            localStorage.setItem('view_preference', data.viewPreference);
            setIsSignupOpen(false); // Close if they have a profile
          } else {
            // New user without profile, trigger signup
            setIsSignupOpen(true);
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
          setIsSignupOpen(true);
        }
      } else {
        // Not logged in - ALWAYS ask for country on reload as requested
        const localLocality = localStorage.getItem('user_locality');
        setUserLocality(localLocality);
        setViewPreference((localStorage.getItem('view_preference') as 'country' | 'africa') || 'africa');
        setIsSignupOpen(true);
      }
      
      setIsAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Listen for profile changes if logged in
  useEffect(() => {
    if (!user) return;
    const unsubscribe = onSnapshot(doc(db, 'users', user.uid), (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        setUserLocality(data.locality);
        setViewPreference(data.viewPreference);
      }
    });
    return () => unsubscribe();
  }, [user]);

  // Smart Navigation Logic
  React.useEffect(() => {
    const query = globalSearchQuery.toLowerCase();
    if (query.length < 3) return;

    if (query.includes('health') || query.includes('disease') || query.includes('outbreak')) {
      setActiveTab('health');
    } else if (query.includes('agri') || query.includes('crop') || query.includes('farm') || query.includes('yield')) {
      setActiveTab('agriculture');
    } else if (query.includes('edu') || query.includes('school') || query.includes('literacy')) {
      setActiveTab('education');
    } else if (query.includes('infra') || query.includes('water') || query.includes('energy') || query.includes('road')) {
      setActiveTab('infrastructure');
    } else if (query.includes('map') || query.includes('interactive')) {
      setActiveTab('maps');
    } else if (query.includes('report') || query.includes('insight') || query.includes('analysis')) {
      setActiveTab('reports');
    } else if (query.includes('community') || query.includes('feed') || query.includes('social')) {
      setActiveTab('community');
    }
  }, [globalSearchQuery]);

  const handleSignupComplete = (locality: string, preference: 'country' | 'africa') => {
    setUserLocality(locality);
    setViewPreference(preference);
    setIsSignupOpen(false);
  };

  const renderContent = () => {
    const dashboardProps = {
      searchQuery: globalSearchQuery,
      userLocality: userLocality || '',
      viewPreference,
      user
    };

    switch (activeTab) {
      case 'home':
        return <Home onExplore={() => setActiveTab('health')} />;
      case 'health':
        return <HealthDashboard {...dashboardProps} />;
      case 'agriculture':
        return <AgricultureDashboard {...dashboardProps} />;
      case 'education':
        return <EducationDashboard {...dashboardProps} />;
      case 'infrastructure':
        return <InfrastructureDashboard {...dashboardProps} />;
      case 'maps':
        return <InteractiveMaps {...dashboardProps} />;
      case 'reports':
        return <AIReports {...dashboardProps} />;
      case 'community':
        return <CommunityReports />;
      case 'about':
        return <AboutPage />;
      case 'contact':
        return <ContactPage />;
      default:
        return (
          <div className="h-[80vh] flex flex-col items-center justify-center text-center p-8">
            <div className="w-20 h-20 rounded-3xl bg-white/5 flex items-center justify-center mb-6">
              <Settings className="w-10 h-10 text-slate-500 animate-spin-slow" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">Module Under Construction</h2>
            <p className="text-slate-400 max-w-md">We are currently integrating AI models and real-time data for the {activeTab} module. Check back soon!</p>
            <button 
              onClick={() => setActiveTab('home')}
              className="mt-8 px-6 py-3 rounded-xl bg-neon-blue text-dark-bg font-bold hover:bg-white transition-all"
            >
              Return Home
            </button>
          </div>
        );
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      toast.success('Signed out successfully');
    } catch (error) {
      toast.error('Failed to sign out');
    }
  };

  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-neon-blue border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Initializing Africa Insight...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-dark-bg font-sans selection:bg-neon-blue/30 selection:text-neon-blue">
      <Toaster position="top-right" richColors />
      <SignupModal isOpen={isSignupOpen} onClose={handleSignupComplete} user={user} />
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-20 border-b border-white/5 flex items-center justify-between px-8 sticky top-0 bg-dark-bg/80 backdrop-blur-md z-30">
          <div className="flex-1 max-w-xl">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-neon-blue transition-colors" />
              <input 
                type="text" 
                value={globalSearchQuery}
                onChange={(e) => setGlobalSearchQuery(e.target.value)}
                placeholder="Search regional insights, diseases, or crop types..." 
                className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-12 pr-4 text-sm focus:outline-none focus:border-neon-blue/50 transition-all"
              />
              {globalSearchQuery && (
                <button 
                  onClick={() => setGlobalSearchQuery('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-white/10 rounded-full transition-colors"
                >
                  <X className="w-3 h-3 text-slate-500 hover:text-white" />
                </button>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 p-1 rounded-xl bg-white/5 border border-white/10">
              <button 
                onClick={() => {
                  setViewPreference('country');
                  localStorage.setItem('view_preference', 'country');
                }}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                  viewPreference === 'country' ? "bg-neon-blue text-dark-bg shadow-lg shadow-neon-blue/20" : "text-slate-500 hover:text-white"
                )}
              >
                {userLocality || 'My Country'}
              </button>
              <button 
                onClick={() => {
                  setViewPreference('africa');
                  localStorage.setItem('view_preference', 'africa');
                }}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                  viewPreference === 'africa' ? "bg-neon-purple text-white shadow-lg shadow-neon-purple/20" : "text-slate-500 hover:text-white"
                )}
              >
                Africa
              </button>
            </div>
            
            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-neon-green/10 border border-neon-green/20">
              <div className="w-2 h-2 rounded-full bg-neon-green animate-pulse" />
              <span className="text-[10px] font-black text-neon-green uppercase tracking-widest">Live Data Grounding</span>
            </div>
            
            <button className="p-2 rounded-xl hover:bg-white/5 text-slate-400 hover:text-white transition-colors relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-neon-purple rounded-full border-2 border-dark-bg" />
            </button>
            
            <div className="h-8 w-[1px] bg-white/10 mx-2" />
            
            {user ? (
              <div className="flex items-center gap-4">
                <button 
                  onClick={handleSignOut}
                  className="p-2 rounded-xl hover:bg-white/5 text-slate-400 hover:text-red-400 transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => setIsSignupOpen(true)}
                  className="flex items-center gap-3 p-1.5 pr-4 rounded-xl hover:bg-white/5 transition-colors group"
                >
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-neon-blue to-neon-purple flex items-center justify-center overflow-hidden">
                    {user.photoURL ? (
                      <img src={user.photoURL} alt={user.displayName || 'User'} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <User className="w-5 h-5 text-white" />
                    )}
                  </div>
                  <div className="text-left hidden sm:block">
                    <p className="text-xs font-bold text-white leading-none truncate max-w-[100px]">
                      {user.displayName || user.email?.split('@')[0] || 'User'}
                    </p>
                    <p className="text-[10px] text-slate-500 mt-1">{userLocality || 'Regional Analyst'}</p>
                  </div>
                </button>
              </div>
            ) : (
              <button 
                onClick={() => setIsSignupOpen(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-neon-blue text-dark-bg font-bold hover:bg-white transition-all shadow-lg shadow-neon-blue/20"
              >
                <LogIn className="w-4 h-4" />
                Sign In
              </button>
            )}
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            {renderContent()}
          </motion.div>
        </div>
      </main>

      <AIChatbot />
    </div>
  );
}
