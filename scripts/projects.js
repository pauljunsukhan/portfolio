/**
 * projects.js
 * ----------------------------------
 * Loads "projects" from JSON, creates the retro project windows, 
 * sets up preview logic (inserting scripts/styles), 
 * handles under-construction pages, 
 * and optional maximize/minimize.
 */

import { showDialog, hideDialog } from './global.js';

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

    // Keep track of project IDs so we don’t create duplicates
    const seenIds = new Set();
    data.projects.forEach(project => {
      if (seenIds.has(project.id)) {
        console.warn(`Duplicate project ID found: ${project.id}`);
        return;
      }
      seenIds.add(project.id);

      // Build the “window” element for each project
      const projectWindow = createProjectWindow(project);
      dynamicProjectsGrid.appendChild(projectWindow);
    });

    // Initialize the “preview” and other interactions
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
 * Creates a single retro Mac “window” for the given project data.
 * Returns an HTML element.
 */
function createProjectWindow(project) {
  const windowDiv = document.createElement('div');
  windowDiv.className = 'mac-window project-window loading';
  windowDiv.setAttribute('data-project', project.id);

  // Default button links
  const buttons = project.buttons || {};
  const githubUrl = buttons.github || '#';
  const previewUrl = buttons.preview || '/projects/under-construction';
  const linkUrl = buttons.link || '/projects/under-construction';

  // Build the window’s inner HTML with retro stylings
  windowDiv.innerHTML = `
    <div class="window-title-bar">
      <div class="window-controls">
        <div class="window-button maximize-button"></div>
      </div>
      <div class="window-title">${project.title || 'Untitled Project'}</div>
      ${githubUrl !== '#' ? `<a href="${githubUrl}" class="project-link-button">Github</a>` : ''}
    </div>
    <div class="content">
      <h3>${project.subtitle || ''}</h3>
      <p>${project.description || ''}</p>
      <ul>
        ${(project.specs || []).map(spec => `<li>${linkifySpec(spec)}</li>`).join('')}
      </ul>
      <div class="project-actions">
        <button class="project-button preview" data-project="${project.id}">Preview</button>
        <a href="${linkUrl}" class="project-button link">Link</a>
      </div>
    </div>
  `;

  // Remove the "loading" class after a slight delay to allow CSS transitions
  setTimeout(() => windowDiv.classList.remove('loading'), 100);

  return windowDiv;
}

/**
 * linkifySpec - transforms "Link: http://something" into a clickable link
 */
function linkifySpec(spec) {
  if (!spec) return '';
  if (spec.startsWith('Link:')) {
    const [_, url] = spec.split('Link:');
    const trimmedUrl = url.trim();
    return `Link: <a href="${trimmedUrl}" target="_blank">${trimmedUrl}</a>`;
  }
  return spec;
}

/**
 * Loads and displays project content in the preview window
 */
async function loadProjectPreview(projectId, previewWindow, previewContent) {
  const url = getProjectUrl(projectId);
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

  // Show preview window
  previewWindow.classList.add('active');
  document.body.classList.add('preview-open');

  // Clear and set up content
  previewContent.innerHTML = '';
  setupPreviewContent(fetchUrl, doc, mainWindow, previewContent);
}

/**
 * Sets up the content of the preview window including styles and scripts
 */
function setupPreviewContent(fetchUrl, doc, mainWindow, previewContent) {
  // Set up base URL for relative paths
  const baseUrl = new URL(fetchUrl, window.location.origin).href;
  const baseTag = document.createElement('base');
  baseTag.href = baseUrl.endsWith('/') ? baseUrl : baseUrl.substring(0, baseUrl.lastIndexOf('/') + 1);
  previewContent.appendChild(baseTag);

  // Copy stylesheets
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

  // Copy scripts
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

  // Add the main content
  previewContent.appendChild(mainWindow.cloneNode(true));
}

/**
 * Shows error message in preview window
 */
function showPreviewError(previewWindow, previewContent) {
  previewContent.innerHTML = `
    <div class="error-message">
      <h3>Project Coming Soon</h3>
      <p>This project is currently under development.</p>
    </div>
  `;
  previewWindow.classList.add('active');
  document.body.classList.add('preview-open');
}

/**
 * Initialize preview functionality for project windows
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

  // Preview button click handler
  previewButtons.forEach(button => {
    button.addEventListener('click', async () => {
      const projectId = button.dataset.project;
      try {
        await loadProjectPreview(projectId, previewWindow, previewContent);
      } catch (err) {
        console.error('Error loading project:', err);
        showPreviewError(previewWindow, previewContent);
      }
    });
  });

  // Exit button handler
  exitButton.addEventListener('click', () => {
    previewWindow.classList.remove('active');
    document.body.classList.remove('preview-open');
    setTimeout(() => {
      previewContent.innerHTML = '';
    }, 300);
  });

  // ESC key handler
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && previewWindow.classList.contains('active')) {
      exitButton.click();
    }
  });

  // Window click handler for navigation
  projectWindows.forEach(win => {
    win.addEventListener('click', (e) => {
      if (!e.target.closest('.project-link-button') && 
          !e.target.closest('.project-actions') && 
          !e.target.closest('.window-controls')) {
        const projectId = win.dataset.project;
        const url = getProjectUrl(projectId);
        if (url) window.location.href = url;
      }
    });
  });
}

/**
 * If you have a "maximize" feature
 */
export function maximizeProject(projectWindow) {
  const maximizedView = document.querySelector('.maximized-project');
  if (!maximizedView) return;

  const maximizedContent = maximizedView.querySelector('.content');
  if (!maximizedContent) return;

  const projectContent = projectWindow.querySelector('.content').cloneNode(true);
  const projectTitle = projectWindow.querySelector('.window-title').textContent;

  maximizedView.querySelector('.window-title').textContent = projectTitle;
  maximizedContent.innerHTML = '';
  maximizedContent.appendChild(projectContent);

  maximizedView.style.display = 'block';
  document.querySelector('.overlay').classList.add('active');
  setTimeout(() => {
    maximizedView.classList.add('active');
  }, 10);
}

export function minimizeProject() {
  const maximizedView = document.querySelector('.maximized-project');
  if (!maximizedView) return;

  maximizedView.classList.remove('active');
  document.querySelector('.overlay').classList.remove('active');
  setTimeout(() => {
    maximizedView.style.display = 'none';
  }, 300);
}

/**
 * Helper: build a URL based on project ID.
 * Uses the preview URL from the project data.
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
