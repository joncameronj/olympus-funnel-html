/**
 * Wistia Video Lazy Loader
 *
 * Click-to-load pattern for Wistia videos.
 * Shows a static thumbnail until user clicks play.
 *
 * Usage:
 * <div class="video-facade" data-wistia-id="YOUR_VIDEO_ID">
 *   <img src="poster.webp" alt="Watch video">
 *   <button class="play-btn" aria-label="Play video"></button>
 * </div>
 */

(function() {
  'use strict';

  let wistiaLoaded = false;
  let wistiaReady = false;

  /**
   * Initialize video facades
   */
  function init() {
    const facades = document.querySelectorAll('.video-facade[data-wistia-id]');

    facades.forEach(function(facade) {
      facade.addEventListener('click', function() {
        loadAndPlay(facade);
      });
    });
  }

  /**
   * Load Wistia script and play video
   */
  function loadAndPlay(facade) {
    const videoId = facade.dataset.wistiaId;

    if (!videoId || videoId === 'YOUR_WISTIA_VIDEO_ID') {
      console.warn('[Video] No valid Wistia video ID configured');
      return;
    }

    // Show loading state
    facade.classList.add('loading');
    const playBtn = facade.querySelector('.play-btn');
    if (playBtn) {
      playBtn.style.display = 'none';
    }

    // Load Wistia script if not already loaded
    if (!wistiaLoaded) {
      wistiaLoaded = true;
      loadWistiaScript(function() {
        wistiaReady = true;
        embedVideo(facade, videoId);
      });
    } else if (wistiaReady) {
      embedVideo(facade, videoId);
    } else {
      // Script loading, wait for it
      window._wq = window._wq || [];
      _wq.push({ id: '_all', onReady: function() {
        wistiaReady = true;
        embedVideo(facade, videoId);
      }});
    }
  }

  /**
   * Load Wistia E-v1.js script
   */
  function loadWistiaScript(callback) {
    const script = document.createElement('script');
    script.src = 'https://fast.wistia.com/assets/external/E-v1.js';
    script.async = true;
    script.onload = callback;
    document.head.appendChild(script);
  }

  /**
   * Embed the video and start playing
   */
  function embedVideo(facade, videoId) {
    const container = facade.parentElement;

    // Create Wistia embed container
    const embedContainer = document.createElement('div');
    embedContainer.className = 'wistia_responsive_padding';
    embedContainer.style.cssText = 'padding:56.25% 0 0 0;position:relative;';

    const embedWrapper = document.createElement('div');
    embedWrapper.className = 'wistia_responsive_wrapper';
    embedWrapper.style.cssText = 'height:100%;left:0;position:absolute;top:0;width:100%;';

    const embedDiv = document.createElement('div');
    embedDiv.className = 'wistia_embed wistia_async_' + videoId + ' videoFoam=true autoPlay=true';
    embedDiv.style.cssText = 'height:100%;position:relative;width:100%;';

    embedWrapper.appendChild(embedDiv);
    embedContainer.appendChild(embedWrapper);

    // Replace facade with embed
    facade.style.display = 'none';
    container.appendChild(embedContainer);

    // Set up video tracking
    window._wq = window._wq || [];
    _wq.push({
      id: videoId,
      onReady: function(video) {
        setupVideoTracking(video, videoId);
      }
    });
  }

  /**
   * Set up video event tracking
   */
  function setupVideoTracking(video, videoId) {
    let trackedMilestones = {};

    // Track play event
    video.bind('play', function() {
      if (typeof trackEvent === 'function') {
        trackEvent('video_play', { video_id: videoId });
      }
    });

    // Track video end
    video.bind('end', function() {
      if (typeof trackEvent === 'function') {
        trackEvent('video_complete', {
          video_id: videoId,
          watch_time: video.time()
        });
      }
    });

    // Track percentage milestones
    video.bind('percentwatchedchanged', function(percent) {
      const milestones = [25, 50, 75, 100];
      milestones.forEach(function(milestone) {
        if (percent >= milestone / 100 && !trackedMilestones[milestone]) {
          trackedMilestones[milestone] = true;
          if (typeof trackEvent === 'function') {
            trackEvent('video_progress', {
              video_id: videoId,
              percent: milestone
            });
          }
        }
      });
    });
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
