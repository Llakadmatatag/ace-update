document.addEventListener('DOMContentLoaded', function() {
    // Function to check if element is in viewport
    function isInViewport(element) {
        const rect = element.getBoundingClientRect();
        return (
            rect.top <= (window.innerHeight * 0.9) &&
            rect.bottom >= 0
        );
    }

    // Function to handle scroll animations
    function handleScrollAnimations() {
        const animatedElements = document.querySelectorAll('.section-animate');
        
        animatedElements.forEach((element, index) => {
            // Add delay class based on index for staggered animation
            if (!element.classList.contains('delay-1') && 
                !element.classList.contains('delay-2') && 
                !element.classList.contains('delay-3')) {
                element.classList.add(`delay-${(index % 3) + 1}`);
            }
            
            if (isInViewport(element)) {
                element.classList.add('fade-in');
                // Remove the element from the list once it's been animated
                element.classList.remove('section-animate');
            }
        });
        
        // If all elements have been animated, remove the scroll event listener
        if (document.querySelectorAll('.section-animate').length === 0) {
            window.removeEventListener('scroll', handleScrollAnimations);
        }
    }

    // Add scroll event listener
    window.addEventListener('scroll', handleScrollAnimations);
    
    // Initial check in case elements are already in view
    handleScrollAnimations();
});
