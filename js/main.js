// Smooth scroll for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Simple lazy loading for images
document.addEventListener('DOMContentLoaded', () => {
    const lazyImages = document.querySelectorAll('img[data-src]');
    
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
                observer.unobserve(img);
            }
        });
    });

    lazyImages.forEach(img => imageObserver.observe(img));
});

// Simple form validation
const contactForm = document.querySelector('.contact-form form');
if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        // Add your form submission logic here
        console.log('Form submitted');
    });
} 

// Add overlay to body
const overlay = document.createElement('div');
overlay.className = 'overlay';
document.body.appendChild(overlay);

// Create error dialog
const errorDialog = document.createElement('div');
errorDialog.className = 'error-dialog';
errorDialog.innerHTML = `
    <div class="window-title-bar">
        <div class="window-controls">
            <div class="window-button"></div>
        </div>
        <div class="window-title">Error</div>
    </div>
    <div class="content">
        <p>Oops! Something went wrong.</p>
    </div>
`;
document.body.appendChild(errorDialog);

// Show/Hide Dialog Functions
function showDialog(dialog) {
    dialog.classList.add('active');
    overlay.classList.add('active');
}

function hideDialog(dialog) {
    dialog.classList.remove('active');
    overlay.classList.remove('active');
}

function showError() {
    errorDialog.classList.add('active');
    overlay.classList.add('active');
}

function hideError() {
    errorDialog.classList.remove('active');
    overlay.classList.remove('active');
}

// Load social links configuration
async function loadSocialConfig() {
    try {
        // Add console log for debugging
        console.log('Attempting to load social config...');
        const response = await fetch('./config/socials.json');  // Add ./ to make path relative
        if (!response.ok) {
            throw new Error(`Failed to load social config: ${response.status}`);
        }
        const data = await response.json();
        console.log('Social config loaded successfully');
        return data;
    } catch (error) {
        console.error('Error loading social config:', error);
        return null;
    }
}

// Decode Base64 encoded strings
function decode(encoded) {
    return atob(encoded);
}

// Generate social links
async function generateSocialLinks() {
    const config = await loadSocialConfig();
    if (!config) return;

    // Fix the selector to match our HTML
    const socialGrid = document.querySelector('.social-grid[role="list"]');
    if (!socialGrid) {
        console.error('Social grid not found');
        return;
    }

    socialGrid.innerHTML = '';

    // Create social links
    Object.entries(config).forEach(([key, social]) => {
        const element = document.createElement(social.type === 'link' ? 'a' : 'button');
        element.className = `social-link social-${key}`;
        
        if (social.type === 'link') {
            element.href = social.url;
            element.target = '_blank';
            element.rel = 'noopener noreferrer';  // Add security best practice
        }

        element.innerHTML = `
            <span class="social-icon">${social.icon}</span>
            <span class="social-label">${social.label}</span>
        `;

        socialGrid.appendChild(element);

        // Create dialog for dialog-type socials
        if (social.type === 'dialog') {
            const dialog = document.createElement('div');
            dialog.className = 'mac-dialog';
            dialog.innerHTML = `
                <div class="window-title-bar">
                    <div class="window-controls">
                        <div class="window-button close-button"></div>
                    </div>
                    <div class="window-title">Contact Info</div>
                </div>
                <div class="content">
                    ${social.dialogContent ? `<p>${social.dialogContent}</p>` : ''}
                    <p class="protected-content">${social.encrypt ? decode(social.value) : social.value}</p>
                </div>
            `;
            document.body.appendChild(dialog);

            // Add event listeners
            element.addEventListener('click', () => showDialog(dialog));
            dialog.querySelector('.close-button').addEventListener('click', () => hideDialog(dialog));
        }
    });

    // Add global overlay click handler for all dialogs
    overlay.addEventListener('click', () => {
        document.querySelectorAll('.mac-dialog.active').forEach(dialog => {
            hideDialog(dialog);
        });
    });

    // Add global escape key handler for all dialogs
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            document.querySelectorAll('.mac-dialog.active').forEach(dialog => {
                hideDialog(dialog);
            });
        }
    });
}

// Load projects configuration
async function loadProjects() {
    try {
        console.log('Loading projects...');
        const response = await fetch('./config/projects.json');  // Changed to relative path
        if (!response.ok) {
            throw new Error(`Failed to load projects: ${response.status}`);
        }
        const data = await response.json();
        
        const dynamicProjectsGrid = document.querySelector('.project-grid.dynamic-projects');
        if (!dynamicProjectsGrid) {
            throw new Error('Projects container not found');
        }

        data.projects.forEach(project => {
            const projectWindow = createProjectWindow(project);
            dynamicProjectsGrid.appendChild(projectWindow);
        });

        initializeProjectWindows();
        console.log('Projects loaded successfully');
    } catch (error) {
        console.error('Error loading projects:', error);
    }
}

