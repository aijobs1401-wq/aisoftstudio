/**
 * AI SOFT STUDIO - Main Application Entry
 * Futuristic Digital Experience & Software Engineering
 * With Full Admin Console & Supabase Authentication
 */

import { useState } from 'react';
import { Route, Switch } from 'wouter';
import { AuthProvider } from './context/AuthContext';

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
