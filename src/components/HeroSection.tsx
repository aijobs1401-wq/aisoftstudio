import { useState, useEffect } from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import AIOrb from './AIOrb';
import ScrollReveal from './ScrollReveal';
import { SITE_CONFIG } from '../config/siteConfig';

interface HeroSectionProps {
  onStartProject: () => void;
  onExploreWork: () => void;
}

export default function HeroSection({ onStartProject, onExploreWork }: HeroSectionProps) {
  const [cursorGlow, setCursorGlow] = useState({ x: -500, y: -500 });

  useEffect(() => {
    const handlePointerMove = (e: MouseEvent) => {
      setCursorGlow({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handlePointerMove, { passive: true });
    return () => window.removeEventListener('mousemove', handlePointerMove);
  }, []);

  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center justify-center pt-24 pb-16 lg:pt-32 lg:pb-24 overflow-hidden"
    >
      {/* Soft Interactive Cursor-Following Glow (Desktop Only, Pointer-Events None) */}
      <div
        className="hidden lg:block fixed w-[440px] h-[440px] -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none z-0 opacity-25 blur-3xl transition-transform duration-75 ease-out"
        style={{
          left: `${cursorGlow.x}px`,
          top: `${cursorGlow.y}px`,
          background:
            'radial-gradient(circle, rgba(139, 92, 246, 0.45) 0%, rgba(34, 211, 238, 0.25) 45%, transparent 75%)',
        }}
        aria-hidden="true"
      />

      {/* Cyber Grid & Ambient Lighting Background */}
      <div className="absolute inset-0 bg-cyber-grid opacity-30 pointer-events-none" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-gradient-to-br from-[#8B5CF6]/15 via-[#22D3EE]/10 to-transparent blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Hero Typography & CTAs */}
          <div className="lg:col-span-7 text-center lg:text-left flex flex-col items-center lg:items-start">
            <ScrollReveal delayMs={100}>
              {/* Availability Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium tracking-wide text-cyan-300 bg-cyan-950/40 border border-cyan-500/25 backdrop-blur-md mb-6 shadow-[0_0_15px_rgba(34,211,238,0.2)]">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping inline-block" />
                <span className="text-[11px] font-mono tracking-wider">
                  {SITE_CONFIG.brand.availabilityBadge}
                </span>
              </div>
            </ScrollReveal>

            {/* Main Headline */}
            <ScrollReveal delayMs={200}>
              <h1 className="text-4xl sm:text-6xl xl:text-7xl font-extrabold tracking-tight text-white leading-[1.08] mb-6 text-balance">
                We Build{' '}
                <span className="bg-gradient-to-r from-white via-cyan-200 to-[#8B5CF6] bg-clip-text text-transparent">
                  What’s Next.
                </span>
              </h1>
            </ScrollReveal>

            {/* Supporting Subtitle */}
            <ScrollReveal delayMs={300}>
              <p className="text-base sm:text-xl text-[#9CA3AF] max-w-xl leading-relaxed mb-9">
                AI-powered experiences, intelligent automation, and digital products engineered to move
                your business forward.
              </p>
            </ScrollReveal>

            {/* CTAs */}
            <ScrollReveal delayMs={400}>
              <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={onStartProject}
                  className="w-full sm:w-auto group relative inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-full text-sm font-semibold text-white bg-gradient-to-r from-[#8B5CF6] via-[#6366F1] to-[#22D3EE] hover:opacity-95 shadow-[0_0_30px_rgba(139,92,246,0.4)] hover:shadow-[0_0_40px_rgba(34,211,238,0.6)] transition-all duration-300 active:scale-[0.98] cursor-pointer"
                >
                  <span>Start a Project</span>
                  <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
                </button>

                <button
                  type="button"
                  onClick={onExploreWork}
                  className="w-full sm:w-auto group inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full text-sm font-semibold text-gray-200 hover:text-white bg-white/[0.04] hover:bg-white/[0.09] border border-white/10 hover:border-cyan-400/40 backdrop-blur-md transition-all duration-300 active:scale-[0.98] cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-cyan-400 transition-transform duration-200 group-hover:rotate-12" />
                  <span>Explore Our Work</span>
                </button>
              </div>
            </ScrollReveal>

            {/* Proof Metric Strips */}
            <ScrollReveal delayMs={500} className="w-full max-w-md">
              <div className="mt-12 pt-8 border-t border-white/10 grid grid-cols-3 gap-6 text-left w-full">
                <div>
                  <div className="text-2xl sm:text-3xl font-bold font-mono tracking-tight text-white tabular-nums">
                    100<span className="text-violet-400">%</span>
                  </div>
                  <div className="text-xs text-gray-400 mt-0.5">Production Grade</div>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-bold font-mono tracking-tight text-white tabular-nums">
                    &lt;200<span className="text-cyan-400">ms</span>
                  </div>
                  <div className="text-xs text-gray-400 mt-0.5">Edge Latency</div>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-bold font-mono tracking-tight text-white tabular-nums">
                    24<span className="text-blue-400">/7</span>
                  </div>
                  <div className="text-xs text-gray-400 mt-0.5">Autonomous Ops</div>
                </div>
              </div>
            </ScrollReveal>
          </div>

          {/* Right Column: Interactive 3D AI Core */}
          <div className="lg:col-span-5 flex items-center justify-center">
            <AIOrb onStartProject={onStartProject} onExploreWork={onExploreWork} />
          </div>
        </div>
      </div>
    </section>
  );
}
