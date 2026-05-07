import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchProducts, trackEvent } from '../api';

const BuyerHome = ({ user }) => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSubcategories, setSelectedSubcategories] = useState([]);
  const [selectedLocations, setSelectedLocations] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLocationFilterOpen, setIsLocationFilterOpen] = useState(false);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const res = await fetchProducts();
        setProducts(res.data);
        setFilteredProducts(res.data);
        
        // Track view events
        res.data.forEach(product => {
          trackEvent({
            eventType: 'PRODUCT_VIEW',
            productId: product.id,
            userId: user ? user.id : null
          }).catch(e => console.error(e));
        });
      } catch (err) {
        console.error('Failed to fetch products', err);
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, [user]);

  // Handle Filtering
  useEffect(() => {
    let filtered = products;
    if (selectedCategory) {
      filtered = filtered.filter(p => p.category === selectedCategory);
      if (selectedSubcategories.length > 0) {
        filtered = filtered.filter(p => selectedSubcategories.includes(p.subcategory));
      }
    }
    if (selectedLocations.length > 0) {
      filtered = filtered.filter(p => selectedLocations.includes(p.sellerCity));
    }
    setFilteredProducts(filtered);
  }, [selectedCategory, selectedSubcategories, selectedLocations, products]);

  // Extract Categories, Subcategories and Locations
  const categoryMap = {};
  const locations = new Set();
  products.forEach(p => {
    if (p.category) {
      if (!categoryMap[p.category]) categoryMap[p.category] = new Set();
      if (p.subcategory) categoryMap[p.category].add(p.subcategory);
    }
    if (p.sellerCity) {
      locations.add(p.sellerCity);
    }
  });
  const sortedLocations = Array.from(locations).sort();

  const handleWhatsAppClick = (e, product) => {
    e.stopPropagation();
    trackEvent({
      eventType: 'WHATSAPP_CLICK',
      productId: product.id,
      userId: user ? user.id : null
    }).catch(e => console.error(e));

    const productImage = product.imageUrls && product.imageUrls.length > 0 ? product.imageUrls[0] : '';
    const message = `Hi, I am interested in your product:
*Name:* ${product.name}
*Price:* ₹${product.price}
*Details:* ${product.description || 'No description provided'}
${productImage ? `*Image:* ${productImage}` : ''}`;

    const waUrl = `https://wa.me/${product.sellerContact.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`;
    window.open(waUrl, '_blank');
  };

  return (
    <div style={{ display: 'flex', minHeight: 'calc(100vh - 70px)' }}>
      
      {/* Left Sidebar Menu */}
      <aside style={{ 
        width: isSidebarOpen ? '200px' : '0px', 
        background: 'linear-gradient(180deg, #0f172a 0%, #111827 100%)', 
        color: '#ffffff',
        flexShrink: 0,
        borderRight: isSidebarOpen ? '1px solid rgba(255,255,255,0.05)' : 'none',
        boxShadow: isSidebarOpen ? '4px 0 10px rgba(0,0,0,0.1)' : 'none',
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
            color: '#94a3b8',
            fontWeight: '700'
          }}>
            <span style={{ fontSize: '1.2rem' }}>🛒</span> Explore
          </h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <div 
              onClick={() => { setSelectedCategory(null); setSelectedSubcategories([]); setSelectedLocations([]); }}
              style={{ 
                padding: '0.7rem 1rem', 
                borderRadius: '0.5rem', 
                cursor: 'pointer',
                backgroundColor: !selectedCategory && selectedLocations.length === 0 ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                color: !selectedCategory && selectedLocations.length === 0 ? '#60a5fa' : '#cbd5e1',
                border: !selectedCategory && selectedLocations.length === 0 ? '1px solid rgba(59, 130, 246, 0.2)' : '1px solid transparent',
                fontWeight: !selectedCategory && selectedLocations.length === 0 ? '700' : '500',
                transition: 'all 0.3s ease',
                fontSize: '0.85rem'
              }}
              onMouseOver={(e) => (!selectedCategory && selectedLocations.length === 0) ? null : (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.03)', e.currentTarget.style.color = '#ffffff')}
              onMouseOut={(e) => (!selectedCategory && selectedLocations.length === 0) ? null : (e.currentTarget.style.backgroundColor = 'transparent', e.currentTarget.style.color = '#cbd5e1')}
            >
              All Collections
            </div>

            <div style={{ height: '1px', backgroundColor: 'rgba(255,255,255,0.05)', margin: '0.3rem 0' }}></div>

            {/* Location Filter */}
            <div style={{ marginBottom: '0.5rem', padding: '0' }}>
              <div 
                onClick={() => setIsLocationFilterOpen(!isLocationFilterOpen)}
                style={{ 
                  padding: '0.7rem 1rem', 
                  borderRadius: '0.5rem', 
                  cursor: 'pointer',
                  backgroundColor: isLocationFilterOpen ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                  color: isLocationFilterOpen || selectedLocations.length > 0 ? '#60a5fa' : '#cbd5e1',
                  border: isLocationFilterOpen ? '1px solid rgba(59, 130, 246, 0.2)' : '1px solid transparent',
                  fontWeight: '700',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '0.85rem',
                  transition: 'all 0.3s ease'
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = isLocationFilterOpen ? 'rgba(59, 130, 246, 0.15)' : 'rgba(255,255,255,0.03)'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = isLocationFilterOpen ? 'rgba(59, 130, 246, 0.1)' : 'transparent'}
              >
                <span>📍 Locations {selectedLocations.length > 0 && `(${selectedLocations.length})`}</span>
                <span style={{ 
                  fontSize: '0.6rem', 
                  transition: 'transform 0.3s ease', 
                  transform: isLocationFilterOpen ? 'rotate(90deg)' : 'rotate(0deg)',
                  opacity: 0.5
                }}>▶</span>
              </div>
              
              {isLocationFilterOpen && (
                <div style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: '0.5rem', 
                  maxHeight: '200px', 
                  overflowY: 'auto', 
                  padding: '0.75rem 1rem 1rem 1.5rem',
                  backgroundColor: 'rgba(0,0,0,0.1)',
                  borderBottomLeftRadius: '0.5rem',
                  borderBottomRightRadius: '0.5rem'
                }} className="custom-scrollbar">
                  {sortedLocations.length > 0 ? sortedLocations.map(loc => (
                    <label key={loc} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer', fontSize: '0.8rem', color: selectedLocations.includes(loc) ? '#60a5fa' : '#cbd5e1', transition: 'color 0.2s' }}>
                      <input 
                        type="checkbox" 
                        checked={selectedLocations.includes(loc)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedLocations([...selectedLocations, loc]);
                          } else {
                            setSelectedLocations(selectedLocations.filter(l => l !== loc));
                          }
                        }}
                        style={{ cursor: 'pointer', accentColor: '#3b82f6' }}
                      />
                      {loc}
                    </label>
                  )) : (
                    <div style={{ fontSize: '0.75rem', color: '#475569', fontStyle: 'italic' }}>No locations found</div>
                  )}
                </div>
              )}
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
      <main style={{ flex: 1, padding: '1.5rem 1rem', backgroundColor: '#f8fafc', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', minWidth: 0 }}>
        <div style={{ width: '100%', margin: '0' }}>
          
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

        {loading ? (
          <div style={{ textAlign: 'center', marginTop: '4rem', color: '#64748b' }}>
             <p>Loading amazing products...</p>
          </div>
        ) : (
          <div>
            <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: '1.5rem' }}>
                {selectedCategory ? `${selectedCategory} ${selectedSubcategories.length > 0 ? `(${selectedSubcategories.length} subcategories)` : ''}` : 'Featured Products'}
              </h2>
              <span style={{ fontSize: '0.9rem', color: '#64748b' }}>{filteredProducts.length} items found</span>
            </div>

            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', 
              gap: '1.5rem' 
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
                  onClick={() => navigate(`/product/${product.id}`)}
                >
                  <div style={{ height: '220px', backgroundColor: '#f1f5f9', overflow: 'hidden', position: 'relative' }}>
                    <img 
                      src={product.imageUrls && product.imageUrls.length > 0 ? product.imageUrls[0] : ''} 
                      alt={product.name} 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <div style={{ position: 'absolute', top: '0.75rem', left: '0.75rem', display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                      <span style={{ fontSize: '0.65rem', backgroundColor: 'rgba(255,255,255,0.9)', padding: '0.2rem 0.6rem', borderRadius: '1rem', fontWeight: 'bold', color: '#1e293b' }}>{product.category}</span>
                      {product.subcategory && (
                        <span style={{ fontSize: '0.65rem', backgroundColor: 'rgba(59, 130, 246, 0.9)', padding: '0.2rem 0.6rem', borderRadius: '1rem', fontWeight: 'bold', color: '#ffffff' }}>{product.subcategory}</span>
                      )}
                    </div>
                  </div>
                  <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <h3 style={{ marginBottom: '0.5rem', fontSize: '1.1rem', fontWeight: '600' }}>{product.name}</h3>
                    <div 
                      onClick={(e) => {
                        e.stopPropagation();
                        if (product.storeUniqueUrl) {
                          navigate(`/store/${product.storeUniqueUrl}`);
                        }
                      }}
                      style={{ 
                        color: product.storeUniqueUrl ? '#3b82f6' : '#64748b', 
                        fontSize: '0.85rem', 
                        marginBottom: '0.75rem', 
                        display: 'inline-flex', 
                        alignItems: 'center', 
                        gap: '0.5rem',
                        cursor: product.storeUniqueUrl ? 'pointer' : 'default',
                        transition: 'color 0.2s',
                        backgroundColor: 'rgba(241, 245, 249, 0.5)',
                        padding: '0.3rem 0.6rem',
                        borderRadius: '0.5rem',
                        border: '1px solid #f1f5f9'
                      }}
                      onMouseOver={(e) => product.storeUniqueUrl ? e.currentTarget.style.color = '#2563eb' : null}
                      onMouseOut={(e) => product.storeUniqueUrl ? e.currentTarget.style.color = '#3b82f6' : null}
                      title={product.storeUniqueUrl ? "Visit Store" : ""}
                    >
                      {product.storeLogoUrl ? (
                        <img 
                          src={product.storeLogoUrl} 
                          alt={product.storeName} 
                          style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover', border: '1.5px solid #ffffff', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }} 
                        />
                      ) : (
                        <span style={{ fontSize: '1.1rem' }}>🏪</span>
                      )}
                      <span style={{ textDecoration: product.storeUniqueUrl ? 'underline' : 'none', fontWeight: '700', fontSize: '0.9rem' }}>{product.storeName}</span>
                    </div>


                    {product.sellerCity && (
                      <p style={{ color: '#94a3b8', fontSize: '0.75rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '-0.5rem' }}>
                        <span>📍</span> {product.sellerCity}
                      </p>
                    )}
                    <div style={{ marginTop: 'auto' }}>
                      <p style={{ fontWeight: '900', fontSize: '1.6rem', color: '#4f46e5', marginBottom: '1rem', letterSpacing: '-0.5px' }}>
                        ₹{product.price.toLocaleString()}
                      </p>
                      <button 
                        onClick={(e) => handleWhatsAppClick(e, product)}
                        className="btn" 
                        style={{ 
                          width: '100%', 
                          backgroundColor: '#25d366', 
                          color: 'white', 
                          fontWeight: '800', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center', 
                          gap: '0.6rem',
                          padding: '0.8rem',
                          borderRadius: '1rem',
                          fontSize: '1rem',
                          boxShadow: '0 4px 6px -1px rgba(37, 211, 102, 0.3)'
                        }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
                          <path d="M13.601 2.326A7.854 7.854 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.933 7.933 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.898 7.898 0 0 0 13.6 2.326zM7.994 14.521a6.573 6.573 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.557 6.557 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592zm3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.729.729 0 0 0-.529.247c-.182.198-.691.677-.691 1.654 0 .977.71 1.916.81 2.049.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232z"/>
                        </svg>
                        WhatsApp
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {filteredProducts.length === 0 && (
              <div style={{ textAlign: 'center', marginTop: '4rem', color: '#64748b' }}>
                <p style={{ fontSize: '1.2rem' }}>No products found matching your filters.</p>
                <button onClick={() => { setSelectedCategory(null); setSelectedSubcategories([]); setSelectedLocations([]); }} className="btn" style={{ marginTop: '1rem', color: '#4f46e5' }}>Clear All Filters</button>
              </div>
            )}
          </div>
        )}
        </div>
      </main>
    </div>
  );
};

export default BuyerHome;
