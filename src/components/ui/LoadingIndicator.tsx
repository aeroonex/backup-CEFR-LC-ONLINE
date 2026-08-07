"use client";

import React from 'react';

interface LoadingIndicatorProps {
  messages: Map<string | number, string>;
}

const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({ messages }) => {
  if (messages.size === 0) {
    return null;
  }

  return (
    <div className="loading-indicator-container">
      {Array.from(messages.entries()).map(([id, message]) => (
        <div key={id} className="loading-message-item">
          <div className="loading-spinner-small"></div>
          <span>{message}</span>
        </div>
      ))}
    </div>
  );
};

export default LoadingIndicator;