/**
 * Vercel Edge Function - RO.AM API Proxy
 *
 * Environment Variables Required (set in Vercel dashboard):
 * - ROAM_API_KEY: Your RO.AM API key
 * - ROAM_CHANNEL_ID: The channel/group ID to post messages to
 */

export const config = {
  runtime: 'edge',
};

export default async function handler(request) {
  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  // Handle preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  // Only allow POST requests
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const body = await request.json();
    const { type, data, message: rawMessage } = body;

    // Format message based on type
    let message = '';
    if (typeof rawMessage === 'string' && rawMessage.trim()) {
      message = rawMessage.trim();
    } else if (type === 'form_submission') {
      message = formatFormSubmission(data);
    } else if (type === 'booking') {
      message = formatBooking(data);
    } else if (type === 'segment_selection') {
      message = formatSegmentSelection(data);
    } else {
      message = `New event: ${type || 'unknown'}\n${JSON.stringify(data || body, null, 2)}`;
    }

    // Get environment variables
    const apiKey = process.env.ROAM_API_KEY;
    const defaultChannelId = process.env.ROAM_CHANNEL_ID;
    const applicationChannelId = process.env.ROAM_CHANNEL_ID_APPLICATION;

    // Route to correct channel based on request
    const channelId = body.channel === 'application'
      ? (applicationChannelId || defaultChannelId)
      : defaultChannelId;

    if (!apiKey || !channelId) {
      console.error('Missing ROAM_API_KEY or ROAM_CHANNEL_ID');
      return new Response(JSON.stringify({ error: 'Server configuration error' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Send to RO.AM API
    const roamResponse = await fetch('https://api.ro.am/v1/chat.sendMessage', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        text: message,
        sender: { name: 'Olympus', id: 'olympus' },
        recipients: [channelId],
      }),
    });

    if (!roamResponse.ok) {
      const errorText = await roamResponse.text();
      console.error('RO.AM API error:', roamResponse.status, errorText);
      return new Response(JSON.stringify({
        error: 'Failed to send notification',
        status: roamResponse.status
      }), {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const result = await roamResponse.json();
    return new Response(JSON.stringify({ success: true, id: result.id }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Notify API error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}

function formatFormSubmission(data) {
  data = data || {};

  const timestamp = new Date().toLocaleString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: 'America/New_York'
  });

  return `🎯 **New Lead Submitted**

**Contact Info**
• Name: ${data.name || 'Not provided'}
• Email: ${data.email || 'Not provided'}
• Phone: ${data.phone || 'Not provided'}

**Source**
• UTM Source: ${data.utm_source || 'Direct'}
• UTM Medium: ${data.utm_medium || 'N/A'}
• UTM Campaign: ${data.utm_campaign || 'N/A'}

**Submitted:** ${timestamp}`;
}

function formatBooking(data) {
  data = data || {};

  let startTime = 'Not available';
  let endTime = 'Not available';

  if (data.startTime) {
    const start = new Date(data.startTime);
    startTime = start.toLocaleString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
      timeZone: 'America/New_York'
    });
  }

  if (data.endTime) {
    const end = new Date(data.endTime);
    endTime = end.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
      timeZone: 'America/New_York'
    });
  }

  return `📅 **New Call Booked!**

**Booking Details**
• ID: ${data.uid || 'N/A'}
• Event: ${data.title || 'Strategy Call'}
• Start: ${startTime}
• End: ${endTime}

**Attendee**
• Name: ${data.attendeeName || 'Check Cal.com'}
• Email: ${data.attendeeEmail || 'Check Cal.com'}

**Routing**
• Segment: ${data.segmentLabel || data.segment || 'Not provided'}
• Revenue Range: ${data.revenueRange || 'Not provided'}
• Tier: ${data.tier || 'Not provided'}
• Calendar Owner: ${data.calendarOwner || 'Not provided'}
• Calendar Number: ${data.calendarNumber || 'Not provided'}`;
}

function formatSegmentSelection(data) {
  data = data || {};

  const timestamp = new Date(data.selectedAt || Date.now()).toLocaleString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: 'America/New_York'
  });

  return `🧭 **Demo Segment Selected**

**Selection**
• Segment: ${data.segmentLabel || data.segment || 'Not provided'}
• Revenue Range: ${data.revenueRange || 'Not provided'}
• Tier: ${data.tier || 'Not provided'}
• Calendar Number: ${data.calendarNumber || 'Not provided'}
• Calendar Owner: ${data.calendarOwner || 'Not provided'}

**Source**
• Page: ${data.page || 'Unknown'}
• Referrer: ${data.referrer || 'Direct'}
• UTM Source: ${data.utm_source || 'Direct'}
• UTM Medium: ${data.utm_medium || 'N/A'}
• UTM Campaign: ${data.utm_campaign || 'N/A'}

**Selected:** ${timestamp}`;
}
