/**
 * Resend API Wrapper & Dynamic Timing Calculator
 *
 * Handles scheduling emails with dynamic timing based on booking lead time.
 */

import { TIMING_CONFIG } from '../config/email-sequences.js';

const RESEND_API_URL = 'https://api.resend.com/emails';

/**
 * Calculate send times for all emails in a sequence
 *
 * @param {Date} bookingTime - When the call is scheduled
 * @param {number} emailCount - Number of emails to schedule
 * @returns {Date[]} Array of send times for each email
 */
export function calculateEmailSchedule(bookingTime, emailCount = TIMING_CONFIG.EMAILS_PER_TIER) {
  const now = new Date();
  const callTime = new Date(bookingTime);

  // Calculate buffer time (2 hours before call)
  const bufferMs = TIMING_CONFIG.BUFFER_BEFORE_CALL_HOURS * 60 * 60 * 1000;
  const lastEmailTime = new Date(callTime.getTime() - bufferMs);

  // Calculate available time window
  const availableMs = lastEmailTime.getTime() - now.getTime();

  // Minimum spacing in milliseconds
  const minSpacingMs = TIMING_CONFIG.MIN_SPACING_MINUTES * 60 * 1000;

  // Calculate ideal interval
  let intervalMs = availableMs / emailCount;

  // Enforce minimum spacing
  if (intervalMs < minSpacingMs) {
    intervalMs = minSpacingMs;
  }

  // Generate send times
  const sendTimes = [];
  for (let i = 0; i < emailCount; i++) {
    const sendTime = new Date(now.getTime() + intervalMs * (i + 1));

    // Don't schedule past the buffer time
    if (sendTime >= lastEmailTime) {
      break;
    }

    sendTimes.push(sendTime);
  }

  // If we couldn't fit any emails, schedule the first one immediately
  // and space the rest at minimum intervals
  if (sendTimes.length === 0) {
    const firstSend = new Date(now.getTime() + 60000); // 1 minute from now
    sendTimes.push(firstSend);

    for (let i = 1; i < emailCount; i++) {
      const nextTime = new Date(firstSend.getTime() + minSpacingMs * i);
      if (nextTime < lastEmailTime) {
        sendTimes.push(nextTime);
      }
    }
  }

  return sendTimes;
}

/**
 * Schedule a single email via Resend API
 *
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.html - Email HTML content
 * @param {Date} options.scheduledAt - When to send (optional, sends immediately if not provided)
 * @returns {Promise<Object>} Resend API response
 */
export async function scheduleEmail({ to, subject, html, scheduledAt }) {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    throw new Error('Missing RESEND_API_KEY environment variable');
  }

  const payload = {
    from: 'Olympus <hello@etho.net>',
    reply_to: 'saas@etho.net',
    to: [to],
    subject,
    html,
  };

  // Add scheduled_at if provided and in the future
  if (scheduledAt) {
    const scheduleDate = new Date(scheduledAt);
    const now = new Date();

    // Only schedule if more than 1 minute in the future
    if (scheduleDate.getTime() - now.getTime() > 60000) {
      payload.scheduled_at = scheduleDate.toISOString();
    }
  }

  const response = await fetch(RESEND_API_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Resend API error: ${response.status} - ${errorText}`);
  }

  return response.json();
}

/**
 * Schedule an entire email sequence
 *
 * @param {Object} options - Scheduling options
 * @param {string} options.to - Recipient email
 * @param {string} options.name - Recipient name
 * @param {Date} options.bookingTime - When the call is scheduled
 * @param {string} options.tier - User's tier (lambda, alpha, sigma, enterprise)
 * @param {Array} options.emails - Array of email definitions with id and subject
 * @param {Function} options.getTemplate - Function to get email HTML template
 * @returns {Promise<Object>} Results of scheduling
 */
export async function scheduleEmailSequence({ to, name, bookingTime, tier, emails, getTemplate }) {
  const sendTimes = calculateEmailSchedule(bookingTime, emails.length);
  const results = [];

  console.log(`Scheduling ${sendTimes.length} emails for ${to} (${tier} tier)`);
  console.log(`Booking time: ${new Date(bookingTime).toISOString()}`);
  console.log(`Send times calculated:`, sendTimes.map((t) => t.toISOString()));

  for (let i = 0; i < sendTimes.length; i++) {
    const email = emails[i];
    const sendTime = sendTimes[i];

    try {
      const html = getTemplate(tier, email.id, { name, tier });

      const result = await scheduleEmail({
        to,
        subject: email.subject,
        html,
        scheduledAt: sendTime,
      });

      results.push({
        emailId: email.id,
        subject: email.subject,
        scheduledAt: sendTime.toISOString(),
        resendId: result.id,
        status: 'scheduled',
      });

      console.log(`Scheduled email ${email.id}: "${email.subject}" for ${sendTime.toISOString()}`);
    } catch (error) {
      console.error(`Failed to schedule email ${email.id}:`, error.message);
      results.push({
        emailId: email.id,
        subject: email.subject,
        scheduledAt: sendTime.toISOString(),
        status: 'failed',
        error: error.message,
      });
    }
  }

  return {
    tier,
    totalScheduled: results.filter((r) => r.status === 'scheduled').length,
    totalFailed: results.filter((r) => r.status === 'failed').length,
    emails: results,
  };
}
