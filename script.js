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
  
  // Base database with your fallback/featured posts
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
    }
  ];

  const featuredContainer = document.getElementById('featured-hero-container');
  const gridContainer = document.getElementById('dynamic-blog-grid');
  const searchInput = document.getElementById('blog-search-input');
  const noResultsMsg = document.getElementById('no-results-msg');

  // Function to render posts to the screen
  function renderPosts(searchQuery = "") {
    if (!featuredContainer || !gridContainer) return;

    // Filter by search query
    const filteredPosts = dynamicBlogDatabase.filter(post => 
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.content.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Toggle No Results Message
    if (noResultsMsg) {
      noResultsMsg.style.display = (filteredPosts.length === 0) ? 'block' : 'none';
    }

    // Render Featured Post (hide if actively searching)
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

    // Render Grid Posts
    const gridPosts = searchQuery === "" 
      ? filteredPosts.filter(p => !p.isFeatured) 
      : filteredPosts;

    gridContainer.innerHTML = gridPosts.map(post => `
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

  // Bind Search Input
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      renderPosts(e.target.value.trim());
    });
  }

  // Initial render for fallback data
  renderPosts();


  /* =========================================================
     3. Fetch CMS Markdown Posts from GitHub
     ========================================================= */
  async function loadCMSBlogPosts() {
    const repo = 'OlliKm/OKM.WEB'; 
    const folder = 'content/blog';

    try {
      // Fetch the directory contents from GitHub
      const response = await fetch(`https://api.github.com/repos/${repo}/contents/${folder}`);
      const files = await response.json();

      if (!Array.isArray(files)) return;

      // Loop through the files found in the folder
      for (const file of files) {
        if (file.name.endsWith('.md')) {
          // Format the title from the file name
          const rawTitle = file.name.replace('.md', '').replace(/-/g, ' ');
          const title = rawTitle.charAt(0).toUpperCase() + rawTitle.slice(1);
          
          let fileContent = `Loading content for ${title}...`;
          
          // Fetch the actual text inside the markdown file
          try {
            const mdResponse = await fetch(file.download_url);
            if (mdResponse.ok) {
              fileContent = await mdResponse.text();
            }
          } catch (contentError) {
            console.error(`Failed to load content for ${file.name}`, contentError);
          }

          // Add it to our dynamic database
          dynamicBlogDatabase.push({
            id: file.sha,
            isFeatured: false,
            title: title,
            category: "CMS Post",
            meta: "LIVE CMS DATA",
            img: "https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=600&q=80", // Placeholder image for markdown files
            excerpt: "Read more about this topic...",
            content: fileContent
          });
        }
      }

      // Re-render the UI now that the GitHub files have been added to the array
      renderPosts(searchInput ? searchInput.value.trim() : "");

    } catch (error) {
      console.error('Error fetching CMS posts:', error);
    }
  }

  // Trigger the fetch immediately
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
        
        // Decode the content safely so quotes don't break the HTML
        const content = decodeURIComponent(encodedContent);
        
        const badgeText = post.querySelector('.pill-badge')?.textContent?.trim() || 'Article';

        document.getElementById('modal-title').textContent = title;
        document.getElementById('modal-meta').textContent = meta;
        document.getElementById('modal-img').src = imgSrc;
        
        // Replace newlines with <br> tags so Markdown paragraphs render properly in the modal
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
     5. Pagination Highlights (Blog Page)
     ========================================================= */
  const pageNumbers = document.querySelectorAll('.page-num');
  pageNumbers.forEach(num => {
    num.addEventListener('click', () => {
      pageNumbers.forEach(n => n.classList.remove('active'));
      num.classList.add('active');
    });
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