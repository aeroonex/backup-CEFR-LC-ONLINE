"use client";

import React from 'react';

const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center space-y-4 p-8">
      <div className="blob-loader"></div>
      <p className="cefr-lc-text mt-8">CEFR LC yuklanmoqda...</p>
    </div>
  );
};

export default LoadingSpinner;