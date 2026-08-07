"use client";

import React from 'react';
import { Phone } from 'lucide-react'; // Phone icon for call center

const LandingFooter: React.FC = () => {
  return (
    <footer className="bg-white content-layer border-t border-gray-200">
      <div className="max-w-7xl mx-auto py-12 px-4 overflow-hidden sm:px-6 lg:px-8">
        {/* Top section: Logo, Phone, Email */}
        <div className="flex flex-col md:flex-row justify-between items-center md:items-start mb-8 space-y-6 md:space-y-0">
          {/* Logo and Name */}
          <div className="flex items-center space-x-3">
            {/* Using text as logo for now, can be replaced with an image later */}
            <div className="text-3xl font-extrabold text-gray-900">CEFR LC</div>
            <div className="text-gray-600 text-sm">English school</div>
          </div>

          {/* Phone Number */}
          <div className="flex items-center space-x-2 self-end md:self-auto"> {/* self-end qo'shildi */}
            <div className="text-right">
              <p className="text-xl font-bold text-gray-900">+998 (93) 127 33 00</p> {/* Telefon raqami yangilandi */}
              <p className="text-gray-600 text-sm">Call markazi</p>
            </div>
            <a href="tel:+998931273300" className="bg-green-500 p-3 rounded-full text-white hover:bg-green-600 transition-colors"> {/* Telefon raqami yangilandi */}
              <Phone className="h-6 w-6" />
            </a>
          </div>
        </div>

        {/* Email */}
        <div className="text-center md:text-left mb-8">
          <a href="mailto:younineacademy@gmail.com" className="text-gray-700 hover:text-ferrari-red transition-colors">younineacademy@gmail.com</a>
        </div>

        {/* Social Media Icons */}
        <div className="flex justify-center md:justify-start space-x-4 mb-8">
          {/* Telegram */}
          <a href="https://t.me/cefrcentreuz" target="_blank" rel="noopener noreferrer" className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 transition duration-150">
            <svg viewBox="0 0 30 30" xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 fill-gray-700">
              <path d="M 9.9980469 3 C 6.1390469 3 3 6.1419531 3 10.001953 L 3 20.001953 C 3 23.860953 6.1419531 27 10.001953 27 L 20.001953 27 C 23.860953 27 27 23.858047 27 19.998047 L 27 9.9980469 C 27 6.1390469 23.858047 3 19.998047 3 L 9.9980469 3 z M 22 7 C 22.552 7 23 7.448 23 8 C 23 8.552 22.552 9 22 9 C 21.448 9 21 8.552 21 8 C 21 7.448 21.448 7 22 7 z M 15 9 C 18.309 9 21 11.691 21 15 C 21 18.309 18.309 21 15 21 C 11.691 21 9 18.309 9 15 C 9 11.691 11.691 9 15 9 z M 15 11 A 4 4 0 0 0 11 15 A 4 4 0 0 0 15 19 A 4 4 0 0 0 19 15 A 4 4 0 0 0 15 11 z"></path>
            </svg>
          </a>
          {/* YouTube */}
          <a href="#" className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 transition duration-150">
            <svg className="h-5 w-5 fill-gray-700" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM10 16.5V7.5L16 12L10 16.5Z" />
            </svg>
          </a>
          {/* Facebook */}
          <a href="#" className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 transition duration-150">
            <svg className="h-5 w-5 fill-gray-700" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C6.47715 2 2 6.47715 2 12C2 17.0132 5.65705 21.2154 10.5476 21.9157V14.25H7.88086V12H10.5476V9.76546C10.5476 7.1933 12.0379 5.76546 14.4934 5.76546C15.6209 5.76546 16.5749 5.85789 16.8949 5.90001V8.30857H15.3248C14.0779 8.30857 13.8029 8.90001 13.8029 9.70001V12H16.434L16.011 14.25H13.8029V21.9157C18.343 21.128 22 16.991 22 12C22 6.47715 17.5228 2 12 2Z" />
            </svg>
          </a>
          {/* Instagram */}
          <a href="#" className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 transition duration-150">
            <svg className="h-5 w-5 fill-gray-700" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2ZM12 6.5C14.4853 6.5 16.5 8.51472 16.5 11C16.5 13.4853 14.4853 15.5 12 15.5C9.51472 15.5 7.5 13.4853 7.5 11C7.5 8.51472 9.51472 6.5 12 6.5ZM18.5 7.5C19.0523 7.5 19.5 7.05228 19.5 6.5C19.5 5.94772 19.0523 5.5 18.5 5.5C17.9477 5.5 17.5 5.94772 17.5 6.5C17.5 7.05228 17.9477 7.5 18.5 7.5Z" />
            </svg>
          </a>
        </div>

        {/* App Download Buttons */}
        <div className="flex flex-col sm:flex-row justify-center md:justify-start items-center space-y-4 sm:space-y-0 sm:space-x-4 mb-8">
          <a href="#" className="flex items-center px-4 py-2 bg-gray-800 text-white rounded-lg shadow-md hover:bg-gray-700 transition-colors">
            <svg className="h-6 w-6 mr-2" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 2.16c5.43 0 9.84 4.41 9.84 9.84 0 5.43-4.41 9.84-9.84 9.84-5.43 0-9.84-4.41-9.84-9.84C2.16 6.57 6.57 2.16 12 2.16zM12 4.32c-4.23 0-7.68 3.45-7.68 7.68 0 4.23 3.45 7.68 7.68 7.68 4.23 0 7.68-3.45 7.68-7.68 0-4.23-3.45-7.68-7.68-7.68zM12 8.64c-1.85 0-3.36 1.51-3.36 3.36 0 1.85 1.51 3.36 3.36 3.36 1.85 0 3.36-1.51 3.36-3.36 0-1.85-1.51-3.36-3.36-3.36z" />
            </svg>
            <span>Download on the <br /> <strong>App Store</strong></span>
          </a>
          <a href="#" className="flex items-center px-4 py-2 bg-gray-800 text-white rounded-lg shadow-md hover:bg-gray-700 transition-colors">
            <svg className="h-6 w-6 mr-2" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 2.16c5.43 0 9.84 4.41 9.84 9.84 0 5.43-4.41 9.84-9.84 9.84-5.43 0-9.84-4.41-9.84-9.84C2.16 6.57 6.57 2.16 12 2.16zM12 4.32c-4.23 0-7.68 3.45-7.68 7.68 0 4.23 3.45 7.68 7.68 7.68 4.23 0 7.68-3.45 7.68-7.68 0-4.23-3.45-7.68-7.68-7.68zM12 8.64c-1.85 0-3.36 1.51-3.36 3.36 0 1.85 1.51 3.36 3.36 3.36 1.85 0 3.36-1.51 3.36-3.36 0-1.85-1.51-3.36-3.36-3.36z" />
            </svg>
            <span>GET IT ON <br /> <strong>Google Play</strong></span>
          </a>
        </div>

        {/* Ommaviy offerta */}
        <div className="text-center md:text-left mb-4">
          <a href="#" className="text-gray-700 hover:text-ferrari-red transition-colors underline">Ommaviy offerta</a>
        </div>

        {/* Copyright */}
        <p className="text-center md:text-left text-base text-gray-600">
          &copy; 2013-2025 — Barcha huquqlar himoyalangan.
        </p>
      </div>
    </footer>
  );
};

export default LandingFooter;