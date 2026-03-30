import React, { useState } from 'react';
import { motion } from 'motion/react';
import { AfricaMap } from '../components/AfricaMap';
import { Layers, MapPin, Eye, Download, Share2, Info } from 'lucide-react';
import { cn } from '../utils';

import { AFRICAN_COUNTRIES } from '../constants';

const generateLayerData = (layerId: string) => {
  return AFRICAN_COUNTRIES.map((country) => {
    const seed = (country + layerId).split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const value = 20 + (seed % 75);
    const trend = value > 70 ? 'up' : value < 40 ? 'down' : 'stable';
    return { id: country, value, trend };
  });
};

interface InteractiveMapsProps {
  searchQuery?: string;
  userLocality?: string;
  viewPreference?: 'country' | 'africa';
}

export const InteractiveMaps: React.FC<InteractiveMapsProps> = ({ 
  searchQuery = '',
  userLocality = '',
  viewPreference = 'africa'
}) => {
  const mapLayers = React.useMemo(() => [
    { id: 'health', label: 'Health Risk', color: 'blue', data: generateLayerData('health') },
    { id: 'agri', label: 'Crop Health', color: 'green', data: generateLayerData('agri') },
    { id: 'edu', label: 'Education Access', color: 'purple', data: generateLayerData('edu') },
    { id: 'infra', label: 'Infrastructure', color: 'blue', data: generateLayerData('infra') },
  ], []);

  const [activeLayer, setActiveLayer] = useState(mapLayers[0]);

  const filteredData = React.useMemo(() => {
    let data = activeLayer.data;
    if (viewPreference === 'country' && userLocality) {
      data = data.filter(item => item.id === userLocality);
    }
    if (!searchQuery) return data;
    return data.filter(item => 
      item.id.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [activeLayer, searchQuery, viewPreference, userLocality]);

  const getColorScale = (layerId: string) => {
    return (val: number) => {
      if (layerId === 'health') {
        if (val > 80) return '#ef4444';
        if (val > 50) return '#f97316';
        return '#22c55e';
      }
      if (layerId === 'agri') {
        if (val > 80) return '#39ff14';
        if (val > 50) return '#16a34a';
        return '#14532d';
      }
      if (layerId === 'edu') {
        if (val > 80) return '#bc13fe';
        if (val > 50) return '#a855f7';
        return '#581c87';
      }
      return '#00f3ff';
    };
  };

  return (
    <div className="p-8 space-y-8 h-full flex flex-col">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-4xl font-black text-white tracking-tight">
            {viewPreference === 'country' ? `${userLocality} Interactive Map` : 'Interactive Maps'}
          </h2>
          <p className="text-slate-400">
            {viewPreference === 'country' 
              ? `Multi-layer analysis focused on ${userLocality}.`
              : 'Multi-layer regional analysis with real-time data overlays.'}
          </p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:text-white transition-all">
            <Download className="w-4 h-4" />
            Export Map
          </button>
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:text-white transition-all">
            <Share2 className="w-4 h-4" />
            Share
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 flex-1">
        <div className="space-y-6">
          <div className="glass-morphism p-6 rounded-2xl border-white/5">
            <div className="flex items-center gap-2 mb-6">
              <Layers className="w-5 h-5 text-neon-blue" />
              <h3 className="font-bold text-white">Map Layers</h3>
            </div>
            <div className="space-y-2">
              {mapLayers.map((layer) => (
                <button
                  key={layer.id}
                  onClick={() => setActiveLayer(layer)}
                  className={cn(
                    "w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all",
                    activeLayer.id === layer.id 
                      ? "bg-neon-blue/10 text-neon-blue border border-neon-blue/30" 
                      : "text-slate-400 hover:text-white hover:bg-white/5"
                  )}
                >
                  <span className="text-sm font-bold">{layer.label}</span>
                  {activeLayer.id === layer.id && <Eye className="w-4 h-4" />}
                </button>
              ))}
            </div>
          </div>

          <div className="glass-morphism p-6 rounded-2xl border-white/5">
            <div className="flex items-center gap-2 mb-4">
              <Info className="w-5 h-5 text-slate-400" />
              <h3 className="font-bold text-white">Legend</h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded bg-red-500" />
                <span className="text-xs text-slate-400">High Risk / Critical</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded bg-orange-500" />
                <span className="text-xs text-slate-400">Medium Risk / Developing</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded bg-green-500" />
                <span className="text-xs text-slate-400">Low Risk / Stable</span>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-3 h-[600px]">
          <AfricaMap 
            data={filteredData} 
            title={activeLayer.label}
            colorScale={getColorScale(activeLayer.id)}
          />
        </div>
      </div>
    </div>
  );
};
