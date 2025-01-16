# Website Architecture

This document outlines the directory structure for our retro Macintosh-themed personal website.

## Directory Structure

```text
website-root/
├── index.html                     # Main landing page (14KB implemented)
│
├── desktop/                       # Each "desktop" is a subfolder for a major category or view
│   ├── projects/                  # "Projects" desktop
│   │   ├── index.html            # Desktop for Projects
│   │   └── cool-tech/            # A dummy project subfolder
│   │       └── index.html        # Actual page for "Cool Tech Project"
│   ├── writing/
│   │   └── index.html            # Desktop for Writing
│   ├── concept-map/
│   │   └── index.html            # (Optional) Concept map/graph view
│   ├── timeline/
│   │   └── index.html            # (Optional) Timeline/What's new view
│   └── social/
│       └── index.html            # Desktop for social links/profiles
│
├── scripts/
│   ├── global.js                 # Global JS features (5.3KB implemented)
│   ├── desktop.js                # Logic for switching between desktops
│   ├── projects.js               # Project windows and previews (12KB implemented)
│   ├── socials.js                # Social links handling (3.3KB implemented)
│   ├── encode_personaldata.js     # Personal data encoding utilities
│   ├── concept-map.js            # (Optional) Dynamic concept map
│   └── timeline.js               # (Optional) Timeline feed
│
├── styles/
│   ├── global.css                # Base styling, retro Mac theme (5.6KB implemented)
│   ├── desktop.css               # Shared desktop styling (1.8KB implemented)
│   ├── projects.css              # Projects desktop styling (13KB implemented)
│   ├── construction.css          # Construction/development styles (31KB)
│   ├── concept-map.css           # (Optional) For concept map
│   └── timeline.css              # (Optional) For timeline
│
├── assets/
│   ├── icons/                    # Retro Mac icons, folder icons, etc.
│   └── images/                   # Shared images, backgrounds, etc.
│
├── config/
│   ├── socials.json              # Social links data
│   └── projects.json             # Projects data
│
├── DESIGN.md                     # Design specifications and guidelines (5.5KB)
├── TODO.md                       # Project tasks and roadmap (9.7KB)
├── seo.md                        # SEO strategy and metadata (2.9KB)
├── robots.txt                    # Search engine crawling rules
├── CNAME                         # Custom domain configuration
└── README.md                     # Documentation and usage notes (1.7KB)
```

## Overview

This architecture follows a modular structure with clear separation of concerns:

1. **Root Level**: Contains the main entry point (`index.html`), documentation, and configuration files
2. **Desktop**: Implements the main content areas as separate "desktops" in true retro Mac style
3. **Assets**: Houses all static resources like icons and images
4. **Scripts**: Contains all JavaScript functionality, separated by feature
   - Core functionality implemented (global.js, projects.js, socials.js)
   - Optional features prepared (concept-map.js, timeline.js)
5. **Styles**: Contains all CSS files, organized by component
   - Main styles implemented (global.css, desktop.css, projects.css)
   - Development styles in construction.css
   - Optional feature styles prepared
6. **Config**: Stores configuration and data files in JSON format
7. **Documentation**: Multiple markdown files for different aspects:
   - DESIGN.md for visual and UX guidelines
   - TODO.md for project planning
   - seo.md for search engine optimization
   - README.md for general documentation 