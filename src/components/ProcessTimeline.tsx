import { useState } from 'react';
import { CheckCircle2, Clock } from 'lucide-react';
import { SITE_CONFIG } from '../config/siteConfig';
import ScrollReveal from './ScrollReveal';

export default function ProcessTimeline() {
  const [activeStep, setActiveStep] = useState(0);

  return (
    <section id="process" className="relative py-24 sm:py-32 bg-[#050711] overflow-hidden">
      {/* Background Lighting */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-gradient-to-r from-violet-600/10 via-cyan-500/10 to-blue-600/10 blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <ScrollReveal>
          <div className="max-w-2xl mb-16">
            <div className="text-xs font-mono font-medium tracking-widest text-[#22D3EE] uppercase mb-3">
              Our Methodology
            </div>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight mb-4">
              From First Idea to Real Impact.
            </h2>
            <p className="text-base sm:text-lg text-[#9CA3AF]">
              A disciplined, transparent delivery framework engineered to ship reliable software without ambiguity.
            </p>
          </div>
        </ScrollReveal>

        {/* Step Navigation Bar */}
        <ScrollReveal delayMs={100}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
            {SITE_CONFIG.process.map((step, idx) => {
              const isSelected = activeStep === idx;
              return (
                <button
                  key={step.number}
                  type="button"
                  onClick={() => setActiveStep(idx)}
                  className={`flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all duration-300 cursor-pointer ${
                    isSelected
                      ? 'bg-gradient-to-r from-violet-900/40 to-cyan-900/30 border-cyan-400/50 shadow-[0_0_20px_rgba(34,211,238,0.2)]'
                      : 'bg-white/[0.02] border-white/5 hover:border-white/15'
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded-lg font-mono text-xs font-bold flex items-center justify-center transition-colors ${
                      isSelected ? 'bg-cyan-400 text-[#050711]' : 'bg-white/10 text-gray-400'
                    }`}
                  >
                    {step.number}
                  </div>
                  <div>
                    <div className={`text-xs font-semibold ${isSelected ? 'text-white' : 'text-gray-400'}`}>
                      {step.title}
                    </div>
                    <div className="text-[10px] text-gray-500 font-mono">{step.timeframe}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </ScrollReveal>

        {/* Dynamic Connected Process Track */}
        <div className="relative">
          {/* Connecting Glow Rail Line */}
          <div className="hidden md:block absolute top-10 left-[6%] right-[6%] h-[2px] bg-white/10 z-0">
            <div
              className="h-full bg-gradient-to-r from-[#8B5CF6] via-[#22D3EE] to-[#3B82F6] transition-all duration-500 ease-out shadow-[0_0_12px_rgba(34,211,238,0.6)]"
              style={{
                width: `${((activeStep + 1) / SITE_CONFIG.process.length) * 100}%`,
              }}
            />
          </div>

          {/* Process Step Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative z-10">
            {SITE_CONFIG.process.map((step, idx) => {
              const isSelected = activeStep === idx;
              const isPast = idx < activeStep;

              return (
                <ScrollReveal key={step.number} delayMs={idx * 100}>
                  <div
                    onClick={() => setActiveStep(idx)}
                    className={`group cursor-pointer rounded-2xl p-6 transition-all duration-300 flex flex-col justify-between border ${
                      isSelected
                        ? 'bg-[#090D1C]/90 border-cyan-400/60 shadow-[0_10px_30px_rgba(34,211,238,0.15)] -translate-y-2'
                        : isPast
                        ? 'bg-[#050711]/70 border-violet-500/20 opacity-80'
                        : 'bg-[#050711]/50 border-white/5 hover:border-white/20'
                    }`}
                  >
                    <div>
                      {/* Step Indicator Beacon */}
                      <div className="flex items-center justify-between mb-6">
                        <div
                          className={`w-9 h-9 rounded-xl font-mono text-sm font-bold flex items-center justify-center transition-all ${
                            isSelected
                              ? 'bg-gradient-to-br from-[#8B5CF6] to-[#22D3EE] text-white shadow-[0_0_15px_rgba(34,211,238,0.5)] ring-2 ring-cyan-400'
                              : isPast
                              ? 'bg-violet-950 text-cyan-300 border border-violet-500/30'
                              : 'bg-white/5 text-gray-500 border border-white/5'
                          }`}
                        >
                          {step.number}
                        </div>

                        <div className="flex items-center gap-1.5 text-[11px] font-mono text-gray-400">
                          <Clock className="w-3.5 h-3.5 text-cyan-400/80" />
                          <span>{step.timeframe}</span>
                        </div>
                      </div>

                      {/* Step Title */}
                      <h3
                        className={`text-xl font-bold mb-3 transition-colors ${
                          isSelected ? 'text-white' : 'text-gray-300 group-hover:text-white'
                        }`}
                      >
                        {step.title}
                      </h3>

                      {/* Description */}
                      <p className="text-xs text-[#9CA3AF] leading-relaxed mb-6">
                        {step.description}
                      </p>
                    </div>

                    {/* Deliverables List */}
                    <div className="pt-4 border-t border-white/5 space-y-2">
                      <div className="text-[10px] font-mono uppercase tracking-wider text-gray-500">
                        Deliverables:
                      </div>
                      {step.deliverables.map((item, dIdx) => (
                        <div key={dIdx} className="flex items-start gap-2 text-xs text-gray-300">
                          <CheckCircle2
                            className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${
                              isSelected ? 'text-cyan-400' : 'text-gray-500'
                            }`}
                          />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </ScrollReveal>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
