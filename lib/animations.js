// Shared animation utilities for the website
// Used by both index.html and newsletters.html

// Intersection Observer for scroll animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const element = entry.target;
            const delay = element.dataset.delay || 0;
            
            setTimeout(() => {
                element.classList.add('animate');
            }, delay);
            
            // Stop observing once animated
            observer.unobserve(element);
        }
    });
}, observerOptions);

// Initialize scroll animations
function initScrollAnimations() {
    document.addEventListener('DOMContentLoaded', () => {
        const fadeUpElements = document.querySelectorAll('.fade-up-element');
        fadeUpElements.forEach(element => {
            observer.observe(element);
        });
    });
}

// Hero section load animation with 2-second delay
function initHeroAnimations() {
    window.addEventListener('load', () => {
        setTimeout(() => {
            const heroElements = document.querySelectorAll('.hero-fade-element');
            heroElements.forEach((element) => {
                const delay = element.dataset.heroDelay || 0;
                setTimeout(() => {
                    element.classList.add('loaded');
                }, delay);
            });
        }, 2000); // 2-second delay after page load
    });
}

// Initialize all animations
function initAnimations() {
    initScrollAnimations();
    initHeroAnimations();
}

// Auto-initialize if DOM is ready
if (document.readyState === 'loading') {
    initAnimations();
} else {
    // DOM is already loaded
    initScrollAnimations();
} 