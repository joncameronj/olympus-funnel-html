/**
 * Base HTML Email Template
 *
 * Provides consistent styling and structure for all prep emails.
 */

/**
 * Wrap email content in base HTML template
 *
 * @param {Object} options - Template options
 * @param {string} options.content - Main email content (HTML)
 * @param {string} options.preheader - Preview text shown in inbox (optional)
 * @returns {string} Complete HTML email
 */
export function baseTemplate({ content, preheader = '' }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Olympus</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  <style>
    /* Reset */
    body, table, td, p, a, li { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }

    /* Base */
    body {
      margin: 0 !important;
      padding: 0 !important;
      background-color: #f4f4f4;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    }

    /* Container */
    .email-container {
      max-width: 600px;
      margin: 0 auto;
    }

    /* Content */
    .email-content {
      background-color: #ffffff;
      padding: 40px;
    }

    /* Typography */
    h1, h2, h3 {
      color: #1a1a1a;
      margin: 0 0 16px 0;
      font-weight: 600;
    }

    h1 { font-size: 24px; line-height: 1.3; }
    h2 { font-size: 20px; line-height: 1.3; }
    h3 { font-size: 18px; line-height: 1.3; }

    p {
      color: #4a4a4a;
      font-size: 16px;
      line-height: 1.6;
      margin: 0 0 16px 0;
    }

    a {
      color: #f97316;
      text-decoration: none;
    }

    /* Footer */
    .email-footer {
      padding: 24px 40px;
      text-align: center;
    }

    .email-footer p {
      color: #9ca3af;
      font-size: 14px;
      margin: 0;
    }

    /* Signature */
    .signature {
      margin-top: 32px;
      padding-top: 24px;
      border-top: 1px solid #e5e7eb;
    }

    .signature p {
      margin: 0;
      color: #6b7280;
    }

    /* Mobile */
    @media screen and (max-width: 600px) {
      .email-content {
        padding: 24px !important;
      }
      .email-footer {
        padding: 16px 24px !important;
      }
    }
  </style>
</head>
<body>
  <!-- Preheader (hidden preview text) -->
  ${preheader ? `<div style="display:none;font-size:1px;color:#f4f4f4;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">${preheader}</div>` : ''}

  <!-- Email wrapper -->
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f4f4f4;">
    <tr>
      <td style="padding: 40px 20px;">

        <!-- Main container -->
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" class="email-container" style="max-width: 600px; margin: 0 auto;">

          <!-- Content -->
          <tr>
            <td class="email-content" style="background-color: #ffffff; padding: 40px; border-radius: 8px;">
              ${content}

              <!-- Signature -->
              <div class="signature" style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #e5e7eb;">
                <p style="margin: 0; color: #6b7280;">&mdash; The Olympus Team</p>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td class="email-footer" style="padding: 24px 40px; text-align: center;">
              <p style="color: #9ca3af; font-size: 14px; margin: 0;">
                Olympus &bull; Helping healthcare practices grow
              </p>
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>
</body>
</html>`;
}
