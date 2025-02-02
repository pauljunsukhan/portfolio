/**
 * documents.js
 * Renders document content from JSON configuration
 */

import { linkifyText } from './globals.js';

// We'll use the global marked instance since we're loading it in index.html
const marked = window.marked;

// Configure marked options
marked.setOptions({
    gfm: true, // GitHub Flavored Markdown
    breaks: true, // Convert \n to <br>
    headerIds: true,
    mangle: false // Don't escape HTML
});

/**
 * Load and render a document from JSON config
 * @param {string} configPath - Path to the JSON config file
 * @param {string} containerId - ID of the container element
 */
export async function loadDocument(configPath, containerId) {
    try {
        console.log(`Loading document from ${configPath} into #${containerId}`);
        
        const response = await fetch(configPath);
        if (!response.ok) {
            throw new Error(`Failed to load document: ${response.status}`);
        }
        const doc = await response.json();
        
        // Find container
        const container = document.getElementById(containerId);
        if (!container) {
            throw new Error(`Container not found: ${containerId}`);
        }
        
        // Create document window
        const docWindow = document.createElement('div');
        docWindow.className = 'mac-window document-window';
        
        // Add window controls and title
        const controls = `
            <div class="window-title-bar">
                <div class="window-controls">
                    <button class="window-button minimize-button" aria-label="Minimize window"></button>
                    ${doc.commentary ? `<button class="window-button commentary-button" aria-label="View commentary">?</button>` : ''}
                </div>
                <div class="window-title">${doc.title}</div>
            </div>
            <div class="content document-content"></div>
        `;
        docWindow.innerHTML = controls;
        
        // Add minimize/maximize functionality
        const titleBar = docWindow.querySelector('.window-title-bar');
        const minimizeBtn = docWindow.querySelector('.minimize-button');
        
        let isTransitioning = false;
        const TRANSITION_DURATION = 300; // Match this with CSS transition duration
        
        const toggleMinimize = () => {
            if (isTransitioning) return;
            isTransitioning = true;

            docWindow.classList.toggle('minimized');
            const isMinimized = docWindow.classList.contains('minimized');
            
            // Update button state
            minimizeBtn.setAttribute('aria-label', isMinimized ? 'Maximize window' : 'Minimize window');
            minimizeBtn.className = `window-button ${isMinimized ? 'maximize-button' : 'minimize-button'}`;
            
            // Allow next transition after current one completes
            setTimeout(() => {
                isTransitioning = false;
            }, TRANSITION_DURATION);
        };
        
        // Debounce double-click on title bar
        let lastClickTime = 0;
        titleBar.addEventListener('click', (e) => {
            const currentTime = Date.now();
            if (currentTime - lastClickTime < 300) { // 300ms double-click threshold
                toggleMinimize();
                lastClickTime = 0; // Reset to prevent triple-click
            } else {
                lastClickTime = currentTime;
            }
        });
        
        // Single click for button
        minimizeBtn.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent triggering titlebar click
            toggleMinimize();
        });
        
        // Add commentary functionality if present
        if (doc.commentary) {
            const commentaryBtn = docWindow.querySelector('.commentary-button');
            commentaryBtn.addEventListener('click', () => {
                // Remove any existing dialogs first
                const existingDialog = document.querySelector('.commentary-dialog');
                if (existingDialog) {
                    existingDialog.remove();
                }

                // Create and show commentary dialog
                const dialog = document.createElement('div');
                dialog.className = 'mac-dialog commentary-dialog';
                dialog.innerHTML = `
                    <div class="window-title-bar">
                        <div class="window-controls">
                            <button class="window-button close-button" aria-label="Close dialog"></button>
                        </div>
                        <div class="window-title">Commentary</div>
                    </div>
                    <div class="content">
                        ${marked.parse(doc.commentary)}
                    </div>
                `;
                
                document.body.appendChild(dialog);
                
                // Position dialog next to the document
                const rect = docWindow.getBoundingClientRect();
                const viewportWidth = window.innerWidth;
                
                // Calculate left position
                let leftPos = rect.right + 20;
                // If dialog would go off screen, position it to the left instead
                if (leftPos + 300 > viewportWidth) {
                    leftPos = rect.left - 320;
                }
                
                dialog.style.position = 'absolute';
                dialog.style.top = `${window.scrollY + rect.top}px`;
                dialog.style.left = `${leftPos}px`;
                dialog.style.width = '300px';
                dialog.style.zIndex = '1000';
                
                // Add active class after a small delay to trigger transition
                requestAnimationFrame(() => {
                    dialog.classList.add('active');
                });
                
                // Add close functionality
                const closeBtn = dialog.querySelector('.close-button');
                closeBtn.addEventListener('click', () => {
                    dialog.classList.remove('active');
                    setTimeout(() => dialog.remove(), 200); // Wait for transition
                });
                
                // Close on click outside
                document.addEventListener('click', function closeDialog(e) {
                    if (!dialog.contains(e.target) && !commentaryBtn.contains(e.target)) {
                        dialog.classList.remove('active');
                        setTimeout(() => {
                            dialog.remove();
                            document.removeEventListener('click', closeDialog);
                        }, 200);
                    }
                });
            });
        }
        
        // Render content blocks
        const content = docWindow.querySelector('.document-content');
        doc.content.forEach(block => {
            const element = createBlock(block);
            content.appendChild(element);
        });
        
        // Clear container and add new content
        container.innerHTML = '';
        container.appendChild(docWindow);
        
        console.log(`Document loaded successfully into #${containerId}`);
        
    } catch (error) {
        console.error('Error loading document:', error);
        // Show error in container
        const container = document.getElementById(containerId);
        if (container) {
            container.innerHTML = `
                <div class="mac-window document-window">
                    <div class="window-title-bar">
                        <div class="window-controls">
                            <button class="window-button close-button" aria-label="Close window"></button>
                        </div>
                        <div class="window-title">Error</div>
                    </div>
                    <div class="content document-content">
                        <div class="error-message">
                            Failed to load document. Please try refreshing the page.
                        </div>
                    </div>
                </div>
            `;
        }
    }
}

