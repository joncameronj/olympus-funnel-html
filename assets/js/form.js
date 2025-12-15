/**
 * Form Handler
 *
 * Handles form submission, validation, and RO.AM notification.
 * Captures UTM parameters and stores lead data for calendar page.
 */

(function() {
  'use strict';

  const form = document.getElementById('lead-form');
  if (!form) return;

  /**
   * Get UTM parameters from URL
   */
  function getUtmParams() {
    const params = new URLSearchParams(window.location.search);
    return {
      utm_source: params.get('utm_source') || '',
      utm_medium: params.get('utm_medium') || '',
      utm_campaign: params.get('utm_campaign') || '',
      utm_term: params.get('utm_term') || '',
      utm_content: params.get('utm_content') || '',
      gclid: params.get('gclid') || '',
      fbclid: params.get('fbclid') || ''
    };
  }

  /**
   * Simple email validation
   */
  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  /**
   * Validate form fields
   */
  function validateForm(data) {
    const errors = [];

    if (!data.name || data.name.trim().length < 2) {
      errors.push('Please enter your full name');
    }

    if (!data.email || !isValidEmail(data.email)) {
      errors.push('Please enter a valid email address');
    }

    if (!data.phone || data.phone.trim().length < 7) {
      errors.push('Please enter a valid phone number');
    }

    return errors;
  }

  /**
   * Show error message
   */
  function showError(message) {
    // Remove existing error
    const existing = form.querySelector('.form-error');
    if (existing) existing.remove();

    const errorDiv = document.createElement('div');
    errorDiv.className = 'form-error';
    errorDiv.style.cssText = 'background:#fef2f2;color:#dc2626;padding:12px 16px;border-radius:8px;margin-bottom:20px;font-size:0.875rem;';
    errorDiv.textContent = message;
    form.insertBefore(errorDiv, form.firstChild);
  }

  /**
   * Set button loading state
   */
  function setLoading(button, isLoading) {
    if (isLoading) {
      button.disabled = true;
      button.dataset.originalText = button.textContent;
      button.textContent = '';
      button.classList.add('btn-loading');
    } else {
      button.disabled = false;
      button.textContent = button.dataset.originalText || 'Submit';
      button.classList.remove('btn-loading');
    }
  }

  /**
   * Send notification to RO.AM via API proxy
   */
  async function notifyRoam(data) {
    try {
      const response = await fetch('/api/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'form_submission',
          data: data
        })
      });

      if (!response.ok) {
        throw new Error('API error: ' + response.status);
      }

      return await response.json();
    } catch (error) {
      // Queue for retry
      queueFailedNotification({
        type: 'form_submission',
        data: data,
        timestamp: Date.now()
      });
      console.log('[Form] Notification queued for retry');
    }
  }

  /**
   * Queue failed notifications for retry
   */
  function queueFailedNotification(payload) {
    try {
      const queue = JSON.parse(localStorage.getItem('notification_queue') || '[]');
      queue.push(payload);
      localStorage.setItem('notification_queue', JSON.stringify(queue.slice(-10))); // Keep last 10
    } catch (e) {
      console.warn('[Form] Could not queue notification');
    }
  }

  /**
   * Process retry queue
   */
  async function processRetryQueue() {
    try {
      const queue = JSON.parse(localStorage.getItem('notification_queue') || '[]');
      if (queue.length === 0) return;

      const payload = queue.shift();
      localStorage.setItem('notification_queue', JSON.stringify(queue));

      await fetch('/api/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    } catch (e) {
      // Will retry next time
    }
  }

  /**
   * Handle form submission
   */
  form.addEventListener('submit', async function(e) {
    e.preventDefault();

    // Remove existing errors
    const existingError = form.querySelector('.form-error');
    if (existingError) existingError.remove();

    // Get form data
    const formData = new FormData(form);
    const data = {
      name: formData.get('name') || '',
      email: formData.get('email') || '',
      phone: formData.get('phone') || ''
    };

    // Add any additional form fields
    for (const [key, value] of formData.entries()) {
      if (!data[key]) {
        data[key] = value;
      }
    }

    // Validate
    const errors = validateForm(data);
    if (errors.length > 0) {
      showError(errors[0]);
      return;
    }

    // Get submit button
    const submitBtn = form.querySelector('button[type="submit"]');
    setLoading(submitBtn, true);

    // Add UTM params
    const utmParams = getUtmParams();
    Object.assign(data, utmParams);

    // Store lead data for calendar page
    sessionStorage.setItem('lead_name', data.name);
    sessionStorage.setItem('lead_email', data.email);
    sessionStorage.setItem('lead_phone', data.phone);

    try {
      // Fire tracking events
      if (typeof trackEvent === 'function') {
        trackEvent('form_submit', {
          content_name: 'Lead Form',
          email: data.email
        });
      }

      // Send to RO.AM (non-blocking)
      notifyRoam(data);

      // Redirect to calendar
      window.location.href = '/calendar.html';

    } catch (error) {
      console.error('[Form] Submission error:', error);
      setLoading(submitBtn, false);
      showError('Something went wrong. Please try again.');
    }
  });

  // Process retry queue on page load
  processRetryQueue();

  // Track form field focus (for analytics)
  const inputs = form.querySelectorAll('input, select, textarea');
  inputs.forEach(function(input) {
    input.addEventListener('focus', function() {
      if (typeof trackEvent === 'function') {
        trackEvent('form_field_focus', {
          field_name: input.name || input.id
        });
      }
    }, { once: true });
  });

})();
