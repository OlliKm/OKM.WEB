document.addEventListener('DOMContentLoaded', () => {

  /* =========================================================
     1. Interactive Tab Switcher
     ========================================================= */
  const tabButtons = document.querySelectorAll('[data-tab-target]');
  const textPanels = document.querySelectorAll('.tab-text-panel');
  const mediaPanels = document.querySelectorAll('.tab-media-panel');

  if (tabButtons.length > 0) {
    tabButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const targetId = btn.getAttribute('data-tab-target');

        tabButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        textPanels.forEach(panel => {
          panel.classList.toggle('active', panel.getAttribute('data-tab') === targetId);
        });

        mediaPanels.forEach(panel => {
          panel.classList.toggle('active', panel.getAttribute('data-tab') === targetId);
        });
      });
    });
  }

  /* =========================================================
     2. Pagination State & Helpers (Declared First)
     ========================================================= */
  let currentPage = 1;
  const postsPerPage = 6;

  function setupPagination(totalPosts) {
    const pageNumbersContainer = document.getElementById('page-numbers');
    if (!pageNumbersContainer) return;

    const totalPages = Math.ceil(totalPosts / postsPerPage) || 1;
    let pagesHTML = '';

    for (let i = 1; i <= totalPages; i++) {
      pagesHTML += `<span class="page-num ${i === currentPage ? 'active' : ''}" data-page="${i}">${i}</span>`;
    }
    pageNumbersContainer.innerHTML = pagesHTML;

    document.querySelectorAll('.page-num').forEach(numBtn => {
      numBtn.addEventListener('click', (e) => {
        currentPage = parseInt(e.target.getAttribute('data-page'));
        renderPosts(searchInput ? searchInput.value.trim() : "");
      });
    });
  }

  const prevBtn = document.getElementById('page-prev');
  const nextBtn = document.getElementById('page-next');

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      if (currentPage > 1) {
        currentPage--;
        renderPosts(searchInput ? searchInput.value.trim() : "");
      }
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      currentPage++;
      renderPosts(searchInput ? searchInput.value.trim() : "");
    });
  }

  /* =========================================================
     3. Dynamic Blog Data & Search Engine (Auto-Sorted Newest First)
     ========================================================= */
  let dynamicBlogDatabase = [];
  
  const featuredContainer = document.getElementById('featured-hero-container');
  const gridContainer = document.getElementById('dynamic-blog-grid');
  const searchInput = document.getElementById('blog-search-input');
  const noResultsMsg = document.getElementById('no-results-msg');

  function renderPosts(searchQuery = "") {
    if (!featuredContainer || !gridContainer) return;

    // 1. Sort posts by date descending (newest first)
    dynamicBlogDatabase.sort((a, b) => new Date(b.date) - new Date(a.date));

    // 2. Filter posts based on user search query
    const filteredPosts = dynamicBlogDatabase.filter(post => 
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.content.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (noResultsMsg) {
      noResultsMsg.style.display = (filteredPosts.length === 0) ? 'block' : 'none';
    }

    // Setup pagination count based on filtered elements
    setupPagination(filteredPosts.length);

    // 3. Slice posts for current pagination page
    const startIndex = (currentPage - 1) * postsPerPage;
    const paginatedPosts = filteredPosts.slice(startIndex, startIndex + postsPerPage);

    // 4. Hide the large Bento Hero container entirely so all posts display uniformly in the grid
    if (featuredContainer) {
      featuredContainer.style.display = "none";
      featuredContainer.innerHTML = "";
    }

    // 5. Render ALL posts evenly into the grid cards
    const gridPosts = paginatedPosts;

    // Save existing warning messages if they exist so we don't overwrite them
    const existingWarnings = gridContainer.querySelectorAll('.diagnostic-message');
    let warningsHTML = '';
    existingWarnings.forEach(w => warningsHTML += w.outerHTML);

    gridContainer.innerHTML = warningsHTML + gridPosts.map(post => `
      <article class="soft-card clickable-post" data-content="${encodeURIComponent(post.content)}">
        <div class="soft-card__image">
          <img src="${post.img}" alt="${post.title}">
        </div>
        <div class="soft-card__body">
          <span class="pill-badge pill-badge--sm">
            <span class="pill-badge__dot"></span>
            ${post.category}
          </span>
          <h3 class="soft-card__title">${post.title}</h3>
          <p class="soft-card__desc">${post.excerpt || post.content.substring(0, 80) + '...'}</p>
          <p class="soft-card__meta">${post.meta}</p>
        </div>
      </article>
    `).join('');

    bindModalEvents();
  }

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      currentPage = 1; // Reset to page 1 on search
      renderPosts(e.target.value.trim());
    });
  }

  // Render initial posts instantly
  renderPosts();

  /* =========================================================
     4. Fetch CMS Markdown Posts from GitHub (WITH DIAGNOSTICS)
     ========================================================= */
  async function loadCMSBlogPosts() {
    const repo = 'OlliKm/OKM.WEB'; 
    const folder = 'content/blog';

    try {
      const response = await fetch(`https://api.github.com/repos/${repo}/contents/${folder}`);
      
      if (!response.ok) {
        let errorReason = `Status ${response.status}: ${response.statusText}.`;
        if (response.status === 404) {
           errorReason += " (Make sure your GitHub repository is set to PUBLIC, not Private, and the folder path is exactly correct.)";
        } else if (response.status === 403) {
           errorReason += " (GitHub API rate limit reached. Try again in an hour.)";
        }
        
        if (gridContainer) {
          gridContainer.insertAdjacentHTML('afterbegin', `
            <div class="diagnostic-message" style="grid-column: 1 / -1; padding: 1.5rem; background: #ffebee; color: #c62828; border-radius: 8px; border: 1px solid #ef9a9a; margin-bottom: 2rem;">
              <strong>⚠️ GitHub Fetch Error:</strong> ${errorReason}
            </div>
          `);
        }
        return;
      }

      const files = await response.json();

      if (!Array.isArray(files)) return;

      for (const file of files) {
        if (file.name.endsWith('.md')) {
          const rawTitle = file.name.replace('.md', '').replace(/-/g, ' ');
          const title = rawTitle.charAt(0).toUpperCase() + rawTitle.slice(1);
          
          let fileContent = `Loading content for ${title}...`;
          
          try {
            const mdResponse = await fetch(file.download_url);
            if (mdResponse.ok) {
              fileContent = await mdResponse.text();
            }
          } catch (contentError) {
            console.error(`Failed to load content for ${file.name}`, contentError);
          }

          dynamicBlogDatabase.push({
            id: file.sha,
            date: "2026-08-15",
            title: title,
            category: "CMS Post",
            meta: "LIVE CMS DATA",
            img: "https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=600&q=80",
            excerpt: "Read more about this topic...",
            content: fileContent
          });
        }
      }

      renderPosts(searchInput ? searchInput.value.trim() : "");

    } catch (error) {
       if (gridContainer) {
          gridContainer.insertAdjacentHTML('afterbegin', `
            <div class="diagnostic-message" style="grid-column: 1 / -1; padding: 1.5rem; background: #ffebee; color: #c62828; border-radius: 8px; border: 1px solid #ef9a9a; margin-bottom: 2rem;">
              <strong>⚠️ Network Error:</strong> Could not connect to GitHub at all.
            </div>
          `);
        }
    }
  }

  if (gridContainer) {
    loadCMSBlogPosts();
  }

  /* =========================================================
     5. Article Reader Modal 
     ========================================================= */
  const modal = document.getElementById('article-modal');
  const closeBtn = document.getElementById('article-modal-close');
  const backdrop = document.getElementById('article-modal-backdrop');

  function bindModalEvents() {
    document.querySelectorAll('.clickable-post').forEach(post => {
      post.addEventListener('click', (e) => {
        e.preventDefault();
        if (!modal) return;

        const title = post.querySelector('h1, h2, h3')?.textContent || 'Untitled';
        const meta = post.querySelector('.bento-hero__meta, .soft-card__meta')?.textContent || '';
        const imgObj = post.querySelector('img');
        const imgSrc = imgObj ? imgObj.src : '';
        const encodedContent = post.getAttribute('data-content') || '';
        
        const content = decodeURIComponent(encodedContent);
        const badgeText = post.querySelector('.pill-badge')?.textContent?.trim() || 'Article';

        document.getElementById('modal-title').textContent = title;
        document.getElementById('modal-meta').textContent = meta;
        document.getElementById('modal-img').src = imgSrc;
        
        const formattedContent = content.replace(/\n/g, '<br>');
        document.getElementById('modal-body').innerHTML = `<p>${formattedContent}</p>`;
        
        const badgeElem = document.getElementById('modal-badge-text');
        if (badgeElem) badgeElem.textContent = badgeText;

        modal.classList.add('is-open');
        modal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
      });
    });
  }

  const closeModal = () => {
    if (!modal) return;
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  };

  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  if (backdrop) backdrop.addEventListener('click', closeModal);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal && modal.classList.contains('is-open')) {
      closeModal();
    }
  });

  /* =========================================================
     6. Universal Newsletter Form Handler
     ========================================================= */
  const newsletterForm = document.getElementById('newsletter-form');
  if (newsletterForm) {
    newsletterForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = newsletterForm.querySelector('input[type="email"]');
      if (input && input.value) {
        alert('Thank you for subscribing!');
        input.value = '';
      }
    });
  }

  /* =========================================================
     7. Web3Forms Contact Form Handler
     ========================================================= */
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      const submitBtn = contactForm.querySelector('.bento-submit-btn');
      const originalText = submitBtn.textContent;
      submitBtn.textContent = 'SENDING...';

      const formData = new FormData(contactForm);
      const object = Object.fromEntries(formData);
      const json = JSON.stringify(object);

      fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: json
      })
      .then(async (response) => {
        let jsonResponse = await response.json();
        if (response.status === 200) {
          alert('Message sent successfully!');
          contactForm.reset();
        } else {
          alert(jsonResponse.message || 'Something went wrong.');
        }
      })
      .catch(error => {
        console.error('Web3Forms Error:', error);
        alert('Something went wrong! Please try again later.');
      })
      .finally(() => {
        submitBtn.textContent = originalText;
      });
    });
  }
});