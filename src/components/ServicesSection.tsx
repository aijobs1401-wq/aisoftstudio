import React, { useState, useEffect, useRef } from 'react';
import { ArrowUpRight, CheckCircle2, Cpu, Globe, Smartphone, Zap, Cloud, Palette } from 'lucide-react';
import { SITE_CONFIG, ServiceItem } from '../config/siteConfig';
import { getServices } from '../lib/dbService';
import ScrollReveal from './ScrollReveal';

interface ServicesSectionProps {
  onSelectService: (serviceTitle: string) => void;
}

interface ServiceCardProps {
  service: ServiceItem;
  index: number;
  onSelect: () => void;
}

function ServiceCard({ service, index, onSelect }: ServiceCardProps) {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Set CSS variables for cursor spotlight inside card
    card.style.setProperty('--mouse-x', `${x}px`);
    card.style.setProperty('--mouse-y', `${y}px`);

    // Subtle 3D tilt math
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const tiltX = -((y - centerY) / centerY) * 7;
    const tiltY = ((x - centerX) / centerX) * 7;
    setTilt({ x: tiltX, y: tiltY });
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setTilt({ x: 0, y: 0 });
  };

  const renderCardIcon = (type: ServiceItem['iconType']) => {
    switch (type) {
      case 'ai':
        return <Cpu className="w-5 h-5 text-violet-400" />;
      case 'web':
        return <Globe className="w-5 h-5 text-cyan-400" />;
      case 'mobile':
        return <Smartphone className="w-5 h-5 text-blue-400" />;
      case 'automation':
        return <Zap className="w-5 h-5 text-fuchsia-400" />;
      case 'cloud':
        return <Cloud className="w-5 h-5 text-indigo-400" />;
      case 'design':
        return <Palette className="w-5 h-5 text-purple-400" />;
    }
  };

  // Small animated decorative micro-visual inside each card
  const renderCardMicroVisual = (type: ServiceItem['iconType']) => {
    switch (type) {
      case 'ai':
        return (
          <div className="relative w-16 h-8 flex items-center justify-center">
            <div className="absolute w-2 h-2 rounded-full bg-violet-400 animate-ping opacity-75" />
            <div className="w-8 h-[2px] bg-gradient-to-r from-violet-500 via-cyan-400 to-transparent" />
            <div className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#22D3EE]" />
          </div>
        );
      case 'web':
        return (
          <div className="relative w-16 h-8 flex items-center justify-end">
            <div className="w-12 h-6 rounded border border-cyan-500/30 bg-cyan-950/20 p-1 flex flex-col justify-between">
              <div className="w-full h-1 bg-cyan-400/40 rounded-full animate-pulse" />
              <div className="w-2/3 h-1 bg-violet-400/40 rounded-full" />
            </div>
          </div>
        );
      case 'mobile':
        return (
          <div className="relative w-16 h-8 flex items-center justify-end">
            <div className="w-5 h-7 rounded border border-blue-500/30 bg-blue-950/20 p-0.5 flex flex-col justify-between items-center">
              <div className="w-2 h-0.5 bg-blue-400/50 rounded-full" />
              <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-ping" />
              <div className="w-1 h-0.5 bg-blue-400/50 rounded-full" />
            </div>
          </div>
        );
      case 'automation':
        return (
          <div className="relative w-16 h-8 flex items-center justify-end">
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-fuchsia-400 animate-pulse" />
              <span className="text-[10px] text-fuchsia-400 font-mono">→</span>
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse [animation-delay:300ms]" />
              <span className="text-[10px] text-cyan-400 font-mono">→</span>
              <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse [animation-delay:600ms]" />
            </div>
          </div>
        );
      case 'cloud':
        return (
          <div className="relative w-16 h-8 flex items-center justify-end">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded bg-indigo-500/20 border border-indigo-400/40 animate-bounce [animation-duration:3s]" />
              <div className="w-3 h-3 rounded bg-cyan-500/20 border border-cyan-400/40 animate-bounce [animation-duration:2.5s]" />
            </div>
          </div>
        );
      case 'design':
        return (
          <div className="relative w-16 h-8 flex items-center justify-end">
            <div className="w-7 h-7 rounded-full border border-dashed border-purple-400/40 flex items-center justify-center animate-spin [animation-duration:12s]">
              <div className="w-2 h-2 rounded-full bg-purple-400" />
            </div>
          </div>
        );
    }
  };

  return (
    <ScrollReveal delayMs={index * 90}>
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={handleMouseLeave}
        style={{
          transform: isHovered
            ? `perspective(800px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) translateY(-6px)`
            : 'perspective(800px) rotateX(0deg) rotateY(0deg) translateY(0px)',
          transition: isHovered ? 'transform 0.1s ease-out' : 'transform 0.4s ease-out',
        }}
        className={`card-spotlight group relative rounded-2xl p-7 bg-[#050711]/85 backdrop-blur-md border transition-colors duration-300 flex flex-col justify-between min-h-[340px] ${
          isHovered
            ? 'border-violet-400/60 shadow-[0_15px_35px_rgba(139,92,246,0.2)]'
            : 'border-white/10 hover:border-violet-500/30'
        }`}
      >
        {/* Animated Gradient Edge */}
        <div
          className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${service.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`}
        />

        <div className="relative z-10">
          {/* Card Top Strip with Icon and Micro-Visual */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-white/[0.04] border border-white/10 group-hover:border-violet-400/40 transition-colors">
                {renderCardIcon(service.iconType)}
              </div>
              <span className="text-xs font-mono font-semibold text-gray-500 group-hover:text-cyan-400 transition-colors">
                {service.number}
              </span>
            </div>
            {renderCardMicroVisual(service.iconType)}
          </div>

          {/* Title */}
          <h3 className="text-xl font-bold text-white mb-2.5 group-hover:text-cyan-200 transition-colors">
            {service.title}
          </h3>

          {/* Description */}
          <p className="text-xs sm:text-sm text-[#9CA3AF] leading-relaxed mb-6">
            {service.description}
          </p>

          {/* Highlights */}
          <div className="space-y-2 border-t border-white/5 pt-5">
            {service.highlights.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2 text-xs text-gray-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400/80 shrink-0" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Explore Service Link */}
        <div className="relative z-10 mt-6 pt-4 border-t border-white/5">
          <button
            type="button"
            onClick={onSelect}
            className="w-full text-left text-xs font-semibold text-violet-400 group-hover:text-cyan-300 transition-colors flex items-center justify-between pt-1 cursor-pointer"
          >
            <span className="tracking-wide">Explore Service</span>
            <div className="w-6 h-6 rounded-full bg-white/5 group-hover:bg-cyan-500/20 flex items-center justify-center transition-all">
              <ArrowUpRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-cyan-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </div>
          </button>
        </div>
      </div>
    </ScrollReveal>
  );
}

export default function ServicesSection({ onSelectService }: ServicesSectionProps) {
  const [services, setServices] = useState<ServiceItem[]>(SITE_CONFIG.services);

  useEffect(() => {
    getServices(true).then((data) => {
      if (data && data.length > 0) {
        setServices(data);
      }
    });
  }, []);

  return (
    <section id="services" className="relative py-24 sm:py-32 bg-[#050711]">
      {/* Background Lighting */}
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-[#8B5CF6]/10 blur-[130px] pointer-events-none" />
      <div className="absolute bottom-10 right-0 w-96 h-96 bg-[#22D3EE]/10 blur-[130px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Heading with ScrollReveal */}
        <ScrollReveal>
          <div className="max-w-3xl mb-16">
            <div className="text-xs font-mono font-medium tracking-widest text-[#22D3EE] uppercase mb-3">
              Capabilities & Disciplines
            </div>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight mb-4">
              Intelligence Meets Execution.
            </h2>
            <p className="text-base sm:text-lg text-[#9CA3AF] leading-relaxed">
              From bold ideas to reliable digital products, we transform complex challenges into elegant
              solutions.
            </p>
          </div>
        </ScrollReveal>

        {/* Dynamic Published Service Panels */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, index) => (
            <ServiceCard
              key={service.id}
              service={service}
              index={index}
              onSelect={() => onSelectService(service.title)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
