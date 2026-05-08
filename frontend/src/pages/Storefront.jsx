import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchStoreByUrl, fetchStoreProducts, fetchSellerStores } from '../api';
import ReviewModal from '../components/ReviewModal';

const Storefront = () => {
  const { uniqueUrl } = useParams();
  const navigate = useNavigate();
  
  const [store, setStore] = useState(null);
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSubcategories, setSelectedSubcategories] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [siblingStores, setSiblingStores] = useState([]);
  const [reviewingProduct, setReviewingProduct] = useState(null);

  useEffect(() => {
    loadStoreAndProducts();
  }, [uniqueUrl]);

  const loadStoreAndProducts = async () => {
    try {
      setLoading(true);
      // 1. Fetch store info by unique URL
      const storeRes = await fetchStoreByUrl(uniqueUrl);
      const storeData = storeRes.data;
      setStore(storeData);

      // 2. Fetch products using the store ID
      const productsRes = await fetchStoreProducts(storeData.id);
      setProducts(productsRes.data);
      setFilteredProducts(productsRes.data);

      // 3. Fetch sibling stores from the same seller
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

  // Handle Filtering
  useEffect(() => {
    let filtered = products;
    if (selectedCategory) {
      filtered = filtered.filter(p => p.category === selectedCategory);
      if (selectedSubcategories.length > 0) {
        filtered = filtered.filter(p => selectedSubcategories.includes(p.subcategory));
      }
    }
    setFilteredProducts(filtered);
  }, [selectedCategory, selectedSubcategories, products]);

  // Extract Categories and Subcategories
  const categoryMap = {};
  products.forEach(p => {
    if (p.category) {
      if (!categoryMap[p.category]) categoryMap[p.category] = new Set();
      if (p.subcategory) categoryMap[p.category].add(p.subcategory);
    }
  });

  if (loading) {
    return (
      <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8fafc' }}>
        <p style={{ color: '#64748b', fontSize: '1.2rem' }}>Loading storefront...</p>
      </div>
    );
  }

  if (error || !store) {
    return (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8fafc' }}>
        <h2 style={{ fontSize: '2rem', color: '#1e293b', marginBottom: '1rem' }}>Oops!</h2>
        <p style={{ color: '#64748b', fontSize: '1.2rem', marginBottom: '2rem' }}>{error || 'Store not found.'}</p>
        <button onClick={() => navigate('/')} className="btn btn-primary" style={{ padding: '0.8rem 1.5rem', fontSize: '1rem' }}>
          Back to Main Catalog
        </button>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: '#f8fafc', flex: 1, display: 'flex', flexDirection: 'column' }}>
      {/* Storefront Header - Themed with Custom Color */}
      <div style={{ 
        background: `linear-gradient(135deg, ${store.ribbonColor || '#4f46e5'} 0%, ${store.ribbonColor || '#3b82f6'} 80%)`, 
        padding: '2rem 0', 
        color: '#ffffff', 
        textAlign: 'center', 
        position: 'relative',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
        overflow: 'hidden'
      }}>
        {/* Decorative glass effect overlay */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'linear-gradient(rgba(255,255,255,0.1), transparent)', pointerEvents: 'none' }}></div>
        
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1rem', position: 'relative', zIndex: 1 }}>
          <div style={{ 
            width: '70px', 
            height: '70px', 
            borderRadius: '50%', 
            backgroundColor: 'rgba(255,255,255,0.2)', 
            backdropFilter: 'blur(8px)',
            color: '#ffffff', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            margin: '0 auto 0.75rem auto', 
            fontSize: '1.8rem', 
            fontWeight: 'bold', 
            border: '2px solid rgba(255,255,255,0.4)',
            boxShadow: '0 8px 16px rgba(0,0,0,0.2)',
            overflow: 'hidden'
          }}>
            {store.logoUrl ? (
              <img src={store.logoUrl} alt={store.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              store.name.charAt(0).toUpperCase()
            )}
          </div>

          <h1 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '0.25rem', letterSpacing: '0.5px', textShadow: '0 2px 4px rgba(0,0,0,0.15)' }}>{store.name}</h1>
          <p style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.9)', maxWidth: '600px', margin: '0 auto 1.5rem auto', fontWeight: '500' }}>
            {store.headerTagline || 'Welcome to our store! Browse our collection below.'}
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            {store.instagramUrl && (
              <a href={store.instagramUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'white', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'rgba(255,255,255,0.15)', padding: '0.4rem 0.9rem', borderRadius: '2rem', fontSize: '0.85rem', fontWeight: '600', transition: 'all 0.2s', border: '1px solid rgba(255,255,255,0.2)', backdropFilter: 'blur(4px)' }} onMouseOver={e => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.25)'; e.currentTarget.style.transform = 'translateY(-2px)'; }} onMouseOut={e => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.15)'; e.currentTarget.style.transform = 'translateY(0)'; }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
                Instagram
              </a>
            )}
            {store.facebookUrl && (
              <a href={store.facebookUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'white', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'rgba(255,255,255,0.15)', padding: '0.4rem 0.9rem', borderRadius: '2rem', fontSize: '0.85rem', fontWeight: '600', transition: 'all 0.2s', border: '1px solid rgba(255,255,255,0.2)', backdropFilter: 'blur(4px)' }} onMouseOver={e => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.25)'; e.currentTarget.style.transform = 'translateY(-2px)'; }} onMouseOut={e => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.15)'; e.currentTarget.style.transform = 'translateY(0)'; }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
                Facebook
              </a>
            )}
            {store.youtubeUrl && (
              <a href={store.youtubeUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'white', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'rgba(255,255,255,0.15)', padding: '0.4rem 0.9rem', borderRadius: '2rem', fontSize: '0.85rem', fontWeight: '600', transition: 'all 0.2s', border: '1px solid rgba(255,255,255,0.2)', backdropFilter: 'blur(4px)' }} onMouseOver={e => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.25)'; e.currentTarget.style.transform = 'translateY(-2px)'; }} onMouseOut={e => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.15)'; e.currentTarget.style.transform = 'translateY(0)'; }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 2-2 69.1 69.1 0 0 1 15 0 2 2 0 0 1 2 2 24.12 24.12 0 0 1 0 10 2 2 0 0 1-2 2 69.1 69.1 0 0 1-15 0 2 2 0 0 1-2-2Z"/><path d="m10 15 5-3-5-3z"/></svg>
                YouTube
              </a>
            )}
          </div>
        </div>
      </div>



      {/* Main Content Area */}
      <div style={{ display: 'flex', flex: 1 }}>
        
        {/* Left Sidebar Menu */}
        <aside style={{ 
          width: isSidebarOpen ? '200px' : '0px', 
          backgroundColor: '#ffffff', 
          color: '#1e293b',
          flexShrink: 0,
          borderRight: isSidebarOpen ? '1px solid #e2e8f0' : 'none',
          boxShadow: isSidebarOpen ? '4px 0 10px rgba(0,0,0,0.02)' : 'none',
          // Removed flex: 1 which was causing the sidebar to push products to the corner
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          overflow: 'hidden'
        }}>
          <div style={{ width: '200px' }}>
            <div style={{ padding: '1.5rem 1rem', position: 'sticky', top: '70px' }}>
            <h2 style={{ 
              fontSize: '0.9rem', 
              textTransform: 'uppercase', 
              letterSpacing: '1.2px', 
              marginBottom: '1.5rem', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.5rem', 
              color: '#64748b',
              fontWeight: '700'
            }}>
              <span style={{ fontSize: '1.2rem' }}>🛒</span> Categories
            </h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <div 
                onClick={() => { setSelectedCategory(null); setSelectedSubcategories([]); }}
                style={{ 
                  padding: '0.7rem 1rem', 
                  borderRadius: '0.5rem', 
                  cursor: 'pointer',
                  backgroundColor: !selectedCategory ? 'rgba(59, 130, 246, 0.08)' : 'transparent',
                  color: !selectedCategory ? '#2563eb' : '#475569',
                  border: !selectedCategory ? '1px solid rgba(59, 130, 246, 0.1)' : '1px solid transparent',
                  fontWeight: !selectedCategory ? '700' : '500',
                  transition: 'all 0.3s ease',
                  fontSize: '0.85rem'
                }}
                onMouseOver={(e) => !selectedCategory ? null : (e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.04)', e.currentTarget.style.color = '#1e293b')}
                onMouseOut={(e) => !selectedCategory ? null : (e.currentTarget.style.backgroundColor = 'transparent', e.currentTarget.style.color = '#475569')}
              >
                All Items
              </div>

              <div style={{ height: '1px', backgroundColor: '#f1f5f9', margin: '0.3rem 0' }}></div>

              {Object.keys(categoryMap).sort().map(cat => (
                <div key={cat}>
                  <div 
                    onClick={() => { 
                      if (selectedCategory === cat) {
                        setSelectedCategory(null);
                        setSelectedSubcategories([]);
                      } else {
                        setSelectedCategory(cat); 
                        setSelectedSubcategories([]); 
                      }
                    }}
                    style={{ 
                      padding: '0.7rem 1rem', 
                      borderRadius: '0.5rem', 
                      cursor: 'pointer',
                      backgroundColor: selectedCategory === cat ? 'rgba(59, 130, 246, 0.08)' : 'transparent',
                      color: selectedCategory === cat ? '#2563eb' : '#475569',
                      border: selectedCategory === cat ? '1px solid rgba(59, 130, 246, 0.1)' : '1px solid transparent',
                      fontWeight: selectedCategory === cat ? '700' : '500',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      fontSize: '0.85rem',
                      transition: 'all 0.3s ease',
                      marginBottom: '0.2rem'
                    }}
                    onMouseOver={(e) => (e.currentTarget.style.backgroundColor = selectedCategory === cat ? 'rgba(59, 130, 246, 0.12)' : 'rgba(0,0,0,0.04)', e.currentTarget.style.color = selectedCategory === cat ? '#2563eb' : '#1e293b')}
                    onMouseOut={(e) => (e.currentTarget.style.backgroundColor = selectedCategory === cat ? 'rgba(59, 130, 246, 0.08)' : 'transparent', e.currentTarget.style.color = selectedCategory === cat ? '#2563eb' : '#475569')}
                  >
                    {cat}
                    <span style={{ fontSize: '0.6rem', opacity: 0.5, transform: selectedCategory === cat ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.3s ease' }}>
                      ▶
                    </span>
                  </div>
                  
                  {selectedCategory === cat && (
                    <div style={{ 
                      marginLeft: '1rem', 
                      marginTop: '0.3rem', 
                      display: 'flex', 
                      flexDirection: 'column', 
                      gap: '0.4rem',
                      padding: '0.5rem 0.5rem 1rem 1rem',
                      borderLeft: '1px solid #e2e8f0',
                      marginBottom: '0.5rem'
                    }}>
                      {Array.from(categoryMap[cat]).sort().map(subcat => (
                        <label 
                          key={subcat}
                          style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '0.6rem', 
                            cursor: 'pointer', 
                            fontSize: '0.8rem', 
                            color: selectedSubcategories.includes(subcat) ? '#2563eb' : '#64748b',
                            transition: 'color 0.2s',
                            padding: '0.2rem 0'
                          }}
                        >
                          <input 
                            type="checkbox" 
                            checked={selectedSubcategories.includes(subcat)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedSubcategories([...selectedSubcategories, subcat]);
                              } else {
                                setSelectedSubcategories(selectedSubcategories.filter(s => s !== subcat));
                              }
                            }}
                            style={{ cursor: 'pointer', accentColor: '#3b82f6' }}
                          />
                          {subcat}
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </aside>

        {/* Main Content: Products */}
        <main className="storefront-main" style={{ flex: 1, padding: '1.5rem', width: '100%', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', minWidth: 0 }}>
          
          {/* Responsive styles via <style> tag */}
          <style>{`
            @media (max-width: 640px) {
              .storefront-main { padding: 1rem !important; }
              .storefront-toolbar { padding-bottom: 0.5rem !important; }
              .storefront-row1 { flex-direction: column !important; align-items: flex-start !important; gap: 0.75rem !important; }
              .storefront-row1-left { width: 100% !important; }
              .storefront-row1-right { align-self: flex-end !important; }
              .storefront-chips-container { overflow-x: auto !important; padding-bottom: 0.25rem !important; width: 100% !important; }
              .storefront-chips-container::-webkit-scrollbar { height: 3px; }
              .storefront-chips-container::-webkit-scrollbar-thumb { background: #cbd5e1; borderRadius: 3px; }
            }
          `}</style>
          
          {/* Toolbar: Show/Hide + Title + Items count */}
          <div className="storefront-toolbar" style={{ marginBottom: '1rem', borderBottom: '2px solid #e2e8f0', paddingBottom: '0.75rem' }}>
            {/* Row 1: Toggle + More stores chips + Items badge */}
            <div className="storefront-row1" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              {/* Left: toggle + more stores */}
              <div className="storefront-row1-left" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flex: 1, minWidth: 0 }}>
                <button
                  onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                  className="btn"
                  style={{
                    backgroundColor: '#ffffff',
                    color: '#475569',
                    border: '1px solid #cbd5e1',
                    padding: '0.4rem 0.6rem',
                    fontSize: '0.82rem',
                    display: 'flex',
                    alignItems: 'center',
                    borderRadius: '0.5rem',
                    boxShadow: '0 1px 2px 0 rgba(0,0,0,0.05)',
                    flexShrink: 0,
                  }}
                >
                    {isSidebarOpen ? '◀' : '▶'}
                </button>
                <div style={{ width: '1px', height: '18px', backgroundColor: '#e2e8f0', flexShrink: 0 }}></div>
                {siblingStores.length > 0 && (
                  <>
                    <span style={{ fontSize: '0.78rem', fontWeight: '600', color: '#64748b', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '0.3rem', flexShrink: 0 }}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                      More Store from Seller:
                    </span>
                    <div className="storefront-chips-container" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'nowrap' }}>
                      {siblingStores.map(s => (
                      <div
                        key={s.id}
                        onClick={() => navigate(`/store/${s.uniqueUrl}`)}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.4rem',
                          backgroundColor: '#f8fafc',
                          border: '1px solid #e2e8f0',
                          borderRadius: '2rem',
                          padding: '0.3rem 0.75rem 0.3rem 0.35rem',
                          cursor: 'pointer',
                          fontSize: '0.8rem',
                          fontWeight: '600',
                          color: '#1E3147',
                          transition: 'all 0.2s',
                        }}
                        onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#1E3147'; e.currentTarget.style.color = '#ffffff'; e.currentTarget.style.borderColor = '#1E3147'; }}
                        onMouseOut={(e) => { e.currentTarget.style.backgroundColor = '#f8fafc'; e.currentTarget.style.color = '#1E3147'; e.currentTarget.style.borderColor = '#e2e8f0'; }}
                      >
                        <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: `linear-gradient(135deg, ${s.ribbonColor || '#4f46e5'}, ${s.ribbonColor || '#3b82f6'})`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden', fontSize: '0.65rem', fontWeight: '700', color: '#fff' }}>
                          {s.logoUrl ? <img src={s.logoUrl} alt={s.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : s.name.charAt(0).toUpperCase()}
                        </div>
                        {s.name}
                      </div>
                    ))}
                  </div>
                  </>
                )}
              </div>
              {/* Right: items badge */}
              <span className="storefront-row1-right" style={{ fontSize: '0.9rem', color: '#64748b', backgroundColor: '#e2e8f0', padding: '0.2rem 0.8rem', borderRadius: '1rem', fontWeight: '700', flexShrink: 0 }}>
                {filteredProducts.length} Items
              </span>
            </div>

            {/* Row 2: Our Collection heading */}
            <h2 style={{ fontSize: '1.3rem', fontWeight: '700', color: '#1E3147', margin: 0 }}>
              {selectedCategory
                ? `${selectedCategory}${selectedSubcategories.length > 0 ? ` (${selectedSubcategories.length} sub)` : ''}`
                : 'Our Collection'}
            </h2>
          </div>


        {filteredProducts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 2rem', backgroundColor: '#ffffff', borderRadius: '1rem', border: '1px dashed #cbd5e1' }}>
            <p style={{ color: '#64748b', fontSize: '1.2rem' }}>No products found in this category.</p>
          </div>
        ) : (
          <div 
            className="product-grid"
            style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', 
              gap: '0.75rem' 
            }}
          >
            {filteredProducts.map(product => (
              <div 
                key={product.id} 
                className="glass" 
                style={{ 
                  borderRadius: '1rem', 
                  overflow: 'hidden',
                  transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  backgroundColor: '#ffffff',
                  border: '1px solid #f1f5f9',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.07), 0 2px 4px -1px rgba(0, 0, 0, 0.04)'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-12px) scale(1.02)';
                  e.currentTarget.style.boxShadow = '0 25px 30px -5px rgba(0, 0, 0, 0.15), 0 15px 15px -10px rgba(0, 0, 0, 0.1)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0) scale(1)';
                  e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -2px rgba(0, 0, 0, 0.04)';
                }}
                onClick={() => navigate(`/product/${product.id}`, { state: { fromStore: store.uniqueUrl, storeName: store.name } })}
              >
                <div style={{ height: '140px', backgroundColor: '#f1f5f9', overflow: 'hidden', position: 'relative' }}>
                  <img 
                    src={product.imageUrls && product.imageUrls.length > 0 ? product.imageUrls[0] : ''} 
                    alt={product.name} 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22200%22%20height%3D%22200%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20200%20200%22%20preserveAspectRatio%3D%22none%22%3E%3Cdefs%3E%3Cstyle%20type%3D%22text%2Fcss%22%3E%23holder_18b5b5c5b5a%20text%20%7B%20fill%3A%2394a3b8%3Bfont-weight%3Abold%3Bfont-family%3AArial%2C%20Helvetica%2C%20Open%20Sans%2C%20sans-serif%2C%20monospace%3Bfont-size%3A10pt%20%7D%20%3C%2Fstyle%3E%3C%2Fdefs%3E%3Cg%20id%3D%22holder_18b5b5c5b5a%22%3E%3Crect%20width%3D%22200%22%20height%3D%22200%22%20fill%3D%22%23f1f5f9%22%3E%3C%2Frect%3E%3Cg%3E%3Ctext%20x%3D%2274.5%22%20y%3D%22104.5%22%3ENo%20Image%3C%2Ftext%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E';
                    }}
                  />
                  <div style={{ position: 'absolute', top: '0.4rem', left: '0.4rem', display: 'flex', flexWrap: 'wrap', gap: '0.2rem' }}>
                    <span style={{ fontSize: '0.55rem', backgroundColor: 'rgba(255,255,255,0.95)', padding: '0.15rem 0.4rem', borderRadius: '1rem', fontWeight: 'bold', color: '#1e293b', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>{product.category}</span>
                    {product.subcategory && (
                      <span style={{ fontSize: '0.55rem', backgroundColor: 'rgba(59, 130, 246, 0.95)', padding: '0.15rem 0.4rem', borderRadius: '1rem', fontWeight: 'bold', color: '#ffffff', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>{product.subcategory}</span>
                    )}
                  </div>
                </div>
                <div style={{ padding: '0.65rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <h3 style={{ fontSize: '0.82rem', marginBottom: '0.1rem', color: '#1e293b', fontWeight: '700', lineHeight: 1.2, height: '2.4em', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{product.name}</h3>
                  
                  <p style={{ 
                    fontSize: '0.68rem', 
                    color: '#64748b', 
                    marginBottom: '0.3rem', 
                    lineHeight: 1.2,
                    height: '2.4em',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}>
                    {product.description}
                  </p>

                  {/* Star Rating Display */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginBottom: '0.2rem' }}>
                    <div style={{ display: 'flex', color: '#fbbf24', fontSize: '0.65rem' }}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span key={star} style={{ opacity: star <= Math.round(product.averageRating || 0) ? 1 : 0.2 }}>★</span>
                      ))}
                    </div>
                    <span style={{ fontSize: '0.6rem', color: '#64748b', fontWeight: '600' }}>
                      ({product.reviewCount || 0})
                    </span>
                  </div>
                  {product.sellerCity && (
                    <p style={{ color: '#94a3b8', fontSize: '0.65rem', marginBottom: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                      <span>📍</span> {product.sellerCity}
                    </p>
                  )}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto', paddingTop: '0.5rem', borderTop: '1px solid #f1f5f9' }}>
                    <span style={{ fontSize: '0.95rem', fontWeight: '800', color: '#4f46e5' }}>₹{product.price.toFixed(0)}</span>
                    <div style={{ display: 'flex', gap: '0.3rem' }}>
                      <button 
                        className="btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          setReviewingProduct(product);
                        }}
                        style={{ 
                          padding: '0.2rem 0.4rem', 
                          fontSize: '0.65rem', 
                          backgroundColor: '#f8fafc',
                          color: '#64748b',
                          border: '1px solid #e2e8f0',
                          borderRadius: '0.3rem',
                          fontWeight: '600'
                        }}
                      >
                        Rate
                      </button>
                      <button 
                        className="btn btn-primary"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/product/${product.id}`, { state: { fromStore: uniqueUrl, storeName: store.name } });
                        }}
                        style={{ padding: '0.2rem 0.5rem', fontSize: '0.7rem' }}
                      >
                        View
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      </div>

      {reviewingProduct && (
        <ReviewModal 
          productId={reviewingProduct.id}
          productName={reviewingProduct.name}
          onClose={() => setReviewingProduct(null)}
          onReviewAdded={() => {
            loadStoreAndProducts(); // Refresh to get new ratings
          }}
        />
      )}
    </div>
  );
};

export default Storefront;
