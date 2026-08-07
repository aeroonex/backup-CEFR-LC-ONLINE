import React from 'react';
import TrueFocus from '@/components/TrueFocus';
import ScrollFloat from '@/components/ScrollFloat';

const HeroSection: React.FC = () => {
  return (
    <section className="bg-white py-16 sm:py-24 lg:py-32 content-layer relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row items-center justify-between relative z-10">
        {/* Matn qismi */}
        <div className="lg:w-1/2 mb-10 lg:mb-0 text-left">
          <h1 className="text-2xl sm:text-4xl lg:text-6xl font-extrabold text-gray-900 leading-tight">
            <span className="text-ferrari-red">CEFR ONLINE</span> — Sizning kelajagingiz uchun mustahkam poydevor!
          </h1>
          <p className="mt-4 text-base sm:text-xl text-gray-600 max-w-lg lg:mx-0">
            Onlayn video darsliklarimiz orqali fanlarni chuqur o‘rganing va o‘z CEFR darajangizni bosqichma-bosqich oshirib boring.
          </p>
          <div className="mt-8 flex justify-between">
            <a href="#kurslar" className="inline-flex items-center justify-center px-6 py-2 text-sm sm:px-8 sm:py-3 sm:text-base font-medium rounded-full shadow-lg text-white bg-ferrari-red hover:bg-red-700 transform transition duration-300 hover:scale-105">
              Kurslarni ko‘rish
            </a>
            <a href="#afzalliklar" className="animated-button px-6 py-2"> {/* px-6 py-2 qo'shildi */}
              <svg viewBox="0 0 24 24" className="arr-2" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M16.1716 10.9999L10.8076 5.63589L12.2218 4.22168L20 11.9999L12.2218 19.778L10.8076 18.3638L16.1716 12.9999H4V10.9999H16.1716Z"
                ></path>
              </svg>
              <span className="text text-sm">Afzalliklarimiz</span> {/* text-sm qo'shildi */}
              <span className="circle"></span>
              <svg viewBox="0 0 24 24" className="arr-1" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M16.1716 10.9999L10.8076 5.63589L12.2218 4.22168L20 11.9999L12.2218 19.778L10.8076 18.3638L16.1716 12.9999H4V10.9999H16.1716Z"
                ></path>
              </svg>
            </a>
          </div>
        </div>
        {/* TrueFocus komponenti */}
        <div className="lg:w-1/2 flex justify-center lg:justify-end p-4">
          <div className="bg-ferrari-red rounded-2xl shadow-2xl flex items-center justify-center w-full max-w-md h-64">
            <TrueFocus
              sentence="Online Ta'lim"
              blurAmount={3}
              borderColor="#FFFFFF"
              glowColor="rgba(255, 255, 255, 0.6)"
              animationDuration={0.8}
              pauseBetweenAnimations={1.5}
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;