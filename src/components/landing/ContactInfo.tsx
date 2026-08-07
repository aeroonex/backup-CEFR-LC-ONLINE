"use client";

import React from 'react';
import { Phone, Mail, MapPin } from 'lucide-react';

const ContactInfo: React.FC = () => {
  return (
    <div className="bg-white p-8 rounded-xl shadow-2xl w-full h-full flex flex-col justify-center"> {/* max-w-md mx-auto md:mx-0 olib tashlandi */}
      <h3 className="text-2xl font-bold text-gray-900 mb-4 text-center md:text-left">Biz bilan bog'laning</h3>
      <p className="text-gray-600 mb-6 text-center md:text-left">Savollaringiz bormi? Bizga murojaat qiling!</p>

      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Phone className="h-6 w-6 text-ferrari-red flex-shrink-0" />
          <div>
            <p className="font-semibold text-gray-900">Telefon raqami</p>
            <a href="tel:+998931273300" className="text-gray-600 hover:text-ferrari-red transition-colors">+998 93 127 3300</a>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Mail className="h-6 w-6 text-ferrari-red flex-shrink-0" />
          <div>
            <p className="font-semibold text-gray-900">Email</p>
            <a href="mailto:younineacademy@gmail.com" className="text-gray-600 hover:text-ferrari-red transition-colors">younineacademy@gmail.com</a>
          </div>
        </div>

        <div className="flex items-start gap-4">
          <MapPin className="h-6 w-6 text-ferrari-red flex-shrink-0 mt-1" />
          <div>
            <p className="font-semibold text-gray-900">Manzil</p>
            <p className="text-gray-600">Maʼrifat MFY, Konstitutsiya ko‘chasi, 47/3-uy</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactInfo;