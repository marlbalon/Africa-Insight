import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Sparkles, FileText, Download, RefreshCw } from 'lucide-react';
import { generateAIInsight } from '../services/geminiService';
import Markdown from 'react-markdown';

interface AIInsightsPanelProps {
  topic: string;
  data: any;
}

export const AIInsightsPanel: React.FC<AIInsightsPanelProps> = ({ topic, data }) => {
  const [insight, setInsight] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const fetchInsight = async () => {
    setIsLoading(true);
    const result = await generateAIInsight(topic, data);
    setInsight(result || 'No insights available.');
    setIsLoading(false);
  };

  useEffect(() => {
    fetchInsight();
  }, [topic]);

  return (
    <div className="glass-morphism rounded-2xl p-6 neon-border-purple h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-neon-purple/20 flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-neon-purple" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-bold text-white">AI Predictive Insights</h3>
              <span className="px-2 py-0.5 rounded-full bg-neon-blue/10 text-neon-blue text-[10px] font-black uppercase tracking-tighter border border-neon-blue/20">Real-time Search</span>
            </div>
            <p className="text-xs text-slate-400">Powered by Gemini 3.1 Flash & Google Search</p>
          </div>
        </div>
        <button 
          onClick={fetchInsight}
          disabled={isLoading}
          className="p-2 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition-colors disabled:opacity-50"
        >
          <RefreshCw className={cn("w-5 h-5", isLoading && "animate-spin")} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto min-h-[200px] bg-white/5 rounded-xl p-4 border border-white/5">
        {isLoading ? (
          <div className="h-full flex flex-col items-center justify-center gap-4 text-slate-400">
            <div className="w-12 h-12 border-4 border-neon-purple/20 border-t-neon-purple rounded-full animate-spin" />
            <p className="text-sm animate-pulse">Analyzing regional data patterns...</p>
          </div>
        ) : (
          <div className="markdown-body prose prose-invert prose-sm max-w-none">
            <Markdown>{insight}</Markdown>
          </div>
        )}
      </div>

      <div className="mt-6 flex gap-3">
        <button className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-neon-purple text-white font-bold hover:bg-neon-purple/80 transition-all shadow-lg shadow-neon-purple/20">
          <FileText className="w-4 h-4" />
          Full Report
        </button>
        <button className="px-4 py-3 rounded-xl bg-white/5 text-slate-300 hover:bg-white/10 transition-all border border-white/10">
          <Download className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

import { cn } from '../utils';
