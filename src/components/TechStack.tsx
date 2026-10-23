import { useState } from 'react';
import { SITE_CONFIG } from '../config/siteConfig';
import ScrollReveal from './ScrollReveal';

export default function TechStack() {
  const [activeCategory, setActiveCategory] = useState<string>('All');

  const categories = ['All', 'Frontend', 'Backend & Cloud', 'AI & ML', 'Automation'];

  const filteredTech = SITE_CONFIG.techStack.filter((tech) => {
    if (activeCategory === 'All') return true;
    return tech.category === activeCategory;
  });

  return (
    <section id="tech" className="relative py-24 bg-[#050711] border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <ScrollReveal>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div className="max-w-xl">
              <div className="text-xs font-mono font-medium tracking-widest text-[#22D3EE] uppercase mb-3">
                Stack & Tooling
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight mb-3">
                Modern Technology Ecosystem.
              </h2>
              <p className="text-sm sm:text-base text-[#9CA3AF]">
                We build with modern, resilient industry standards chosen for speed, scalability, and long-term maintainability.
              </p>
            </div>

            {/* Category Tabs */}
            <div className="flex flex-wrap items-center gap-1.5 p-1.5 rounded-xl bg-white/[0.03] border border-white/10 self-start md:self-auto">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                    activeCategory === cat
                      ? 'bg-gradient-to-r from-violet-600 to-cyan-500 text-white font-semibold shadow-sm'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </ScrollReveal>

        {/* Tech Grid with Staggered Reveals */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredTech.map((tech, idx) => (
            <ScrollReveal key={tech.name} delayMs={idx * 60}>
              <div className="group p-5 rounded-xl bg-white/[0.02] border border-white/5 hover:border-cyan-400/35 hover:bg-white/[0.04] transition-all duration-300 h-full">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono text-cyan-400/80 tracking-wide">
                    {tech.category}
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-400 opacity-60 group-hover:opacity-100 transition-opacity" />
                </div>
                <h3 className="text-base font-bold text-white mb-1.5 group-hover:text-cyan-200 transition-colors">
                  {tech.name}
                </h3>
                <p className="text-xs text-[#9CA3AF] leading-relaxed">
                  {tech.description}
                </p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
