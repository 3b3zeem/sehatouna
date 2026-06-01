'use client';

import React from 'react';
import Image from 'next/image';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import PillOrganizer from '@/components/dashboard/PillOrganizer';

export default function HomeContent() {
  const { t } = useLanguage();

  return (
    <div className="space-y-8">
      {/* Dynamic Translated Section */}
      <section className="bg-white rounded-2xl shadow-sm p-6 md:p-8 lg:p-10 border border-slate-200">
        <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
          {/* Text Content */}
          <div className="flex-1">
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-blue-900 mb-6 leading-tight">
              {t.home.title}
            </h1>
            <div className="prose max-w-none text-slate-600 space-y-5">
              <p className="leading-relaxed text-lg md:text-xl text-slate-700">
                {t.home.articleP1}
              </p>
              
              <div className="h-px w-24 bg-blue-200 my-6"></div>

              <h2 className="text-xl md:text-2xl font-bold text-blue-800 mt-6">
                {t.home.subtitle}
              </h2>
              <p className="leading-relaxed text-lg">
                {t.home.articleP2}
              </p>
            </div>
          </div>
          
          {/* Illustration */}
          <div className="flex-1 w-full max-w-md lg:max-w-none relative">
            <div className="relative aspect-square md:aspect-video lg:aspect-square w-full rounded-2xl overflow-hidden bg-blue-50/50 flex items-center justify-center p-4">
              <Image 
                src="/images/hero-illustration.png" 
                alt="Family Health Illustration" 
                width={500} 
                height={500} 
                className="object-contain drop-shadow-sm mix-blend-multiply select-none"
                priority
                draggable={false}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Client Rendered Interactive Component */}
      <section>
        <PillOrganizer />
      </section>
    </div>
  );
}
