/**
 * Email Template Loader
 *
 * Provides a unified interface to load email templates.
 * All templates are imported statically for Edge runtime compatibility.
 */

// Core templates (same for all tiers)
import { getTemplate as email01 } from './core/email-01.js';
import { getTemplate as email02 } from './core/email-02.js';
import { getTemplate as email03 } from './core/email-03.js';
import { getTemplate as email04 } from './core/email-04.js';
import { getTemplate as email05 } from './core/email-05.js';
import { getTemplate as email06 } from './core/email-06.js';
import { getTemplate as email07 } from './core/email-07.js';
import { getTemplate as email08 } from './core/email-08.js';
import { getTemplate as email09 } from './core/email-09.js';
import { getTemplate as email10 } from './core/email-10.js';
import { getTemplate as email11 } from './core/email-11.js';
import { getTemplate as email12 } from './core/email-12.js';

// Template map by email number
const TEMPLATES = {
  1: email01,
  2: email02,
  3: email03,
  4: email04,
  5: email05,
  6: email06,
  7: email07,
  8: email08,
  9: email09,
  10: email10,
  11: email11,
  12: email12,
};

/**
 * Get email template HTML for a specific email number
 *
 * @param {string} tier - Tier name (kept for logging, but not used for template selection)
 * @param {number} emailNumber - Email number (1-12)
 * @param {Object} data - Template data (name, tier, etc.)
 * @returns {string} HTML email content
 */
export function getEmailTemplate(tier, emailNumber, data = {}) {
  const template = TEMPLATES[emailNumber];

  if (!template) {
    console.warn(`Unknown email number: ${emailNumber}, using email 1`);
    return TEMPLATES[1](data);
  }

  return template(data);
}
