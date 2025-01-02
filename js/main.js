// Smooth scroll for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Simple lazy loading for images
document.addEventListener('DOMContentLoaded', () => {
    const lazyImages = document.querySelectorAll('img[data-src]');
    
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
                observer.unobserve(img);
            }
        });
    });

    lazyImages.forEach(img => imageObserver.observe(img));
});

// Simple form validation
const contactForm = document.querySelector('.contact-form form');
if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        // Add your form submission logic here
        console.log('Form submitted');
    });
} 

// Add overlay to body
const overlay = document.createElement('div');
overlay.className = 'overlay';
document.body.appendChild(overlay);

// Project window functionality
document.addEventListener('DOMContentLoaded', () => {
    const projectWindows = document.querySelectorAll('.project-window');
    const maximizedView = document.querySelector('.maximized-project');
    
    // Handle project window clicks
    projectWindows.forEach(window => {
        window.addEventListener('click', (e) => {
            if (e.target.closest('.maximize-button')) {
                maximizeProject(window);
            }
        });
    });

    // Handle minimize button click
    const minimizeButton = maximizedView.querySelector('.minimize-button');
    minimizeButton.addEventListener('click', minimizeProject);

    // Handle overlay click to minimize
    overlay.addEventListener('click', minimizeProject);
});

function maximizeProject(projectWindow) {
    const maximizedView = document.querySelector('.maximized-project');
    const maximizedContent = maximizedView.querySelector('.content');
    const projectContent = projectWindow.querySelector('.content').cloneNode(true);
    const projectTitle = projectWindow.querySelector('.window-title').textContent;

    // Update maximized view
    maximizedView.querySelector('.window-title').textContent = projectTitle;
    maximizedContent.innerHTML = '';
    maximizedContent.appendChild(projectContent);

    // Show maximized view with animation
    maximizedView.style.display = 'block';
    overlay.classList.add('active');
    setTimeout(() => {
        maximizedView.classList.add('active');
    }, 10);

    // Add classic Mac OS window drag behavior
    const titleBar = maximizedView.querySelector('.window-title-bar');
    let isDragging = false;
    let currentX;
    let currentY;
    let initialX;
    let initialY;
    let xOffset = 0;
    let yOffset = 0;

    titleBar.addEventListener('mousedown', dragStart);
    document.addEventListener('mousemove', drag);
    document.addEventListener('mouseup', dragEnd);

    function dragStart(e) {
        initialX = e.clientX - xOffset;
        initialY = e.clientY - yOffset;

        if (e.target === titleBar) {
            isDragging = true;
        }
    }

    function drag(e) {
        if (isDragging) {
            e.preventDefault();
            currentX = e.clientX - initialX;
            currentY = e.clientY - initialY;
            xOffset = currentX;
            yOffset = currentY;

            setTranslate(currentX, currentY, maximizedView);
        }
    }

    function dragEnd(e) {
        initialX = currentX;
        initialY = currentY;
        isDragging = false;
    }

    function setTranslate(xPos, yPos, el) {
        el.style.transform = `translate(${xPos}px, ${yPos}px)`;
    }
}

function minimizeProject() {
    const maximizedView = document.querySelector('.maximized-project');
    overlay.classList.remove('active');
    maximizedView.classList.remove('active');
    
    // Reset position
    maximizedView.style.transform = 'translate(-50%, -50%)';
    
    setTimeout(() => {
        maximizedView.style.display = 'none';
    }, 300);
} 