'use client';

import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db/dexie';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { PlusCircle, Info } from 'lucide-react';

export default function AddMedicationForm() {
  const { t, dir } = useLanguage();
  const members = useLiveQuery(() => db.familyMembers.toArray()) || [];

  const [formData, setFormData] = useState({
    name: '',
    memberId: '',
    dosage: '',
    dosageUnit: 'mg',
    timingType: 'fixed_time',
    first_dose_time: '',
    frequency_interval: '12',
    mealType: 'lunch',
    mealRelation: 'after'
  });

  const [successMsg, setSuccessMsg] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.memberId || !formData.name) return;

    await db.medications.add({
      memberId: parseInt(formData.memberId),
      name: formData.name,
      dosage: formData.dosage,
      dosageUnit: formData.dosageUnit,
      timingType: formData.timingType as 'fixed_time' | 'interval_hours' | 'meal',
      first_dose_time: formData.first_dose_time,
      frequency_interval: parseInt(formData.frequency_interval),
      mealType: formData.mealType as 'breakfast' | 'lunch' | 'dinner',
      mealRelation: formData.mealRelation as 'before' | 'after',
      isActive: true,
    });

    setSuccessMsg(t.addMed.success);
    setTimeout(() => setSuccessMsg(''), 3000);
    // Reset form
    setFormData({ ...formData, name: '', dosage: '', first_dose_time: '' });
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6 max-w-4xl mx-auto">
      <div className="flex items-center mb-6 border-b border-slate-100 pb-4">
        <PlusCircle className="h-6 w-6 text-emerald-500 mr-2 rtl:ml-2" />
        <h2 className="text-2xl font-bold text-slate-800">{t.addMed.formTitle}</h2>
      </div>

      {successMsg && (
        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg flex items-center">
          <Info className="h-5 w-5 mr-2 rtl:ml-2" />
          {successMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">{t.addMed.medName}</label>
            <input
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              className="w-full rounded-md border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">{t.addMed.forMember}</label>
            <select
              name="memberId"
              required
              value={formData.memberId}
              onChange={handleChange}
              className="w-full rounded-md border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">{t.addMed.selectMember}</option>
              {members.map(m => (
                <option key={m.id} value={m.id}>{m.name} ({m.relation})</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">{t.addMed.dosage}</label>
            <input
              type="number"
              name="dosage"
              required
              value={formData.dosage}
              onChange={handleChange}
              placeholder={t.addMed.dosagePlaceholder}
              className="w-full rounded-md border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">{t.addMed.unit}</label>
            <select
              name="dosageUnit"
              value={formData.dosageUnit}
              onChange={handleChange}
              className="w-full rounded-md border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="mg">{t.addMed.unitMg}</option>
              <option value="ml">{t.addMed.unitMl}</option>
              <option value="pills">{t.addMed.unitPills}</option>
              <option value="drops">{t.addMed.unitDrops}</option>
            </select>
          </div>
        </div>

        <div className="border-t border-slate-100 pt-6">
          <label className="block text-sm font-medium text-slate-700 mb-2">{t.addMed.timingType}</label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
            {['fixed_time', 'interval_hours', 'meal'].map((type) => (
              <label key={type} className={`flex items-center justify-center p-3 rounded-lg border cursor-pointer transition-colors ${formData.timingType === type ? 'bg-blue-50 border-blue-500 text-blue-700' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                <input
                  type="radio"
                  name="timingType"
                  value={type}
                  checked={formData.timingType === type}
                  onChange={handleChange}
                  className="sr-only"
                />
                <span className="text-sm font-medium">
                  {type === 'fixed_time' ? t.addMed.fixedTime : type === 'interval_hours' ? t.addMed.intervalHours : t.addMed.withMeals}
                </span>
              </label>
            ))}
          </div>

          {/* Conditional Fields based on Timing Type */}
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
            {formData.timingType === 'fixed_time' && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">{t.addMed.time}</label>
                <input
                  type="time"
                  name="first_dose_time"
                  required
                  value={formData.first_dose_time}
                  onChange={handleChange}
                  className="w-full md:w-1/2 rounded-md border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}

            {formData.timingType === 'interval_hours' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">{t.addMed.firstDoseTime}</label>
                  <input
                    type="time"
                    name="first_dose_time"
                    required
                    value={formData.first_dose_time}
                    onChange={handleChange}
                    className="w-full rounded-md border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">{t.addMed.intervalAmount}</label>
                  <select
                    name="frequency_interval"
                    value={formData.frequency_interval}
                    onChange={handleChange}
                    className="w-full rounded-md border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="24">{t.addMed.every24h}</option>
                    <option value="12">{t.addMed.every12h}</option>
                    <option value="8">{t.addMed.every8h}</option>
                    <option value="6">{t.addMed.every6h}</option>
                  </select>
                </div>
              </div>
            )}

            {formData.timingType === 'meal' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">{t.addMed.mealType}</label>
                  <select
                    name="mealType"
                    value={formData.mealType}
                    onChange={handleChange}
                    className="w-full rounded-md border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="breakfast">{t.addMed.breakfast}</option>
                    <option value="lunch">{t.addMed.lunch}</option>
                    <option value="dinner">{t.addMed.dinner}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">{t.addMed.mealRelation}</label>
                  <select
                    name="mealRelation"
                    value={formData.mealRelation}
                    onChange={handleChange}
                    className="w-full rounded-md border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="before">{t.addMed.beforeMeal}</option>
                    <option value="after">{t.addMed.afterMeal}</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors shadow-md"
        >
          {t.addMed.save}
        </button>
      </form>
    </div>
  );
}
