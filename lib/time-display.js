// Time display utility for Phoenix, AZ
// Used in newsletters.html for both desktop and mobile time displays

function updatePhoenixTime() {
    const now = new Date();
    const phoenixTime = new Date(now.toLocaleString("en-US", {timeZone: "America/Phoenix"}));
    const timeString = phoenixTime.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit', 
        hour12: false 
    });
    
    // Update desktop time display
    const desktopTimeElement = document.getElementById('phoenix-time');
    if (desktopTimeElement) {
        desktopTimeElement.textContent = timeString;
    }
    
    // Update mobile time display
    const mobileTimeElement = document.getElementById('mobile-phoenix-time');
    if (mobileTimeElement) {
        mobileTimeElement.textContent = timeString;
    }
}

// Initialize time display
function initTimeDisplay() {
    // Update immediately
    updatePhoenixTime();
    
    // Update every 30 seconds
    setInterval(updatePhoenixTime, 30000);
}

// Auto-initialize when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTimeDisplay);
} else {
    initTimeDisplay();
} 