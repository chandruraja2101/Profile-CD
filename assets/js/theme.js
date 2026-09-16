(function () {
  const themeUrl = 'content/settings/index.json?v=2';
  const validThemes = new Set(['classic', 'bento']);

  const addBentoInterface = () => {
    const cursor = document.getElementById('cursor');
    if (cursor) {
      cursor.classList.remove('hidden');
      cursor.classList.add('bento-cursor');
      for (let index = 0; index < 5; index += 1) {
        const trail = document.createElement('span');
        trail.className = 'bento-cursor-trail';
        trail.style.setProperty('--trail-index', index);
        cursor.appendChild(trail);
      }
    }

    document.querySelectorAll('nav a[href^="#"], nav a[href*="portfolio"]').forEach((link, index) => {
      const icon = document.createElement('span');
      icon.className = 'bento-nav-icon';
      icon.setAttribute('aria-hidden', 'true');
      icon.dataset.icon = String(index % 6);
      link.prepend(icon);
    });

    document.querySelectorAll('.expertise').forEach((item, index) => {
      const icon = document.createElement('span');
      icon.className = 'bento-capability-icon';
      icon.dataset.icon = String(index % 5);
      icon.setAttribute('aria-hidden', 'true');
      item.querySelector('h3')?.prepend(icon);
    });
  };

  fetch(themeUrl)
    .then((response) => {
      if (!response.ok) throw new Error(`Theme settings request failed: ${response.status}`);
      return response.json();
    })
    .then((settings) => {
      const theme = validThemes.has(settings.theme) ? settings.theme : 'classic';
      document.body.dataset.theme = theme;
      document.documentElement.dataset.theme = theme;
      if (theme === 'bento') addBentoInterface();
    })
    .catch((error) => {
      console.error('Unable to load theme settings.', error);
    });
})();
