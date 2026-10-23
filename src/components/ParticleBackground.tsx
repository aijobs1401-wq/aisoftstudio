import { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  opacity: number;
  color: string;
  pulseSpeed: number;
}

interface GridPoint {
  x: number;
  y: number;
  active: boolean;
  alpha: number;
  pulseSpeed: number;
}

export default function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isMobile = width < 768;
    const particleCount = prefersReducedMotion ? 12 : isMobile ? 20 : 40;
    const particles: Particle[] = [];

    const colors = ['#8B5CF6', '#22D3EE', '#3B82F6', '#C084FC'];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 1.8 + 0.6,
        speedX: (Math.random() - 0.5) * 0.28,
        speedY: (Math.random() - 0.5) * 0.28,
        opacity: Math.random() * 0.5 + 0.15,
        color: colors[Math.floor(Math.random() * colors.length)],
        pulseSpeed: 0.012 + Math.random() * 0.018,
      });
    }

    // Grid nodes that gently pulse at coordinates
    const gridSpacing = 80;
    const gridPoints: GridPoint[] = [];
    const cols = Math.floor(width / gridSpacing);
    const rows = Math.floor(height / gridSpacing);

    for (let c = 0; c < cols; c++) {
      for (let r = 0; r < rows; r++) {
        if (Math.random() > 0.85) {
          gridPoints.push({
            x: c * gridSpacing + 40,
            y: r * gridSpacing + 40,
            active: true,
            alpha: Math.random() * 0.25,
            pulseSpeed: 0.01 + Math.random() * 0.015,
          });
        }
      }
    }

    let tick = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      tick++;

      // 1. Draw subtle grid pulse intersections
      if (!prefersReducedMotion) {
        for (let i = 0; i < gridPoints.length; i++) {
          const gp = gridPoints[i];
          const curAlpha = 0.08 + Math.sin(tick * gp.pulseSpeed) * 0.12;
          if (curAlpha > 0.02) {
            ctx.beginPath();
            ctx.arc(gp.x, gp.y, 1.2, 0, Math.PI * 2);
            ctx.fillStyle = '#22D3EE';
            ctx.globalAlpha = Math.max(0, curAlpha);
            ctx.fill();
          }
        }
      }

      // 2. Draw drifting low-opacity energy particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        if (!prefersReducedMotion) {
          p.x += p.speedX;
          p.y += p.speedY;

          if (p.x < 0) p.x = width;
          if (p.x > width) p.x = 0;
          if (p.y < 0) p.y = height;
          if (p.y > height) p.y = 0;
        }

        const currentOpacity = prefersReducedMotion
          ? p.opacity
          : p.opacity * (0.6 + 0.4 * Math.sin(tick * p.pulseSpeed));

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0.08, Math.min(0.8, currentOpacity));
        ctx.shadowBlur = 6;
        ctx.shadowColor = p.color;
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      ctx.globalAlpha = 1.0;
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* Cinematic Deep Navy to Obsidian Radial Vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(139,92,246,0.12),rgba(5,7,17,0.98))]" />

      {/* Slowly moving ambient light beams */}
      <div className="absolute top-1/4 -left-40 w-[600px] h-[600px] rounded-full bg-gradient-to-tr from-[#8B5CF6]/15 via-[#22D3EE]/10 to-transparent blur-[140px] animate-beam-1" />
      <div className="absolute top-2/3 -right-40 w-[650px] h-[650px] rounded-full bg-gradient-to-bl from-[#22D3EE]/12 via-[#3B82F6]/10 to-transparent blur-[150px] animate-beam-2" />

      {/* Fine technical grid lines */}
      <div className="absolute inset-0 bg-cyber-grid opacity-25" />

      {/* Canvas for starfield & animated grid point pulses */}
      <canvas ref={canvasRef} className="absolute inset-0 opacity-75" aria-hidden="true" />
    </div>
  );
}
