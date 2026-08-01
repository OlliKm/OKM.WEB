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
     2. Pagination State & Helpers
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
     3. Dynamic Blog Data & Search Engine
     ========================================================= */
  let dynamicBlogDatabase = [];
  
  const featuredContainer = document.getElementById('featured-hero-container');
  const gridContainer = document.getElementById('dynamic-blog-grid');
  const searchInput = document.getElementById('blog-search-input');
  const noResultsMsg = document.getElementById('no-results-msg');

  function renderPosts(searchQuery = "") {
    if (!gridContainer) return;

    dynamicBlogDatabase.sort((a, b) => new Date(b.date) - new Date(a.date));

    const filteredPosts = dynamicBlogDatabase.filter(post => 
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.content.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (noResultsMsg) {
      noResultsMsg.style.display = (filteredPosts.length === 0) ? 'block' : 'none';
    }

    setupPagination(filteredPosts.length);

    const startIndex = (currentPage - 1) * postsPerPage;
    const paginatedPosts = filteredPosts.slice(startIndex, startIndex + postsPerPage);

    if (featuredContainer) {
      featuredContainer.style.display = "none";
      featuredContainer.innerHTML = "";
    }

    const existingWarnings = gridContainer.querySelectorAll('.diagnostic-message');
    let warningsHTML = '';
    existingWarnings.forEach(w => warningsHTML += w.outerHTML);

    gridContainer.innerHTML = warningsHTML + paginatedPosts.map(post => `
      <article class="soft-card clickable-post" data-content="${encodeURIComponent(post.content)}">
        <div class="soft-card__mini-browser">
          <div class="mini-browser__header">
            <span class="mini-dot red"></span>
            <span class="mini-dot yellow"></span>
            <span class="mini-dot green"></span>
            <span class="mini-browser__title-bar">${post.title}</span>
          </div>
          <div class="soft-card__image">
            <!-- Removed the Unsplash onerror placeholder. It will now load your exact image path -->
            ${post.img ? `<img src="${post.img}" alt="${post.title}">` : `<div style="padding: 2rem; text-align: center; background: #eee;">No Image</div>`}
          </div>
        </div>
        <div class="soft-card__body">
          <span class="pill-badge pill-badge--sm">
            <span class="pill-badge__dot"></span>
            ${post.category}
          </span>
          <h3 class="soft-card__title">${post.title}</h3>
          <p class="soft-card__desc">${post.excerpt || post.content.substring(0, 80) + '...'}</p>
          <div class="soft-card__footer-meta">
            <span class="soft-card__meta">${post.meta}</span>
            <span class="mini-read-pill">Read Article →</span>
          </div>
        </div>
      </article>
    `).join('');

    bindModalEvents();
  }

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      currentPage = 1;
      renderPosts(e.target.value.trim());
    });
  }

  /* =========================================================
     4. Fetch CMS Markdown Posts & Parse Frontmatter Fields
     ========================================================= */
  async function loadCMSBlogPosts() {
    const repo = 'OlliKm/OKM.WEB'; 
    const branch = 'main';

    const postFiles = [
      'djio-smo-pocket-4p.md',
      'macbook-m2-pro-worth-it.md',
      'test-post-see-if-it-works.md' 
    ];

    try {
      dynamicBlogDatabase = []; 

      for (const fileName of postFiles) {
        const rawSlug = fileName.replace('.md', '');
        const downloadUrl = `https://raw.githubusercontent.com/${repo}/${branch}/content/blog/${fileName}`;
        
        let title = rawSlug.replace(/-/g, ' ');
        title = title.charAt(0).toUpperCase() + title.slice(1);
        let category = "Insights";
        let dateStr = "2026-08-15";
        let fileContent = "";
        let extractedImg = ""; // Removed hardcoded Unsplash placeholder
        
        try {
          const mdResponse = await fetch(downloadUrl);
          if (mdResponse.ok) {
            const rawText = await mdResponse.text();

            const parts = rawText.split('---');
            if (parts.length >= 3) {
              const frontmatter = parts[1];
              fileContent = parts.slice(2).join('---').trim();
              
              const titleMatch = frontmatter.match(/title:\s*(['"]?)(.*?)\1/m);
              const categoryMatch = frontmatter.match(/category:\s*(['"]?)(.*?)\1/m);
              const dateMatch = frontmatter.match(/date:\s*(['"]?)(.*?)\1/m);
              const imgMatch = frontmatter.match(/(?:image|featuredImage|img|cover|thumbnail):\s*(['"]?)(.*?)\1/m);

              if (titleMatch && titleMatch[2]) title = titleMatch[2].trim();
              if (categoryMatch && categoryMatch[2]) category = categoryMatch[2].trim();
              if (dateMatch && dateMatch[2]) dateStr = dateMatch[2].trim();
              
              if (imgMatch && imgMatch[2]) {
                let foundPath = imgMatch[2].trim();
                if (foundPath && foundPath !== 'N-A' && foundPath !== 'N/A') {
                  foundPath = foundPath.replace(/^\[\[/, '').replace(/\]\]$/, '');
                  
                  // Corrected routing logic to find your local GitHub images
                  if (foundPath.startsWith('http')) {
                    extractedImg = foundPath;
                  } else if (foundPath.startsWith('/')) {
                    // Points to the root of your repo
                    extractedImg = `https://raw.githubusercontent.com/${repo}/${branch}${foundPath}`;
                  } else {
                    // Relative path - assumes the image is in the same folder as your blog markdown files
                    const cleanPath = foundPath.replace(/^\.\//, '');
                    extractedImg = `https://raw.githubusercontent.com/${repo}/${branch}/content/blog/${cleanPath}`;
                  }
                }
              }
            } else {
              fileContent = rawText;
            }
          }
        } catch (contentError) {
          console.error(`Failed to parse content for ${fileName}`, contentError);
        }

        dynamicBlogDatabase.push({
          id: rawSlug,
          date: dateStr,
          title: title,
          category: category,
          meta: dateStr.toUpperCase() + " • LIVE POST",
          img: extractedImg,
          excerpt: fileContent ? fileContent.substring(0, 80) + '...' : "Read more about this topic...",
          content: fileContent
        });
      }

      renderPosts(searchInput ? searchInput.value.trim() : "");

    } catch (error) {
       console.error("CMS Loading Error:", error);
       if (gridContainer) {
          gridContainer.insertAdjacentHTML('afterbegin', `
            <div class="diagnostic-message" style="grid-column: 1 / -1; padding: 1.5rem; background: #ffebee; color: #c62828; border-radius: 8px; border: 1px solid #ef9a9a; margin-bottom: 2rem;">
              <strong>⚠️ Notice:</strong> Could not load posts from repository.
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
        
        const modalImg = document.getElementById('modal-img');
        if(imgSrc) {
            modalImg.src = imgSrc;
            modalImg.style.display = 'block';
        } else {
            modalImg.style.display = 'none';
        }
        
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
      const originalText = submitBtn ? submitBtn.textContent : 'SEND';
      if (submitBtn) submitBtn.textContent = 'SENDING...';

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
        if (submitBtn) submitBtn.textContent = originalText;
      });
    });
  }
});