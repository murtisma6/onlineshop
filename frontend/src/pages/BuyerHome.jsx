import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { fetchProducts, trackEvent, fetchActivePromotions, API_URL } from '../api';
import ReviewModal from '../components/ReviewModal';
import { usePageSize } from '../hooks/usePageSize';
import { useInfiniteScroll } from '../hooks/useInfiniteScroll';

const BuyerHome = ({ user }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const pageSize = usePageSize();
  const MEGA_PAGE_SIZE = 50;

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSubcategories, setSelectedSubcategories] = useState([]);
  const [selectedLocations, setSelectedLocations] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLocationFilterOpen, setIsLocationFilterOpen] = useState(false);
  const [reviewingProduct, setReviewingProduct] = useState(null);
  const [promotions, setPromotions] = useState([]);
  const [currentPromoIndex, setCurrentPromoIndex] = useState(0);

  // Pagination state
  const [megaPage, setMegaPage] = useState(0);
  const [chunkIndex, setChunkIndex] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [hasMoreChunks, setHasMoreChunks] = useState(true);

  // Category/location meta
  const [allCategories, setAllCategories] = useState({});
  const [allLocations, setAllLocations] = useState([]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const q = params.get('search');
    if (q !== null) {
      setSearchQuery(q);
      resetToFirstMegaPage();
      window.scrollTo({ top: 400, behavior: 'smooth' });
    }
  }, [location.search]);

  const resetToFirstMegaPage = () => {
    setMegaPage(0);
    setChunkIndex(0);
    setProducts([]);
    setHasMoreChunks(true);
  };

  const loadProducts = useCallback(async (mPage, cIndex, isAppend = false) => {
    try {
      setLoading(true);
      const chunksPerMega = Math.ceil(MEGA_PAGE_SIZE / pageSize);
      const backendPage = (mPage * chunksPerMega) + cIndex;

      const params = {
        page: backendPage,
        size: pageSize,
        sort: sortBy,
      };
      if (selectedCategory) params.category = selectedCategory;
      if (selectedSubcategories.length === 1) params.subcategory = selectedSubcategories[0];
      if (selectedLocations.length === 1) params.city = selectedLocations[0];
      if (searchQuery) params.search = searchQuery;

      const res = await fetchProducts(params);
      const data = res.data;
      
      const newProducts = data.content;
      setProducts(prev => {
        const combined = isAppend ? [...prev, ...newProducts] : newProducts;
        return combined.slice(0, MEGA_PAGE_SIZE);
      });
      
      setTotalElements(data.totalElements);

      const currentTotalLoaded = (isAppend ? products.length : 0) + newProducts.length;
      const reachedMegaCap = currentTotalLoaded >= MEGA_PAGE_SIZE;
      const isLastBackendPage = data.currentPage >= data.totalPages - 1;
      
      setHasMoreChunks(!reachedMegaCap && !isLastBackendPage);

      if (mPage === 0 && cIndex === 0) {
        trackEvent({ eventType: 'HOME_VIEW', userId: user ? user.id : null }).catch(() => {});
      }

      setAllCategories(prev => {
        const updated = { ...prev };
        newProducts.forEach(p => {
          if (p.category) {
            if (!updated[p.category]) updated[p.category] = new Set();
            if (p.subcategory) updated[p.category].add(p.subcategory);
          }
        });
        return updated;
      });
      setAllLocations(prev => {
        const locs = new Set(prev);
        newProducts.forEach(p => { if (p.sellerCity) locs.add(p.sellerCity); });
        return Array.from(locs).sort();
      });
    } catch (err) {
      console.error('Failed to fetch products', err);
    } finally {
      setLoading(false);
    }
  }, [pageSize, sortBy, selectedCategory, selectedSubcategories, selectedLocations, searchQuery, user?.id, products.length]);

  useEffect(() => {
    resetToFirstMegaPage();
    loadProducts(0, 0, false);
  }, [sortBy, selectedCategory, selectedSubcategories, selectedLocations, searchQuery, pageSize]);

  const loadMoreChunks = () => {
    if (!loading && hasMoreChunks) {
      const nextChunk = chunkIndex + 1;
      setChunkIndex(nextChunk);
      loadProducts(megaPage, nextChunk, true);
    }
  };

  const { sentinelRef } = useInfiniteScroll(loadMoreChunks, hasMoreChunks, loading);

  useEffect(() => {
    const loadPromotions = async () => {
      try {
        const res = await fetchActivePromotions();
        setPromotions(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error('Failed to load promotions', err);
        setPromotions([]);
      }
    };
    loadPromotions();
  }, []);

  // Auto-slide promotions
  useEffect(() => {
    if (promotions.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentPromoIndex(prev => (prev + 1) % promotions.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [promotions.length]);

  const handleMegaPageChange = (newPage) => {
    setMegaPage(newPage);
    setChunkIndex(0);
    setProducts([]);
    setHasMoreChunks(true);
    loadProducts(newPage, 0, false);
    window.scrollTo({ top: 400, behavior: 'smooth' });
  };

  const handleWhatsAppClick = (e, product) => {
    e.stopPropagation();
    const message = `Hi, I am interested in your product: ${product.name} (ID: ${product.id}). Is it available?`;
    const whatsappUrl = `https://wa.me/${product.sellerContact}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
    
    trackEvent({
      eventType: 'WHATSAPP_CLICK',
      productId: product.id,
      userId: user ? user.id : null
    }).catch(err => console.error(err));
  };

  const totalMegaPages = Math.ceil(totalElements / MEGA_PAGE_SIZE);

  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* Promotion Slider (Overlay Layout) */}
      {promotions.length > 0 && (
        <div style={{ 
          width: '100%', 
          height: '450px', 
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          backgroundColor: '#000'
        }}>
          {/* Background Image */}
          <img 
            key={promotions[currentPromoIndex].id}
            src={`${API_URL}/promotions/image/${promotions[currentPromoIndex].id}`} 
            alt="" 
            style={{ 
              position: 'absolute',
              top: 0, left: 0, width: '100%', height: '100%',
              objectFit: 'cover',
              zIndex: 1,
              animation: 'scaleInOut 10s infinite alternate'
            }} 
          />
          
          {/* Dark Gradient Overlay */}
          <div style={{ 
            position: 'absolute',
            top: 0, left: 0, width: '100%', height: '100%',
            background: 'linear-gradient(to right, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.1) 100%)',
            zIndex: 2
          }} />

          {/* Content Overlay */}
          <div className="container" style={{ position: 'relative', zIndex: 3, padding: '0 2rem' }}>
            <div style={{ maxWidth: '600px', animation: 'fadeInUp 0.8s ease' }}>
              <h1 style={{ 
                fontSize: '4rem', 
                fontWeight: '900', 
                marginBottom: '1rem', 
                lineHeight: 1,
                color: promotions[currentPromoIndex].textColor || '#ffffff',
                textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
              }}>
                {promotions[currentPromoIndex].title}
              </h1>
              <p style={{ 
                fontSize: '1.4rem', 
                color: promotions[currentPromoIndex].textColor || '#ffffff',
                opacity: 0.9, 
                marginBottom: '2.5rem',
                textShadow: '1px 1px 2px rgba(0,0,0,0.3)'
              }}>
                {promotions[currentPromoIndex].subtitle}
              </p>
              <button 
                onClick={() => navigate(promotions[currentPromoIndex].buttonLink || '/')}
                className="btn"
                style={{ 
                  backgroundColor: promotions[currentPromoIndex].backgroundColor || '#ffffff', 
                  color: promotions[currentPromoIndex].textColor || '#000000',
                  padding: '1rem 2.5rem',
                  fontSize: '1.2rem',
                  fontWeight: '800',
                  borderRadius: '3rem',
                  border: 'none',
                  boxShadow: '0 15px 30px rgba(0,0,0,0.3)',
                  transition: 'transform 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                {promotions[currentPromoIndex].buttonText || 'Shop Now'}
              </button>
            </div>
          </div>
          
          {/* Slider Dots */}
          {promotions.length > 1 && (
            <div style={{ position: 'absolute', bottom: '30px', left: '0', right: '0', display: 'flex', justifyContent: 'center', gap: '0.75rem', zIndex: 4 }}>
              {promotions.map((_, idx) => (
                <div 
                  key={idx} 
                  onClick={() => setCurrentPromoIndex(idx)}
                  style={{ 
                    width: idx === currentPromoIndex ? '30px' : '12px', 
                    height: '12px', 
                    borderRadius: '6px', 
                    cursor: 'pointer',
                    backgroundColor: idx === currentPromoIndex ? '#ffffff' : 'rgba(255,255,255,0.4)',
                    transition: 'all 0.3s ease'
                  }} 
                />
              ))}
            </div>
          )}
        </div>
      )}

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
              zIndex: 90,
              animation: 'fadeIn 0.3s ease'
            }}
          />
        )}

        {/* Sidebar Filter */}
        <aside style={{ 
          width: isSidebarOpen ? '280px' : '0px', 
          backgroundColor: '#ffffff', 
          borderRight: isSidebarOpen ? '1px solid #e2e8f0' : 'none',
          transition: 'all 0.3s ease',
          overflow: 'hidden',
          zIndex: 100,
          position: window.innerWidth < 1024 ? 'fixed' : 'sticky',
          top: '70px',
          height: 'calc(100vh - 70px)',
          boxShadow: isSidebarOpen ? '4px 0 15px rgba(0,0,0,0.05)' : 'none'
        }}>
          <div style={{ width: '280px', padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#1e293b', margin: 0 }}>Filters</h2>
              <button onClick={() => { setSelectedCategory(null); setSelectedSubcategories([]); setSelectedLocations([]); setSearchQuery(''); }} style={{ fontSize: '0.75rem', color: '#6366f1', background: 'none', border: 'none', fontWeight: '700', cursor: 'pointer' }}>Reset All</button>
            </div>

            {/* Categories */}
            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ fontSize: '0.85rem', textTransform: 'uppercase', color: '#94a3b8', letterSpacing: '1px', marginBottom: '1rem', fontWeight: '800' }}>Categories</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {Object.keys(allCategories).sort().map(cat => (
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
                        {Array.from(allCategories[cat]).sort().map(sub => (
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

            {/* Location */}
            <div>
              <h3 
                onClick={() => setIsLocationFilterOpen(!isLocationFilterOpen)}
                style={{ fontSize: '0.85rem', textTransform: 'uppercase', color: '#94a3b8', letterSpacing: '1px', marginBottom: '1rem', fontWeight: '800', cursor: 'pointer', display: 'flex', justifyContent: 'space-between' }}
              >
                Locations <span style={{ fontSize: '0.8rem' }}>{isLocationFilterOpen ? '−' : '+'}</span>
              </h3>
              {isLocationFilterOpen && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', maxHeight: '200px', overflowY: 'auto', paddingRight: '0.5rem' }}>
                  {allLocations.map(loc => (
                    <label key={loc} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.85rem', color: '#64748b' }}>
                      <input 
                        type="checkbox" 
                        checked={selectedLocations.includes(loc)}
                        onChange={(e) => {
                          if (e.target.checked) setSelectedLocations([...selectedLocations, loc]);
                          else setSelectedLocations(selectedLocations.filter(l => l !== loc));
                        }}
                      />
                      {loc}
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>
        </aside>

        {/* Main Grid */}
        <main style={{ flex: 1, padding: '1.5rem', minWidth: 0 }}>
          
          <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="btn"
              style={{ backgroundColor: '#ffffff', color: '#1e293b', border: '1px solid #e2e8f0', padding: '0.6rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/><line x1="2" y1="14" x2="6" y2="14"/><line x1="10" y1="8" x2="14" y2="8"/><line x1="18" y1="16" x2="22" y2="16"/></svg>
              {isSidebarOpen ? 'Hide Filters' : 'Show Filters'}
            </button>

            <div style={{ display: 'flex', flex: 1, justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <h2 style={{ fontSize: '1.25rem', margin: 0, color: '#1e293b', fontWeight: '700' }}>
                {selectedCategory ? `${selectedCategory}` : 'All Products'}
              </h2>
              
              <div style={{ display: 'flex', gap: '0.75rem', flex: 1, justifyContent: 'flex-end', minWidth: '200px' }}>
                <div style={{ position: 'relative', flex: '0 1 350px' }}>
                  <input 
                    type="text" 
                    placeholder="Search for products..." 
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
          </div>

          {loading && products.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '5rem' }}>
              <p style={{ color: '#64748b' }}>Loading products...</p>
            </div>
          ) : (
            <div>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', 
                gap: '1rem' 
              }}>
                {products.map((product, idx) => (
                  <div 
                    key={`${product.id}-${idx}`}
                    className="glass" 
                    style={{ borderRadius: '1rem', overflow: 'hidden', cursor: 'pointer', display: 'flex', flexDirection: 'column', backgroundColor: '#ffffff', border: '1px solid #f1f5f9', transition: 'all 0.3s ease' }}
                    onClick={() => navigate(`/product/${product.id}`)}
                    onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                    onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                  >
                    <div style={{ height: '160px', backgroundColor: '#f1f5f9', position: 'relative' }}>
                      <img 
                        src={product.imageUrls?.[0] || ''} 
                        alt={product.name} 
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        loading="lazy"
                      />
                      
                      {product.mrp > product.price && (
                        <div style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', backgroundColor: '#ef4444', color: 'white', padding: '0.2rem 0.5rem', borderRadius: '0.4rem', fontSize: '0.65rem', fontWeight: '800', zIndex: 2 }}>
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
                          borderBottom: '1px solid #f1f5f9',
                          transition: 'color 0.2s'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.color = '#4f46e5'}
                        onMouseOut={(e) => e.currentTarget.style.color = 'inherit'}
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
                        <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" fill="currentColor" viewBox="0 0 16 16" style={{ marginLeft: 'auto', opacity: 0.5 }}>
                          <path fillRule="evenodd" d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z"/>
                        </svg>
                      </div>

                      <h3 style={{ fontSize: '0.85rem', marginBottom: '0.25rem', color: '#1e293b', fontWeight: '700', height: '2.2rem', overflow: 'hidden', lineHeight: 1.3 }}>{product.name}</h3>
                      
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

                      <div style={{ marginTop: 'auto' }}>
                        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            {product.mrp > product.price && (
                              <span style={{ fontSize: '0.7rem', color: '#94a3b8', textDecoration: 'line-through' }}>₹{product.mrp}</span>
                            )}
                            <span style={{ fontSize: '1rem', fontWeight: '800', color: '#1e293b' }}>₹{product.price}</span>
                          </div>
                          {product.sellerCity && (
                            <span style={{ fontSize: '0.65rem', color: '#94a3b8' }}>📍 {product.sellerCity}</span>
                          )}
                        </div>
                        
                        <button 
                          onClick={(e) => handleWhatsAppClick(e, product)}
                          className="btn" 
                          style={{ 
                            width: '100%', 
                            backgroundColor: '#25d366', 
                            color: 'white', 
                            fontWeight: '800',
                            padding: '0.4rem',
                            borderRadius: '0.5rem',
                            fontSize: '0.75rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.3rem'
                          }}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 16 16">
                            <path d="M13.601 2.326A7.854 7.854 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.933 7.933 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.898 7.898 0 0 0 13.6 2.326zM7.994 14.521a6.573 6.573 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.557 6.557 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592zm3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.729.729 0 0 0-.529.247c-.182.198-.691.677-.691 1.654 0 .977.71 1.916.81 2.049.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232z"/>
                          </svg>
                          WhatsApp
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Infinite Scroll Sentinel */}
              <div ref={sentinelRef} style={{ height: '50px', display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '1rem' }}>
                {loading && products.length > 0 && <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Loading more...</p>}
              </div>

              {/* Pagination */}
              {totalMegaPages > 1 && !hasMoreChunks && (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginTop: '3rem', padding: '2rem', borderTop: '1px solid #e2e8f0' }}>
                  <button 
                    disabled={megaPage === 0}
                    onClick={() => handleMegaPageChange(megaPage - 1)}
                    className="btn"
                    style={{ padding: '0.6rem 1.2rem', backgroundColor: megaPage === 0 ? '#f8fafc' : '#ffffff', color: megaPage === 0 ? '#cbd5e1' : '#475569', border: '1px solid #e2e8f0' }}
                  >
                    Previous 50
                  </button>
                  <span style={{ fontWeight: '700', color: '#1e293b' }}>Page {megaPage + 1} of {totalMegaPages}</span>
                  <button 
                    disabled={megaPage >= totalMegaPages - 1}
                    onClick={() => handleMegaPageChange(megaPage + 1)}
                    className="btn"
                    style={{ padding: '0.6rem 1.2rem', backgroundColor: megaPage >= totalMegaPages - 1 ? '#f8fafc' : '#ffffff', color: megaPage >= totalMegaPages - 1 ? '#cbd5e1' : '#475569', border: '1px solid #e2e8f0' }}
                  >
                    Next 50
                  </button>
                </div>
              )}
            </div>
          )}
          {products.length === 0 && !loading && (
            <div style={{ textAlign: 'center', marginTop: '4rem', color: '#64748b' }}>
              <p style={{ fontSize: '1.2rem' }}>No products found matching your filters.</p>
              <button onClick={() => { setSelectedCategory(null); setSelectedSubcategories([]); setSelectedLocations([]); setSearchQuery(''); }} className="btn" style={{ marginTop: '1rem', color: '#4f46e5' }}>Clear All Filters</button>
            </div>
          )}
        </main>
      </div>

      {reviewingProduct && (
        <ReviewModal 
          productId={reviewingProduct.id}
          productName={reviewingProduct.name}
          onClose={() => setReviewingProduct(null)}
          onReviewAdded={() => loadProducts(megaPage, chunkIndex, false)}
        />
      )}

      {/* Animation Styles */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes scaleInOut {
          from { transform: scale(1); }
          to { transform: scale(1.1); }
        }
        .container {
          max-width: 1200px;
          margin: 0 auto;
          width: 100%;
        }
      `}</style>
    </div>
  );
};

export default BuyerHome;
