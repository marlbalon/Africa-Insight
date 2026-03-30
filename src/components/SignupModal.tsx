import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MapPin, ChevronRight, X, Globe, Sparkles, Mail, Lock, User, LogIn, Github, Chrome, Loader2 } from 'lucide-react';
import { AFRICAN_COUNTRIES } from '../constants';
import { cn } from '../utils';
import { toast } from 'sonner';
import { auth, db, googleProvider } from '../firebase';
import { 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  User as FirebaseUser,
  updateProfile,
  sendPasswordResetEmail
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';

interface SignupModalProps {
  isOpen: boolean;
  onClose: (locality: string, viewPreference: 'country' | 'africa') => void;
  user: FirebaseUser | null;
}

export const SignupModal: React.FC<SignupModalProps> = ({ isOpen, onClose, user }) => {
  const [step, setStep] = useState(0); // 0: Auth, 1: Country, 2: Preference
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  
  const [selectedCountry, setSelectedCountry] = useState('');
  const [viewPreference, setViewPreference] = useState<'country' | 'africa'>('country');
  const [searchQuery, setSearchQuery] = useState('');

  // If user is already logged in, skip auth step
  useEffect(() => {
    if (user && step === 0) {
      setStep(1);
    }
  }, [user, step]);

  const filteredCountries = AFRICAN_COUNTRIES.filter(c => 
    c.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
      toast.success('Logged in with Google!');
      setStep(1);
    } catch (error: any) {
      toast.error(error.message || 'Google login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    
    setIsLoading(true);
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
        toast.success('Logged in successfully!');
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName });
        toast.success('Account created!');
      }
      setStep(1);
    } catch (error: any) {
      console.error('Auth Error:', error);
      
      // Friendly error mapping
      let message = 'Authentication failed. Please try again.';
      
      if (error.code === 'auth/email-already-in-use') {
        message = 'This email is already registered. We have switched you to the "Sign In" tab so you can log in.';
        setIsLogin(true); 
      } else if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password') {
        message = 'Incorrect password. Please try again or use "Forgot Password".';
      } else if (error.code === 'auth/user-not-found') {
        message = 'No account found with this email. We have switched you to the "Sign Up" tab.';
        setIsLogin(false);
      } else if (error.code === 'auth/invalid-email') {
        message = 'The email address is not valid. Please check for typos.';
      } else if (error.code === 'auth/operation-not-allowed') {
        message = 'CRITICAL: Email/Password login is DISABLED in your Firebase Console. Please go to Authentication > Sign-in method and enable it.';
      } else if (error.code === 'auth/network-request-failed') {
        message = 'Network error. Please check your internet connection and ensure you are not behind a firewall that blocks Firebase.';
      } else if (error.code === 'auth/popup-blocked') {
        message = 'Google login popup was blocked by your browser. Please allow popups for this site.';
      } else if (error.code === 'auth/account-exists-with-different-credential') {
        message = 'You have already signed up using Google with this email. Please click "Continue with Google" above.';
      } else if (error.code === 'auth/weak-password') {
        message = 'Your password is too weak. Please use at least 6 characters.';
      } else if (error.message) {
        message = error.message;
      }
      
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      toast.error('Please enter your email address first.');
      return;
    }
    
    setIsResetting(true);
    try {
      await sendPasswordResetEmail(auth, email);
      toast.success('Password reset email sent! Please check your inbox.');
    } catch (error: any) {
      toast.error(error.message || 'Failed to send reset email.');
    } finally {
      setIsResetting(false);
    }
  };

  const handleNextStep = () => {
    if (step === 1 && !selectedCountry) {
      toast.error('Please select your country to continue.');
      return;
    }
    setStep(step + 1);
  };

  const handleComplete = async () => {
    if (!user) {
      // Guest completion - save to local storage only
      localStorage.setItem('user_locality', selectedCountry);
      localStorage.setItem('view_preference', viewPreference);
      onClose(selectedCountry, viewPreference);
      toast.success(`Welcome to Africa Insight! You are browsing as a guest.`);
      return;
    }

    setIsLoading(true);
    try {
      console.log('Saving profile for user:', user.uid);
      const profileData = {
        uid: user.uid,
        email: user.email || '',
        locality: selectedCountry,
        viewPreference: viewPreference,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      console.log('Profile data to save:', profileData);
      await setDoc(doc(db, 'users', user.uid), profileData, { merge: true });
      console.log('Profile saved successfully!');
      
      localStorage.setItem('user_locality', selectedCountry);
      localStorage.setItem('view_preference', viewPreference);
      
      console.log('Calling onClose with:', selectedCountry, viewPreference);
      onClose(selectedCountry, viewPreference);
      toast.success(`Welcome ${user.displayName || 'to Africa Insight'}! Your profile is ready.`);
    } catch (error: any) {
      console.error('Firestore Error:', error);
      
      let message = 'Failed to save profile. Please check your connection.';
      if (error.code === 'permission-denied') {
        message = 'CRITICAL: Firestore permission denied. Please check your firestore.rules and ensure the "users" collection is writable.';
      } else if (error.message) {
        message = error.message;
      }
      
      toast.error(message);
      
      // Log detailed error for debugging
      const errInfo = {
        error: error instanceof Error ? error.message : String(error),
        operationType: 'write',
        path: `users/${user.uid}`,
        authInfo: {
          userId: user.uid,
          email: user.email,
          emailVerified: user.emailVerified,
          isAnonymous: user.isAnonymous,
          providerInfo: user.providerData.map(p => ({
            providerId: p.providerId,
            displayName: p.displayName,
            email: p.email
          }))
        }
      };
      console.error('Detailed Firestore Error:', JSON.stringify(errInfo));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="w-full max-w-lg glass-morphism rounded-[32px] border-neon-blue/30 overflow-hidden shadow-2xl flex flex-col"
          >
            <div className="p-8 text-center space-y-4 bg-gradient-to-b from-neon-blue/10 to-transparent">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-neon-blue to-neon-purple flex items-center justify-center mx-auto shadow-lg shadow-neon-blue/20">
                <Globe className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-black text-white tracking-tight">
                  {step === 0 ? (isLogin ? "Welcome Back" : "Join the Movement") : "Welcome to Africa Insight"}
                </h2>
                <p className="text-slate-400 text-sm mt-2">
                  {step === 0 
                    ? (isLogin ? "Sign in to access your personalized regional insights." : "Create an account to unlock AI-powered reports and crop analysis.")
                    : step === 1 
                    ? "To provide personalized regional analysis, please select your primary locality."
                    : "Choose how you'd like to explore the continent's data."}
                </p>
              </div>
            </div>

            <div className="p-8 space-y-6 flex-1 overflow-y-auto max-h-[60vh]">
              {step === 0 ? (
                <div className="space-y-6">
                  {/* Tabs */}
                  <div className="flex p-1 rounded-xl bg-white/5 border border-white/10">
                    <button 
                      onClick={() => setIsLogin(true)}
                      className={cn(
                        "flex-1 py-2 rounded-lg text-xs font-bold transition-all",
                        isLogin ? "bg-neon-blue text-dark-bg shadow-lg shadow-neon-blue/20" : "text-slate-500 hover:text-white"
                      )}
                    >
                      Sign In
                    </button>
                    <button 
                      onClick={() => setIsLogin(false)}
                      className={cn(
                        "flex-1 py-2 rounded-lg text-xs font-bold transition-all",
                        !isLogin ? "bg-neon-blue text-dark-bg shadow-lg shadow-neon-blue/20" : "text-slate-500 hover:text-white"
                      )}
                    >
                      Sign Up
                    </button>
                  </div>

                  <div className="grid grid-cols-1 gap-3">
                    <button 
                      onClick={handleGoogleLogin}
                      disabled={isLoading}
                      className="w-full py-3 rounded-xl bg-white/5 border border-white/10 text-white font-bold hover:bg-white/10 transition-all flex items-center justify-center gap-3 group"
                    >
                      {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Chrome className="w-5 h-5 text-neon-blue group-hover:scale-110 transition-transform" />}
                      Continue with Google
                    </button>
                  </div>

                  <div className="relative flex items-center gap-4">
                    <div className="flex-1 h-[1px] bg-white/10" />
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Or with Email</span>
                    <div className="flex-1 h-[1px] bg-white/10" />
                  </div>

                  <form onSubmit={handleEmailAuth} className="space-y-4">
                    {!isLogin && (
                      <div className="relative group">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-neon-blue transition-colors" />
                        <input 
                          type="text" 
                          required
                          value={displayName}
                          onChange={(e) => setDisplayName(e.target.value)}
                          placeholder="Full Name" 
                          className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-neon-blue/50 transition-all"
                        />
                      </div>
                    )}
                    <div className="relative group">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-neon-blue transition-colors" />
                      <input 
                        type="email" 
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Email Address" 
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-neon-blue/50 transition-all"
                      />
                    </div>
                    <div className="relative group">
                      <div className="flex justify-between items-center mb-1 px-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Password</label>
                        {isLogin && (
                          <button 
                            type="button"
                            onClick={handleForgotPassword}
                            disabled={isResetting}
                            className="text-[10px] font-bold text-neon-blue hover:underline disabled:opacity-50"
                          >
                            {isResetting ? 'Sending...' : 'Forgot Password?'}
                          </button>
                        )}
                      </div>
                      <Lock className="absolute left-4 top-[calc(50%+10px)] -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-neon-blue transition-colors" />
                      <input 
                        type="password" 
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Password" 
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-neon-blue/50 transition-all"
                      />
                    </div>
                    <button 
                      type="submit"
                      disabled={isLoading}
                      className="w-full py-4 rounded-2xl bg-neon-blue text-dark-bg font-black hover:bg-white transition-all shadow-lg shadow-neon-blue/20 flex items-center justify-center gap-2 group"
                    >
                      {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (isLogin ? "Sign In" : "Create Account")}
                      {!isLoading && <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
                    </button>
                  </form>

                  <p className="text-center text-sm text-slate-400">
                    {isLogin ? "Don't have an account?" : "Already have an account?"}
                    <button 
                      onClick={() => setIsLogin(!isLogin)}
                      className="ml-2 text-neon-blue font-bold hover:underline"
                    >
                      {isLogin ? "Sign Up" : "Log In"}
                    </button>
                  </p>
                </div>
              ) : step === 1 ? (
                <>
                  <div className="relative group">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-neon-blue transition-colors" />
                    <input 
                      type="text" 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search your country..." 
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-neon-blue/50 transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {filteredCountries.map(country => (
                      <button
                        key={country}
                        onClick={() => setSelectedCountry(country)}
                        className={cn(
                          "flex items-center justify-between px-4 py-3 rounded-xl border transition-all text-left group",
                          selectedCountry === country 
                            ? "bg-neon-blue/20 border-neon-blue text-white" 
                            : "bg-white/5 border-white/10 text-slate-400 hover:text-white hover:bg-white/10"
                        )}
                      >
                        <span className="text-sm font-medium truncate">{country}</span>
                        {selectedCountry === country && <Sparkles className="w-3 h-3 text-neon-blue animate-pulse" />}
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                <div className="space-y-4">
                  <button
                    onClick={() => setViewPreference('country')}
                    className={cn(
                      "w-full p-6 rounded-2xl border transition-all text-left flex items-center gap-4 group",
                      viewPreference === 'country'
                        ? "bg-neon-blue/20 border-neon-blue text-white"
                        : "bg-white/5 border-white/10 text-slate-400 hover:text-white hover:bg-white/10"
                    )}
                  >
                    <div className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center transition-colors",
                      viewPreference === 'country' ? "bg-neon-blue text-dark-bg" : "bg-white/10 text-slate-400"
                    )}>
                      <MapPin className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-lg">My Country Insights</h4>
                      <p className="text-xs text-slate-500 mt-1">Focus on {selectedCountry}'s specific data and trends.</p>
                    </div>
                    {viewPreference === 'country' && <Sparkles className="w-4 h-4 text-neon-blue" />}
                  </button>

                  <button
                    onClick={() => setViewPreference('africa')}
                    className={cn(
                      "w-full p-6 rounded-2xl border transition-all text-left flex items-center gap-4 group",
                      viewPreference === 'africa'
                        ? "bg-neon-purple/20 border-neon-purple text-white"
                        : "bg-white/5 border-white/10 text-slate-400 hover:text-white hover:bg-white/10"
                    )}
                  >
                    <div className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center transition-colors",
                      viewPreference === 'africa' ? "bg-neon-purple text-white" : "bg-white/10 text-slate-400"
                    )}>
                      <Globe className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-lg">Africa Insights</h4>
                      <p className="text-xs text-slate-500 mt-1">View the entire continent's performance and comparisons.</p>
                    </div>
                    {viewPreference === 'africa' && <Sparkles className="w-4 h-4 text-neon-purple" />}
                  </button>
                </div>
              )}
            </div>

            <div className="p-8 bg-white/5 border-t border-white/10">
              {step === 0 ? (
                <div className="space-y-4">
                  <button 
                    onClick={() => setStep(1)}
                    className="w-full py-4 rounded-2xl bg-white/5 border border-white/10 text-white font-bold hover:bg-white/10 transition-all flex items-center justify-center gap-2 group"
                  >
                    Continue as Guest
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                  <p className="text-[10px] text-center text-slate-500 uppercase tracking-widest font-bold">
                    By continuing, you agree to our Terms of Service and Privacy Policy.
                  </p>
                </div>
              ) : step === 1 ? (
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <button
                      onClick={() => setStep(0)}
                      className="flex-1 py-4 rounded-2xl bg-white/5 text-white font-bold hover:bg-white/10 transition-all border border-white/10"
                    >
                      Back
                    </button>
                    <button
                      onClick={handleNextStep}
                      className="flex-[2] py-4 rounded-2xl bg-neon-blue text-dark-bg font-black hover:bg-white transition-all shadow-lg shadow-neon-blue/20 flex items-center justify-center gap-2 group"
                    >
                      Continue
                      <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                  {user && (
                    <button 
                      onClick={() => auth.signOut()}
                      className="w-full text-[10px] font-bold text-slate-500 uppercase tracking-widest hover:text-white transition-colors"
                    >
                      Sign out and use a different account
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <button
                      onClick={() => setStep(1)}
                      className="flex-1 py-4 rounded-2xl bg-white/5 text-white font-bold hover:bg-white/10 transition-all border border-white/10"
                    >
                      Back
                    </button>
                    <button
                      onClick={handleComplete}
                      disabled={isLoading}
                      className="flex-[2] py-4 rounded-2xl bg-neon-blue text-dark-bg font-black hover:bg-white transition-all shadow-lg shadow-neon-blue/20 flex items-center justify-center gap-2 group"
                    >
                      {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Complete Setup"}
                      {!isLoading && <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
                    </button>
                  </div>
                  {user && (
                    <button 
                      onClick={() => auth.signOut()}
                      className="w-full text-[10px] font-bold text-slate-500 uppercase tracking-widest hover:text-white transition-colors text-center"
                    >
                      Sign out and use a different account
                    </button>
                  )}
                </div>
              )}
              <p className="text-[10px] text-center text-slate-500 uppercase tracking-widest font-bold mt-4">
                You can change this later in your profile settings.
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