/**
 * Render a single content block
 * @param {Object} block - Content block configuration
 */
function createBlock(block) {
    const wrapper = document.createElement('div');
    
    switch (block.type) {
        case 'markdown':
            wrapper.className = 'markdown-block';
            // Process our custom link format before markdown parsing
            const processedContent = linkifyText(block.content);
            wrapper.innerHTML = marked.parse(processedContent);
            // Don't set grid-column: 1 / -1 when inside a flex container
            if (!block.style?.flex) {
                wrapper.style.gridColumn = '1 / -1';
            }
            break;
            
        case 'flex-container':
            wrapper.className = 'flex-container';
            // Add flex container styling classes
            if (block.style?.justify) {
                wrapper.classList.add(`justify-${block.style.justify}`);
            }
            if (block.style?.align) {
                wrapper.classList.add(`align-${block.style.align}`);
            }
            if (block.style?.gap) {
                wrapper.classList.add(`gap-${block.style.gap}`);
            }
            
            // Create and append child blocks
            block.content.forEach(childBlock => {
                const childElement = createBlock(childBlock);
                if (childBlock.style?.flex) {
                    childElement.classList.add(`flex-${childBlock.style.flex}`);
                }
                wrapper.appendChild(childElement);
            });
            break;
            
        case 'code':
            wrapper.className = 'code-block';
            if (block.style?.theme) {
                wrapper.classList.add(`theme-${block.style.theme}`);
            }
            const pre = document.createElement('pre');
            const code = document.createElement('code');
            if (block.language) {
                code.className = `language-${block.language}`;
            }
            code.textContent = block.content;
            pre.appendChild(code);
            wrapper.appendChild(pre);
            break;
            
        default:
            console.warn(`Unknown block type: ${block.type}`);
            return document.createElement('div');
    }
    
    // Add any grid span classes
    if (block.style?.span) {
        wrapper.classList.add(`span-${block.style.span}`);
    }
    
    return wrapper;
} 