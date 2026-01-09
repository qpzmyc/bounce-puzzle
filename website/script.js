// Smooth scroll for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Navbar background on scroll
const navbar = document.querySelector('.navbar');
let lastScrollY = 0;

window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;

    // Add solid background when scrolled
    if (scrollY > 50) {
        navbar.style.background = 'rgba(15, 15, 26, 0.95)';
    } else {
        navbar.style.background = 'rgba(15, 15, 26, 0.8)';
    }

    lastScrollY = scrollY;
});

// Intersection Observer for fade-in animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, observerOptions);

// Observe all animatable elements
document.querySelectorAll('.feature-card, .world-card, .gameplay-step').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
});

// Add visible class styles dynamically
const style = document.createElement('style');
style.textContent = `
    .feature-card.visible,
    .world-card.visible,
    .gameplay-step.visible {
        opacity: 1 !important;
        transform: translateY(0) !important;
    }
`;
document.head.appendChild(style);

// Staggered animation for grid items
document.querySelectorAll('.features-grid, .worlds-grid').forEach(grid => {
    const items = grid.querySelectorAll('.feature-card, .world-card');
    items.forEach((item, index) => {
        item.style.transitionDelay = `${index * 0.1}s`;
    });
});

// Add parallax effect to floating balls
window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    const balls = document.querySelectorAll('.floating-ball');

    balls.forEach((ball, index) => {
        const speed = 0.1 + (index * 0.05);
        ball.style.transform = `translateY(${scrollY * speed}px)`;
    });
});

// Interactive phone mockup - add subtle rotation on mouse move
const phoneMockup = document.querySelector('.phone-mockup');
if (phoneMockup) {
    const heroSection = document.querySelector('.hero');

    heroSection.addEventListener('mousemove', (e) => {
        const rect = heroSection.getBoundingClientRect();
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        const rotateX = (mouseY - centerY) / centerY * 5;
        const rotateY = (centerX - mouseX) / centerX * 5;

        phoneMockup.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    });

    heroSection.addEventListener('mouseleave', () => {
        phoneMockup.style.transform = 'perspective(1000px) rotateX(0) rotateY(0)';
        phoneMockup.style.transition = 'transform 0.5s ease';
    });

    heroSection.addEventListener('mouseenter', () => {
        phoneMockup.style.transition = 'transform 0.1s ease';
    });
}

// Add click tracking for download buttons (placeholder for analytics)
document.querySelectorAll('.btn-primary, .btn-download').forEach(btn => {
    btn.addEventListener('click', (e) => {
        // In production, this would send analytics
        console.log('Download button clicked');

        // Add visual feedback
        btn.style.transform = 'scale(0.95)';
        setTimeout(() => {
            btn.style.transform = '';
        }, 150);
    });
});

// Animate stats numbers on scroll
const statsSection = document.querySelector('.hero-stats');
if (statsSection) {
    const statsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Add pulse animation to stats
                entry.target.querySelectorAll('.stat-number').forEach((stat, index) => {
                    setTimeout(() => {
                        stat.style.animation = 'pulse 0.5s ease';
                    }, index * 100);
                });
                statsObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    statsObserver.observe(statsSection);
}

// Add pulse keyframe
const pulseStyle = document.createElement('style');
pulseStyle.textContent = `
    @keyframes pulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.1); }
    }
`;
document.head.appendChild(pulseStyle);

console.log('Bounce Puzzle website loaded successfully! 🎮');
