import Dexie, { type EntityTable } from 'dexie';

export interface FamilyMember {
  id: number;
  name: string;
  relation: string;
}

export interface Medication {
  id: number;
  memberId: number;
  name: string;
  dosage: string;
  dosageUnit: string;
  timingType: 'fixed_time' | 'interval_hours' | 'meal';
  frequency_interval?: number; // e.g., 12, 8, 6 hours
  first_dose_time?: string; // HH:MM
  mealType?: 'breakfast' | 'lunch' | 'dinner';
  mealRelation?: 'before' | 'after';
  isActive: boolean;
}

export interface MedicationHistory {
  id: number;
  medId: number;
  date: string; // YYYY-MM-DD
  takenAt: string; // ISO string or HH:MM
  status: 'taken' | 'skipped';
}

const db = new Dexie('FamilyHealthDB') as Dexie & {
  familyMembers: EntityTable<FamilyMember, 'id'>;
  medications: EntityTable<Medication, 'id'>;
  history: EntityTable<MedicationHistory, 'id'>;
};

// Schema declaration
db.version(1).stores({
  familyMembers: '++id, name, relation',
  medications: '++id, memberId, name, timingType, isActive, mealType, mealRelation',
  history: '++id, medId, date, status'
});

export { db };
