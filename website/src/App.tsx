import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { About } from './components/About';
import { Features } from './components/Features';
import { Architecture } from './components/Architecture';
import { Benefits } from './components/Benefits';
import { DownloadCenter } from './components/DownloadCenter';
import { InstallGuide } from './components/InstallGuide';
import { Documentation } from './components/Documentation';
import { GitHubSection } from './components/GitHubSection';
import { Footer } from './components/Footer';

export default function App() {
  const [activeSection, setActiveSection] = useState('hero');

  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    const sectionIds = [
      'hero',
      'about',
      'features',
      'architecture',
      'benefits',
      'download',
      'install',
      'docs',
      'github',
    ];

    const handleScroll = () => {
      const scrollPosition = window.scrollY + 200;
      for (const id of sectionIds) {
        const el = document.getElementById(id);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveSection(id);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-navy-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200 antialiased">
      <Navbar
        activeSection={activeSection}
        onNavigate={scrollToSection}
      />
      <main className="flex-1">
        <Hero
          onExplore={() => scrollToSection('about')}
          onDownload={() => scrollToSection('download')}
        />
        <About />
        <Features />
        <Architecture />
        <Benefits />
        <DownloadCenter />
        <InstallGuide />
        <Documentation />
        <GitHubSection />
      </main>
      <Footer onNavigate={scrollToSection} />
    </div>
  );
}
