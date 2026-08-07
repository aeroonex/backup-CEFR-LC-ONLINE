"use client";

import React from 'react';
import MarketingCourseCard from '@/components/landing/MarketingCourseCard'; // Import MarketingCourseCard
import ScrollFloat from '@/components/ScrollFloat'; // Import ScrollFloat component

const CoursesSection: React.FC = () => {
  const coursesData = [
    {
      id: 'math',
      imageSrc: 'https://placehold.co/550x350/FF2800/FFFFFF?text=Matematika', // Placeholder image
      title: 'Matematika',
      description: 'Algebra va geometriya bo‘yicha to‘liq o‘quv dasturi. Abituriyentlar uchun juda qulay.',
      lessonsCount: '120 dars',
      level: 'Oliy daraja',
      price: '450 000 so‘m',
      buttonText: 'Sotib olish',
      onButtonClick: () => console.log('Matematika sotib olish'),
    },
    {
      id: 'english',
      imageSrc: 'https://placehold.co/550x350/FF2800/FFFFFF?text=Ingliz+Tili', // Placeholder image
      title: 'Ingliz Tili',
      description: 'CEFR B2 darajasiga tayyorlov. Grammatikani mustahkamlash va lug‘at boyligini oshirishga yordam beradi.',
      lessonsCount: '180 dars',
      level: 'B2 daraja',
      price: '580 000 so‘m',
      buttonText: 'Sotib olish',
      onButtonClick: () => console.log('Ingliz Tili sotib olish'),
    },
    {
      id: 'physics',
      imageSrc: 'https://placehold.co/550x350/FF2800/FFFFFF?text=Fizika', // Placeholder image
      title: 'Fizika',
      description: 'Mexanika, termodinamika va optika bo‘yicha sodda va tushunarli izohlar bilan.',
      lessonsCount: '95 dars',
      level: 'O‘rta daraja',
      price: '390 000 so‘m',
      buttonText: 'Sotib olish',
      onButtonClick: () => console.log('Fizika sotib olish'),
    },
  ];

  return (
    <section id="kurslar" className="py-16 sm:py-24 bg-gray-50 content-layer">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-base text-ferrari-red font-semibold tracking-wide uppercase">
            Darsliklarimiz
          </h2>
          <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            Mashhur video kurslarimiz
          </p>
          <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
            Eng talab yuqori bo‘lgan fanlar bo‘yicha yaratilgan video kurslar orqali bilimingizni kengaytiring.
          </p>
        </div>

        {/* Kurs kartalari */}
        <div className="mt-12 grid grid-cols-3 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {coursesData.map(course => (
            <MarketingCourseCard
              key={course.id}
              id={course.id}
              imageSrc={course.imageSrc}
              title={course.title}
              description={course.description}
              lessonsCount={course.lessonsCount}
              level={course.level}
              price={course.price}
              buttonText={course.buttonText}
              onButtonClick={course.onButtonClick}
            />
          ))}
        </div>

        <div className="mt-12 text-center">
          <a href="#" className="text-lg font-medium text-ferrari-red hover:text-red-700 transition duration-150 border-b-2 border-ferrari-red pb-1">
            Barcha kurslarni ko‘rish &rarr;
          </a>
        </div>
      </div>
    </section>
  );
};

export default CoursesSection;