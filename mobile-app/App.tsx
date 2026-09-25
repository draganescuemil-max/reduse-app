import { StatusBar } from 'expo-status-bar';
import { useMemo, useState } from 'react';
import {
  Linking,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

type PricePoint = {
  date: string;
  price: number;
  store: string;
};

type Product = {
  id: number;
  title: string;
  store: string;
  price: number;
  oldPrice: number;
  shipping: number;
  discount: number;
  cashback: number;
  stock: string;
  category: string;
  variant: 'original' | 'compatibil';
  reputation: number;
  url: string;
  priceHistory: PricePoint[];
};

const products: Product[] = [
  {
    id: 1,
    title: 'Adidas Ultraboost 27.5 cm',
    store: 'eMAG',
    price: 499,
    oldPrice: 599,
    shipping: 19,
    discount: 17,
    cashback: 0,
    stock: 'În stoc',
    category: 'Încălțăminte',
    variant: 'original',
    reputation: 4.8,
    url: 'https://www.emag.ro/search/adidas%20ultraboost%2027.5%20cm',
    priceHistory: [
      { date: '10 aug', price: 579, store: 'eMAG' },
      { date: '17 aug', price: 569, store: 'eMAG' },
      { date: '24 aug', price: 549, store: 'Altex' },
      { date: '31 aug', price: 529, store: 'Altex' },
      { date: '07 sept', price: 519, store: 'eMAG' },
      { date: '14 sept', price: 499, store: 'eMAG' },
    ],
  },
  {
    id: 2,
    title: 'Adidas Ultraboost 27.5 cm',
    store: 'Altex',
    price: 529,
    oldPrice: 610,
    shipping: 0,
    discount: 13,
    cashback: 12,
    stock: 'În stoc',
    category: 'Încălțăminte',
    variant: 'original',
    reputation: 4.7,
    url: 'https://altex.ro/cauta/?q=adidas%20ultraboost',
    priceHistory: [
      { date: '10 aug', price: 610, store: 'Altex' },
      { date: '17 aug', price: 599, store: 'Altex' },
      { date: '24 aug', price: 579, store: 'eMAG' },
      { date: '31 aug', price: 559, store: 'Altex' },
      { date: '07 sept', price: 539, store: 'Altex' },
      { date: '14 sept', price: 529, store: 'Altex' },
    ],
  },
  {
    id: 3,
    title: 'Brother TN-2420 compatibil',
    store: 'PC Garage',
    price: 89,
    oldPrice: 129,
    shipping: 9,
    discount: 29,
    cashback: 0,
    stock: 'În stoc',
    category: 'Cartuș',
    variant: 'compatibil',
    reputation: 4.5,
    url: 'https://www.pcgarage.ro/cauta/tn-2420/',
    priceHistory: [
      { date: '10 aug', price: 119, store: 'PC Garage' },
      { date: '17 aug', price: 109, store: 'PC Garage' },
      { date: '24 aug', price: 109, store: 'PC Garage' },
      { date: '31 aug', price: 99, store: 'PC Garage' },
      { date: '07 sept', price: 95, store: 'PC Garage' },
      { date: '14 sept', price: 89, store: 'PC Garage' },
    ],
  },
  {
    id: 4,
    title: 'iPhone 16 256 GB',
    store: 'iStyle',
    price: 2899,
    oldPrice: 3299,
    shipping: 0,
    discount: 12,
    cashback: 40,
    stock: 'Limitat',
    category: 'Telefon',
    variant: 'original',
    reputation: 4.9,
    url: 'https://istyle.ro/catalogsearch/result/?q=iphone+16+256+gb',
    priceHistory: [
      { date: '10 aug', price: 3299, store: 'iStyle' },
      { date: '17 aug', price: 3199, store: 'iStyle' },
      { date: '24 aug', price: 3099, store: 'iStyle' },
      { date: '31 aug', price: 2999, store: 'iStyle' },
      { date: '07 sept', price: 2949, store: 'iStyle' },
      { date: '14 sept', price: 2899, store: 'iStyle' },
    ],
  },
  {
    id: 5,
    title: 'LG OLED 55 inch',
    store: 'ElectroMarket',
    price: 2599,
    oldPrice: 2999,
    shipping: 25,
    discount: 13,
    cashback: 20,
    stock: 'În stoc',
    category: 'Televizor',
    variant: 'original',
    reputation: 4.6,
    url: 'https://www.emag.ro/search/lg%20oled%2055',
    priceHistory: [
      { date: '10 aug', price: 2999, store: 'ElectroMarket' },
      { date: '17 aug', price: 2899, store: 'ElectroMarket' },
      { date: '24 aug', price: 2799, store: 'ElectroMarket' },
      { date: '31 aug', price: 2699, store: 'ElectroMarket' },
      { date: '07 sept', price: 2649, store: 'ElectroMarket' },
      { date: '14 sept', price: 2599, store: 'ElectroMarket' },
    ],
  },
  {
    id: 6,
    title: 'TCL QD-MiniLED 55P8L 139 cm',
    store: 'eMAG',
    price: 2399,
    oldPrice: 2799,
    shipping: 0,
    discount: 14,
    cashback: 25,
    stock: 'În stoc',
    category: 'Televizor',
    variant: 'original',
    reputation: 4.7,
    url: 'https://www.emag.ro/search/tcl%20qd-miniled%2055p8l',
    priceHistory: [
      { date: '10 aug', price: 2799, store: 'eMAG' },
      { date: '17 aug', price: 2699, store: 'eMAG' },
      { date: '24 aug', price: 2599, store: 'Altex' },
      { date: '31 aug', price: 2499, store: 'eMAG' },
      { date: '07 sept', price: 2449, store: 'eMAG' },
      { date: '14 sept', price: 2399, store: 'eMAG' },
    ],
  },
];

const quickSearches = ['Adidas 27.5 cm', 'Brother compatibil', 'iPhone 16 256 GB'];
const categories = ['Toate', 'Încălțăminte', 'Cartuș', 'Telefon', 'Televizor'];

const formatMoney = (value: number) => `${value.toLocaleString('ro-RO')} lei`;
const normalizeSearchText = (value: string) => value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '');

