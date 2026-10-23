import { useState, useRef } from 'react';
import { ArrowUpRight, X, Cpu, Layers, BarChart3, CheckCircle2, Workflow, ShieldCheck } from 'lucide-react';
import { SITE_CONFIG, ShowcaseProject } from '../config/siteConfig';
import ScrollReveal from './ScrollReveal';

export default function ProjectShowcase() {
  const [selectedCategory, setSelectedCategory] = useState<'All' | 'AI' | 'Web' | 'Automation'>('All');
  const [activeModalProject, setActiveModalProject] = useState<ShowcaseProject | null>(null);
  const [activeModalTab, setActiveModalTab] = useState<'overview' | 'architecture' | 'capabilities'>('overview');

  const filteredProjects = SITE_CONFIG.projects.filter((project) => {
    if (selectedCategory === 'All') return true;
    return project.allCategories.includes(selectedCategory);
  });

  return (
    <section id="work" className="relative py-24 sm:py-32 bg-[#050711] border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <ScrollReveal>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
            <div className="max-w-2xl">
              <div className="text-xs font-mono font-medium tracking-widest text-[#8B5CF6] uppercase mb-3">
                Concept Systems & Prototypes
              </div>
              <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight mb-3">
                Made to Move Ideas Forward.
              </h2>
              <p className="text-base text-[#9CA3AF]">
                Architectural showcases demonstrating how we engineer intelligent software, immersive interfaces,
                and resilient business engines.
              </p>
            </div>

            {/* Category Filter Tabs */}
            <div className="flex items-center gap-1.5 p-1.5 rounded-xl bg-white/[0.04] border border-white/10 backdrop-blur-md self-start md:self-auto">
              {(['All', 'AI', 'Web', 'Automation'] as const).map((cat) => {
                const isActive = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer ${
                      isActive
                        ? 'bg-gradient-to-r from-[#8B5CF6] to-[#22D3EE] text-white shadow-md'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>
        </ScrollReveal>

        {/* Project Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {filteredProjects.map((project, index) => (
            <ScrollReveal key={project.id} delayMs={index * 120}>
              <div
                onClick={() => {
                  setActiveModalProject(project);
                  setActiveModalTab('overview');
                }}
                className="group cursor-pointer rounded-2xl overflow-hidden bg-white/[0.02] border border-white/10 hover:border-violet-500/50 hover:-translate-y-2 transition-all duration-300 flex flex-col justify-between shadow-[0_12px_35px_rgba(0,0,0,0.5)] hover:shadow-[0_16px_45px_rgba(139,92,246,0.22)]"
              >
                {/* Visual Preview Container */}
                <div className="relative aspect-video w-full overflow-hidden bg-slate-950">
                  <img
                    src={project.image}
                    alt={project.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />

                  {/* Fallback pattern */}
                  <div className="absolute inset-0 -z-10 flex items-center justify-center bg-gradient-to-br from-violet-950/40 to-cyan-950/40">
                    <Cpu className="w-12 h-12 text-violet-400/40" />
                  </div>

                  {/* Scrim Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#050711] via-transparent to-transparent opacity-80" />

                  {/* Concept Project Badge */}
                  <div className="absolute top-3.5 left-3.5 px-2.5 py-1 rounded-md text-[10px] font-mono font-semibold tracking-wider uppercase text-cyan-300 bg-[#050711]/85 backdrop-blur-md border border-cyan-500/30">
                    Concept Project
                  </div>

                  {/* Category Chip */}
                  <div className="absolute top-3.5 right-3.5 px-2.5 py-1 rounded-md text-[10px] font-medium text-gray-300 bg-white/10 backdrop-blur-md">
                    {project.category}
                  </div>
                </div>

                {/* Card Information */}
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-white group-hover:text-cyan-300 transition-colors mb-2 flex items-center justify-between">
                      <span>{project.title}</span>
                      <ArrowUpRight className="w-5 h-5 text-gray-500 group-hover:text-cyan-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-200" />
                    </h3>
                    <p className="text-xs text-[#9CA3AF] line-clamp-2 leading-relaxed mb-4">
                      {project.conceptSummary}
                    </p>
                  </div>

                  {/* Tech stack badges */}
                  <div className="pt-4 border-t border-white/5 flex flex-wrap gap-1.5">
                    {project.technologies.slice(0, 3).map((tech, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded text-[11px] font-mono text-gray-400 bg-white/[0.04]"
                      >
                        {tech}
                      </span>
                    ))}
                    {project.technologies.length > 3 && (
                      <span className="px-2 py-0.5 rounded text-[11px] font-mono text-cyan-400 bg-cyan-950/30">
                        +{project.technologies.length - 3}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>

      {/* Accessible Project Detail Modal */}
      {activeModalProject && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-lg animate-in fade-in duration-200"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl bg-[#090D1C] border border-violet-500/35 shadow-[0_20px_60px_rgba(0,0,0,0.85)] p-6 sm:p-8 text-left">
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setActiveModalProject(null)}
              className="absolute top-5 right-5 p-2 rounded-full text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 transition-colors z-20 cursor-pointer"
              aria-label="Close dialog"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div className="mb-6">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded text-xs font-mono font-medium tracking-wide text-cyan-400 bg-cyan-950/40 border border-cyan-500/25 mb-3">
                <span>Concept Project</span>
                <span>·</span>
                <span>{activeModalProject.category}</span>
              </div>
              <h2 id="modal-title" className="text-2xl sm:text-3xl font-extrabold text-white mb-2">
                {activeModalProject.title}
              </h2>
              <p className="text-sm text-gray-300 font-medium">
                {activeModalProject.subtitle}
              </p>
            </div>

            {/* Visual Preview */}
            <div className="relative aspect-video w-full rounded-xl overflow-hidden mb-6 border border-white/10 bg-slate-950">
              <img
                src={activeModalProject.image}
                alt={activeModalProject.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Modal Tabs Navigation */}
            <div className="flex items-center gap-2 border-b border-white/10 pb-3 mb-6 text-xs font-mono">
              <button
                type="button"
                onClick={() => setActiveModalTab('overview')}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  activeModalTab === 'overview'
                    ? 'bg-violet-600/30 text-cyan-300 border border-cyan-400/40'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Overview & Metrics
              </button>
              <button
                type="button"
                onClick={() => setActiveModalTab('architecture')}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  activeModalTab === 'architecture'
                    ? 'bg-violet-600/30 text-cyan-300 border border-cyan-400/40'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                System Architecture
              </button>
              <button
                type="button"
                onClick={() => setActiveModalTab('capabilities')}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  activeModalTab === 'capabilities'
                    ? 'bg-violet-600/30 text-cyan-300 border border-cyan-400/40'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Core Technologies
              </button>
            </div>

            {/* Tab 1: Overview */}
            {activeModalTab === 'overview' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                {/* Key Metrics Strip */}
                <div className="grid grid-cols-3 gap-4 p-4 rounded-xl bg-white/[0.03] border border-white/5 text-center">
                  {activeModalProject.metrics.map((m, idx) => (
                    <div key={idx}>
                      <div className="text-xl sm:text-2xl font-bold font-mono text-cyan-300 tabular-nums">
                        {m.value}
                      </div>
                      <div className="text-[11px] text-gray-400 mt-0.5">{m.label}</div>
                    </div>
                  ))}
                </div>

                <div className="space-y-4 text-xs sm:text-sm text-gray-300 leading-relaxed">
                  <div>
                    <h4 className="text-xs font-mono uppercase tracking-wider text-violet-400 mb-1.5">
                      The Challenge
                    </h4>
                    <p>{activeModalProject.challenge}</p>
                  </div>
                  <div>
                    <h4 className="text-xs font-mono uppercase tracking-wider text-cyan-400 mb-1.5">
                      The Engineered Solution
                    </h4>
                    <p>{activeModalProject.solution}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 2: Architecture */}
            {activeModalTab === 'architecture' && (
              <div className="space-y-4 text-xs sm:text-sm animate-in fade-in duration-200">
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10 space-y-3">
                  <div className="flex items-center gap-2 text-white font-semibold">
                    <Workflow className="w-4 h-4 text-cyan-400" />
                    <span>System Pipeline Topology</span>
                  </div>
                  <p className="text-gray-300 text-xs leading-relaxed">
                    Designed with an event-driven architecture that separates real-time ingestion, asynchronous batch
                    workers, and instant client hydration to guarantee reliable high availability under spikes.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <div className="p-3 rounded-lg bg-black/40 border border-white/5">
                      <div className="text-xs font-mono text-violet-300 mb-1">State Synchronizer</div>
                      <div className="text-[11px] text-gray-400">Low-latency WebSocket channel with automatic reconnect fallback.</div>
                    </div>
                    <div className="p-3 rounded-lg bg-black/40 border border-white/5">
                      <div className="text-xs font-mono text-cyan-300 mb-1">Telemetry Buffer</div>
                      <div className="text-[11px] text-gray-400">Buffered metric streaming for smooth 60fps chart rendering.</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 3: Capabilities & Tech */}
            {activeModalTab === 'capabilities' && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="flex flex-wrap gap-2 mb-4">
                  {activeModalProject.technologies.map((tech, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1.5 rounded-lg text-xs font-mono text-gray-200 bg-white/5 border border-white/10"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
                <div className="p-4 rounded-xl bg-violet-950/20 border border-violet-500/20 text-xs text-gray-300 space-y-2">
                  <div className="flex items-center gap-2 text-violet-300 font-semibold">
                    <ShieldCheck className="w-4 h-4 text-violet-400" />
                    <span>Production Readiness Standard</span>
                  </div>
                  <p>
                    Each concept prototype is engineered with production-ready type models, test harness specs,
                    and edge deployment blueprints ready to be ported into enterprise codebases.
                  </p>
                </div>
              </div>
            )}

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 pt-6 mt-6 border-t border-white/10">
              <button
                type="button"
                onClick={() => setActiveModalProject(null)}
                className="px-5 py-2.5 rounded-xl text-xs font-medium text-gray-300 hover:text-white bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
