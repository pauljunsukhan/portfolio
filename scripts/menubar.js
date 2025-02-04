import { createDialog } from './globals.js';

/**
 * menubar.js
 * ----------------------------------
 * Handles the menu bar configuration and rendering.
 * Supports multiple action types:
 * - dialog: Opens a dialog window
 * - link: Navigate to internal/external URLs in new tab
 * - toggle: Toggles state (theme, layout)
 * - radio: radio buttons
 */

async function loadMenuConfig(pageSpecificConfig) {
    console.log('Loading menu config...', { pageSpecificConfig });
    
    // If a specific config path is provided, try that first
    if (pageSpecificConfig) {
        try {
            const response = await fetch(pageSpecificConfig);
            if (response.ok) {
                const data = await response.json();
                console.log('Specific menu config loaded:', data);
                return data;
            }
        } catch (error) {
            console.warn(`Failed to load specific menu config from ${pageSpecificConfig}:`, error);
        }
    }

    // Try to load from current directory, first menubar.json then menu.json
    try {
        // Try menubar.json first
        let response = await fetch('./menubar.json');
        if (response.ok) {
            const data = await response.json();
            console.log('Local menubar config loaded:', data);
            return data;
        }

        // If menubar.json fails, try menu.json
        response = await fetch('./menu.json');
        if (response.ok) {
            const data = await response.json();
            console.log('Local menu config loaded:', data);
            return data;
        }
    } catch (error) {
        // Silently continue to default config
        console.warn('No local menu config found, trying default');
    }

    // Fall back to default config in /config directory, first menubar.json then menu.json
    try {
        // Try menubar.json first
        let response = await fetch('/config/menubar.json');
        if (response.ok) {
            const data = await response.json();
            console.log('Default menubar config loaded:', data);
            return data;
        }

        // If menubar.json fails, try menu.json
        response = await fetch('/config/menu.json');
        if (response.ok) {
            const data = await response.json();
            console.log('Default menu config loaded:', data);
            return data;
        }

        // If both fail, throw error
        throw new Error('No menu configuration found');
    } catch (error) {
        console.warn('No menu configuration found:', error);
        // Return a minimal default configuration instead of null
        return {
            apple_menu: {
                icon: '▶︎ •၊၊||၊|၊||‌။',
                aria_label: 'Apple menu',
                role: 'button',
                action: {
                    type: 'dialog',
                    title: 'About',
                    content: 'Portfolio v1.0'
                }
            },
            menu_items: [
                {
                    label: 'File',
                    role: 'menu',
                    items: []
                },
                {
                    label: 'Edit',
                    role: 'menu',
                    items: []
                }
            ]
        };
    }
}

export async function generateMenuBar(pageSpecificConfig) {
    console.log('Generating menu bar...');
    
    const config = await loadMenuConfig(pageSpecificConfig);
    if (!config) {
        console.error('No menu config loaded');
        return;
    }

    const menuBar = document.querySelector('.global-menu-bar');
    if (!menuBar) {
        console.error('No menu bar found');
        return;
    }

    menuBar.setAttribute('role', 'menubar');
    menuBar.innerHTML = '';

    // Add Apple menu
    if (config.apple_menu) {
        console.log('Creating Apple menu:', config.apple_menu);
        const appleMenu = createAppleMenu(config.apple_menu);
        menuBar.appendChild(appleMenu);

        // Add divider after Apple menu
        const divider = document.createElement('div');
        divider.className = 'menu-divider';
        divider.setAttribute('aria-hidden', 'true');
        menuBar.appendChild(divider);
    }

    // Create menu items
    config.menu_items.forEach((item, index) => {
        createMenuItem(item, menuBar);
    });

    // Initialize keyboard navigation
    initializeKeyboardNav(menuBar);

    console.log('Menu bar generation complete');
    return menuBar;
}

function createAppleMenu(config) {
    const container = document.createElement('div');
    container.className = 'menu-item apple-menu-container';
    
    const button = document.createElement('button');
    button.className = 'apple-menu';
    button.setAttribute('role', config.role || 'button');
    button.setAttribute('aria-label', config.aria_label || 'Apple menu');
    button.innerHTML = config.icon || '🍎';
    
    if (config.action) {
        button.addEventListener('click', (e) => {
            e.stopPropagation();
            console.log('Apple menu clicked, action:', config.action);
            handleAction(config.action);
        });
    }

    // Add hover behavior to match other menu items
    container.addEventListener('mouseenter', () => {
        // If any menu is open, close all menus
        const menuBar = container.closest('.global-menu-bar');
        if (menuBar && menuBar.querySelector('.menu-item.active')) {
            closeAllMenus();
        }
    });
    
    container.appendChild(button);
    return container;
}

