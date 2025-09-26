document.addEventListener('DOMContentLoaded', function() {
    // Check if this is the first visit
    if (!sessionStorage.getItem('hasVisited')) {
        // Mark that the user has visited
        sessionStorage.setItem('hasVisited', 'true');
        
        // Show loading screen
        const loadingScreen = document.getElementById('loading-screen');
        
        // Set minimum display time (2 seconds)
        const minDisplayTime = 2000;
        const startTime = Date.now();
        
        // When everything is loaded
        window.addEventListener('load', function() {
            const elapsedTime = Date.now() - startTime;
            const remainingTime = Math.max(0, minDisplayTime - elapsedTime);
            
            // Wait for the remaining time or immediately hide if minDisplayTime has passed
            setTimeout(function() {
                loadingScreen.classList.add('fade-out');
                
                // Remove from DOM after animation completes
                setTimeout(function() {
                    loadingScreen.style.display = 'none';
                }, 500); // Match this with the CSS transition time
            }, remainingTime);
        });
    } else {
        // Hide loading screen immediately if not first visit
        document.getElementById('loading-screen').style.display = 'none';
    }
});
