import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  MessageSquare, 
  Send, 
  MapPin, 
  Clock, 
  Filter, 
  Search, 
  AlertCircle,
  CheckCircle2,
  Info
} from 'lucide-react';
import { cn } from '../utils';
import { AFRICAN_COUNTRIES } from '../constants';
import { toast } from 'sonner';
import { DownloadReportButton } from '../components/DownloadReportButton';

interface CommunityReport {
  id: string;
  author: string;
  locality: string;
  category: 'Health' | 'Agriculture' | 'Infrastructure' | 'Education' | 'General';
  content: string;
  timestamp: string;
  status: 'Verified' | 'Pending' | 'Alert';
}

const CATEGORIES = ['All', 'Health', 'Agriculture', 'Infrastructure', 'Education', 'General'];

export const CommunityReports: React.FC = () => {
  const [reports, setReports] = useState<CommunityReport[]>([]);
  const [newReportContent, setNewReportContent] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CommunityReport['category']>('General');
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [userLocality, setUserLocality] = useState<string | null>(null);
  const feedRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load reports from localStorage
    const savedReports = localStorage.getItem('community_reports');
    if (savedReports) {
      setReports(JSON.parse(savedReports));
    } else {
      // Initial mock reports
      const initialReports: CommunityReport[] = [
        {
          id: '1',
          author: 'Kofi Mensah',
          locality: 'Ghana',
          category: 'Agriculture',
          content: 'Observing unusual pest patterns in maize crops in the Ashanti region. Seeking advice on organic control methods.',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          status: 'Verified'
        },
        {
          id: '2',
          author: 'Amara Okafor',
          locality: 'Nigeria',
          category: 'Health',
          content: 'Local clinic in Enugu reporting a spike in seasonal flu cases. Encouraging residents to stay hydrated and rest.',
          timestamp: new Date(Date.now() - 7200000).toISOString(),
          status: 'Alert'
        },
        {
          id: '3',
          author: 'Moussa Diop',
          locality: 'Senegal',
          category: 'Infrastructure',
          content: 'New solar-powered water pump installed in our village. Clean water access has significantly improved!',
          timestamp: new Date(Date.now() - 86400000).toISOString(),
          status: 'Verified'
        }
      ];
      setReports(initialReports);
      localStorage.setItem('community_reports', JSON.stringify(initialReports));
    }

    // Load user locality
    const savedLocality = localStorage.getItem('user_locality');
    if (savedLocality) {
      setUserLocality(savedLocality);
    }
  }, []);

  const handleSubmitReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReportContent.trim()) return;
    if (!userLocality) {
      toast.error('Please set your locality in settings first.');
      return;
    }

    const report: CommunityReport = {
      id: Date.now().toString(),
      author: 'You',
      locality: userLocality,
      category: selectedCategory,
      content: newReportContent,
      timestamp: new Date().toISOString(),
      status: 'Pending'
    };

    const updatedReports = [report, ...reports];
    setReports(updatedReports);
    localStorage.setItem('community_reports', JSON.stringify(updatedReports));
    setNewReportContent('');
    toast.success('Report submitted to the community feed!');
  };

  const filteredReports = reports.filter(report => {
    const matchesFilter = activeFilter === 'All' || report.category === activeFilter;
    const matchesSearch = report.content.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          report.locality.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="p-8 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-4xl font-black text-white tracking-tight">Community Feed</h2>
          <p className="text-slate-400">Real-time observations and reports from across the continent.</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10">
          <MapPin className="w-4 h-4 text-neon-blue" />
          <span className="text-sm font-bold text-white">{userLocality || 'Locality not set'}</span>
        </div>
        <DownloadReportButton 
          elementRef={feedRef} 
          fileName="community_feed_report" 
          title="Community Feed" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8" ref={feedRef}>
        {/* Submit Report Section */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass-morphism p-6 rounded-2xl border-white/5">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-neon-purple" />
              Submit a Report
            </h3>
            <form onSubmit={handleSubmitReport} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Category</label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.filter(c => c !== 'All').map(cat => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setSelectedCategory(cat as any)}
                      className={cn(
                        "px-3 py-1.5 rounded-lg border transition-all text-xs",
                        selectedCategory === cat 
                          ? "bg-neon-purple text-white border-neon-purple shadow-lg shadow-neon-purple/20" 
                          : "bg-white/5 border-white/10 text-slate-300 hover:text-white hover:bg-white/10"
                      )}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Your Observation</label>
                <textarea
                  value={newReportContent}
                  onChange={(e) => setNewReportContent(e.target.value)}
                  placeholder="What are you seeing in your area? (e.g., crop health, weather changes, local events...)"
                  className="w-full h-32 bg-white/5 border border-white/10 rounded-xl p-4 text-sm text-white focus:outline-none focus:border-neon-purple/50 transition-all resize-none"
                />
              </div>
              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-neon-purple text-white font-bold hover:bg-neon-purple/80 transition-all shadow-lg shadow-neon-purple/20 flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                Post to Feed
              </button>
            </form>
          </div>

          <div className="glass-morphism p-6 rounded-2xl border-white/5">
            <h3 className="text-lg font-bold text-white mb-4">Guidelines</h3>
            <ul className="space-y-3">
              {[
                { icon: CheckCircle2, text: 'Be specific about your location.' },
                { icon: CheckCircle2, text: 'Share factual observations.' },
                { icon: CheckCircle2, text: 'Respect community privacy.' },
                { icon: Info, text: 'Reports are verified by AI & experts.' },
              ].map((item, i) => (
                <li key={i} className="flex gap-3 text-sm text-slate-400">
                  <item.icon className="w-4 h-4 text-neon-blue shrink-0 mt-0.5" />
                  {item.text}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Feed Section */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 glass-morphism p-3 rounded-xl border-white/5 flex items-center gap-3">
              <Search className="w-5 h-5 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search reports by keyword or locality..."
                className="bg-transparent text-sm text-white focus:outline-none w-full"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveFilter(cat)}
                  className={cn(
                    "px-4 py-2 rounded-xl border transition-all text-xs font-bold whitespace-nowrap",
                    activeFilter === cat 
                      ? "bg-neon-blue text-dark-bg border-neon-blue" 
                      : "bg-white/5 border-white/10 text-slate-400 hover:text-white"
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {filteredReports.map((report) => (
                <motion.div
                  key={report.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="glass-morphism p-6 rounded-2xl border-white/5 hover:border-white/10 transition-all space-y-4"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-neon-blue to-neon-purple flex items-center justify-center text-white font-bold text-xs">
                        {report.author[0]}
                      </div>
                      <div>
                        <h4 className="font-bold text-white text-sm">{report.author}</h4>
                        <div className="flex items-center gap-2 text-[10px] text-slate-500 uppercase tracking-widest font-bold">
                          <MapPin className="w-3 h-3" />
                          {report.locality}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className={cn(
                        "text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-md",
                        report.status === 'Verified' ? "bg-neon-green/10 text-neon-green" : 
                        report.status === 'Alert' ? "bg-red-500/10 text-red-500" : 
                        "bg-slate-800 text-slate-500"
                      )}>
                        {report.status}
                      </span>
                      <div className="flex items-center gap-1 text-[10px] text-slate-500">
                        <Clock className="w-3 h-3" />
                        {new Date(report.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <span className="inline-block px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold text-neon-blue uppercase tracking-widest">
                      {report.category}
                    </span>
                    <p className="text-slate-300 text-sm leading-relaxed">
                      {report.content}
                    </p>
                  </div>

                  <div className="flex items-center gap-4 pt-4 border-t border-white/5">
                    <button className="flex items-center gap-2 text-xs text-slate-500 hover:text-white transition-colors">
                      <MessageSquare className="w-4 h-4" />
                      Reply
                    </button>
                    <button className="flex items-center gap-2 text-xs text-slate-500 hover:text-white transition-colors">
                      <AlertCircle className="w-4 h-4" />
                      Report
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {filteredReports.length === 0 && (
              <div className="text-center py-20 glass-morphism rounded-2xl border-white/5">
                <Users className="w-12 h-12 text-slate-700 mx-auto mb-4" />
                <h4 className="text-white font-bold">No reports found</h4>
                <p className="text-slate-500 text-sm">Be the first to share an observation in this category!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
