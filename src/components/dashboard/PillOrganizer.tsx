'use client';

import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db/dexie';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { CheckCircle2, Clock } from 'lucide-react';

export default function PillOrganizer() {
  const { t, lang } = useLanguage();
  const [selectedMember, setSelectedMember] = useState<number | null>(null);

  const formatUnit = (unit: string) => {
    if (unit === 'mg') return t.addMed.unitMg;
    if (unit === 'ml') return t.addMed.unitMl;
    if (unit === 'pills') return t.addMed.unitPills;
    if (unit === 'drops') return t.addMed.unitDrops;
    return unit;
  };

  const formatTiming = (med: any) => {
    if (med.timingType === 'fixed_time') return med.first_dose_time;
    if (med.timingType === 'interval_hours') return `${t.home.every}${med.frequency_interval}${t.home.hours}`;
    
    // meal
    const rel = med.mealRelation === 'before' ? (lang === 'ar' ? 'قبل' : 'Before') : (lang === 'ar' ? 'بعد' : 'After');
    const meal = med.mealType === 'breakfast' ? t.addMed.breakfast : med.mealType === 'lunch' ? t.addMed.lunch : t.addMed.dinner;
    return `${rel} ${meal}`;
  };

  const members = useLiveQuery(() => db.familyMembers.toArray()) || [];
  
  const todayMeds = useLiveQuery(() => {
    let query = db.medications.where('isActive').equals(1);
    return query.toArray();
  }) || [];

  const history = useLiveQuery(() => {
    const today = new Date().toISOString().split('T')[0];
    return db.history.where('date').equals(today).toArray();
  }) || [];

  const filteredMeds = selectedMember 
    ? todayMeds.filter(med => med.memberId === selectedMember)
    : todayMeds;

  const handleTakeMed = async (medId: number) => {
    const today = new Date().toISOString().split('T')[0];
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    await db.history.add({
      medId,
      date: today,
      takenAt: now,
      status: 'taken'
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 md:p-8">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold text-slate-800 flex items-center">
          <Clock className="mr-3 rtl:ml-3 h-6 w-6 text-blue-600" />
          {t.home.todayMeds}
        </h2>
        <div className="text-sm text-slate-500 font-medium">
          {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
        </div>
      </div>

      {/* Member Filter */}
      {members.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-4 mb-6 scrollbar-hide">
          <button
            onClick={() => setSelectedMember(null)}
            className={`px-5 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-colors ${
              selectedMember === null 
                ? 'bg-blue-600 text-white' 
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {t.home.allMembers}
          </button>
          {members.map(member => (
            <button
              key={member.id}
              onClick={() => setSelectedMember(member.id)}
              className={`px-5 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-colors ${
                selectedMember === member.id 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {member.name}
            </button>
          ))}
        </div>
      )}

      {/* Meds List */}
      <div className="space-y-4">
        {filteredMeds.length === 0 ? (
          <div className="text-center py-16 text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-300 flex flex-col items-center justify-center">
            <CheckCircle2 className="h-12 w-12 text-slate-300 mb-4" />
            <p className="text-lg font-medium text-slate-600">{t.home.noMeds}</p>
          </div>
        ) : (
          filteredMeds.map(med => {
            const isTaken = history.some(h => h.medId === med.id && h.status === 'taken');
            
            return (
              <div key={med.id} className="group flex items-center justify-between p-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition-colors">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-bold text-lg text-slate-800">{med.name}</h3>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
                      {med.dosage} {formatUnit(med.dosageUnit)}
                    </span>
                  </div>
                  <p className="text-slate-500 text-sm flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-slate-400" />
                    {formatTiming(med)}
                  </p>
                </div>
                <div className="ml-4 rtl:mr-4 flex-shrink-0">
                  {isTaken ? (
                    <div className="flex items-center text-emerald-700 bg-emerald-50 border border-emerald-200 px-4 py-2 rounded-lg font-medium text-sm">
                      <CheckCircle2 className="w-5 h-5 mr-1.5 rtl:ml-1.5 text-emerald-600" />
                      {t.home.taken}
                    </div>
                  ) : (
                    <button
                      onClick={() => handleTakeMed(med.id)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-medium text-sm transition-colors"
                    >
                      {t.home.markTaken}
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