function createMenuItem(config, menuBar) {
    console.log('Creating menu item:', { label: config.label, role: config.role });
    
    const container = document.createElement('div');
    container.className = 'menu-item';
    
    const button = document.createElement('button');
    button.textContent = config.label;
    button.setAttribute('role', config.role || 'menuitem');
    container.appendChild(button);
    
    // Create submenu for top-level menu items only
    if (config.items && config.role === 'menu') {
        console.log('Creating submenu for:', config.label);
        button.setAttribute('aria-haspopup', 'true');
        button.setAttribute('aria-expanded', 'false');
        
        const submenu = createSubmenu(config.items);
        container.appendChild(submenu);
        
        // Handle menu item clicks
        button.addEventListener('click', (e) => {
            e.stopPropagation();
            const isExpanded = button.getAttribute('aria-expanded') === 'true';
            
            // Close all other top-level menus
            if (menuBar) {
                menuBar.querySelectorAll('.menu-item > button[aria-expanded="true"]').forEach(btn => {
                    if (btn !== button) {
                        btn.setAttribute('aria-expanded', 'false');
                        btn.parentElement.classList.remove('active');
                        const siblingSubmenu = btn.parentElement.querySelector('.submenu');
                        if (siblingSubmenu) {
                            siblingSubmenu.classList.remove('active');
                        }
                    }
                });
            }
            
            // Toggle overlay
            toggleMenuOverlay(!isExpanded);
            
            // Toggle this menu's state
            button.setAttribute('aria-expanded', !isExpanded);
            container.classList.toggle('active', !isExpanded);
            submenu.classList.toggle('active', !isExpanded);
        });
        
        // For top-level menus, add hover behavior
        container.addEventListener('mouseenter', () => {
            // If any menu is open, open this one too
            if (menuBar && menuBar.querySelector('.menu-item.active')) {
                button.click();
            }
        });
    } else if (config.action) {
        // This is an action item
        button.addEventListener('click', (e) => {
            e.stopPropagation();
            console.log('Action clicked:', {
                label: config.label,
                action: config.action
            });
            handleAction(config.action);
            closeAllMenus();
        });
    }
    
    // Append the menu item to the menu bar
    menuBar.appendChild(container);
    return container;
}

function createSubmenu(items) {
    const submenu = document.createElement('div');
    submenu.className = 'submenu';
    submenu.setAttribute('role', 'menu');
    
    // First pass: find default radio button in each group
    const defaultsByGroup = {};
    items.forEach(item => {
        if (item.role === 'menuitemradio' && item.group && item.default) {
            defaultsByGroup[item.group] = true;
            // Also set the initial layout value
            if (item.action.target === 'layout') {
                document.body.setAttribute('data-layout', item.action.value);
            }
        }
    });
    
    items.forEach(item => {
        const menuItem = document.createElement('div');
        menuItem.className = 'menu-item';
        
        const button = document.createElement('button');
        button.textContent = item.label;
        button.setAttribute('role', item.role || 'menuitem');
        
        if (item.role === 'menuitemcheckbox') {
            button.setAttribute('aria-checked', 'false');
        } else if (item.role === 'menuitemradio') {
            // Set initial state based on default
            const isDefault = item.default || 
                            (!defaultsByGroup[item.group] && item.action.value === 'comfortable');
            button.setAttribute('aria-checked', isDefault.toString());
        }
        
        button.addEventListener('click', (e) => {
            e.stopPropagation();
            if (item.action) {
                handleAction(item.action);
                
                // Handle checkbox/radio state
                if (item.role === 'menuitemcheckbox') {
                    const isChecked = button.getAttribute('aria-checked') === 'true';
                    button.setAttribute('aria-checked', (!isChecked).toString());
                } else if (item.role === 'menuitemradio') {
                    // Uncheck all other radio items in the group
                    const group = item.group;
                    if (group) {
                        submenu.querySelectorAll(`button[role="menuitemradio"][data-group="${group}"]`).forEach(radio => {
                            radio.setAttribute('aria-checked', 'false');
                        });
                    }
                    button.setAttribute('aria-checked', 'true');
                }
                
                // Only close menu for non-toggle/radio actions
                const shouldCloseMenu = item.action.type !== 'toggle' && 
                                      item.role !== 'menuitemcheckbox' && 
                                      item.role !== 'menuitemradio';
                if (shouldCloseMenu) {
                    closeAllMenus();
                }
            }
        });
        
        // Add group data attribute for radio buttons
        if (item.role === 'menuitemradio' && item.group) {
            button.setAttribute('data-group', item.group);
        }
        
        menuItem.appendChild(button);
        submenu.appendChild(menuItem);
    });
    
    return submenu;
}

