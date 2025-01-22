/**
 * globals.js
 * ----------------------------------
 * Site-wide features & placeholders for possible compilation steps.
 */


/////////////////////////////
// 1) Linkify Text  //
/////////////////////////////
/**
 * linkifyText & auto-linkify
 * -------------------------
 * These functions provide automatic link generation from text.
 * 
 * Usage:
 * 1. Add the 'auto-linkify' class to any element containing text you want to process:
 *    <div class="auto-linkify">
 *      Link: https://example.com Label: My Example Site
 *    </div>
 * 
 * 2. The text should follow this format:
 *    "Link: URL Label: Link Text"
 *    - If Label is omitted, the URL will be used as the link text
 *    - Example: "Link: https://github.com Label: View on GitHub"
 *    - Example: "Link: https://github.com" (URL will be the link text)
 * 
 * 3. The result will be an anchor tag:
 *    <a href="URL" target="_blank" rel="noopener noreferrer">Link Text</a>
 * 
 * Note: initAutoLinkify() is called automatically on DOMContentLoaded,
 * so you don't need to call it manually unless you're adding content dynamically.
 */
export function linkifyText(text) {
  // Capture groups:
  // 1) The portion after "Link:" up to "Label:" or end-of-string
  // 2) The portion after "Label:" if present
  // This regex is flexible if there's spacing changes.
  const linkRegex = /Link:\s*(\S+)(?:\s+Label:\s*(.+))?/gi;

  return text.replace(linkRegex, (match, url, label) => {
    // If no label is provided, use the URL itself as the link text
    const displayText = label || url;
    // You could further sanitize or validate URL if needed
    return `<a href="${url}" target="_blank" rel="noopener noreferrer">${displayText}</a>`;
  });
}

/**
 * Automatically linkify elements with the 'auto-linkify' class
 */
export function initAutoLinkify() {
  const elements = document.querySelectorAll('.auto-linkify');
  elements.forEach(element => {
    element.innerHTML = linkifyText(element.innerHTML);
  });
}

//////////////////////
// 2) SMOOTH SCROLL //
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
// 3) LAZY-LOADING IMG //
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
// 4) CONTACT FORM    //
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
// 5) DIALOG BOX //
////////////////////////////////////
/**
 * Safely decode Base64, returning the original string if decoding fails.
 */
function decodeBase64(str) {
  try {
    return atob(str);
  } catch (e) {
    console.error('Failed to decode base64:', e);
    return str; // Fallback to returning the raw string
  }
}

/**
 * createDialog
 * -----------
 * Dynamically creates and shows a Mac OS-style dialog box with an overlay.
 *
 * Features:
 *  - Overlay reuse (only one <div id="overlay"> at a time)
 *  - ESC, overlay-click, and close button to dismiss
 *  - Selective Base64 decoding for protected content
 *  - Focus trapping
 *  - Cleanup on close (removes body class, the dialog, and the overlay if no more dialogs)
 *
 * Usage:
 *
 *   // Basic error dialog
 *   createDialog({
 *     title: 'Preview Error',
 *     content: 'This project preview is not available yet.',
 *     onClose: () => { console.log('Dialog closed'); }
 *   });
 *
 *   // Dialog with partial encrypted content
 *   createDialog({
 *     title: 'Contact Info',
 *     content: `
 *       <p>You can reach me via:</p>
 *       <p class="protected-content">aW8ucGF1bEBrYXRvLmN4</p>
 *     `,
 *     isEncoded: true,
 *     onClose: () => { console.log('Dialog closed'); }
 *   });
 *
 *   // Default error dialog
 *   showError(); // displays "Error" with "Oops! Something went wrong"
 */
