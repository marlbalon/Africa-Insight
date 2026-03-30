import React from 'react';
import { motion } from 'motion/react';
import { Shield, Target, Zap, Globe, Github, Twitter, Linkedin } from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="p-8 max-w-5xl mx-auto space-y-20 pb-20">
      <section className="text-center space-y-6">
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-5xl font-black text-white tracking-tight"
        >
          Our Mission
        </motion.h2>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-xl text-slate-400 leading-relaxed max-w-3xl mx-auto"
        >
          Africa Insight is dedicated to empowering decision-makers across the continent with 
          AI-driven data visualization. We believe that by making complex data accessible and 
          predictive, we can accelerate solutions for Africa's most critical challenges.
        </motion.p>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { icon: Shield, title: 'Data Integrity', desc: 'We source data from verified global partners like WHO and the World Bank.' },
          { icon: Target, title: 'AI Precision', desc: 'Our models use state-of-the-art machine learning to predict trends with 90%+ accuracy.' },
          { icon: Zap, title: 'Real-time Impact', desc: 'Our dashboards update continuously to provide actionable insights for field workers.' },
        ].map((item, i) => (
          <div key={i} className="glass-morphism p-8 rounded-3xl border-white/5 text-center">
            <div className="w-16 h-16 rounded-2xl bg-neon-blue/10 flex items-center justify-center mx-auto mb-6">
              <item.icon className="w-8 h-8 text-neon-blue" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">{item.title}</h3>
            <p className="text-slate-400 text-sm leading-relaxed">{item.desc}</p>
          </div>
        ))}
      </section>

      <section className="glass-morphism p-10 rounded-[40px] border-white/5 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-neon-blue/5 via-transparent to-neon-purple/5" />
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h3 className="text-3xl font-bold text-white mb-6">Technology Stack</h3>
            <div className="grid grid-cols-2 gap-4">
              {[
                'React 19', 'Tailwind CSS 4', 'D3.js', 'Recharts', 'Gemini 3.1 AI', 'Framer Motion'
              ].map((tech, i) => (
                <div key={i} className="flex items-center gap-2 text-slate-300">
                  <div className="w-1.5 h-1.5 rounded-full bg-neon-blue" />
                  <span className="text-sm font-medium">{tech}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-6">
            <h3 className="text-3xl font-bold text-white">Global Impact</h3>
            <p className="text-slate-400 leading-relaxed">
              Since our launch, Africa Insight has been used by 12 NGOs and 4 government agencies 
               to optimize resource allocation in health and agriculture.
            </p>
            <div className="flex gap-4">
              <button className="p-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all">
                <Twitter className="w-5 h-5" />
              </button>
              <button className="p-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all">
                <Linkedin className="w-5 h-5" />
              </button>
              <button className="p-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all">
                <Github className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
