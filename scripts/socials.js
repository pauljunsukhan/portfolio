/**
 * socials.js
 * ----------------------------------
 * Reusable code to load & render social link data.
 * Allows for a default or a page-specific config.
 */

import { showDialog, hideDialog } from './global.js';

// Global event handlers for dialog interactions
document.addEventListener('click', (e) => {
  // Handle dialog close button clicks
  if (e.target.closest('.close-button')) {
    const dialog = e.target.closest('.mac-dialog');
    if (dialog) hideDialog(dialog);
    return;
  }

  // Handle clicks outside active dialogs
  const activeDialogs = document.querySelectorAll('.mac-dialog.active');
  activeDialogs.forEach(dialog => {
    if (!dialog.contains(e.target) && !e.target.closest('.social-link')) {
      hideDialog(dialog);
    }
  });
});

// Global keyboard event handling
document.addEventListener('keydown', (e) => {
  const activeDialogs = document.querySelectorAll('.mac-dialog.active');
  if (!activeDialogs.length) return;

  switch (e.key) {
    case 'Escape':
      activeDialogs.forEach(hideDialog);
      break;
    case 'Tab':
      // If there's an active dialog, trap focus within it
      const dialog = activeDialogs[0];
      const focusableElements = dialog.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusableElements.length) {
        const first = focusableElements[0];
        const last = focusableElements[focusableElements.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          last.focus();
          e.preventDefault();
        } else if (!e.shiftKey && document.activeElement === last) {
          first.focus();
          e.preventDefault();
        }
      }
      break;
  }
});

function decodeBase64(str) {
  try {
    return atob(str);
  } catch (e) {
    console.error('Failed to decode base64:', e);
    return str;
  }
}

/**
 * Attempt to load social config
 *  - If pageSpecificConfig is given, try that first
 *  - else use ./config/socials.json
 */
async function loadSocialConfig(pageSpecificConfig) {
  const configUrl = pageSpecificConfig || './config/socials.json';
  try {
    console.log(`Loading social config from: ${configUrl}`);
    const response = await fetch(configUrl);
    if (!response.ok) {
      throw new Error(`Failed to load social config: ${response.status}`);
    }
    const data = await response.json();
    console.log('Social config loaded successfully:', data);
    return data;
  } catch (error) {
    console.error('Error loading social config:', error);
    return null;
  }
}

/**
 * Generate social links within a container that has a `.social-grid[role="list"]`
 * Optionally pass a custom config path
 */
export async function generateSocialLinks(pageSpecificConfig) {
  // Clean up any existing dialogs first
  document.querySelectorAll('.mac-dialog').forEach(dialog => dialog.remove());

  const config = await loadSocialConfig(pageSpecificConfig);
  if (!config) {
    console.error('No social config loaded');
    return;
  }

  const socialGrid = document.querySelector('.social-grid[role="list"]');
  if (!socialGrid) {
    console.error('No social-grid found on this page. Skipping socials.');
    return;
  }

  console.log('Clearing social grid');
  socialGrid.innerHTML = '';

  // Create social links
  for (const [key, social] of Object.entries(config)) {
    try {
      console.log(`Creating social link for ${key}:`, social);
      
      // Validate required properties
      if (!social.icon || !social.label || !social.type) {
        console.warn(`Skipping social ${key}: missing required properties`);
        continue;
      }

      const isLink = social.type === 'link';
      if (isLink && !social.url) {
        console.warn(`Skipping social ${key}: missing URL for link type`);
        continue;
      }

      const element = document.createElement(isLink ? 'a' : 'button');
      element.className = `social-link social-${key}`;
      element.setAttribute('role', 'listitem');
      element.setAttribute('aria-label', social.label);
      element.setAttribute('aria-haspopup', social.type === 'dialog' ? 'dialog' : 'false');

      if (isLink) {
        element.href = social.url;
        element.target = '_blank';
        element.rel = 'noopener noreferrer';
      }

      element.innerHTML = `
        <span class="social-icon" aria-hidden="true">${social.icon}</span>
        <span class="social-label">${social.label}</span>
      `;

      socialGrid.appendChild(element);

      // If it's a dialog type, build the dialog
      if (social.type === 'dialog') {
        const dialog = document.createElement('div');
        dialog.className = 'mac-dialog';
        dialog.setAttribute('role', 'dialog');
        dialog.setAttribute('aria-label', `${social.label} Information`);
        dialog.setAttribute('aria-modal', 'true');
        
        dialog.innerHTML = `
          <div class="window-title-bar">
            <div class="window-controls">
              <button class="window-button close-button" aria-label="Close dialog"></button>
            </div>
            <div class="window-title">${social.label}</div>
          </div>
          <div class="content">
            ${social.dialogContent ? `<p>${social.dialogContent}</p>` : ''}
            <p class="protected-content">
              ${social.encrypt ? decodeBase64(social.value) : social.value}
            </p>
          </div>
        `;
        
        document.body.appendChild(dialog);

        // Show dialog on click
        element.addEventListener('click', (e) => {
          e.preventDefault();
          showDialog(dialog);
          // Focus the close button when dialog opens
          const closeButton = dialog.querySelector('.close-button');
          if (closeButton) closeButton.focus();
        });
      }
    } catch (error) {
      console.error(`Error creating social link for ${key}:`, error);
    }
  }
}
