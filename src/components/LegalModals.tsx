import { X } from 'lucide-react';

interface LegalModalProps {
  type: 'privacy' | 'terms' | null;
  onClose: () => void;
}

export default function LegalModals({ type, onClose }: LegalModalProps) {
  if (!type) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl bg-[#090D1C] border border-violet-500/30 p-6 sm:p-8 text-left shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 transition-colors"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        {type === 'privacy' ? (
          <div>
            <h3 className="text-xl font-bold text-white mb-2">Privacy Policy</h3>
            <p className="text-xs font-mono text-cyan-400 mb-6">Last updated: October 2026</p>
            <div className="space-y-4 text-xs text-gray-300 leading-relaxed">
              <p>
                At AI SOFT STUDIO, we respect your privacy. This policy describes our approach to handling
                information received through inquiries and project discussions.
              </p>
              <h4 className="text-sm font-semibold text-white">1. Information We Collect</h4>
              <p>
                We only gather details you explicitly provide via our project inquiry forms—such as your name,
                work email, organization, and project requirements. We never sell or license client contact
                information.
              </p>
              <h4 className="text-sm font-semibold text-white">2. Confidentiality & NDAs</h4>
              <p>
                All proprietary client concepts, architecture briefs, and trade ideas submitted during discovery
                are treated as strictly confidential. Mutual Non-Disclosure Agreements (NDAs) are gladly executed
                prior to sharing proprietary codebases or sensitive datasets.
              </p>
              <h4 className="text-sm font-semibold text-white">3. Data Retention</h4>
              <p>
                Inquiry submissions are retained solely to maintain communications regarding your build. You may
                request complete deletion of your records at any time.
              </p>
            </div>
          </div>
        ) : (
          <div>
            <h3 className="text-xl font-bold text-white mb-2">Terms of Service</h3>
            <p className="text-xs font-mono text-cyan-400 mb-6">Last updated: October 2026</p>
            <div className="space-y-4 text-xs text-gray-300 leading-relaxed">
              <p>
                Welcome to AI SOFT STUDIO. By exploring our digital showcases or engaging our studio services,
                you acknowledge and agree to the following provisions.
              </p>
              <h4 className="text-sm font-semibold text-white">1. Concept Projects Notice</h4>
              <p>
                Showcase artifacts marked as &ldquo;Concept Project&rdquo; represent exploratory architectural prototypes
                and interface research designed to demonstrate engineering paradigms.
              </p>
              <h4 className="text-sm font-semibold text-white">2. Intellectual Property</h4>
              <p>
                All custom client codebases and digital products delivered under formal work agreements become
                the full intellectual property of the client upon final milestone completion and settlement.
              </p>
              <h4 className="text-sm font-semibold text-white">3. Engagement Scopes</h4>
              <p>
                All production engagements are governed by custom Statements of Work (SOWs) specifying explicit
                deliverables, milestones, timeline estimates, and acceptance criteria.
              </p>
            </div>
          </div>
        )}

        <div className="mt-8 pt-4 border-t border-white/10 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-white/10 hover:bg-white/15 transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
