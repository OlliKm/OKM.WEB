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
     2. Dynamic Blog Data & Search Engine
     ========================================================= */
  
  // Base database with fallback posts so the page is never empty
  let dynamicBlogDatabase = [
    {
      id: "featured-1",
      isFeatured: true,
      title: "Building the Ultimate Minimalist Sony A6700 Rig",
      category: "Tech & Gear",
      meta: "AUG 10 • 10 MIN READ",
      img: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1200&q=80",
      excerpt: "Building a minimalist rig for the Sony A6700 requires balancing weight, functionality, and speed.",
      content: "Building a minimalist rig for the Sony A6700 requires balancing weight, functionality, and speed. In this article, we break down the top cages, top handles, and lightweight audio options for run-and-gun filmmaking."
    },
    {
      id: "fallback-2",
      isFeatured: false,
      title: "Designing a Distraction-Free Workspace",
      category: "Workflow",
      meta: "AUG 10 • 4 MIN READ",
      img: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=600&q=80",
      excerpt: "A clean desk layout is more than just aesthetics...",
      content: "A clean desk layout is more than just aesthetics. Reducing physical clutter directly correlates with reducing mental overhead when starting deep creative work blocks."
    },
    {
      id: "fallback-3",
      isFeatured: false,
      title: "My DaVinci Resolve Color Grading Process",
      category: "Video Editing",
      meta: "AUG 10 • 8 MIN READ",
      img: "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=600&q=80",
      excerpt: "Color grading doesn't have to be overwhelming...",
      content: "Color grading in DaVinci Resolve doesn't have to be overwhelming. Here is my 4-node tree template for achieving filmic skin tones and organic warmth every time."
    }
  ];

  const featuredContainer = document.getElementById('featured-hero-container');
  const gridContainer = document.getElementById('dynamic-blog-grid');
  const searchInput = document.getElementById('blog-search-input');
  const noResultsMsg = document.getElementById('no-results-msg');

  function renderPosts(searchQuery = "") {
    if (!featuredContainer || !gridContainer) return;

    const filteredPosts = dynamicBlogDatabase.filter(post => 
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.content.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (noResultsMsg) {
      noResultsMsg.style.display = (filteredPosts.length === 0) ? 'block' : 'none';
    }

    const featuredPost = filteredPosts.find(p => p.isFeatured) || filteredPosts[0];
    if (featuredPost && searchQuery === "") {
      featuredContainer.style.display = "block";
      featuredContainer.innerHTML = `
        <article class="bento-hero__main clickable-post" data-content="${encodeURIComponent(featuredPost.content)}">
          <div class="bento-hero__img-wrapper">
            <img src="${featuredPost.img}" alt="${featuredPost.title}">
            <div class="bento-hero__overlay">
              <span class="pill-badge">
                <span class="pill-badge__dot"></span>
                ${featuredPost.category}
              </span>
              <h2 class="bento-hero__title">${featuredPost.title}</h2>
              <p class="bento-hero__meta">${featuredPost.meta}</p>
            </div>
          </div>
        </article>
      `;
    } else {
      featuredContainer.style.display = "none";
      featuredContainer.innerHTML = "";
    }

    const gridPosts = searchQuery === "" ? filteredPosts.filter(p => !p.isFeatured) : filteredPosts;

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
          <p class="soft-card__desc">${post.excerpt}</p>
          <p class="soft-card__meta">${post.meta}</p>
        </div>
      </article>
    `).join('');

    bindModalEvents();
  }

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      renderPosts(e.target.value.trim());
    });
  }

  // Render initial fallback posts instantly
  renderPosts();

  /* =========================================================
     3. Fetch CMS Markdown Posts from GitHub (WITH DIAGNOSTICS)
     ========================================================= */
  async function loadCMSBlogPosts() {
    const repo = 'OlliKm/OKM.WEB'; 
    const folder = 'content/blog';

    try {
      const response = await fetch(`https://api.github.com/repos/${repo}/contents/${folder}`);
      
      // DIAGNOSTIC: If GitHub blocks us, show why on the screen
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
        return; // Stop running
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
            isFeatured: false,
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
     4. Article Reader Modal 
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
     5. Universal Newsletter Form Handler
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
     6. Web3Forms Contact Form Handler
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