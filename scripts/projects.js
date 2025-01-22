/**
 * projects.js
 * ----------------------------------
 * Loads "projects" from JSON, creates the retro project windows,
 * sets up preview logic (fetching remote HTML, injecting scripts/styles),
 * handles under-construction pages, docking/minimizing windows,
 * and optional maximize/minimize.
 *
 * Relies on the site-wide auto-linkify system in globals.js:
 *   - The .auto-linkify class + initAutoLinkify() process text like
 *     "Link: https://example.com Label: MyLink" => <a href="...">MyLink</a>
 */

import { createDialog } from './globals.js';

/**
 * Loads project data from JSON and renders the project windows.
 * 
 * @param {string} [pageSpecificConfig] - optional path to a page-specific JSON config
 */
export async function loadProjects(pageSpecificConfig) {
  try {
    // If no page-specific config, fallback to './config/projects.json'
    const configUrl = pageSpecificConfig || './config/projects.json';
    console.log(`Loading projects from ${configUrl} ...`);

    const response = await fetch(configUrl, { cache: 'no-store' });
    if (!response.ok) {
      throw new Error(`Failed to load projects: ${response.status}`);
    }
    const data = await response.json();

    // Store the data globally for use in getProjectUrl
    window.projectsData = data;

    // Check if we have a container
    const dynamicProjectsGrid = document.querySelector('.project-grid.dynamic-projects');
    if (!dynamicProjectsGrid) {
      // Not all pages will have a .dynamic-projects container
      console.log('No .project-grid.dynamic-projects found; skipping project rendering.');
      return;
    }

    dynamicProjectsGrid.innerHTML = '';

    // Keep track of project IDs so we don't create duplicates
    const seenIds = new Set();
    data.projects.forEach(project => {
      if (seenIds.has(project.id)) {
        console.warn(`Duplicate project ID found: ${project.id}`);
        return;
      }
      seenIds.add(project.id);

      // Build the "window" element for each project
      const projectWindow = createProjectWindow(project);
      dynamicProjectsGrid.appendChild(projectWindow);
    });

    // Initialize the "preview" and other interactions
    initializeProjectWindows();
    console.log('Projects loaded successfully');
  } catch (error) {
    console.error('Error loading projects:', error);
    // Show an error message in the container, if it exists
    const dynamicProjectsGrid = document.querySelector('.project-grid.dynamic-projects');
    if (dynamicProjectsGrid) {
      dynamicProjectsGrid.innerHTML = `
        <div class="error-message">
          <h3>Error Loading Projects</h3>
          <p>Please try refreshing the page.</p>
        </div>
      `;
    }
  }
}

/**
 * Creates a single retro Mac "window" for the given project data.
 * Returns an HTML element.
 *
 * Specs are wrapped in <ul class="auto-linkify"> so that your "Link:" text
 * is converted automatically by initAutoLinkify() from globals.js.
 */
