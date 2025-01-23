/**
 * header.js
 * ----------------------------------
 * Handles the header configuration and rendering.
 */

async function loadHeaderConfig(pageSpecificConfig) {
    // If a specific config path is provided, try that first
    if (pageSpecificConfig) {
        try {
            const response = await fetch(pageSpecificConfig);
            if (response.ok) {
                const data = await response.json();
                console.log('Specific header config loaded successfully');
                return data;
            }
        } catch (error) {
            console.warn(`Failed to load specific header config from ${pageSpecificConfig}:`, error);
        }
    }

    // Try to load from current directory
    try {
        const currentPath = './header.json';
        const response = await fetch(currentPath);
        if (response.ok) {
            const data = await response.json();
            console.log('Local header config loaded successfully');
            return data;
        }
    } catch (error) {
        console.warn('No local header.json found in current directory');
    }

    // Fall back to default config
    try {
        const defaultPath = './config/header.json';
        const response = await fetch(defaultPath);
        if (!response.ok) {
            throw new Error(`Failed to load default header config: ${response.status}`);
        }
        const data = await response.json();
        console.log('Default header config loaded successfully');
        return data;
    } catch (error) {
        console.error('Error loading default header config:', error);
        return null;
    }
}

export async function generateHeader(pageSpecificConfig) {
    const config = await loadHeaderConfig(pageSpecificConfig);
    if (!config) {
        console.error('No header config loaded');
        return;
    }

    // Update window title
    const windowTitle = document.querySelector('.window-title');
    if (windowTitle) {
        windowTitle.textContent = config.window_title;
    }

    // Update last update date
    const dateElement = document.querySelector('.date .typewriter');
    if (dateElement) {
        dateElement.textContent = config.last_update;
    }

    // Update headshot
    const headshot = document.querySelector('.headshot');
    if (headshot) {
        headshot.src = config.headshot.src;
        headshot.alt = config.headshot.alt;
        headshot.width = config.headshot.width;
        headshot.height = config.headshot.height;
    }

    // Update title and subtitle
    const titleElement = document.querySelector('#hero-title');
    if (titleElement) {
        titleElement.textContent = config.title;
    }

    const subtitleElement = document.querySelector('.subtitle');
    if (subtitleElement) {
        subtitleElement.textContent = config.subtitle;
    }
} 