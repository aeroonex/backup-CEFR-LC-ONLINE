"use client";

import React from 'react';
import ScrollFloat from '@/components/ScrollFloat'; // Import ScrollFloat component

const AdvantagesSection: React.FC = () => {
  return (
    <section id="afzalliklar" className="py-16 sm:py-24 content-layer">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <ScrollFloat tag="h2" containerClassName="text-base text-ferrari-red font-semibold tracking-wide uppercase">CEFR LC Farqi</ScrollFloat>
          <ScrollFloat tag="p" containerClassName="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            CEFR LC — To‘g‘ri tanlov!
          </ScrollFloat>
        </div>

        <div className="mt-10">
          <dl className="space-y-10 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-10">
            {/* Afzallik 1 */}
            <div className="relative bg-white p-6 rounded-xl shadow-lg hover:shadow-2xl transition duration-300 transform hover:scale-[1.01]">
              <dt>
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-full bg-ferrari-red text-white">
                  <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.583 4.887a1 1 0 00.95.691h5.143c.969 0 1.371 1.24.588 1.81l-4.15 3.018a1 1 0 00-.363 1.118l1.583 4.887c.3.921-.755 1.688-1.54 1.118l-4.15-3.018a1 1 0 00-1.175 0l-4.15 3.018c-.784.57-1.838-.197-1.54-1.118l1.583-4.887a1 1 0 00-.363-1.118l-4.15-3.018c-.783-.57-.381-1.81.588-1.81h5.143a1 1 0 00.95-.691l1.583-4.887z" />
                  </svg>
                </div>
                <ScrollFloat tag="p" containerClassName="ml-16 text-lg leading-6 font-medium text-gray-900">Yuqori sifat — Har bir kurs CEFR talablari asosida ishlab chiqilgan</ScrollFloat>
              </dt>
            </div>

            {/* Afzallik 2 */}
            <div className="relative bg-white p-6 rounded-xl shadow-lg hover:shadow-2xl transition duration-300 transform hover:scale-[1.01]">
              <dt>
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-full bg-ferrari-red text-white">
                  <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.007 12.007 0 002.944 12c0 2.87 1.14 5.485 2.997 7.375.111.114.225.225.34.336A12 12 0 0012 22c2.89 0 5.51-.832 7.719-2.25a.5.5 0 00.222-.222A11.995 11.995 0 0021.056 12c0-2.87-1.14-5.485-2.997-7.375z" />
                  </svg>
                </div>
                <ScrollFloat tag="p" containerClassName="ml-16 text-lg leading-6 font-medium text-gray-900">Moslashuvchanlik — Darslarni xohlagan joyda va xohlagan vaqtda tomosha qiling</ScrollFloat>
              </dt>
            </div>

            {/* Afzallik 3 */}
            <div className="relative bg-white p-6 rounded-xl shadow-lg hover:shadow-2xl transition duration-300 transform hover:scale-[1.01]">
              <dt>
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-full bg-ferrari-red text-white">
                  <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 10v-1m-4 0h8m-4 0h-1v-2.5a.5.5 0 01.5-.5h2a.5.5 0 01.5.5V17H8z" />
                  </svg>
                </div>
                <ScrollFloat tag="p" containerClassName="ml-16 text-lg leading-6 font-medium text-gray-900">Hamyonbop narxlar — Sifat va narx muvozanati</ScrollFloat>
              </dt>
            </div>

            {/* Afzallik 4 */}
            <div className="relative bg-white p-6 rounded-xl shadow-lg hover:shadow-2xl transition duration-300 transform hover:scale-[1.01]">
              <dt>
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-full bg-ferrari-red text-white">
                  <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.3-.356-1.857M7 20v-2a3 3 0 015.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M12 11a5 5 0 110-10 5 5 0 010 10zm-3 8h6a3 3 0 000-6H9a3 3 0 000 6z" />
                  </svg>
                </div>
                <ScrollFloat tag="p" containerClassName="ml-16 text-lg leading-6 font-medium text-gray-900">Doimiy yordam — 24/7 qo‘llab-quvvatlash xizmati</ScrollFloat>
              </dt>
            </div>
          </dl>
        </div>
      </div>
    </section>
  );
};

export default AdvantagesSection;