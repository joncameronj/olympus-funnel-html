/**
 * Pricing Calculator
 *
 * Handles revenue input formatting and dynamic tier highlighting
 * based on monthly revenue thresholds.
 */

document.addEventListener('DOMContentLoaded', function() {
  'use strict';

  // Elements
  const revenueInput = document.getElementById('revenue-input');
  const pricingCards = document.querySelectorAll('.pricing-card[data-tier]');
  const checkBtn = document.getElementById('revenue-check-btn');
  const checkIcon = document.getElementById('revenue-check-icon');

  // Early exit if elements don't exist
  if (!revenueInput || pricingCards.length === 0) return;

  // Lottie animation for check icon
  let checkAnimation = null;
  if (checkIcon && typeof lottie !== 'undefined') {
    checkAnimation = lottie.loadAnimation({
      container: checkIcon,
      renderer: 'svg',
      loop: false,
      autoplay: false,
      path: '/animated-darktheme/system-solid-31-check-hover-pinch.json'
    });
  }

  /**
   * Clear all card highlights
   */
  function clearAllHighlights() {
    pricingCards.forEach(function(card) {
      card.classList.remove('highlighted');
    });
  }

  /**
   * Format number with commas for thousands
   * @param {string} value - Raw input value
   * @returns {string} Formatted number
   */
  function formatCurrency(value) {
    // Remove all non-digit characters
    const digits = value.replace(/\D/g, '');

    // Return empty string if no digits
    if (!digits) return '';

    // Convert to number and format with commas
    return parseInt(digits, 10).toLocaleString('en-US');
  }

  /**
   * Parse formatted currency string to number
   * @param {string} value - Formatted currency string
   * @returns {number} Numeric value
   */
  function parseCurrency(value) {
    const digits = value.replace(/\D/g, '');
    return digits ? parseInt(digits, 10) : 0;
  }

  /**
   * Determine which tier should be highlighted based on revenue
   * @param {number} revenue - Monthly revenue amount
   * @returns {string|null} Tier name or null (null if no revenue entered)
   */
  function getRecommendedTier(revenue) {
    // Return null if no revenue entered - don't default to any tier
    if (!revenue || revenue === 0) {
      return null;
    }

    // Revenue thresholds for tier recommendations
    if (revenue <= 62500) {
      return 'lambda';
    } else if (revenue <= 125000) {
      return 'alpha';
    } else if (revenue <= 300000) {
      return 'sigma';
    } else {
      return 'omega';
    }
  }

  /**
   * Update card highlighting based on revenue
   * @param {number} revenue - Monthly revenue amount
   */
  function updateHighlighting(revenue) {
    const recommendedTier = getRecommendedTier(revenue);

    // First, clear all highlights
    clearAllHighlights();

    // Only add highlight if there's a valid recommendation
    if (recommendedTier !== null) {
      pricingCards.forEach(function(card) {
        const tier = card.getAttribute('data-tier');
        if (tier === recommendedTier) {
          card.classList.add('highlighted');
        }
      });
    }
  }

  /**
   * Handle input changes - only format, don't highlight
   */
  function handleInput(e) {
    // Remove error state when user starts typing
    revenueInput.classList.remove('error');
    revenueInput.placeholder = '0';

    // Format the input value
    const formatted = formatCurrency(e.target.value);
    e.target.value = formatted;
  }

  /**
   * Handle check button click
   */
  function handleCheck() {
    const revenue = parseCurrency(revenueInput.value);

    // Validate - show error if empty
    if (!revenue || revenue === 0) {
      revenueInput.classList.add('error');
      revenueInput.value = '';
      revenueInput.placeholder = 'Enter monthly revenue';
      revenueInput.focus();
      return;
    }

    // Remove error state
    revenueInput.classList.remove('error');

    // Update highlighting
    updateHighlighting(revenue);

    // Scroll to top of pricing container
    const pricingContainer = document.querySelector('.pricing-container');
    if (pricingContainer) {
      pricingContainer.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }

    // Play Lottie animation
    if (checkAnimation) {
      checkAnimation.goToAndPlay(0, true);
    }

    // Track event (if tracking is available)
    if (typeof trackEvent === 'function') {
      trackEvent('pricing_calculator_used', {
        revenue: revenue,
        recommended_tier: getRecommendedTier(revenue)
      });
    }
  }

  // Event listeners
  revenueInput.addEventListener('input', handleInput);
  revenueInput.addEventListener('change', handleInput);

  // Check button click handler
  if (checkBtn) {
    checkBtn.addEventListener('click', handleCheck);
  }

  // Keyboard input handling
  revenueInput.addEventListener('keydown', function(e) {
    // Handle Enter key - trigger check
    if (e.key === 'Enter' || e.keyCode === 13) {
      e.preventDefault();
      handleCheck();
      return;
    }

    // Allow: backspace, delete, tab, escape
    if ([46, 8, 9, 27].indexOf(e.keyCode) !== -1 ||
        // Allow: Ctrl/Cmd+A, Ctrl/Cmd+C, Ctrl/Cmd+V, Ctrl/Cmd+X
        (e.keyCode === 65 && (e.ctrlKey === true || e.metaKey === true)) ||
        (e.keyCode === 67 && (e.ctrlKey === true || e.metaKey === true)) ||
        (e.keyCode === 86 && (e.ctrlKey === true || e.metaKey === true)) ||
        (e.keyCode === 88 && (e.ctrlKey === true || e.metaKey === true)) ||
        // Allow: home, end, left, right
        (e.keyCode >= 35 && e.keyCode <= 39)) {
      return;
    }

    // Ensure that it is a number and stop the keypress
    if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) &&
        (e.keyCode < 96 || e.keyCode > 105)) {
      e.preventDefault();
    }
  });

  // IMPORTANT: Clear all highlights on page load - no default recommendation
  clearAllHighlights();

});
