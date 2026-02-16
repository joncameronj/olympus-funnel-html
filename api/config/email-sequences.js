/**
 * Email Sequences Configuration
 *
 * Defines 12 core prep content emails (same for all tiers) and timing settings.
 */

// Timing configuration
export const TIMING_CONFIG = {
  // Minimum time between emails (in minutes)
  MIN_SPACING_MINUTES: 30,

  // Buffer before call - no emails sent within this window (in hours)
  BUFFER_BEFORE_CALL_HOURS: 2,

  // Number of emails in sequence
  EMAILS_PER_TIER: 12,
};

// Tier definitions (kept for logging/tracking purposes)
export const TIERS = {
  LAMBDA: 'lambda',
  ALPHA: 'alpha',
  SIGMA: 'sigma',
  ENTERPRISE: 'enterprise',
};

// Single email sequence for all tiers
export const EMAIL_SEQUENCE = [
  { id: 1, subject: 'Prep Email 1' },
  { id: 2, subject: 'Prep Email 2' },
  { id: 3, subject: 'Prep Email 3' },
  { id: 4, subject: 'Prep Email 4' },
  { id: 5, subject: 'Prep Email 5' },
  { id: 6, subject: 'Prep Email 6' },
  { id: 7, subject: 'Prep Email 7' },
  { id: 8, subject: 'Prep Email 8' },
  { id: 9, subject: 'Prep Email 9' },
  { id: 10, subject: 'Prep Email 10' },
  { id: 11, subject: 'Prep Email 11' },
  { id: 12, subject: 'Prep Email 12' },
];

/**
 * Normalize tier string from Cal.com to our tier key
 * Cal.com might return various formats like "Lambda", "LAMBDA", "Lambda tier", etc.
 */
export function normalizeTier(tierString) {
  if (!tierString || tierString === 'Not provided') {
    return TIERS.LAMBDA; // Default to Lambda
  }

  const normalized = tierString.toLowerCase().trim();

  if (normalized.includes('enterprise')) return TIERS.ENTERPRISE;
  if (normalized.includes('sigma')) return TIERS.SIGMA;
  if (normalized.includes('alpha')) return TIERS.ALPHA;
  if (normalized.includes('lambda')) return TIERS.LAMBDA;

  // Default to Lambda if no match
  return TIERS.LAMBDA;
}

/**
 * Get email sequence (same for all tiers)
 */
export function getEmailSequence() {
  return EMAIL_SEQUENCE;
}
