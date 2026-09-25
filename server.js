const express = require('express');
const cors = require('cors');
require('dotenv').config();
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;
const preferencesPath = path.join(__dirname, 'data', 'search-preferences.json');

fs.mkdirSync(path.dirname(preferencesPath), { recursive: true });
if (!fs.existsSync(preferencesPath)) fs.writeFileSync(preferencesPath, '{}\n', 'utf8');

function readPreferencesFile() {
  return JSON.parse(fs.readFileSync(preferencesPath, 'utf8'));
}

function writePreferencesFile(preferences) {
  fs.writeFileSync(preferencesPath, `${JSON.stringify(preferences, null, 2)}\n`, 'utf8');
}

async function sendTelegramMessage(message) {
  if (!process.env.TELEGRAM_TOKEN || !process.env.TELEGRAM_CHAT_ID) return false;
  const response = await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: process.env.TELEGRAM_CHAT_ID, text: message, disable_web_page_preview: true })
  });
  return response.ok;
}

async function checkPriceAlert(alert) {
  if (alert.currentPrice > alert.threshold || alert.lastNotifiedPrice === alert.currentPrice) return false;
  const message = `Oferta buna!\n${alert.title}\nPret: ${alert.currentPrice} lei\nPragul tau: ${alert.threshold} lei\nMagazin: ${alert.store}\n${alert.url}`;
  const sent = await sendTelegramMessage(message);
  if (sent) alert.lastNotifiedPrice = alert.currentPrice;
  return sent;
}

async function runScheduledPriceCheck() {
  const preferences = readPreferencesFile();
  const monitored = Array.isArray(preferences.monitored) ? preferences.monitored : [];
  const alerts = preferences.alerts || {};
  return {
    checkedAt: new Date().toISOString(),
    monitoredCount: monitored.length,
    alertsCount: Object.keys(alerts).length,
    checked: 0,
    notified: 0,
    skipped: monitored.length,
    message: 'Checkerul este pregatit; sursele reale de pret trebuie conectate inainte de publicare.'
  };
}

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/app.js', (req, res) => {
  res.sendFile(path.join(__dirname, 'app.js'));
});

app.get('/styles.css', (req, res) => {
  res.sendFile(path.join(__dirname, 'styles.css'));
});

app.get('/api/health', (req, res) => {
  res.json({ ok: true, service: 'reduse-app', port: PORT });
});

app.get('/api/products', (req, res) => {
  res.json({
    items: [
      {
        id: 1,
        title: 'Adidas Ultraboost 27.5 cm',
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
        region: 'România',
        url: 'https://www.emag.ro/search/adidas%20ultraboost%2027.5%20cm'
      },
      {
        id: 2,
        title: 'Brother TN-2420 compatibil',
        brand: 'Brother',
        category: 'Cartuș',
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
        region: 'România',
        url: 'https://www.pcgarage.ro/cauta/tn-2420/'
      }
    ]
  });
});

app.get('/api/preferences', (req, res) => {
  try {
    res.json(JSON.parse(fs.readFileSync(preferencesPath, 'utf8')));
  } catch (error) {
    res.status(500).json({ error: 'Preferintele nu au putut fi citite.' });
  }
});

app.put('/api/preferences', (req, res) => {
  const { brand, size } = req.body || {};
  if (typeof brand !== 'string' || typeof size !== 'string' || !brand.trim() || !size.trim()) {
    return res.status(400).json({ error: 'Brandul si marimea sunt obligatorii.' });
  }

  try {
    const preferences = JSON.parse(fs.readFileSync(preferencesPath, 'utf8'));
    preferences[brand.trim().toLowerCase()] = {
      size: size.trim(),
      updatedAt: new Date().toISOString()
    };
    fs.writeFileSync(preferencesPath, `${JSON.stringify(preferences, null, 2)}\n`, 'utf8');
    res.json(preferences);
  } catch (error) {
    res.status(500).json({ error: 'Preferinta nu a putut fi salvata.' });
  }
});

app.get('/api/favorites', (req, res) => {
  try {
    const preferences = JSON.parse(fs.readFileSync(preferencesPath, 'utf8'));
    res.json({ favorites: Array.isArray(preferences.favorites) ? preferences.favorites : [] });
  } catch (error) {
    res.status(500).json({ error: 'Favoritele nu au putut fi citite.' });
  }
});

app.put('/api/favorites/:productId', (req, res) => {
  try {
    const productId = Number(req.params.productId);
    const preferences = JSON.parse(fs.readFileSync(preferencesPath, 'utf8'));
    const favorites = Array.isArray(preferences.favorites) ? preferences.favorites : [];
    const monitored = Array.isArray(preferences.monitored) ? preferences.monitored : [];
    preferences.favorites = favorites.includes(productId) ? favorites : [...favorites, productId];
    preferences.monitored = monitored.includes(productId) ? monitored : [...monitored, productId];
    fs.writeFileSync(preferencesPath, `${JSON.stringify(preferences, null, 2)}\n`, 'utf8');
    res.json({ favorites: preferences.favorites, monitored: preferences.monitored });
  } catch (error) {
    res.status(500).json({ error: 'Favoritul nu a putut fi salvat.' });
  }
});

app.delete('/api/favorites/:productId', (req, res) => {
  try {
    const productId = Number(req.params.productId);
    const preferences = JSON.parse(fs.readFileSync(preferencesPath, 'utf8'));
    preferences.favorites = (Array.isArray(preferences.favorites) ? preferences.favorites : []).filter((id) => id !== productId);
    preferences.monitored = (Array.isArray(preferences.monitored) ? preferences.monitored : []).filter((id) => id !== productId);
    if (preferences.alerts) delete preferences.alerts[productId];
    fs.writeFileSync(preferencesPath, `${JSON.stringify(preferences, null, 2)}\n`, 'utf8');
    res.json({ favorites: preferences.favorites, monitored: preferences.monitored });
  } catch (error) {
    res.status(500).json({ error: 'Favoritul nu a putut fi sters.' });
  }
});

