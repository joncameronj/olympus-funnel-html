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
    const metadata = data.metadata || data.bookingMetadata || data.eventTypeMetadata || {};

    const normalizeText = (value) => String(value || '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, ' ')
      .trim();

    const getResponseValue = (value) => {
      if (value == null) return '';

      if (Array.isArray(value)) {
        return value
          .map((item) => getResponseValue(item))
          .filter(Boolean)
          .join(', ')
          .trim();
      }

      if (typeof value === 'object') {
        if (value.value !== undefined) return getResponseValue(value.value);
        if (value.answer !== undefined) return getResponseValue(value.answer);
        if (value.text !== undefined) return getResponseValue(value.text);
        if (value.response !== undefined) return getResponseValue(value.response);
        return '';
      }

      return String(value).trim();
    };

    // Helper to get response value (handles different Cal.com formats)
    const getResponse = (searchTerms) => {
      const terms = searchTerms.map(normalizeText).filter(Boolean);
      const entries = Object.entries(responses);

      const isMatch = (candidate) => {
        const text = normalizeText(candidate);
        if (!text) return false;
        return terms.some((term) => text === term || text.includes(term) || term.includes(text));
      };

      // Direct key lookup with normalized matching
      for (const [key, val] of entries) {
        if (!isMatch(key)) continue;
        const extracted = getResponseValue(val);
        if (extracted) return extracted;
      }

      // Nested object lookup by common label/question keys
      for (const [, val] of entries) {
        if (!val || typeof val !== 'object') continue;

        const descriptor = val.label || val.question || val.questionLabel || val.name || val.title;
        if (!isMatch(descriptor)) continue;

        const extracted = getResponseValue(val);
        if (extracted) return extracted;
      }

      // Search through array-type values (e.g. responses.customInputs = [{label, value}])
      for (const [, val] of entries) {
        if (!Array.isArray(val)) continue;
        for (const item of val) {
          if (!item || typeof item !== 'object') continue;
          const descriptor = item.label || item.question || item.questionLabel || item.name || item.title;
          if (!isMatch(descriptor)) continue;
          const extracted = getResponseValue(item);
          if (extracted) return extracted;
        }
      }

      return 'Not provided';
    };

    const getMetadataValue = (...keys) => {
      for (const key of keys) {
        const value = metadata[key];
        if (value !== undefined && value !== null && String(value).trim()) {
          return String(value).trim();
        }
      }
      return '';
    };

    const tierFromResponses = getResponse(['tier', 'interested in']);
    const tierFromMetadata = getMetadataValue('tier', 'Tier');
    const resolvedTier = tierFromResponses !== 'Not provided'
      ? tierFromResponses
      : (tierFromMetadata || 'Not provided');

    const practiceFromResponses = getResponse([
      'Quick description of your practice', 'quick description', 'description', 'practice',
      'describe', 'about your practice', 'tell us about', 'your practice',
      'describe your practice', 'practice description'
    ]);
    const websiteFromResponses = getResponse([
      'What website do you want Olympus to grow', 'website do you want', 'website you want',
      'olympus to grow', 'website', 'url', 'site', 'web address', 'domain'
    ]);

    const bookingData = {
      name: getResponse(['name', 'your name']) || attendee.name || 'Not provided',
      email: getResponse(['email', 'email address']) || attendee.email || 'Not provided',
      phone: getResponse(['phone', 'phone number']) || attendee.phone || 'Not provided',
      practiceDescription: practiceFromResponses !== 'Not provided'
        ? practiceFromResponses
        : (getMetadataValue('practiceDescription', 'practice_description', 'quiz_practice_description') || 'Not provided'),
      goals: getResponse(['What do you want Olympus to help you achieve', 'help you achieve', 'olympus to help', 'achieve', 'goals']),
      website: websiteFromResponses !== 'Not provided'
        ? websiteFromResponses
        : (getMetadataValue('website', 'quiz_website') || 'Not provided'),
      challenges: getResponse(['challenges', 'patient acquisition']),
      tier: resolvedTier,
      segment: getMetadataValue('segment'),
      segmentLabel: getMetadataValue('segmentLabel'),
      revenueRange: getMetadataValue('revenueRange'),
      calendarOwner: getMetadataValue('calendarOwner'),
      calendarNumber: getMetadataValue('calendarNumber'),
      budget: getResponse(['how much', 'monthly', 'toward growth', 'marketing']),
      startTime: data.startTime,
      title: data.title || 'Olympus Demo',
    };

    console.log('Processing booking for:', bookingData.email);
    console.log('Raw responses keys:', Object.keys(responses));
    console.log('Response key details:', JSON.stringify(
      Object.entries(responses).map(([k, v]) => ({
        key: k,
        type: Array.isArray(v) ? 'array' : typeof v,
        preview: typeof v === 'string' ? v.slice(0, 80) : JSON.stringify(v).slice(0, 80)
      }))
    ));
    console.log('Metadata keys:', Object.keys(metadata));

    // Flag unmatched response keys for debugging
    const knownKeys = ['name', 'email', 'phone', 'location', 'guests', 'rescheduleReason'];
    const unmatchedEntries = Object.entries(responses).filter(
      ([k]) => !knownKeys.includes(k)
    );
    if (unmatchedEntries.length > 0) {
      console.log('Unmatched response entries:', JSON.stringify(
        unmatchedEntries.map(([k, v]) => ({ key: k, value: getResponseValue(v) || '(empty)' }))
      ));
    }

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
        timeZone: 'America/Phoenix'
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
      `**Segment:** ${bookingData.segmentLabel || bookingData.segment || 'Not provided'}`,
      `**Revenue range:** ${bookingData.revenueRange || 'Not provided'}`,
      `**Calendar owner:** ${bookingData.calendarOwner || 'Not provided'}`,
      `**Calendar number:** ${bookingData.calendarNumber || 'Not provided'}`,
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
