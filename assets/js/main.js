// Haven Homes — shared interactions + listings logic
const money = n => '$' + n.toLocaleString('en-US');
const img = (seed, w = 900, h = 650) => `https://picsum.photos/seed/${seed}/${w}/${h}`;

async function loadListings() {
  // Prefer the live PHP endpoint; fall back to embedded data on static hosting.
  try {
    const res = await fetch('listings.php');
    if (!res.ok) throw new Error('backend unavailable');
    const out = await res.json();
    if (out.ok && Array.isArray(out.listings)) return { listings: out.listings, live: true };
    throw new Error('bad payload');
  } catch (e) {
    return { listings: window.HAVEN_LISTINGS || [], live: false };
  }
}

function cardHTML(p) {
  return `<div class="col-md-6 col-lg-4 reveal visible">
    <article class="card-home">
      <div class="position-relative">
        <a href="property.html?id=${p.id}"><img src="${img(p.image)}" alt="${p.title}" loading="lazy"></a>
        <span class="badge badge-type">${p.type}</span>
        <span class="badge badge-price">${money(p.price)}</span>
      </div>
      <div class="card-body p-4">
        <h3 class="h5"><a href="property.html?id=${p.id}" class="text-decoration-none text-dark">${p.title}</a></h3>
        <p class="text-muted small mb-2">${p.address}</p>
        <p class="spec mb-3"><strong>${p.beds}</strong> beds &nbsp;·&nbsp; <strong>${p.baths}</strong> baths &nbsp;·&nbsp; <strong>${p.sqft.toLocaleString()}</strong> sq ft</p>
        <a href="property.html?id=${p.id}" class="btn btn-outline-navy btn-sm">View details</a>
      </div>
    </article>
  </div>`;
}

function showDemoNote(el) {
  // Shown only when the PHP backend is absent — honest about the data source.
  if (!el) return;
  el.innerHTML = `<div class="alert alert-info mb-4"><strong>Demo mode — no backend connected.</strong> Listings are loaded from the embedded demo data in <code>assets/js/data.js</code>. On a PHP host, <code>listings.php</code> serves them live from <code>data/listings.json</code>.</div>`;
}

