/**
 * AI SOFT STUDIO - Main Application Entry
 * Futuristic Digital Experience & Software Engineering
 * With Full Admin Console & Supabase Authentication
 */

import { useState, useEffect } from 'react';
import { Route, Switch, Link } from 'wouter';
import { Wrench, Shield, ArrowRight } from 'lucide-react';
import { AuthProvider } from './context/AuthContext';
import { getSiteSettings, SiteSettings } from './lib/dbService';

// Public Components
import ParticleBackground from './components/ParticleBackground';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import Marquee from './components/Marquee';
import ServicesSection from './components/ServicesSection';
import ProjectShowcase from './components/ProjectShowcase';
import ProcessTimeline from './components/ProcessTimeline';
import AboutSection from './components/AboutSection';
import TechStack from './components/TechStack';
import ContactSection from './components/ContactSection';
import Footer from './components/Footer';
import LegalModals from './components/LegalModals';
import ScrollProgressAndTopButton from './components/ScrollProgressAndTopButton';

// Admin Pages
import AdminLogin from './pages/admin/AdminLogin';
import AdminForgotPassword from './pages/admin/AdminForgotPassword';
import AdminResetPassword from './pages/admin/AdminResetPassword';
import AdminOverview from './pages/admin/AdminOverview';
import AdminLeads from './pages/admin/AdminLeads';
import AdminServices from './pages/admin/AdminServices';
import AdminProjects from './pages/admin/AdminProjects';
import AdminUsers from './pages/admin/AdminUsers';
import AdminNotifications from './pages/admin/AdminNotifications';
import AdminSettings from './pages/admin/AdminSettings';
import AdminAuditLogs from './pages/admin/AdminAuditLogs';

function PublicLandingPage() {
  const [selectedService, setSelectedService] = useState<string | undefined>(undefined);
  const [legalModalType, setLegalModalType] = useState<'privacy' | 'terms' | null>(null);
  const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(null);

  useEffect(() => {
    getSiteSettings().then(setSiteSettings);
  }, []);

  const scrollToContact = () => {
    const contactElem = document.querySelector('#contact');
    if (contactElem) {
      contactElem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToWork = () => {
    const workElem = document.querySelector('#work');
    if (workElem) {
      workElem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSelectService = (serviceTitle: string) => {
    setSelectedService(serviceTitle);
    scrollToContact();
  };

  // Maintenance Mode View
  if (siteSettings?.maintenance_mode) {
    return (
      <div className="relative min-h-screen bg-[#050711] text-[#F8FAFC] flex flex-col justify-center items-center p-6 select-none overflow-hidden">
        <ParticleBackground />
        <div className="relative z-10 max-w-lg text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#8B5CF6] via-amber-500 to-[#22D3EE] p-[2px] mx-auto shadow-[0_0_40px_rgba(245,158,11,0.3)]">
            <div className="w-full h-full bg-[#050711] rounded-[14px] flex items-center justify-center">
              <Wrench className="w-7 h-7 text-amber-400" />
            </div>
          </div>
          <div>
            <div className="text-xs font-mono uppercase tracking-widest text-amber-400 mb-2">
              Scheduled System Optimization
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              {siteSettings.site_name || 'AI SOFT STUDIO'}
            </h1>
          </div>
          <p className="text-sm text-gray-300 leading-relaxed">
            We are performing essential infrastructure calibration and model deployments. Public services
            will resume shortly.
          </p>
          <div className="pt-4 flex items-center justify-center gap-3">
            <Link
              href="/admin/login"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-mono text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
            >
              <Shield className="w-3.5 h-3.5 text-cyan-400" />
              <span>Staff Console Access</span>
              <ArrowRight className="w-3 h-3 text-gray-500" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-[#050711] text-[#F8FAFC] selection:bg-[#8B5CF6]/30 selection:text-[#22D3EE] font-sans antialiased overflow-x-hidden">
      {/* Top Scroll Progress Indicator & Floating Back-To-Top */}
      <ScrollProgressAndTopButton />

      {/* Background Interactive Particle Mesh */}
      <ParticleBackground />

      {/* Sticky Glassmorphic Navbar */}
      <Navbar onContactClick={scrollToContact} />

      {/* Main Content Regions */}
      <main>
        {/* Hero Section with Interactive 3D AI Core */}
        <HeroSection
          onStartProject={scrollToContact}
          onExploreWork={scrollToWork}
          heading={siteSettings?.hero_heading}
          description={siteSettings?.hero_description}
        />

        {/* Seamless Moving Marquee */}
        <Marquee />

        {/* Services Section */}
        <ServicesSection onSelectService={handleSelectService} />

        {/* Project Showcase with Concept Previews & Modal */}
        <ProjectShowcase />

        {/* Interactive Process Timeline */}
        <ProcessTimeline />

        {/* About Section with Dynamic Neural Network Simulation */}
        <AboutSection />

        {/* Technology Ecosystem */}
        <TechStack />

        {/* Contact & Inquiry Section */}
        <ContactSection initialService={selectedService} />
      </main>

      {/* Production Footer */}
      <Footer
        onOpenLegal={(type) => setLegalModalType(type)}
        onSelectService={handleSelectService}
      />

      {/* Legal Dialogs (Privacy Policy & Terms) */}
      <LegalModals
        type={legalModalType}
        onClose={() => setLegalModalType(null)}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Switch>
        {/* Admin Authentication Routes */}
        <Route path="/admin/login" component={AdminLogin} />
        <Route path="/admin/forgot-password" component={AdminForgotPassword} />
        <Route path="/admin/reset-password" component={AdminResetPassword} />

        {/* Admin Console Protected Routes */}
        <Route path="/admin" component={AdminOverview} />
        <Route path="/admin/leads" component={AdminLeads} />
        <Route path="/admin/services" component={AdminServices} />
        <Route path="/admin/projects" component={AdminProjects} />
        <Route path="/admin/users" component={AdminUsers} />
        <Route path="/admin/notifications" component={AdminNotifications} />
        <Route path="/admin/settings" component={AdminSettings} />
        <Route path="/admin/audit-logs" component={AdminAuditLogs} />

        {/* Public Landing Page Fallback */}
        <Route path="/" component={PublicLandingPage} />
        <Route component={PublicLandingPage} />
      </Switch>
    </AuthProvider>
  );
}
