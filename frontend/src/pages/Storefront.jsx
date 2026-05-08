import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchStoreByUrl, fetchStoreProducts, fetchSellerStores } from '../api';

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
      <div style={{ minHeight: 'calc(100vh - 70px)', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8fafc' }}>
        <p style={{ color: '#64748b', fontSize: '1.2rem' }}>Loading storefront...</p>
      </div>
    );
  }

  if (error || !store) {
    return (
      <div style={{ minHeight: 'calc(100vh - 70px)', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8fafc' }}>
        <h2 style={{ fontSize: '2rem', color: '#1e293b', marginBottom: '1rem' }}>Oops!</h2>
        <p style={{ color: '#64748b', fontSize: '1.2rem', marginBottom: '2rem' }}>{error || 'Store not found.'}</p>
        <button onClick={() => navigate('/')} className="btn btn-primary" style={{ padding: '0.8rem 1.5rem', fontSize: '1rem' }}>
          Back to Main Catalog
        </button>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: 'calc(100vh - 70px)' }}>
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
          <p style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.9)', maxWidth: '600px', margin: '0 auto', fontWeight: '500' }}>
            {store.headerTagline || 'Welcome to our store! Browse our collection below.'}
          </p>
        </div>
      </div>



      {/* Main Content Area */}
      <div style={{ display: 'flex' }}>
        
        {/* Left Sidebar Menu */}
        <aside style={{ 
          width: isSidebarOpen ? '200px' : '0px', 
          backgroundColor: '#ffffff', 
          color: '#1e293b',
          flexShrink: 0,
          borderRight: isSidebarOpen ? '1px solid #e2e8f0' : 'none',
          boxShadow: isSidebarOpen ? '4px 0 10px rgba(0,0,0,0.02)' : 'none',
          minHeight: 'calc(100vh - 250px)',
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
                  backgroundColor: !selectedCategory ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                  color: !selectedCategory ? '#60a5fa' : '#cbd5e1',
                  border: !selectedCategory ? '1px solid rgba(59, 130, 246, 0.2)' : '1px solid transparent',
                  fontWeight: !selectedCategory ? '700' : '500',
                  transition: 'all 0.3s ease',
                  fontSize: '0.85rem'
                }}
                onMouseOver={(e) => !selectedCategory ? null : (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.03)', e.currentTarget.style.color = '#ffffff')}
                onMouseOut={(e) => !selectedCategory ? null : (e.currentTarget.style.backgroundColor = 'transparent', e.currentTarget.style.color = '#cbd5e1')}
              >
                All Items
              </div>

              <div style={{ height: '1px', backgroundColor: 'rgba(255,255,255,0.05)', margin: '0.3rem 0' }}></div>

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
                      backgroundColor: selectedCategory === cat ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                      color: selectedCategory === cat ? '#60a5fa' : '#94a3b8',
                      border: selectedCategory === cat ? '1px solid rgba(59, 130, 246, 0.2)' : '1px solid transparent',
                      fontWeight: selectedCategory === cat ? '700' : '500',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      fontSize: '0.85rem',
                      transition: 'all 0.3s ease',
                      marginBottom: '0.2rem'
                    }}
                    onMouseOver={(e) => (e.currentTarget.style.backgroundColor = selectedCategory === cat ? 'rgba(59, 130, 246, 0.15)' : 'rgba(255,255,255,0.03)', e.currentTarget.style.color = selectedCategory === cat ? '#60a5fa' : '#ffffff')}
                    onMouseOut={(e) => (e.currentTarget.style.backgroundColor = selectedCategory === cat ? 'rgba(59, 130, 246, 0.1)' : 'transparent', e.currentTarget.style.color = selectedCategory === cat ? '#60a5fa' : '#94a3b8')}
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
                      borderLeft: '1px solid rgba(59, 130, 246, 0.2)',
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
                            color: selectedSubcategories.includes(subcat) ? '#60a5fa' : '#cbd5e1',
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
        <main style={{ flex: 1, padding: '1.5rem', width: '100%', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', minWidth: 0 }}>
          
          <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center' }}>
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
              className="btn"
              style={{ 
                backgroundColor: '#ffffff', 
                color: '#475569', 
                border: '1px solid #cbd5e1', 
                padding: '0.4rem 0.8rem', 
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                borderRadius: '0.5rem',
                boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
              }}
            >
              {isSidebarOpen ? '◀ Hide Menu' : '▶ Show Menu'}
            </button>
          </div>

          <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #e2e8f0', paddingBottom: '1rem' }}>
              <h2 style={{ fontSize: '1.5rem' }}>
                {selectedCategory ? `${selectedCategory} ${selectedSubcategories.length > 0 ? `(${selectedSubcategories.length} subcategories)` : ''}` : 'Our Collection'}
              </h2>
            <span style={{ fontSize: '1rem', color: '#64748b', backgroundColor: '#e2e8f0', padding: '0.2rem 0.8rem', borderRadius: '1rem', fontWeight: 'bold' }}>
              {filteredProducts.length} Items
            </span>
          </div>

        {filteredProducts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 2rem', backgroundColor: '#ffffff', borderRadius: '1rem', border: '1px dashed #cbd5e1' }}>
            <p style={{ color: '#64748b', fontSize: '1.2rem' }}>No products found in this category.</p>
          </div>
        ) : (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
            gap: '2rem' 
          }}>
            {filteredProducts.map(product => (
              <div 
                key={product.id} 
                className="glass" 
                style={{ 
                  borderRadius: '1.5rem', 
                  overflow: 'hidden',
                  transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  backgroundColor: '#ffffff',
                  border: '1px solid #f1f5f9',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -2px rgba(0, 0, 0, 0.04)'
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
                <div style={{ height: '240px', backgroundColor: '#f1f5f9', overflow: 'hidden', position: 'relative' }}>
                  <img 
                    src={product.imageUrls && product.imageUrls.length > 0 ? product.imageUrls[0] : ''} 
                    alt={product.name} 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22200%22%20height%3D%22200%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20200%20200%22%20preserveAspectRatio%3D%22none%22%3E%3Cdefs%3E%3Cstyle%20type%3D%22text%2Fcss%22%3E%23holder_18b5b5c5b5a%20text%20%7B%20fill%3A%2394a3b8%3Bfont-weight%3Abold%3Bfont-family%3AArial%2C%20Helvetica%2C%20Open%20Sans%2C%20sans-serif%2C%20monospace%3Bfont-size%3A10pt%20%7D%20%3C%2Fstyle%3E%3C%2Fdefs%3E%3Cg%20id%3D%22holder_18b5b5c5b5a%22%3E%3Crect%20width%3D%22200%22%20height%3D%22200%22%20fill%3D%22%23f1f5f9%22%3E%3C%2Frect%3E%3Cg%3E%3Ctext%20x%3D%2274.5%22%20y%3D%22104.5%22%3ENo%20Image%3C%2Ftext%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E';
                    }}
                  />
                  <div style={{ position: 'absolute', top: '0.75rem', left: '0.75rem', display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                    <span style={{ fontSize: '0.65rem', backgroundColor: 'rgba(255,255,255,0.95)', padding: '0.3rem 0.7rem', borderRadius: '1rem', fontWeight: 'bold', color: '#1e293b', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>{product.category}</span>
                    {product.subcategory && (
                      <span style={{ fontSize: '0.65rem', backgroundColor: 'rgba(59, 130, 246, 0.95)', padding: '0.3rem 0.7rem', borderRadius: '1rem', fontWeight: 'bold', color: '#ffffff', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>{product.subcategory}</span>
                    )}
                  </div>
                </div>
                <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <h3 style={{ fontSize: '1.1rem', marginBottom: '0.2rem', color: '#1e293b', fontWeight: '700', lineHeight: 1.3 }}>{product.name}</h3>
                  {product.sellerCity && (
                    <p style={{ color: '#94a3b8', fontSize: '0.75rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <span>📍</span> {product.sellerCity}
                    </p>
                  )}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid #f1f5f9' }}>
                    <span style={{ fontSize: '1.25rem', fontWeight: '800', color: '#4f46e5' }}>₹{product.price.toFixed(2)}</span>
                    <button 
                      className="btn btn-primary"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/product/${product.id}`, { state: { fromStore: store.uniqueUrl, storeName: store.name } });
                      }}
                      style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }}
                    >
                      View
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      </div>

      {/* More Stores from this Seller */}
      {siblingStores.length > 0 && (
        <div style={{ backgroundColor: '#f1f5f9', borderTop: '1px solid #e2e8f0', padding: '2.5rem 1.5rem' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: '700', color: '#1E3147', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1E3147" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
              More stores from this seller
            </h2>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              {siblingStores.map(s => (
                <div
                  key={s.id}
                  onClick={() => navigate(`/store/${s.uniqueUrl}`)}
                  style={{
                    backgroundColor: '#ffffff',
                    borderRadius: '0.875rem',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
                    border: '1px solid #e2e8f0',
                    padding: '1rem 1.25rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.875rem',
                    minWidth: '200px',
                    flex: '0 0 auto',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                  }}
                  onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.12)'; }}
                  onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.07)'; }}
                >
                  {/* Store logo / initial */}
                  <div style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '50%',
                    background: `linear-gradient(135deg, ${s.ribbonColor || '#4f46e5'}, ${s.ribbonColor || '#3b82f6'})`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    overflow: 'hidden',
                    border: '2px solid rgba(255,255,255,0.8)',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                  }}>
                    {s.logoUrl
                      ? <img src={s.logoUrl} alt={s.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : <span style={{ color: '#fff', fontWeight: '700', fontSize: '1.1rem' }}>{s.name.charAt(0).toUpperCase()}</span>
                    }
                  </div>
                  <div>
                    <div style={{ fontWeight: '700', fontSize: '0.9rem', color: '#1E3147' }}>{s.name}</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.1rem' }}>{s.productCount ?? 0} products</div>
                  </div>
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: 'auto', flexShrink: 0 }}><polyline points="9 18 15 12 9 6"/></svg>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Storefront;
