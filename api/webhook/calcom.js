/**
 * Cal.com Webhook Handler - Routes to main handler
 * This endpoint exists at /api/webhook/calcom to match Cal.com's configured URL
 */

// Re-export the handler from the main cal-webhook file
export { default, config } from '../cal-webhook.js';
