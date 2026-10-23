export default function Marquee() {
  const phrase = 'AI INNOVATION ✦ DIGITAL ENGINEERING ✦ SMART AUTOMATION ✦ FUTURE-READY DESIGN ✦';
  // Repeat to ensure continuous seamless infinite scroll across all screen widths
  const repetitions = [phrase, phrase, phrase, phrase];

  return (
    <div
      className="relative w-full py-4 overflow-hidden border-y border-violet-500/15 bg-[#050711]/60 backdrop-blur-md"
      aria-label="Studio Capabilities Marquee"
    >
      {/* Side Vignette Fades */}
      <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-[#050711] to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-[#050711] to-transparent z-10 pointer-events-none" />

      <div className="flex select-none">
        <div className="animate-marquee flex items-center gap-8 text-xs sm:text-sm font-mono tracking-widest uppercase text-transparent bg-clip-text bg-gradient-to-r from-violet-300 via-cyan-200 to-blue-300 whitespace-nowrap">
          {repetitions.map((item, index) => (
            <span key={index} className="inline-block px-4">
              {item}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
