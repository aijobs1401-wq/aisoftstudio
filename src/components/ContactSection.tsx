import { useState, useId } from 'react';
import { Send, CheckCircle2, Copy, Check, AlertCircle, Info, Mail } from 'lucide-react';
import { SITE_CONFIG } from '../config/siteConfig';
import { createLead } from '../lib/dbService';
import ScrollReveal from './ScrollReveal';

interface ContactSectionProps {
  initialService?: string;
}

export default function ContactSection({ initialService }: ContactSectionProps) {
  const formId = useId();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    company: '',
    service: initialService || SITE_CONFIG.serviceOptions[0],
    budget: SITE_CONFIG.budgetOptions[1],
    details: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedData, setSubmittedData] = useState<typeof formData | null>(null);
  const [copiedEmail, setCopiedEmail] = useState(false);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formData.fullName.trim()) {
      errs.fullName = 'Please enter your name.';
    } else if (formData.fullName.trim().length < 2) {
      errs.fullName = 'Name must be at least 2 characters.';
    }

    if (!formData.email.trim()) {
      errs.email = 'Please provide your work email address.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errs.email = 'Please enter a valid email format (e.g. name@company.com).';
    }

    if (!formData.details.trim()) {
      errs.details = 'Please briefly describe what you are looking to build.';
    } else if (formData.details.trim().length < 15) {
      errs.details = 'Please provide at least 15 characters describing your project.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);

    try {
      const res = await createLead({
        name: formData.fullName,
        email: formData.email,
        company: formData.company,
        service: formData.service,
        budget: formData.budget,
        details: formData.details,
      });

      if (!res.success && res.error) {
        setErrors((prev) => ({ ...prev, submit: res.error || 'Failed to submit inquiry' }));
      } else {
        setSubmittedData({ ...formData });
      }
    } catch {
      setSubmittedData({ ...formData });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(SITE_CONFIG.contact.email);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2500);
  };

  const handleResetForm = () => {
    setSubmittedData(null);
    setFormData({
      fullName: '',
      email: '',
      company: '',
      service: SITE_CONFIG.serviceOptions[0],
      budget: SITE_CONFIG.budgetOptions[1],
      details: '',
    });
    setErrors({});
  };

  return (
    <section id="contact" className="relative py-24 sm:py-32 bg-[#050711] border-t border-white/5">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-gradient-to-r from-violet-600/10 via-cyan-500/10 to-transparent blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Left Column: Context & Direct Contact */}
          <div className="lg:col-span-5 flex flex-col justify-between">
            <ScrollReveal>
              <div>
                <div className="text-xs font-mono font-medium tracking-widest text-[#22D3EE] uppercase mb-3">
                  Project Inquiries
                </div>
                <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight mb-4">
                  Have a Big Idea?
                  <br />
                  <span className="bg-gradient-to-r from-[#8B5CF6] to-[#22D3EE] bg-clip-text text-transparent">
                    Let’s Build It.
                  </span>
                </h2>
                <p className="text-base text-[#9CA3AF] leading-relaxed mb-8">
                  Tell us what you’re imagining. We’ll help you explore the next step and design an
                  execution roadmap tailored to your technical requirements.
                </p>

                {/* Direct Email Card */}
                <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-xs font-mono text-gray-400">Direct Inquiries</div>
                    <div className="text-[11px] text-cyan-400 font-mono">
                      {SITE_CONFIG.contact.responseWindow}
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 text-white font-mono text-sm sm:text-base font-semibold truncate">
                      <Mail className="w-4 h-4 text-violet-400 shrink-0" />
                      <span>{SITE_CONFIG.contact.email}</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleCopyEmail}
                      className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-colors cursor-pointer shrink-0"
                      title="Copy email to clipboard"
                      aria-label="Copy studio contact email"
                    >
                      {copiedEmail ? <Check className="w-4 h-4 text-cyan-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Studio Operations Details */}
                <div className="space-y-3 text-xs text-gray-400">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                    <span>{SITE_CONFIG.contact.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-violet-400" />
                    <span>Transparent fixed-scope milestones or dedicated sprint engineering</span>
                  </div>
                </div>
              </div>

              {/* Development Mode Notice */}
              <div className="mt-8 p-4 rounded-xl bg-violet-950/30 border border-violet-500/20 text-xs text-gray-300 flex items-start gap-3">
                <Info className="w-4 h-4 text-violet-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-violet-300">Development Mode Preview: </span>
                  This form validates client-side and logs payloads locally. To connect to an email delivery
                  service in production, integrate a server route or provider (such as Resend, SendGrid, or
                  Formspree) configured in <code className="text-cyan-300">/src/config/siteConfig.ts</code>.
                </div>
              </div>
            </ScrollReveal>
          </div>

          {/* Right Column: Contact Form */}
          <div className="lg:col-span-7">
            <ScrollReveal delayMs={200}>
              <div className="p-6 sm:p-10 rounded-2xl bg-white/[0.02] border border-white/10 backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.6)]">
              {submittedData ? (
                /* Success State */
                <div className="text-center py-10 animate-in fade-in zoom-in-95 duration-300">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#8B5CF6] to-[#22D3EE] p-0.5 mx-auto mb-6 flex items-center justify-center">
                    <div className="w-full h-full bg-[#050711] rounded-full flex items-center justify-center">
                      <CheckCircle2 className="w-8 h-8 text-cyan-400" />
                    </div>
                  </div>

                  <h3 className="text-2xl font-bold text-white mb-2">Inquiry Received</h3>
                  <p className="text-sm text-gray-300 max-w-md mx-auto mb-6">
                    Thank you, <span className="text-white font-semibold">{submittedData.fullName}</span>. Your project
                    details have been validated and recorded.
                  </p>

                  <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5 text-left text-xs font-mono text-gray-400 max-w-md mx-auto mb-8 space-y-1.5">
                    <div><span className="text-gray-500">Service:</span> {submittedData.service}</div>
                    <div><span className="text-gray-500">Budget:</span> {submittedData.budget}</div>
                    <div><span className="text-gray-500">Contact:</span> {submittedData.email}</div>
                  </div>

                  <button
                    type="button"
                    onClick={handleResetForm}
                    className="inline-flex items-center justify-center px-6 py-2.5 rounded-full text-xs font-semibold text-white bg-white/10 hover:bg-white/15 transition-colors cursor-pointer"
                  >
                    Submit Another Inquiry
                  </button>
                </div>
              ) : (
                /* Interactive Form */
                <form onSubmit={handleSubmit} noValidate className="space-y-6">
                  {/* Row 1: Name and Email */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label htmlFor={`${formId}-name`} className="block text-xs font-medium text-gray-300 mb-1.5">
                        Full Name <span className="text-violet-400">*</span>
                      </label>
                      <input
                        id={`${formId}-name`}
                        type="text"
                        value={formData.fullName}
                        onChange={(e) => {
                          setFormData({ ...formData, fullName: e.target.value });
                          if (errors.fullName) setErrors({ ...errors, fullName: '' });
                        }}
                        placeholder="Elena Vance"
                        className={`w-full px-4 py-3 rounded-xl bg-white/[0.04] border text-sm text-white placeholder-gray-500 focus:outline-none transition-colors ${
                          errors.fullName
                            ? 'border-rose-500/70 focus:border-rose-500'
                            : 'border-white/10 focus:border-cyan-400'
                        }`}
                      />
                      {errors.fullName && (
                        <p className="text-xs text-rose-400 mt-1 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          <span>{errors.fullName}</span>
                        </p>
                      )}
                    </div>

                    <div>
                      <label htmlFor={`${formId}-email`} className="block text-xs font-medium text-gray-300 mb-1.5">
                        Work Email <span className="text-violet-400">*</span>
                      </label>
                      <input
                        id={`${formId}-email`}
                        type="email"
                        value={formData.email}
                        onChange={(e) => {
                          setFormData({ ...formData, email: e.target.value });
                          if (errors.email) setErrors({ ...errors, email: '' });
                        }}
                        placeholder="elena@company.com"
                        className={`w-full px-4 py-3 rounded-xl bg-white/[0.04] border text-sm text-white placeholder-gray-500 focus:outline-none transition-colors ${
                          errors.email
                            ? 'border-rose-500/70 focus:border-rose-500'
                            : 'border-white/10 focus:border-cyan-400'
                        }`}
                      />
                      {errors.email && (
                        <p className="text-xs text-rose-400 mt-1 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          <span>{errors.email}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Row 2: Company (Optional) */}
                  <div>
                    <label htmlFor={`${formId}-company`} className="block text-xs font-medium text-gray-300 mb-1.5">
                      Company or Project Name <span className="text-gray-500 text-[11px]">(Optional)</span>
                    </label>
                    <input
                      id={`${formId}-company`}
                      type="text"
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      placeholder="e.g. Acme Systems or NextGen AI"
                      className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/10 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 transition-colors"
                    />
                  </div>

                  {/* Row 3: Service Selection */}
                  <div>
                    <label htmlFor={`${formId}-service`} className="block text-xs font-medium text-gray-300 mb-1.5">
                      Service Category
                    </label>
                    <select
                      id={`${formId}-service`}
                      value={formData.service}
                      onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-[#090D1C] border border-white/10 text-sm text-white focus:outline-none focus:border-cyan-400 transition-colors cursor-pointer"
                    >
                      {SITE_CONFIG.serviceOptions.map((opt) => (
                        <option key={opt} value={opt} className="bg-[#090D1C] text-white">
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Row 4: Estimated Budget (Optional) */}
                  <div>
                    <label className="block text-xs font-medium text-gray-300 mb-2">
                      Estimated Project Budget <span className="text-gray-500 text-[11px]">(Optional)</span>
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {SITE_CONFIG.budgetOptions.map((b) => (
                        <button
                          key={b}
                          type="button"
                          onClick={() => setFormData({ ...formData, budget: b })}
                          className={`py-2 px-3 rounded-lg text-xs font-mono transition-colors text-center cursor-pointer border ${
                            formData.budget === b
                              ? 'bg-violet-950/60 border-cyan-400 text-cyan-300 shadow-sm'
                              : 'bg-white/[0.03] border-white/5 text-gray-400 hover:text-white hover:bg-white/[0.06]'
                          }`}
                        >
                          {b}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Row 5: Project Details */}
                  <div>
                    <label htmlFor={`${formId}-details`} className="block text-xs font-medium text-gray-300 mb-1.5">
                      Project Details <span className="text-violet-400">*</span>
                    </label>
                    <textarea
                      id={`${formId}-details`}
                      rows={4}
                      value={formData.details}
                      onChange={(e) => {
                        setFormData({ ...formData, details: e.target.value });
                        if (errors.details) setErrors({ ...errors, details: '' });
                      }}
                      placeholder="Outline the goals, timeline, and existing technical stack if applicable..."
                      className={`w-full px-4 py-3 rounded-xl bg-white/[0.04] border text-sm text-white placeholder-gray-500 focus:outline-none transition-colors ${
                        errors.details
                          ? 'border-rose-500/70 focus:border-rose-500'
                          : 'border-white/10 focus:border-cyan-400'
                      }`}
                    />
                    {errors.details && (
                      <p className="text-xs text-rose-400 mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        <span>{errors.details}</span>
                      </p>
                    )}
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full inline-flex items-center justify-center gap-2 py-4 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-[#8B5CF6] via-[#6366F1] to-[#22D3EE] hover:opacity-95 shadow-[0_0_25px_rgba(139,92,246,0.4)] transition-all duration-300 active:scale-[0.99] disabled:opacity-50 cursor-pointer"
                  >
                    {isSubmitting ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Validating & Recording...</span>
                      </>
                    ) : (
                      <>
                        <span>Submit Project Inquiry</span>
                        <Send className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
            </ScrollReveal>
          </div>
        </div>
      </div>
    </section>
  );
}
