"use client";

import React from 'react';
// ScrollFloat komponenti endi bu yerda ishlatilmaydi

const ContactSection: React.FC = () => {
  return (
    <section id="aloqa" className="bg-ferrari-red py-16 sm:py-24 content-layer">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
          Bugundan boshlang!
        </h2>
        <p className="mt-4 text-xl text-red-100 max-w-3xl mx-auto">
          Agar savollaringiz bo‘lsa, bemalol biz bilan bog‘laning yoki istalgan kursni sinab ko‘ring.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
          <a href="#kurslar" className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-full shadow-sm text-ferrari-red bg-white hover:bg-gray-50 transition duration-300 transform hover:scale-105">
            Barcha kurslar
          </a>
          <a href="tel:+998931273300" className="inline-flex items-center justify-center px-6 py-3 border border-white text-base font-medium rounded-full text-white hover:bg-white hover:text-ferrari-red transition duration-300 transform hover:scale-105">
            Biz bilan bog‘lanish
          </a>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;