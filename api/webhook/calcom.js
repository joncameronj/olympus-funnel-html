/**
 * Cal.com Webhook Handler
 * Receives BOOKING_CREATED webhooks and sends to Ro.am
 */

export const config = {
  runtime: 'edge',
};

export default async function handler(request) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  // Handle preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  // Only allow POST
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const payload = await request.json();

    // Only process booking created events
    if (payload.triggerEvent !== 'BOOKING_CREATED') {
      return new Response(JSON.stringify({ success: true, message: 'Event ignored' }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Extract booking data
    const data = payload.payload || payload;
    const responses = data.responses || {};
    const attendee = data.attendees?.[0] || {};

    // Helper to get response value (handles different formats)
    const getResponse = (keys) => {
      for (const key of keys) {
        if (responses[key]) {
          const val = responses[key];
          // Handle object format {value: "..."} or array format
          if (typeof val === 'object' && val.value) return val.value;
          if (Array.isArray(val)) return val.join(', ');
          return val;
        }
      }
      return 'Not provided';
    };

    const bookingData = {
      name: getResponse(['name', 'Your name']) || attendee.name || 'Not provided',
      email: getResponse(['email', 'email_address', 'Email address']) || attendee.email || 'Not provided',
      phone: getResponse(['phone', 'Phone Number', 'Phone']) || 'Not provided',
      practiceDescription: getResponse(['Quick description of your practice', 'practice_description']),
      goals: getResponse(['What do you want Olympus to help you achieve?', 'goals']),
      website: getResponse(['What website do you want Olympus to grow?', 'website']),
      challenges: getResponse(['Biggest patient acquisition challenges?', 'challenges']),
      tier: getResponse(['Olympus tier most interested in?', 'tier']),
      budget: getResponse(['Roughly how much monthly goes toward growth?', 'budget']),
      startTime: data.startTime,
      title: data.title || 'Olympus Demo',
    };

    console.log('Processing booking for:', bookingData.email);

    // Send to Ro.am
    const apiKey = process.env.ROAM_API_KEY;
    const channelId = process.env.ROAM_CHANNEL_ID;

    if (!apiKey || !channelId) {
      console.error('Missing ROAM_API_KEY or ROAM_CHANNEL_ID');
      return new Response(JSON.stringify({ success: false, error: 'Missing env vars' }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Format time
    let bookingTime = 'Not available';
    if (bookingData.startTime) {
      const start = new Date(bookingData.startTime);
      bookingTime = start.toLocaleString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
        timeZone: 'America/New_York'
      });
    }

    const message = `🗓️ **NEW OLYMPUS DEMO BOOKED**

**Contact Info**
• **Name:** ${bookingData.name}
• **Email:** ${bookingData.email}
• **Phone:** ${bookingData.phone}

**Booking Questions**
• **Quick description of your practice:** ${bookingData.practiceDescription}
• **What do you want Olympus to help you achieve?** ${bookingData.goals}
• **What website do you want Olympus to grow?** ${bookingData.website}
• **Biggest patient acquisition challenges?** ${bookingData.challenges}
• **Olympus tier most interested in?** ${bookingData.tier}
• **Roughly how much monthly goes toward growth?** ${bookingData.budget}

📅 **Scheduled:** ${bookingTime}`;

    const roamResponse = await fetch('https://api.ro.am/v1/chat.sendMessage', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        text: message,
        sender: {
          name: 'Olympus',
          id: 'olympus-cal-webhook',
        },
        recipients: [channelId],
      }),
    });

    if (!roamResponse.ok) {
      const errorText = await roamResponse.text();
      console.error('Ro.am error:', roamResponse.status, errorText);
      return new Response(JSON.stringify({ success: false, error: 'Roam failed' }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Ro.am notification sent');
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Webhook error:', error.message);
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}
