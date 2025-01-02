# Portfolio Design Documentation

## Design Philosophy
The portfolio website combines two distinct design languages:
1. Classic Macintosh UI (circa 1984)
2. Vintage Engineering Notebook aesthetic

## Window Hierarchy and Design Pattern

### Main Window
- Serves as the primary container for all content
- Full classic Macintosh window styling:
  - Three window control buttons (left-aligned)
  - Centered window title
  - Light background with black border
  - 6px border radius on top corners, 2px on bottom
  - 3px shadow offset

### Sub-Windows (Projects, Messages)
- Inherit main window's design language
- Consistent styling with parent window:
  - Same border radius (6px top, 2px bottom)
  - Same border color and weight
  - Same title bar height (24px)
  - Same font family (Courier New)
- Differences from main window:
  - Single control button (maximize/minimize)
  - Slightly reduced padding
  - Hover animation (2px upward shift)
  - Enhanced shadow on hover

### Window Components
1. Title Bar
   - Height: 24px
   - Background: var(--menu-bg)
   - Border-bottom: 1px solid var(--window-border)
   - Centered title text
   - Left-aligned control buttons

2. Control Buttons
   - Size: 12px × 12px
   - Border-radius: 50%
   - Border: 1px solid var(--window-border)
   - Special states:
     - Maximize: var(--accent-color) background
     - Minimize: var(--secondary-color) background

3. Content Area
   - Direct content placement (no additional borders)
   - Clean typography with consistent spacing
   - Engineering-style headings with bottom borders
   - List items with left borders in var(--secondary-color)

### Maximized View
- Centered overlay with backdrop blur
- Draggable window behavior
- Smooth transition animations
- Reset position on minimize

## Color Palette
- Primary: #2b2b2b (Text and borders)
- Secondary: #008b8b (Vintage teal accents)
- Accent: #d4a017 (Mustard yellow for interactive elements)
- Background: #f5e6d3 (Aged paper)
- Window Background: #fff9f0 (Warm white)
- Menu Background: #f5e6d3 (Matches main background)

## Typography
- Primary Font: "Courier New", monospace
- Font Sizes:
  - Window Titles: 12px
  - Content: 14px
  - Headings: 1.1-2rem
- Letter Spacing: 0.05em for window elements

## Spacing
- Window Margin: 40px
- Content Padding: 2rem
- Grid Gap: 2rem
- List Item Spacing: 0.5rem

## Best Practices
1. Maintain consistent window styling across all components
2. Use proper nesting hierarchy (main window → sub-windows)
3. Keep content directly in window content areas
4. Follow classic Macintosh interaction patterns
5. Preserve engineering notebook aesthetics in typography and layout

## Future Considerations
1. Window stacking and z-index management
2. Window drag boundaries
3. Window resize functionality
4. Menu bar interaction implementation
5. Desktop icon functionality 