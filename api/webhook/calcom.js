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

    // Helper to get response value (handles different Cal.com formats)
    const getResponse = (searchTerms) => {
      // First, try direct key match
      for (const key of searchTerms) {
        if (responses[key]) {
          const val = responses[key];
          if (typeof val === 'object' && val.value !== undefined) return val.value;
          if (Array.isArray(val)) return val.map(v => typeof v === 'object' ? v.value || v : v).join(', ');
          return val;
        }
      }

      // Second, search through all responses by label
      for (const [key, val] of Object.entries(responses)) {
        if (typeof val === 'object' && val.label) {
          const label = val.label.toLowerCase();
          for (const term of searchTerms) {
            if (label.includes(term.toLowerCase())) {
              if (Array.isArray(val.value)) return val.value.join(', ');
              return val.value || 'Not provided';
            }
          }
        }
      }

      return 'Not provided';
    };

    const bookingData = {
      name: getResponse(['name', 'your name']) || attendee.name || 'Not provided',
      email: getResponse(['email', 'email address']) || attendee.email || 'Not provided',
      phone: getResponse(['phone', 'phone number']) || attendee.phone || 'Not provided',
      practiceDescription: getResponse(['quick description', 'description of your practice', 'practice']),
      goals: getResponse(['help you achieve', 'olympus to help', 'goals']),
      website: getResponse(['website do you want', 'website you want', 'olympus to grow', 'website']),
      challenges: getResponse(['challenges', 'patient acquisition']),
      tier: getResponse(['tier', 'interested in']),
      budget: getResponse(['how much', 'monthly', 'toward growth', 'marketing']),
      startTime: data.startTime,
      title: data.title || 'Olympus Demo',
    };

    console.log('Processing booking for:', bookingData.email);
    console.log('Raw responses keys:', Object.keys(responses));
    console.log('Raw responses:', JSON.stringify(responses, null, 2));

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

    const messageParts = [
      '🗓️ **NEW OLYMPUS DEMO BOOKED**',
      `**What's your name?** ${bookingData.name}`,
      `**What's your email?** ${bookingData.email}`,
      `**What's your phone number?** ${bookingData.phone}`,
      `**Quick description of your practice?** ${bookingData.practiceDescription}`,
      `**Website you want Olympus to grow?** ${bookingData.website}`,
      `**What do you want Olympus to help you achieve?** ${bookingData.goals}`,
      `**Roughly how much goes toward marketing each month?** ${bookingData.budget}`,
      `**Biggest patient acquisition challenges?** ${bookingData.challenges}`,
      `**Tier most interested in?** ${bookingData.tier}`,
      `**Scheduled:** ${bookingTime}`,
    ];
    const message = messageParts.join('\n\n');

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
          id: 'olympus',
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
