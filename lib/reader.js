/**
 * Newsletter Reader JavaScript
 * Handles dynamic loading and display of newsletter content from JSON files
 */

class NewsletterReader {
    constructor() {
        this.currentNewsletter = null;
        this.allNewsletters = [];
        this.init();
    }

    init() {
        // Get newsletter ID from URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const newsletterId = urlParams.get('id');

        if (!newsletterId) {
            this.showError('No newsletter ID specified');
            return;
        }

        // Load the newsletter
        this.loadNewsletter(newsletterId);
        
        // Setup event listeners
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Next button handlers
        const nextButton = document.getElementById('next-button');
        const footerNextButton = document.getElementById('footer-next-button');
        
        // Previous button handler
        const footerPrevButton = document.getElementById('footer-prev-button');

        if (nextButton) {
            nextButton.addEventListener('click', () => this.loadNextNewsletter());
        }

        if (footerNextButton) {
            footerNextButton.addEventListener('click', () => this.loadNextNewsletter());
        }
        
        if (footerPrevButton) {
            footerPrevButton.addEventListener('click', () => this.loadPreviousNewsletter());
        }
    }

    async loadNewsletter(id) {
        try {

            
            // Show loading state
            this.showLoading();

            // Fetch the newsletter JSON
            const response = await fetch(`newsletter-data/${id}.json`);
            
            if (!response.ok) {
                throw new Error(`Newsletter not found: ${response.status}`);
            }

            const newsletter = await response.json();
            this.currentNewsletter = newsletter;

            // Display the newsletter
            this.displayNewsletter(newsletter);

            // Load all newsletters for navigation
            await this.loadAllNewsletters();

            // Setup navigation
            this.setupNavigation();

        } catch (error) {
            this.showError('Failed to load newsletter');
        }
    }

    async loadAllNewsletters() {
        try {
            // Try to load a newsletter index file, or fall back to known newsletters
            const knownNewsletters = [
                '2025-06-21',
                '2025-06-14', 
                '2025-06-07',
                '2025-05-31',
                '2025-05-24',
                '2025-05-17'
            ];

            this.allNewsletters = [];

            // Load metadata for all newsletters
            for (const id of knownNewsletters) {
                try {
                    const response = await fetch(`newsletter-data/${id}.json`);
                    if (response.ok) {
                        const newsletter = await response.json();
                        this.allNewsletters.push(newsletter);
                    }
                } catch (error) {
                    // Silent error handling for missing newsletters
                }
            }

            // Sort by date (newest first)
            this.allNewsletters.sort((a, b) => new Date(b.date) - new Date(a.date));

        } catch (error) {
            // Silent error handling for newsletter list
        }
    }

    displayNewsletter(newsletter) {
        // Hide loading state and show content
        this.hideLoading();
        this.showContent();

        // Update page title
        document.title = `${newsletter.title} - DRAFT`;

        // Setup typewriter animation with newsletter title
        this.setupTypewriterTitle(newsletter.title);

        // Update highlight text
        const highlightElement = document.getElementById('newsletter-highlight');
        if (highlightElement && newsletter.highlight) {
            highlightElement.textContent = newsletter.highlight;
        }

        // Populate content
        document.getElementById('article-date').textContent = this.formatDate(newsletter.date);
        document.getElementById('article-content').innerHTML = newsletter.body;

        // Handle featured image
        const imageElement = document.getElementById('article-image');
        if (newsletter.previewImage) {
            imageElement.style.backgroundImage = `url(${newsletter.previewImage})`;
        } else {
            // Keep placeholder gray background
            imageElement.style.backgroundImage = 'none';
        }


    }

    setupTypewriterTitle(title) {
        // Reset any existing animations
        this.resetTypewriterAnimation();

        // Split title into two logical parts
        const titleParts = this.splitTitle(title);
        
        // Set the text content
        document.getElementById('title-line1').textContent = titleParts.line1;
        document.getElementById('title-line2').textContent = titleParts.line2;

        // Trigger the typewriter animation
        setTimeout(() => {
            const line1 = document.getElementById('title-line1');
            const line2 = document.getElementById('title-line2');
            
            // Add animation classes
            line1.style.animation = 'typewriter1 1s steps(40, end) 0.2s forwards';
            line2.style.animation = 'typewriter2 0.8s steps(20, end) 1.3s forwards';
        }, 100);
    }

