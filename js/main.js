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

const contactForm = document.querySelector('.contact-form form');
if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        console.log('Form submitted');
    });
} 

const overlay = document.createElement('div');
overlay.className = 'overlay';
document.body.appendChild(overlay);

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

async function loadSocialConfig() {
    try {
        console.log('Attempting to load social config...');
        const response = await fetch('./config/socials.json');
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

function decode(encoded) {
    return atob(encoded);
}

async function generateSocialLinks() {
    const config = await loadSocialConfig();
    if (!config) return;

    const socialGrid = document.querySelector('.social-grid[role="list"]');
    if (!socialGrid) {
        console.error('Social grid not found');
        return;
    }

    socialGrid.innerHTML = '';

    Object.entries(config).forEach(([key, social]) => {
        const element = document.createElement(social.type === 'link' ? 'a' : 'button');
        element.className = `social-link social-${key}`;
        
        if (social.type === 'link') {
            element.href = social.url;
            element.target = '_blank';
            element.rel = 'noopener noreferrer';
        }

        element.innerHTML = `
            <span class="social-icon">${social.icon}</span>
            <span class="social-label">${social.label}</span>
        `;

        socialGrid.appendChild(element);

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

            element.addEventListener('click', () => showDialog(dialog));
            dialog.querySelector('.close-button').addEventListener('click', () => hideDialog(dialog));
        }
    });

    overlay.addEventListener('click', () => {
        document.querySelectorAll('.mac-dialog.active').forEach(dialog => {
            hideDialog(dialog);
        });
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            document.querySelectorAll('.mac-dialog.active').forEach(dialog => {
                hideDialog(dialog);
            });
        }
    });
}

