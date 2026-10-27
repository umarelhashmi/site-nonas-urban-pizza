(() => {
  const items = Array.isArray(window.NONAS_MENU_ITEMS) ? window.NONAS_MENU_ITEMS : [];
  const itemByUuid = new Map(items.map((it) => [it.uuid, it]));
  const itemByName = new Map(items.map((it) => [it.name, it]));

  // Spotlight elements (Desktop Sticky Peel)
  const spotlightImg = document.getElementById('spotlightImg');
  const spotlightBadge = document.getElementById('spotlightBadge');
  const spotlightCat = document.getElementById('spotlightCat');
  const spotlightPrice = document.getElementById('spotlightPrice');
  const spotlightName = document.getElementById('spotlightName');
  const spotlightDesc = document.getElementById('spotlightDesc');
  const spotlightMods = document.getElementById('spotlightMods');

  // Mobile sheet elements
  const sheetBackdrop = document.getElementById('mobileSheetBackdrop');
  const sheetCloseBtn = document.getElementById('sheetCloseBtn');
  const sheetImg = document.getElementById('sheetItemImg');
  const sheetBadge = document.getElementById('sheetItemBadge');
  const sheetName = document.getElementById('sheetItemName');
  const sheetPrice = document.getElementById('sheetItemPrice');
  const sheetDesc = document.getElementById('sheetItemDesc');
  const sheetMods = document.getElementById('sheetItemMods');

  function buildModChipsHtml(item) {
    if (!item.customizations || !item.customizations.length) return '';
    const chips = [];
    for (const grp of item.customizations) {
      const sample = (grp.options || []).slice(0, 4).join(', ');
      if (sample) {
        chips.push(`<span class="mod-chip"><b>${grp.title}:</b> ${sample}</span>`);
      }
    }
    return chips.join('');
  }

  function updateSpotlight(item, openMobileSheet = false) {
    if (!item) return;

    // Update active state on rotary peel medallions
    document.querySelectorAll('.peel-medallion').forEach((btn) => {
      btn.classList.toggle('is-active', btn.dataset.peelUuid === item.uuid);
    });

    // Update active state on menu tickets
    document.querySelectorAll('.menu-ticket').forEach((card) => {
      card.classList.toggle('is-selected', card.dataset.uuid === item.uuid);
    });

    if (spotlightName) {
      spotlightName.textContent = item.name;
      spotlightCat.textContent = item.category;
      spotlightPrice.textContent = item.price;
      spotlightDesc.textContent = item.description || '';
      if (item.image) {
        spotlightImg.src = item.image;
        spotlightImg.alt = item.name;
        spotlightImg.parentElement.style.display = 'block';
      } else {
        spotlightImg.src = 'assets/menu/store-hero-banner.webp';
        spotlightImg.alt = item.name;
      }
      if (item.badge) {
        spotlightBadge.textContent = item.badge;
        spotlightBadge.style.display = 'inline-block';
      } else {
        spotlightBadge.style.display = 'none';
      }
      spotlightMods.innerHTML = buildModChipsHtml(item);
    }

    if (openMobileSheet && window.innerWidth <= 1024 && sheetBackdrop) {
      sheetName.textContent = item.name;
      sheetPrice.textContent = item.price;
      sheetDesc.textContent = item.description || '';
      if (item.image) {
        sheetImg.src = item.image;
        sheetImg.alt = item.name;
        sheetImg.style.display = 'block';
      } else {
        sheetImg.style.display = 'none';
      }
      if (item.badge) {
        sheetBadge.textContent = item.badge;
        sheetBadge.style.display = 'inline-block';
      } else {
        sheetBadge.style.display = 'none';
      }
      sheetMods.innerHTML = buildModChipsHtml(item);
      sheetBackdrop.hidden = false;
    }
  }

  // Initialize with #1 most liked item
  if (items.length) {
    const firstFeatured = itemByName.get('Extra Large Cheese Pizza 16"') || items[0];
    updateSpotlight(firstFeatured, false);
  }

  // Bind rotary peel medallions
  document.querySelectorAll('.peel-medallion').forEach((btn) => {
    btn.addEventListener('click', () => {
      const it = itemByUuid.get(btn.dataset.peelUuid);
      updateSpotlight(it, true);
    });
  });

  // Bind menu tickets
  document.querySelectorAll('.menu-ticket').forEach((card) => {
    card.addEventListener('click', () => {
      const it = itemByUuid.get(card.dataset.uuid);
      updateSpotlight(it, true);
    });
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const it = itemByUuid.get(card.dataset.uuid);
        updateSpotlight(it, true);
      }
    });
  });

  // Bind hero triptych quick-select links
  document.querySelectorAll('[data-select-item]').forEach((link) => {
    link.addEventListener('click', () => {
      const targetName = link.getAttribute('data-select-item');
      const it = itemByName.get(targetName);
      if (it) updateSpotlight(it, false);
    });
  });

  // Close mobile sheet
  if (sheetCloseBtn && sheetBackdrop) {
    sheetCloseBtn.addEventListener('click', () => {
      sheetBackdrop.hidden = true;
    });
    sheetBackdrop.addEventListener('click', (e) => {
      if (e.target === sheetBackdrop) sheetBackdrop.hidden = true;
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !sheetBackdrop.hidden) {
        sheetBackdrop.hidden = true;
      }
    });
  }

  // Rotary wheel scroll controls
  const peelTrack = document.getElementById('peelTrack');
  const prevBtn = document.getElementById('wheelPrevBtn');
  const nextBtn = document.getElementById('wheelNextBtn');
  if (peelTrack && prevBtn && nextBtn) {
    prevBtn.addEventListener('click', () => {
      peelTrack.scrollBy({ left: -340, behavior: 'smooth' });
    });
    nextBtn.addEventListener('click', () => {
      peelTrack.scrollBy({ left: 340, behavior: 'smooth' });
    });
  }

  // Category & search filtering
  let activeCategory = 'ALL';
  let searchQuery = '';

  const catButtons = document.querySelectorAll('.cat-pill');
  const searchInput = document.getElementById('menuSearchInput');
  const catSections = document.querySelectorAll('.menu-category-block');

  function applyFilters() {
    const q = searchQuery.trim().toLowerCase();

    catSections.forEach((sec) => {
      const secCat = sec.getAttribute('data-cat-section');
      const tickets = sec.querySelectorAll('.menu-ticket');
      let visibleCount = 0;

      tickets.forEach((t) => {
        const it = itemByUuid.get(t.dataset.uuid);
        const matchesCat =
          activeCategory === 'ALL' ||
          (activeCategory === 'FEATURED' && t.dataset.featured === 'true') ||
          secCat === activeCategory;

        const matchesQuery =
          !q ||
          (it &&
            (it.name.toLowerCase().includes(q) ||
              (it.description && it.description.toLowerCase().includes(q)) ||
              it.category.toLowerCase().includes(q)));

        const show = matchesCat && matchesQuery;
        t.style.display = show ? '' : 'none';
        if (show) visibleCount++;
      });

      sec.style.display = visibleCount > 0 ? '' : 'none';
    });
  }

  catButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      catButtons.forEach((b) => b.classList.remove('is-active'));
      btn.classList.add('is-active');
      activeCategory = btn.getAttribute('data-filter') || 'ALL';
      applyFilters();
    });
  });

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value || '';
      applyFilters();
    });
  }
})();
