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

import { createDialog, linkifyText } from './globals.js';

/**
 * Loads project data from JSON and renders the project windows.
 * 
 * @param {string} [pageSpecificConfig] - optional path to a page-specific JSON config
 */
export async function loadProjects(pageSpecificConfig, gridSelector = '.project-grid.dynamic-projects') {
  try {
    // If no page-specific config, fallback to './config/projects.json'
    const configUrl = pageSpecificConfig || './config/projects.json';
    console.log(`Loading projects from ${configUrl} into ${gridSelector} ...`);

    const response = await fetch(configUrl, { cache: 'no-store' });
    if (!response.ok) {
      throw new Error(`Failed to load projects: ${response.status}`);
    }
    const data = await response.json();

    // Merge into the global store used by getProjectUrl
    // (multiple grids on one page share it)
    window.projectsData = {
      projects: [...(window.projectsData?.projects || []), ...data.projects]
    };

    // Check if we have a container
    const dynamicProjectsGrid = document.querySelector(gridSelector);
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
    const dynamicProjectsGrid = document.querySelector(gridSelector);
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
  // Process specs through linkifyText before rendering
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
        ${(project.specs || []).map(spec => `<li>${linkifyText(spec)}</li>`).join('')}
      </ul>
      ${
        project.embed
          ? `<div class="project-embed"><iframe src="${project.embed}" loading="lazy" title="${project.title || 'Project'} — live preview"></iframe></div>`
          : ''
      }
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
  // (only if it lives in the dock's grid — secondary grids collapse in place)
  if (project.defaultMinimized && dockManager) {
    // Small delay to ensure the dock is ready
    setTimeout(() => {
      if (dockManager.projectGrid.contains(windowDiv)) {
        dockManager.addMinimizedWindow(windowDiv);
      }
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
// (docks live in the main projects grid, not in secondary grids like writing)
let dockManager;
document.addEventListener('DOMContentLoaded', () => {
  const projectGrid = document.querySelector('.project-grid.dynamic-projects') ||
                      document.querySelector('.project-grid');
  if (projectGrid) {
    dockManager = new DockManager(projectGrid);
  }
});

/**
 * Toggles the minimize/maximize state of a project window
 */
function toggleMinimize(projectWindow, button) {
  // Only windows in the main projects grid use the dock;
  // windows in other grids (e.g. writing) collapse in place.
  const usesDock = !!(dockManager &&
    (dockManager.projectGrid.contains(projectWindow) || projectWindow.closest('.dock-window')));

  if (projectWindow.classList.contains('minimized')) {
    // Maximize
    projectWindow.classList.remove('minimized');
    button.classList.remove('maximize-button');
    button.classList.add('minimize-button');
    button.setAttribute('aria-label', 'Minimize window');
    if (usesDock) dockManager.removeMinimizedWindow(projectWindow);
  } else {
    // Minimize
    projectWindow.classList.add('minimized');
    button.classList.remove('minimize-button');
    button.classList.add('maximize-button');
    button.setAttribute('aria-label', 'Maximize window');
    if (usesDock) dockManager.addMinimizedWindow(projectWindow);
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
  try {
    const url = getProjectUrl(projectId);
    // If user gave a direct file link (with optional ?query/#hash), use it.
    // Otherwise treat it as a directory and append index.html.
    const urlPath = url.split(/[?#]/)[0];
    const pageUrl = /\.[a-z0-9]+$/i.test(urlPath) ? url : `${url}${url.endsWith('/') ? '' : '/'}index.html`;
    
    // Show preview overlay
    previewWindow.classList.add('active');
    document.body.classList.add('preview-open');

    // Fresh iframe that fills the preview window from the first frame;
    // the previewed page scrolls inside it. No measuring, no resizing.
    previewContent.innerHTML = '';
    const iframe = document.createElement('iframe');
    iframe.className = 'preview-frame';

    // Strip site chrome from same-origin pages once they load
    iframe.onload = () => {
      try {
        const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
        iframeDoc.querySelectorAll('.global-menu-bar, .menu-toggle, .desktop-icons')
          .forEach(el => el.remove());

        const style = iframeDoc.createElement('style');
        style.textContent = `
          html {
            scrollbar-width: none !important;
          }
          html::-webkit-scrollbar,
          body::-webkit-scrollbar {
            display: none !important;
            width: 0 !important;
          }
          body {
            padding-top: 0 !important;
            display: block !important;
            align-items: start !important;
          }
          body::after {
            display: none !important;
          }
          main.mac-window {
            margin: calc(var(--font-size-base, 12px) * 1.4) auto !important;
            width: calc(100% - calc(var(--font-size-base, 12px) * 2.8)) !important;
            max-width: none !important;
          }
          .overlay {
            display: none !important;
          }
        `;
        iframeDoc.head.appendChild(style);
      } catch (err) {
        // Cross-origin pages just render as-is
        console.warn('Preview chrome-strip skipped:', err);
      }
    };

    iframe.src = pageUrl;
    previewContent.appendChild(iframe);
  } catch (error) {
    console.error('Error loading preview:', error);
    throw new Error(`Failed to load preview: ${error.message}`);
  }
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
  // (guarded so repeat init calls for additional grids don't double-bind)
  projectWindows.forEach(win => {
    const previewButton = win.querySelector('.project-button.preview');
    if (previewButton && !previewButton.dataset.bound) {
      previewButton.dataset.bound = 'true';
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

  // Exit/ESC handlers only need to be bound once per page
  if (previewWindow.dataset.bound) return;
  previewWindow.dataset.bound = 'true';

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