function createProjectWindow(project) {
    const windowDiv = document.createElement('div');
    windowDiv.className = 'mac-window project-window loading';
    windowDiv.setAttribute('data-project', project.id);

    const titleBar = document.createElement('div');
    titleBar.className = 'window-title-bar';
    titleBar.innerHTML = `
        <div class="window-controls">
            <div class="window-button"></div>
            <div class="window-button"></div>
            <div class="window-button"></div>
        </div>
        <div class="window-title">${project.title}</div>
        <div class="window-buttons">
            <button class="preview-button">Preview</button>
            ${project.buttons.github ? `<a href="${project.buttons.github}" target="_blank" class="github-button">Github</a>` : ''}
        </div>
    `;

    // Helper function to convert URLs in text to links
    function linkifySpec(spec) {
        // If spec starts with "Link: ", make the URL part clickable
        if (spec.startsWith('Link:')) {
            const [prefix, url] = spec.split('Link:');
            return `Link: <a href="${url.trim()}" target="_blank">${url.trim()}</a>`;
        }
        return spec;
    }

    windowDiv.innerHTML = `
        <div class="window-title-bar">
            <div class="window-controls">
                <div class="window-button maximize-button"></div>
            </div>
            <div class="window-title">${project.title}</div>
            <a href="${project.buttons.github}" class="project-link-button">Github</a>
        </div>
        <div class="content">
            <h3>${project.subtitle}</h3>
            <p>${project.description}</p>
            <ul>
                ${project.specs.map(spec => `<li>${linkifySpec(spec)}</li>`).join('')}
            </ul>
            <div class="project-actions">
                <button class="project-button preview" data-project="${project.id}">Preview</button>
                <a href="${project.buttons.link}" class="project-button link">Link</a>
            </div>
        </div>
    `;

    // Remove loading class when content is ready
    setTimeout(() => windowDiv.classList.remove('loading'), 100);
    return windowDiv;
}

// Initialize project windows
function initializeProjectWindows() {
    const projectWindows = document.querySelectorAll('.project-window');
    const previewButtons = document.querySelectorAll('.project-button.preview');
    const previewWindow = document.querySelector('.project-preview');
    const exitButton = previewWindow.querySelector('.exit-button');
    const previewContent = previewWindow.querySelector('.preview-content');
    
    // Handle preview button clicks
    previewButtons.forEach(button => {
        button.addEventListener('click', async (e) => {
            const projectId = button.dataset.project;
            const url = getProjectUrl(projectId);
            
            try {
                // Load project webpage
                const response = await fetch(url + 'index.html');
                if (!response.ok) throw new Error('Project content not found');
                
                const content = await response.text();
                
                // Parse the HTML content
                const parser = new DOMParser();
                const doc = parser.parseFromString(content, 'text/html');
                
                // Extract just the main window content
                const mainWindow = doc.querySelector('main.mac-window');
                if (mainWindow) {
                    // Show preview window
                    previewWindow.classList.add('active');
                    document.body.classList.add('preview-open');
                    
                    // Set the content
                    previewContent.innerHTML = '';
                    previewContent.appendChild(mainWindow.cloneNode(true));
                    
                    // Load necessary styles for construction page
                    if (url.includes('under-construction')) {
                        // Remove any existing construction styles
                        const existingStyles = document.querySelector('link[href*="construction.css"]');
                        if (existingStyles) {
                            existingStyles.remove();
                        }

                        // Add fresh construction styles
                        const constructionStyles = document.createElement('link');
                        constructionStyles.rel = 'stylesheet';
                        constructionStyles.href = '/styles/construction.css';
                        document.head.appendChild(constructionStyles);

                        // Force a repaint to apply styles
                        previewContent.style.display = 'none';
                        previewContent.offsetHeight; // Force reflow
                        previewContent.style.display = '';

                        // Initialize construction page features
                        initConstructionPage();
                    }
                } else {
                    throw new Error('Invalid project content structure');
                }
            } catch (error) {
                console.error('Error loading project:', error);
                previewContent.innerHTML = `
                    <div class="error-message">
                        <h3>Project Coming Soon</h3>
                        <p>This project is currently under development.</p>
                    </div>
                `;
                previewWindow.classList.add('active');
                document.body.classList.add('preview-open');
            }
        });
    });

    // Handle exit button click
    exitButton.addEventListener('click', () => {
        previewWindow.classList.remove('active');
        document.body.classList.remove('preview-open');
        // Clear content after animation
        setTimeout(() => {
            previewContent.innerHTML = '';
        }, 300);
    });

    // Close preview on escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && previewWindow.classList.contains('active')) {
            exitButton.click();
        }
    });
    
    // Handle project window clicks
    projectWindows.forEach(window => {
        window.addEventListener('click', (e) => {
            const linkButton = e.target.closest('.project-link-button');
            if (!linkButton && !e.target.closest('.project-actions') && !e.target.closest('.window-controls')) {
                const projectId = window.dataset.project;
                const url = getProjectUrl(projectId);
                if (url) {
                    window.location.href = url;
                }
            }
        });
    });
}