async function loadProjects() {
    try {
        console.log('Loading projects...');
        const response = await fetch('./config/projects.json');
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

    function linkifySpec(spec) {
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

    setTimeout(() => windowDiv.classList.remove('loading'), 100);
    return windowDiv;
}

function initializeProjectWindows() {
    const projectWindows = document.querySelectorAll('.project-window');
    const previewButtons = document.querySelectorAll('.project-button.preview');
    const previewWindow = document.querySelector('.project-preview');
    const exitButton = previewWindow.querySelector('.exit-button');
    const previewContent = previewWindow.querySelector('.preview-content');
    
    previewButtons.forEach(button => {
        button.addEventListener('click', async (e) => {
            const projectId = button.dataset.project;
            const url = getProjectUrl(projectId);
            
            try {
                const response = await fetch(url + 'index.html');
                if (!response.ok) throw new Error('Project content not found');
                
                const content = await response.text();
                
                const parser = new DOMParser();
                const doc = parser.parseFromString(content, 'text/html');
                
                const mainWindow = doc.querySelector('main.mac-window');
                if (mainWindow) {
                    previewWindow.classList.add('active');
                    document.body.classList.add('preview-open');
                    
                    previewContent.innerHTML = '';
                    previewContent.appendChild(mainWindow.cloneNode(true));
                    
                    if (url.includes('under-construction')) {
                        const existingStyles = document.querySelector('link[href*="construction.css"]');
                        if (existingStyles) {
                            existingStyles.remove();
                        }

                        const constructionStyles = document.createElement('link');
                        constructionStyles.rel = 'stylesheet';
                        constructionStyles.href = '/styles/construction.css';
                        document.head.appendChild(constructionStyles);

                        previewContent.style.display = 'none';
                        previewContent.offsetHeight;
                        previewContent.style.display = '';

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

    exitButton.addEventListener('click', () => {
        previewWindow.classList.remove('active');
        document.body.classList.remove('preview-open');
        setTimeout(() => {
            previewContent.innerHTML = '';
        }, 300);
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && previewWindow.classList.contains('active')) {
            exitButton.click();
        }
    });
    
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
                
                badge.crossOrigin = 'anonymous';
                
                const defaultCount = '001998';
                const paddedCount = defaultCount.padStart(6, '0');
                
                digits.forEach((digit, index) => {
                    digit.textContent = paddedCount[index] || '0';
                });

                badge.onerror = () => {
                    console.log('Badge load failed, using default count');
                };

                badge.onload = () => {
                    console.log('Badge loaded successfully');
                };

            } catch (error) {
                console.error('Error in updateDisplay:', error);
                return;
            }
        }

        console.log('Initializing visitor counter...');
        updateDisplay();

        setInterval(updateDisplay, 300000);
    } catch (error) {
        console.error('Visitor counter error:', error);
        return;
    }
}

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

function initConstructionPage() {
    const dateElement = document.querySelector('.construction-date .typewriter');
    if (dateElement) {
        typewriterEffect(dateElement);
    }
}

class MarkdownLoader {
    constructor() {
        console.log('Current marked options:', marked.getDefaults());
        
        marked.setOptions({
            headerIds: true,
            mangle: false,
            headerPrefix: 'section-',
            breaks: true,
            gfm: true,
            highlight: function(code, lang) {
                if (lang && hljs.getLanguage(lang)) {
                    try {
                        return hljs.highlight(code, { language: lang }).value;
                    } catch (err) {}
                }
                return code;
            }
        });

        // Add header styles
        const style = document.createElement('style');
        style.textContent = `
            h1.header-1 { font-size: 2.5em; margin-top: 1em; }
            h2.header-2 { font-size: 2em; margin-top: 0.8em; }
            h3.header-3 { font-size: 1.75em; margin-top: 0.6em; }
            h4.header-4 { font-size: 1.5em; margin-top: 0.4em; }
            h5.header-5 { font-size: 1.25em; margin-top: 0.2em; }
            h6.header-6 { font-size: 1em; margin-top: 0.1em; }
        `;
        document.head.appendChild(style);

        marked.use({ renderer: this.createCustomRenderer() });
    }

    createCustomRenderer() {
        const renderer = new marked.Renderer();

        renderer.image = (href, title, text) => {
            // Get the path from the token
            let imagePath;
            if (typeof href === 'object') {
                // Try to get the path from tokens first
                if (href.tokens && href.tokens.length > 0) {
                    const pathToken = href.tokens.find(t => t.raw && t.raw.includes('/assets/'));
                    if (pathToken) {
                        imagePath = pathToken.raw.match(/\/assets\/[^)\s"]*/)?.[0];
                    }
                }
                
                // Fallback to other properties
                if (!imagePath) {
                    imagePath = href.raw || href.source || href.href || href.path;
                }
            } else {
                imagePath = href;
            }
            
            // Clean up the path if needed
            if (imagePath) {
                const pathMatch = imagePath.match(/\/assets\/[^)\s"]*/);
                if (pathMatch) {
                    imagePath = pathMatch[0];
                }
            }

            // Parse image dimensions from alt text
            let sizeStyle = '';
            let cleanAltText = '';
            
            if (text) {
                // Handle both string and object text tokens
                const altText = typeof text === 'object' ? (text.raw || text.text || '') : text;
                
                // Look for width directive
                const widthMatch = altText.match(/\|width:(\d+)(px|%)?/i);
                if (widthMatch) {
                    const [, value, unit = 'px'] = widthMatch;
                    sizeStyle = ` style="width: ${value}${unit}"`;
                    cleanAltText = altText.replace(/\|width:\d+(?:px|%)?/i, '').trim();
                } else {
                    cleanAltText = altText;
                }
            }

            return `<figure class="markdown-figure">
                <img src="${imagePath || ''}" 
                     alt="${cleanAltText}"
                     class="markdown-image"
                     loading="lazy"${sizeStyle}>
                ${title ? `<figcaption class="markdown-caption">${title}</figcaption>` : ''}
            </figure>`;
        };

        renderer.table = (header, body) => {
            return `
                <div class="table-container">
                    <table class="markdown-table">
                        <thead>${header}</thead>
                        <tbody>${body}</tbody>
                    </table>
                </div>
            `;
        };

        renderer.link = (href, title, text) => {
            const safeHref = typeof href === 'object' ? (href.raw || href.source || href.href || '#') : href;
            const isExternal = safeHref.toString().startsWith('http');
            const linkClass = isExternal ? 'markdown-link external' : 'markdown-link';
            const attrs = isExternal ? ' target="_blank" rel="noopener noreferrer"' : '';
            
            return `<a href="${safeHref}" class="${linkClass}"${attrs}${title ? ` title="${title}"` : ''}>${text}</a>`;
        };

        renderer.heading = (text, level) => {
            try {
                const extractText = (input) => {
                    if (typeof input === 'string') return input;
                    if (typeof input === 'object') {
                        if (input.text) return input.text;
                        if (input.raw) return input.raw.replace(/^#+\s+/, '');
                        return JSON.stringify(input);
                    }
                    return String(input || '');
                };

                const safeText = extractText(text);
                const escapedText = safeText.toLowerCase()
                    .replace(/[^\w]+/g, '-')
                    .replace(/^-+|-+$/g, '');
                const id = `section-${escapedText}`;
                const headerLevel = Math.min(Math.max(parseInt(level) || 1, 1), 6);
                
                return `<h${headerLevel} id="${id}" class="header-${headerLevel}">
                    ${safeText}
                    <a href="#${id}" class="header-anchor" aria-label="Link to this section">
                        <span aria-hidden="true">#</span>
                    </a>
                </h${headerLevel}>`;
            } catch (error) {
                console.error('Error in heading renderer:', error, { text, level });
                const headerLevel = Math.min(Math.max(parseInt(level) || 1, 1), 6);
                return `<h${headerLevel} class="header-${headerLevel}">${String(text || '')}</h${headerLevel}>`;
            }
        };

        renderer.blockquote = (quote) => {
            let type = 'info';
            let content = '';
            
            try {
                // Convert quote to string if it's not already
                const quoteStr = String(quote || '');
                
                // Check for special types at the start of the quote
                const typeMatch = quoteStr.match(/^(?:<p>)?(?:NOTE|WARNING|TIP):\s*/i);
                if (typeMatch) {
                    type = typeMatch[0].replace(/[^a-z]/gi, '').toLowerCase();
                    content = quoteStr.slice(typeMatch[0].length);
                } else {
                    content = quoteStr;
                }
                
                // Clean up any remaining <p> tags
                content = content.replace(/^<p>|<\/p>$/g, '');
                
                return `<blockquote class="markdown-blockquote ${type}">${content}</blockquote>`;
            } catch (error) {
                console.error('Error in blockquote renderer:', error);
                return `<blockquote class="markdown-blockquote info">${String(quote || '')}</blockquote>`;
            }
        };

        return renderer;
    }

    generateTOC(content) {
        const headings = content.match(/^#{1,3}.*$/gm) || [];
        let toc = '## Table of Contents\n\n';
        
        headings.forEach(heading => {
            const level = heading.match(/^#+/)[0].length;
            const text = heading.replace(/^#+\s+/, '');
            const link = text.toLowerCase().replace(/[^\w]+/g, '-');
            const indent = '  '.repeat(level - 1);
            
            toc += `${indent}- [${text}](#section-${link})\n`;
        });
        
        return toc + '\n';
    }

    parseFrontMatter(content) {
        const frontMatterRegex = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/;
        const match = content.match(frontMatterRegex);
        
        if (!match) {
            return {
                attributes: {},
                body: content
            };
        }

        const frontMatterStr = match[1];
        const body = match[2];
        
        const attributes = {};
        frontMatterStr.split('\n').forEach(line => {
            const [key, ...values] = line.split(':').map(str => str.trim());
            if (key && values.length) {
                let value = values.join(':').trim();
                if (value.startsWith('[') && value.endsWith(']')) {
                    value = value.slice(1, -1).split(',').map(item => item.trim());
                }
                else if (value.match(/^\d{4}-\d{2}-\d{2}$/)) {
                    value = new Date(value);
                }
                else if (value === 'true' || value === 'false') {
                    value = value === 'true';
                }
                else if (!isNaN(value)) {
                    value = Number(value);
                }
                attributes[key] = value;
            }
        });

        return { attributes, body };
    }

    async loadMarkdown(path, targetElementId) {
        try {
            console.log(`Loading markdown from ${path}...`);
            const response = await fetch(path);
            if (!response.ok) {
                throw new Error(`Failed to load markdown: ${response.status}`);
            }
            const content = await response.text();
            console.log('Raw markdown content:', content);
            
            const { attributes, body } = this.parseFrontMatter(content);
            console.log('Parsed front matter:', attributes);
            console.log('Markdown body:', body);
            
            const parsedContent = marked.parse(body);
            console.log('Parsed markdown content:', parsedContent);
            
            const targetElement = document.getElementById(targetElementId);
            if (!targetElement) {
                throw new Error(`Target element ${targetElementId} not found`);
            }

            targetElement.innerHTML = parsedContent;
            const currentContent = targetElement.innerHTML;
            
            Object.entries(attributes).forEach(([key, value]) => {
                targetElement.dataset[key] = typeof value === 'object' 
                    ? JSON.stringify(value) 
                    : value.toString();
            });
            
            if (targetElement.innerHTML !== currentContent) {
                console.log('Content was modified, restoring...');
                targetElement.innerHTML = currentContent;
            }
            
            const event = new CustomEvent('markdownLoaded', {
                detail: { 
                    targetId: targetElementId,
                    frontMatter: attributes,
                    path: path,
                    content: currentContent
                }
            });
            document.dispatchEvent(event);
            
            if (targetElement.innerHTML !== currentContent) {
                console.log('Content was modified by event handlers, restoring...');
                targetElement.innerHTML = currentContent;
            }
            
            console.log(`Markdown loaded successfully into ${targetElementId}`, attributes);
            return { success: true, attributes };
        } catch (error) {
            console.error(`Error loading markdown for ${targetElementId}:`, error);
            const targetElement = document.getElementById(targetElementId);
            if (targetElement) {
                targetElement.innerHTML = '<p>Error loading content. Please try again later.</p>';
            }
            return { success: false, error };
        }
    }

    async loadMultiple(configs) {
        const results = await Promise.allSettled(
            configs.map(config => 
                this.loadMarkdown(config.path, config.targetId)
            )
        );
        
        return results.map((result, index) => ({
            path: configs[index].path,
            targetId: configs[index].targetId,
            ...(result.status === 'fulfilled' ? result.value : { success: false, error: result.reason })
        }));
    }
}

document.addEventListener('markdownLoaded', (event) => {
    const { targetId, frontMatter, path, content } = event.detail;
    console.log(`Markdown loaded for ${targetId}:`, frontMatter);
    
    const targetElement = document.getElementById(targetId);
    if (!targetElement) return;

    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = content;
    
    if (frontMatter.title) {
        const titleElement = document.querySelector(`#${targetId}-title`);
        if (titleElement) {
            titleElement.textContent = frontMatter.title;
        }
    }
    
    if (frontMatter.lastModified) {
        const lastModified = new Date(frontMatter.lastModified);
        const dateStr = lastModified.toLocaleDateString();
        const meta = document.createElement('div');
        meta.className = 'markdown-meta';
        meta.innerHTML = `Last updated: ${dateStr}`;
        tempDiv.appendChild(meta);
    }

    targetElement.innerHTML = tempDiv.innerHTML;
});

document.addEventListener('DOMContentLoaded', async () => {
    try {
        console.log('Initializing page...');
        
        const menuToggle = document.querySelector('.menu-toggle');
        const desktopIcons = document.querySelector('.desktop-icons');
        
        if (menuToggle && desktopIcons) {
            menuToggle.addEventListener('click', () => {
                desktopIcons.classList.toggle('active');
                menuToggle.textContent = desktopIcons.classList.contains('active') ? '×' : '⋮';
            });
        }

        const initSequence = async () => {
            const mdLoader = new MarkdownLoader();
            
            const markdownConfigs = [
                { path: './notes/about.md', targetId: 'notes-content' },
                { path: './notes/markdown.md', targetId: 'markdown-docs' }
            ];

            console.log('Loading markdown content...');
            const markdownResults = await mdLoader.loadMultiple(markdownConfigs);
            console.log('Markdown loading complete:', markdownResults);

            console.log('Initializing remaining features...');
            await generateSocialLinks().catch(error => {
                console.error('Error generating social links:', error);
            });

            await loadProjects().catch(error => {
                console.error('Error loading projects:', error);
            });

            updateVisitorCounter();
        };

        await initSequence();

    } catch (error) {
        console.error('Error initializing page:', error);
    }
}); 