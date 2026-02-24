(function() {
  'use strict';

  const SEGMENT_CONFIG = {
    'just-getting-started': {
      segment: 'just-getting-started',
      label: 'Just Getting Started',
      revenueRange: '$0-$250K annual revenue',
      tier: 'lambda',
      calendarNumber: 1,
      calendarOwner: 'joncameron'
    },
    'lambda': {
      segment: 'lambda',
      label: 'Lambda',
      revenueRange: '$250K-$750K annual revenue',
      tier: 'lambda',
      calendarNumber: 1,
      calendarOwner: 'joncameron'
    },
    'alpha': {
      segment: 'alpha',
      label: 'Alpha',
      revenueRange: '$750K-$1.5M annual revenue',
      tier: 'alpha',
      calendarNumber: 1,
      calendarOwner: 'joncameron'
    },
    'sigma': {
      segment: 'sigma',
      label: 'Sigma',
      revenueRange: '$1.5M-$3.6M annual revenue',
      tier: 'sigma',
      calendarNumber: 1,
      calendarOwner: 'joncameron'
    },
    'omega': {
      segment: 'omega',
      label: 'Omega',
      revenueRange: '$3.6M+ annual revenue or multi-location',
      tier: 'enterprise',
      calendarNumber: 1,
      calendarOwner: 'joncameron'
    }
  };

  const modal = document.getElementById('demo-routing-modal');
  if (!modal) return;

  const triggers = document.querySelectorAll('[data-book-demo-trigger]');
  const closeButtons = modal.querySelectorAll('[data-demo-routing-close]');
  const cards = modal.querySelectorAll('.demo-routing-card[data-demo-segment]');

  if (triggers.length === 0 || cards.length === 0) return;

  function getAttributionParams() {
    const params = new URLSearchParams(window.location.search);
    const keys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'gclid', 'fbclid'];
    const result = {};

    keys.forEach(function(key) {
      const value = params.get(key);
      if (value) result[key] = value;
    });

    return result;
  }

  function openModal(event) {
    if (event) {
      event.preventDefault();
    }

    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  function persistSelection(selection) {
    sessionStorage.setItem('routing_segment', selection.segment);
    sessionStorage.setItem('routing_segment_label', selection.label);
    sessionStorage.setItem('routing_revenue_range', selection.revenueRange);
    sessionStorage.setItem('routing_tier', selection.tier);
    sessionStorage.setItem('routing_calendar_owner', selection.calendarOwner);
    sessionStorage.setItem('routing_calendar_number', String(selection.calendarNumber));
    sessionStorage.setItem('routing_selected_at', new Date().toISOString());
  }

  function buildCalendarUrl(selection) {
    const destination = new URL('/calendar.html', window.location.origin);
    const attribution = getAttributionParams();

    Object.keys(attribution).forEach(function(key) {
      destination.searchParams.set(key, attribution[key]);
    });

    destination.searchParams.set('segment', selection.segment);
    destination.searchParams.set('tier', selection.tier);
    destination.searchParams.set('calendar', String(selection.calendarNumber));
    destination.searchParams.set('owner', selection.calendarOwner);

    return destination.pathname + destination.search;
  }

  function notifySelection(selection) {
    const payload = {
      type: 'segment_selection',
      data: {
        segment: selection.segment,
        segmentLabel: selection.label,
        revenueRange: selection.revenueRange,
        tier: selection.tier,
        calendarNumber: selection.calendarNumber,
        calendarOwner: selection.calendarOwner,
        page: window.location.pathname,
        referrer: document.referrer || 'Direct',
        selectedAt: new Date().toISOString(),
        ...getAttributionParams()
      }
    };

    fetch('/api/notify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).catch(function() {
      console.warn('Could not notify Ro.am for segment selection');
    });
  }

  triggers.forEach(function(trigger) {
    trigger.addEventListener('click', openModal);
  });

  closeButtons.forEach(function(closeButton) {
    closeButton.addEventListener('click', closeModal);
  });

  document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape' && modal.classList.contains('open')) {
      closeModal();
    }
  });

  cards.forEach(function(card) {
    card.addEventListener('click', function() {
      const segment = card.dataset.demoSegment;
      const selection = SEGMENT_CONFIG[segment];
      if (!selection) return;

      persistSelection(selection);

      if (typeof trackEvent === 'function') {
        trackEvent('demo_segment_selected', {
          segment: selection.segment,
          tier: selection.tier,
          calendar_owner: selection.calendarOwner,
          calendar_number: selection.calendarNumber
        });
      }

      notifySelection(selection);
      window.location.href = buildCalendarUrl(selection);
    });
  });
})();