export function createDialog({
  title = 'Error',
  content = 'Oops! Something went wrong.',
  isEncoded = false,
  onClose = null
} = {}) {
  // 1) Create temporary div to parse content
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = content;
  
  // 2) Find and decode any protected content
  if (isEncoded) {
    tempDiv.querySelectorAll('.protected-content').forEach(el => {
      el.textContent = decodeBase64(el.textContent.trim());
    });
  }
  
  const finalContent = tempDiv.innerHTML;

  // 3) Create the dialog
  const dialog = document.createElement('div');
  dialog.classList.add('mac-dialog');

  // Title bar
  const titleBar = document.createElement('div');
  titleBar.classList.add('window-title-bar');

  // Window controls (close button)
  const windowControls = document.createElement('div');
  windowControls.classList.add('window-controls');

  const closeButton = document.createElement('div');
  closeButton.classList.add('window-button', 'close-button');
  windowControls.appendChild(closeButton);

  const windowTitle = document.createElement('div');
  windowTitle.classList.add('window-title');
  windowTitle.textContent = title;

  titleBar.appendChild(windowControls);
  titleBar.appendChild(windowTitle);

  // Content area
  const contentDiv = document.createElement('div');
  contentDiv.classList.add('content');
  contentDiv.innerHTML = finalContent;

  dialog.appendChild(titleBar);
  dialog.appendChild(contentDiv);

  // 4) Re-use or create an overlay
  let overlay = document.getElementById('overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'overlay';
    overlay.style.position = 'fixed';
    overlay.style.top = 0;
    overlay.style.left = 0;
    overlay.style.width = '100vw';
    overlay.style.height = '100vh';
    overlay.style.background = 'rgba(0, 0, 0, 0.5)';
    overlay.style.zIndex = '1999';
    overlay.style.opacity = '0';
    overlay.style.visibility = 'hidden';
    overlay.style.transition = 'opacity 0.2s ease';
    document.body.appendChild(overlay);
  }

  // 5) Insert dialog & show it
  document.body.appendChild(dialog);
  document.body.classList.add('dialog-open');

  requestAnimationFrame(() => {
    dialog.classList.add('active');
    dialog.style.zIndex = '2000';
    dialog.style.opacity = '1';
    dialog.style.visibility = 'visible';
    overlay.style.opacity = '1';
    overlay.style.visibility = 'visible';
    // For accessibility/focus
    closeButton.focus();
  });

  /**
   * closeDialog
   * Removes dialog from DOM, hides overlay (if no more dialogs), calls onClose.
   */
  function closeDialog() {
    dialog.classList.remove('active');
    dialog.style.opacity = '0';
    dialog.style.visibility = 'hidden';
    overlay.style.opacity = '0';
    overlay.style.visibility = 'hidden';
    document.body.classList.remove('dialog-open');

    // Remove global ESC listener
    document.removeEventListener('keydown', handleGlobalEsc);

    // Remove after CSS transition
    setTimeout(() => {
      if (dialog.parentNode) {
        dialog.parentNode.removeChild(dialog);
      }
      // If no more active dialogs exist, remove overlay
      if (!document.querySelector('.mac-dialog.active')) {
        if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
      }
      if (typeof onClose === 'function') {
        onClose();
      }
    }, 300);
  }

  // Close button => close
  closeButton.addEventListener('click', closeDialog);

  // Overlay click => close
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      closeDialog();
    }
  });

  // Focus trap for TAB
  dialog.addEventListener('keydown', (e) => {
    if (e.key !== 'Tab') return;
    const focusable = dialog.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (!focusable.length) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    // SHIFT+TAB from first => jump to last
    if (e.shiftKey && document.activeElement === first) {
      last.focus();
      e.preventDefault();
    }
    // TAB from last => jump to first
    else if (!e.shiftKey && document.activeElement === last) {
      first.focus();
      e.preventDefault();
    }
  });

  // Global ESC listener => close
  function handleGlobalEsc(e) {
    if (e.key === 'Escape') {
      closeDialog();
    }
  }
  document.addEventListener('keydown', handleGlobalEsc);

  // Return the dialog element for optional external manipulation
  return dialog;
}

/**
 * showError
 * Shows an error dialog with default text (or you can pass custom text).
 */
export function showError() {
  return createDialog(); // Uses default title/content from createDialog’s defaults
}
  
//////////////////////////
// 6) VISITOR COUNTER   //
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
// 7) TYPEWRITER EFFECT  //
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
// 8) INIT CONSTRUCTION PAGE //
//////////////////////////////
  export function initConstructionPage() {
    const dateElement = document.querySelector('.construction-date .typewriter');
    if (dateElement) {
      typewriterEffect(dateElement);
    }
  }
  
/////////////////////////////
// 9) MAIN INIT SEQUENCE  //
/////////////////////////////
/**
 * For pages that want to load everything on DOMContentLoaded,
 * you can optionally import your other modules here,
 * or do partial imports depending on the page.
 */

// (Example) If you want to run specific logic automatically:
document.addEventListener('DOMContentLoaded', () => {
  // Initialize auto-linkify functionality
  initAutoLinkify();
  
  // Placeholder: you might do stuff here
  // e.g., updateVisitorCounter();
  // or call a page-specific script
});
  