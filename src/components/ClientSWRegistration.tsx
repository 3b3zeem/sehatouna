'use client';

import { useEffect, useState } from 'react';
import { db } from '@/lib/db/dexie';
import { useLiveQuery } from 'dexie-react-hooks';
import OneSignal from 'react-onesignal';
import { scheduleMedicationNotifications } from '@/lib/notifications/scheduler';

function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export default function ClientSWRegistration() {
  const [isOneSignalInitialized, setIsOneSignalInitialized] = useState(false);

  // Fetch active medications whenever they change
  const activeMeds = useLiveQuery(
    () => db.medications.filter(m => m.isActive === true).toArray(),
    []
  );

  useEffect(() => {
    async function initOneSignal() {
      if (typeof window !== 'undefined') {
        const appId = process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID;
        if (!appId) {
          console.warn("OneSignal APP ID is missing. Notifications won't work.");
          return;
        }

        try {
          await OneSignal.init({
            appId: appId,
            allowLocalhostAsSecureOrigin: true,
          });
          
          setIsOneSignalInitialized(true);

          // Get or create a persistent local user ID for targeting pushes
          let localUserId = localStorage.getItem('onesignal_local_userid');
          if (!localUserId) {
            localUserId = generateUUID();
            localStorage.setItem('onesignal_local_userid', localUserId);
          }

          // Login to OneSignal to associate this browser with the localUserId
          await OneSignal.login(localUserId);
          
        } catch (error) {
          console.error('Error initializing OneSignal:', error);
        }
      }
    }

    initOneSignal();
  }, []);

  // Schedule notifications whenever medications change
  useEffect(() => {
    if (isOneSignalInitialized && activeMeds) {
      const localUserId = localStorage.getItem('onesignal_local_userid');
      if (localUserId) {
        scheduleMedicationNotifications(activeMeds, localUserId).catch(err => {
          console.error("Failed to schedule notifications:", err);
        });
      }
    }
  }, [isOneSignalInitialized, activeMeds]);

  return null;
}
