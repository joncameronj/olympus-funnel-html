/**
 * Vercel Edge Function - Cal.com Webhook Handler
 *
 * Receives Cal.com BOOKING_CREATED webhooks and:
 * 1. Sends notification to Roam channel
 * 2. Creates contact in GoHighLevel
 * 3. Adds contact to Olympus pipeline under "Call Booked" stage
 * 4. Schedules tier-based prep content emails via Resend
 *
 * Environment Variables Required (set in Vercel dashboard):
 * - ROAM_API_KEY: Your RO.AM API key
 * - ROAM_CHANNEL_ID: The channel/group ID to post messages to
 * - GHL_PRIVATE_TOKEN: GoHighLevel Private Integration token
 * - GHL_LOCATION_ID: Your GHL location ID
 * - GHL_PIPELINE_ID: The Olympus pipeline ID
 * - CAL_WEBHOOK_SECRET: (Optional) Cal.com webhook secret for verification
 * - RESEND_API_KEY: Resend API key for email scheduling
 */

import { getEmailSequence, normalizeTier } from './config/email-sequences.js';
import { scheduleEmailSequence } from './lib/resend.js';

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

    // Schedule tier-based prep content emails via Resend
    let emailResult = { status: 'skipped' };
    if (process.env.RESEND_API_KEY) {
      try {
        emailResult = await scheduleEmailsForBooking(bookingData);
        console.log('Prep emails scheduled:', emailResult);
      } catch (emailError) {
        console.error('Email scheduling error:', emailError.message);
        emailResult = { status: 'failed', error: emailError.message };
      }
    } else {
      console.log('RESEND_API_KEY not set, skipping email scheduling');
    }

    // GHL integration disabled temporarily
    // const ghlResult = await processGHLIntegration(bookingData);

    return new Response(JSON.stringify({
      success: true,
      roam: roamResult.status,
      emails: emailResult.status || 'scheduled',
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
 * Helper to get response value (handles different Cal.com formats)
 * Cal.com can return responses in different formats:
 * - Direct key: responses['Quick description'] = 'My practice...'
 * - Nested object: responses['custom_123'] = { label: 'Quick description', value: 'My practice...' }
 */
function normalizeText(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function getResponseValue(value) {
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
}

function getResponse(responses, searchTerms) {
  if (!responses || typeof responses !== 'object') return 'Not provided';

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
}

const URL_REGEX = /https?:\/\/[^\s<>"')]+/i;

function extractUrlCandidate(value, seen = new Set()) {
  if (value == null) return '';

  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return '';
    const directMatch = trimmed.match(URL_REGEX);
    return directMatch ? directMatch[0] : '';
  }

  if (typeof value !== 'object') return '';
  if (seen.has(value)) return '';
  seen.add(value);

  if (Array.isArray(value)) {
    for (const item of value) {
      const found = extractUrlCandidate(item, seen);
      if (found) return found;
    }
    return '';
  }

  const priorityKeys = [
    'url', 'href', 'link', 'uri',
    'joinUrl', 'joinURL', 'meetingUrl', 'meetingURL',
    'meetingLink', 'videoCallUrl', 'conferenceUrl',
  ];
  for (const key of priorityKeys) {
    if (!(key in value)) continue;
    const found = extractUrlCandidate(value[key], seen);
    if (found) return found;
  }

  for (const nested of Object.values(value)) {
    const found = extractUrlCandidate(nested, seen);
    if (found) return found;
  }

  return '';
}

/**
 * Extract booking data from Cal.com webhook payload
 */
function extractBookingData(payload) {
  const data = payload.payload || payload;
  const responses = data.responses || {};
  const attendee = data.attendees?.[0] || {};
  const metadata = data.metadata || data.bookingMetadata || data.eventTypeMetadata || {};

  // Log raw responses for debugging
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

  const getMetadataValue = (...keys) => {
    for (const key of keys) {
      const value = metadata[key];
      if (value !== undefined && value !== null && String(value).trim()) {
        return String(value).trim();
      }
    }
    return '';
  };

  const tierFromResponses = getResponse(responses, [
    'Olympus tier most interested in?',
    'Tier most interested in?',
    'tier',
    'Tier',
    'most interested in',
  ]);
  const tierFromMetadata = getMetadataValue('tier', 'Tier');
  const resolvedTier = tierFromResponses !== 'Not provided'
    ? tierFromResponses
    : (tierFromMetadata || 'Not provided');
  const callLinkFromMetadata = getMetadataValue(
    'callLink',
    'meetingLink',
    'meetingUrl',
    'videoCallUrl',
    'joinUrl',
    'conferenceUrl',
  );
  const callLinkFromResponses = getResponse(responses, [
    'meeting link',
    'meeting url',
    'call link',
    'join link',
    'zoom link',
    'google meet',
    'location',
  ]);
  const resolvedCallLink = callLinkFromMetadata
    || (callLinkFromResponses !== 'Not provided' ? extractUrlCandidate(callLinkFromResponses) : '')
    || extractUrlCandidate(data.location)
    || extractUrlCandidate(data.meetingUrl)
    || extractUrlCandidate(data.meetingLink)
    || extractUrlCandidate(data.videoCallUrl)
    || extractUrlCandidate(data.videoCall)
    || extractUrlCandidate(data.conferenceData)
    || extractUrlCandidate(data.eventType)
    || extractUrlCandidate(data.bookingFieldsResponses)
    || extractUrlCandidate(attendee);

  // Cal.com can have responses in different formats
  // Use getResponse() helper to handle direct keys and nested label/value objects
  const practiceFromResponses = getResponse(responses, [
    'Quick description of your practice',
    'Quick description of your practice?',
    'practice_description',
    'practiceDescription',
    'description of your practice',
    'describe', 'about your practice', 'tell us about', 'your practice',
    'describe your practice', 'practice description',
  ]);
  const websiteFromResponses = getResponse(responses, [
    'What website do you want Olympus to grow?',
    'Website you want Olympus to grow?',
    'website',
    'Website',
    'website you want',
    'url', 'site', 'web address', 'domain',
  ]);

  return {
    // Basic info
    name: responses.name || attendee.name || 'Not provided',
    email: responses.email || attendee.email || 'Not provided',
    phone: getResponse(responses, ['phone', 'Phone', 'phone-number', 'phone number']),

    // Custom form fields - use getResponse() to handle multiple formats, fall back to metadata
    practiceDescription: practiceFromResponses !== 'Not provided'
      ? practiceFromResponses
      : (getMetadataValue('practiceDescription', 'practice_description', 'quiz_practice_description') || 'Not provided'),
    website: websiteFromResponses !== 'Not provided'
      ? websiteFromResponses
      : (getMetadataValue('website', 'quiz_website') || 'Not provided'),
    goals: getResponse(responses, [
      'What do you want Olympus to help you achieve?',
      'goals',
      'Goals',
      'help you achieve',
    ]),
    budget: getResponse(responses, [
      'Roughly how much goes towards growth & marketing each month?',
      'Roughly how much goes toward marketing each month?',
      'budget',
      'Budget',
      'marketing each month',
    ]),
    challenges: getResponse(responses, [
      'Biggest patient acquisition challenges?',
      'Biggest marketing challenges?',
      'challenges',
      'Challenges',
      'acquisition challenges',
    ]),
    tier: resolvedTier,
    segment: getMetadataValue('segment', 'segmentLabel'),
    segmentLabel: getMetadataValue('segmentLabel'),
    revenueRange: getMetadataValue('revenueRange'),
    calendarOwner: getMetadataValue('calendarOwner'),
    calendarNumber: getMetadataValue('calendarNumber'),
    callLink: resolvedCallLink || 'Not provided',

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
**Segment:** ${data.segmentLabel || data.segment || 'Not provided'}
**Revenue range:** ${data.revenueRange || 'Not provided'}
**Calendar owner:** ${data.calendarOwner || 'Not provided'}
**Calendar number:** ${data.calendarNumber || 'Not provided'}
**Call link:** ${data.callLink || 'Not provided'}

📅 **Booked:** ${bookingTime}`;
}

/**
 * Schedule prep content emails via Resend templates
 */
async function scheduleEmailsForBooking(data) {
  const tier = normalizeTier(data.tier);
  const emails = getEmailSequence();
  const firstName = (data.name || '').split(' ')[0] || 'there';
  const recipientEmail = String(data.email || '').trim();
  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipientEmail);
  if (!isValidEmail) {
    throw new Error(`Cannot schedule emails: invalid attendee email "${data.email}"`);
  }
  const callLink = data.callLink && data.callLink !== 'Not provided'
    ? data.callLink
    : '';

  console.log(`Scheduling ${emails.length} emails for tier: ${tier}`);
  console.log(`Template data: recipientEmail=${recipientEmail}, callLinkPresent=${Boolean(callLink)}`);

  const result = await scheduleEmailSequence({
    to: recipientEmail,
    firstName,
    bookingTime: data.startTime,
    tier,
    callLink,
    emails,
  });

  return {
    status: 'scheduled',
    tier,
    scheduled: result.totalScheduled,
    failed: result.totalFailed,
  };
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
