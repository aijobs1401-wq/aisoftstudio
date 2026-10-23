import { useEffect, useRef } from 'react';
import { ShieldCheck, Cpu, Code2, Sparkles } from 'lucide-react';
import { SITE_CONFIG } from '../config/siteConfig';
import ScrollReveal from './ScrollReveal';

export default function AboutSection() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || 400);
    let height = (canvas.height = 360);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = 360;
    };
    window.addEventListener('resize', handleResize);

    // Create a network of nodes
    const nodeCount = 28;
    interface NetworkNode {
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
      color: string;
      connections: number[];
    }

    const nodes: NetworkNode[] = [];
    const colors = ['#8B5CF6', '#22D3EE', '#3B82F6', '#A855F7'];

    for (let i = 0; i < nodeCount; i++) {
      nodes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        radius: Math.random() * 2.5 + 2,
        color: colors[Math.floor(Math.random() * colors.length)],
        connections: [],
      });
    }

    // Packet pulses traveling along edges
    const packets = [
      { from: 0, to: 1, progress: 0, speed: 0.015 },
      { from: 2, to: 5, progress: 0.3, speed: 0.018 },
      { from: 4, to: 8, progress: 0.7, speed: 0.012 },
      { from: 7, to: 12, progress: 0.5, speed: 0.02 },
      { from: 10, to: 15, progress: 0.2, speed: 0.016 },
    ];

    let tick = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      tick++;

      // Update positions
      nodes.forEach((node) => {
        node.x += node.vx;
        node.y += node.vy;

        if (node.x < 15 || node.x > width - 15) node.vx *= -1;
        if (node.y < 15 || node.y > height - 15) node.vy *= -1;
      });

      // Draw connection lines between nearby nodes
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 100) {
            const alpha = (1 - dist / 100) * 0.35;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.strokeStyle = `rgba(139, 92, 246, ${alpha})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }

      // Draw packets
      packets.forEach((p) => {
        p.progress += p.speed;
        if (p.progress >= 1) {
          p.progress = 0;
          p.from = Math.floor(Math.random() * nodes.length);
          p.to = (p.from + 1 + Math.floor(Math.random() * (nodes.length - 1))) % nodes.length;
        }

        const n1 = nodes[p.from];
        const n2 = nodes[p.to];
        if (n1 && n2) {
          const px = n1.x + (n2.x - n1.x) * p.progress;
          const py = n1.y + (n2.y - n1.y) * p.progress;

          ctx.beginPath();
          ctx.arc(px, py, 3, 0, Math.PI * 2);
          ctx.fillStyle = '#22D3EE';
          ctx.shadowBlur = 8;
          ctx.shadowColor = '#22D3EE';
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      });

      // Draw nodes
      nodes.forEach((node) => {
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fillStyle = node.color;
        ctx.shadowBlur = 6;
        ctx.shadowColor = node.color;
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <section id="about" className="relative py-24 sm:py-32 bg-[#050711] border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Text Content */}
          <div className="lg:col-span-7">
            <ScrollReveal>
              <div className="text-xs font-mono font-medium tracking-widest text-[#8B5CF6] uppercase mb-3">
                Philosophy & Principles
              </div>
              <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight mb-6">
                Technology With a Purpose.
              </h2>
              <p className="text-base sm:text-lg text-gray-300 leading-relaxed mb-8">
                We combine thoughtful design, modern engineering, and intelligent automation to create digital
                experiences that solve real problems. Our approach is collaborative, practical, and focused on
                building products ready for what comes next.
              </p>
            </ScrollReveal>

            {/* Core Values Pillars */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <ScrollReveal delayMs={100}>
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:border-violet-500/30 transition-colors">
                  <div className="flex items-center gap-2.5 text-white font-semibold text-sm mb-1.5">
                    <Cpu className="w-4 h-4 text-cyan-400" />
                    <span>Pragmatic Intelligence</span>
                  </div>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    We deploy AI where it creates tangible leverage, avoiding speculative hype in favor of durable utility.
                  </p>
                </div>
              </ScrollReveal>

              <ScrollReveal delayMs={200}>
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:border-violet-500/30 transition-colors">
                  <div className="flex items-center gap-2.5 text-white font-semibold text-sm mb-1.5">
                    <Code2 className="w-4 h-4 text-violet-400" />
                    <span>Craft & Scalability</span>
                  </div>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    Clean code, strict types, and robust architecture that scales effortlessly as your user base expands.
                  </p>
                </div>
              </ScrollReveal>

              <ScrollReveal delayMs={300}>
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:border-cyan-500/30 transition-colors">
                  <div className="flex items-center gap-2.5 text-white font-semibold text-sm mb-1.5">
                    <ShieldCheck className="w-4 h-4 text-blue-400" />
                    <span>Security & Resilience</span>
                  </div>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    Hardened infrastructure, data privacy controls, and defensive engineering from day one.
                  </p>
                </div>
              </ScrollReveal>

              <ScrollReveal delayMs={400}>
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:border-fuchsia-500/30 transition-colors">
                  <div className="flex items-center gap-2.5 text-white font-semibold text-sm mb-1.5">
                    <Sparkles className="w-4 h-4 text-fuchsia-400" />
                    <span>Sensory Interface Design</span>
                  </div>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    Fast, tactile animations and typographic rigor that make software feel memorable and rewarding to use.
                  </p>
                </div>
              </ScrollReveal>
            </div>
          </div>

          {/* Right Column: Animated Digital Network Visual */}
          <div className="lg:col-span-5 flex flex-col items-center">
            <ScrollReveal delayMs={250} className="w-full">
              <div className="relative w-full rounded-2xl p-6 bg-gradient-to-b from-white/[0.04] to-transparent border border-violet-500/20 backdrop-blur-md overflow-hidden">
                <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-3">
                  <div className="text-xs font-mono text-cyan-300 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-cyan-400 inline-block" />
                    <span>Distributed Network Architecture</span>
                  </div>
                  <span className="text-[10px] font-mono text-gray-500">Autonomous Nodes</span>
                </div>

                {/* Network Canvas */}
                <canvas ref={canvasRef} className="w-full h-[320px] rounded-lg" />

                <div className="mt-3 text-[11px] font-mono text-center text-gray-400">
                  Coordinated event mesh connecting data, model inference, and client viewports.
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </div>
    </section>
  );
}
