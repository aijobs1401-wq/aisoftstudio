import { useEffect, useRef, useState } from 'react';
import { Cpu, Zap, Code2, Sparkles } from 'lucide-react';

interface AIOrbProps {
  onExploreWork?: () => void;
  onStartProject?: () => void;
}

export default function AIOrb({ onExploreWork, onStartProject }: AIOrbProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const updateSize = () => {
      if (!canvas || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const size = Math.min(rect.width, 560);
      canvas.width = size * dpr;
      canvas.height = size * dpr;
      canvas.style.width = `${size}px`;
      canvas.style.height = `${size}px`;
      ctx.scale(dpr, dpr);
    };

    updateSize();
    window.addEventListener('resize', updateSize);

    // 3D Sphere geometry
    const sphereRadius = 125;
    const ringsCount = 10;
    const pointsPerRing = 26;
    interface Point3D {
      x: number;
      y: number;
      z: number;
    }
    const spherePoints: Point3D[] = [];

    for (let i = 0; i < ringsCount; i++) {
      const phi = (Math.PI * (i + 1)) / (ringsCount + 1);
      const ringRadius = sphereRadius * Math.sin(phi);
      const y = sphereRadius * Math.cos(phi);

      for (let j = 0; j < pointsPerRing; j++) {
        const theta = (2 * Math.PI * j) / pointsPerRing;
        const x = ringRadius * Math.cos(theta);
        const z = ringRadius * Math.sin(theta);
        spherePoints.push({ x, y, z });
      }
    }

    // 4 Elliptical 3D Orbital Rings
    const orbits = [
      { radius: 175, tiltX: 0.85, tiltY: 0.35, speed: 0.016, color: '#22D3EE', phase: 0 },
      { radius: 205, tiltX: -0.65, tiltY: 0.75, speed: -0.013, color: '#8B5CF6', phase: 1.8 },
      { radius: 235, tiltX: 0.45, tiltY: -0.85, speed: 0.010, color: '#3B82F6', phase: 3.5 },
      { radius: 265, tiltX: -0.80, tiltY: -0.30, speed: -0.008, color: '#C084FC', phase: 5.2 },
    ];

    // Comet trails traveling along orbits
    const comets = [
      { orbitIndex: 0, progress: 0.05, length: 14, color: '#22D3EE' },
      { orbitIndex: 0, progress: 0.55, length: 12, color: '#67E8F9' },
      { orbitIndex: 1, progress: 0.25, length: 16, color: '#8B5CF6' },
      { orbitIndex: 1, progress: 0.80, length: 14, color: '#C084FC' },
      { orbitIndex: 2, progress: 0.40, length: 16, color: '#3B82F6' },
      { orbitIndex: 2, progress: 0.90, length: 12, color: '#60A5FA' },
      { orbitIndex: 3, progress: 0.15, length: 18, color: '#E879F9' },
      { orbitIndex: 3, progress: 0.65, length: 14, color: '#A855F7' },
    ];

    // Pulsing energy waves radiating outward
    const energyWaves = [
      { radius: 20, maxRadius: 180, alpha: 0.8, speed: 1.2 },
      { radius: 80, maxRadius: 180, alpha: 0.5, speed: 1.2 },
      { radius: 140, maxRadius: 180, alpha: 0.2, speed: 1.2 },
    ];

    let rotX = 0.25;
    let rotY = 0;
    let targetRotX = 0.25;
    let targetRotY = 0;
    let tick = 0;

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const normX = (e.clientX - (rect.left + rect.width / 2)) / (rect.width / 2);
      const normY = (e.clientY - (rect.top + rect.height / 2)) / (rect.height / 2);
      targetRotY = normX * 0.42;
      targetRotX = 0.25 - normY * 0.32;
      setMousePos({ x: normX, y: normY });
    };

    window.addEventListener('mousemove', handleMouseMove);

    const render = () => {
      const width = canvas.width / dpr;
      const height = canvas.height / dpr;
      const cx = width / 2;
      const cy = height / 2;
      const fl = 440; // focal length

      ctx.clearRect(0, 0, width, height);

      // Mouse tilt smooth interpolation + continuous auto rotation
      rotX += (targetRotX - rotX) * 0.045;
      rotY += (targetRotY - rotY) * 0.045 + 0.007;
      tick += 0.03;

      // 1. Ambient multi-layer core aura
      const pulse = 1 + Math.sin(tick * 0.9) * 0.08;
      const coreGrad = ctx.createRadialGradient(cx, cy, 10, cx, cy, 160 * pulse);
      coreGrad.addColorStop(0, 'rgba(139, 92, 246, 0.4)');
      coreGrad.addColorStop(0.35, 'rgba(34, 211, 238, 0.22)');
      coreGrad.addColorStop(0.7, 'rgba(59, 130, 246, 0.07)');
      coreGrad.addColorStop(1, 'rgba(5, 7, 17, 0)');

      ctx.fillStyle = coreGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, 160 * pulse, 0, Math.PI * 2);
      ctx.fill();

      // 2. Animated concentric energy shockwaves
      energyWaves.forEach((wave) => {
        wave.radius += wave.speed;
        if (wave.radius > wave.maxRadius) {
          wave.radius = 15;
        }
        const waveAlpha = (1 - wave.radius / wave.maxRadius) * 0.35;
        ctx.beginPath();
        ctx.arc(cx, cy, wave.radius, 0, Math.PI * 2);
        ctx.strokeStyle = '#22D3EE';
        ctx.globalAlpha = Math.max(0, waveAlpha);
        ctx.lineWidth = 1.2;
        ctx.stroke();
      });
      ctx.globalAlpha = 1.0;

      // 3D Projection math
      const project = (x: number, y: number, z: number) => {
        const cosY = Math.cos(rotY);
        const sinY = Math.sin(rotY);
        const x1 = x * cosY - z * sinY;
        const z1 = z * cosY + x * sinY;

        const cosX = Math.cos(rotX);
        const sinX = Math.sin(rotX);
        const y2 = y * cosX - z1 * sinX;
        const z2 = z1 * cosX + y * sinX;

        const scale = fl / (fl + z2);
        return {
          px: cx + x1 * scale,
          py: cy + y2 * scale,
          scale,
          z: z2,
        };
      };

      // 3. Render back half of orbital rings (z <= 0)
      orbits.forEach((orbit) => {
        const segments = 64;
        ctx.beginPath();
        for (let s = 0; s <= segments; s++) {
          const angle = (s / segments) * Math.PI * 2 + orbit.phase + tick * orbit.speed;
          const ox = orbit.radius * Math.cos(angle);
          const oz = orbit.radius * Math.sin(angle);
          const ty = oz * Math.sin(orbit.tiltX) + ox * Math.sin(orbit.tiltY);
          const tx = ox * Math.cos(orbit.tiltY);
          const tz = oz * Math.cos(orbit.tiltX);

          const proj = project(tx, ty, tz);
          if (proj.z <= 0) {
            if (s === 0) ctx.moveTo(proj.px, proj.py);
            else ctx.lineTo(proj.px, proj.py);
          }
        }
        ctx.strokeStyle = orbit.color;
        ctx.lineWidth = 1.0;
        ctx.globalAlpha = 0.22;
        ctx.stroke();
        ctx.globalAlpha = 1.0;
      });

      // 4. Render 3D Holographic Sphere Point Cloud
      spherePoints.forEach((pt) => {
        const proj = project(pt.x, pt.y, pt.z);
        const alpha = Math.max(0.12, Math.min(0.95, (proj.scale - 0.68) * 1.6));
        const pointSize = Math.max(1, 2.2 * proj.scale);

        ctx.beginPath();
        ctx.arc(proj.px, proj.py, pointSize, 0, Math.PI * 2);
        ctx.fillStyle = proj.z > 0 ? '#22D3EE' : '#8B5CF6';
        ctx.globalAlpha = alpha;
        ctx.shadowBlur = proj.z > 0 ? 7 : 2;
        ctx.shadowColor = proj.z > 0 ? '#22D3EE' : '#8B5CF6';
        ctx.fill();
        ctx.shadowBlur = 0;
      });
      ctx.globalAlpha = 1.0;

      // 5. Render front half of orbital rings (z > 0)
      orbits.forEach((orbit) => {
        const segments = 64;
        ctx.beginPath();
        for (let s = 0; s <= segments; s++) {
          const angle = (s / segments) * Math.PI * 2 + orbit.phase + tick * orbit.speed;
          const ox = orbit.radius * Math.cos(angle);
          const oz = orbit.radius * Math.sin(angle);
          const ty = oz * Math.sin(orbit.tiltX) + ox * Math.sin(orbit.tiltY);
          const tx = ox * Math.cos(orbit.tiltY);
          const tz = oz * Math.cos(orbit.tiltX);

          const proj = project(tx, ty, tz);
          if (proj.z > 0) {
            if (s === 0) ctx.moveTo(proj.px, proj.py);
            else ctx.lineTo(proj.px, proj.py);
          }
        }
        ctx.strokeStyle = orbit.color;
        ctx.lineWidth = 1.6;
        ctx.globalAlpha = 0.7;
        ctx.shadowBlur = 10;
        ctx.shadowColor = orbit.color;
        ctx.stroke();
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1.0;
      });

      // 6. Draw glowing cyan and violet comets moving along rings
      comets.forEach((comet) => {
        const orbit = orbits[comet.orbitIndex];
        comet.progress = (comet.progress + 0.0055) % 1;

        for (let t = 0; t < comet.length; t++) {
          const trailAngle =
            (comet.progress - t * 0.007) * Math.PI * 2 + orbit.phase + tick * orbit.speed;
          const ox = orbit.radius * Math.cos(trailAngle);
          const oz = orbit.radius * Math.sin(trailAngle);
          const ty = oz * Math.sin(orbit.tiltX) + ox * Math.sin(orbit.tiltY);
          const tx = ox * Math.cos(orbit.tiltY);
          const tz = oz * Math.cos(orbit.tiltX);

          const proj = project(tx, ty, tz);
          const trailAlpha = (1 - t / comet.length) * 0.85;

          ctx.beginPath();
          ctx.arc(proj.px, proj.py, (3.2 - (t / comet.length) * 1.9) * proj.scale, 0, Math.PI * 2);
          ctx.fillStyle = comet.color;
          ctx.globalAlpha = trailAlpha;
          ctx.shadowBlur = 10;
          ctx.shadowColor = comet.color;
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      });
      ctx.globalAlpha = 1.0;

      // 7. Core Pulsing Holographic Bead with multi-layer radial gradient
      const innerCoreGrad = ctx.createRadialGradient(cx, cy, 2, cx, cy, 32);
      innerCoreGrad.addColorStop(0, '#FFFFFF');
      innerCoreGrad.addColorStop(0.25, '#22D3EE');
      innerCoreGrad.addColorStop(0.65, '#8B5CF6');
      innerCoreGrad.addColorStop(1, 'rgba(139, 92, 246, 0)');

      ctx.beginPath();
      ctx.arc(cx, cy, 28 * pulse, 0, Math.PI * 2);
      ctx.fillStyle = innerCoreGrad;
      ctx.shadowBlur = 28;
      ctx.shadowColor = '#22D3EE';
      ctx.fill();
      ctx.shadowBlur = 0;

      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', updateSize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-full max-w-[560px] aspect-square flex items-center justify-center mx-auto"
    >
      {/* Background Grid Pattern behind 3D core */}
      <div className="absolute inset-8 rounded-3xl bg-cyber-grid opacity-35 pointer-events-none" />

      {/* Dynamic Background Aura */}
      <div className="absolute inset-4 rounded-full bg-gradient-to-tr from-[#8B5CF6]/25 via-[#22D3EE]/20 to-transparent blur-3xl pointer-events-none" />

      {/* Interactive 3D Canvas */}
      <canvas
        ref={canvasRef}
        className="relative z-10 transition-transform duration-300 ease-out pointer-events-none select-none"
        style={{
          transform: `translate3d(${mousePos.x * 14}px, ${mousePos.y * 14}px, 0)`,
        }}
        aria-label="Interactive 3D animated holographic AI energy core"
      />

      {/* Three Floating Glassmorphism Information Cards with independent floating animations */}
      {/* Card 1: AI INTELLIGENCE (Top Left) */}
      <div
        className="absolute top-1 left-0 sm:left-2 z-20 transition-transform duration-500 ease-out"
        style={{
          transform: `translate3d(${mousePos.x * -16}px, ${mousePos.y * -16}px, 0)`,
        }}
      >
        <div className="flex items-center gap-2 sm:gap-3 px-2.5 py-1.5 sm:px-4 sm:py-2.5 rounded-xl backdrop-blur-md bg-[#050711]/80 border border-violet-500/35 shadow-[0_8px_30px_rgba(0,0,0,0.6)] animate-float-1">
          <div className="p-1.5 sm:p-2 rounded-lg bg-violet-500/20 text-[#8B5CF6] border border-violet-500/30 shrink-0">
            <Cpu className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </div>
          <div>
            <div className="text-[10px] sm:text-xs font-bold text-white tracking-wider uppercase font-mono">
              AI Intelligence
            </div>
            <div className="text-[9px] sm:text-[10px] text-cyan-400 font-mono">Autonomous Neural Systems</div>
          </div>
        </div>
      </div>

      {/* Card 2: DIGITAL ENGINEERING (Top Right) */}
      <div
        className="absolute top-4 right-0 sm:right-2 z-20 transition-transform duration-500 ease-out"
        style={{
          transform: `translate3d(${mousePos.x * 18}px, ${mousePos.y * -14}px, 0)`,
        }}
      >
        <div className="flex items-center gap-2 sm:gap-3 px-2.5 py-1.5 sm:px-4 sm:py-2.5 rounded-xl backdrop-blur-md bg-[#050711]/80 border border-cyan-500/35 shadow-[0_8px_30px_rgba(0,0,0,0.6)] animate-float-2">
          <div className="p-1.5 sm:p-2 rounded-lg bg-cyan-500/20 text-[#22D3EE] border border-cyan-500/30 shrink-0">
            <Code2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </div>
          <div>
            <div className="text-[10px] sm:text-xs font-bold text-white tracking-wider uppercase font-mono">
              Digital Engineering
            </div>
            <div className="text-[9px] sm:text-[10px] text-violet-300 font-mono">High-Velocity Full-Stack</div>
          </div>
        </div>
      </div>

      {/* Card 3: SMART AUTOMATION (Bottom Left / Center) */}
      <div
        className="absolute bottom-4 left-1 sm:left-6 z-20 transition-transform duration-500 ease-out"
        style={{
          transform: `translate3d(${mousePos.x * -14}px, ${mousePos.y * 16}px, 0)`,
        }}
      >
        <div className="flex items-center gap-2 sm:gap-3 px-2.5 py-1.5 sm:px-4 sm:py-2.5 rounded-xl backdrop-blur-md bg-[#050711]/80 border border-blue-500/35 shadow-[0_8px_30px_rgba(0,0,0,0.6)] animate-float-3">
          <div className="p-1.5 sm:p-2 rounded-lg bg-blue-500/20 text-[#3B82F6] border border-blue-500/30 shrink-0">
            <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </div>
          <div>
            <div className="text-[10px] sm:text-xs font-bold text-white tracking-wider uppercase font-mono">
              Smart Automation
            </div>
            <div className="text-[9px] sm:text-[10px] text-cyan-300 font-mono">Autonomous Workflows</div>
          </div>
        </div>
      </div>
    </div>
  );
}
