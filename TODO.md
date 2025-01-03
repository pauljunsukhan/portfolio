# TODO: Combine the Entire Site into One PDF

Below is a suggested approach for gathering all pages from your site into a single PDF document. This involves generating a combined HTML (containing the content of each page) and then converting that HTML into a PDF.

---

## 1. List Your Pages
Create an array of URLs that represent every page of your site you want to include:

• Home page (e.g., https://yoursite.com/)  
• Project pages (e.g., https://yoursite.com/projects/neural-network/)  
• Any extra or hidden pages

---

## 2. Write a Node Script to Fetch and Concatenate HTML
Use Node.js to fetch each page’s HTML, strip out redundant headers/footers, and combine them into one large HTML file (combined.html).

Example (no line numbers):
javascript
const fetch = require('node-fetch');
const fs = require('fs');
async function combinePages(urls) {
let combinedContent = '<!DOCTYPE html><html><head><meta charset="UTF-8"><title>All Pages</title></head><body>';
for (const url of urls) {
try {
const response = await fetch(url);
if (!response.ok) {
console.error(Failed to fetch ${url});
continue;
}
const text = await response.text();
// Optionally strip out <head> or repeated nav/footers
// Then append textual or <main> content to combinedContent
combinedContent += <section style="page-break-after: always;">${text}</section>;
} catch (err) {
console.error(Error loading ${url}: ${err.message});
}
}
combinedContent += '</body></html>';
fs.writeFileSync('combined.html', combinedContent, 'utf8');
console.log('Generated combined.html');
}
combinePages([
'https://yoursite.com/',
'https://yoursite.com/projects/neural-network/',
'https://yoursite.com/projects/quantum-circuit/',
// Add more pages as needed
]);


When you run this script (for example node combine.js), you get combined.html that contains all pages back-to-back.  

---

## 3. Convert the Combined HTML to PDF
Use a tool like wkhtmltopdf or a Node library like Puppeteer:

• wkhtmltopdf approach (command-line):  
  » wkhtmltopdf combined.html combined.pdf  

• Puppeteer approach (programmatic in Node):
avascript
const puppeteer = require('puppeteer');
const fs = require('fs');
(async () => {
const browser = await puppeteer.launch();
const page = await browser.newPage();
// Load our local combined.html file
const htmlFilePath = file://${__dirname}/combined.html;
await page.goto(htmlFilePath, { waitUntil: 'networkidle0' });
await page.pdf({
path: 'combined.pdf',
format: 'A4',
printBackground: true,
});
await browser.close();
console.log('combined.pdf generated!');
})();


In either case, you end up with a single PDF containing all your site’s pages.

---

## 4. (Optional) Apply Custom Styles for Print
You can create a dedicated print stylesheet (print.css) if you want:
css
@media print {
body {
font-family: sans-serif;
}
nav, footer, .header, .social-links {
display: none; / Hide extraneous elements /
}
section {
page-break-after: always;
}
}

Ensure you reference this stylesheet in combined.html (or inline in your original pages) so that the final PDF looks neat.

---

## 5. Final Check
1. Confirm that combined.html is generated without errors.  
2. Verify each page’s content is present in the PDF.  
3. Adjust layout (page size, margins, etc.) for a clean, readable final document.

Once complete, you have a single PDF containing all pages of your site, perfect for archival, offline reading, or printing.  



---

## 2. Generate Each Project Page from Markdown with Front Matter

You can also compile each project’s page from Markdown files (with front matter) to HTML, then integrate this output into your existing static site structure. The process goes like this:

1. Write Markdown Files with Front Matter

Create a directory (e.g., /content/projects) and store files with YAML front matter at the top, followed by the project’s Markdown. For example:


markdown
---
title: Neural Network Visualizer
id: neural-network
subtitle: RESEARCH & DEVELOPMENT
description: >
Interactive visualization tool for neural network architectures. Built with WebGL and React.
specs:
Tech: WebGL, React, TypeScript
Status: Production
Role: Lead Developer
buttons:
preview: "/projects/neural-network"
link: "/projects/neural-network"
github: "https://github.com/pauljunsukhan/neural-network"
---
Introduction
This project focuses on visualizing neural networks in real time...



2. Parse and Convert to HTML

Use a Node script that:  
• Reads each Markdown file.  
• Extracts front matter (YAML) via a library (e.g. gray-matter).  
• Converts the Markdown body to HTML (e.g. using marked or markdown-it).  

Example (without line numbers):
javascript
const fs = require('fs');
const path = require('path');
const matter = require('gray-matter'); // npm install gray-matter
const { marked } = require('marked'); // or another markdown library
function compileProjectMarkdown(mdPath) {
const rawContent = fs.readFileSync(mdPath, 'utf8');
const parsed = matter(rawContent); // parsed.data (front matter), parsed.content (MD)
const frontMatter = parsed.data;
const htmlBody = marked(parsed.content);
return { frontMatter, htmlBody };
}
// Example usage
const dir = path.join(dirname, 'content', 'projects');
const files = fs.readdirSync(dir).filter(file => file.endsWith('.md'));
files.forEach(file => {
const filePath = path.join(dir, file);
const { frontMatter, htmlBody } = compileProjectMarkdown(filePath);
// Insert it into your existing HTML "template"
const resultHtml = <main class="mac-window"> <div class="window-title-bar"> <div class="window-controls"> <div class="window-button maximize-button"></div> </div> <div class="window-title">${frontMatter.title}</div> <a href="${frontMatter.buttons.github}" class="project-link-button">Github</a> </div> <div class="content"> <h3>${frontMatter.subtitle}</h3> ${htmlBody} </div> </main> ;
// Now write the resultHtml to a static file in /projects/${frontMatter.id}/index.html
const outDir = path.join(dirname, 'projects', frontMatter.id);
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, 'index.html'), resultHtml, 'utf8');
});


