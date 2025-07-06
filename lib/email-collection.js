/**
 * Simple Email Collection System
 * Collects email addresses and sends notifications
 */

class EmailCollection {
    constructor() {
        // For now, we'll use a simple notification system
        // Later can be extended to use emailjs, formspree, or similar service
        this.collectionEndpoint = null; // We'll implement a simple solution first
    }

    /**
     * Validate email address
     * @param {string} email - The email address to validate
     * @returns {boolean} - Whether the email is valid
     */
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    /**
     * Add email to collection
     * @param {string} email - The email address to subscribe
     * @param {string} firstName - Optional first name
     * @param {string} lastName - Optional last name
     * @returns {Promise} - Promise that resolves with the result
     */
    async addEmail(email, firstName = '', lastName = '') {
        try {
    

            // Validate email
            if (!email || !this.isValidEmail(email)) {
                throw new Error('Please enter a valid email address');
            }

            // Simple client-side storage for now
            const emailData = {
                email: email,
                firstName: firstName,
                lastName: lastName,
                timestamp: new Date().toISOString(),
                source: 'website'
            };

            // Store in localStorage (simple solution)
            this.storeEmailLocally(emailData);


            return {
                success: true,
                message: 'You\'re in! Now you\'re legally obligated to nod thoughtfully while reading.',
                data: emailData
            };

        } catch (error) {
            throw error;
        }
    }

    /**
     * Store email locally in localStorage
     * @param {Object} emailData - The email data to store
     */
    storeEmailLocally(emailData) {
        try {
            // Get existing emails from localStorage
            const existingEmails = JSON.parse(localStorage.getItem('newsletter_emails') || '[]');
            
            // Check if email already exists
            const emailExists = existingEmails.some(item => item.email === emailData.email);
            if (emailExists) {
                return;
            }

            // Add new email
            existingEmails.push(emailData);
            
            // Store back to localStorage
            localStorage.setItem('newsletter_emails', JSON.stringify(existingEmails));
            
        } catch (error) {
            // Silent error handling for production
        }
    }

    /**
     * Send notification about new email signup
     * @param {Object} emailData - The email data
     */
    sendNotification(emailData) {
        // Email is stored locally - no external notification needed
        // You can check the admin panel at admin.html to see collected emails
    }

    /**
     * Get all collected emails (for admin interface)
     * @returns {Array} - Array of collected emails
     */
    getCollectedEmails() {
        try {
            return JSON.parse(localStorage.getItem('newsletter_emails') || '[]');
        } catch (error) {
            return [];
        }
    }

    /**
     * Handle form submission and user feedback
     * @param {string} email - The email address
     * @param {Function} onSuccess - Callback for successful subscription
     * @param {Function} onError - Callback for errors
     */
    async handleSubscription(email, onSuccess, onError) {
        try {
    

            // Add email to collection
            const result = await this.addEmail(email);
            
            // Check if it was successful
            if (result.success) {
                onSuccess(result.message);
            } else {
                onError(result.error || 'Subscription failed');
            }

        } catch (error) {
            // Handle specific error messages
            if (error.message.includes('valid email')) {
                onError('Please enter a valid email address.');
            } else {
                onError(`Unable to subscribe: ${error.message}. Please try again.`);
            }
        }
    }
}

// Export for use in other scripts
window.EmailCollection = EmailCollection; 