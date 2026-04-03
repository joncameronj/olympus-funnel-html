/**
 * Vercel Edge Function - Cal.com Webhook Handler for Luke's calendar
 *
 * Thin wrapper around cal-webhook.js handler.
 * Webhook URL: https://olympus.etho.net/api/cal-webhook-luke
 */

import handler from './cal-webhook.js';

export const config = {
  runtime: 'edge',
};

export default handler;
