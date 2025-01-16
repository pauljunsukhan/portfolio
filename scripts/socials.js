/**
 * socials.js
 * ----------------------------------
 * Reusable code to load & render social link data.
 * Allows for a default or a page-specific config.
 */

import { showDialog, hideDialog } from './global.js';

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
      
      // Skip if missing required properties
      if (!social.icon || !social.label) {
        console.warn(`Skipping social ${key}: missing required properties`);
        continue;
      }

      const isLink = social.type === 'link' && social.url;
      const element = document.createElement(isLink ? 'a' : 'button');
      element.className = `social-link social-${key}`;
      element.setAttribute('role', 'listitem');
      element.setAttribute('aria-label', social.label);

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
        
        dialog.innerHTML = `
          <div class="window-title-bar">
            <div class="window-controls">
              <div class="window-button close-button" aria-label="Close dialog"></div>
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

        // Show/hide dialog
        element.addEventListener('click', (e) => {
          e.preventDefault();
          showDialog(dialog);
        });
        
        dialog.querySelector('.close-button').addEventListener('click', () => {
          hideDialog(dialog);
        });
      }
    } catch (error) {
      console.error(`Error creating social link for ${key}:`, error);
    }
  }

  // Clicking overlay closes any open dialogs
  const overlay = document.querySelector('.overlay');
  if (overlay) {
    overlay.addEventListener('click', () => {
      document.querySelectorAll('.mac-dialog.active').forEach(dialog => {
        hideDialog(dialog);
      });
    });
  }

  // ESC key closes dialogs
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.mac-dialog.active').forEach(dialog => {
        hideDialog(dialog);
      });
    }
  });
}