    splitTitle(title) {
        // Smart title splitting logic
        const words = title.split(' ');
        const totalLength = title.length;
        
        if (words.length <= 2) {
            // Very short titles - put all on first line
            return {
                line1: title,
                line2: ''
            };
        }
        
        // Find a good split point (around middle, but at word boundary)
        let bestSplit = 0;
        const targetLength = totalLength / 2;
        let currentLength = 0;
        
        for (let i = 0; i < words.length - 1; i++) {
            currentLength += words[i].length + 1; // +1 for space
            if (Math.abs(currentLength - targetLength) < Math.abs((currentLength - words[i].length - 1) - targetLength)) {
                bestSplit = i + 1;
            }
        }
        
        // Ensure we don't have an empty second line
        if (bestSplit >= words.length - 1) {
            bestSplit = Math.max(1, words.length - 2);
        }
        
        return {
            line1: words.slice(0, bestSplit).join(' '),
            line2: words.slice(bestSplit).join(' ')
        };
    }

    resetTypewriterAnimation() {
        const line1 = document.getElementById('title-line1');
        const line2 = document.getElementById('title-line2');
        
        if (line1) {
            line1.style.animation = 'none';
            line1.style.width = '0';
        }
        if (line2) {
            line2.style.animation = 'none';
            line2.style.width = '0';
        }
    }

    setupNavigation() {
        const currentIndex = this.allNewsletters.findIndex(n => n.id === this.currentNewsletter.id);
        const hasNext = currentIndex > 0; // Next means newer (previous in array)
        const hasPrevious = currentIndex < this.allNewsletters.length - 1; // Previous means older (next in array)

        const nextButton = document.getElementById('next-button');
        const footerNextButton = document.getElementById('footer-next-button');
        const footerPrevButton = document.getElementById('footer-prev-button');

        // Next button logic
        if (hasNext) {
            if (nextButton) {
                nextButton.style.display = 'block';
            }
            if (footerNextButton) {
                footerNextButton.style.display = 'inline-flex';
            }
        } else {
            if (nextButton) {
                nextButton.style.display = 'none';
            }
            if (footerNextButton) {
                footerNextButton.style.display = 'none';
            }
        }

        // Previous button logic
        if (hasPrevious) {
            if (footerPrevButton) {
                footerPrevButton.style.display = 'inline-flex';
            }
        } else {
            if (footerPrevButton) {
                footerPrevButton.style.display = 'none';
            }
        }
    }

    loadNextNewsletter() {
        const currentIndex = this.allNewsletters.findIndex(n => n.id === this.currentNewsletter.id);
        
        if (currentIndex > 0) {
            const nextNewsletter = this.allNewsletters[currentIndex - 1];
            // Update URL and load new newsletter
            const newUrl = `${window.location.pathname}?id=${nextNewsletter.id}`;
            window.history.pushState({}, '', newUrl);
            this.loadNewsletter(nextNewsletter.id);
        }
    }

    loadPreviousNewsletter() {
        const currentIndex = this.allNewsletters.findIndex(n => n.id === this.currentNewsletter.id);
        
        if (currentIndex < this.allNewsletters.length - 1) {
            const previousNewsletter = this.allNewsletters[currentIndex + 1];
            // Update URL and load new newsletter
            const newUrl = `${window.location.pathname}?id=${previousNewsletter.id}`;
            window.history.pushState({}, '', newUrl);
            this.loadNewsletter(previousNewsletter.id);
        }
    }

    formatDate(dateString) {
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        } catch (error) {
            return dateString; // Fallback to original string
        }
    }

    showLoading() {
        document.getElementById('loading-state').style.display = 'block';
        document.getElementById('error-state').style.display = 'none';
        document.getElementById('newsletter-content').style.display = 'none';
    }

    hideLoading() {
        document.getElementById('loading-state').style.display = 'none';
    }

    showContent() {
        document.getElementById('newsletter-content').style.display = 'block';
    }

    showError(message) {
        document.getElementById('loading-state').style.display = 'none';
        document.getElementById('error-state').style.display = 'block';
        document.getElementById('newsletter-content').style.display = 'none';

        // Update error message if provided
        const errorContent = document.querySelector('#error-state .error-content p');
        if (errorContent && message) {
            errorContent.textContent = message;
        }
    }
}

// Initialize the reader when the page loads
document.addEventListener('DOMContentLoaded', () => {

    new NewsletterReader();
});

// Handle browser back/forward navigation
window.addEventListener('popstate', () => {
    location.reload(); // Simple approach - reload the page
}); 