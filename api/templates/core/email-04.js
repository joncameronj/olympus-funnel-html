/**
 * Prep Email 4
 */

import { baseTemplate } from '../_base.js';

export function getTemplate({ name }) {
  const content = `
    <h1>Prep Email 4</h1>
    <p>Hi ${name || 'there'},</p>
    <p>[Placeholder for prep content]</p>
  `;

  return baseTemplate({
    content,
    preheader: 'Prep Email 4 - Get ready for your Olympus call',
  });
}