document.addEventListener('DOMContentLoaded', async () => {
  // Scroll reveal
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); } });
  }, { threshold: 0.1 });
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));
  const y = document.getElementById('year'); if (y) y.textContent = new Date().getFullYear();

  // ---- Home: featured listings (first 3) ----
  const featured = document.getElementById('featured-listings');
  if (featured) {
    const { listings, live } = await loadListings();
    if (!live) showDemoNote(document.getElementById('demo-note'));
    featured.innerHTML = listings.slice(0, 3).map(cardHTML).join('');
  }

  // ---- Listings page: search / filter / sort ----
  const grid = document.getElementById('listings-grid');
  if (grid) {
    const { listings, live } = await loadListings();
    if (!live) showDemoNote(document.getElementById('demo-note'));
    const q = document.getElementById('q'), type = document.getElementById('type'),
          maxPrice = document.getElementById('max-price'), minBeds = document.getElementById('min-beds'),
          sort = document.getElementById('sort'), count = document.getElementById('result-count');
    function render() {
      let out = listings.filter(p => {
        const hay = (p.title + ' ' + p.city + ' ' + p.address).toLowerCase();
        if (q.value.trim() && !hay.includes(q.value.trim().toLowerCase())) return false;
        if (type.value && p.type !== type.value) return false;
        if (maxPrice.value && p.price > +maxPrice.value) return false;
        if (minBeds.value && p.beds < +minBeds.value) return false;
        return true;
      });
      if (sort.value === 'price-asc') out.sort((a, b) => a.price - b.price);
      if (sort.value === 'price-desc') out.sort((a, b) => b.price - a.price);
      if (sort.value === 'beds-desc') out.sort((a, b) => b.beds - a.beds);
      if (sort.value === 'sqft-desc') out.sort((a, b) => b.sqft - a.sqft);
      count.textContent = out.length + (out.length === 1 ? ' home found' : ' homes found');
      grid.innerHTML = out.length ? out.map(cardHTML).join('')
        : '<div class="col-12"><div class="alert alert-warning">No homes match those filters. Try widening the price or clearing the search.</div></div>';
    }
    [q, type, maxPrice, minBeds, sort].forEach(el => el.addEventListener('input', render));
    document.getElementById('clear-filters').addEventListener('click', () => {
      [q, type, maxPrice, minBeds, sort].forEach(el => el.value = ''); render();
    });
    render();
  }

  // ---- Property detail page ----
  const detail = document.getElementById('property-detail');
  if (detail) {
    const id = +(new URLSearchParams(location.search).get('id') || 0);
    const { listings, live } = await loadListings();
    if (!live) showDemoNote(document.getElementById('demo-note'));
    const p = listings.find(x => x.id === id);
    if (!p) {
      detail.innerHTML = '<div class="alert alert-warning">That listing could not be found. <a href="listings.html">Browse all homes</a>.</div>';
      return;
    }
    document.title = p.title + ' — Haven Homes';
    const thumbs = p.gallery.map((g, i) =>
      `<div class="col-4"><img src="${img(g, 400, 300)}" class="gallery-thumb${i === 0 ? ' active' : ''}" data-seed="${g}" alt="Photo ${i + 1} of ${p.title}"></div>`).join('');
    detail.innerHTML = `
      <div class="row g-4">
        <div class="col-lg-7">
          <img id="main-photo" src="${img(p.gallery[0])}" class="gallery-main" alt="${p.title}">
          <div class="row g-3 mt-2">${thumbs}</div>
        </div>
        <div class="col-lg-5">
          <span class="badge bg-dark mb-2">${p.type}</span>
          <h1 class="h2">${p.title}</h1>
          <p class="text-muted">${p.address}</p>
          <p class="h3" style="color:var(--teal)">${money(p.price)}</p>
          <p class="spec fs-6"><strong>${p.beds}</strong> beds · <strong>${p.baths}</strong> baths · <strong>${p.sqft.toLocaleString()}</strong> sq ft</p>
          <p>${p.description}</p>
          <h2 class="h5 mt-4">Features</h2>
          <ul>${p.features.map(f => `<li>${f}</li>`).join('')}</ul>
          <div class="card p-3 mt-4" style="background:var(--sand)">
            <strong>${p.agent}</strong><span class="text-muted small">${p.agentRole} · ${p.agentPhone}</span>
            <span class="text-muted small">${p.agentEmail}</span>
          </div>
        </div>
      </div>`;
    document.querySelectorAll('.gallery-thumb').forEach(t => t.addEventListener('click', () => {
      document.getElementById('main-photo').src = img(t.dataset.seed);
      document.querySelectorAll('.gallery-thumb').forEach(x => x.classList.remove('active'));
      t.classList.add('active');
    }));
    // Contact form
    document.getElementById('property-id').value = p.id;
    document.getElementById('contact-property').textContent = p.title;
    const form = document.getElementById('contact-form');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const status = document.getElementById('contact-status');
      const data = Object.fromEntries(new FormData(form).entries());
      const btn = form.querySelector('button[type=submit]');
      btn.disabled = true; btn.textContent = 'Sending…';
      try {
        const res = await fetch('contact.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error('backend unavailable');
        const out = await res.json();
        if (!out.ok) throw new Error(out.error || 'validation failed');
        status.className = 'alert alert-success';
        status.innerHTML = `<strong>Message sent!</strong> ${out.message} Reference: <strong>${out.reference || ''}</strong>`;
        form.reset();
      } catch (err) {
        // No PHP backend — clearly-labelled demo state, never a fake submission.
        status.className = 'alert alert-info';
        status.innerHTML = `<strong>Demo mode — no backend connected.</strong> Your message was <em>not</em> actually sent. ` +
          `On a PHP host this form posts to <code>contact.php</code> and reaches the listing agent. ` +
          `Demo summary: message about “${p.title}” from ${data.name} (${data.email}).`;
      } finally {
        btn.disabled = false; btn.textContent = 'Send message';
        status.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });
  }
});
