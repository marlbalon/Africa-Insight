import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  LayoutDashboard, 
  HeartPulse, 
  Sprout, 
  GraduationCap, 
  Droplets, 
  Map as MapIcon, 
  FileText, 
  Info, 
  Mail,
  Menu,
  X,
  ChevronRight,
  Users
} from 'lucide-react';
import { cn } from '../utils';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const menuItems = [
    { id: 'home', label: 'Home', icon: LayoutDashboard },
    { id: 'health', label: 'Health', icon: HeartPulse },
    { id: 'agriculture', label: 'Agriculture', icon: Sprout },
    { id: 'education', label: 'Education', icon: GraduationCap },
    { id: 'infrastructure', label: 'Infrastructure', icon: Droplets },
    { id: 'maps', label: 'Interactive Maps', icon: MapIcon },
    { id: 'reports', label: 'AI Reports', icon: FileText },
    { id: 'community', label: 'Community', icon: Users },
    { id: 'about', label: 'About', icon: Info },
    { id: 'contact', label: 'Contact', icon: Mail },
  ];

  return (
    <motion.aside
      initial={false}
      animate={{ width: isCollapsed ? 80 : 260 }}
      className="h-screen sticky top-0 bg-dark-bg border-r border-white/5 flex flex-col z-40 transition-all duration-300"
    >
      <div className="p-6 flex items-center justify-between">
        {!isCollapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-neon-blue to-neon-purple flex items-center justify-center">
              <span className="font-bold text-white">AI</span>
            </div>
            <h1 className="font-bold text-xl tracking-tight text-white">Africa Insight</h1>
          </motion.div>
        )}
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition-colors"
        >
          {isCollapsed ? <ChevronRight className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
              activeTab === item.id 
                ? "bg-white/10 text-white neon-border-blue" 
                : "text-slate-400 hover:text-white hover:bg-white/5"
            )}
          >
            <item.icon className={cn(
              "w-5 h-5 transition-colors",
              activeTab === item.id ? "text-neon-blue" : "group-hover:text-neon-blue"
            )} />
            {!isCollapsed && (
              <span className="font-medium text-sm">{item.label}</span>
            )}
            {activeTab === item.id && !isCollapsed && (
              <motion.div
                layoutId="active-pill"
                className="ml-auto w-1.5 h-1.5 rounded-full bg-neon-blue"
              />
            )}
          </button>
        ))}
      </nav>

      <div className="p-4">
        {!isCollapsed && (
          <div className="glass-morphism p-4 rounded-2xl border-white/5">
            <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-2">System Status</p>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-neon-green animate-pulse" />
              <span className="text-xs text-slate-300">AI Core Active</span>
            </div>
          </div>
        )}
      </div>
    </motion.aside>
  );
};