app.get('/api/monitored', (req, res) => {
  try {
    const preferences = readPreferencesFile();
    res.json({ monitored: Array.isArray(preferences.monitored) ? preferences.monitored : [] });
  } catch (error) {
    res.status(500).json({ error: 'Produsele monitorizate nu au putut fi citite.' });
  }
});

app.put('/api/monitored/:productId', (req, res) => {
  try {
    const productId = Number(req.params.productId);
    const preferences = readPreferencesFile();
    const monitored = Array.isArray(preferences.monitored) ? preferences.monitored : [];
    preferences.monitored = monitored.includes(productId) ? monitored : [...monitored, productId];
    writePreferencesFile(preferences);
    res.json({ monitored: preferences.monitored });
  } catch (error) {
    res.status(500).json({ error: 'Produsul nu a putut fi monitorizat.' });
  }
});

app.delete('/api/monitored/:productId', (req, res) => {
  try {
    const productId = Number(req.params.productId);
    const preferences = readPreferencesFile();
    preferences.monitored = (Array.isArray(preferences.monitored) ? preferences.monitored : []).filter((id) => id !== productId);
    writePreferencesFile(preferences);
    res.json({ monitored: preferences.monitored });
  } catch (error) {
    res.status(500).json({ error: 'Produsul nu a putut fi scos din monitorizare.' });
  }
});

app.get('/api/store-favorites', (req, res) => {
  try {
    const preferences = readPreferencesFile();
    res.json({ stores: Array.isArray(preferences.favoriteStores) ? preferences.favoriteStores : [] });
  } catch (error) {
    res.status(500).json({ error: 'Magazinele favorite nu au putut fi citite.' });
  }
});

app.put('/api/store-favorites/:store', (req, res) => {
  try {
    const store = decodeURIComponent(req.params.store).trim();
    const preferences = readPreferencesFile();
    const stores = Array.isArray(preferences.favoriteStores) ? preferences.favoriteStores : [];
    preferences.favoriteStores = stores.includes(store) ? stores : [...stores, store];
    writePreferencesFile(preferences);
    res.json({ stores: preferences.favoriteStores });
  } catch (error) {
    res.status(500).json({ error: 'Magazinul nu a putut fi salvat.' });
  }
});

app.delete('/api/store-favorites/:store', (req, res) => {
  try {
    const store = decodeURIComponent(req.params.store).trim();
    const preferences = readPreferencesFile();
    preferences.favoriteStores = (Array.isArray(preferences.favoriteStores) ? preferences.favoriteStores : []).filter((item) => item !== store);
    writePreferencesFile(preferences);
    res.json({ stores: preferences.favoriteStores });
  } catch (error) {
    res.status(500).json({ error: 'Magazinul nu a putut fi sters.' });
  }
});

app.get('/api/alerts', (req, res) => {
  try {
    const preferences = readPreferencesFile();
    res.json({ alerts: preferences.alerts || {}, telegramConfigured: Boolean(process.env.TELEGRAM_TOKEN && process.env.TELEGRAM_CHAT_ID) });
  } catch (error) {
    res.status(500).json({ error: 'Alertele nu au putut fi citite.' });
  }
});

app.put('/api/alerts/:productId', async (req, res) => {
  const productId = Number(req.params.productId);
  const threshold = Number(req.body?.threshold);
  const product = req.body?.product || {};
  if (!Number.isFinite(productId) || !Number.isFinite(threshold) || threshold <= 0 || typeof product.title !== 'string') {
    return res.status(400).json({ error: 'Produsul si pragul de pret sunt obligatorii.' });
  }

  try {
    const preferences = readPreferencesFile();
    preferences.alerts = preferences.alerts || {};
    const alert = {
      productId,
      title: product.title.trim(),
      store: typeof product.store === 'string' ? product.store : 'Magazin necunoscut',
      url: typeof product.url === 'string' ? product.url : '',
      currentPrice: Number(product.price),
      threshold,
      updatedAt: new Date().toISOString(),
      lastNotifiedPrice: preferences.alerts[productId]?.lastNotifiedPrice
    };
    const notified = await checkPriceAlert(alert);
    preferences.alerts[productId] = alert;
    writePreferencesFile(preferences);
    res.json({ alert, notified, telegramConfigured: Boolean(process.env.TELEGRAM_TOKEN && process.env.TELEGRAM_CHAT_ID) });
  } catch (error) {
    res.status(500).json({ error: 'Alerta nu a putut fi salvata.' });
  }
});

app.delete('/api/alerts/:productId', (req, res) => {
  try {
    const preferences = readPreferencesFile();
    if (preferences.alerts) delete preferences.alerts[Number(req.params.productId)];
    writePreferencesFile(preferences);
    res.json({ alerts: preferences.alerts || {} });
  } catch (error) {
    res.status(500).json({ error: 'Alerta nu a putut fi stearsa.' });
  }
});

app.post('/api/jobs/check-prices', async (req, res) => {
  if (!process.env.CRON_SECRET || req.get('x-cron-secret') !== process.env.CRON_SECRET) {
    return res.status(401).json({ error: 'Neautorizat.' });
  }
  try {
    res.json({ ok: true, result: await runScheduledPriceCheck() });
  } catch (error) {
    res.status(500).json({ error: 'Verificarea preturilor a esuat.' });
  }
});

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin', 'index.html'));
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
