// Video modal player logic
const modal = document.getElementById('video-modal');
const modalIframe = document.getElementById('video-modal-iframe');
const modalClose = document.getElementById('video-modal-close');

if (modal && modalIframe) {
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.play-btn');
    if (btn) {
      e.stopPropagation();
      const src = btn.getAttribute('data-video');
      if (src) {
        modalIframe.src = src;
        modal.hidden = false;
      }
    }
  });

  const closeModal = () => {
    modal.hidden = true;
    modalIframe.src = '';
  };

  if (modalClose) modalClose.addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !modal.hidden) closeModal(); });
}

// Vertical Side-Tab Switcher Logic
const vTabButtons = document.querySelectorAll('.v-tab-btn');
const textPanels = document.querySelectorAll('.tab-text-panel');
const mediaPanels = document.querySelectorAll('.tab-media-panel');

vTabButtons.forEach(button => {
  button.addEventListener('click', () => {
    const target = button.getAttribute('data-tab');

    // Toggle active state on buttons
    vTabButtons.forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');

    // Toggle text panels on the left
    textPanels.forEach(panel => {
      panel.classList.toggle('active', panel.id === `text-${target}`);
    });

    // Toggle media panels on the right
    mediaPanels.forEach(panel => {
      panel.classList.toggle('active', panel.id === `media-${target}`);
    });
  });
});

// Mobile menu toggle
const navToggle = document.getElementById('nav-toggle');
const navLinks = document.getElementById('nav-links');
if (navToggle && navLinks) {
  navToggle.addEventListener('click', () => {
    navLinks.classList.toggle('is-open');
  });
}