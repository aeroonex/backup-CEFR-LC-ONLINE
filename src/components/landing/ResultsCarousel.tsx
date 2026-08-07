"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { supabase } from '@/integrations/supabase/client';
import { showError } from '@/utils/toast';
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import ScrollFloat from '@/components/ScrollFloat'; // Import ScrollFloat component
import Autoplay from "embla-carousel-autoplay"; // NEW: Import Autoplay plugin

interface ResultImage {
  id: string;
  image_url: string;
}

const ResultsCarousel: React.FC = () => {
  const [images, setImages] = useState<ResultImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchImages = useCallback(async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('results_images')
      .select('id, image_url')
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Natija rasmlarini yuklashda xato:", error);
      showError("Natija rasmlarini yuklashda xato yuz berdi.");
      setImages([]);
    } else {
      setImages(data || []);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchImages();
  }, [fetchImages]);

  if (isLoading) {
    return (
      <section id="natijalar" className="py-16 sm:py-24 bg-gray-100 content-layer">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <ScrollFloat tag="h2" containerClassName="text-base text-ferrari-red font-semibold tracking-wide uppercase">Bizning Natijalarimiz</ScrollFloat>
          {/* "O'quvchilarimizning muvaffaqiyatlari" matni olib tashlandi */}
          <div className="mt-10 flex justify-center items-center h-64">
            <LoadingSpinner />
          </div>
        </div>
      </section>
    );
  }

  if (images.length === 0) {
    return null; // Agar rasmlar bo'lmasa, bo'limni ko'rsatmaslik
  }

  return (
    <section id="natijalar" className="py-16 sm:py-24 bg-gray-100 content-layer">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <ScrollFloat tag="h2" containerClassName="text-base text-ferrari-red font-semibold tracking-wide uppercase">Bizning Natijalarimiz</ScrollFloat>
        {/* "O'quvchilarimizning muvaffaqiyatlari" matni olib tashlandi */}
        <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
          Bizning o'quvchilarimiz erishgan ajoyib natijalar bilan tanishing.
        </p>

        <div className="mt-10">
          <Carousel
            opts={{
              align: "start",
              loop: true,
            }}
            plugins={[
              Autoplay({
                delay: 3000, // 3 soniya kechikish
                stopOnInteraction: false, // Foydalanuvchi o'zaro aloqa qilsa ham o'ynashda davom etadi
                stopOnMouseEnter: false, // Sichqoncha ustiga olib kelganda ham to'xtamaydi
              }),
            ]}
            className="w-full max-w-5xl mx-auto"
          >
            <CarouselContent>
              {images.map((image) => (
                <CarouselItem key={image.id} className="md:basis-1/2 lg:basis-1/3">
                  <div className="p-1">
                    <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
                      <CardContent className="flex aspect-a4 items-center justify-center p-0"> {/* aspect-video o'rniga aspect-a4 ishlatildi */}
                        <img
                          src={image.image_url}
                          alt="Natija rasmi"
                          className="w-full h-full object-cover rounded-lg"
                        />
                      </CardContent>
                    </Card>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        </div>
      </div>
    </section>
  );
};

export default ResultsCarousel;