function createProjectWindow(project) {
  const windowDiv = document.createElement('div');
  windowDiv.className = 'mac-window project-window loading';
  if (project.defaultMinimized) {
    windowDiv.classList.add('minimized');
  }
  windowDiv.setAttribute('data-project', project.id);

  // Default button links
  const buttons = project.buttons || {};
  const githubUrl = buttons.github || '#';
  const previewUrl = buttons.preview || '/projects/under-construction';
  const linkUrl = buttons.link || '/projects/under-construction';
  const githubText = buttons.githubText || 'Github'; // allow custom text for the GitHub button

  // Build the window's inner HTML with retro stylings
  // Mark the <ul> with .auto-linkify to let the global linkify function process specs.
  windowDiv.innerHTML = `
    <div class="window-title-bar">
      <div class="window-controls">
        <button class="window-button ${project.defaultMinimized ? 'maximize-button' : 'minimize-button'}" 
                aria-label="${project.defaultMinimized ? 'Maximize window' : 'Minimize window'}"></button>
        <button class="window-button quick-link-button" 
                aria-label="Quick link to project"
                data-link="${linkUrl}"></button>
      </div>
      <div class="window-title">${project.title || 'Untitled Project'}</div>
      ${
        githubUrl !== '#'
          ? `<a href="${githubUrl}" class="project-link-button">${githubText}</a>`
          : ''
      }
    </div>
    <div class="content">
      <h3>${project.subtitle || ''}</h3>
      <p>${project.description || ''}</p>
      <ul class="auto-linkify">
        ${(project.specs || []).map(spec => `<li>${spec}</li>`).join('')}
      </ul>
      <div class="project-actions">
        <button class="project-button preview" data-project="${project.id}">Preview</button>
        <a href="${linkUrl}" class="project-button link">Link</a>
      </div>
    </div>
  `;

  // Add minimize/maximize functionality
  const minMaxButton = windowDiv.querySelector('.window-button:first-child');
  minMaxButton.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleMinimize(windowDiv, minMaxButton);
  });

  // Add quick link functionality
  const quickLinkButton = windowDiv.querySelector('.window-button.quick-link-button');
  quickLinkButton.addEventListener('click', (e) => {
    e.stopPropagation();
    const linkUrl = quickLinkButton.getAttribute('data-link');
    if (linkUrl && linkUrl !== '#') {
      window.location.href = linkUrl;
    }
  });

  // If window is minimized by default, add it to the dock
  if (project.defaultMinimized && dockManager) {
    // Small delay to ensure the dock is ready
    setTimeout(() => {
      dockManager.addMinimizedWindow(windowDiv);
    }, 100);
  }

  // Remove the "loading" class after a slight delay to allow CSS transitions
  setTimeout(() => windowDiv.classList.remove('loading'), 100);

  return windowDiv;
}

/**
 * Manages dock windows for minimized project windows
 */
class DockManager {
  constructor(projectGrid) {
    this.projectGrid = projectGrid;
    this.docks = [];
    this.windowsPerDock = 4;
    this.originalPositions = new Map(); // Store original positions
  }

  addMinimizedWindow(window) {
    // Store original position if not already stored
    if (!this.originalPositions.has(window)) {
      const siblings = Array.from(this.projectGrid.children);
      const position = siblings.indexOf(window);
      this.originalPositions.set(window, position);
    }

    let targetDock = this.findAvailableDock() || this.createNewDock();
    targetDock.querySelector('.dock-content').appendChild(window);
    this.updateDockTitles();
    this.moveDocksToEnd();
  }

  removeMinimizedWindow(window) {
    const dock = window.closest('.dock-window');
    if (!dock) return;

    // Store original position but don't use it for placement
    const originalPosition = this.originalPositions.get(window);
    this.originalPositions.delete(window);

    // Find the first minimized window in the project grid, if any
    const projectGrid = this.projectGrid;
    const minimizedWindows = Array.from(projectGrid.children).filter(
      el => el.classList.contains('dock-window')
    );
    
    if (minimizedWindows.length > 0) {
      // Insert before the first minimized window
      projectGrid.insertBefore(window, minimizedWindows[0]);
    } else {
      // If no minimized windows, append to the end
      projectGrid.appendChild(window);
    }

    // Check if dock is empty
    const dockContent = dock.querySelector('.dock-content');
    if (!dockContent.children.length) {
      dock.remove();
      this.docks = this.docks.filter(d => d !== dock);
    }

    this.updateDockTitles();
    this.moveDocksToEnd();
  }

  moveDocksToEnd() {
    // Move all dock windows to the end of the grid
    this.docks.forEach(dock => {
      this.projectGrid.appendChild(dock);
    });
  }

  findAvailableDock() {
    return this.docks.find(
      dock => dock.querySelector('.dock-content').children.length < this.windowsPerDock
    );
  }

