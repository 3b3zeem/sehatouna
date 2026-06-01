'use client';

import { useEffect } from 'react';
import { db } from '@/lib/db/dexie';

export default function ClientSWRegistration() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', function() {
        navigator.serviceWorker.register('/sw.js').then(
          function(registration) {
            console.log('ServiceWorker registration successful with scope: ', registration.scope);
            
            // Request notification permission if not already granted
            if (Notification.permission === 'default') {
              Notification.requestPermission();
            }

            // --- Background Notification Engine ---
            // Run every 60 seconds to check if it's time for a medication
            setInterval(async () => {
              if (Notification.permission !== 'granted') return;

              const now = new Date();
              // Format HH:mm
              const currentTime = now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
              const todayDate = now.toISOString().split('T')[0];

              try {
                // Fetch all medications
                const allMeds = await db.medications.toArray();
                const activeMeds = allMeds.filter(m => m.isActive);
                
                for (const med of activeMeds) {
                  let shouldNotify = false;

                  // 1. Fixed Time check
                  if (med.timingType === 'fixed_time' && med.first_dose_time === currentTime) {
                    shouldNotify = true;
                  }
                  
                  // 2. Interval Check
                  if (med.timingType === 'interval_hours' && med.first_dose_time) {
                    const [firstH, firstM] = med.first_dose_time.split(':').map(Number);
                    const [currH, currM] = currentTime.split(':').map(Number);
                    
                    // Only check if minutes match exactly
                    if (currM === firstM) {
                      let diffH = currH - firstH;
                      if (diffH < 0) diffH += 24; // Handle passing midnight
                      
                      // If the hour difference is a multiple of the interval
                      if (med.frequency_interval && diffH % med.frequency_interval === 0) {
                         shouldNotify = true;
                      }
                    }
                  }

                  // 3. Trigger Notification
                  if (shouldNotify) {
                    const notifyKey = `notified_${med.id}_${todayDate}_${currentTime}`;
                    
                    // Prevent duplicate notification for the exact same minute
                    if (!localStorage.getItem(notifyKey)) {
                      localStorage.setItem(notifyKey, 'true');
                      
                      registration.showNotification('صِحتنا | Medication Time', {
                        body: `It's time to take: ${med.name} (${med.dosage} ${med.dosageUnit})\nحان وقت تناول الدواء!`,
                        icon: '/favicon.ico',
                        tag: `med_${med.id}_${currentTime}`,
                        requireInteraction: true,
                        data: { medId: med.id, action: 'medication_reminder' },
                        actions: [
                          { action: 'take_med', title: 'Take Now / أخذت الدواء ✔️' }
                        ]
                      } as any);
                    }
                  }
                }
              } catch (err) {
                console.error("Background Engine Error:", err);
              }
            }, 60000); // 60,000 ms = 1 minute

          },
          function(err) {
            console.log('ServiceWorker registration failed: ', err);
          }
        );
      });
    }
  }, []);

  return null;
}
