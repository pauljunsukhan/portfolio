/**
 * desktop.js
 * ----------------------------------
 * Handles the desktop icons configuration and rendering.
 * Similar to socials.js, allows for page-specific or default config.
 */

async function loadDesktopConfig(pageSpecificConfig) {
    // If a specific config path is provided, try that first
    if (pageSpecificConfig) {
        try {
            const response = await fetch(pageSpecificConfig, { cache: 'no-store' });
            if (response.ok) {
                const data = await response.json();
                console.log('Specific desktop config loaded successfully');
                return data;
            }
        } catch (error) {
            // Silently continue to next option
        }
    }

    // Try to load from current directory
    try {
        const response = await fetch('./desktop.json', { cache: 'no-store' });
        if (response.ok) {
            const data = await response.json();
            console.log('Local desktop config loaded successfully');
            return data;
        }
    } catch (error) {
        // Silently continue to default config
    }

    // Fall back to default config
    try {
        console.log('Loading default desktop config from: ./config/desktop.json');
        const response = await fetch('./config/desktop.json', { cache: 'no-store' });
        if (!response.ok) {
            throw new Error(`Failed to load default desktop config: ${response.status}`);
        }
        const data = await response.json();
        console.log('Default desktop config loaded successfully');
        return data;
    } catch (error) {
        console.error('Error loading default desktop config:', error);
        return null;
    }
}

export async function generateDesktopIcons(pageSpecificConfig) {
    console.log('generateDesktopIcons called');
    const config = await loadDesktopConfig(pageSpecificConfig);
    if (!config) {
        console.error('No desktop config loaded');
        return;
    }

    const desktopIconsContainer = document.querySelector('.desktop-icons');
    if (!desktopIconsContainer) {
        console.error('No desktop-icons container found. Skipping desktop icons.');
        return;
    }

    console.log('Found desktop-icons container:', desktopIconsContainer);
    console.log('Clearing desktop icons container');
    desktopIconsContainer.innerHTML = '';

    // Create desktop icons
    for (const [key, icon] of Object.entries(config)) {
        try {
            console.log(`Creating desktop icon for ${key}:`, icon);
            
            // Validate required properties
            if (!icon.icon || !icon.label || !icon.url) {
                console.warn(`Skipping desktop icon ${key}: missing required properties`);
                continue;
            }

            const element = document.createElement('a');
            element.href = icon.url;
            element.className = `desktop-icon desktop-${key}`;
            element.setAttribute('aria-label', icon.aria_label || icon.label);

            element.innerHTML = `
                <div class="icon-image" aria-hidden="true">${icon.icon}</div>
                <div class="icon-label">${icon.label}</div>
            `;

            // Smooth-scroll hash links ("#about") and root hash links ("/#about")
            // when the target section exists on the current page; otherwise let
            // the browser navigate (e.g. back to the homepage from a subpage).
            const hashIndex = icon.url.indexOf('#');
            if (hashIndex !== -1) {
                element.addEventListener('click', (e) => {
                    const targetId = icon.url.slice(hashIndex + 1);
                    const targetElement = document.getElementById(targetId);
                    if (targetElement) {
                        e.preventDefault();
                        targetElement.scrollIntoView({
                            behavior: 'smooth',
                            block: 'start'
                        });
                    }
                });
            }

            desktopIconsContainer.appendChild(element);
            console.log(`Added desktop icon for ${key}`);
        } catch (error) {
            console.error(`Error creating desktop icon for ${key}:`, error);
        }
    }

    // Set up mobile menu toggle functionality
    const menuToggle = document.querySelector('.menu-toggle');
    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            desktopIconsContainer.classList.toggle('active');
            const isExpanded = desktopIconsContainer.classList.contains('active');
            menuToggle.setAttribute('aria-expanded', isExpanded);
        });
    }
}

// ===============================
// Desktop.js - Desktop-specific functionality
// ===============================

//////////////////////////
// Visitor Counter      //
//////////////////////////
export async function updateVisitorCounter() {
    try {
        const digits = document.querySelectorAll('.counter-digit');
        if (!digits.length) return;

        const show = (n) => {
            const padded = String(n).padStart(6, '0').slice(-6);
            digits.forEach((digit, idx) => {
                digit.textContent = padded[idx] || '0';
            });
        };

        // Paint the last value instantly, then refresh from the baked file.
        show(localStorage.getItem('visitorCount') || '0');

        // The hidden badge <img> tallies the hit server-side on every visit.
        // A daily GitHub Action reads those tallies and bakes config/visits.json,
        // which we serve same-origin — so the LED reads a real number with no
        // cross-origin fetch and no live third-party dependency.
        const pageId = `pauljunsukhan.com${window.location.pathname}`;
        try {
            const resp = await fetch('/config/visits.json', { cache: 'no-store' });
            if (resp.ok) {
                const visits = await resp.json();
                const count = visits[pageId];
                if (typeof count === 'number') {
                    localStorage.setItem('visitorCount', count);
                    show(count);
                }
            }
        } catch {
            // Keep the cached value already on screen.
        }
    } catch (error) {
        console.error('Visitor counter error:', error);
    }
}