  createNewDock() {
    const dock = document.createElement('div');
    dock.className = 'mac-window dock-window';
    dock.innerHTML = `
      <div class="window-title-bar">
        <div class="window-controls">
          <button class="window-button maximize-button" aria-label="Maximize all windows"></button>
        </div>
        <div class="window-title">Minimized Windows</div>
      </div>
      <div class="dock-content"></div>
    `;

    // Optionally add a "maximize all" feature
    const maximizeBtn = dock.querySelector('.window-button.maximize-button');
    if (maximizeBtn) {
      maximizeBtn.addEventListener('click', () => this.maximizeAllInDock(dock));
    }

    this.docks.push(dock);
    this.projectGrid.appendChild(dock);
    this.updateDockTitles();
    return dock;
  }

  maximizeAllInDock(dock) {
    try {
      console.log('Maximizing all windows in dock');
      const minimizedWindows = Array.from(dock.querySelectorAll('.project-window.minimized'));
      if (!minimizedWindows.length) {
        console.log('No minimized windows found in dock');
        return;
      }

      minimizedWindows.forEach((window, i) => {
        // Emulate a click on the "maximize" button
        const maxBtn = window.querySelector('.window-button.maximize-button');
        if (maxBtn) {
          maxBtn.click();
        }
      });

      // If that empties the dock, remove the dock
      const dockContent = dock.querySelector('.dock-content');
      if (!dockContent.children.length) {
        dock.remove();
        this.docks = this.docks.filter(d => d !== dock);
        this.updateDockTitles();
      }
    } catch (error) {
      console.error('Error maximizing all in dock:', error);
    }
  }

  updateDockTitles() {
    this.docks.forEach((dock, index) => {
      const title = dock.querySelector('.window-title');
      const count = dock.querySelector('.dock-content').children.length;
      title.textContent = `Minimized Windows (${index + 1}/${this.docks.length})`;
    });
  }
}

// Initialize dock manager after DOM is loaded
let dockManager;
document.addEventListener('DOMContentLoaded', () => {
  const projectGrid = document.querySelector('.project-grid');
  if (projectGrid) {
    dockManager = new DockManager(projectGrid);
  }
});

/**
 * Toggles the minimize/maximize state of a project window
 */
function toggleMinimize(projectWindow, button) {
  if (projectWindow.classList.contains('minimized')) {
    // Maximize
    projectWindow.classList.remove('minimized');
    button.classList.remove('maximize-button');
    button.classList.add('minimize-button');
    button.setAttribute('aria-label', 'Minimize window');
    dockManager.removeMinimizedWindow(projectWindow);
  } else {
    // Minimize
    projectWindow.classList.add('minimized');
    button.classList.remove('minimize-button');
    button.classList.add('maximize-button');
    button.setAttribute('aria-label', 'Maximize window');
    dockManager.addMinimizedWindow(projectWindow);
  }
}

/**
 * Helper: build a URL based on project ID.
 * Uses the preview URL from the project data, if available.
 */
function getProjectUrl(projectId) {
  console.log('Getting URL for project:', projectId);
  const projectWindow = document.querySelector(`.project-window[data-project="${projectId}"]`);
  if (!projectWindow) {
    console.log('No project window found, using fallback');
    return '/desktop/infra/under-construction';
  }

  const projectData = window.projectsData?.projects?.find(p => p.id === projectId);
  console.log('Found project data:', projectData);

  if (projectData?.buttons?.preview) {
    console.log('Using preview URL from project data:', projectData.buttons.preview);
    return projectData.buttons.preview;
  }

  console.log('No preview URL found, using fallback');
  return '/desktop/infra/under-construction';
}

/**
 * Loads and displays remote project content in the preview window
 */