// Helper functions
function maximizeProject(projectWindow) {
    const maximizedView = document.querySelector('.maximized-project');
    const maximizedContent = maximizedView.querySelector('.content');
    const projectContent = projectWindow.querySelector('.content').cloneNode(true);
    const projectTitle = projectWindow.querySelector('.window-title').textContent;

    maximizedView.querySelector('.window-title').textContent = projectTitle;
    maximizedContent.innerHTML = '';
    maximizedContent.appendChild(projectContent);

    maximizedView.style.display = 'block';
    overlay.classList.add('active');
    setTimeout(() => {
        maximizedView.classList.add('active');
    }, 10);
}

function minimizeProject() {
    const maximizedView = document.querySelector('.maximized-project');
    maximizedView.classList.remove('active');
    overlay.classList.remove('active');
    setTimeout(() => {
        maximizedView.style.display = 'none';
    }, 300);
}

function getProjectUrl(projectId) {
    const projectUrls = {
        'neural-network': '/projects/neural-network/',
        'quantum-circuit': '/projects/quantum-circuit/',
        'retro-os': '/projects/under-construction/',
        'ai-assistant': '/projects/ai-assistant/'
    };
    return projectUrls[projectId] || '/projects/under-construction/';
}

// Update visitor counter from badge
function updateVisitorCounter() {
    try {
        const badge = document.getElementById('visitor-badge');
        const digits = document.querySelectorAll('.counter-digit');
        
        if (!badge || !digits.length) {
            throw new Error('Visitor counter elements not found');
        }

        function updateDisplay() {
            try {
                console.log('Attempting to update visitor count...');
                
                // Set mode to 'no-cors' to avoid CORS errors
                badge.crossOrigin = 'anonymous';
                
                // Update display with default value
                const defaultCount = '001998';
                const paddedCount = defaultCount.padStart(6, '0');
                
                digits.forEach((digit, index) => {
                    digit.textContent = paddedCount[index] || '0';
                });

                // Attempt to load the badge image
                badge.onerror = () => {
                    console.log('Badge load failed, using default count');
                };

                badge.onload = () => {
                    console.log('Badge loaded successfully');
                };

            } catch (error) {
                console.error('Error in updateDisplay:', error);
                // Prevent the error from affecting other functionality
                return;
            }
        }

        // Initial update
        console.log('Initializing visitor counter...');
        updateDisplay();

        // Periodic updates (every 5 minutes)
        setInterval(updateDisplay, 300000);
    } catch (error) {
        console.error('Visitor counter error:', error);
        // Prevent the error from affecting other functionality
        return;
    }
}

// Typewriter effect for construction date
function typewriterEffect(element) {
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

// Initialize construction page features
function initConstructionPage() {
    const dateElement = document.querySelector('.construction-date .typewriter');
    if (dateElement) {
        typewriterEffect(dateElement);
    }
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
    try {
        console.log('Initializing page...');
        
        // Initialize mobile menu toggle first
        const menuToggle = document.querySelector('.menu-toggle');
        const desktopIcons = document.querySelector('.desktop-icons');
        
        if (menuToggle && desktopIcons) {
            menuToggle.addEventListener('click', () => {
                desktopIcons.classList.toggle('active');
                menuToggle.textContent = desktopIcons.classList.contains('active') ? '×' : '⋮';
            });
        }

        // Initialize features in sequence
        await generateSocialLinks().catch(error => {
            console.error('Error generating social links:', error);
        });

        await loadProjects().catch(error => {
            console.error('Error loading projects:', error);
        });

        updateVisitorCounter();

    } catch (error) {
        console.error('Error initializing page:', error);
    }
}); 