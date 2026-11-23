// ========================================
// AQLYRION — Static Site JavaScript
// ========================================

document.addEventListener('DOMContentLoaded', () => {
  // Mobile navigation toggle
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');

  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
      const isOpen = navLinks.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', isOpen);
    });

    // Close menu when clicking a link
    const links = navLinks.querySelectorAll('.nav-link');
    links.forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // Navbar scroll effect
  const navbar = document.getElementById('navbar');
  let lastScrollY = window.scrollY;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      navbar.style.boxShadow = '0 4px 6px -1px rgb(0 0 0 / 0.1)';
    } else {
      navbar.style.boxShadow = '0 1px 2px 0 rgb(0 0 0 / 0.05)';
    }
    lastScrollY = window.scrollY;
  });

  // Animate chart bars on scroll
  const observerOptions = {
    threshold: 0.2,
    rootMargin: '0px 0px -50px 0px',
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const bars = entry.target.querySelectorAll('.chart-bar, .mini-bar');
        bars.forEach((bar, index) => {
          setTimeout(() => {
            bar.style.opacity = '1';
            bar.style.transform = 'scaleY(1)';
          }, index * 100);
        });
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  const chartSections = document.querySelectorAll('.mockup-body, .preview-chart');
  chartSections.forEach(section => {
    // Set initial state for animation
    const bars = section.querySelectorAll('.chart-bar, .mini-bar');
    bars.forEach(bar => {
      bar.style.opacity = '0.5';
      bar.style.transform = 'scaleY(0.3)';
      bar.style.transition = 'all 0.6s ease';
    });
    observer.observe(section);
  });

  // Smooth reveal animation for feature cards
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

  const cards = document.querySelectorAll('.feature-card, .flow-step');
  cards.forEach(card => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    card.style.transition = 'all 0.6s ease';
    revealObserver.observe(card);
  });

  // Console welcome message
  console.log('%c AQLYRION ', 'background: #4f46e5; color: #fff; padding: 8px 16px; border-radius: 4px; font-size: 16px; font-weight: bold;');
  console.log('%c Azure DevOps Reporting, Reimagined', 'color: #64748b; font-size: 14px;');
});