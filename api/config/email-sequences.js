/**
 * Email Sequences Configuration
 *
 * Defines 16 prep content emails sent over 72 hours (4/day, 2-3hr spacing).
 * Templates live in Resend dashboard; this config maps sequence order,
 * subjects, and template IDs.
 */

// Timing configuration
export const TIMING_CONFIG = {
  MIN_SPACING_MINUTES: 120,       // 2 hours between emails
  MAX_SPACING_MINUTES: 180,       // 3 hours max
  BUFFER_BEFORE_CALL_HOURS: 1,    // Email 16 sends ~1 hour before call
  EMAILS_PER_SEQUENCE: 16,
  EMAILS_PER_DAY: 4,
  BUSINESS_HOURS_START: 9,        // 9am
  BUSINESS_HOURS_END: 21,         // 9pm
  SEQUENCE_DAYS: 3,
};

// Tier definitions (kept for logging/tracking purposes)
export const TIERS = {
  LAMBDA: 'lambda',
  ALPHA: 'alpha',
  SIGMA: 'sigma',
  ENTERPRISE: 'enterprise',
};

// 16-email sequence - templateId values match Resend dashboard slugs
export const EMAIL_SEQUENCE = [
  { id: 1,  subject: 'Read this first',                                  templateId: 'app-funnel-email-1-3' },
  { id: 2,  subject: 'The thing nobody tells you about agencies',         templateId: 'app-funnel-email-2' },
  { id: 3,  subject: 'One concept that keeps your practice from growing', templateId: 'app-funnel-email-3' },
  { id: 4,  subject: "The results I won't promise you",                   templateId: 'app-funnel-email-4' },
  { id: 5,  subject: 'Pre-sold patients',                                 templateId: 'app-funnel-email-5' },
  { id: 6,  subject: 'How it actually works',                             templateId: 'app-funnel-email-6' },
  { id: 7,  subject: "Let's talk about the investment...",                 templateId: 'app-funnel-email-7' },
  { id: 8,  subject: 'Holding your marketing hostage?',                   templateId: 'app-funnel-email-8' },
  { id: 9,  subject: "Let's talk about the risks",                        templateId: 'app-funnel-email-9' },
  { id: 10, subject: 'Is this just ChatGPT/Claude?',                      templateId: 'app-funnel-email-10' },
  { id: 11, subject: 'Might not work for you',                            templateId: 'app-funnel-email-11' },
  { id: 12, subject: 'Live in as few as 7 days. How is that even possible?',      templateId: 'app-funnel-email-12' },
  { id: 13, subject: 'What the first 30 days look like',                  templateId: 'app-funnel-email-13' },
  { id: 14, subject: 'Even my 9-year-old can run Olympus',                templateId: 'app-funnel-email-14' },
  { id: 15, subject: 'From practitioners like you',                       templateId: 'app-funnel-email-15' },
  { id: 16, subject: 'Ready when you are',                                templateId: 'app-funnel-email-16' },
];

/**
 * Normalize tier string from Cal.com to our tier key
 */
export function normalizeTier(tierString) {
  if (!tierString || tierString === 'Not provided') {
    return TIERS.LAMBDA;
  }

  const normalized = tierString.toLowerCase().trim();

  if (normalized.includes('omega') || normalized.includes('enterprise')) return TIERS.ENTERPRISE;
  if (normalized.includes('sigma')) return TIERS.SIGMA;
  if (normalized.includes('alpha')) return TIERS.ALPHA;
  if (normalized.includes('lambda')) return TIERS.LAMBDA;
  if (normalized.includes('just') && normalized.includes('started')) return TIERS.LAMBDA;

  return TIERS.LAMBDA;
}

/**
 * Get email sequence
 */
export function getEmailSequence() {
  return EMAIL_SEQUENCE;
}
