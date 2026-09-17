(function () {
  const themeUrl = `content/settings/theme.json?v=${Date.now()}`;
  const validThemes = new Set(['classic', 'bento']);

  const applyTheme = (theme) => {
    document.body.dataset.theme = theme;
    document.documentElement.dataset.theme = theme;
  };

  const setupBentoCursor = () => {
    if (!window.matchMedia('(pointer:fine)').matches) return;

    let cursor = document.getElementById('cursor');
    if (!cursor) {
      cursor = document.createElement('div');
      cursor.id = 'cursor';
      cursor.className = 'cursor-dot';
      cursor.setAttribute('aria-hidden', 'true');
      document.body.appendChild(cursor);
    }

    cursor.classList.remove('hidden');
    cursor.classList.add('bento-cursor');
    if (!cursor.querySelector('.bento-cursor-trail')) {
      for (let index = 0; index < 5; index += 1) {
        const trail = document.createElement('span');
        trail.className = 'bento-cursor-trail';
        trail.style.setProperty('--trail-index', index);
        cursor.appendChild(trail);
      }
    }

    window.addEventListener('pointermove', (event) => {
      cursor.style.left = `${event.clientX}px`;
      cursor.style.top = `${event.clientY}px`;
    });
  };

  const addBentoInterface = () => {
    setupBentoCursor();

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

  applyTheme('classic');

  fetch(themeUrl, { cache: 'no-store' })
    .then((response) => {
      if (!response.ok) throw new Error(`Theme settings request failed: ${response.status}`);
      return response.json();
    })
    .then((settings) => {
      const theme = validThemes.has(settings.theme) ? settings.theme : 'classic';
      applyTheme(theme);
      if (theme === 'bento') addBentoInterface();
    })
    .catch((error) => {
      console.error('Unable to load theme settings.', error);
    });
})();
