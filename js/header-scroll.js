// Add scroll event listener to handle navbar transparency and blur effect
document.addEventListener('DOMContentLoaded', function() {
    const navbar = document.querySelector('.navbar');
    
    // Add scrolled class when scrolling down
    window.addEventListener('scroll', function() {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Initialize navbar state on page load
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    }
});
