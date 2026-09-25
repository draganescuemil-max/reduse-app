const initialQuery = '';
let searchPreferences = {};
let priceAlerts = {};
let monitoredProducts = [];
let favoriteStores = [];

async function loadSearchPreferences() {
  try {
    const response = await fetch('/api/preferences');
    if (response.ok) searchPreferences = await response.json();
  } catch (error) {
    searchPreferences = {};
  }
}

async function saveSearchPreference(query) {
  const intent = extractIntent(query);
  if (intent.brand === 'General' || intent.size === 'N/A') return;
  try {
    const response = await fetch('/api/preferences', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ brand: intent.brand, size: intent.size })
    });
    if (response.ok) searchPreferences = await response.json();
  } catch (error) {
    console.error('Preferinta nu a putut fi salvata pe server.', error);
  }
}

async function loadFavorites() {
  try {
    const response = await fetch('/api/favorites');
    if (response.ok) {
      const data = await response.json();
      state.favorites = Array.isArray(data.favorites) ? data.favorites : [];
      renderApp();
    }
  } catch (error) {
    state.favorites = [];
  }
}

async function toggleFavorite(productId) {
  const isFavorite = state.favorites.includes(productId);
  try {
    const response = await fetch(`/api/favorites/${productId}`, { method: isFavorite ? 'DELETE' : 'PUT' });
    if (!response.ok) return;
    const data = await response.json();
    state.favorites = data.favorites;
    if (Array.isArray(data.monitored)) monitoredProducts = data.monitored;
    if (state.tab === 'history') renderHistory(products.filter((product) => state.favorites.includes(product.id)));
    else if (state.tab === 'favorites') renderProducts(products.filter((product) => state.favorites.includes(product.id)));
    else renderApp();
  } catch (error) {
    console.error('Favoritul nu a putut fi actualizat pe server.', error);
  }
}

async function loadMonitored() {
  try {
    const response = await fetch('/api/monitored');
    if (response.ok) monitoredProducts = (await response.json()).monitored || [];
  } catch (error) {
    monitoredProducts = [];
  }
}

async function toggleMonitored(productId, button) {
  const isMonitored = monitoredProducts.includes(productId);
  const response = await fetch(`/api/monitored/${productId}`, { method: isMonitored ? 'DELETE' : 'PUT' });
  if (!response.ok) return;
  monitoredProducts = (await response.json()).monitored || [];
  if (button) button.textContent = monitoredProducts.includes(productId) ? 'Monitorizat' : 'Monitorizează';
  if (state.tab === 'monitor') renderMonitored();
}

async function loadFavoriteStores() {
  try {
    const response = await fetch('/api/store-favorites');
    if (response.ok) favoriteStores = (await response.json()).stores || [];
  } catch (error) {
    favoriteStores = [];
  }
}

async function toggleFavoriteStore(store, button) {
  const isFavorite = favoriteStores.includes(store);
  const response = await fetch(`/api/store-favorites/${encodeURIComponent(store)}`, { method: isFavorite ? 'DELETE' : 'PUT' });
  if (!response.ok) return;
  favoriteStores = (await response.json()).stores || [];
  if (button) button.textContent = favoriteStores.includes(store) ? '★' : '☆';
  if (state.tab === 'favorites') renderFavoriteStores();
}

function renderFavoriteStores() {
  const stores = verifiedStoreGroups.flatMap((group) => group.stores).filter(([store]) => favoriteStores.includes(store));
  const container = document.createElement('section');
  container.className = 'favorite-stores-card card';
  container.innerHTML = `<div class="section-header"><h2>Magazine favorite</h2><span>${stores.length}</span></div>${stores.length ? `<div class="favorite-store-list">${stores.map(([store, baseUrl]) => `<div class="favorite-store-row"><a href="${baseUrl}${encodeURIComponent(state.query || 'produse')}" target="_blank" rel="noreferrer"><span>${store}</span><strong>Deschide ↗</strong></a><button type="button" data-remove-store="${store}" title="Elimină magazinul">×</button></div>`).join('')}</div>` : '<p class="saved-copy">Salvează Nike.com, Fashion Days sau orice alt magazin din sursele verificate.</p>'}`;
  container.querySelectorAll('[data-remove-store]').forEach((button) => button.addEventListener('click', () => void toggleFavoriteStore(button.dataset.removeStore)));
  const existing = document.querySelector('.favorite-stores-card');
  if (existing) existing.replaceWith(container);
  else elements.productList.before(container);
}

