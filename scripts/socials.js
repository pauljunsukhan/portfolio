/**
 * socials.js
 * ----------------------------------
 * Reusable code to load & render social link data.
 * Allows for a default or a page-specific config.
 */

import { createDialog } from './globals.js';

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

      // If it's a dialog type, set up click handler to show dialog
      if (social.type === 'dialog') {
        element.addEventListener('click', (e) => {
          e.preventDefault();
          
          // Build dialog content
          let content = '';
          if (social.dialogContent) {
            content += `<p>${social.dialogContent}</p>`;
          }
          content += `<p class="protected-content">${social.value}</p>`;

          createDialog({
            title: social.label,
            content: content,
            isEncoded: Boolean(social.encrypt),
            onClose: () => {
              console.log(`${key} dialog closed`);
            }
          });
        });
      }
    } catch (error) {
      console.error(`Error creating social link for ${key}:`, error);
    }
  }
}
