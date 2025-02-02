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
            const response = await fetch(pageSpecificConfig);
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
        const response = await fetch('./desktop.json');
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
        const response = await fetch('./config/desktop.json');
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

            // Add smooth scrolling for hash links
            if (icon.url.startsWith('#')) {
                element.addEventListener('click', (e) => {
                    e.preventDefault();
                    const targetId = icon.url.slice(1);
                    const targetElement = document.getElementById(targetId);
                    if (targetElement) {
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
