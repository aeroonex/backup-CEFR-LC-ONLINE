"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Zap, PlusCircle } from 'lucide-react';
import ScrollFloat from '@/components/ScrollFloat';
import { supabase } from '@/integrations/supabase/client'; // Import supabase
import { showError } from '@/utils/toast';
import LoadingSpinner from '@/components/ui/LoadingSpinner'; // Import LoadingSpinner

interface Tariff {
  id: string;
  title: string;
  price: number;
  description: string | null;
  features: string[];
  type: 'fargona' | 'online';
  gradient_class: string;
}

interface TariffCardProps {
  title: string;
  price: number;
  description?: string | null;
  features: string[];
  buttonText: string;
  gradientClass: string;
}

const TariffCard: React.FC<TariffCardProps> = ({ title, price, description, features, buttonText, gradientClass }) => {
  return (
    <Card className={`relative overflow-hidden rounded-2xl shadow-xl p-6 text-white flex flex-col ${gradientClass}`}>
      <CardHeader className="p-0 mb-4 relative z-10 flex-shrink-0">
        <CardTitle className="text-2xl font-bold">{title}</CardTitle>
        <p className="text-4xl font-extrabold mt-2">{price.toLocaleString()} <span className="text-base font-normal">UZS</span></p>
        {description && <p className="text-sm mt-1 opacity-90">{description}</p>}
      </CardHeader>
      <CardContent className="p-0 space-y-3 relative z-10 flex-grow">
        <ul className="space-y-2 text-sm">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start">
              <Zap className="h-5 w-5 mr-2 text-yellow-300 flex-shrink-0" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>
      <div className="mt-6 relative z-10 flex-shrink-0">
        <Button className="w-full bg-white/20 hover:bg-white/30 text-white font-semibold py-2.5 rounded-xl transition-colors flex items-center justify-center">
          <PlusCircle className="h-5 w-5 mr-2" /> {buttonText}
        </Button>
      </div>
    </Card>
  );
};

const TariffsSection: React.FC = () => {
  const [tariffs, setTariffs] = useState<Tariff[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTariffs = useCallback(async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('tariffs')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Tariflarni yuklashda xato:", error);
      showError("Tariflarni yuklashda xato yuz berdi.");
      setTariffs([]);
    } else {
      setTariffs(data || []);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchTariffs();
  }, [fetchTariffs]);

  const fargonaTariffs = tariffs.filter(t => t.type === 'fargona');
  const onlineTariffs = tariffs.filter(t => t.type === 'online');

  if (isLoading) {
    return (
      <section id="tariflar" className="py-16 sm:py-24 bg-gray-100 content-layer">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <ScrollFloat tag="h2" containerClassName="text-base text-ferrari-red font-semibold tracking-wide uppercase">
            Tariflar va Narxlar
          </ScrollFloat>
          <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            Siz uchun eng mos tarifni tanlang
          </p>
          <div className="mt-10 flex justify-center items-center h-64">
            <LoadingSpinner />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="tariflar" className="py-16 sm:py-24 bg-gray-100 content-layer">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <ScrollFloat tag="h2" containerClassName="text-base text-ferrari-red font-semibold tracking-wide uppercase">
          Tariflar va Narxlar
        </ScrollFloat>
        <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
          Siz uchun eng mos tarifni tanlang
        </p>

        <div className="mt-10 flex justify-center">
          <Tabs defaultValue="online" className="w-full max-w-3xl">
            <TabsList className="grid w-full grid-cols-2 bg-gray-200 rounded-full p-1">
              <TabsTrigger value="fargona" className="rounded-full data-[state=active]:bg-ferrari-red data-[state=active]:text-white">Farg'ona</TabsTrigger>
              <TabsTrigger value="online" className="rounded-full data-[state=active]:bg-ferrari-red data-[state=active]:text-white">ONLINE</TabsTrigger>
            </TabsList>
            <TabsContent value="fargona" className="mt-8">
              {fargonaTariffs.length === 0 ? (
                <p className="text-gray-600">Farg'ona shahri uchun tariflar tez orada e'lon qilinadi.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {fargonaTariffs.map((tariff) => (
                    <TariffCard
                      key={tariff.id}
                      title={tariff.title}
                      price={tariff.price}
                      description={tariff.description}
                      features={tariff.features}
                      buttonText="Ro'yxatdan o'tish"
                      gradientClass={tariff.gradient_class}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
            <TabsContent value="online" className="mt-8">
              {onlineTariffs.length === 0 ? (
                <p className="text-gray-600">ONLINE tariflar tez orada e'lon qilinadi.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {onlineTariffs.map((tariff) => (
                    <TariffCard
                      key={tariff.id}
                      title={tariff.title}
                      price={tariff.price}
                      description={tariff.description}
                      features={tariff.features}
                      buttonText="Ro'yxatdan o'tish"
                      gradientClass={tariff.gradient_class}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </section>
  );
};

export default TariffsSection;