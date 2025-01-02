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
        const response = await fetch('/config/socials.json');
        if (!response.ok) throw new Error('Failed to load social config');
        return await response.json();
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

    const socialGrid = document.querySelector('.social-grid');
    if (!socialGrid) return;

    socialGrid.innerHTML = '';

    // Create social links
    Object.entries(config).forEach(([key, social]) => {
        const element = document.createElement(social.type === 'link' ? 'a' : 'button');
        element.className = `social-link ${key}-button`;
        
        if (social.type === 'link') {
            element.href = social.url;
            element.target = '_blank';
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

// Dynamic Project Loading
async function loadProjects() {
    try {
        const response = await fetch('/config/projects.json');
        if (!response.ok) throw new Error('Failed to load projects');
        const data = await response.json();
        
        const dynamicProjectsGrid = document.querySelector('.dynamic-projects');
        if (!dynamicProjectsGrid) return;

        data.projects.forEach(project => {
            const projectWindow = createProjectWindow(project);
            dynamicProjectsGrid.appendChild(projectWindow);
        });

        // Initialize event listeners for new project windows
        initializeProjectWindows();
    } catch (error) {
        console.error('Error loading projects:', error);
    }
}

function createProjectWindow(project) {
    const projectWindow = document.createElement('div');
    projectWindow.className = 'mac-window project-window';
    projectWindow.dataset.project = project.id;

    // Helper function to convert URLs in text to links
    function linkifySpec(spec) {
        // If spec starts with "Link: ", make the URL part clickable
        if (spec.startsWith('Link:')) {
            const [prefix, url] = spec.split('Link:');
            return `Link: <a href="${url.trim()}" target="_blank">${url.trim()}</a>`;
        }
        return spec;
    }

    projectWindow.innerHTML = `
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

    return projectWindow;
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
                    
                    // Set the content directly
                    previewContent.innerHTML = '';
                    previewContent.appendChild(mainWindow);
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
    const badge = document.getElementById('visitor-badge');
    const digits = document.querySelectorAll('.counter-digit');
    
    if (!badge || !digits.length) {
        console.log('Visitor counter elements not found');
        return;
    }
    
    // Create an observer to watch for changes to the badge's src
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'attributes' && mutation.attributeName === 'src') {
                // Extract count from badge alt text after it loads
                badge.onload = () => {
                    try {
                        // The badge alt text contains the count in format "Visitor Count : 123"
                        const count = badge.alt.split(':')[1]?.trim() || '0';
                        const paddedCount = count.padStart(6, '0');
                        
                        // Update each digit
                        digits.forEach((digit, index) => {
                            digit.textContent = paddedCount[index] || '0';
                        });
                    } catch (error) {
                        console.error('Error updating visitor counter:', error);
                    }
                };
            }
        });
    });
    
    try {
        // Start observing the badge
        observer.observe(badge, { attributes: true });
    } catch (error) {
        console.error('Error setting up visitor counter:', error);
    }
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Initialize core functionality
        await generateSocialLinks();
        updateVisitorCounter();
        await loadProjects();

        // Initialize smooth scrolling
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
    } catch (error) {
        console.error('Error initializing page:', error);
    }
}); 