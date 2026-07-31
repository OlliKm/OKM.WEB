document.addEventListener('DOMContentLoaded', () => {

  /* =========================================================
     1. Interactive Tab Switcher (Index & About Pages)
     ========================================================= */
  const tabButtons = document.querySelectorAll('[data-tab-target]');
  const textPanels = document.querySelectorAll('.tab-text-panel');
  const mediaPanels = document.querySelectorAll('.tab-media-panel');

  if (tabButtons.length > 0) {
    tabButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const targetId = btn.getAttribute('data-tab-target');

        // Update active class on buttons
        tabButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        // Update text panels
        textPanels.forEach(panel => {
          panel.classList.toggle('active', panel.getAttribute('data-tab') === targetId);
        });

        // Update media panels
        mediaPanels.forEach(panel => {
          panel.classList.toggle('active', panel.getAttribute('data-tab') === targetId);
        });
      });
    });
  }

  /* =========================================================
     2. Article Reader Modal (Blog Page)
     ========================================================= */
  const modal = document.getElementById('article-modal');
  const closeBtn = document.getElementById('article-modal-close');
  const backdrop = document.getElementById('article-modal-backdrop');
  const clickablePosts = document.querySelectorAll('.clickable-post');

  const modalTitle = document.getElementById('modal-title');
  const modalMeta = document.getElementById('modal-meta');
  const modalImg = document.getElementById('modal-img');
  const modalBody = document.getElementById('modal-body');
  const modalBadgeText = document.getElementById('modal-badge-text');

  function openArticleModal(card) {
    if (!modal) return;

    const title = card.querySelector('h1, h3')?.textContent || 'Untitled Article';
    const meta = card.querySelector('.bento-hero__meta, .sidebar-item__text p, .soft-card__meta')?.textContent || '';
    const imgObj = card.querySelector('img');
    const imgSrc = imgObj ? imgObj.src : '';
    const content = card.getAttribute('data-content') || 'No additional content provided.';
    const badgeText = card.querySelector('.pill-badge, .category-badge')?.textContent?.trim() || 'Article';

    if (modalTitle) modalTitle.textContent = title;
    if (modalMeta) modalMeta.textContent = meta;
    if (modalImg && imgSrc) modalImg.src = imgSrc;
    if (modalBody) modalBody.innerHTML = `<p>${content}</p>`;
    if (modalBadgeText) modalBadgeText.textContent = badgeText;

    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeArticleModal() {
    if (!modal) return;
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  clickablePosts.forEach(post => {
    post.addEventListener('click', (e) => {
      e.preventDefault();
      openArticleModal(post);
    });
  });

  if (closeBtn) closeBtn.addEventListener('click', closeArticleModal);
  if (backdrop) backdrop.addEventListener('click', closeArticleModal);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal && modal.classList.contains('is-open')) {
      closeArticleModal();
    }
  });

  /* =========================================================
     3. Carousel & Horizontal Scroll (Blog Page)
     ========================================================= */
  const cardGrid = document.getElementById('card-grid');
  const prevBtn = document.getElementById('carousel-prev');
  const nextBtn = document.getElementById('carousel-next');

  if (cardGrid && prevBtn && nextBtn) {
    prevBtn.addEventListener('click', () => {
      cardGrid.scrollBy({ left: -320, behavior: 'smooth' });
    });
    nextBtn.addEventListener('click', () => {
      cardGrid.scrollBy({ left: 320, behavior: 'smooth' });
    });
  }

  /* =========================================================
     4. Pagination Highlights (Blog Page)
     ========================================================= */
  const pageNumbers = document.querySelectorAll('.page-num');
  pageNumbers.forEach(num => {
    num.addEventListener('click', () => {
      pageNumbers.forEach(n => n.classList.remove('active'));
      num.classList.add('active');
    });
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

});
document.addEventListener('DOMContentLoaded', () => {
  const searchInput = document.getElementById('blog-search-input');
  const cardGrid = document.getElementById('card-grid');
  const posts = cardGrid ? cardGrid.querySelectorAll('.clickable-post') : [];
  const noResultsMsg = document.getElementById('no-results-msg');

  if (!searchInput || !cardGrid) return;

  searchInput.addEventListener('input', (e) => {
    // Convert search query to lowercase and trim extra spaces
    const query = e.target.value.toLowerCase().trim();
    let visibleCount = 0;

    posts.forEach((post) => {
      // Gather text from visible elements (title, excerpt, etc.) and dataset content
      const title = post.querySelector('.post-title')?.textContent || '';
      const excerpt = post.querySelector('.post-excerpt')?.textContent || '';
      const bodyContent = post.getAttribute('data-content') || '';

      // Combine all searchable text for this card
      const searchableText = `${title} ${excerpt} ${bodyContent}`.toLowerCase();

      // Check if the searchable text includes the query string
      if (searchableText.includes(query)) {
        post.style.display = ''; // Show post
        visibleCount++;
      } else {
        post.style.display = 'none'; // Hide post
      }
    });

    // Toggle the "No results found" message
    if (noResultsMsg) {
      noResultsMsg.style.display = visibleCount === 0 ? 'block' : 'none';
    }
  });
});
document.addEventListener('DOMContentLoaded', () => {
  const searchInput = document.getElementById('blog-search-input');
  const cardGrid = document.getElementById('card-grid');
  // Target all article post cards
  const posts = cardGrid ? cardGrid.querySelectorAll('.clickable-post, article, .soft-card') : [];
  const noResultsMsg = document.getElementById('no-results-msg');

  if (!searchInput || !cardGrid) return;

  // Helper to normalize regional spelling variations
  const normalizeText = (str) => {
    return str
      .toLowerCase()
      .replace(/colour/g, 'color'); // Treat "colour" and "color" as identical
  };

  searchInput.addEventListener('input', (e) => {
    const rawQuery = e.target.value.trim();
    const query = normalizeText(rawQuery);
    let visibleCount = 0;

    posts.forEach((post) => {
      // Get all text inside the post element plus data attributes
      const fullText = post.innerText || post.textContent || '';
      const dataContent = post.getAttribute('data-content') || '';
      
      const searchableText = normalizeText(`${fullText} ${dataContent}`);

      if (query === '' || searchableText.includes(query)) {
        post.style.setProperty('display', 'flex', 'important'); // Keep card visible
        visibleCount++;
      } else {
        post.style.setProperty('display', 'none', 'important'); // Hide card cleanly
      }
    });

    // Display "No matching posts found" only when 0 posts are visible
    if (noResultsMsg) {
      noResultsMsg.style.display = (visibleCount === 0 && query !== '') ? 'block' : 'none';
    }
  });
});
document.addEventListener('DOMContentLoaded', () => {
  const searchInput = document.getElementById('blog-search-input');
  const cardGrid = document.getElementById('card-grid');
  const posts = cardGrid ? cardGrid.querySelectorAll('.clickable-post') : [];
  const noResultsMsg = document.getElementById('no-results-msg');

  if (!searchInput || !cardGrid) return;

  searchInput.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase().trim();
    let visibleCount = 0;

    posts.forEach((post) => {
      const fullText = post.innerText || post.textContent || '';
      const dataContent = post.getAttribute('data-content') || '';
      const searchableText = `${fullText} ${dataContent}`.toLowerCase();

      if (query === '' || searchableText.includes(query)) {
        post.style.display = ''; // Restore default display
        visibleCount++;
      } else {
        post.style.display = 'none'; // Hide non-matching card
      }
    });

    if (noResultsMsg) {
      noResultsMsg.style.display = (visibleCount === 0 && query !== '') ? 'block' : 'none';
    }
  });
});
document.addEventListener("DOMContentLoaded", () => {
  // Database of searchable blog posts
  const blogPosts = [
    {
      title: "Building the Ultimate Minimalist Sony A6700 Rig",
      category: "Tech & Gear",
      meta: "AUG 10 • 10 MIN READ",
      img: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=200&q=80",
      content: "Building a minimalist rig for the Sony A6700 requires balancing weight, functionality, and speed."
    },
    {
      title: "Designing a Distraction-Free Workspace for Deep Work",
      category: "Workflow",
      meta: "AUG 10 • 4 MIN READ",
      img: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=200&q=80",
      content: "A clean desk layout is more than just aesthetics. Reducing physical clutter directly correlates with reducing mental overhead."
    },
    {
      title: "My DaVinci Resolve Color Grading Process",
      category: "Video Editing",
      meta: "AUG 10 • 8 MIN READ",
      img: "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=200&q=80",
      content: "Color grading in DaVinci Resolve doesn't have to be overwhelming."
    },
    {
      title: "Why the Pocket Camera Revolution is Here to Stay",
      category: "Tech & Gear",
      meta: "AUG 10 • 5 MIN READ",
      img: "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=200&q=80",
      content: "Compact pocket cameras are revolutionizing everyday vlogging and travel video creation."
    }
  ];

  const searchInput = document.getElementById("blog-search-input");
  const resultsContainer = document.getElementById("search-results-container");
  const resultsContent = document.getElementById("search-results-content");

  if (searchInput && resultsContainer && resultsContent) {
    searchInput.addEventListener("input", (e) => {
      const query = e.target.value.trim().toLowerCase();

      // If search input is empty, hide results completely
      if (query === "") {
        resultsContainer.style.display = "none";
        resultsContent.innerHTML = "";
        return;
      }

      // Filter matching posts by title or content
      const matches = blogPosts.filter(post => 
        post.title.toLowerCase().includes(query) || 
        post.content.toLowerCase().includes(query) ||
        post.category.toLowerCase().includes(query)
      );

      // Render search results
      if (matches.length > 0) {
        resultsContent.innerHTML = matches.map(post => `
          <a href="#" class="sidebar-item clickable-post" data-content="${post.content}">
            <img src="${post.img}" alt="${post.title}">
            <div class="sidebar-item__text">
              <h3>${post.title}</h3>
              <p>${post.meta}</p>
            </div>
          </a>
        `).join("");
      } else {
        resultsContent.innerHTML = `<p class="search-no-results">No posts found matching "${e.target.value}"</p>`;
      }

      // Show the results container below the search bar
      resultsContainer.style.display = "block";
    });
  }
  document.addEventListener('DOMContentLoaded', () => {
  /* =========================================================
     6. Web3Forms Contact Form Handler
     ========================================================= */
  const contactForm = document.getElementById('contact-form');

  if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
      // Prevent the default form submission behavior
      e.preventDefault();
      
      const submitBtn = contactForm.querySelector('.bento-submit-btn');
      const originalText = submitBtn.textContent;
      
      // Visual feedback while sending
      submitBtn.textContent = 'SENDING...';

      // Gather form data
      const formData = new FormData(contactForm);
      const object = Object.fromEntries(formData);
      const json = JSON.stringify(object);

      // Send data to Web3Forms
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
          // Success message
          alert('Message sent successfully!');
          contactForm.reset();
        } else {
          // API error
          alert(jsonResponse.message || 'Something went wrong.');
        }
      })
      .catch(error => {
        // Network or fetch error
        console.error('Web3Forms Error:', error);
        alert('Something went wrong! Please try again later.');
      })
      .finally(() => {
        // Restore button text
        submitBtn.textContent = originalText;
      });
    });
  }
});
async function loadCMSBlogPosts() {
  const container = document.getElementById('blog-posts-container');
  if (!container) return;

  const repo = 'OlliKm/OKM.WEB'; 
  const folder = 'blog-posts';

  try {
    const response = await fetch(`https://api.github.com/repos/${repo}/contents/${folder}`);
    const files = await response.json();

    if (!Array.isArray(files) || files.length === 0) {
      container.innerHTML = '<p>No custom posts published yet.</p>';
      return;
    }

    container.innerHTML = '<h2>Published CMS Posts</h2>';
    const postList = document.createElement('div');
    postList.className = 'three-card-grid';

    files.forEach(file => {
      if (file.name.endsWith('.md')) {
        const rawTitle = file.name.replace('.md', '').replace(/-/g, ' ');
        const title = rawTitle.charAt(0).toUpperCase() + rawTitle.slice(1);

        const card = document.createElement('article');
        card.className = 'soft-card clickable-post';
        card.setAttribute('data-content', `Content from CMS post: ${title}`);
        card.innerHTML = `
          <div class="soft-card__body">
            <span class="pill-badge pill-badge--sm"><span class="pill-badge__dot"></span>CMS Post</span>
            <h3 class="soft-card__title">${title}</h3>
            <p class="soft-card__desc">Click to view post details.</p>
            <p class="soft-card__meta">PUBLISHED VIA CMS</p>
          </div>
        `;
        postList.appendChild(card);
      }
    });

    container.appendChild(postList);
  } catch (error) {
    console.error('Error fetching CMS posts:', error);
    container.innerHTML = '<p>Could not load live CMS posts at this time.</p>';
  }
}

document.addEventListener('DOMContentLoaded', loadCMSBlogPosts);
});