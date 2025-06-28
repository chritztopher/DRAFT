// Mobile menu utility for navigation
// Used in newsletters.html for mobile navigation handling

// Mobile Menu Toggle Function
function toggleMobileMenu() {
    const hamburger = document.querySelector('.hamburger-menu');
    const overlay = document.getElementById('mobile-nav');
    
    hamburger.classList.toggle('active');
    overlay.classList.toggle('active');
    
    // Prevent body scroll when menu is open
    if (overlay.classList.contains('active')) {
        document.body.style.overflow = 'hidden';
    } else {
        document.body.style.overflow = 'auto';
    }
}

// Close mobile menu when clicking on overlay
function closeMobileMenuOnOverlay(event) {
    if (event.target === event.currentTarget) {
        const hamburger = document.querySelector('.hamburger-menu');
        const overlay = document.getElementById('mobile-nav');
        
        hamburger.classList.remove('active');
        overlay.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
}

// Initialize mobile menu functionality
function initMobileMenu() {
    // Add click event listeners if elements exist
    const hamburger = document.querySelector('.hamburger-menu');
    const overlay = document.getElementById('mobile-nav');
    
    if (hamburger) {
        hamburger.addEventListener('click', toggleMobileMenu);
    }
    
    if (overlay) {
        overlay.addEventListener('click', closeMobileMenuOnOverlay);
    }
}

// Auto-initialize when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMobileMenu);
} else {
    initMobileMenu();
}

// Make functions available globally for onclick handlers
window.toggleMobileMenu = toggleMobileMenu;
window.closeMobileMenuOnOverlay = closeMobileMenuOnOverlay; 