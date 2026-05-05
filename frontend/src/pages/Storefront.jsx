import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchStoreByUrl, fetchStoreProducts } from '../api';

const Storefront = () => {
  const { uniqueUrl } = useParams();
  const navigate = useNavigate();
  
  const [store, setStore] = useState(null);
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);

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
      if (selectedSubcategory) {
        filtered = filtered.filter(p => p.subcategory === selectedSubcategory);
      }
    }
    setFilteredProducts(filtered);
  }, [selectedCategory, selectedSubcategory, products]);

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
      {/* Storefront Header */}
      <div style={{ background: 'linear-gradient(to right, #ffffff, #f1f5f9)', padding: '3rem 0', color: '#0f172a', textAlign: 'center', borderBottom: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1rem' }}>
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto', fontSize: '2.5rem', fontWeight: 'bold', boxShadow: '0 10px 15px -3px rgba(59, 130, 246, 0.3)' }}>
            {store.name.charAt(0).toUpperCase()}
          </div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '0.5rem', letterSpacing: '1px', color: '#0f172a' }}>{store.name}</h1>
          <p style={{ fontSize: '1.1rem', color: '#64748b' }}>Welcome to our store! Browse our collection below.</p>
        </div>
      </div>

      {/* Main Content Area */}
      <div style={{ display: 'flex' }}>
        
        {/* Left Sidebar Menu */}
        <aside style={{ 
          width: '240px', 
          backgroundColor: '#ffffff', 
          color: '#1e293b',
          flexShrink: 0,
          borderRight: '1px solid #e2e8f0',
          boxShadow: '4px 0 10px rgba(0,0,0,0.02)',
          minHeight: 'calc(100vh - 250px)'
        }}>
          <div style={{ padding: '2rem 1.5rem', position: 'sticky', top: '70px' }}>
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
                onClick={() => { setSelectedCategory(null); setSelectedSubcategory(null); }}
                style={{ 
                  padding: '0.7rem 1rem', 
                  borderRadius: '0.5rem', 
                  cursor: 'pointer',
                  backgroundColor: !selectedCategory ? '#f1f5f9' : 'transparent',
                  color: !selectedCategory ? '#0f172a' : '#475569',
                  border: !selectedCategory ? '1px solid #e2e8f0' : '1px solid transparent',
                  fontWeight: !selectedCategory ? '700' : '500',
                  transition: 'all 0.2s ease',
                  fontSize: '0.9rem'
                }}
                onMouseOver={(e) => !selectedCategory ? null : (e.currentTarget.style.backgroundColor = '#f8fafc', e.currentTarget.style.color = '#1e293b')}
                onMouseOut={(e) => !selectedCategory ? null : (e.currentTarget.style.backgroundColor = 'transparent', e.currentTarget.style.color = '#475569')}
              >
                All Products
              </div>

              <div style={{ height: '1px', backgroundColor: '#e2e8f0', margin: '0.5rem 0' }}></div>

              {Object.keys(categoryMap).sort().map(cat => (
                <div key={cat}>
                  <div 
                    onClick={() => { setSelectedCategory(cat); setSelectedSubcategory(null); }}
                    style={{ 
                      padding: '0.7rem 1rem', 
                      borderRadius: '0.5rem', 
                      cursor: 'pointer',
                      backgroundColor: selectedCategory === cat && !selectedSubcategory ? '#f1f5f9' : 'transparent',
                      color: selectedCategory === cat ? '#0f172a' : '#475569',
                      border: selectedCategory === cat && !selectedSubcategory ? '1px solid #e2e8f0' : '1px solid transparent',
                      fontWeight: selectedCategory === cat ? '700' : '500',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      fontSize: '0.9rem',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseOver={(e) => (e.currentTarget.style.backgroundColor = selectedCategory === cat && !selectedSubcategory ? '#e2e8f0' : '#f8fafc', e.currentTarget.style.color = selectedCategory === cat ? '#0f172a' : '#1e293b')}
                    onMouseOut={(e) => (e.currentTarget.style.backgroundColor = selectedCategory === cat && !selectedSubcategory ? '#f1f5f9' : 'transparent', e.currentTarget.style.color = selectedCategory === cat ? '#0f172a' : '#475569')}
                  >
                    {cat}
                    <span style={{ fontSize: '0.6rem', color: '#94a3b8', transform: selectedCategory === cat ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.3s ease' }}>
                      ▶
                    </span>
                  </div>
                  
                  {selectedCategory === cat && (
                    <div style={{ 
                      marginLeft: '1rem', 
                      marginTop: '0.3rem', 
                      display: 'flex', 
                      flexDirection: 'column', 
                      gap: '0.2rem', 
                      borderLeft: '2px solid #e2e8f0', 
                      paddingLeft: '0.8rem'
                    }}>
                      {[...categoryMap[cat]].sort().map(sub => (
                        <div 
                          key={sub}
                          onClick={() => setSelectedSubcategory(sub)}
                          style={{ 
                            padding: '0.5rem 0.7rem', 
                            borderRadius: '0.4rem', 
                            cursor: 'pointer',
                            fontSize: '0.85rem',
                            backgroundColor: selectedSubcategory === sub ? '#e0e7ff' : 'transparent',
                            color: selectedSubcategory === sub ? '#4f46e5' : '#64748b',
                            fontWeight: selectedSubcategory === sub ? '700' : '500',
                            transition: 'all 0.2s ease'
                          }}
                          onMouseOver={(e) => selectedSubcategory === sub ? null : (e.currentTarget.style.color = '#1e293b', e.currentTarget.style.backgroundColor = '#f8fafc')}
                          onMouseOut={(e) => selectedSubcategory === sub ? null : (e.currentTarget.style.color = '#64748b', e.currentTarget.style.backgroundColor = 'transparent')}
                        >
                          {sub}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* Main Content: Products */}
        <main style={{ flex: 1, padding: '3rem 1rem', maxWidth: '1400px', margin: '0 auto' }}>
          <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #e2e8f0', paddingBottom: '1rem' }}>
            <h2 style={{ fontSize: '1.5rem', color: '#1e293b' }}>
              {selectedCategory ? `${selectedCategory} ${selectedSubcategory ? `> ${selectedSubcategory}` : ''}` : 'Store Catalog'}
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
                  borderRadius: '1rem', 
                  overflow: 'hidden',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  backgroundColor: '#ffffff',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-8px)';
                  e.currentTarget.style.boxShadow = '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)';
                }}
                onClick={() => navigate(`/product/${product.id}`)}
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
                        navigate(`/product/${product.id}`);
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
    </div>
  );
};

export default Storefront;
