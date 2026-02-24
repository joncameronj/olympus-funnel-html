/**
 * Quiz Modal - Multi-step qualification form
 * 9-step wizard with animated transitions, validation, and ROAM integration
 */
(function() {
  'use strict';

  // Label mappings for display
  const spendLabels = {
    'none': 'Not investing yet',
    'under-5k': 'Less than $5K/month',
    '5k-15k': '$5K - $15K/month',
    '15k-30k': '$15K - $30K/month',
    '30k-plus': '$30K+/month',
    'not-sure': 'Not sure yet'
  };

  const challengeLabels = {
    'low-leads': 'Not getting enough leads',
    'poor-quality': 'Leads are low quality',
    'no-system': 'No marketing system in place',
    'conversion': 'Poor conversion rates',
    'scaling': "Can't scale marketing",
    'roi': "Can't measure ROI",
    'team': 'Need marketing team'
  };

  const tierLabels = {
    'lambda': 'Lambda ($0-$500K annual)',
    'alpha': 'Alpha ($500K-$1.5M annual)',
    'sigma': 'Sigma ($1.5M+)'
  };

  function getRoutingForTier(tier) {
    const map = {
      lambda: {
        segment: 'lambda',
        segmentLabel: 'Lambda',
        revenueRange: '$250K-$750K in annual revenue',
        tier: 'lambda',
        calendarNumber: 2,
        calendarOwner: 'luke'
      },
      alpha: {
        segment: 'alpha',
        segmentLabel: 'Alpha',
        revenueRange: '$750K-$1.5M in annual revenue',
        tier: 'alpha',
        calendarNumber: 1,
        calendarOwner: 'joncameron'
      },
      sigma: {
        segment: 'sigma',
        segmentLabel: 'Sigma',
        revenueRange: '$1.5M-$3.6M in annual revenue',
        tier: 'sigma',
        calendarNumber: 1,
        calendarOwner: 'joncameron'
      }
    };

    return map[tier] || map.lambda;
  }

  const countryCodes = [
    { code: '+1', label: 'US (+1)' },
    { code: '+1', label: 'CA (+1)' },
    { code: '+44', label: 'UK (+44)' },
    { code: '+61', label: 'AU (+61)' },
    { code: '+33', label: 'FR (+33)' },
    { code: '+49', label: 'DE (+49)' },
    { code: '+81', label: 'JP (+81)' },
    { code: '+86', label: 'CN (+86)' },
    { code: '+91', label: 'IN (+91)' },
    { code: '+55', label: 'BR (+55)' },
    { code: '+52', label: 'MX (+52)' },
    { code: '+34', label: 'ES (+34)' },
    { code: '+39', label: 'IT (+39)' },
    { code: '+31', label: 'NL (+31)' },
    { code: '+46', label: 'SE (+46)' },
    { code: '+47', label: 'NO (+47)' },
    { code: '+45', label: 'DK (+45)' },
    { code: '+41', label: 'CH (+41)' },
    { code: '+32', label: 'BE (+32)' },
    { code: '+353', label: 'IE (+353)' }
  ];

  const quiz = {
    currentStep: 1,
    totalSteps: 9,
    direction: 'forward',
    isAnimating: false,
    isMobile: window.innerWidth <= 768,
    formData: {
      firstName: '',
      lastName: '',
      practiceDescription: '',
      website: '',
      currentSituation: '',
      marketingSpend: '',
      marketingChallenges: [],
      tier: '',
      countryCode: '+1',
      phoneNumber: '',
      email: ''
    },

    // DOM elements
    modal: null,
    backdrop: null,
    container: null,
    progressStepEl: null,
    progressPercentEl: null,
    progressSegments: null,
    stepsContainer: null,
    steps: null,
    backBtn: null,
    nextBtn: null,
    closeBtn: null,

    init: function() {
      // Get DOM elements
      this.modal = document.getElementById('quiz-modal');
      if (!this.modal) return;

      this.backdrop = this.modal.querySelector('.quiz-modal-backdrop');
      this.container = this.modal.querySelector('.quiz-modal-container');
      this.progressStepEl = document.getElementById('quiz-current-step');
      this.progressPercentEl = document.getElementById('quiz-percent');
      this.progressSegments = this.modal.querySelectorAll('.quiz-progress-segment');
      this.stepsContainer = this.modal.querySelector('.quiz-steps');
      this.steps = this.modal.querySelectorAll('.quiz-step');
      this.backBtn = this.modal.querySelector('.quiz-back');
      this.nextBtn = this.modal.querySelector('.quiz-next');
      this.closeBtn = this.modal.querySelector('.quiz-close');

      // Event listeners
      this.backdrop.addEventListener('click', this.closeModal.bind(this));
      this.closeBtn.addEventListener('click', this.closeModal.bind(this));
      this.backBtn.addEventListener('click', this.prevStep.bind(this));
      this.nextBtn.addEventListener('click', this.nextStep.bind(this));

      // Keyboard support
      document.addEventListener('keydown', (e) => {
        if (!this.modal.classList.contains('open')) return;
        if (e.key === 'Escape') this.closeModal();
        if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') {
          e.preventDefault();
          this.nextStep();
        }
      });

      // Resize handler
      window.addEventListener('resize', () => {
        this.isMobile = window.innerWidth <= 768;
      });

      // Setup form inputs
      this.setupFormInputs();

      // Load saved data
      this.loadFromLocalStorage();

      // Show initial step
      this.showStep(1, false);
    },

    setupFormInputs: function() {
      // Text inputs
      const inputs = this.modal.querySelectorAll('input, textarea, select');
      inputs.forEach(input => {
        const field = input.dataset.field;
        if (!field) return;

        // Set initial value
        if (input.type === 'checkbox') {
          input.checked = this.formData.marketingChallenges.includes(input.value);
        } else {
          input.value = this.formData[field] || '';
        }

        // Listen for changes
        input.addEventListener('input', () => {
          if (input.type === 'checkbox') {
            const challenges = this.formData.marketingChallenges;
            if (input.checked) {
              if (!challenges.includes(input.value)) {
                challenges.push(input.value);
              }
            } else {
              const idx = challenges.indexOf(input.value);
              if (idx > -1) challenges.splice(idx, 1);
            }
          } else {
            this.formData[field] = input.value;
          }
          this.saveToLocalStorage();
          this.clearError(input);

          // URL validation visual feedback
          if (field === 'website') {
            this.validateUrlVisual(input);
          }
        });

        input.addEventListener('change', () => {
          if (input.tagName === 'SELECT') {
            this.formData[field] = input.value;
            this.saveToLocalStorage();
            this.clearError(input);
          }
        });
      });

      // Button groups (marketingSpend)
      this.setupButtonGroups();

      // Tier buttons
      this.setupTierButtons();
    },

    validateUrlVisual: function(input) {
      const wrapper = input.closest('.quiz-url-input');
      if (!wrapper) return;

      const value = input.value.trim();
      wrapper.classList.remove('valid', 'invalid');

      if (!value) return;

      // Auto-prepend https if missing
      let url = value;
      if (!/^https?:\/\//i.test(url)) {
        url = 'https://' + url;
      }

      try {
        new URL(url);
        wrapper.classList.add('valid');
      } catch (e) {
        wrapper.classList.add('invalid');
      }
    },

    setupButtonGroups: function() {
      const buttonGroups = this.modal.querySelectorAll('.quiz-button-group');
      buttonGroups.forEach(group => {
        const field = group.dataset.field;
        if (!field) return;

        const buttons = group.querySelectorAll('.quiz-option-btn');

        // Set initial selection
        if (this.formData[field]) {
          buttons.forEach(btn => {
            if (btn.dataset.value === this.formData[field]) {
              btn.classList.add('selected');
            }
          });
        }

        // Click handlers
        buttons.forEach(btn => {
          btn.addEventListener('click', () => {
            // Remove selected from all
            buttons.forEach(b => b.classList.remove('selected'));
            // Add selected to clicked
            btn.classList.add('selected');
            // Update form data
            this.formData[field] = btn.dataset.value;
            this.saveToLocalStorage();
            this.clearError(group);
          });
        });
      });
    },

    setupTierButtons: function() {
      const tierButtons = this.modal.querySelector('.quiz-tier-buttons');
      if (!tierButtons) return;

      const buttons = tierButtons.querySelectorAll('.quiz-tier-btn');

      // Set initial selection
      if (this.formData.tier) {
        buttons.forEach(btn => {
          if (btn.dataset.value === this.formData.tier) {
            btn.classList.add('selected');
          }
        });
      }

      // Click handlers
      buttons.forEach(btn => {
        btn.addEventListener('click', () => {
          // Remove selected from all
          buttons.forEach(b => b.classList.remove('selected'));
          // Add selected to clicked
          btn.classList.add('selected');
          // Update form data
          this.formData.tier = btn.dataset.value;
          this.saveToLocalStorage();
          this.clearError(tierButtons);
        });
      });
    },

    setupTierSelector: function() {
      const tierSelector = this.modal.querySelector('.quiz-tier-selector');
      if (!tierSelector) return;

      const selected = tierSelector.querySelector('.quiz-tier-selected');
      const dropdown = tierSelector.querySelector('.quiz-tier-dropdown');
      const options = tierSelector.querySelectorAll('.quiz-tier-option');

      selected.addEventListener('click', () => {
        tierSelector.classList.toggle('open');
      });

      options.forEach(option => {
        option.addEventListener('click', () => {
          const value = option.dataset.value;
          this.formData.tier = value;
          this.saveToLocalStorage();

          // Update display
          const label = option.querySelector('.quiz-tier-label').textContent;
          const range = option.querySelector('.quiz-tier-range').textContent;
          selected.querySelector('.quiz-tier-label').textContent = label;
          selected.querySelector('.quiz-tier-range').textContent = range;
          selected.classList.add('has-value');

          // Update icon
          const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
          const iconSrc = option.querySelector('img').src;
          selected.querySelector('img').src = iconSrc;

          tierSelector.classList.remove('open');
          this.clearError(tierSelector);
        });
      });

      // Close on click outside
      document.addEventListener('click', (e) => {
        if (!tierSelector.contains(e.target)) {
          tierSelector.classList.remove('open');
        }
      });
    },

    openModal: function() {
      this.modal.classList.add('open');
      this.modal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';

      // Reset to step 1 if starting fresh
      if (!this.hasPartialData()) {
        this.currentStep = 1;
        this.showStep(1, false);
      }

      // Focus first input
      setTimeout(() => {
        const firstInput = this.steps[this.currentStep - 1].querySelector('input, textarea, select');
        if (firstInput) firstInput.focus();
      }, 100);

      // Track event
      if (typeof trackEvent === 'function') {
        trackEvent('quiz_opened');
      }
    },

    closeModal: function() {
      this.modal.classList.remove('open');
      this.modal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    },

    hasPartialData: function() {
      return this.formData.firstName || this.formData.email;
    },

    showStep: function(step, animate) {
      if (animate === undefined) animate = true;

      // Update progress indicator
      const progress = Math.round((step / this.totalSteps) * 100);
      if (this.progressStepEl) this.progressStepEl.textContent = step;
      if (this.progressPercentEl) this.progressPercentEl.textContent = progress;

      // Update progress segments
      if (this.progressSegments) {
        this.progressSegments.forEach((segment, idx) => {
          segment.classList.toggle('active', idx < step);
        });
      }

      // Hide all steps, show current
      this.steps.forEach((el, idx) => {
        if (idx + 1 === step) {
          el.classList.add('active');
          if (animate) {
            el.classList.add('animating');
            el.classList.add(this.direction === 'forward' ? 'slide-in' : 'slide-in-reverse');
            setTimeout(() => {
              el.classList.remove('animating', 'slide-in', 'slide-in-reverse');
            }, 400);
          }
        } else {
          if (el.classList.contains('active') && animate) {
            el.classList.add('animating');
            el.classList.add(this.direction === 'forward' ? 'slide-out' : 'slide-out-reverse');
            setTimeout(() => {
              el.classList.remove('active', 'animating', 'slide-out', 'slide-out-reverse');
            }, 400);
          } else {
            el.classList.remove('active');
          }
        }
      });

      // Update back button visibility
      this.backBtn.style.visibility = step === 1 ? 'hidden' : 'visible';

      // Update next button text
      this.nextBtn.textContent = step === this.totalSteps ? 'Submit' : 'Next';

      // Track step view
      if (typeof trackEvent === 'function') {
        trackEvent('quiz_step_' + step);
      }
    },

    nextStep: function() {
      if (this.isAnimating) return;

      // Validate current step
      if (!this.validateStep(this.currentStep)) {
        return;
      }

      if (this.currentStep === this.totalSteps) {
        // Submit form
        this.submitForm();
        return;
      }

      this.isAnimating = true;
      this.direction = 'forward';
      this.currentStep++;
      this.showStep(this.currentStep, true);

      setTimeout(() => {
        this.isAnimating = false;
        // Focus first input
        const firstInput = this.steps[this.currentStep - 1].querySelector('input, textarea, select');
        if (firstInput) firstInput.focus();
      }, 400);
    },

    prevStep: function() {
      if (this.isAnimating || this.currentStep === 1) return;

      this.isAnimating = true;
      this.direction = 'backward';
      this.currentStep--;
      this.showStep(this.currentStep, true);

      setTimeout(() => {
        this.isAnimating = false;
      }, 400);
    },

    validateStep: function(step) {
      let isValid = true;
      const stepEl = this.steps[step - 1];

      switch (step) {
        case 1: // Name
          const firstName = stepEl.querySelector('[data-field="firstName"]');
          const lastName = stepEl.querySelector('[data-field="lastName"]');
          if (!this.formData.firstName || this.formData.firstName.length < 2) {
            this.showError(firstName, 'First name must be at least 2 characters');
            isValid = false;
          }
          if (!this.formData.lastName || this.formData.lastName.length < 2) {
            this.showError(lastName, 'Last name must be at least 2 characters');
            isValid = false;
          }
          break;

        case 2: // Practice Description
          const practice = stepEl.querySelector('[data-field="practiceDescription"]');
          if (!this.formData.practiceDescription || this.formData.practiceDescription.length < 10) {
            this.showError(practice, 'Please provide more detail (at least 10 characters)');
            isValid = false;
          }
          break;

        case 3: // Website (optional)
          const website = stepEl.querySelector('[data-field="website"]');
          if (this.formData.website) {
            // Auto-prepend https if missing
            if (!/^https?:\/\//i.test(this.formData.website)) {
              this.formData.website = 'https://' + this.formData.website;
              website.value = this.formData.website;
            }
            // Validate URL format
            try {
              new URL(this.formData.website);
            } catch (e) {
              this.showError(website, 'Please enter a valid URL');
              isValid = false;
            }
          }
          break;

        case 4: // Marketing Goals
          const goals = stepEl.querySelector('[data-field="currentSituation"]');
          if (!this.formData.currentSituation || this.formData.currentSituation.length < 10) {
            this.showError(goals, 'Please provide more detail (at least 10 characters)');
            isValid = false;
          }
          break;

        case 5: // Marketing Spend
          const spendGroup = stepEl.querySelector('.quiz-button-group');
          if (!this.formData.marketingSpend) {
            this.showError(spendGroup, 'Please select an option');
            isValid = false;
          }
          break;

        case 6: // Marketing Challenges
          const challengeContainer = stepEl.querySelector('.quiz-checkbox-group');
          if (this.formData.marketingChallenges.length === 0) {
            this.showError(challengeContainer, 'Please select at least one challenge');
            isValid = false;
          }
          break;

        case 7: // Tier Selection
          const tierButtons = stepEl.querySelector('.quiz-tier-buttons');
          if (!this.formData.tier) {
            this.showError(tierButtons, 'Please select a tier');
            isValid = false;
          }
          break;

        case 8: // Phone
          const phone = stepEl.querySelector('[data-field="phoneNumber"]');
          const phoneDigits = this.formData.phoneNumber.replace(/\D/g, '');
          if (!phoneDigits || phoneDigits.length < 10) {
            this.showError(phone, 'Please enter a valid phone number (at least 10 digits)');
            isValid = false;
          }
          break;

        case 9: // Email
          const email = stepEl.querySelector('[data-field="email"]');
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!this.formData.email || !emailRegex.test(this.formData.email)) {
            this.showError(email, 'Please enter a valid email address');
            isValid = false;
          }
          break;
      }

      return isValid;
    },

    showError: function(element, message) {
      if (!element) return;
      element.classList.add('error');

      // Find or create error message
      let errorEl = element.parentElement.querySelector('.quiz-error');
      if (!errorEl) {
        errorEl = document.createElement('span');
        errorEl.className = 'quiz-error';
        element.parentElement.appendChild(errorEl);
      }
      errorEl.textContent = message;

      // Shake animation
      element.classList.add('shake');
      setTimeout(() => element.classList.remove('shake'), 500);
    },

    clearError: function(element) {
      if (!element) return;
      element.classList.remove('error');
      const errorEl = element.parentElement.querySelector('.quiz-error');
      if (errorEl) errorEl.textContent = '';
    },

    saveToLocalStorage: function() {
      try {
        localStorage.setItem('quizFormData', JSON.stringify(this.formData));
      } catch (e) {
        console.warn('Could not save to localStorage:', e);
      }
    },

    loadFromLocalStorage: function() {
      try {
        const saved = localStorage.getItem('quizFormData');
        if (saved) {
          const data = JSON.parse(saved);
          Object.assign(this.formData, data);

          // Update form inputs
          const inputs = this.modal.querySelectorAll('input, textarea, select');
          inputs.forEach(input => {
            const field = input.dataset.field;
            if (!field) return;
            if (input.type === 'checkbox') {
              input.checked = this.formData.marketingChallenges.includes(input.value);
            } else if (this.formData[field]) {
              input.value = this.formData[field];
            }
          });

          // Update button group selections (marketingSpend)
          const buttonGroups = this.modal.querySelectorAll('.quiz-button-group');
          buttonGroups.forEach(group => {
            const field = group.dataset.field;
            if (field && this.formData[field]) {
              const buttons = group.querySelectorAll('.quiz-option-btn');
              buttons.forEach(btn => {
                btn.classList.toggle('selected', btn.dataset.value === this.formData[field]);
              });
            }
          });

          // Update tier button selection
          if (this.formData.tier) {
            const tierButtons = this.modal.querySelector('.quiz-tier-buttons');
            if (tierButtons) {
              const buttons = tierButtons.querySelectorAll('.quiz-tier-btn');
              buttons.forEach(btn => {
                btn.classList.toggle('selected', btn.dataset.value === this.formData.tier);
              });
            }
          }

          // Update URL validation visual
          const websiteInput = this.modal.querySelector('[data-field="website"]');
          if (websiteInput && this.formData.website) {
            this.validateUrlVisual(websiteInput);
          }
        }
      } catch (e) {
        console.warn('Could not load from localStorage:', e);
      }
    },

    submitForm: async function() {
      // Show loading state
      this.nextBtn.disabled = true;
      this.nextBtn.textContent = 'Submitting...';

      try {
        // Build submission data
        const submitData = {
          type: 'quiz',
          firstName: this.formData.firstName,
          lastName: this.formData.lastName,
          email: this.formData.email,
          countryCode: this.formData.countryCode,
          phoneNumber: this.formData.phoneNumber,
          practiceDescription: this.formData.practiceDescription,
          website: this.formData.website,
          currentSituation: this.formData.currentSituation,
          marketingSpend: this.formData.marketingSpend,
          marketingChallenges: this.formData.marketingChallenges,
          tier: this.formData.tier
        };

        // POST to lead API
        const response = await fetch('/api/lead', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(submitData)
        });

        if (!response.ok) {
          throw new Error('Failed to submit form');
        }

        const result = await response.json();

        // Store contact ID
        if (result.ghlContactId) {
          localStorage.setItem('ghlContactId', result.ghlContactId);
        }

        // Post to ROAM
        await this.postToRoam(submitData);

        // Track completion
        if (typeof trackEvent === 'function') {
          trackEvent('quiz_completed', submitData);
        }

        // Clear form data
        localStorage.removeItem('quizFormData');

        const routing = getRoutingForTier(this.formData.tier);
        sessionStorage.setItem('routing_segment', routing.segment);
        sessionStorage.setItem('routing_segment_label', routing.segmentLabel);
        sessionStorage.setItem('routing_revenue_range', routing.revenueRange);
        sessionStorage.setItem('routing_tier', routing.tier);
        sessionStorage.setItem('routing_calendar_owner', routing.calendarOwner);
        sessionStorage.setItem('routing_calendar_number', String(routing.calendarNumber));

        // Store quiz answers for Cal.com metadata passthrough
        sessionStorage.setItem('lead_name', this.formData.firstName + ' ' + this.formData.lastName);
        sessionStorage.setItem('lead_email', this.formData.email);
        sessionStorage.setItem('lead_phone', this.formData.countryCode + this.formData.phoneNumber);
        sessionStorage.setItem('quiz_practice_description', this.formData.practiceDescription || '');
        sessionStorage.setItem('quiz_website', this.formData.website || '');
        sessionStorage.setItem('quiz_goals', this.formData.currentSituation || '');
        sessionStorage.setItem('quiz_budget', spendLabels[this.formData.marketingSpend] || this.formData.marketingSpend || '');
        sessionStorage.setItem('quiz_challenges', this.formData.marketingChallenges
          .map(function(c) { return challengeLabels[c] || c; })
          .join(', ')
        );

        const calendarUrl = new URL('/calendar.html', window.location.origin);
        calendarUrl.searchParams.set('segment', routing.segment);
        calendarUrl.searchParams.set('tier', routing.tier);
        calendarUrl.searchParams.set('calendar', String(routing.calendarNumber));
        calendarUrl.searchParams.set('owner', routing.calendarOwner);

        // Redirect to calendar
        window.location.href = calendarUrl.pathname + calendarUrl.search;

      } catch (error) {
        console.error('Form submission error:', error);
        this.nextBtn.disabled = false;
        this.nextBtn.textContent = 'Submit';

        // Show error message
        alert('There was an error submitting your application. Please try again.');
      }
    },

    postToRoam: async function(data) {
      const challengesList = data.marketingChallenges
        .map(c => challengeLabels[c] || c)
        .join('\n- ');

      const message = `New Olympus Demo Application

Name: ${data.firstName} ${data.lastName}
Email: ${data.email}
Phone: ${data.countryCode} ${data.phoneNumber}
Practice: ${data.practiceDescription}
Website: ${data.website || 'Not provided'}
Goals: ${data.currentSituation}
Monthly Marketing Spend: ${spendLabels[data.marketingSpend] || data.marketingSpend}
Challenges:
- ${challengesList}
Tier Interest: ${tierLabels[data.tier] || data.tier}

Status: Application submitted - Ready for demo booking`;

      try {
        await fetch('/api/notify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message })
        });
      } catch (e) {
        console.warn('Could not post to ROAM:', e);
      }
    }
  };

  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => quiz.init());
  } else {
    quiz.init();
  }

  // Expose openModal globally
  window.openQuizModal = function() {
    quiz.openModal();
  };

})();