3. Use the Generated Static HTML in Your Site

After running the script, you’ll have a compiled index.html for each project. Your existing code for the preview window, overlay, etc. will work as is—because each project folder now contains a fully formed index.html matching your site’s structure.

4. Adapt Your Existing Workflows

• You can integrate this into your build process or a simple pre-deploy step.  
• If needed, you can also generate the JSON used in /config/projects.json from the front matter—ensuring you have a single source of truth for each project’s data.

By following these steps, you can maintain each project’s content in Markdown (with front matter), then compile to HTML and seamlessly integrate the results into your static site. This lets you keep your writing workflow in Markdown while preserving your existing HTML styling and JavaScript functionality.

## 6. Optimization Section

Below are some additional ideas for honing your current site and build approach:

1. Consolidate or Remove Unnecessary Preloads  
   Remove or properly handle any “preload” link references that might cause multiple CSS downloads. For performance, you can use the common “onload” trick:
   ```html
   <link
     rel="preload"
     href="styles/main.css"
     as="style"
     onload="this.onload=null;this.rel='stylesheet'"
   >
   <noscript>
     <link rel="stylesheet" href="styles/main.css">
   </noscript>
   ```
   Or just rely on a single standard stylesheet link.

2. Accessibility and Viewport  
   Consider omitting “maximum-scale=1.0” in your viewport meta, allowing users to zoom on mobile devices for better accessibility:
   ```html
   <meta name="viewport" content="width=device-width, initial-scale=1.0">
   ```

3. Minify and Bundle  
   Minify your JavaScript files (and CSS if needed) as part of your build or pre-deploy step. This can reduce load times, especially if the site grows.

4. Check DOM Queries and Elements  
   If you have references to a “contactForm” or other selectors that do not exist in certain pages, guard them appropriately or remove unused code. This helps avoid potential console errors and keeps your code lean.

5. Printer-Ready CSS Enhancements  
   If you anticipate printing or PDF exports, consider a dedicated @media print stylesheet. Hide unneeded items like nav menus and large visuals, ensuring a clean print design.

6. Local Caches and CDNs  
   Use local caching or a CDN for static files (images, CSS, JS). This can help with load times and reliability.

These optimization ideas can be gradually integrated into your current workflow, ensuring a balanced approach to performance, user-experience, and ease of maintenance.

index.html...
2. Repeated “Global Menu Bar” & Desktop Icons
The same “global-menu-bar” and “desktop-icons” sections appear on other pages (like under “construction” or “neural-network”). As your site grows, consider turning these repeated snippets into partial includes, a templating system, or an importable component. This keeps things DRY (Don’t Repeat Yourself) and makes updates easier in one central place.


8. Code Repetition / Templating
You might notice the same structure (DOCTYPE, <html>, <head>, etc.) replicated in multiple HTML files. A static-site generator (e.g., Eleventy, Astro, or even your own build scripts) can help unify repeated elements (header, footer, menu) and reduce duplication. This leads to:
Easier maintenance (change once, update everywhere).
Clear separation of layout vs. content.


Additional SEO Tasks:
Create a sitemap.xml file
Create a robots.txt file
Set up Google Search Console
Implement breadcrumbs navigation
Consider adding a blog section for content SEO
Optimize image file names and add more descriptive alt text