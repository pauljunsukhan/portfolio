/**
 * menubar.js
 * ----------------------------------
 * Handles the menu bar configuration and rendering.
 */

async function loadMenuConfig(pageSpecificConfig) {
    // If a specific config path is provided, try that first
    if (pageSpecificConfig) {
        try {
            const response = await fetch(pageSpecificConfig);
            if (response.ok) {
                const data = await response.json();
                console.log('Specific menu config loaded successfully');
                return data;
            }
        } catch (error) {
            console.warn(`Failed to load specific menu config from ${pageSpecificConfig}:`, error);
        }
    }

    // Try to load from current directory
    try {
        const currentPath = './menubar.json';
        const response = await fetch(currentPath);
        if (response.ok) {
            const data = await response.json();
            console.log('Local menu config loaded successfully');
            return data;
        }
    } catch (error) {
        console.warn('No local menubar.json found in current directory');
    }

    // Fall back to default config
    try {
        const defaultPath = './config/menubar.json';
        const response = await fetch(defaultPath);
        if (!response.ok) {
            throw new Error(`Failed to load default menu config: ${response.status}`);
        }
        const data = await response.json();
        console.log('Default menu config loaded successfully');
        return data;
    } catch (error) {
        console.error('Error loading default menu config:', error);
        return null;
    }
}

export async function generateMenuBar(pageSpecificConfig) {
    const config = await loadMenuConfig(pageSpecificConfig);
    if (!config) {
        console.error('No menu config loaded');
        return;
    }

    const menuBar = document.querySelector('.global-menu-bar');
    if (!menuBar) {
        console.error('No menu bar found. Skipping menu generation.');
        return;
    }

    menuBar.innerHTML = '';

    // Add Apple menu
    const appleMenu = document.createElement('span');
    appleMenu.className = 'apple-menu';
    appleMenu.setAttribute('aria-label', config.apple_menu.aria_label);
    appleMenu.textContent = config.apple_menu.icon;
    menuBar.appendChild(appleMenu);

    // Add divider
    const divider = document.createElement('div');
    divider.className = 'menu-divider';
    divider.setAttribute('aria-hidden', 'true');
    menuBar.appendChild(divider);

    // Add menu items
    config.menu_items.forEach(item => {
        const menuItem = document.createElement('span');
        menuItem.className = 'menu-item';
        menuItem.setAttribute('role', item.role);
        menuItem.textContent = item.label;
        menuBar.appendChild(menuItem);
    });
} 