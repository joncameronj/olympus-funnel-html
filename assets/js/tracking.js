/**
 * Tracking Pixels - Delayed Loading
 *
 * Loads Meta Pixel, Google Ads, and Microsoft Clarity
 * after 3 seconds OR on first user interaction.
 *
 * CONFIGURATION: Replace placeholder IDs below with your actual IDs:
 * - META_PIXEL_ID
 * - GOOGLE_ADS_ID
 * - GOOGLE_ADS_CONVERSION_LABEL (for Lead conversion)
 * - CLARITY_PROJECT_ID
 */

(function() {
  'use strict';

  // Configuration - REPLACE THESE WITH YOUR ACTUAL IDs
  const CONFIG = {
    metaPixelId: 'YOUR_META_PIXEL_ID',         // e.g., '123456789012345'
    googleAdsId: 'AW-XXXXXXXXX',               // e.g., 'AW-123456789'
    googleConversionLabel: 'XXXXXXXXX',        // e.g., 'AbCdEfGhIjK'
    clarityProjectId: 'YOUR_CLARITY_ID'        // e.g., 'abc123xyz'
  };

  let trackingLoaded = false;

  /**
   * Load all tracking pixels
   */
  function loadTracking() {
    if (trackingLoaded) return;
    trackingLoaded = true;

    loadMetaPixel();
    loadGoogleAds();
    loadClarity();
  }

  /**
   * Meta (Facebook) Pixel
   */
  function loadMetaPixel() {
    if (CONFIG.metaPixelId === 'YOUR_META_PIXEL_ID') {
      console.log('[Tracking] Meta Pixel ID not configured');
      return;
    }

    !function(f,b,e,v,n,t,s) {
      if(f.fbq)return;
      n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};
      if(!f._fbq)f._fbq=n;
      n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];
      t=b.createElement(e);t.async=!0;
      t.src=v;s=b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t,s);
    }(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');

    fbq('init', CONFIG.metaPixelId);
    fbq('track', 'PageView');
  }

  /**
   * Google Ads (gtag.js)
   */
  function loadGoogleAds() {
    if (CONFIG.googleAdsId === 'AW-XXXXXXXXX') {
      console.log('[Tracking] Google Ads ID not configured');
      return;
    }

    // Load gtag.js script
    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=' + CONFIG.googleAdsId;
    document.head.appendChild(script);

    // Initialize gtag
    window.dataLayer = window.dataLayer || [];
    window.gtag = function() { dataLayer.push(arguments); };
    gtag('js', new Date());
    gtag('config', CONFIG.googleAdsId);
  }

  /**
   * Microsoft Clarity
   */
  function loadClarity() {
    if (CONFIG.clarityProjectId === 'YOUR_CLARITY_ID') {
      console.log('[Tracking] Clarity Project ID not configured');
      return;
    }

    (function(c,l,a,r,i,t,y){
      c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
      t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
      y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
    })(window, document, "clarity", "script", CONFIG.clarityProjectId);
  }

  /**
   * Track custom events across all platforms
   */
  window.trackEvent = function(eventName, properties) {
    properties = properties || {};

    // Meta Pixel
    if (typeof fbq !== 'undefined') {
      const metaEvents = {
        'form_submit': 'Lead',
        'video_play': 'ViewContent',
        'video_complete': 'ViewContent',
        'booking_complete': 'Schedule'
      };
      const metaEvent = metaEvents[eventName] || eventName;
      fbq('track', metaEvent, properties);
    }

    // Google Ads
    if (typeof gtag !== 'undefined') {
      // Fire conversion for lead events
      if (eventName === 'form_submit') {
        gtag('event', 'conversion', {
          'send_to': CONFIG.googleAdsId + '/' + CONFIG.googleConversionLabel,
          'value': 1.0,
          'currency': 'USD'
        });
      }
      // Also send as standard event
      gtag('event', eventName, properties);
    }

    // Clarity custom tags
    if (typeof clarity !== 'undefined') {
      clarity('set', eventName, JSON.stringify(properties));
    }
  };

  /**
   * Initialize tracking with delay
   * Load after 3 seconds OR on first user interaction
   */
  const loadTimer = setTimeout(loadTracking, 3000);

  const interactionEvents = ['click', 'scroll', 'touchstart', 'keydown'];
  interactionEvents.forEach(function(eventType) {
    window.addEventListener(eventType, function() {
      clearTimeout(loadTimer);
      loadTracking();
    }, { once: true, passive: true });
  });

})();
