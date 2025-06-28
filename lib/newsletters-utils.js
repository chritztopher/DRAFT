// Newsletter-specific utilities
// Used in newsletters.html for filter dropdown and card hover effects

// Initialize card hover effects
function initNewsletterCardHoverEffects() {
    const cards = document.querySelectorAll('.newsletter-card');
    
    cards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.classList.add('custom-hover');
        });
        
        card.addEventListener('mouseleave', () => {
            card.classList.remove('custom-hover');
        });
    });
}

// Initialize filter functionality
function initFilterDropdown() {
    const filterDropdown = document.querySelector('.filter-dropdown');
    const newsletterGrid = document.querySelector('.newsletter-grid');
    
    if (!filterDropdown || !newsletterGrid) return;
    
    filterDropdown.addEventListener('change', (e) => {
        const sortType = e.target.value;
        const cards = Array.from(newsletterGrid.querySelectorAll('.newsletter-card'));
        
        // Sort cards based on selection
        cards.sort((a, b) => {
            const dateA = a.querySelector('.card-date')?.textContent.trim();
            const dateB = b.querySelector('.card-date')?.textContent.trim();
            const titleA = a.querySelector('.card-title')?.textContent.trim();
            const titleB = b.querySelector('.card-title')?.textContent.trim();
            
            switch(sortType) {
                case 'recent':
                    return new Date(dateB) - new Date(dateA);
                case 'oldest':
                    return new Date(dateA) - new Date(dateB);
                case 'a-z':
                    return titleA.localeCompare(titleB);
                case 'z-a':
                    return titleB.localeCompare(titleA);
                default:
                    return 0;
            }
        });
        
        // Re-append sorted cards to the grid
        cards.forEach(card => newsletterGrid.appendChild(card));
        
        // Re-initialize hover effects for sorted cards
        initNewsletterCardHoverEffects();
    });
}

// Initialize all newsletter-specific functionality
function initNewsletterUtils() {
    // Initialize newsletter card hover effects
    initNewsletterCardHoverEffects();
    
    // Initialize filter dropdown functionality
    initFilterDropdown();
    
    // Close mobile menu when clicking on a nav item
    const mobileNavItems = document.querySelectorAll('.mobile-nav-item');
    mobileNavItems.forEach(item => {
        item.addEventListener('click', () => {
            const hamburger = document.querySelector('.hamburger-menu');
            const overlay = document.getElementById('mobile-nav');
            
            if (hamburger && overlay) {
                hamburger.classList.remove('active');
                overlay.classList.remove('active');
                document.body.style.overflow = 'auto';
            }
        });
    });
}

// Auto-initialize when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initNewsletterUtils);
} else {
    initNewsletterUtils();
} 