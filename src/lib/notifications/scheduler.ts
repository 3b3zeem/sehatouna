import { Medication } from '@/lib/db/dexie';

// Default meal times (can be made configurable later)
const MEAL_TIMES: Record<string, string> = {
  breakfast: '07:30',
  lunch: '13:00',
  dinner: '19:30'
};

const BEFORE_MEAL_OFFSET_MIN = 15;

function getMealNameAr(mealType: string): string {
  const names: Record<string, string> = { breakfast: 'الفطار', lunch: 'الغداء', dinner: 'العشاء' };
  return names[mealType] ?? mealType;
}

function getMealNameEn(mealType: string): string {
  const names: Record<string, string> = { breakfast: 'breakfast', lunch: 'lunch', dinner: 'dinner' };
  return names[mealType] ?? mealType;
}

function getMealScheduleTimes(mealType: string, mealRelation: 'before' | 'after', maxDays: number = 3): Date[] {
  const mealTimeStr = MEAL_TIMES[mealType];
  if (!mealTimeStr) return [];
  const [h, m] = mealTimeStr.split(':').map(Number);
  const times: Date[] = [];
  const now = new Date();
  for (let i = 0; i < maxDays; i++) {
    const mealDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + i, h, m, 0, 0);
    const scheduleDate = mealRelation === 'before'
      ? new Date(mealDate.getTime() - BEFORE_MEAL_OFFSET_MIN * 60000)
      : mealDate;
    if (scheduleDate.getTime() - now.getTime() > 60000) {
      times.push(scheduleDate);
    }
  }
  return times;
}

declare global {
  interface TimestampTrigger {
    timestamp: number;
  }
  var TimestampTrigger: {
    prototype: TimestampTrigger;
    new (timestamp: number): TimestampTrigger;
  };
}

// Calculate next dose times
export function calculateNextDoseTimes(med: Medication, maxDoses: number = 5): Date[] {
  if (med.timingType === 'meal' || !med.isActive || !med.first_dose_time) return [];

  const times: Date[] = [];
  const now = new Date();
  
  const [hours, minutes] = med.first_dose_time.split(':').map(Number);
  
  if (med.timingType === 'fixed_time') {
    // Every 24 hours
    for (let i = 0; i < maxDoses; i++) {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + i, hours, minutes, 0, 0);
      if (d > now) {
        times.push(d);
      } else if (i === 0) {
        const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, hours, minutes, 0, 0);
        times.push(tomorrow);
      }
    }
  } else if (med.timingType === 'interval_hours' && med.frequency_interval) {
    // Every N hours
    let baseDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes, 0, 0);
    let diffMs = now.getTime() - baseDate.getTime();
    
    // If base date is in the future relative to now, intervalsPassed will be negative, which is fine
    let intervalsPassed = diffMs > 0 ? Math.floor(diffMs / (med.frequency_interval * 3600000)) : -1;
    let nextDoseTime = new Date(baseDate.getTime() + (intervalsPassed + 1) * med.frequency_interval * 3600000);
    
    for (let i = 0; i < maxDoses; i++) {
      times.push(new Date(nextDoseTime.getTime() + i * med.frequency_interval * 3600000));
    }
  }

  // Deduplicate and sort
  const uniqueTimes = Array.from(new Set(times.map(d => d.getTime()))).map(t => new Date(t));
  return uniqueTimes.sort((a, b) => a.getTime() - b.getTime()).slice(0, maxDoses);
}

// Global active timeouts for fallback
const activeTimeouts = new Map<string, NodeJS.Timeout>();

// Generate a OneSignal compatible date string "YYYY-MM-DD HH:mm:ss GMT-0000"
function getOneSignalDateString(date: Date): string {
  const pad = (n: number): string => n < 10 ? '0' + n : String(n);
  const offset = -date.getTimezoneOffset();
  const sign = offset >= 0 ? '+' : '-';
  const padOffset = (n: number) => {
    const abs = Math.abs(n);
    const h = Math.floor(abs / 60);
    const m = abs % 60;
    return pad(h) + pad(m);
  };
  
  return `${date.getFullYear()}-${pad(date.getMonth()+1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())} GMT${sign}${padOffset(offset)}`;
}

export async function scheduleMedicationNotifications(medications: Medication[], userId: string) {
  const schedules: object[] = [];

  // Fixed-time & interval-hours medications
  for (const med of medications) {
    if (!med.isActive || med.timingType === 'meal') continue;
    const nextTimes = calculateNextDoseTimes(med, 5);
    for (const time of nextTimes) {
      if (time.getTime() - Date.now() <= 60000) continue;
      schedules.push({
        headings: { en: 'صِحتنا | Medication Time', ar: 'صِحتنا | وقت الدواء' },
        contents: {
          en: `It's time to take: ${med.name} (${med.dosage} ${med.dosageUnit})`,
          ar: `حان وقت تناول الدواء: ${med.name} (${med.dosage} ${med.dosageUnit})`
        },
        data: { medId: med.id, action: 'medication_reminder' },
        send_after: getOneSignalDateString(time)
      });
    }
  }

  // Meal-type medications — group by mealType+mealRelation (one notification per group)
  const mealMeds = medications.filter(
    m => m.isActive && m.timingType === 'meal' && m.mealType && m.mealRelation
  );
  const mealGroups = new Map<string, Medication[]>();
  for (const med of mealMeds) {
    const key = `${med.mealType}_${med.mealRelation}`;
    if (!mealGroups.has(key)) mealGroups.set(key, []);
    mealGroups.get(key)!.push(med);
  }
  for (const [key, meds] of mealGroups) {
    const sepIdx = key.lastIndexOf('_');
    const mealType = key.substring(0, sepIdx);
    const mealRelation = key.substring(sepIdx + 1) as 'before' | 'after';
    const times = getMealScheduleTimes(mealType, mealRelation);
    for (const time of times) {
      if (mealRelation === 'before') {
        const medNames = meds.map(m => `${m.name} (${m.dosage} ${m.dosageUnit})`).join(', ');
        schedules.push({
          headings: { en: 'صِحتنا | Before-Meal Medication', ar: 'صِحتنا | دواء قبل الوجبة' },
          contents: {
            en: `Take before ${getMealNameEn(mealType)}: ${medNames}`,
            ar: `تناول قبل ${getMealNameAr(mealType)}: ${medNames}`
          },
          data: { mealType, action: 'medication_reminder' },
          send_after: getOneSignalDateString(time)
        });
      } else {
        schedules.push({
          headings: {
            en: `صِحتنا | Did you eat ${getMealNameEn(mealType)}?`,
            ar: `صِحتنا | هل تناولت ${getMealNameAr(mealType)}؟`
          },
          contents: {
            en: `You have medication to take after ${getMealNameEn(mealType)}.`,
            ar: `لديك دواء يجب تناوله بعد ${getMealNameAr(mealType)}.`
          },
          data: { mealType, action: 'meal_check' },
          web_buttons: [
            { id: 'yes_ate', text: 'نعم، أكلت ✅' },
            { id: 'not_yet', text: 'لم آكل بعد ⏳' }
          ],
          send_after: getOneSignalDateString(time)
        });
      }
    }
  }

  if (schedules.length === 0) return;

  try {
    const response = await fetch('/api/notifications/schedule', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ userId, schedules })
    });

    if (!response.ok) {
      console.error("Failed to schedule with OneSignal backend", await response.text());
    } else {
      console.log(`[OneSignal] Scheduled ${schedules.length} future notifications for user.`);
    }
  } catch (err) {
    console.error("Error calling schedule API:", err);
  }
}
