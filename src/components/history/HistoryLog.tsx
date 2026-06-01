'use client';

import React from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db/dexie';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { CalendarDays, CheckCircle2, XCircle } from 'lucide-react';
import { subDays, format } from 'date-fns';

export default function HistoryLog() {
  const { t } = useLanguage();
  
  // Get history for the last 7 days
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    return format(subDays(new Date(), i), 'yyyy-MM-dd');
  });

  const history = useLiveQuery(() => {
    return db.history.where('date').anyOf(last7Days).toArray();
  }) || [];

  const medications = useLiveQuery(() => db.medications.toArray()) || [];
  
  // Calculate compliance (taken vs scheduled)
  // For simplicity, we just count 'taken' records in the last 7 days vs total active meds * 7
  const activeMedsCount = medications.filter(m => m.isActive).length;
  const expectedDoses = activeMedsCount * 7;
  const takenDoses = history.filter(h => h.status === 'taken').length;
  const compliancePercentage = expectedDoses > 0 ? Math.round((takenDoses / expectedDoses) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-4">
          <div className="flex items-center">
            <CalendarDays className="h-6 w-6 text-blue-500 mr-2 rtl:ml-2" />
            <h2 className="text-xl font-bold text-slate-800">{t.history.compliance}</h2>
          </div>
          <div className="text-3xl font-extrabold text-emerald-500">
            {compliancePercentage}%
          </div>
        </div>

        {history.length === 0 ? (
          <div className="text-center py-8 text-slate-500 bg-slate-50 rounded-lg border border-dashed border-slate-300">
            {t.history.noHistory}
          </div>
        ) : (
          <div className="space-y-8">
            {last7Days.map(date => {
              const dayHistory = history.filter(h => h.date === date);
              if (dayHistory.length === 0) return null;

              return (
                <div key={date}>
                  <h3 className="font-semibold text-slate-700 mb-3 bg-slate-100 px-3 py-1.5 rounded-md inline-block text-sm">
                    {date === format(new Date(), 'yyyy-MM-dd') ? t.history.today : format(new Date(date), 'EEEE, MMM d')}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {dayHistory.map(record => {
                      const med = medications.find(m => m.id === record.medId);
                      return (
                        <div key={record.id} className="p-4 rounded-lg border border-slate-200 bg-white flex items-center justify-between shadow-sm">
                          <div>
                            <h4 className="font-bold text-slate-800">{med ? med.name : t.history.unknownMed}</h4>
                            <p className="text-sm text-slate-500">{t.history.takenAt}: {record.takenAt}</p>
                          </div>
                          <div>
                            {record.status === 'taken' ? (
                              <CheckCircle2 className="h-6 w-6 text-emerald-500" />
                            ) : (
                              <XCircle className="h-6 w-6 text-red-500" />
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
