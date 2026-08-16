# Personal Portfolio Website

A modern, SEO-friendly portfolio website built with vanilla HTML, CSS, and JavaScript.

## Features

- Responsive design
- SEO optimized
- Fast loading with minimal JavaScript
- Support for images, text, code blocks, and video
- Integrated PDF viewer for resumes and documents
- Lazy loading for images
- Smooth scrolling navigation

## Local Development

To run the website locally:

1. Clone this repository
2. Open the project directory
3. Start a local server:

```bash
# Using Python 3
python3 -m http.server 8000

# Or using Node.js
npx serve
```

4. Visit `http://localhost:8000` in your browser

## Deployment

To deploy to your VPS:

1. Ensure your VPS has a web server installed (nginx recommended)
2. Set up SSL using Let's Encrypt
3. Configure your domain to point to your VPS
4. Upload the files to your web server

### Basic nginx Configuration

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl;
    server_name yourdomain.com www.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    root /var/www/portfolio;
    index index.html;

    location / {
        try_files $uri $uri/ =404;
    }
}
```

## Customization

1. Modify `index.html` to add your content
2. Update styles in `styles/main.css`
3. Add custom JavaScript in `js/main.js`
4. Place your images and media in the `assets/` directory

## Performance Optimization

- Images should be optimized before uploading
- Use modern image formats (WebP) with fallbacks
- Minimize external dependencies
- Use lazy loading for images and videos 
### Viewing PDFs

Open `pdf-viewer.html?file=PATH_TO_PDF` to display PDF documents. The viewer now supports next/previous navigation, zoom, download and print buttons, and a simple search field. Pages are rendered on demand for better performance.
