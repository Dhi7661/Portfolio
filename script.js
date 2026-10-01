/**
 * Dhiraj Kurangale — Portfolio Interactive Scripts
 * Handles project filtering, clipboard copy, scroll spy, and mobile drawer.
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Navigation Scrolled State
  const siteHeader = document.getElementById('site-header');
  const handleScroll = () => {
    if (window.scrollY > 20) {
      siteHeader?.classList.add('scrolled');
    } else {
      siteHeader?.classList.remove('scrolled');
    }
  };
  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();

  // 2. Mobile Drawer Navigation
  const mobileToggle = document.getElementById('mobileToggle');
  const mobileDrawer = document.getElementById('mobileDrawer');
  const mobileNavItems = document.querySelectorAll('.mobile-nav-item');

  if (mobileToggle && mobileDrawer) {
    mobileToggle.addEventListener('click', () => {
      const isOpen = mobileDrawer.classList.toggle('open');
      mobileToggle.classList.toggle('active', isOpen);
      mobileToggle.setAttribute('aria-expanded', String(isOpen));
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    mobileNavItems.forEach(item => {
      item.addEventListener('click', () => {
        mobileDrawer.classList.remove('open');
        mobileToggle.classList.remove('active');
        mobileToggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      });
    });
  }

  // 3. Project Category Filter
  const filterTabs = document.querySelectorAll('.filter-tab');
  const projectCards = document.querySelectorAll('.project-card');

  filterTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      filterTabs.forEach(t => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');

      const filterValue = tab.getAttribute('data-filter');

      projectCards.forEach(card => {
        const cardCategory = card.getAttribute('data-category');
        if (filterValue === 'all' || cardCategory === filterValue) {
          card.style.display = '';
          setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
          }, 10);
        } else {
          card.style.opacity = '0';
          card.style.transform = 'translateY(12px)';
          setTimeout(() => {
            card.style.display = 'none';
          }, 200);
        }
      });
    });
  });

  // 4. One-Click Email Copy with Toast Notification
  const copyButtons = document.querySelectorAll('.copy-email-btn');
  const toast = document.getElementById('toastNotification');
  const toastMsg = document.getElementById('toastMessage');
  let toastTimeout;

  const showToast = (message) => {
    if (!toast) return;
    if (toastMsg) toastMsg.textContent = message;
    toast.classList.add('show');
    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
      toast.classList.remove('show');
    }, 3200);
  };

  copyButtons.forEach(btn => {
    btn.addEventListener('click', async () => {
      const email = btn.getAttribute('data-email') || 'dhirajkurangaale1@gmail.com';
      try {
        await navigator.clipboard.writeText(email);
        const label = btn.querySelector('.btn-copy-label');
        if (label) {
          const originalText = label.textContent;
          label.textContent = 'Copied!';
          setTimeout(() => {
            label.textContent = originalText;
          }, 2000);
        }
        showToast(`Copied ${email} to clipboard!`);
      } catch (err) {
        showToast(`Email: ${email}`);
      }
    });
  });

  // 5. Active Nav Spy on Scroll
  const sections = document.querySelectorAll('section[id]');
  const desktopNavLinks = document.querySelectorAll('.nav-menu .nav-item');

  const highlightNav = () => {
    const scrollPos = window.scrollY + 120;
    sections.forEach(section => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      const id = section.getAttribute('id');

      if (scrollPos >= top && scrollPos < top + height) {
        desktopNavLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${id}`) {
            link.classList.add('active');
          }
        });
      }
    });
  };

  window.addEventListener('scroll', highlightNav, { passive: true });
  highlightNav();

  // 6. Contact Form Enhancement
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('formSenderName')?.value || '';
      const subject = document.getElementById('formSubject')?.value || 'Portfolio Inquiry';
      const message = document.getElementById('formMessage')?.value || '';

      const bodyContent = `Hi Dhiraj,%0D%0A%0D%0A${encodeURIComponent(message)}%0D%0A%0D%0ABest regards,%0D%0A${encodeURIComponent(name)}`;
      const mailtoUrl = `mailto:dhirajkurangaale1@gmail.com?subject=${encodeURIComponent(subject)}&body=${bodyContent}`;

      window.location.href = mailtoUrl;
      showToast('Opening default email client...');
    });
  }
});