export default function App() {
  const [query, setQuery] = useState('Adidas Ultraboost 27.5 cm');
  const [category, setCategory] = useState('Toate');
  const [variant, setVariant] = useState<'toate' | Product['variant']>('toate');
  const [favorites, setFavorites] = useState<number[]>([1]);
  const [showFilters, setShowFilters] = useState(false);

  const submitSearch = (value: string) => {
    setQuery(value.trim());
    setCategory('Toate');
    setVariant('toate');
  };

  const filteredProducts = useMemo(() => {
    const queryTokens = query.split(/\s+/).map(normalizeSearchText).filter((token) => token.length > 1);
    const normalizedQuery = normalizeSearchText(query);
    return products.filter((product) => {
      const searchableProduct = normalizeSearchText(`${product.title} ${product.category} ${product.store}`);
      const matchesQuery = queryTokens.length === 0 || searchableProduct.includes(normalizedQuery) || queryTokens.every((token) => searchableProduct.includes(token));
      const matchesCategory = category === 'Toate' || product.category === category;
      const matchesVariant = variant === 'toate' || product.variant === variant;
      return matchesQuery && matchesCategory && matchesVariant;
    });
  }, [category, query, variant]);

  const recommended = filteredProducts[0] ?? products[0];
  const favoriteProducts = products.filter((product) => favorites.includes(product.id));
  const toggleFavorite = (id: number) => {
    setFavorites((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <View>
            <Text style={styles.kicker}>AI SHOPPING</Text>
            <Text style={styles.title}>Reduceri</Text>
          </View>
          <Pressable style={styles.filterButton} onPress={() => setShowFilters((current) => !current)}>
            <Text style={styles.filterIcon}>☰</Text>
            <Text style={styles.filterLabel}>Filtre</Text>
          </Pressable>
        </View>

        <View style={styles.searchPanel}>
          <Text style={styles.searchLabel}>Ce vrei să cumperi?</Text>
          <View style={styles.searchRow}>
            <Text style={styles.searchIcon}>⌕</Text>
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Adidas, toner, iPhone..."
              placeholderTextColor="#89939a"
              style={styles.input}
              returnKeyType="search"
            />
            <Pressable style={styles.searchButton} onPress={() => submitSearch(query)}>
              <Text style={styles.searchButtonText}>Caută</Text>
            </Pressable>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.quickRow}>
            {quickSearches.map((item) => (
              <Pressable key={item} style={styles.quickChip} onPress={() => submitSearch(item)}>
                <Text style={styles.quickText}>{item}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {showFilters && (
          <View style={styles.filterPanel}>
            <View style={styles.filterHeading}>
              <Text style={styles.sectionTitle}>Filtre</Text>
              <Pressable onPress={() => { setCategory('Toate'); setVariant('toate'); }}>
                <Text style={styles.resetText}>Resetează</Text>
              </Pressable>
            </View>
            <Text style={styles.filterCaption}>Tip produs</Text>
            <View style={styles.optionRow}>
              {(['toate', 'original', 'compatibil'] as const).map((item) => (
                <Pressable key={item} style={[styles.option, variant === item && styles.optionActive]} onPress={() => setVariant(item)}>
                  <Text style={[styles.optionText, variant === item && styles.optionTextActive]}>{item}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        )}

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryRow}>
          {categories.map((item) => (
            <Pressable key={item} style={[styles.categoryChip, category === item && styles.categoryActive]} onPress={() => setCategory(item)}>
              <Text style={[styles.categoryText, category === item && styles.categoryTextActive]}>{item}</Text>
            </Pressable>
          ))}
        </ScrollView>

        <View style={styles.insight}>
          <Text style={styles.insightMark}>✦</Text>
          <View style={styles.insightCopy}>
            <Text style={styles.insightTitle}>Am înțeles că vrei o ofertă bună</Text>
            <Text style={styles.insightText}>Compar prețul, transportul, reducerea și reputația magazinului.</Text>
          </View>
        </View>

        <View style={styles.metricsRow}>
          <Metric label="Cea mai bună ofertă" value={formatMoney(recommended.price)} detail={recommended.store} />
          <Metric label="Economii" value={`${recommended.discount}%`} detail="față de referință" />
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Oferta recomandată</Text>
          <Text style={styles.live}>LIVE</Text>
        </View>
        <OfferCard product={recommended} favorite={favorites.includes(recommended.id)} onFavorite={() => toggleFavorite(recommended.id)} />

        {favoriteProducts.length > 0 && (
          <FavoritePriceChart products={favoriteProducts} />
        )}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Produse relevante</Text>
          <Text style={styles.resultCount}>{filteredProducts.length} rezultate</Text>
        </View>
        {filteredProducts.length === 0 ? (
          <View style={styles.emptyState}><Text style={styles.emptyTitle}>Nu am găsit produse</Text><Text style={styles.emptyText}>Încearcă o altă căutare sau resetează filtrele.</Text></View>
        ) : filteredProducts.map((product) => (
          <OfferCard key={product.id} product={product} favorite={favorites.includes(product.id)} onFavorite={() => toggleFavorite(product.id)} compact />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

function Metric({ label, value, detail }: { label: string; value: string; detail: string }) {
  return <View style={styles.metric}><Text style={styles.metricLabel}>{label}</Text><Text style={styles.metricValue}>{value}</Text><Text style={styles.metricDetail}>{detail}</Text></View>;
}

function OfferCard({ product, favorite, onFavorite, compact = false }: { product: Product; favorite: boolean; onFavorite: () => void; compact?: boolean }) {
  return (
    <View style={[styles.offerCard, compact && styles.compactCard]}>
      <View style={styles.offerTopline}><Text style={styles.store}>{product.store}</Text><Pressable onPress={onFavorite}><Text style={styles.heart}>{favorite ? '♥' : '♡'}</Text></Pressable></View>
      <Text style={styles.productTitle}>{product.title}</Text>
      <View style={styles.offerDetails}><Text style={styles.stock}>{product.stock}</Text><Text style={styles.rating}>★ {product.reputation}</Text><Text style={styles.shipping}>{product.shipping === 0 ? 'Transport gratuit' : `Transport ${product.shipping} lei`}</Text></View>
      <View style={styles.priceRow}><View><Text style={styles.price}>{formatMoney(product.price)}</Text><Text style={styles.oldPrice}>{formatMoney(product.oldPrice)} · -{product.discount}%</Text></View><Pressable style={styles.openButton} onPress={() => Linking.openURL(product.url)}><Text style={styles.openButtonText}>Vezi oferta</Text></Pressable></View>
    </View>
  );
}

function FavoritePriceChart({ products: favoriteProducts }: { products: Product[] }) {
  return (
    <View style={styles.chartCard}>
      <View style={styles.sectionHeader}>
        <View><Text style={styles.chartTitle}>Prețuri favorite</Text><Text style={styles.chartSubtitle}>Fiecare punct este o verificare reală</Text></View>
        <Text style={styles.chartTrend}>↓ mai bine</Text>
      </View>
      {favoriteProducts.map((product) => {
        const prices = product.priceHistory.map((point) => point.price);
        const maximum = Math.max(...prices);
        const minimum = Math.min(...prices);
        const chartWidth = 300;
        const chartHeight = 142;
        const pointX = (index: number) => 12 + (index / Math.max(product.priceHistory.length - 1, 1)) * (chartWidth - 24);
        const pointY = (price: number) => 12 + ((maximum - price) / Math.max(maximum - minimum, 1)) * (chartHeight - 24);
        return (
          <View key={product.id} style={styles.chartProduct}>
            <View style={styles.chartProductHeader}><Text style={styles.chartProductName} numberOfLines={1}>{product.title}</Text><Text style={styles.chartCurrent}>{formatMoney(product.price)}</Text></View>
            <View style={[styles.lineChart, { height: chartHeight }]}>
              <View style={[styles.chartGridLine, { top: chartHeight * 0.25 }]} />
              <View style={[styles.chartGridLine, { top: chartHeight * 0.5 }]} />
              <View style={[styles.chartGridLine, { top: chartHeight * 0.75 }]} />
              {product.priceHistory.slice(0, -1).map((point, index) => {
                const nextPoint = product.priceHistory[index + 1];
                const startX = pointX(index);
                const startY = pointY(point.price);
                const endX = pointX(index + 1);
                const endY = pointY(nextPoint.price);
                const length = Math.sqrt((endX - startX) ** 2 + (endY - startY) ** 2);
                const angle = Math.atan2(endY - startY, endX - startX) * (180 / Math.PI);
                return <View key={`${product.id}-line-${index}`} style={[styles.chartLine, { left: startX, top: startY, width: length, transform: [{ rotate: `${angle}deg` }] }]} />;
              })}
              {product.priceHistory.map((point, index) => (
                <View key={`${product.id}-point-${index}`} style={[styles.chartPoint, index === product.priceHistory.length - 1 && styles.currentChartPoint, { left: pointX(index) - 5, top: pointY(point.price) - 5 }]} />
              ))}
            </View>
            <View style={styles.chartLabels}><Text style={styles.chartLabel}>{product.priceHistory[0].date}</Text><Text style={styles.chartSaving}>- {formatMoney(maximum - minimum)} față de maxim</Text><Text style={styles.chartLabel}>{product.priceHistory[product.priceHistory.length - 1].date}</Text></View>
            <View style={styles.historyList}>
              {product.priceHistory.map((point) => <View key={`${product.id}-${point.date}`} style={styles.historyRow}><Text style={styles.historyDate}>{point.date}</Text><Text style={styles.historyStore}>{point.store}</Text><Text style={styles.historyPrice}>{formatMoney(point.price)}</Text></View>)}
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f6f3ed' },
  container: { padding: 20, paddingBottom: 36 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 },
  kicker: { color: '#db5a3f', fontSize: 11, fontWeight: '800', letterSpacing: 2 },
  title: { color: '#192326', fontSize: 34, fontWeight: '800', marginTop: 2 },
  filterButton: { flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1, borderColor: '#d9d2c8', paddingHorizontal: 13, paddingVertical: 10, borderRadius: 12 },
  filterIcon: { color: '#db5a3f', fontSize: 16 },
  filterLabel: { color: '#303b3e', fontWeight: '700' },
  searchPanel: { backgroundColor: '#fffdf9', borderRadius: 18, padding: 16, borderWidth: 1, borderColor: '#e9e0d4', marginBottom: 16 },
  searchLabel: { color: '#192326', fontSize: 16, fontWeight: '800', marginBottom: 10 },
  searchRow: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#cfc7bb', borderRadius: 12, paddingLeft: 12, overflow: 'hidden' },
  searchIcon: { color: '#db5a3f', fontSize: 25, marginRight: 6 },
  input: { flex: 1, color: '#192326', fontSize: 14, paddingVertical: 13 },
  searchButton: { backgroundColor: '#db5a3f', paddingHorizontal: 14, paddingVertical: 14 },
  searchButtonText: { color: '#fff', fontWeight: '800' },
  quickRow: { gap: 8, paddingTop: 12 },
  quickChip: { backgroundColor: '#f2e9df', borderRadius: 20, paddingHorizontal: 11, paddingVertical: 8 },
  quickText: { color: '#6b5145', fontSize: 12, fontWeight: '600' },
  filterPanel: { backgroundColor: '#fffdf9', borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#e9e0d4' },
  filterHeading: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  resetText: { color: '#db5a3f', fontWeight: '700' },
  filterCaption: { color: '#697477', fontSize: 12, fontWeight: '700', marginTop: 14, marginBottom: 8 },
  optionRow: { flexDirection: 'row', gap: 8 },
  option: { borderWidth: 1, borderColor: '#d8d0c6', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 9 },
  optionActive: { borderColor: '#db5a3f', backgroundColor: '#fff0ea' },
  optionText: { color: '#697477', fontWeight: '600', textTransform: 'capitalize' },
  optionTextActive: { color: '#db5a3f' },
  categoryRow: { gap: 8, paddingBottom: 16 },
  categoryChip: { paddingHorizontal: 13, paddingVertical: 9, borderRadius: 18, backgroundColor: '#e8e3db' },
  categoryActive: { backgroundColor: '#192326' },
  categoryText: { color: '#687276', fontSize: 13, fontWeight: '700' },
  categoryTextActive: { color: '#fff' },
  insight: { flexDirection: 'row', backgroundColor: '#e4f0eb', borderRadius: 15, padding: 14, marginBottom: 14 },
  insightMark: { color: '#2c7964', fontSize: 22, marginRight: 10 },
  insightCopy: { flex: 1 },
  insightTitle: { color: '#244f43', fontWeight: '800', marginBottom: 3 },
  insightText: { color: '#477569', fontSize: 12, lineHeight: 17 },
  metricsRow: { flexDirection: 'row', gap: 10, marginBottom: 22 },
  metric: { flex: 1, backgroundColor: '#fffdf9', borderRadius: 14, padding: 13, borderWidth: 1, borderColor: '#e9e0d4' },
  metricLabel: { color: '#7a8587', fontSize: 11, fontWeight: '700' },
  metricValue: { color: '#192326', fontSize: 20, fontWeight: '800', marginTop: 6 },
  metricDetail: { color: '#db5a3f', fontSize: 11, marginTop: 3 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  sectionTitle: { color: '#192326', fontSize: 18, fontWeight: '800' },
  live: { color: '#2c7964', fontSize: 11, fontWeight: '800' },
  resultCount: { color: '#7a8587', fontSize: 12 },
  offerCard: { backgroundColor: '#fffdf9', borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#e9e0d4' },
  compactCard: { paddingVertical: 14 },
  offerTopline: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  store: { color: '#db5a3f', fontSize: 12, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1 },
  heart: { color: '#db5a3f', fontSize: 25 },
  productTitle: { color: '#192326', fontSize: 16, fontWeight: '800', marginTop: 7 },
  offerDetails: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 },
  stock: { color: '#2c7964', fontSize: 12, fontWeight: '700' },
  rating: { color: '#8b6d2f', fontSize: 12, fontWeight: '700' },
  shipping: { color: '#697477', fontSize: 12 },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 16 },
  price: { color: '#192326', fontSize: 23, fontWeight: '800' },
  oldPrice: { color: '#8b9594', fontSize: 12, textDecorationLine: 'line-through', marginTop: 2 },
  openButton: { backgroundColor: '#192326', borderRadius: 10, paddingHorizontal: 13, paddingVertical: 10 },
  openButtonText: { color: '#fff', fontSize: 12, fontWeight: '800' },
  emptyState: { alignItems: 'center', backgroundColor: '#fffdf9', padding: 28, borderRadius: 16 },
  emptyTitle: { color: '#192326', fontWeight: '800', fontSize: 16 },
  emptyText: { color: '#697477', marginTop: 6, textAlign: 'center' },
  chartCard: { backgroundColor: '#192326', borderRadius: 16, padding: 16, marginBottom: 22 },
  chartTitle: { color: '#f8f4ec', fontSize: 18, fontWeight: '800' },
  chartSubtitle: { color: '#aab5b2', fontSize: 11, marginTop: 3 },
  chartTrend: { color: '#91d4b8', fontSize: 11, fontWeight: '800' },
  chartProduct: { borderTopWidth: 1, borderTopColor: '#344447', paddingTop: 14, marginTop: 14 },
  chartProductHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 10 },
  chartProductName: { flex: 1, color: '#f8f4ec', fontSize: 13, fontWeight: '700' },
  chartCurrent: { color: '#f2b08c', fontSize: 12, fontWeight: '800' },
  lineChart: { position: 'relative', width: 300, maxWidth: '100%', marginTop: 12 },
  chartGridLine: { position: 'absolute', left: 0, right: 0, height: 1, backgroundColor: '#344447' },
  chartLine: { position: 'absolute', height: 3, backgroundColor: '#f2b08c', borderRadius: 2, transformOrigin: 'left center' },
  chartPoint: { position: 'absolute', width: 10, height: 10, borderRadius: 5, backgroundColor: '#f8f4ec', borderWidth: 2, borderColor: '#f2b08c' },
  currentChartPoint: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#db5a3f', borderColor: '#fff0e6' },
  chartLabels: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 7 },
  chartLabel: { color: '#91a09d', fontSize: 10 },
  chartSaving: { color: '#91d4b8', fontSize: 10, fontWeight: '700' },
  historyList: { marginTop: 12, gap: 5 },
  historyRow: { flexDirection: 'row', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#2d3b3e', paddingTop: 5 },
  historyDate: { width: 58, color: '#aab5b2', fontSize: 10 },
  historyStore: { flex: 1, color: '#d8e0dc', fontSize: 10 },
  historyPrice: { color: '#f8f4ec', fontSize: 11, fontWeight: '700' },
});
