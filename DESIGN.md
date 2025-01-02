# Portfolio Website Design Documentation

## Design Philosophy
This website combines two distinct design languages:
1. Classic Macintosh UI (circa 1984)
2. Vintage Engineering Notebook aesthetic (1950s)

The result is a unique hybrid that maintains the usability of the Mac OS while incorporating the charm and technical feel of old engineering documents.

## Color Palette
```css
--primary-color: #2b2b2b;    /* Main text and borders */
--secondary-color: #008b8b;  /* Vintage teal for accents */
--accent-color: #d4a017;     /* Mustard yellow for highlights */
--background-color: #f5e6d3; /* Aged paper background */
--window-bg: #fff9f0;        /* Slightly warmer white for windows */
```

## Typography
- Primary Font: "Courier New", monospace
  - Used for all technical content, headers, and body text
  - Maintains the engineering notebook aesthetic
- System Font: "Chicago", "Helvetica Neue", sans-serif
  - Used sparingly for authentic Mac OS elements
  - Primarily in the menu bar and system elements

## Layout Structure

### Global Elements
1. Menu Bar (Mac OS style)
   - Fixed position at top
   - Contains Apple menu and system items
   - Uses system font for authenticity

2. Desktop Icons
   - Fixed position on right side
   - Represents main navigation sections
   - Styled as classic Mac OS icons

### Window System
All content is contained within Mac-style windows:
```html
<div class="mac-window">
    <div class="window-title-bar">
        <div class="window-controls">
            <div class="window-button"></div>
        </div>
        <div class="window-title">Window Title</div>
    </div>
    <div class="content">
        <!-- Content goes here -->
    </div>
</div>
```

### Engineering Elements
1. Technical Sketches
   ```html
   <div class="technical-sketch">
       <h3>Title</h3>
       <ul class="sketch-list">
           <li>Item</li>
       </ul>
   </div>
   ```

2. Notebook Headers
   ```html
   <div class="notebook-header">
       <div class="date">Date: <span class="typewriter">01.01.2024</span></div>
       <div class="subject">Subject: <span class="typewriter">Title</span></div>
   </div>
   ```

## Grid System
- Background uses engineering paper grid
- 20px x 20px grid size
- Subtle brown lines (rgba(70, 40, 20, 0.1))
- Content follows a responsive grid system

## Interactive Elements

### Buttons
- Styled as vintage form elements
- 2px borders for depth
- Uppercase text with letter-spacing
- Hover effects change background color

### Forms
- Input fields styled with monospace font
- Simple borders matching window style
- Labels use technical annotation style

## Adding New Content

### New Sections
1. Create a new Mac window container
2. Add appropriate window controls
3. Use notebook header if it's a main section
4. Follow the grid system for layout

### New Features
1. Maintain the hybrid aesthetic
2. Use technical sketch containers for grouped content
3. Keep to the color palette
4. Prefer monospace fonts for content

## Best Practices
1. Always wrap main content in mac-window containers
2. Use technical-sketch for important information grouping
3. Maintain the grid alignment where possible
4. Keep the vintage engineering aesthetic in content presentation
5. Use uppercase for headers and important labels
6. Maintain proper spacing (--spacing: 2rem)

## File Structure
```
portfolio/
├── index.html          # Main entry point
├── styles/
│   └── main.css       # All styles consolidated
├── js/
│   └── main.js        # Minimal JavaScript for interactions
└── assets/            # Images and media
```

## Future Considerations
1. Keep animations minimal and purposeful
2. Maintain accessibility despite the retro aesthetic
3. Consider adding more engineering notebook elements like:
   - Margin annotations
   - Technical diagrams
   - Graph paper overlays
   - Calculation sections

## Development Guidelines
1. Mobile-first approach despite desktop aesthetic
2. Maintain semantic HTML structure
3. Keep JavaScript minimal and unobtrusive
4. Use CSS custom properties for consistency
5. Comment new sections clearly 