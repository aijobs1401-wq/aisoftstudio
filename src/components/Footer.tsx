import { ArrowUp, Mail, ExternalLink } from 'lucide-react';
import { SITE_CONFIG } from '../config/siteConfig';

interface FooterProps {
  onOpenLegal: (type: 'privacy' | 'terms') => void;
  onSelectService: (serviceTitle: string) => void;
}

export default function Footer({ onOpenLegal, onSelectService }: FooterProps) {
  const currentYear = new Date().getFullYear();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const target = document.querySelector(href);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer className="relative bg-[#03040B] border-t border-white/5 pt-16 pb-12 overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[200px] bg-violet-600/5 blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 pb-12 border-b border-white/5">
          {/* Brand Column (Col 1-5) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#8B5CF6] via-[#3B82F6] to-[#22D3EE] p-[1.5px]">
                <div className="w-full h-full bg-[#050711] rounded-[6px] flex items-center justify-center">
                  <div className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
                </div>
              </div>
              <span className="text-base font-bold tracking-tight text-white">
                {SITE_CONFIG.brand.name}
              </span>
            </div>

            <p className="text-xs text-gray-400 max-w-sm leading-relaxed">
              {SITE_CONFIG.brand.shortDescription}
            </p>

            <div className="pt-2 text-xs text-gray-500 font-mono">
              Inquiries: <span className="text-gray-300">{SITE_CONFIG.contact.email}</span>
            </div>
          </div>

          {/* Quick Navigation (Col 6-7) */}
          <div className="lg:col-span-2 space-y-3">
            <div className="text-xs font-mono uppercase tracking-wider text-gray-400">
              Navigation
            </div>
            <ul className="space-y-2 text-xs text-gray-400">
              <li>
                <a
                  href="#home"
                  onClick={(e) => handleLinkClick(e, '#home')}
                  className="hover:text-white transition-colors"
                >
                  Home
                </a>
              </li>
              <li>
                <a
                  href="#services"
                  onClick={(e) => handleLinkClick(e, '#services')}
                  className="hover:text-white transition-colors"
                >
                  Services
                </a>
              </li>
              <li>
                <a
                  href="#work"
                  onClick={(e) => handleLinkClick(e, '#work')}
                  className="hover:text-white transition-colors"
                >
                  Showcase
                </a>
              </li>
              <li>
                <a
                  href="#process"
                  onClick={(e) => handleLinkClick(e, '#process')}
                  className="hover:text-white transition-colors"
                >
                  Process
                </a>
              </li>
              <li>
                <a
                  href="#about"
                  onClick={(e) => handleLinkClick(e, '#about')}
                  className="hover:text-white transition-colors"
                >
                  About
                </a>
              </li>
              <li>
                <a
                  href="#tech"
                  onClick={(e) => handleLinkClick(e, '#tech')}
                  className="hover:text-white transition-colors"
                >
                  Tech Stack
                </a>
              </li>
              <li className="pt-1">
                <a
                  href="/admin/login"
                  className="hover:text-cyan-400 text-slate-400 transition-colors inline-flex items-center gap-1 font-mono text-[11px]"
                >
                  Admin Portal →
                </a>
              </li>
            </ul>
          </div>

          {/* Core Services Links (Col 8-10) */}
          <div className="lg:col-span-3 space-y-3">
            <div className="text-xs font-mono uppercase tracking-wider text-gray-400">
              Services
            </div>
            <ul className="space-y-2 text-xs text-gray-400">
              {SITE_CONFIG.services.map((s) => (
                <li key={s.id}>
                  <button
                    type="button"
                    onClick={() => {
                      onSelectService(s.title);
                      const contactElem = document.querySelector('#contact');
                      if (contactElem) contactElem.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="hover:text-cyan-300 transition-colors text-left cursor-pointer"
                  >
                    {s.title}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Social / Connect (Col 11-12) */}
          <div className="lg:col-span-2 space-y-3">
            <div className="text-xs font-mono uppercase tracking-wider text-gray-400">
              Community
            </div>
            <ul className="space-y-2 text-xs text-gray-400">
              {SITE_CONFIG.socials.map((soc) => (
                <li key={soc.name}>
                  <a
                    href={soc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-white transition-colors inline-flex items-center gap-1.5"
                  >
                    <span>{soc.name}</span>
                    <ExternalLink className="w-3 h-3 text-gray-600" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <div className="flex items-center gap-4">
            <span>© {currentYear} AI SOFT STUDIO. All rights reserved.</span>
            <span>·</span>
            <button
              type="button"
              onClick={() => onOpenLegal('privacy')}
              className="hover:text-gray-300 transition-colors cursor-pointer"
            >
              Privacy Policy
            </button>
            <span>·</span>
            <button
              type="button"
              onClick={() => onOpenLegal('terms')}
              className="hover:text-gray-300 transition-colors cursor-pointer"
            >
              Terms of Service
            </button>
          </div>

          {/* Back to top button */}
          <button
            type="button"
            onClick={scrollToTop}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors cursor-pointer"
            aria-label="Back to top of page"
          >
            <span>Back to top</span>
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </footer>
  );
}
