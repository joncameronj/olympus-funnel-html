/**
 * Vercel Edge Function - Cal.com Webhook Handler
 *
 * Receives Cal.com BOOKING_CREATED webhooks and:
 * 1. Sends notification to Roam channel
 * 2. Creates contact in GoHighLevel
 * 3. Adds contact to Olympus pipeline under "Call Booked" stage
 *
 * Environment Variables Required (set in Vercel dashboard):
 * - ROAM_API_KEY: Your RO.AM API key
 * - ROAM_CHANNEL_ID: The channel/group ID to post messages to
 * - GHL_PRIVATE_TOKEN: GoHighLevel Private Integration token
 * - GHL_LOCATION_ID: Your GHL location ID
 * - GHL_PIPELINE_ID: The Olympus pipeline ID
 * - CAL_WEBHOOK_SECRET: (Optional) Cal.com webhook secret for verification
 */

export const config = {
  runtime: 'edge',
};

const GHL_BASE_URL = 'https://services.leadconnectorhq.com';
const GHL_API_VERSION = '2021-07-28';

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
    const payload = await request.json();

    // Verify this is a booking created event
    if (payload.triggerEvent !== 'BOOKING_CREATED') {
      console.log('Ignoring non-BOOKING_CREATED event:', payload.triggerEvent);
      return new Response(JSON.stringify({ success: true, message: 'Event ignored' }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const bookingData = extractBookingData(payload);
    console.log('Processing booking:', bookingData.email);

    // Send to Ro.am only (GHL disabled for now to debug)
    let roamResult = { status: 'skipped' };
    try {
      await sendRoamNotification(bookingData);
      roamResult = { status: 'sent' };
      console.log('Roam notification sent successfully');
    } catch (roamError) {
      console.error('Roam error:', roamError.message);
      roamResult = { status: 'failed', error: roamError.message };
    }

    // GHL integration disabled temporarily
    // const ghlResult = await processGHLIntegration(bookingData);

    return new Response(JSON.stringify({
      success: true,
      roam: roamResult.status,
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Cal webhook error:', error);
    // Return 200 to prevent Cal.com from retrying
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}

/**
 * Extract booking data from Cal.com webhook payload
 */
function extractBookingData(payload) {
  const data = payload.payload || payload;
  const responses = data.responses || {};
  const attendee = data.attendees?.[0] || {};

  // Cal.com can have responses in different formats
  // Try to get data from responses first, then fall back to attendee info
  return {
    // Basic info
    name: responses.name || attendee.name || 'Not provided',
    email: responses.email || attendee.email || 'Not provided',
    phone: responses.phone || responses.Phone || responses['phone-number'] || 'Not provided',

    // Custom form fields - matched to Cal.com form field names
    practiceDescription: responses['Quick description of your practice'] ||
                         responses['Quick description of your practice?'] ||
                         responses.practice_description ||
                         responses.practiceDescription ||
                         'Not provided',
    website: responses['What website do you want Olympus to grow?'] ||
             responses['Website you want Olympus to grow?'] ||
             responses.website ||
             'Not provided',
    goals: responses['What do you want Olympus to help you achieve?'] ||
           responses.goals ||
           'Not provided',
    budget: responses['Roughly how much goes towards growth & marketing each month?'] ||
            responses['Roughly how much goes toward marketing each month?'] ||
            responses.budget ||
            'Not provided',
    challenges: responses['Biggest patient acquisition challenges?'] ||
                responses['Biggest marketing challenges?'] ||
                responses.challenges ||
                'Not provided',
    tier: responses['Olympus tier most interested in?'] ||
          responses['Tier most interested in?'] ||
          responses.tier ||
          'Not provided',

    // Booking details
    bookingId: data.uid || 'N/A',
    eventTitle: data.title || 'Strategy Call',
    startTime: data.startTime,
    endTime: data.endTime,
    timeZone: attendee.timeZone || 'America/New_York',
  };
}

/**
 * Send notification to Roam channel
 */
async function sendRoamNotification(data) {
  const apiKey = process.env.ROAM_API_KEY;
  const channelId = process.env.ROAM_CHANNEL_ID;

  if (!apiKey || !channelId) {
    throw new Error('Missing ROAM_API_KEY or ROAM_CHANNEL_ID');
  }

  const message = formatRoamMessage(data);

  const response = await fetch('https://api.ro.am/v1/messages', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      channel_id: channelId,
      text: message,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Roam API error: ${response.status} - ${errorText}`);
  }

  return await response.json();
}

/**
 * Format the Roam notification message
 */
function formatRoamMessage(data) {
  // Format booking time
  let bookingTime = 'Not available';
  if (data.startTime) {
    const start = new Date(data.startTime);
    bookingTime = start.toLocaleString('en-US', {
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

  return `🔄 **NEW OLYMPUS DEMO BOOKED**

**Name:** ${data.name}
**Email:** ${data.email}
**Phone:** ${data.phone}
**Quick description of your practice:** ${data.practiceDescription}
**What website do you want Olympus to grow?** ${data.website}
**What do you want Olympus to help you achieve?** ${data.goals}
**Roughly how much goes towards growth & marketing each month?** ${data.budget}
**Biggest patient acquisition challenges?** ${data.challenges}
**Olympus tier most interested in?** ${data.tier}

📅 **Booked:** ${bookingTime}`;
}

/**
 * Process GoHighLevel integration - create contact and opportunity
 */
async function processGHLIntegration(data) {
  const token = process.env.GHL_PRIVATE_TOKEN;
  const locationId = process.env.GHL_LOCATION_ID;
  const pipelineId = process.env.GHL_PIPELINE_ID;

  if (!token || !locationId || !pipelineId) {
    throw new Error('Missing GHL environment variables');
  }

  // Step 1: Create or update contact
  const contact = await createGHLContact(token, locationId, data);
  console.log('GHL contact created/found:', contact.id);

  // Step 2: Get the "Call Booked" stage ID
  const stageId = await getCallBookedStageId(token, pipelineId);
  console.log('Call Booked stage ID:', stageId);

  // Step 3: Create opportunity
  const opportunity = await createGHLOpportunity(token, locationId, pipelineId, stageId, contact.id, data);
  console.log('GHL opportunity created:', opportunity.id);

  return { contact, opportunity };
}

/**
 * Create contact in GoHighLevel
 */
async function createGHLContact(token, locationId, data) {
  // Split name into first and last
  const nameParts = data.name.split(' ');
  const firstName = nameParts[0] || '';
  const lastName = nameParts.slice(1).join(' ') || '';

  const response = await fetch(`${GHL_BASE_URL}/contacts/`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Version': GHL_API_VERSION,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      locationId,
      firstName,
      lastName,
      email: data.email !== 'Not provided' ? data.email : undefined,
      phone: data.phone !== 'Not provided' ? data.phone : undefined,
      source: 'Cal.com Booking',
      tags: ['cal-booking', 'olympus-lead'],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`GHL Contact API error: ${response.status} - ${errorText}`);
  }

  const result = await response.json();
  return result.contact || result;
}

/**
 * Get the "Call Booked" stage ID from the pipeline
 */
async function getCallBookedStageId(token, pipelineId) {
  const response = await fetch(`${GHL_BASE_URL}/opportunities/pipelines/${pipelineId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Version': GHL_API_VERSION,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`GHL Pipeline API error: ${response.status} - ${errorText}`);
  }

  const pipeline = await response.json();
  const stages = pipeline.stages || pipeline.pipeline?.stages || [];

  // Find the "Demo Call Booked" stage (case-insensitive)
  const callBookedStage = stages.find(stage =>
    stage.name.toLowerCase().includes('demo call booked') ||
    stage.name.toLowerCase().includes('call booked') ||
    stage.name.toLowerCase().includes('booked')
  );

  if (!callBookedStage) {
    // If not found, use the first stage as fallback
    console.warn('Call Booked stage not found, using first stage');
    return stages[0]?.id;
  }

  return callBookedStage.id;
}

/**
 * Create opportunity in GoHighLevel pipeline
 */
async function createGHLOpportunity(token, locationId, pipelineId, stageId, contactId, data) {
  const response = await fetch(`${GHL_BASE_URL}/opportunities/`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Version': GHL_API_VERSION,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      pipelineId,
      locationId,
      pipelineStageId: stageId,
      contactId,
      name: `${data.name} - ${data.eventTitle}`,
      status: 'open',
      source: 'Cal.com Booking',
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`GHL Opportunity API error: ${response.status} - ${errorText}`);
  }

  const result = await response.json();
  return result.opportunity || result;
}
