import { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';

export default function ScrollProgressAndTopButton() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showTopButton, setShowTopButton] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollTop;
      const windowHeight =
        document.documentElement.scrollHeight - document.documentElement.clientHeight;

      if (windowHeight > 0) {
        setScrollProgress((totalScroll / windowHeight) * 100);
      }

      setShowTopButton(totalScroll > 400);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      {/* Top Scroll Progress Bar */}
      <div
        className="scroll-progress-bar"
        style={{ width: `${scrollProgress}%` }}
        aria-hidden="true"
      />

      {/* Floating Back-to-Top Button */}
      <button
        type="button"
        onClick={scrollToTop}
        className={`fixed bottom-6 right-6 z-40 p-3 rounded-full bg-[#050711]/85 border border-cyan-500/30 text-cyan-300 hover:text-white hover:border-cyan-400 backdrop-blur-md shadow-[0_4px_25px_rgba(0,0,0,0.6)] transition-all duration-300 cursor-pointer ${
          showTopButton
            ? 'opacity-100 translate-y-0 pointer-events-auto hover:shadow-[0_0_25px_rgba(34,211,238,0.4)] hover:scale-105 active:scale-95'
            : 'opacity-0 translate-y-4 pointer-events-none'
        }`}
        aria-label="Back to top"
      >
        <ArrowUp className="w-5 h-5" />
      </button>
    </>
  );
}
