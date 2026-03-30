import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Mail, MessageSquare, Send, MapPin, Phone, CheckCircle } from 'lucide-react';

export const ContactPage: React.FC = () => {
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
  };

  return (
    <div className="p-8 max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
      <div className="space-y-8">
        <div>
          <h2 className="text-5xl font-black text-white tracking-tight mb-4">Get in Touch</h2>
          <p className="text-xl text-slate-400 leading-relaxed">
            Have questions about our data or want to partner with us? Our team is ready to assist.
          </p>
        </div>

        <div className="space-y-6">
          {[
            { icon: Mail, label: 'Email', value: 'contact@africainsight.ai' },
            { icon: Phone, label: 'Phone', value: '+254 700 000 000' },
            { icon: MapPin, label: 'Headquarters', value: 'Nairobi, Kenya' },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5">
              <div className="w-12 h-12 rounded-xl bg-neon-blue/10 flex items-center justify-center text-neon-blue">
                <item.icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">{item.label}</p>
                <p className="text-lg font-medium text-white">{item.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="glass-morphism p-8 rounded-[40px] border-neon-blue/20 relative">
        {isSubmitted ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="h-[400px] flex flex-col items-center justify-center text-center gap-6"
          >
            <div className="w-20 h-20 rounded-full bg-neon-green/20 flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-neon-green" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white mb-2">Message Sent!</h3>
              <p className="text-slate-400">Thank you for reaching out. We'll get back to you within 24 hours.</p>
            </div>
            <button 
              onClick={() => setIsSubmitted(false)}
              className="px-6 py-3 rounded-xl bg-white/5 text-white font-bold hover:bg-white/10 transition-all border border-white/10"
            >
              Send Another
            </button>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-400 ml-1">Full Name</label>
                <input 
                  required
                  type="text" 
                  placeholder="John Doe"
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-neon-blue transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-400 ml-1">Email Address</label>
                <input 
                  required
                  type="email" 
                  placeholder="john@example.com"
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-neon-blue transition-all"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-400 ml-1">Subject</label>
              <select className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-neon-blue transition-all">
                <option>General Inquiry</option>
                <option>Partnership Proposal</option>
                <option>Data Access Request</option>
                <option>Technical Support</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-400 ml-1">Message</label>
              <textarea 
                required
                rows={5}
                placeholder="How can we help you?"
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-neon-blue transition-all resize-none"
              />
            </div>
            <button 
              type="submit"
              className="w-full py-4 rounded-2xl bg-neon-blue text-dark-bg font-black text-lg hover:bg-white transition-all shadow-xl shadow-neon-blue/20 flex items-center justify-center gap-2"
            >
              Send Message
              <Send className="w-5 h-5" />
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
