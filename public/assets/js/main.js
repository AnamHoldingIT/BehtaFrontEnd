// main.js

document.addEventListener('DOMContentLoaded', function () {

  // ===========================================
  // 1. Showcase thumbs → تغییر پس‌زمینه گوشی
  // ===========================================
  const thumbs = document.querySelectorAll('.thumb');
  const phoneScreenBg = document.querySelector('.phone .bg');

  if (thumbs.length > 0 && phoneScreenBg) {
    function changeScreen() {
      thumbs.forEach(thumb => thumb.classList.remove('active'));
      this.classList.add('active');

      const newImgSrc = this.getAttribute('data-img');
      phoneScreenBg.style.backgroundImage = `url(${newImgSrc})`;
    }

    thumbs.forEach(thumb => {
      thumb.addEventListener('click', changeScreen);
    });
  } else {
    console.warn('Showcase elements not found in DOM.');
  }

  // ===========================================
  // 2. افکت هولوگرافیک روی .holographic-panel
  // ===========================================
  const holographicPanels = document.querySelectorAll('.holographic-panel');

  if (holographicPanels.length > 0) {
    holographicPanels.forEach(panel => {

      panel.addEventListener('mousemove', (e) => {
        const rect = panel.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        panel.style.setProperty('--x', `${x}px`);
        panel.style.setProperty('--y', `${y}px`);
      });

      panel.addEventListener('mouseleave', () => {
        panel.style.setProperty('--x', `50%`);
        panel.style.setProperty('--y', `50%`);
      });

    });
  }

  // ===========================================
  // 3. Navbar dynamic + ScrollSpy (بهینه‌شده)
  // ===========================================
  const header = document.querySelector('#header');
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.navbar-nav .nav-link');

  let lastKnownScrollY = window.scrollY || window.pageYOffset;
  let ticking = false;

  function updateOnScroll() {
    const scrollY = lastKnownScrollY;

    // dynamic navbar
    if (scrollY > 80) {
      header.classList.add('navbar-custom-dynamic');
    } else {
      header.classList.remove('navbar-custom-dynamic');
    }

    // simple scroll spy
    let currentId = null;
    const offset = 120;

    sections.forEach(section => {
      const rect = section.getBoundingClientRect();
      if (rect.top <= offset && rect.bottom > offset) {
        currentId = section.id;
      }
    });

    if (currentId) {
      navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (!href || !href.startsWith('#')) return;
        const targetId = href.substring(1);
        if (targetId === currentId) {
          link.classList.add('active');
        } else {
          link.classList.remove('active');
        }
      });
    }

    ticking = false;
  }

  function onScroll() {
    lastKnownScrollY = window.scrollY || window.pageYOffset;

    if (!ticking) {
      window.requestAnimationFrame(updateOnScroll);
      ticking = true;
    }
  }

  window.addEventListener('scroll', onScroll);
  updateOnScroll(); // حالت اولیه
});
