# Design System Documentation

## Color Palette
- Primary: #2b2b2b (Dark gray)
- Secondary: #008b8b (Vintage teal)
- Accent: #d4a017 (Mustard yellow)
- Background: #f5e6d3 (Aged paper)
- Window Background: #fff9f0 (Warm white)
- Menu Background: #f5e6d3 (Matches background)
- Border: #2b2b2b (Dark gray)
- Grid: rgba(70, 40, 20, 0.1) (Subtle brown)

### Window Control Colors
- Close/Exit: #ff3b30 (Apple red)
- Close/Exit Border: #c41e3a (Darker red)
- Maximize: #2ea538 (Muted retro Mac green)
- Maximize Border: #1e7a28 (Darker muted green)
- Minimize: #ffbd2e (Yellow)
- Minimize Border: #dea123 (Darker yellow)

## Typography
- Primary Font: "Courier New", monospace
- Menu Font: "Chicago", "Helvetica Neue", sans-serif
- LED Font: "VT323", "Courier New", monospace
- Font Sizes: 
  - Base: 12px
  - Content: 14px
  - Small: 11px (window links, icon labels)
- Line Height: 1.5
- Letter Spacing: 0.05em (normal), 0.1em (headings)

## Layout
- Max Width: 1000px
- Window Margin: 40px
- Content Padding: 2rem
- Grid Gap: 1rem, 2rem (project grid)
- Border Radius: 
  - Windows: 6px 6px 2px 2px
  - Buttons: 3px
  - Action Buttons: 4px

## Desktop Icons Navigation
1. Position & Layout
   - Fixed position on right side
   - Top margin: 40px from top
   - Right margin: 20px from edge
   - Vertical stack with 20px gap
   - Z-index: 1 (above background, below windows)

2. Icon Structure
   - Width: 64px
   - Two-part design: icon image and label
   - Icon image: 32px × 32px
   - Background: var(--menu-bg)
   - Border: 1px solid var(--window-border)

3. Icon Types & Links
   - Home: Links to root page (/), floppy disk icon (💾)
   - Projects: Scrolls to #projects section, folder icon (📁)
   - Notes: Scrolls to #about (Field Notes) section, note icon (📝)
   - Contact: Scrolls to #contact section, envelope icon (✉️)

4. Visual Style
   - No text decoration on links
   - Inherits text color from parent
   - Scale animation on hover (1.05)
   - Cursor: pointer
   - Label background matches menu background
   - Label border matches window border

5. Label Design
   - Font: "Courier New", monospace
   - Font size: 11px
   - Padding: 2px 4px
   - Border: 1px solid var(--window-border)
   - Background: var(--menu-bg)

## Window Components
1. Title Bar
   - Height: 24px
   - Background: var(--menu-bg)
   - Border-bottom: 1px solid var(--window-border)
   - Centered title text
   - Left-aligned control buttons
   - Right-aligned action buttons (Github, etc.)

2. Control Buttons
   - Size: 12px × 12px
   - Border-radius: 50%
   - Border: 1px solid (color varies by type)
   - Line decoration: 8px × 2px, rgba(0, 0, 0, 0.3), opacity 0.5
   - States and Colors:
     - Close: #ff3b30 bg, #c41e3a border, hover #c41e3a
     - Maximize: #2ea538 bg, #1e7a28 border, hover #1e7a28
     - Minimize: #ffbd2e bg, #dea123 border, hover #dea123
   - Consistent "-" symbol across all buttons
   - Line decoration independent of button color

3. Action Buttons
   - Github Link: #2ea538 (Muted retro Mac green)
   - Border: #1e7a28 (Darker muted green)
   - Hover: #1e7a28 (Uses border color)
   - Equal width, flex layout
   - 1px border, 3px border radius
   - White text for contrast
   - Font size: 11px
   - Padding: 2px 6px

4. Content Area
   - Direct content placement
   - Clean typography
   - Engineering-style headings
   - List items with left borders

## Preview Windows
- Fixed position overlay
- Width matches main portfolio window
- Left offset at 46.5%
- Vertical positioning:
  - Top: 8% of viewport height
  - Height: 90% of viewport height
  - Scales with different screen sizes
- Exit button design:
  - Tab-like appearance
  - Apple red (#ff3b30) background
  - Positioned above window
  - Connected to window (no bottom border)
  - Straight corner where it meets window
- Content window:
  - Straight top-left corner (connects with tab)
  - Rounded top-right corner (6px)
  - Slight bottom corners (2px)
  - Inner content scrollable
  - Maintains pointer events

## Dialog System
1. Error Dialog
   - Centered modal
   - Red close button
   - Simple "Oops!" message
   - Matches window styling
   - Appears for missing links

2. Contact Dialogs (Email, Discord, Messaging)
   - Centered modals
   - Protected content (base64 encoded)
   - Selectable text
   - Red close button
   - Consistent styling with windows

## Project Windows
1. Window Structure
   - Title bar with window controls
   - Content area with project details
   - Action buttons at bottom
   - Github link in top-right corner
   - Consistent green styling for action buttons

2. Button Types
   - Preview: Opens project in overlay window
   - Link: Native `<a>` tag for browser context menu
   - Github: External repository link in muted green
   - All buttons maintain Mac-style aesthetics

3. Link Functionality
   - Right-click enabled for context menu
   - Copy URL supported
   - Open in new tab option
   - Native browser interactions preserved

## Visitor Counter
- LED-style display with green text (#32CD32)
- Text glow effect using text-shadow
- 6-digit display with leading zeros
- Monospace font (VT323 with Courier New fallback)
- Subtle border and padding
- Hidden badge for tracking
- JavaScript updates display from badge

## Best Practices
1. Maintain consistent window styling
2. Use proper nesting hierarchy
3. Keep content directly in window content areas
4. Follow classic Macintosh interaction patterns
5. Preserve engineering notebook aesthetics
6. Use appropriate button types for different actions
7. Provide clear feedback for all interactions
8. Ensure content is selectable where appropriate
9. Maintain consistent spacing and alignment
10. Use semantic HTML structure

## Future Considerations
1. Window stacking and z-index management
2. Window resize functionality
3. Menu bar interaction implementation
4. Desktop icon functionality
5. Project page templates
6. Mobile responsiveness
7. Accessibility enhancements
8. Additional dialog types
9. Enhanced animation effects
10. Touch device support 