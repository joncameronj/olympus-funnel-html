/**
 * Test script for Ro.am notifications.
 *
 * Run with Vercel env vars loaded:
 *   npx vercel env pull .env.local && node --env-file=.env.local tmp/test-roam.mjs
 *
 * Or pass env vars directly:
 *   ROAM_API_KEY=xxx ROAM_CHANNEL_ID=xxx node tmp/test-roam.mjs
 */

const apiKey = process.env.ROAM_API_KEY;
const channelId = process.env.ROAM_CHANNEL_ID;

if (!apiKey || !channelId) {
  console.error('Missing ROAM_API_KEY or ROAM_CHANNEL_ID');
  console.error('Run: ROAM_API_KEY=xxx ROAM_CHANNEL_ID=xxx node tmp/test-roam.mjs');
  process.exit(1);
}

const testData = {
  name: 'TESTFNAME TESTLNAME',
  email: 'test@example.com',
  phone: '555-000-1234',
  practiceDescription: 'Test Practice - Verifying Notification Pipeline',
  website: 'www.testpractice.com',
  goals: 'Testing notification pipeline',
  budget: '$5,000/month',
  challenges: 'This is a TEST notification - please ignore',
  segment: 'alpha',
  segmentLabel: 'Alpha',
  revenueRange: '$750K - $1.5M',
  callLink: 'https://cal.com/test',
  startTime: new Date(Date.now() + 86400000).toISOString(),
};

// Format exactly like cal-webhook.js formatRoamMessage()
let bookingTime = 'Not available';
if (testData.startTime) {
  const start = new Date(testData.startTime);
  bookingTime = start.toLocaleString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
    hour: 'numeric', minute: '2-digit', hour12: true,
    timeZone: 'America/New_York',
  });
}

const message = [
  '\u{1F504} **NEW OLYMPUS DEMO BOOKED** (TEST)',
  `**Name:** ${testData.name}`,
  `**Email:** ${testData.email}`,
  `**Phone:** ${testData.phone}`,
  `**Quick description of your practice:** ${testData.practiceDescription}`,
  `**What website do you want Olympus to grow?** ${testData.website}`,
  `**What do you want Olympus to help you achieve?** ${testData.goals}`,
  `**Roughly how much goes towards growth & marketing each month?** ${testData.budget}`,
  `**Biggest patient acquisition challenges?** ${testData.challenges}`,
  `**Segment:** ${testData.segmentLabel} | ${testData.revenueRange}`,
  `**Call link:** ${testData.callLink}`,
  `\u{1F4C5} **Booked:** ${bookingTime}`,
].join('\n\n');

console.log('--- Message ---');
console.log(message);
console.log('\n--- Sending to Ro.am ---');

try {
  const res = await fetch('https://api.ro.am/v1/chat.sendMessage', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      text: message,
      sender: { name: 'Olympus', id: 'olympus' },
      recipients: [channelId],
    }),
  });

  const body = await res.text();
  console.log('Status:', res.status);
  console.log('Response:', body);
  console.log(res.ok ? '\nSUCCESS - Check Ro.am!' : '\nFAILED');
} catch (err) {
  console.error('Error:', err.message);
}
