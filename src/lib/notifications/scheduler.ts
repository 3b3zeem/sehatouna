import { Medication } from '@/lib/db/dexie';

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
  const schedules = [];

  for (const med of medications) {
    if (!med.isActive || med.timingType === 'meal') continue;

    // Schedule next 5 doses to OneSignal (to avoid spamming API but keep enough buffer)
    const nextTimes = calculateNextDoseTimes(med, 5); 

    for (const time of nextTimes) {
      const timeMs = time.getTime();
      const delayMs = timeMs - Date.now();

      // Only schedule if it's in the future (at least 1 min to allow processing)
      if (delayMs <= 60000) continue;

      schedules.push({
        headings: { en: "صِحتنا | Medication Time", ar: "صِحتنا | وقت الدواء" },
        contents: { 
          en: `It's time to take: ${med.name} (${med.dosage} ${med.dosageUnit})`, 
          ar: `حان وقت تناول الدواء: ${med.name} (${med.dosage} ${med.dosageUnit})` 
        },
        data: { medId: med.id, action: 'medication_reminder' },
        send_after: getOneSignalDateString(time)
      });
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
