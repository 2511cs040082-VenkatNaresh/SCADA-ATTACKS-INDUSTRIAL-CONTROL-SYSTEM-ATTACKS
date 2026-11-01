import React, { useState } from 'react';
import { FEATURES_DATA, FeatureItem } from '../data/featuresData';
import { Shield, ChevronDown, ChevronUp, Terminal, Layers, CheckCircle2, Filter } from 'lucide-react';

export const Features: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const categories = ['ALL', 'MONITORING', 'DETECTION', 'RESPONSE', 'SIMULATION', 'OPERATIONS'];

  const filteredFeatures = selectedCategory === 'ALL'
    ? FEATURES_DATA
    : FEATURES_DATA.filter((f) => f.category === selectedCategory);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <section id="features" className="py-20 bg-navy-950 border-t border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-800/40">
            Verified Subsystems
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white font-mono">
            16 Fully Integrated Defensive Modules
          </h2>
          <p className="text-sm sm:text-base text-slate-300 font-sans leading-relaxed">
            Every module listed below is verified and operational within the ICS-SHIELD repository. No placeholders or conceptual prototypes.
          </p>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap items-center justify-center gap-2 font-mono text-xs">
          <div className="flex items-center space-x-1 text-slate-400 mr-2">
            <Filter className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Filter By:</span>
          </div>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg border transition-all ${
                selectedCategory === cat
                  ? 'bg-cyan-950 text-cyan-300 border-cyan-700 font-bold shadow-sm'
                  : 'bg-navy-900 text-slate-400 border-slate-800 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Features 16-Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredFeatures.map((feat) => {
            const isExpanded = expandedId === feat.id;

            return (
              <div
                key={feat.id}
                className={`p-5 rounded-xl border transition-all flex flex-col justify-between ${
                  isExpanded
                    ? 'bg-navy-900 border-cyan-500/60 shadow-lg shadow-cyan-950/30'
                    : 'bg-navy-900/80 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="space-y-3">
                  {/* Top Bar: Number & Category Badge */}
                  <div className="flex items-center justify-between">
                    <span className="w-6 h-6 rounded bg-navy-950 border border-slate-700 text-cyan-400 font-mono font-bold text-xs flex items-center justify-center">
                      {String(feat.number).padStart(2, '0')}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded uppercase font-semibold bg-navy-950 text-slate-400 border border-slate-800">
                      {feat.category}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="font-bold text-sm sm:text-base text-slate-100 font-sans leading-snug">
                    {feat.title}
                  </h3>

                  {/* Short Description */}
                  <p className="text-xs text-slate-300 leading-relaxed font-sans">
                    {feat.shortDesc}
                  </p>

                  {/* Protocols Pill Badges */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {feat.protocols.map((proto, pidx) => (
                      <span
                        key={pidx}
                        className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-950 text-cyan-300 border border-slate-800"
                      >
                        {proto}
                      </span>
                    ))}
                  </div>

                  {/* Expanded Technical View */}
                  {isExpanded && (
                    <div className="pt-3 border-t border-slate-800 space-y-2 text-xs font-sans">
                      <p className="text-slate-300 text-[11px] leading-relaxed">
                        {feat.fullDesc}
                      </p>

                      <div className="space-y-1 pt-1 font-mono text-[10px]">
                        <span className="text-slate-400 font-semibold block uppercase">Key Capabilities:</span>
                        <ul className="space-y-1 text-slate-300">
                          {feat.keyCapabilities.map((cap, cidx) => (
                            <li key={cidx} className="flex items-start space-x-1.5">
                              <CheckCircle2 className="w-3 h-3 text-cyan-400 shrink-0 mt-0.5" />
                              <span className="font-sans text-[11px]">{cap}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="pt-2 text-[10px] font-mono text-slate-400 truncate">
                        <span className="text-cyan-400">Source:</span> {feat.modulePath}
                      </div>
                    </div>
                  )}
                </div>

                {/* Card Toggle Button */}
                <button
                  onClick={() => toggleExpand(feat.id)}
                  className="mt-4 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-cyan-400 hover:text-cyan-300 transition-colors w-full"
                >
                  <span>{isExpanded ? 'Hide Specifications' : 'Technical Specs'}</span>
                  {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
