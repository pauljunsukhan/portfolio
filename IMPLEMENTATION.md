# Implementation Details

## Project Configuration System

### Project JSON Structure
Projects are configured in `config/projects.json` using the following structure:
```json
{
  "projects": [
    {
      "id": "project-id",          // Unique identifier for the project
      "title": "Project Title",    // Display title
      "subtitle": "PROJECT TYPE",  // Project category/type
      "description": "...",        // Brief description
      "specs": [                   // Technical specifications shown as bullet points
        "Tech: Technology Stack",
        "Status: Project Status",
        "Role: Developer Role"
      ],
      "buttons": {                 // Configuration for action buttons
        "preview": "/projects/path",  // Path for preview window
        "link": "/projects/path",     // Direct link to project
        "github": "https://github.com/..." // GitHub repository link
      }
    }
  ]
}
```

### Loading and Rendering
The project windows are dynamically generated when the page loads:
1. `loadProjects()` fetches the configuration from `projects.json`
2. Each project is rendered into a window using `createProjectWindow()`
3. Windows are added to the `.dynamic-projects` container in the DOM
4. Event listeners are initialized through `initializeProjectWindows()`

## Social Links System

### Social JSON Structure
Social links are configured in `config/socials.json`:
```json
{
  "social-id": {
    "icon": "emoji",           // Emoji icon to display
    "label": "Display Name",   // Button label
    "type": "link|dialog",     // Type of interaction
    "url": "https://...",      // For type: "link"
    "value": "content",        // For type: "dialog"
    "dialogContent": "...",    // Optional extra dialog content
    "encrypt": true           // Optional: Base64 encode value to protect from bots
  }
}
```

### Dialog System
For social links of type "dialog":
1. Creates a Mac-style dialog window with:
   - Title bar with close button
   - Content area with optional dialog content
   - Protected content (e.g., email, messaging info)
2. Dialog interactions:
   - Opens on button click
   - Closes via:
     - Close button click
     - Clicking outside the dialog (overlay)
     - Pressing Escape key
3. Multiple dialogs can be created but only one shows at a time
4. Contact Protection:
   - Sensitive information (email, messaging) is Base64 encoded in the config
   - Decoding happens only when dialog is displayed
   - Helps prevent scraping by bots while maintaining usability

## Project Windows

### Preview System
Project previews are handled through:
1. Preview button click triggers:
   - Fetches project's index.html
   - Extracts main window content
   - Displays in preview overlay
2. Error handling:
   - Shows "Coming Soon" for missing/invalid content
   - Maintains consistent UI for errors
3. Preview window controls:
   - Exit button in tab-style design
   - Escape key closes preview
   - Smooth transitions with animations

### Window Interactions
Project windows support:
1. Direct navigation:
   - Clicking window area goes to project page
   - Link button opens in current tab
   - GitHub button opens repository in new tab
2. Preview functionality:
   - Shows project content in overlay
   - Maintains scroll position
   - Preserves original window state

## Initialization Flow

1. DOM Content Loaded triggers:
   ```javascript
   document.addEventListener('DOMContentLoaded', async () => {
       await generateSocialLinks();  // Setup social buttons/dialogs
       updateVisitorCounter();       // Initialize visitor counter
       await loadProjects();         // Load and render projects
   });
   ```

2. Project Loading:
   ```javascript
   async function loadProjects() {
       const data = await fetch('/config/projects.json');
       data.projects.forEach(project => {
           const window = createProjectWindow(project);
           dynamicProjectsGrid.appendChild(window);
       });
       initializeProjectWindows();  // Setup event listeners
   }
   ```

3. Social Links:
   ```javascript
   async function generateSocialLinks() {
       const config = await loadSocialConfig();
       Object.entries(config).forEach(([key, social]) => {
           // Create buttons and dialogs
           // Setup event listeners
       });
   }
   ```

## Error Handling

1. Project Loading:
   - Fallback to under-construction page
   - Graceful error messages
   - Console logging for debugging

2. Social Links:
   - Skip invalid configurations
   - Protected content handling
   - Dialog error states

3. Visitor Counter:
   - Handles missing elements
   - Fallback for invalid counts
   - Error-resistant observer

## Benefits

1. **Maintainability**
   - Configuration-driven content
   - Centralized project management
   - Modular dialog system

2. **User Experience**
   - Consistent interface
   - Smooth transitions
   - Graceful error handling

3. **Development**
   - Easy to add new projects
   - Flexible dialog system
   - Clear initialization flow 

### URL Linkification in Project Specs

The project configuration system supports automatic URL linkification for specs that start with "Link:". This allows project links to be displayed as clickable elements rather than plain text.

Example spec in `projects.json`:
```json
"specs": [
    "Tech: Python, HTML, CSS",
    "Status: Deployed",
    "Link: http://chatroom.kato.cx/"
]
```

The `createProjectWindow` function includes a `linkifySpec` helper that:
1. Detects specs starting with "Link:"
2. Converts the URL portion into an HTML anchor tag
3. Sets `target="_blank"` to open links in a new tab

This maintains a consistent look while making URLs interactive and accessible. 