async function loadProjectPreview(projectId, previewWindow, previewContent) {
  const url = getProjectUrl(projectId);
  // If user gave a direct .html link, use it. Otherwise, append index.html
  const fetchUrl = url.endsWith('.html') ? url : `${url}${url.endsWith('/') ? '' : '/'}index.html`;

  const response = await fetch(fetchUrl, {
    cache: 'no-store',
    headers: { 'Cache-Control': 'no-cache', 'Pragma': 'no-cache' }
  });

  if (!response.ok) {
    throw new Error(`Project content not found: ${response.status}`);
  }

  const content = await response.text();
  const doc = new DOMParser().parseFromString(content, 'text/html');
  const mainWindow = doc.querySelector('main.mac-window');

  if (!mainWindow) {
    throw new Error('Invalid project content structure (no <main.mac-window>)');
  }

  // Show preview overlay
  previewWindow.classList.add('active');
  document.body.classList.add('preview-open');

  // Clear old preview content
  previewContent.innerHTML = '';

  // Re-inject remote page content (styles, scripts, main window)
  setupPreviewContent(fetchUrl, doc, mainWindow, previewContent);
}

/**
 * Sets up the content of the preview window, including injecting base href, styles, scripts, etc.
 */
function setupPreviewContent(fetchUrl, doc, mainWindow, previewContent) {
  // 1) Base tag for correct relative paths
  const baseUrl = new URL(fetchUrl, window.location.origin).href;
  const baseTag = document.createElement('base');
  baseTag.href = baseUrl.endsWith('/')
    ? baseUrl
    : baseUrl.substring(0, baseUrl.lastIndexOf('/') + 1);
  previewContent.appendChild(baseTag);

  // 2) Copy over <link rel="stylesheet" ... >
  doc.querySelectorAll('link[rel="stylesheet"]').forEach(styleLink => {
    if (!styleLink.href) return;
    const newLink = document.createElement('link');
    newLink.rel = 'stylesheet';
    try {
      const absoluteUrl = new URL(styleLink.href, baseUrl);
      newLink.href = absoluteUrl.href;
      previewContent.appendChild(newLink);
    } catch (e) {
      console.warn('Invalid stylesheet URL:', styleLink.href);
    }
  });

  // 3) Copy <script> tags
  doc.querySelectorAll('script').forEach(script => {
    const newScript = document.createElement('script');
    if (script.src) {
      try {
        const absoluteUrl = new URL(script.src, baseUrl);
        newScript.src = absoluteUrl.href;
      } catch (e) {
        console.warn('Invalid script URL:', script.src);
        return;
      }
    }
    newScript.textContent = script.textContent;
    previewContent.appendChild(newScript);
  });

  // 4) Finally, clone the <main.mac-window> content
  previewContent.appendChild(mainWindow.cloneNode(true));
}

/**
 * Initialize "preview" functionality for project windows
 */
function initializeProjectWindows() {
  const projectWindows = document.querySelectorAll('.project-window');
  const previewButtons = document.querySelectorAll('.project-button.preview');
  const previewWindow = document.querySelector('.project-preview');
  const exitButton = previewWindow?.querySelector('.exit-button');
  const previewContent = previewWindow?.querySelector('.preview-content');

  if (!previewWindow || !exitButton || !previewContent) {
    console.warn('Project preview elements not found. Preview feature disabled.');
    return;
  }

  // Preview button: fetch remote page, load content, show overlay
  projectWindows.forEach(win => {
    const previewButton = win.querySelector('.project-button.preview');
    if (previewButton) {
      previewButton.addEventListener('click', async () => {
        try {
          await loadProjectPreview(
            previewButton.dataset.project,
            previewWindow,
            previewContent
          );
        } catch (error) {
          // On any error, show a dialog
          createDialog({
            title: 'Preview Error',
            content: `This project preview is not available yet. (${error.message})`,
            onClose: () => {
              // Hide the overlay if the user closes the error dialog
              previewWindow.classList.remove('active');
              document.body.classList.remove('preview-open');
              previewContent.innerHTML = '';
            },
          });
        }
      });
    }
  });

  // Exit button -> hide overlay
  exitButton.addEventListener('click', () => {
    previewWindow.classList.remove('active');
    document.body.classList.remove('preview-open');
    previewContent.innerHTML = '';
  });

  // ESC key to close preview
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && previewWindow.classList.contains('active')) {
      exitButton.click();
    }
  });
}
