---
title: Markdown System Documentation
description: Comprehensive guide to using the markdown system in this portfolio
author: Paul Junsuk Han
date: 2024-01-03
tags: [documentation, markdown, implementation, guide]
category: documentation
lastModified: 2024-01-03
visibility: public
---

<!--
SEO Keywords:
markdown implementation, front matter, content management system, static site generator,
documentation system, technical writing, web development, content parsing, markdown features,
syntax highlighting, responsive tables, custom containers
-->

# Markdown System Documentation

This portfolio uses a custom markdown system that allows for flexible content management with features like front matter, SEO optimization, and dynamic loading.

## Table of Contents
- [Core Features](#section-core-features)
- [Content Features](#section-content-features)
- [Implementation Details](#section-implementation-details)
- [Usage Guide](#section-usage-guide)
- [Styling](#section-styling)
- [Advanced Features](#section-advanced-features)
- [Troubleshooting](#section-troubleshooting)

## Core Features

### Front Matter
Every markdown file can include YAML-style front matter at the top:

```markdown
---
title: Your Title
description: Your description
author: Your Name
date: YYYY-MM-DD
tags: [tag1, tag2, tag3]
category: category-name
lastModified: YYYY-MM-DD
visibility: public|private
---
```

Supported front matter types:
- Strings: `title: Your Title`
- Dates: `date: 2024-01-03`
- Arrays: `tags: [item1, item2]`
- Booleans: `visibility: true`
- Numbers: `version: 1`

### SEO Comments
Add hidden SEO content using HTML comments:

```markdown
<!--
SEO Keywords:
keyword1, keyword2, keyword3
-->
```

## Content Features

### Images with Captions
Add images with captions using standard markdown syntax:

```markdown
![Alt text](path/to/image.jpg "Optional caption text")
```

Images are automatically:
- Lazy loaded
- Responsive
- Styled with shadows and borders
- Centered with captions

### Tables
Create responsive tables with automatic styling:

| Feature | Description | Support |
|---------|-------------|----------|
| Tables | Responsive tables | ✅ |
| Images | Lazy loading | ✅ |
| Links | Auto-detection | ✅ |

### Links
The system supports both internal and external links with special styling:

- [Internal link to Projects](#projects)
- [External link to GitHub](https://github.com)

External links automatically:
- Open in new tabs
- Include security attributes
- Show external link indicator
- Have hover effects

### Code Blocks
Syntax highlighted code blocks with language support:

```javascript
const example = {
    feature: "syntax highlighting",
    supported: true
};
```

### Custom Containers
Special blockquote styles for different types of content:

> NOTE: This is a note container

> WARNING: This is a warning container

> TIP: This is a tip container

> This is a default info container

### Linkable Sections
All headers automatically:
- Generate clean URLs
- Show link icon on hover
- Support direct linking
- Use consistent IDs

## Implementation Details

### File Structure
```
/notes/          # General notes and documentation
/blog/           # Blog posts
/projects/       # Project descriptions
/sections/       # Page sections
```

### JavaScript Implementation
The system uses a `MarkdownLoader` class with these key features:

```javascript
const mdLoader = new MarkdownLoader();
const configs = [
    { path: './notes/about.md', targetId: 'notes-content' },
    { path: './blog/post.md', targetId: 'blog-content' }
];
await mdLoader.loadMultiple(configs);
```

### Event System
The system dispatches events when content is loaded:

```javascript
document.addEventListener('markdownLoaded', (event) => {
    const { targetId, frontMatter, path } = event.detail;
    // Handle loaded content
});
```

## Usage Guide

### 1. Create Markdown File
Create a new .md file in the appropriate directory:

```markdown
---
title: Your Content
description: Description
---

Your content here...
```

### 2. Add Container
Add a container in your HTML:

```html
<div id="your-content-id" class="markdown-content"></div>
```

### 3. Configure Loading
Add the configuration to your markdownConfigs:

```javascript
const markdownConfigs = [
    { path: './your/file.md', targetId: 'your-content-id' }
];
```

## Styling

The system includes comprehensive styles for all markdown elements:

```css
/* Base content styles */
.markdown-content {
    font-family: "Courier New", monospace;
    line-height: 1.6;
}

/* Image styles */
.markdown-figure {
    margin: 2rem 0;
    text-align: center;
}

/* Table styles */
.markdown-table {
    width: 100%;
    overflow-x: auto;
}

/* Custom containers */
.markdown-blockquote {
    border-left: 4px solid;
    background: rgba(0, 0, 0, 0.02);
}
```

## Advanced Features

### Table of Contents Generation
Automatically generate table of contents:

```javascript
const toc = mdLoader.generateTOC(markdownContent);
```

### Custom Event Handlers
```javascript
document.addEventListener('markdownLoaded', (event) => {
    if (event.detail.frontMatter.category === 'blog') {
        // Handle blog posts differently
    }
});
```

### Dynamic Loading
```javascript
async function loadContent(path, targetId) {
    await mdLoader.loadMarkdown(path, targetId);
}
```

## Best Practices

1. **Content Organization**
   - Use appropriate directories
   - Follow consistent naming
   - Keep related content together
   - Use front matter for metadata

2. **Performance**
   - Optimize images
   - Use lazy loading
   - Keep markdown files focused
   - Split large content

3. **Accessibility**
   - Use descriptive alt text
   - Maintain heading hierarchy
   - Provide clear link text
   - Test keyboard navigation

4. **SEO**
   - Include relevant keywords
   - Use proper meta tags
   - Structure content well
   - Update lastModified dates

## Troubleshooting

Common issues and solutions:

1. **Content Issues**
   - Check file paths
   - Verify front matter syntax
   - Validate markdown syntax
   - Check container IDs

2. **Styling Problems**
   - Inspect CSS hierarchy
   - Check class names
   - Verify media queries
   - Test responsiveness

3. **Loading Issues**
   - Check console errors
   - Verify file permissions
   - Test file access
   - Check event listeners 