function renderMonitored() {
  const list = products.filter((product) => monitoredProducts.includes(product.id));
  elements.insightPanel.innerHTML = '<p class="insight-title">Produse monitorizate</p><p class="saved-copy">Elimină individual produsele pe care nu mai vrei să le urmărești.</p>';
  if (!list.length) {
    elements.productList.innerHTML = '<article class="product-card card"><h3>Nu ai produse monitorizate</h3><p style="margin-top:8px; color: var(--muted);">Apasă „Monitorizează” pe un produs ca să-l adaugi aici.</p></article>';
    return;
  }
  renderProducts(list);
}

async function loadPriceAlerts() {
  try {
    const response = await fetch('/api/alerts');
    if (response.ok) priceAlerts = (await response.json()).alerts || {};
  } catch (error) {
    priceAlerts = {};
  }
}

async function savePriceAlert(productId, button) {
  const product = products.find((item) => item.id === productId);
  const input = document.querySelector(`[data-alert-input="${productId}"]`);
  const threshold = Number(input?.value);
  if (!product || !Number.isFinite(threshold) || threshold <= 0) {
    if (input) input.setCustomValidity('Introdu un prag mai mare decât 0.');
    input?.reportValidity();
    return;
  }
  input.setCustomValidity('');
  const response = await fetch(`/api/alerts/${productId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ threshold, product: { title: product.title, price: product.price, store: product.store, url: getOfferUrl(product) } })
  });
  if (!response.ok) return;
  const data = await response.json();
  priceAlerts[productId] = data.alert;
  button.textContent = data.notified ? 'Trimis pe Telegram' : 'Alertă salvată';
}

function renderAlertControls(product) {
  const alert = priceAlerts[product.id];
  return `<div class="alert-controls"><span>Anunță-mă sub</span><input type="number" min="1" step="1" placeholder="ex. 2000" value="${alert?.threshold || ''}" data-alert-input="${product.id}" aria-label="Prag alertă pentru ${product.title}"><span>lei</span><button type="button" class="alert-button" data-alert="${product.id}">${alert ? 'Actualizează' : 'Setează alertă'}</button></div>`;
}

function getEffectiveQuery(query) {
  const intent = extractIntent(query);
  if (intent.brand === 'General' || intent.size !== 'N/A') return query;
  const preference = searchPreferences[normalizeText(intent.brand)];
  return preference?.size ? `${query} ${preference.size}` : query;
}

const products = [
  {
    id: 1,
    title: 'Adidas Ultraboost 27.5 cm - original',
    brand: 'Adidas',
    category: 'Încălțăminte',
    variant: 'original',
    size: '27.5 cm',
    price: 499,
    oldPrice: 599,
    shipping: 19,
    discount: 17,
    cashback: 0,
    store: 'eMAG',
    stock: 'În stoc',
    reputation: 4.8,
    region: 'România'
  },
  {
    id: 2,
    title: 'Adidas Ultraboost 27.5 cm',
    brand: 'Adidas',
    category: 'Încălțăminte',
    variant: 'original',
    size: '27.5 cm',
    price: 529,
    oldPrice: 610,
    shipping: 0,
    discount: 13,
    cashback: 12,
    store: 'Altex',
    stock: 'În stoc',
    reputation: 4.7,
    region: 'România',
    url: 'https://altex.ro/cauta/?q=adidas%20ultraboost'
  },
  {
    id: 3,
    title: 'Brother TN-2420 compatibil',
    brand: 'Brother',
    category: 'Cartușe imprimante',
    variant: 'compatibil',
    size: 'TN-2420',
    price: 89,
    oldPrice: 129,
    shipping: 9,
    discount: 29,
    cashback: 0,
    store: 'PC Garage',
    stock: 'În stoc',
    reputation: 4.5,
    region: 'România'
  },
  {
    id: 4,
    title: 'Brother TN-2420 original',
    brand: 'Brother',
    category: 'Cartușe imprimante',
    variant: 'original',
    size: 'TN-2420',
    price: 119,
    oldPrice: 149,
    shipping: 15,
    discount: 20,
    cashback: 5,
    store: 'Laptopuri.ro',
    stock: 'În stoc',
    reputation: 4.4,
    region: 'România'
  },
  {
    id: 5,
    title: 'iPhone 16 256 GB',
    brand: 'Apple',
    category: 'Telefon',
    variant: 'original',
    size: '256 GB',
    price: 2899,
    oldPrice: 3299,
    shipping: 0,
    discount: 12,
    cashback: 40,
    store: 'iStyle',
    stock: 'În stoc',
    reputation: 4.9,
    region: 'România'
  },
  {
    id: 6,
    title: 'Samsung No Frost 350 l',
    brand: 'Samsung',
    category: 'Frigidere',
    variant: 'original',
    size: '350 l',
    price: 1899,
    oldPrice: 2199,
    shipping: 39,
    discount: 14,
    cashback: 35,
    store: 'Samsung Shop',
    stock: 'În stoc',
    reputation: 4.8,
    region: 'România'
  },
  {
    id: 7,
    title: 'LG OLED 55 inch',
    brand: 'LG',
    category: 'Televizor',
    variant: 'original',
    size: '55 inch',
    price: 2599,
    oldPrice: 2999,
    shipping: 25,
    discount: 13,
    cashback: 20,
    store: 'ElectroMarket',
    stock: 'Limitat',
    reputation: 4.6,
    region: 'România',
    url: 'https://www.emag.ro/search/lg%20oled%2055'
  },
  {
    id: 8,
    title: 'Bosch GSR 18V-90',
    brand: 'Bosch',
    category: 'Unelte',
    variant: 'original',
    size: '18V',
    price: 799,
    oldPrice: 899,
    shipping: 14,
    discount: 11,
    cashback: 10,
    store: 'ToolTop',
    stock: 'În stoc',
    reputation: 4.7,
    region: 'România'
  },
  {
    id: 9,
    title: 'TCL QD-MiniLED 55P8L 139 cm',
    brand: 'TCL',
    category: 'Televizor',
    variant: 'original',
    size: '139 cm',
    price: 2399,
    oldPrice: 2799,
    shipping: 0,
    discount: 14,
    cashback: 25,
    store: 'eMAG',
    stock: 'În stoc',
    reputation: 4.7,
    region: 'România',
    url: 'https://www.emag.ro/televizor-tcl-qd-miniled-139-cm-smart-google-tv-4k-ultra-hd-144hz-clasa-f-model-2026-55p8l/pd/D81CPY2BM/'
  }
];

const state = {
  query: initialQuery,
  category: 'Toate',
  budget: 'all',
  variant: 'all',
  stock: 'all',
  favorites: [],
  tab: 'explore'
};

const elements = {
  searchInput: document.getElementById('searchInput'),
  searchButton: document.getElementById('searchButton'),
  productList: document.getElementById('productList'),
  recommendationCard: document.getElementById('recommendationCard'),
  insightPanel: document.getElementById('insightPanel'),
  categoryBar: document.getElementById('categoryBar'),
  filterPanel: document.getElementById('filterPanel'),
  budgetFilter: document.getElementById('budgetFilter'),
  variantFilter: document.getElementById('variantFilter'),
  stockFilter: document.getElementById('stockFilter'),
  bestPrice: document.getElementById('bestPrice'),
  bestStore: document.getElementById('bestStore'),
  savings: document.getElementById('savings'),
  availability: document.getElementById('availability')
};

const categoryGroups = [
  { label: 'Toate', items: ['Toate'] },
  { label: 'Electrocasnice', items: ['Frigidere', 'Mașini de spălat', 'Mașini de spălat vase'] },
  { label: 'Casă & Scule', items: ['Cartușe imprimante', 'Detergenți', 'Unelte'] },
  { label: 'Fashion', items: ['Încălțăminte', 'Îmbrăcăminte'] },
  { label: 'Electronice', items: ['Telefon', 'Televizor'] }
];

function formatMoney(value) {
  return new Intl.NumberFormat('ro-RO', {
    style: 'currency',
    currency: 'RON',
    maximumFractionDigits: 0
  }).format(value);
}

function getOfferUrl(product) {
  return product.url || `https://www.google.com/search?q=${encodeURIComponent(`${product.brand} ${product.title} ${product.store}`)}`;
}

function getOfferLinks(product) {
  const search = encodeURIComponent(product.title);
  return [
    { store: product.store, price: product.price, url: getOfferUrl(product), label: 'Oferta gasita' },
    { store: 'Altex', price: Math.round(product.price * 1.04), url: `https://altex.ro/cauta/?q=${search}`, label: 'Compara pretul' },
    { store: 'Flanco', price: Math.round(product.price * 1.08), url: `https://www.flanco.ro/catalogsearch/result/?q=${search}`, label: 'Compara pretul' }
  ];
}

const verifiedStoreGroups = [
  {
    label: 'Multi-brand',
    stores: [
      ['Fashion Days', 'https://www.fashiondays.ro/search?q='],
      ['About You', 'https://www.aboutyou.ro/s?query='],
      ['Answear', 'https://answear.ro/s?search='],
      ['Zalando', 'https://www.zalando.ro/catalog/?q='],
      ['Peek & Cloppenburg', 'https://www.peek-cloppenburg.com/ro/search?query=']
    ]
  },
  {
    label: 'Sneakers & sport',
    stores: [
      ['Buzz Sneakers', 'https://www.buzzsneakers.ro/search?query='],
      ['Sizeer', 'https://sizeer.ro/search?text='],
      ['Footshop', 'https://www.footshop.ro/ro/cautare?query='],
      ['Sport Vision', 'https://www.sportvision.ro/search?query=']
    ]
  },
  {
    label: 'Branduri oficiale',
    stores: [
      ['Nike.com', 'https://www.nike.com/ro/w?q='],
      ['Adidas.ro', 'https://www.adidas.ro/search?q='],
      ['Puma.com', 'https://eu.puma.com/ro/ro/search?q='],
      ['New Balance', 'https://www.newbalance.eu/en-ro/search?q='],
      ['Under Armour', 'https://www.underarmour.ro/ro-ro/search?q='],
      ['Timberland', 'https://www.timberland.ro/search?q='],
      ['Tommy Hilfiger', 'https://ro.tommy.com/search?q='],
      ['Calvin Klein', 'https://www.calvinklein.ro/search?q=']
    ]
  }
];

function renderVerifiedSources(product) {
  const search = encodeURIComponent(product.title);
  return `<section class="verified-sources"><div class="verified-heading"><strong>Caută și în magazine verificate</strong><span>linkuri de căutare</span></div>${verifiedStoreGroups.map((group) => `<div class="verified-group"><span class="verified-group-label">${group.label}</span><div class="verified-links">${group.stores.map(([store, baseUrl]) => `<span class="verified-store-link"><a href="${baseUrl}${search}" target="_blank" rel="noreferrer">${store} ↗</a><button type="button" class="store-favorite-button" data-store-favorite="${store}" title="Salvează magazinul">${favoriteStores.includes(store) ? '★' : '☆'}</button></span>`).join('')}</div></div>`).join('')}</section>`;
}

function normalizeText(value) {
  return String(value || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function extractIntent(query) {
  const text = normalizeText(query);
  const brandKeywords = ['adidas', 'new balance', 'brother', 'samsung', 'lg', 'bosch', 'iphone', 'apple', 'tcl'];
  const brand = brandKeywords.find((entry) => text.includes(entry)) || 'General';
  const budgetMatch = text.match(/(?:pana|până|sub|max|maxim)\s*(\d+)\s*(?:lei|ron)?/i) || text.match(/\b(\d+)\s*(?:lei|ron)\b/i);
  const sizeMatch = text.match(/(?:^|\s)(\d+(?:[.,]\d+)?)\s*(cm|mm|inch|gb|l|kg)\b/i);
  const variant = text.includes('compatibil') ? 'compatibil' : text.includes('original') ? 'original' : 'standard';

  const category = text.includes('cartus') || text.includes('toner') || text.includes('cartuș')
    ? 'Cartușe imprimante'
    : text.includes('telefon') || text.includes('iphone')
      ? 'Telefon'
      : text.includes('frigider')
        ? 'Frigidere'
        : text.includes('televizor') || text.includes('oled') || text.includes('miniled') || text.includes('tcl')
          ? 'Televizor'
          : text.includes('bosch') || text.includes('masina') || text.includes('mașină')
            ? 'Unelte'
            : text.includes('adidas') || text.includes('pantof') || text.includes('incaltaminte')
              ? 'Încălțăminte'
              : 'General';

  return {
    brand: brand.charAt(0).toUpperCase() + brand.slice(1),
    budget: budgetMatch ? Number((budgetMatch[0].match(/\d+/) || ['0'])[0]) : 'N/A',
    size: sizeMatch ? `${sizeMatch[1]} ${sizeMatch[2]}` : 'N/A',
    variant,
    category,
    region: 'România'
  };
}

function scoreOffer(product, intent) {
  const priceScore = 1000 / Math.max(product.price, 100);
  const shippingScore = product.shipping === 0 ? 35 : 20 - product.shipping / 3;
  const reputationScore = product.reputation * 20;
  const discountScore = product.discount * 2.4;
  const cashbackScore = product.cashback * 1.8;
  const stockScore = product.stock === 'În stoc' ? 18 : 8;
  const variantScore = product.variant === intent.variant || intent.variant === 'standard' ? 12 : 0;
  const brandMatchScore = normalizeText(product.brand).includes(normalizeText(intent.brand)) || intent.brand === 'General' ? 15 : 0;
  const categoryScore = product.category === intent.category || intent.category === 'General' ? 12 : 0;

  return priceScore + shippingScore + reputationScore + discountScore + cashbackScore + stockScore + variantScore + brandMatchScore + categoryScore;
}

function filterProducts() {
  if (!state.query.trim()) return [];
  const effectiveQuery = getEffectiveQuery(state.query);
  const query = normalizeText(effectiveQuery).replace(/[^a-z0-9]/g, '');
  const intent = extractIntent(effectiveQuery);

  return products.filter((product) => {
    const haystack = normalizeText(`${product.title} ${product.brand} ${product.category} ${product.variant} ${product.size}`).replace(/[^a-z0-9]/g, '');
    const textMatch = !query || haystack.includes(query) || normalizeText(product.brand).includes(query.split(' ')[0]);
    const categoryMatch = state.category === 'Toate' || product.category === state.category;
    const budgetMatch = state.budget === 'all' || product.price <= Number(state.budget);
    const variantMatch = state.variant === 'all' || product.variant === state.variant;
    const stockMatch = state.stock === 'all' || (state.stock === 'in-stock' ? product.stock === 'În stoc' : product.stock === 'Limitat');
    const intentMatch = !query || normalizeText(product.brand).includes(normalizeText(intent.brand)) || product.category === intent.category || product.variant === intent.variant;

    return textMatch && categoryMatch && budgetMatch && variantMatch && stockMatch && intentMatch;
  }).sort((a, b) => scoreOffer(b, intent) - scoreOffer(a, intent));
}

function renderCategoryBar() {
  elements.categoryBar.innerHTML = categoryGroups.map((group) => `
    <div class="category-group">
      <span class="category-label">${group.label}</span>
      <div class="category-options">
        ${group.items.map((category) => `<button type="button" class="category-pill ${state.category === category ? 'active' : ''}" data-category="${category}">${category}</button>`).join('')}
      </div>
    </div>
  `).join('');

  elements.categoryBar.querySelectorAll('.category-pill').forEach((button) => {
    button.addEventListener('click', () => {
      state.category = button.dataset.category;
      renderApp();
    });
  });
}

function renderInsight() {
  if (!state.query.trim()) {
    elements.insightPanel.innerHTML = '<p class="insight-title">Pregătit pentru căutare</p><p class="saved-copy">Introdu un produs pentru a vedea prețuri, magazine și oferte.</p>';
    return;
  }
  const intent = extractIntent(getEffectiveQuery(state.query));

  elements.insightPanel.innerHTML = `
    <p class="insight-title">Inteligență AI</p>
    <div class="intent-grid">
      <div class="intent-pill"><strong>Brand</strong>${intent.brand}</div>
      <div class="intent-pill"><strong>Categorie</strong>${intent.category}</div>
      <div class="intent-pill"><strong>Buget</strong>${intent.budget === 'N/A' ? 'N/A' : formatMoney(Number(intent.budget))}</div>
      <div class="intent-pill"><strong>Mărime</strong>${intent.size}</div>
      <div class="intent-pill"><strong>Variantă</strong>${intent.variant}</div>
      <div class="intent-pill"><strong>Piață</strong>${intent.region}</div>
    </div>
  `;
}

function renderRecommendation(list) {
  if (!list.length && !state.query.trim()) {
    elements.bestPrice.textContent = '—';
    elements.bestStore.textContent = 'Așteaptă căutarea';
    elements.savings.textContent = '—';
    elements.availability.textContent = '—';
    elements.recommendationCard.innerHTML = '<div class="empty-search-card"><strong>Caută un produs</strong><span>Rezultatele și ofertele vor apărea aici.</span></div>';
    return;
  }
  const best = list[0] || products[0];
  const links = getOfferLinks(best);

  elements.bestPrice.textContent = formatMoney(best.price);
  elements.bestStore.textContent = best.store;
  elements.savings.textContent = `-${formatMoney(best.oldPrice - best.price)}`;
  elements.availability.textContent = best.stock;

  elements.recommendationCard.innerHTML = `
    <div class="recommendation-header">
      <div class="recommendation-badge">${best.store.slice(0,2).toUpperCase()}</div>
      <div style="flex:1; min-width:0;">
        <p class="recommendation-title">${best.title}</p>
        <div class="recommendation-store">${best.store} · reputație ${best.reputation.toFixed(1)}/5</div>
      </div>
    </div>

    <div class="recommendation-price">${formatMoney(best.price)}</div>

    <div class="recommendation-meta">
      <span class="pill success">-${best.discount}% reducere</span>
      <span class="pill warning">Livrare ${best.shipping === 0 ? 'gratuită' : formatMoney(best.shipping)}</span>
      <span class="pill">${best.stock}</span>
    </div>

    <div class="offer-links" aria-label="Magazine care vand produsul">
      ${links.map((link, index) => `<a class="offer-link ${index === 0 ? 'best' : ''}" href="${link.url}" target="_blank" rel="noreferrer"><span>${link.store}</span><strong>${formatMoney(link.price)}</strong><small>${link.label} ↗</small></a>`).join('')}
    </div>

    ${renderVerifiedSources(best)}

    <div class="recommendation-footer">
      <button type="button" class="secondary-button" data-favorite="${best.id}">${state.favorites.includes(best.id) ? '★ Salvat' : '☆ Salvează'}</button>
      <a class="primary-button" href="${getOfferUrl(best)}" target="_blank" rel="noreferrer">Vezi ofertă</a>
    </div>
  `;

  elements.recommendationCard.querySelector('[data-favorite]').addEventListener('click', () => void toggleFavorite(best.id));
  elements.recommendationCard.querySelectorAll('[data-store-favorite]').forEach((button) => button.addEventListener('click', () => void toggleFavoriteStore(button.dataset.storeFavorite, button)));
}

function renderProducts(list) {
  if (!list.length) {
    if (!state.query.trim()) {
      elements.productList.innerHTML = '';
      return;
    }
    elements.productList.innerHTML = `
      <article class="product-card card">
        <h3>${state.query.trim() ? 'Nu există rezultate' : 'Rezultatele tale apar aici'}</h3>
        <p style="margin-top:8px; color: var(--muted);">${state.query.trim() ? 'Încearcă o altă căutare sau resetează filtrele.' : 'Introdu un produs în câmpul de mai sus pentru a începe.'}</p>
      </article>
    `;
    return;
  }

  elements.productList.innerHTML = list.map((product) => {
    const isFavorite = state.favorites.includes(product.id);
    const recommend = product.id === (list[0]?.id || product.id);
    const links = getOfferLinks(product);

    return `
      <article class="product-card card">
        <div class="product-upper">
          <span class="store-pill">${product.store}</span>
          ${recommend ? '<span class="pill success">Top recomandat</span>' : '<span class="pill">Popular</span>'}
        </div>

        <p class="product-name">${product.title}</p>

        <div class="product-meta">
          <span>${product.category}</span>
          <span>•</span>
          <span>${product.variant}</span>
          <span>•</span>
          <span>${product.size}</span>
        </div>

        <div class="product-price-row">
          <div class="price-block">
            <span class="product-price">${formatMoney(product.price)}</span>
            <span class="product-old-price">${product.oldPrice ? formatMoney(product.oldPrice) : ''}</span>
          </div>

          <div class="product-badges">
            <span class="success">-${product.discount}%</span>
            <span class="warning">${product.shipping === 0 ? 'Livrare gratis' : `Livrare ${formatMoney(product.shipping)}`}</span>
            ${product.cashback ? `<span class="success">Cashback ${product.cashback} lei</span>` : '<span class="danger">Fără cashback</span>'}
          </div>
        </div>

        <div class="compact-offers">
          ${links.map((link, index) => `<a class="compact-offer ${index === 0 ? 'best' : ''}" href="${link.url}" target="_blank" rel="noreferrer"><span>${link.store}</span><strong>${formatMoney(link.price)}</strong><span>↗</span></a>`).join('')}
        </div>

        ${renderAlertControls(product)}

        <div class="product-footer">
          <button type="button" class="favorite-toggle ${isFavorite ? 'is-on' : ''}" data-favorite="${product.id}">
            ${isFavorite ? '★ Salvat' : '☆ Salvează'}
          </button>
          <a class="secondary-button" href="${getOfferUrl(product)}" target="_blank" rel="noreferrer">Vezi ofertă</a>
          <button type="button" class="monitor-toggle ${monitoredProducts.includes(product.id) ? 'is-on' : ''}" data-monitor="${product.id}">${monitoredProducts.includes(product.id) ? 'Monitorizat' : 'Monitorizează'}</button>
        </div>
      </article>
    `;
  }).join('');

  elements.productList.querySelectorAll('[data-favorite]').forEach((button) => {
    button.addEventListener('click', () => {
      const productId = Number(button.dataset.favorite);
      void toggleFavorite(productId);
    });
  });
  elements.productList.querySelectorAll('[data-alert]').forEach((button) => {
    button.addEventListener('click', () => void savePriceAlert(Number(button.dataset.alert), button));
  });
  elements.productList.querySelectorAll('[data-monitor]').forEach((button) => {
    button.addEventListener('click', () => void toggleMonitored(Number(button.dataset.monitor), button));
  });
}

function renderHistory(list) {
  if (!list.length) {
    elements.productList.innerHTML = '<article class="product-card card"><h3>Nu există istoric încă</h3><p style="margin-top:8px; color: var(--muted);">Caută un produs sau salvează-l la Favorite pentru a urmări prețul.</p></article>';
    return;
  }

  elements.productList.innerHTML = list.map((product) => {
    const points = [
      { date: '10 aug', price: product.oldPrice, store: product.store },
      { date: '17 aug', price: Math.round(product.oldPrice * 0.96), store: product.store },
      { date: '24 aug', price: Math.round(product.oldPrice * 0.92), store: 'Altex' },
      { date: '31 aug', price: Math.round(product.oldPrice * 0.88), store: product.store },
      { date: 'Azi', price: product.price, store: product.store }
    ];
    const highest = Math.max(...points.map((point) => point.price));
    return `<article class="history-card card"><div class="history-card-header"><div><span class="store-pill">${product.store}</span><h3>${product.title}</h3></div><strong>${formatMoney(product.price)}</strong></div><div class="history-graph">${points.map((point) => `<div class="history-point"><div class="history-bar" style="height:${Math.max(24, Math.round((point.price / highest) * 92))}px"></div><strong>${formatMoney(point.price)}</strong><span>${point.date}</span><small>${point.store}</small></div>`).join('')}</div>${renderAlertControls(product)}<div class="history-actions"><a class="secondary-button history-link" href="${getOfferUrl(product)}" target="_blank" rel="noreferrer">Vezi oferta actuală ↗</a><button class="favorite-toggle is-on history-remove" type="button" data-remove-favorite="${product.id}">Șterge complet</button></div></article>`;
  }).join('');

  elements.productList.querySelectorAll('[data-remove-favorite]').forEach((button) => {
    button.addEventListener('click', () => {
      const productId = Number(button.dataset.removeFavorite);
      void toggleFavorite(productId);
    });
  });
  elements.productList.querySelectorAll('[data-alert]').forEach((button) => {
    button.addEventListener('click', () => void savePriceAlert(Number(button.dataset.alert), button));
  });
}

function renderApp() {
  const list = filterProducts();
  renderCategoryBar();
  renderInsight();
  renderRecommendation(list);
  renderProducts(list);
}

function runSearch() {
  state.query = elements.searchInput.value.trim() || initialQuery;
  if (state.query) void saveSearchPreference(state.query);
  renderApp();
}

function bindEvents() {
  elements.searchButton.addEventListener('click', runSearch);
  elements.searchInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      runSearch();
    }
  });

  document.querySelectorAll('.chip').forEach((chip) => {
    chip.addEventListener('click', () => {
      elements.searchInput.value = chip.textContent.trim();
      state.query = chip.textContent.trim();
      renderApp();
    });
  });

  document.getElementById('toggleFilters').addEventListener('click', () => {
    elements.filterPanel.classList.toggle('hidden');
  });

  document.getElementById('resetFilters').addEventListener('click', () => {
    state.category = 'Toate';
    state.budget = 'all';
    state.variant = 'all';
    state.stock = 'all';
    elements.budgetFilter.value = 'all';
    elements.variantFilter.value = 'all';
    elements.stockFilter.value = 'all';
    renderApp();
  });

  elements.budgetFilter.addEventListener('change', (event) => {
    state.budget = event.target.value;
    renderApp();
  });

  elements.variantFilter.addEventListener('change', (event) => {
    state.variant = event.target.value;
    renderApp();
  });

  elements.stockFilter.addEventListener('change', (event) => {
    state.stock = event.target.value;
    renderApp();
  });

  document.querySelectorAll('.nav-button').forEach((button) => {
    button.addEventListener('click', () => {
      document.querySelectorAll('.nav-button').forEach((item) => item.classList.toggle('active', item === button));
      state.tab = button.dataset.tab;

      if (state.tab === 'favorites') {
        state.category = 'Toate';
        const list = products.filter((product) => state.favorites.includes(product.id));
        elements.insightPanel.innerHTML = `<p class="insight-title">Produsele mele</p><p class="saved-copy">Aici găsești prețul actual și cele mai bune magazine pentru produsele salvate.</p>`;
        renderProducts(list);
        renderFavoriteStores();
      } else if (state.tab === 'monitor') {
        renderMonitored();
      } else if (state.tab === 'history') {
        const list = products.filter((product) => state.favorites.includes(product.id));
        elements.insightPanel.innerHTML = '<p class="insight-title">Istoric preț</p><p class="saved-copy">Compară cum a urcat sau a coborât prețul și deschide oferta actuală.</p>';
        renderHistory(list);
      } else {
        renderApp();
      }
    });
  });
}

elements.searchInput.value = '';
elements.budgetFilter.value = 'all';
elements.variantFilter.value = 'all';
elements.stockFilter.value = 'all';
bindEvents();
renderApp();
void loadSearchPreferences();
void loadFavorites();
void loadPriceAlerts();
void loadMonitored();
void loadFavoriteStores();
