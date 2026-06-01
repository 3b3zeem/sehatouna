'use client';

import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db/dexie';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { Users, UserPlus } from 'lucide-react';

export default function FamilyList() {
  const { t, dir } = useLanguage();
  const members = useLiveQuery(() => db.familyMembers.toArray()) || [];

  const [formData, setFormData] = useState({ name: '', relation: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.relation) return;

    await db.familyMembers.add({
      name: formData.name,
      relation: formData.relation,
    });

    setFormData({ name: '', relation: '' });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      <div className="md:col-span-1">
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center mb-6 border-b border-slate-100 pb-4">
            <UserPlus className="h-6 w-6 text-blue-500 mr-2 rtl:ml-2" />
            <h2 className="text-xl font-bold text-slate-800">{t.family.addMember}</h2>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">{t.family.name}</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="w-full rounded-md border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">{t.family.relation}</label>
              <input
                type="text"
                required
                value={formData.relation}
                onChange={e => setFormData({ ...formData, relation: e.target.value })}
                placeholder={t.family.relationPlaceholder}
                className="w-full rounded-md border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
            >
              {t.family.save}
            </button>
          </form>
        </div>
      </div>

      <div className="md:col-span-2">
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center mb-6 border-b border-slate-100 pb-4">
            <Users className="h-6 w-6 text-emerald-500 mr-2 rtl:ml-2" />
            <h2 className="text-xl font-bold text-slate-800">{t.family.profiles}</h2>
          </div>

          {members.length === 0 ? (
            <div className="text-center py-8 text-slate-500 bg-slate-50 rounded-lg border border-dashed border-slate-300">
              {t.family.noMembers}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {members.map(member => (
                <div key={member.id} className="p-4 rounded-lg border border-slate-200 bg-slate-50 flex items-center shadow-sm">
                  <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xl mr-4 rtl:ml-4 rtl:mr-0">
                    {member.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800">{member.name}</h3>
                    <p className="text-sm text-slate-500">{member.relation}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
