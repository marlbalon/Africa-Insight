import React from 'react';
import { motion } from 'motion/react';
import { Globe, Shield, Zap, Users, ArrowRight } from 'lucide-react';

export const Home: React.FC<{ onExplore: () => void }> = ({ onExplore }) => {
  return (
    <div className="space-y-20 pb-20">
      {/* Hero Section */}
      <section className="relative h-[80vh] flex flex-col items-center justify-center text-center overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-neon-blue/20 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute top-1/3 left-1/4 w-[400px] h-[400px] bg-neon-purple/10 rounded-full blur-[100px]" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 max-w-4xl px-6"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-neon-blue text-sm font-bold mb-8">
            <Zap className="w-4 h-4" />
            Next-Gen AI Platform
          </div>
          <h1 className="text-6xl md:text-8xl font-black text-white tracking-tighter mb-6">
            Africa <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-blue via-neon-purple to-neon-green">Insight</span>
          </h1>
          <p className="text-xl md:text-2xl text-slate-400 font-medium mb-10 max-w-2xl mx-auto leading-relaxed">
            Harnessing Artificial Intelligence and real-time data to solve Africa's most pressing challenges in health, agriculture, and infrastructure.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={onExplore}
              className="px-8 py-4 rounded-2xl bg-neon-blue text-dark-bg font-black text-lg hover:bg-white transition-all shadow-xl shadow-neon-blue/20 flex items-center justify-center gap-2"
            >
              Explore Insights
              <ArrowRight className="w-5 h-5" />
            </button>
            <button className="px-8 py-4 rounded-2xl bg-white/5 text-white font-bold text-lg hover:bg-white/10 transition-all border border-white/10">
              View Reports
            </button>
          </div>
        </motion.div>
      </section>

      {/* Features Grid */}
      <section className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {[
          { icon: Shield, title: 'Health Security', desc: 'Predicting and tracking disease outbreaks with AI heatmaps.', color: 'blue' },
          { icon: Globe, title: 'Smart Agri', desc: 'Optimizing crop yields through satellite data and AI monitoring.', color: 'green' },
          { icon: Users, title: 'Education', desc: 'Mapping accessibility and suggesting literacy improvement strategies.', color: 'purple' },
          { icon: Zap, title: 'Infrastructure', desc: 'Planning sustainable water and energy solutions for remote regions.', color: 'blue' },
        ].map((feat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="glass-morphism p-8 rounded-3xl border-white/5 hover:border-white/20 transition-all group"
          >
            <div className={cn(
              "w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110",
              feat.color === 'blue' ? "bg-neon-blue/20 text-neon-blue" : 
              feat.color === 'green' ? "bg-neon-green/20 text-neon-green" : "bg-neon-purple/20 text-neon-purple"
            )}>
              <feat.icon className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">{feat.title}</h3>
            <p className="text-slate-400 text-sm leading-relaxed">{feat.desc}</p>
          </motion.div>
        ))}
      </section>

      {/* Fact of the Day */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="glass-morphism p-10 rounded-[40px] border-neon-green/20 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-neon-green/10 blur-[80px] -mr-32 -mt-32" />
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
            <div className="flex-1">
              <span className="text-neon-green font-black uppercase tracking-widest text-xs mb-4 block">Fact of the Day</span>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Digital connectivity in Sub-Saharan Africa has grown by 25% annually since 2020.</h2>
              <p className="text-slate-400 leading-relaxed">Our AI models suggest that with targeted infrastructure investment in rural hubs, literacy rates could increase by 15% within the next 36 months.</p>
            </div>
            <div className="w-full md:w-1/3 aspect-square glass-morphism rounded-3xl border-white/10 flex items-center justify-center">
              <div className="text-center">
                <span className="text-6xl font-black text-neon-green">+25%</span>
                <p className="text-slate-500 font-bold mt-2 uppercase tracking-tighter">Growth Rate</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

import { cn } from '../utils';