function closeAllMenus() {
    console.log('Closing all menus');
    
    const menuBar = document.querySelector('.global-menu-bar');
    if (!menuBar) return;

    // Reset all menu items
    menuBar.querySelectorAll('.menu-item').forEach(item => {
        const button = item.querySelector('button[aria-expanded]');
        if (button) {
            button.setAttribute('aria-expanded', 'false');
        }
        item.classList.remove('active');
    });

    // Hide all submenus
    menuBar.querySelectorAll('.submenu').forEach(submenu => {
        submenu.classList.remove('active');
    });
    
    // Remove overlay
    toggleMenuOverlay(false);
}

function handleAction(action) {
    console.log('Handling action:', action);
    
    switch (action.type) {
        case 'dialog':
            handleDialogAction(action);
            break;
            
        case 'link':
            handleLinkAction(action);
            break;
            
        case 'toggle':
            handleToggleAction(action);
            break;
            
        default:
            console.warn('Unknown action type:', action.type);
    }
}

function handleDialogAction(action) {
    console.log('Opening dialog:', action);
    createDialog({
        title: action.title,
        content: action.content,
        onClose: () => closeAllMenus()
    });
}

function handleLinkAction(action) {
    console.log('Handling link:', action);
    window.open(action.url, '_blank', 'noopener,noreferrer');
}

function handleToggleAction(action) {
    console.log('Handling toggle:', action);
    switch (action.target) {
        case 'theme':
            document.body.classList.toggle('dark-mode');
            break;
            
        case 'layout':
            document.body.setAttribute('data-layout', action.value);
            break;
            
        default:
            console.warn('Unknown toggle target:', action.target);
    }
}

function initializeKeyboardNav(menubar) {
    // Will implement arrow key navigation, Esc to close, etc.
    console.log('Keyboard navigation to be implemented');
}

// Add this function to create and manage the menu overlay
function toggleMenuOverlay(show) {
    let overlay = document.querySelector('.menu-overlay');
    
    if (show && !overlay) {
        overlay = document.createElement('div');
        overlay.className = 'menu-overlay';
        document.body.appendChild(overlay);
        
        let closeTimeout;
        let isInMenuArea = false;
        
        // Track mouse position relative to menu elements
        const checkMenuArea = (e) => {
            const menuBar = document.querySelector('.global-menu-bar');
            const activeSubmenus = document.querySelectorAll('.submenu.active');
            
            // Check if mouse is in menu bar with buffer
            const menuBarRect = menuBar.getBoundingClientRect();
            const inMenuBar = e.clientY <= menuBarRect.bottom + 10; // Added 10px buffer below menu bar
            
            // Check if mouse is in any active submenu with generous buffer zone
            const inSubmenu = Array.from(activeSubmenus).some(submenu => {
                const rect = submenu.getBoundingClientRect();
                // Add larger buffer zones around submenus
                return e.clientX >= rect.left - 10 && 
                       e.clientX <= rect.right + 10 && 
                       e.clientY >= rect.top - 10 && 
                       e.clientY <= rect.bottom + 10;
            });

            // Also check if mouse is in the path between menu bar and submenu
            const inMenuPath = Array.from(activeSubmenus).some(submenu => {
                const rect = submenu.getBoundingClientRect();
                return e.clientX >= rect.left - 10 &&
                       e.clientX <= rect.right + 10 &&
                       e.clientY >= menuBarRect.bottom &&
                       e.clientY <= rect.top;
            });
            
            return inMenuBar || inSubmenu || inMenuPath;
        };
        
        overlay.addEventListener('mousemove', (e) => {
            const nowInMenuArea = checkMenuArea(e);
            
            if (nowInMenuArea !== isInMenuArea) {
                isInMenuArea = nowInMenuArea;
                
                if (!isInMenuArea) {
                    // Increase delay before closing menus
                    if (closeTimeout) clearTimeout(closeTimeout);
                    closeTimeout = setTimeout(() => {
                        if (!isInMenuArea) {
                            closeAllMenus();
                        }
                    }, 400); // Increased delay to 400ms
                } else {
                    // Cancel close timer if mouse returns to menu area
                    if (closeTimeout) {
                        clearTimeout(closeTimeout);
                        closeTimeout = null;
                    }
                }
            }
        });
        
        // Only close on click if we're definitely outside menu areas
        overlay.addEventListener('click', (e) => {
            if (!checkMenuArea(e)) {
                closeAllMenus();
            }
        });
    } else if (!show && overlay) {
        overlay.remove();
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => generateMenuBar());
