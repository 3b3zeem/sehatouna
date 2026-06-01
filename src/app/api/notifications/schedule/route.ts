import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, schedules } = body;

    const appId = process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID;
    const apiKey = process.env.ONESIGNAL_REST_API_KEY;

    if (!appId || !apiKey) {
      return NextResponse.json({ error: "OneSignal keys are not configured." }, { status: 500 });
    }

    if (!userId || !schedules || !Array.isArray(schedules)) {
      return NextResponse.json({ error: "Invalid request payload." }, { status: 400 });
    }

    const results = [];

    // Schedule each notification via OneSignal API
    for (const schedule of schedules) {
      const response = await fetch('https://onesignal.com/api/v1/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${apiKey}`,
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          app_id: appId,
          include_aliases: {
            external_id: [userId]
          },
          target_channel: "push",
          headings: schedule.headings,
          contents: schedule.contents,
          data: schedule.data,
          send_after: schedule.send_after, // e.g., "2026-06-01 14:00:00 GMT+0300"
        })
      });

      const result = await response.json();
      results.push(result);
    }

    return NextResponse.json({ success: true, results });

  } catch (error: any) {
    console.error("API Error scheduling notification:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
