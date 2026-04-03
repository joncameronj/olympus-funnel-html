/**
 * Resend API Wrapper & Adaptive Email Scheduler
 *
 * Schedules 16 emails between booking and call time using even spacing.
 * Uses Resend template IDs instead of local HTML generation.
 */

import { TIMING_CONFIG } from '../config/email-sequences.js';

const RESEND_API_URL = 'https://api.resend.com/emails';

/**
 * Calculate send times for all 16 emails in the sequence.
 *
 * All emails MUST send before the call. Email 1 sends immediately,
 * Email 16 sends at callTime - 1hr buffer, and emails 2-15 are
 * spaced evenly between.
 *
 * @param {Date|string} bookingTime - When the call is scheduled
 * @returns {Date[]} Array of 16 send times
 */
export function calculateEmailSchedule(bookingTime) {
  const now = new Date();
  const callTime = new Date(bookingTime);
  const bufferMs = TIMING_CONFIG.BUFFER_BEFORE_CALL_HOURS * 60 * 60 * 1000;
  const deadline = new Date(callTime.getTime() - bufferMs);
  const emailCount = TIMING_CONFIG.EMAILS_PER_SEQUENCE;

  // Email 1 sends now (+ 1 min for Resend minimum)
  const firstSend = new Date(now.getTime() + 60000);

  // Email 16 sends at deadline
  const lastSend = deadline;

  // If deadline is already past or too close, compress everything
  // with minimum 30-second spacing so all emails still send
  if (lastSend.getTime() <= firstSend.getTime()) {
    const sendTimes = [];
    for (let i = 0; i < emailCount; i++) {
      sendTimes.push(new Date(firstSend.getTime() + i * 30000));
    }
    return sendTimes;
  }

  // Emails 2-15 spaced evenly between first and last
  const sendTimes = [firstSend];
  const innerCount = emailCount - 2;
  const innerWindow = lastSend.getTime() - firstSend.getTime();
  const interval = innerWindow / (innerCount + 1);

  for (let i = 1; i <= innerCount; i++) {
    sendTimes.push(new Date(firstSend.getTime() + interval * i));
  }

  sendTimes.push(lastSend);
  return sendTimes;
}

/**
 * Schedule a single email via Resend API.
 *
 * Supports both template mode (templateId + data) and raw HTML mode.
 *
 * @param {Object} options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} [options.templateId] - Resend template ID
 * @param {Object} [options.data] - Template variables (e.g. { firstName })
 * @param {string} [options.html] - Raw HTML fallback
 * @param {Date} [options.scheduledAt] - When to send
 * @returns {Promise<Object>} Resend API response
 */
export async function scheduleEmail({ to, subject, templateId, data, html, scheduledAt }) {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    throw new Error('Missing RESEND_API_KEY environment variable');
  }

  const payload = {
    from: 'JonCameron Johnson <joncameron@getolympus.ai>',
    reply_to: 'joncameron@getolympus.ai',
    to: [to],
    headers: {
      'List-Unsubscribe': '<mailto:unsubscribe@getolympus.ai?subject=unsubscribe>',
      'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
    },
  };

  // Only set subject when NOT using a template (template has its own subject)
  if (!templateId) {
    payload.subject = subject;
  }

  if (templateId) {
    payload.template = { id: templateId, variables: data || {} };
  } else if (html) {
    payload.html = html;
  }

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
 * Schedule an entire 16-email sequence via Resend.
 *
 * @param {Object} options
 * @param {string} options.to - Recipient email
 * @param {string} options.firstName - Recipient first name (template variable)
 * @param {Date|string} options.bookingTime - When the call is scheduled
 * @param {string} options.tier - User's tier (for logging)
 * @param {string} [options.callLink] - Call/join link from booking event
 * @param {Array} options.emails - Array of { id, subject, templateId }
 * @returns {Promise<Object>} Results of scheduling
 */
export async function scheduleEmailSequence({ to, firstName, bookingTime, tier, callLink, emails }) {
  const recipient = String(to || '').trim();
  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipient);
  if (!isValidEmail) {
    throw new Error(`Invalid recipient email for Resend sequence: "${to}"`);
  }

  const sendTimes = calculateEmailSchedule(bookingTime);
  const results = [];
  const normalizedCallLink = String(callLink || '').trim();

  console.log(`Scheduling ${sendTimes.length} emails for ${recipient} (${tier} tier)`);
  console.log(`Booking time: ${new Date(bookingTime).toISOString()}`);
  console.log(`Send times calculated:`, sendTimes.map((t) => t.toISOString()));

  for (let i = 0; i < sendTimes.length; i++) {
    const email = emails[i];
    const sendTime = sendTimes[i];

    if (!email) break;

    try {
      const result = await scheduleEmail({
        to: recipient,
        subject: email.subject,
        templateId: email.templateId,
        data: {
          firstName,
          attendeeEmail: recipient,
          recipientEmail: recipient,
          sentToEmail: recipient,
          email: recipient,
          callLink: normalizedCallLink,
          meetingLink: normalizedCallLink,
          call_link: normalizedCallLink,
          meeting_link: normalizedCallLink,
        },
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

      // 500ms throttle to stay under Resend's 2 req/sec rate limit
      if (i < sendTimes.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
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
