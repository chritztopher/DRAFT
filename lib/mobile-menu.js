// Mobile navigation utility
// Handles hamburger menu toggle and overlay interactions

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

// Make functions available globally for onclick handlers
window.toggleMobileMenu = toggleMobileMenu;
window.closeMobileMenuOnOverlay = closeMobileMenuOnOverlay; 