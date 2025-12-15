// KPI Calculator - ROI-based cost metrics
(function() {
  // DOM Elements
  const offerPriceSlider = document.getElementById('offer-price-slider');
  const offerPriceDisplay = document.getElementById('offer-price-display');
  const roiDisplay = document.getElementById('roi-display');
  const roiDecrease = document.getElementById('roi-decrease');
  const roiIncrease = document.getElementById('roi-increase');
  const costPerLead = document.getElementById('cost-per-lead');
  const costPerCall = document.getElementById('cost-per-call');
  const costPerConsult = document.getElementById('cost-per-consult');
  const costPerStart = document.getElementById('cost-per-start');

  // State
  let currentROI = 5;
  const MIN_ROI = 2;
  const MAX_ROI = 20;

  // Format number as currency
  function formatCurrency(value) {
    return '$' + Math.round(value).toLocaleString('en-US');
  }

  // Calculate and update all metrics
  function updateMetrics() {
    const offerPrice = parseInt(offerPriceSlider.value, 10);

    // Update offer price display
    offerPriceDisplay.textContent = formatCurrency(offerPrice);

    // Calculate costs based on ROI
    // Cost Per Start = Offer Price / ROI
    const perStart = offerPrice / currentROI;
    // 1 in 4 consults become starts
    const perConsult = perStart / 4;
    // 1 in 5 calls become consults
    const perCall = perConsult / 5;
    // 1 in 5 leads become calls
    const perLead = perCall / 5;

    // Update displays
    costPerStart.textContent = formatCurrency(perStart);
    costPerConsult.textContent = formatCurrency(perConsult);
    costPerCall.textContent = formatCurrency(perCall);
    costPerLead.textContent = formatCurrency(perLead);

    // Update ROI display
    roiDisplay.textContent = currentROI + 'x';

    // Update slider track fill
    updateSliderTrack();
  }

  // Update slider track to show filled portion
  function updateSliderTrack() {
    const min = parseInt(offerPriceSlider.min, 10);
    const max = parseInt(offerPriceSlider.max, 10);
    const value = parseInt(offerPriceSlider.value, 10);
    const percentage = ((value - min) / (max - min)) * 100;

    offerPriceSlider.style.background = `linear-gradient(to right, #10B981 0%, #10B981 ${percentage}%, rgba(120, 120, 128, 0.16) ${percentage}%, rgba(120, 120, 128, 0.16) 100%)`;
  }

  // Decrease ROI
  function decreaseROI() {
    if (currentROI > MIN_ROI) {
      currentROI--;
      updateMetrics();
    }
  }

  // Increase ROI
  function increaseROI() {
    if (currentROI < MAX_ROI) {
      currentROI++;
      updateMetrics();
    }
  }

  // Event Listeners
  if (offerPriceSlider) {
    offerPriceSlider.addEventListener('input', updateMetrics);
  }

  if (roiDecrease) {
    roiDecrease.addEventListener('click', decreaseROI);
  }

  if (roiIncrease) {
    roiIncrease.addEventListener('click', increaseROI);
  }

  // Initialize
  updateMetrics();
})();
