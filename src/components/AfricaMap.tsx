import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { feature } from 'topojson-client';
import { motion, AnimatePresence } from 'motion/react';
import { Info, Maximize2, Minimize2 } from 'lucide-react';
import { cn } from '../utils';

interface AfricaMapProps {
  data: any[];
  onRegionClick?: (region: any) => void;
  colorScale?: (val: number) => string;
  title?: string;
}

export const AfricaMap: React.FC<AfricaMapProps> = ({ data, onRegionClick, colorScale, title }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredRegion, setHoveredRegion] = useState<any>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!svgRef.current) return;

    const width = 800;
    const height = 800;
    const svg = d3.select(svgRef.current)
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('preserveAspectRatio', 'xMidYMid meet');

    svg.selectAll('*').remove();

    const projection = d3.geoMercator()
      .scale(450)
      .translate([width / 2 - 100, height / 2 + 50]);

    const path = d3.geoPath().projection(projection);

    setIsLoading(true);
    d3.json('https://raw.githubusercontent.com/codeforgermany/click_that_hood/master/public/data/africa.geojson')
      .then((geoData: any) => {
        setIsLoading(false);
        const g = svg.append('g');

        g.selectAll('path')
          .data(geoData.features)
          .enter()
          .append('path')
          .attr('d', path as any)
          .attr('fill', (d: any) => {
            const regionData = data.find(item => item.id === d.properties.name || item.name === d.properties.name);
            return regionData ? (colorScale ? colorScale(regionData.value) : '#1e293b') : '#1e293b';
          })
          .attr('stroke', '#0f172a')
          .attr('stroke-width', 0.5)
          .attr('class', 'cursor-pointer transition-all duration-300 hover:stroke-neon-blue hover:stroke-2')
          .on('mouseover', (event, d: any) => {
            const regionData = data.find(item => item.id === d.properties.name || item.name === d.properties.name);
            setHoveredRegion({ ...d.properties, ...regionData });
            
            const [x, y] = d3.pointer(event, containerRef.current);
            setTooltipPos({ x, y });
            d3.select(event.currentTarget).attr('fill-opacity', 0.8);
          })
          .on('mousemove', (event) => {
            const [x, y] = d3.pointer(event, containerRef.current);
            setTooltipPos({ x, y });
          })
          .on('mouseout', (event) => {
            setHoveredRegion(null);
            d3.select(event.currentTarget).attr('fill-opacity', 1);
          })
          .on('click', (event, d: any) => {
            if (onRegionClick) onRegionClick(d.properties);
          });
      })
      .catch(err => {
        console.error("Error loading map:", err);
        setIsLoading(false);
      });

  }, [data, colorScale]);

  return (
    <div ref={containerRef} className="relative w-full h-full min-h-[500px] glass-morphism rounded-2xl overflow-hidden neon-border-blue">
      <div className="absolute top-4 left-6 z-10">
        <h3 className="text-xl font-bold text-white glow-text-blue">{title || 'Regional Analysis'}</h3>
        <p className="text-xs text-slate-400">Interactive Map Layer</p>
      </div>
      
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-dark-bg/50 backdrop-blur-sm z-20">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-neon-blue/20 border-t-neon-blue rounded-full animate-spin" />
            <p className="text-sm text-neon-blue font-bold animate-pulse">Loading Map Data...</p>
          </div>
        </div>
      )}

      <svg ref={svgRef} className="w-full h-full" />

      <AnimatePresence>
        {hoveredRegion && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            style={{ 
              left: tooltipPos.x + 20, 
              top: tooltipPos.y - 100,
              position: 'absolute'
            }}
            className="z-50 pointer-events-none glass-morphism p-4 rounded-xl border-neon-blue/50 min-w-[200px] shadow-2xl"
          >
            <h4 className="font-bold text-neon-blue text-lg">{hoveredRegion.name}</h4>
            <div className="mt-2 space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Value:</span>
                <span className="text-white font-mono">{hoveredRegion.value !== undefined ? hoveredRegion.value : 'N/A'}</span>
              </div>
              {hoveredRegion.trend && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Trend:</span>
                  <span className={cn(
                    "font-bold",
                    hoveredRegion.trend === 'up' ? "text-red-400" : "text-green-400"
                  )}>
                    {hoveredRegion.trend === 'up' ? '↑ Increasing' : '↓ Decreasing'}
                  </span>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="absolute bottom-4 right-4 flex gap-2">
        <button className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
          <Maximize2 className="w-4 h-4 text-slate-400" />
        </button>
      </div>
    </div>
  );
};
