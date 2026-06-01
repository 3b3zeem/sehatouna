<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

## Project Context & Custom Rules
- **Project Name:** صِحتنا (Family Health Companion)
- **Tech Stack:** Next.js (App Router), TypeScript, Tailwind CSS, Dexie.js (IndexedDB wrapper).
- **Core Strategy:** Server-Side Rendered (SSR) text for strict Technical SEO, and Client-Side state using 'use client' + Dexie.js for interactive tracking tools.
- **Special Feature:** Interactive Meal Reminders logic implemented inside the Service Worker using Notification Actions (Buttons: Yes, I ate / Not yet).

### Coding Standards for this project:
1. Always isolate Dexie.js database access into client-side code to avoid Next.js Node.js server build crashes ("window is not defined").
2. Ensure every single page folder has a static `metadata` object exported for SEO in both Arabic and English.
3. Keep clean internationalization (i18n) by extracting all text to a central translation dictionary.
<!-- END:nextjs-agent-rules -->
