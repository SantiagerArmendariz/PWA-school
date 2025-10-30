/*==================== SCROLL REVEAL ANIMATION ====================*/
function reveal() {
    const reveals = document.querySelectorAll('.animate-on-scroll');
    
    reveals.forEach(element => {
        const windowHeight = window.innerHeight;
        const elementTop = element.getBoundingClientRect().top;
        const elementVisible = 150;
        
        if (elementTop < windowHeight - elementVisible) {
            element.classList.add('animated');
        }
    });
}

window.addEventListener('scroll', reveal);

/*==================== ANIMATE NUMBERS ====================*/
function animateNumbers() {
    const numberElements = document.querySelectorAll('.about-info-title');
    
    numberElements.forEach(element => {
        const finalNumber = parseInt(element.textContent);
        const duration = 2000; // 2 seconds
        const steps = 60;
        const stepValue = finalNumber / steps;
        const stepDuration = duration / steps;
        
        let currentNumber = 0;
        
        const timer = setInterval(() => {
            currentNumber += stepValue;
            element.textContent = Math.floor(currentNumber) + '+';
            
            if (currentNumber >= finalNumber) {
                element.textContent = finalNumber + '+';
                clearInterval(timer);
            }
        }, stepDuration);
    });
}

/*==================== SKILLS BAR PROGRESS ANIMATION ====================*/
function animateSkillsProgress() {
    const skillBars = document.querySelectorAll('.skills-percentage');
    
    skillBars.forEach(bar => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const width = bar.style.width || bar.getAttribute('data-width');
                    bar.style.animation = `loadSkill 2s ease-in-out forwards`;
                    observer.unobserve(bar);
                }
            });
        });
        
        observer.observe(bar);
    });
}

/*==================== PORTFOLIO ITEMS STAGGER ANIMATION ====================*/
function staggerPortfolioItems() {
    const portfolioItems = document.querySelectorAll('.portfolio-content');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.style.animation = 'fadeInUp 0.6s ease forwards';
                }, index * 200);
                observer.unobserve(entry.target);
            }
        });
    });
    
    portfolioItems.forEach(item => {
        item.style.opacity = '0';
        observer.observe(item);
    });
}

/*==================== TEXT ANIMATION EFFECTS ====================*/
function animateText() {
    const textElements = document.querySelectorAll('.section-title');
    
    textElements.forEach(element => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const text = entry.target.textContent;
                    entry.target.textContent = '';
                    
                    text.split('').forEach((char, index) => {
                        const span = document.createElement('span');
                        span.textContent = char;
                        span.style.animationDelay = `${index * 0.05}s`;
                        span.style.animation = 'fadeInUp 0.3s ease forwards';
                        entry.target.appendChild(span);
                    });
                    
                    observer.unobserve(entry.target);
                }
            });
        });
        
        observer.observe(element);
    });
}

/*==================== PARTICLE BACKGROUND ====================*/
function createParticles() {
    const particleContainer = document.createElement('div');
    particleContainer.classList.add('particles');
    particleContainer.style.position = 'fixed';
    particleContainer.style.top = '0';
    particleContainer.style.left = '0';
    particleContainer.style.width = '100%';
    particleContainer.style.height = '100%';
    particleContainer.style.pointerEvents = 'none';
    particleContainer.style.zIndex = '-1';
    
    document.body.appendChild(particleContainer);
    
    for (let i = 0; i < 50; i++) {
        const particle = document.createElement('div');
        particle.style.position = 'absolute';
        particle.style.width = '2px';
        particle.style.height = '2px';
        particle.style.backgroundColor = 'var(--first-color)';
        particle.style.borderRadius = '50%';
        particle.style.opacity = Math.random() * 0.3;
        particle.style.left = Math.random() * 100 + '%';
        particle.style.top = Math.random() * 100 + '%';
        particle.style.animation = `float ${3 + Math.random() * 4}s ease-in-out infinite`;
        particle.style.animationDelay = Math.random() * 2 + 's';
        
        particleContainer.appendChild(particle);
    }
}

/*==================== MOUSE FOLLOWER ====================*/
function createMouseFollower() {
    const follower = document.createElement('div');
    follower.style.position = 'fixed';
    follower.style.width = '20px';
    follower.style.height = '20px';
    follower.style.borderRadius = '50%';
    follower.style.backgroundColor = 'var(--first-color)';
    follower.style.opacity = '0.3';
    follower.style.pointerEvents = 'none';
    follower.style.zIndex = '9999';
    follower.style.transform = 'translate(-50%, -50%)';
    follower.style.transition = 'all 0.1s ease';
    
    document.body.appendChild(follower);
    
    document.addEventListener('mousemove', (e) => {
        follower.style.left = e.clientX + 'px';
        follower.style.top = e.clientY + 'px';
    });
    
    document.addEventListener('mouseenter', () => {
        follower.style.opacity = '0.3';
    });
    
    document.addEventListener('mouseleave', () => {
        follower.style.opacity = '0';
    });
}

/*==================== SCROLL TRIGGERED ANIMATIONS ====================*/
function initScrollAnimations() {
    const animationElements = [
        {
            element: '.home-title',
            animation: 'fadeInUp',
            delay: 0
        },
        {
            element: '.home-subtitle',
            animation: 'fadeInUp', 
            delay: 200
        },
        {
            element: '.home-description',
            animation: 'fadeInUp',
            delay: 400
        },
        {
            element: '.home-button',
            animation: 'fadeInUp',
            delay: 600
        }
    ];
    
    animationElements.forEach(item => {
        const elements = document.querySelectorAll(item.element);
        elements.forEach(element => {
            element.style.animationDelay = `${item.delay}ms`;
        });
    });
}

/*==================== MAGNETIC EFFECT FOR BUTTONS ====================*/
function addMagneticEffect() {
    const buttons = document.querySelectorAll('.button');
    
    buttons.forEach(button => {
        button.addEventListener('mousemove', (e) => {
            const rect = button.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            
            button.style.transform = `translate(${x * 0.1}px, ${y * 0.1}px)`;
        });
        
        button.addEventListener('mouseleave', () => {
            button.style.transform = 'translate(0px, 0px)';
        });
    });
}

/*==================== INITIALIZE ALL ANIMATIONS ====================*/
document.addEventListener('DOMContentLoaded', () => {
    // Basic animations
    reveal();
    animateSkillsProgress();
    staggerPortfolioItems();
    
    // Advanced effects
    initScrollAnimations();
    addMagneticEffect();
    
    // Optional effects (uncomment if desired)
    // createParticles();
    // createMouseFollower();
    
    // Animate numbers when about section is visible
    const aboutSection = document.getElementById('about');
    if (aboutSection) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateNumbers();
                    observer.unobserve(aboutSection);
                }
            });
        });
        
        observer.observe(aboutSection);
    }
    
    // Add smooth reveal for all sections
    const sections = document.querySelectorAll('section');
    sections.forEach((section, index) => {
        section.style.animationDelay = `${index * 100}ms`;
    });
});

/*==================== RESIZE HANDLER ====================*/
window.addEventListener('resize', () => {
    // Recalculate animations on resize if needed
    reveal();
});

/*==================== PERFORMANCE OPTIMIZATION ====================*/
let ticking = false;

function requestTick() {
    if (!ticking) {
        requestAnimationFrame(updateAnimations);
        ticking = true;
    }
}

function updateAnimations() {
    reveal();
    ticking = false;
}

window.addEventListener('scroll', requestTick);