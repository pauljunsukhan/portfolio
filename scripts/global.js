/**
 * global.js
 * ----------------------------------
 * Site-wide features & placeholders for possible compilation steps.
 */

//////////////////////
// 1) SMOOTH SCROLL //
//////////////////////
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
  
  /////////////////////////
  // 2) LAZY-LOADING IMG //
  /////////////////////////
  document.addEventListener('DOMContentLoaded', () => {
    const lazyImages = document.querySelectorAll('img[data-src]');
  
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src;
          img.removeAttribute('data-src');
          imageObserver.unobserve(img);
        }
      });
    });
  
    lazyImages.forEach(img => imageObserver.observe(img));
  });
  
  ////////////////////////
  // 3) CONTACT FORM    //
  ////////////////////////
  const contactForm = document.querySelector('.contact-form form');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      console.log('Form submitted (placeholder)');
      // Potentially AJAX or fetch call here
    });
  }
  
  ////////////////////////////////////
  // 4) OVERLAY & ERROR DIALOG INIT //
  ////////////////////////////////////
  const overlay = document.createElement('div');
  overlay.className = 'overlay';
  document.body.appendChild(overlay);
  
  const errorDialog = document.createElement('div');
  errorDialog.className = 'error-dialog';
  errorDialog.innerHTML = `
    <div class="window-title-bar">
      <div class="window-controls">
        <div class="window-button"></div>
      </div>
      <div class="window-title">Error</div>
    </div>
    <div class="content">
        <p>Oops! Something went wrong.</p>
    </div>
  `;
  document.body.appendChild(errorDialog);
  
  /**
   * Open a dialog
   * @param {HTMLElement} dialog 
   */
  export function showDialog(dialog) {
    dialog.classList.add('active');
    overlay.classList.add('active');
  }
  
  /**
   * Close a dialog
   * @param {HTMLElement} dialog 
   */
  export function hideDialog(dialog) {
    dialog.classList.remove('active');
    overlay.classList.remove('active');
  }
  
  /**
   * Show the default error dialog
   */
  export function showError() {
    errorDialog.classList.add('active');
    overlay.classList.add('active');
  }
  
  /**
   * Hide the default error dialog
   */
  export function hideError() {
    errorDialog.classList.remove('active');
    overlay.classList.remove('active');
  }
  
  //////////////////////////
  // 5) VISITOR COUNTER   //
  //////////////////////////
  export function updateVisitorCounter() {
    try {
      const badge = document.getElementById('visitor-badge');
      const digits = document.querySelectorAll('.counter-digit');
      if (!badge || !digits.length) {
        throw new Error('Visitor counter elements not found');
      }
  
      function updateDisplay() {
        try {
          console.log('Attempting to update visitor count...');
          badge.crossOrigin = 'anonymous';
  
          // Hard-coded example
          const defaultCount = '001998';
          const paddedCount = defaultCount.padStart(6, '0');
          digits.forEach((digit, idx) => {
            digit.textContent = paddedCount[idx] || '0';
          });
  
          badge.onerror = () => {
            console.log('Badge load failed, using default count');
          };
          badge.onload = () => {
            console.log('Badge loaded successfully');
          };
        } catch (err) {
          console.error('Error in updateDisplay:', err);
        }
      }
  
      console.log('Initializing visitor counter...');
      updateDisplay();
      // Update every 5 minutes
      setInterval(updateDisplay, 300000);
  
    } catch (error) {
      console.error('Visitor counter error:', error);
    }
  }
  
  ///////////////////////////
  // 6) TYPEWRITER EFFECT  //
  ///////////////////////////
  export function typewriterEffect(element) {
    const text = element.textContent;
    element.textContent = '';
    let i = 0;
    function type() {
      if (i < text.length) {
        element.textContent += text.charAt(i);
        i++;
        setTimeout(type, 100);
      }
    }
    type();
  }
  
  //////////////////////////////
  // 7) INIT CONSTRUCTION PAGE //
  //////////////////////////////
  export function initConstructionPage() {
    const dateElement = document.querySelector('.construction-date .typewriter');
    if (dateElement) {
      typewriterEffect(dateElement);
    }
  }
  
  /////////////////////////////
  // 8) MAIN INIT SEQUENCE  //
  /////////////////////////////
  /**
   * For pages that want to load everything on DOMContentLoaded,
   * you can optionally import your other modules here,
   * or do partial imports depending on the page.
   */
  
  // (Example) If you want to run specific logic automatically:
  document.addEventListener('DOMContentLoaded', () => {
    // Placeholder: you might do stuff here
    // e.g., updateVisitorCounter();
    // or call a page-specific script
  });
  