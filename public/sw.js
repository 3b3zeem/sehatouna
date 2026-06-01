// Standalone Service Worker for Meal Reminders

// Import Dexie via CDN so it matches the DB used by the Next.js app
importScripts('https://unpkg.com/dexie@latest/dist/dexie.js');

const db = new Dexie('FamilyHealthDB');
db.version(1).stores({
  familyMembers: '++id, name, relation',
  medications: '++id, memberId, name, timingType, isActive, mealType, mealRelation',
  history: '++id, medId, date, status'
});

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  
  if (event.action === 'yes_ate') {
    // The user confirmed they ate a meal. 
    // We need to query the database to find medications scheduled for 'after' this meal.
    // The notification data should contain the mealType (e.g., 'lunch').
    const mealType = event.notification.data?.mealType;
    
    if (mealType) {
      event.waitUntil(
        db.medications.where({ timingType: 'meal', mealType: mealType, mealRelation: 'after', isActive: 1 }).toArray().then(meds => {
          if (meds && meds.length > 0) {
            const medNames = meds.map(m => `${m.name} (${m.dosage} ${m.dosageUnit})`).join(', ');
            return self.registration.showNotification('Time for your medication / حان وقت الدواء', {
              body: `Please take: ${medNames}\nالرجاء تناول: ${medNames}`,
              icon: '/favicon.ico', // Update icon path
              data: { action: 'medication_reminder' }
            });
          }
        }).catch(err => console.error("Error querying Dexie in SW:", err))
      );
    }
  } else if (event.action === 'not_yet') {
    // User hasn't eaten yet. We could schedule a retry later, but for now just acknowledge.
    console.log("User clicked not yet.");
  } else if (event.action === 'take_med') {
    const medId = event.notification.data?.medId;
    if (medId) {
      const today = new Date().toISOString().split('T')[0];
      const now = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
      
      event.waitUntil(
        db.history.add({
          medId: medId,
          date: today,
          takenAt: now,
          status: 'taken'
        }).then(() => {
          console.log(`Recorded med ${medId} as taken at ${now} from Push Notification`);
        }).catch(err => {
          console.error("Error recording taken med from SW:", err);
        })
      );
    }
  } else {
    // Regular click on the notification body. Focus or open the app.
    event.waitUntil(
      clients.matchAll({ type: 'window' }).then(windowClients => {
        for (let client of windowClients) {
          if (client.url === '/' && 'focus' in client) {
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow('/');
        }
      })
    );
  }
});
