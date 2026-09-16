(function () {
  const grid = document.getElementById('portfolio-grid');
  const categoryCards = document.querySelectorAll('[data-portfolio-category]');
  if (!grid && !categoryCards.length) return;

  const contentUrl = 'content/portfolio/index.json';
  const category = grid ? grid.dataset.category : '';
  const grouped = grid ? grid.dataset.grouped === 'true' : false;

  const createElement = (tag, className, text) => {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text !== undefined) element.textContent = text;
    return element;
  };

  const safeUrl = (value) => {
    if (typeof value !== 'string' || !value.trim()) return '';

    try {
      const url = new URL(value, window.location.href);
      if (url.protocol === 'http:' || url.protocol === 'https:') return url.href;
    } catch (error) {
      return '';
    }

    return '';
  };

  const getVideoEmbedUrl = (value) => {
    const url = safeUrl(value);
    if (!url) return '';

    if (url.hostname === 'youtu.be') {
      return `https://www.youtube.com/embed/${url.pathname.slice(1)}`;
    }

    if (url.hostname === 'youtube.com' || url.hostname === 'www.youtube.com') {
      const videoId = url.searchParams.get('v');
      return videoId ? `https://www.youtube.com/embed/${videoId}` : '';
    }

    if (url.hostname === 'vimeo.com' || url.hostname === 'www.vimeo.com') {
      const videoId = url.pathname.split('/').filter(Boolean).pop();
      return videoId && /^\d+$/.test(videoId) ? `https://player.vimeo.com/video/${videoId}` : '';
    }

    return '';
  };

  const getCategory = (item) => (
    item.category === 'New category' && typeof item.custom_category === 'string'
      ? item.custom_category.trim()
      : item.category
  );

  const renderCategoryCounts = (items) => {
    categoryCards.forEach((card) => {
      const count = items.filter((item) => item && typeof item === 'object' && getCategory(item) === card.dataset.portfolioCategory).length;
      const countElement = card.querySelector('[data-project-count]');
      if (countElement) countElement.textContent = count;
    });
  };

  const formatDate = (value) => {
    const date = new Date(value);
    return Number.isNaN(date.getTime())
      ? ''
      : date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const renderCard = (item) => {
    const card = createElement(
      'article',
      'portfolio-card group overflow-hidden rounded-xl border line bg-[#1a1a1a] transition duration-500 hover:-translate-y-1 hover:border-[#555] hover:bg-[#202020]'
    );
    const media = createElement('div', 'aspect-[16/10] overflow-hidden border-b line bg-[#0d0d0d]');
    const thumbnailUrl = safeUrl(item.thumbnail);
    const videoEmbedUrl = item.media_type === 'video' ? getVideoEmbedUrl(item.video_url) : '';

    if (videoEmbedUrl) {
      const video = createElement('iframe', 'h-full w-full', '');
      video.src = videoEmbedUrl;
      video.title = item.title || 'Portfolio video';
      video.loading = 'lazy';
      video.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
      video.allowFullscreen = true;
      media.appendChild(video);
    } else if (thumbnailUrl) {
      const image = createElement('img', 'h-full w-full object-cover transition duration-700 group-hover:scale-105');
      image.src = thumbnailUrl;
      image.alt = item.title || 'Portfolio project thumbnail';
      image.loading = 'lazy';
      media.appendChild(image);
    } else {
      media.appendChild(createElement('div', 'h-full w-full bg-[radial-gradient(circle_at_25%_20%,rgba(255,90,36,.35),transparent_40%),radial-gradient(circle_at_75%_75%,rgba(99,213,255,.25),transparent_40%)]'));
    }

    const body = createElement('div', 'p-6');
    const meta = createElement('div', 'mb-3 flex items-center justify-between gap-3');
    meta.appendChild(createElement('span', 'mono text-[10px] uppercase tracking-[.16em] text-[#777]', formatDate(item.date)));
    if (item.featured) meta.appendChild(createElement('span', 'mono orange text-[10px] uppercase tracking-[.16em]', 'Featured'));
    body.appendChild(meta);
    body.appendChild(createElement('h3', 'display text-2xl font-semibold', item.title || 'Untitled project'));
    body.appendChild(createElement('p', 'mt-4 leading-relaxed text-[#aaa]', item.description || ''));

    if (Array.isArray(item.tags) && item.tags.length) {
      const tags = createElement('div', 'mt-5 flex flex-wrap gap-2');
      item.tags.forEach((tag) => tags.appendChild(createElement('span', 'rounded-full border line px-3 py-1 mono text-[10px] uppercase tracking-[.08em] text-[#aaa]', tag)));
      body.appendChild(tags);
    }

    const linkUrl = safeUrl(item.project_link);
    if (linkUrl) {
      const link = createElement('a', 'mt-6 inline-flex text-sm font-semibold text-[#ff5a24] transition hover:text-[#ff825b]', 'View project ↗');
      link.href = linkUrl;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      body.appendChild(link);
    }

    const viewerUrl = safeUrl(item.interactive_3d_viewer);
    if (viewerUrl) {
      const viewer = createElement('a', 'mt-3 inline-flex text-sm font-semibold text-[#63d5ff] transition hover:text-white', 'Open interactive viewer ↗');
      viewer.href = viewerUrl;
      viewer.target = '_blank';
      viewer.rel = 'noopener noreferrer';
      body.appendChild(viewer);
    }

    card.appendChild(media);
    card.appendChild(body);
    return card;
  };

  const renderPortfolio = (items) => {
    if (!grid) return;

    const projects = items
      .filter((item) => item && typeof item === 'object')
      .filter((item) => !category || getCategory(item) === category)
      .sort((a, b) => {
        if (Boolean(a.featured) !== Boolean(b.featured)) return a.featured ? -1 : 1;
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      });

    grid.replaceChildren();
    if (!projects.length) {
      grid.appendChild(createElement('p', 'text-[#999]', 'No portfolio projects available yet.'));
      return;
    }

    grid.replaceChildren();
    if (grouped) {
      const builtInGroups = ['Designs', 'Motion Graphics', '3D'];
      const customGroups = [...new Set(projects.map(getCategory))]
        .filter((groupName) => groupName && !builtInGroups.includes(groupName));
      [...builtInGroups, ...customGroups].forEach((groupName) => {
        const group = projects.filter((project) => getCategory(project) === groupName);
        if (!group.length) return;
        const section = createElement('section', 'mb-16');
        section.appendChild(createElement('h2', 'display mb-7 text-3xl font-bold uppercase', groupName));
        const groupGrid = createElement('div', 'grid gap-8 md:grid-cols-2');
        group.forEach((project) => groupGrid.appendChild(renderCard(project)));
        section.appendChild(groupGrid);
        grid.appendChild(section);
      });
      return;
    }

    grid.className = 'grid gap-8 md:grid-cols-2';
    projects.forEach((project) => grid.appendChild(renderCard(project)));
  };

  fetch(contentUrl)
    .then((response) => {
      if (!response.ok) throw new Error(`Portfolio data request failed: ${response.status}`);
      return response.json();
    })
    .then((items) => {
      if (!Array.isArray(items)) throw new Error('Portfolio data must be an array');
      renderCategoryCounts(items);
      renderPortfolio(items);
    })
    .catch((error) => {
      console.error('Unable to load portfolio projects.', error);
      if (grid) grid.replaceChildren(createElement('p', 'text-[#999]', 'Portfolio projects are currently unavailable.'));
    });
})();
