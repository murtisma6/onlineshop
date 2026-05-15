import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchStoreByUrl, fetchStoreProducts, fetchSellerStores, trackEvent } from '../api';
import ReviewModal from '../components/ReviewModal';
import { usePageSize } from '../hooks/usePageSize';
import { useInfiniteScroll } from '../hooks/useInfiniteScroll';

const Storefront = () => {
  const { uniqueUrl } = useParams();
  const navigate = useNavigate();
  const pageSize = usePageSize();
  const MEGA_PAGE_SIZE = 50;
  
  const [store, setStore] = useState(null);
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSubcategories, setSelectedSubcategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [siblingStores, setSiblingStores] = useState([]);
  const [reviewingProduct, setReviewingProduct] = useState(null);

  // Pagination / Scroll state
  const [megaPage, setMegaPage] = useState(0);
  const [chunkIndex, setChunkIndex] = useState(0);
  const [hasMoreChunks, setHasMoreChunks] = useState(true);
  const [totalElements, setTotalElements] = useState(0);

  useEffect(() => {
    loadStoreAndProducts();
  }, [uniqueUrl]);

  const loadStoreAndProducts = async () => {
    try {
      setLoading(true);
      const storeRes = await fetchStoreByUrl(uniqueUrl);
      const storeData = storeRes.data;
      setStore(storeData);

      // Initial load of products
      await loadChunk(storeData.id, 0, 0, false);

      if (storeData.sellerId) {
        const sellerStoresRes = await fetchSellerStores(storeData.sellerId);
        const others = sellerStoresRes.data.filter(s => s.id !== storeData.id);
        setSiblingStores(others);
      }
    } catch (err) {
      console.error('Failed to load store front', err);
      setError('Store not found or unavailable.');
    } finally {
      setLoading(false);
    }
  };

  const loadChunk = useCallback(async (storeId, mPage, cIndex, isAppend = false) => {
    if (!storeId) return;
    try {
      setLoading(true);
      const chunksPerMega = Math.ceil(MEGA_PAGE_SIZE / pageSize);
      const backendPage = (mPage * chunksPerMega) + cIndex;

      const params = {
        page: backendPage,
        size: pageSize,
      };

      const res = await fetchStoreProducts(storeId, params);
      const data = res.data;
      const newProducts = data.content || [];

      setProducts(prev => {
        const combined = isAppend ? [...prev, ...newProducts] : newProducts;
        return combined.slice(0, MEGA_PAGE_SIZE);
      });
      
      setTotalElements(data.totalElements || 0);
      
      const currentTotalLoaded = (isAppend ? products.length : 0) + newProducts.length;
      const reachedMegaCap = currentTotalLoaded >= MEGA_PAGE_SIZE;
      const isLastBackendPage = backendPage >= (data.totalPages - 1);
      
      setHasMoreChunks(!reachedMegaCap && !isLastBackendPage);

    } catch (err) {
      console.error('Failed to load products chunk', err);
    } finally {
      setLoading(false);
    }
  }, [pageSize, products.length]);

  const handleLoadMore = () => {
    if (!loading && hasMoreChunks && store) {
      const nextC = chunkIndex + 1;
      setChunkIndex(nextC);
      loadChunk(store.id, megaPage, nextC, true);
    }
  };

  const { sentinelRef } = useInfiniteScroll(handleLoadMore, hasMoreChunks, loading);

  const handleMegaPageChange = (newPage) => {
    setMegaPage(newPage);
    setChunkIndex(0);
    setProducts([]);
    setHasMoreChunks(true);
    if (store) loadChunk(store.id, newPage, 0, false);
    window.scrollTo({ top: 400, behavior: 'smooth' });
  };

  // Local filtering & sorting
  useEffect(() => {
    let filtered = [...products];
    if (selectedCategory) {
      filtered = filtered.filter(p => p.category === selectedCategory);
      if (selectedSubcategories.length > 0) {
        filtered = filtered.filter(p => selectedSubcategories.includes(p.subcategory));
      }
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(q) || 
        (p.description && p.description.toLowerCase().includes(q))
      );
    }
    if (sortBy === 'price-low') filtered.sort((a, b) => a.price - b.price);
    else if (sortBy === 'price-high') filtered.sort((a, b) => b.price - a.price);
    else if (sortBy === 'rating') filtered.sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0));
    else filtered.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

    setFilteredProducts(filtered);
  }, [selectedCategory, selectedSubcategories, searchQuery, sortBy, products]);

  const categoryMap = {};
  products.forEach(p => {
    if (p.category) {
      if (!categoryMap[p.category]) categoryMap[p.category] = new Set();
      if (p.subcategory) categoryMap[p.category].add(p.subcategory);
    }
  });

  if (loading && !store) {
    return <div style={{ display: 'flex', justifyContent: 'center', padding: '5rem' }}>Loading storefront...</div>;
  }

  if (error || !store) {
    return <div style={{ textAlign: 'center', padding: '5rem' }}><h2>Oops!</h2><p>{error || 'Store not found.'}</p></div>;
  }

  const totalMegaPages = Math.ceil(totalElements / MEGA_PAGE_SIZE);

  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Store Header Section */}
      <div style={{ 
        background: `linear-gradient(135deg, ${store.ribbonColor || '#4f46e5'} 0%, ${store.ribbonColor || '#3b82f6'} 80%)`, 
        color: '#ffffff', 
        padding: '2rem 1rem',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          {store.logoUrl && (
            <img src={store.logoUrl} alt={store.name} style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', border: '3px solid white', marginBottom: '1rem' }} />
          )}
          <h1 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '0.5rem' }}>{store.name}</h1>
          <p style={{ fontSize: '1.1rem', opacity: 0.9 }}>{store.headerTagline}</p>
        </div>
      </div>

      <div style={{ display: 'flex', flex: 1, position: 'relative' }}>
        {/* Mobile Backdrop */}
        {isSidebarOpen && window.innerWidth < 1024 && (
          <div 
            onClick={() => setIsSidebarOpen(false)}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(15, 23, 42, 0.4)',
              backdropFilter: 'blur(4px)',
              zIndex: 90
            }}
          />
        )}

        {/* Left Sidebar */}
        <aside style={{ 
          width: isSidebarOpen ? '260px' : '0px', 
          backgroundColor: '#ffffff', 
          borderRight: isSidebarOpen ? '1px solid #e2e8f0' : 'none',
          transition: 'all 0.3s ease',
          overflow: 'hidden',
          zIndex: 100,
          position: window.innerWidth < 1024 ? 'fixed' : 'sticky',
          top: window.innerWidth < 1024 ? '0' : '70px',
          height: window.innerWidth < 1024 ? '100vh' : 'calc(100vh - 70px)',
          boxShadow: isSidebarOpen && window.innerWidth < 1024 ? '4px 0 15px rgba(0,0,0,0.1)' : 'none'
        }}>
          <div style={{ width: '260px', padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#1e293b', margin: 0 }}>Filters</h2>
              <button 
                onClick={() => { setSelectedCategory(null); setSelectedSubcategories([]); setSearchQuery(''); }} 
                style={{ fontSize: '0.75rem', color: '#6366f1', background: 'none', border: 'none', fontWeight: '700', cursor: 'pointer' }}
              >
                Reset All
              </button>
            </div>

            <h3 style={{ fontSize: '0.85rem', textTransform: 'uppercase', color: '#94a3b8', letterSpacing: '1px', marginBottom: '1rem', fontWeight: '800' }}>Categories</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {Object.keys(categoryMap).sort().map(cat => (
                <div key={cat}>
                  <div 
                    onClick={() => setSelectedCategory(selectedCategory === cat ? null : cat)}
                    style={{ 
                      padding: '0.6rem 0.8rem', 
                      borderRadius: '0.5rem', 
                      cursor: 'pointer',
                      backgroundColor: selectedCategory === cat ? '#f5f7ff' : 'transparent',
                      color: selectedCategory === cat ? '#4f46e5' : '#475569',
                      fontWeight: selectedCategory === cat ? '700' : '500',
                      fontSize: '0.9rem',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    {cat}
                    <span style={{ fontSize: '0.8rem' }}>{selectedCategory === cat ? '−' : '+'}</span>
                  </div>
                  {selectedCategory === cat && (
                    <div style={{ marginLeft: '1rem', marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.4rem', borderLeft: '2px solid #eef2ff', paddingLeft: '1rem' }}>
                      {Array.from(categoryMap[cat]).sort().map(sub => (
                        <label key={sub} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.85rem', color: '#64748b' }}>
                          <input 
                            type="checkbox" 
                            checked={selectedSubcategories.includes(sub)}
                            onChange={(e) => {
                              if (e.target.checked) setSelectedSubcategories([...selectedSubcategories, sub]);
                              else setSelectedSubcategories(selectedSubcategories.filter(s => s !== sub));
                            }}
                          />
                          {sub}
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* Products Grid */}
        <main style={{ flex: 1, padding: '1.5rem', minWidth: 0 }}>
          <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="btn" style={{ border: '1px solid #e2e8f0', background: 'white', padding: '0.5rem 1rem' }}>
              {isSidebarOpen ? 'Hide Categories' : 'Show Categories'}
            </button>
            <div style={{ display: 'flex', gap: '0.75rem', flex: 1, justifyContent: 'flex-end', minWidth: '200px' }}>
              <div style={{ position: 'relative', flex: '0 1 300px' }}>
                <input 
                  type="text" 
                  placeholder="Search products..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ 
                    width: '100%',
                    padding: '0.6rem 1rem 0.6rem 2.5rem', 
                    borderRadius: '0.75rem', 
                    border: '1px solid #e2e8f0',
                    backgroundColor: '#ffffff',
                    fontSize: '0.9rem',
                    outline: 'none',
                    transition: 'border-color 0.2s'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#4f46e5'}
                  onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                />
                <svg style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" title="search" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              </div>

              <select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value)} 
                style={{ padding: '0.6rem 1rem', borderRadius: '0.75rem', border: '1px solid #e2e8f0', backgroundColor: '#ffffff', fontSize: '0.9rem', cursor: 'pointer' }}
              >
                <option value="newest">Newest First</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Top Rated</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1.5rem' }}>
            {filteredProducts.map(product => (
              <div 
                key={product.id} 
                className="glass" 
                style={{ borderRadius: '1rem', overflow: 'hidden', cursor: 'pointer', background: 'white', border: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column' }}
                onClick={() => navigate(`/product/${product.id}`)}
              >
                <div style={{ height: '180px', position: 'relative' }}>
                  <img src={product.imageUrls?.[0] || ''} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
                    {product.mrp > product.price && (
                      <div style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', backgroundColor: '#ef4444', color: 'white', padding: '0.2rem 0.5rem', borderRadius: '0.4rem', fontSize: '0.7rem', fontWeight: 'bold', zIndex: 2 }}>
                        {Math.round(((product.mrp - product.price) / product.mrp) * 100)}% OFF
                      </div>
                    )}
                  </div>

                  <div style={{ padding: '0.75rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                    {/* Store Row (Clickable) */}
                    <div 
                      onClick={(e) => {
                        e.stopPropagation();
                        if (product.storeUniqueUrl) navigate(`/store/${product.storeUniqueUrl}`);
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        marginBottom: '0.5rem',
                        cursor: 'pointer',
                        padding: '0.25rem 0',
                        borderBottom: '1px solid #f1f5f9'
                      }}
                    >
                      <div style={{ 
                        width: '18px', 
                        height: '18px', 
                        borderRadius: '50%', 
                        background: `linear-gradient(135deg, ${product.storeRibbonColor || '#4f46e5'}, ${product.storeRibbonColor || '#3b82f6'})`, 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        flexShrink: 0, 
                        overflow: 'hidden', 
                        fontSize: '0.6rem', 
                        fontWeight: '800', 
                        color: '#fff'
                      }}>
                        {product.storeLogoUrl ? (
                          <img src={product.storeLogoUrl} alt={product.storeName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          product.storeName ? product.storeName.charAt(0).toUpperCase() : 'S'
                        )}
                      </div>
                      <span style={{ fontSize: '0.7rem', fontWeight: '700', color: '#64748b' }}>
                        {product.storeName || 'Visit Store'}
                      </span>
                    </div>

                    <h4 style={{ margin: '0 0 0.25rem 0', fontSize: '0.9rem', fontWeight: '700', height: '2.2rem', overflow: 'hidden', lineHeight: 1.3 }}>{product.name}</h4>
                  
                  {/* Rating */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginBottom: '0.5rem' }}>
                    <div style={{ display: 'flex', color: '#fbbf24', fontSize: '0.7rem' }}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span key={star} style={{ opacity: star <= Math.round(product.averageRating || 0) ? 1 : 0.2 }}>★</span>
                      ))}
                    </div>
                    <span style={{ fontSize: '0.65rem', color: '#94a3b8' }}>({product.reviewCount || 0})</span>
                  </div>

                  {/* Description snippet */}
                  <p style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.75rem', height: '2rem', overflow: 'hidden', lineHeight: 1.3 }}>
                    {product.description}
                  </p>

                  <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      {product.mrp > product.price && <span style={{ fontSize: '0.7rem', color: '#94a3b8', textDecoration: 'line-through' }}>₹{product.mrp}</span>}
                      <span style={{ fontWeight: '800', color: '#1e293b', fontSize: '1rem' }}>₹{product.price}</span>
                    </div>
                    <button className="btn btn-primary" style={{ padding: '0.4rem 0.75rem', fontSize: '0.75rem', fontWeight: '700' }}>View</button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Infinite Scroll Sentinel */}
          <div ref={sentinelRef} style={{ height: '50px', display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '2rem' }}>
            {loading && products.length > 0 && <p style={{ color: '#64748b' }}>Loading more products...</p>}
          </div>

          {/* Mega Page Pagination */}
          {totalMegaPages > 1 && !hasMoreChunks && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginTop: '3rem', padding: '2rem', borderTop: '1px solid #e2e8f0' }}>
              <button 
                disabled={megaPage === 0}
                onClick={() => handleMegaPageChange(megaPage - 1)}
                className="btn"
                style={{ padding: '0.6rem 1.2rem', border: '1px solid #e2e8f0', background: megaPage === 0 ? '#f1f5f9' : 'white', cursor: megaPage === 0 ? 'not-allowed' : 'pointer' }}
              >
                ← Previous 50
              </button>
              <span style={{ fontWeight: 'bold', color: '#1e293b' }}>Page {megaPage + 1} of {totalMegaPages}</span>
              <button 
                disabled={megaPage >= totalMegaPages - 1}
                onClick={() => handleMegaPageChange(megaPage + 1)}
                className="btn"
                style={{ padding: '0.6rem 1.2rem', border: '1px solid #e2e8f0', background: megaPage >= totalMegaPages - 1 ? '#f1f5f9' : 'white', cursor: megaPage >= totalMegaPages - 1 ? 'not-allowed' : 'pointer' }}
              >
                Next 50 →
              </button>
            </div>
          )}
        </main>
      </div>

      {reviewingProduct && (
        <ReviewModal 
          productId={reviewingProduct.id} 
          productName={reviewingProduct.name} 
          onClose={() => setReviewingProduct(null)} 
          onReviewAdded={() => loadStoreAndProducts()}
        />
      )}
    </div>
  );
};

export default Storefront;
