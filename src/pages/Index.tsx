"use client";

import React from 'react';
import ApplicationContactLayout from '@/components/landing/ApplicationContactLayout'; // Import the new layout component

const Index: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Other sections of your landing page would go here */}
      <main className="py-12">
        <h1 className="text-4xl font-bold text-center text-gray-900 mb-12">Bosh sahifa</h1>
        
        {/* Render the new layout component */}
        <ApplicationContactLayout />
      </main>
    </div>
  );
};

export default Index;