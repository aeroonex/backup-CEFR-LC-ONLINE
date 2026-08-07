"use client";

import React from 'react';
import ApplicationForm from './ApplicationForm';
import ContactInfo from './ContactInfo';

const ApplicationContactLayout: React.FC = () => {
  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="flex flex-col sm:flex-row gap-8 items-stretch justify-center"> {/* flex-col o'rniga sm:flex-row ishlatildi, mobil uchun ham yonma-yon turishi uchun */}
          <div className="w-full sm:w-1/2 lg:w-2/5 flex"> {/* Mobil va kichik ekranlarda 1/2 kenglik */}
            <ApplicationForm />
          </div>
          <div className="w-full sm:w-1/2 lg:w-2/5 flex"> {/* Mobil va kichik ekranlarda 1/2 kenglik */}
            <ContactInfo />
          </div>
        </div>
      </div>
    </section>
  );
};

export default ApplicationContactLayout;