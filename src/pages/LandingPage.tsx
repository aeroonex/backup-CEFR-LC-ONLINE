"use client";

import React from 'react';
import LandingPageHeader from '@/components/landing/LandingPageHeader'; // Import new header
import HeroSection from '@/components/landing/HeroSection';
import ResultsCarousel from '@/components/landing/ResultsCarousel'; // Import ResultsCarousel
import CoursesSection from '@/components/landing/CoursesSection';
import AdvantagesSection from '@/components/landing/AdvantagesSection';
import ContactSection from '@/components/landing/ContactSection';
import LandingFooter from '@/components/landing/LandingFooter';
import ApplicationContactLayout from '@/components/landing/ApplicationContactLayout'; // NEW: Import ApplicationContactLayout
import TariffsSection from '@/components/landing/TariffsSection'; // NEW: Import TariffsSection

const LandingPage: React.FC = () => {
  return (
    <div className="antialiased relative min-h-screen"> {/* Added relative and min-h-screen */}
      {/* Plasma komponenti bu yerdan olib tashlandi */}
      <LandingPageHeader /> {/* Using the new header */}
      <main className="content-layer">
        <HeroSection />
        <ResultsCarousel /> {/* NEW: ResultsCarousel added here */}
        <TariffsSection /> {/* NEW: TariffsSection added here */}
        <CoursesSection />
        <AdvantagesSection />
        <ContactSection />
        {/* NEW: ApplicationContactLayout komponentini eng pastiga qo'shish */}
        <section id="application-form" className="py-16 sm:py-24 bg-gray-50 content-layer">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <ApplicationContactLayout />
          </div>
        </section>
      </main>
      <LandingFooter />
    </div>
  );
};

export default LandingPage;