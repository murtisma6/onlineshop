import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchProducts, trackEvent } from '../api';
import ReviewModal from '../components/ReviewModal';

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
  const [reviewingProduct, setReviewingProduct] = useState(null);

  const loadProducts = async () => {
    try {
      const res = await fetchProducts();
      setProducts(res.data);
      setFilteredProducts(res.data);
      
      // Track page view event once
      trackEvent({
        eventType: 'HOME_VIEW',
        userId: user ? user.id : null
      }).catch(e => console.error(e));
    } catch (err) {
      console.error('Failed to fetch products', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, [user?.id]);

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
    <div style={{ display: 'flex', flex: 1, backgroundColor: '#f8fafc' }}>
      
      {/* Left Sidebar Menu */}
      <aside style={{ 
        width: isSidebarOpen ? '200px' : '0px', 
        backgroundColor: '#ffffff', 
        color: '#1e293b',
        flexShrink: 0,
        borderRight: isSidebarOpen ? '1px solid #e2e8f0' : 'none',
        boxShadow: isSidebarOpen ? '4px 0 10px rgba(0,0,0,0.02)' : 'none',
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
            <span style={{ fontSize: '1.2rem' }}>🛒</span> Explore
          </h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <div 
              onClick={() => { setSelectedCategory(null); setSelectedSubcategories([]); setSelectedLocations([]); }}
              style={{ 
                padding: '0.7rem 1rem', 
                borderRadius: '0.5rem', 
                cursor: 'pointer',
                backgroundColor: !selectedCategory && selectedLocations.length === 0 ? 'rgba(59, 130, 246, 0.08)' : 'transparent',
                color: !selectedCategory && selectedLocations.length === 0 ? '#2563eb' : '#475569',
                border: !selectedCategory && selectedLocations.length === 0 ? '1px solid rgba(59, 130, 246, 0.1)' : '1px solid transparent',
                fontWeight: !selectedCategory && selectedLocations.length === 0 ? '700' : '500',
                transition: 'all 0.3s ease',
                fontSize: '0.85rem'
              }}
              onMouseOver={(e) => (!selectedCategory && selectedLocations.length === 0) ? null : (e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.04)', e.currentTarget.style.color = '#1e293b')}
              onMouseOut={(e) => (!selectedCategory && selectedLocations.length === 0) ? null : (e.currentTarget.style.backgroundColor = 'transparent', e.currentTarget.style.color = '#475569')}
            >
              All Collections
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
                    marginLeft: '0.75rem', 
                    marginTop: '0.1rem', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    gap: '0.05rem',
                    padding: '0.2rem 0.25rem 0.4rem 0.75rem',
                    borderLeft: '1px solid #e2e8f0',
                    marginBottom: '0.2rem'
                  }}>
                    {Array.from(categoryMap[cat]).sort().map(subcat => (
                      <label 
                        key={subcat}
                        style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '0.5rem', 
                          cursor: 'pointer', 
                          fontSize: '0.78rem', 
                          color: selectedSubcategories.includes(subcat) ? '#2563eb' : '#64748b',
                          transition: 'color 0.2s',
                          padding: '0.1rem 0'
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

            <div style={{ height: '1px', backgroundColor: '#f1f5f9', margin: '0.3rem 0' }}></div>

            {/* Location Filter */}
            <div style={{ marginBottom: '0.5rem', padding: '0' }}>
              <div 
                onClick={() => setIsLocationFilterOpen(!isLocationFilterOpen)}
                style={{ 
                  padding: '0.7rem 1rem', 
                  borderRadius: '0.5rem', 
                  cursor: 'pointer',
                  backgroundColor: isLocationFilterOpen ? 'rgba(59, 130, 246, 0.08)' : 'transparent',
                  color: isLocationFilterOpen || selectedLocations.length > 0 ? '#2563eb' : '#475569',
                  border: isLocationFilterOpen ? '1px solid rgba(59, 130, 246, 0.1)' : '1px solid transparent',
                  fontWeight: '700',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '0.85rem',
                  transition: 'all 0.3s ease'
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = isLocationFilterOpen ? 'rgba(59, 130, 246, 0.12)' : 'rgba(0,0,0,0.04)'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = isLocationFilterOpen ? 'rgba(59, 130, 246, 0.08)' : 'transparent'}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                  Locations {selectedLocations.length > 0 && `(${selectedLocations.length})`}
                </span>
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ 
                  transition: 'transform 0.3s ease', 
                  transform: isLocationFilterOpen ? 'rotate(90deg)' : 'rotate(0deg)',
                  opacity: 0.6
                }}><polyline points="9 18 15 12 9 6"/></svg>
              </div>
              
              {isLocationFilterOpen && (
                <div style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: '0.5rem', 
                  maxHeight: '200px', 
                  overflowY: 'auto', 
                  padding: '0.75rem 1rem 1rem 1.5rem',
                  backgroundColor: '#f8fafc',
                  borderBottomLeftRadius: '0.5rem',
                  borderBottomRightRadius: '0.5rem',
                  border: '1px solid #f1f5f9',
                  borderTop: 'none'
                }} className="custom-scrollbar">
                  {sortedLocations.length > 0 ? sortedLocations.map(loc => (
                    <label key={loc} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer', fontSize: '0.8rem', color: selectedLocations.includes(loc) ? '#2563eb' : '#64748b', transition: 'color 0.2s' }}>
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
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content: Products */}
      <main style={{ flex: 1, padding: '1.5rem 1rem', backgroundColor: '#f8fafc', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', minWidth: 0 }}>
        <div style={{ width: '100%', margin: '0' }}>
          
        <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
            className="btn"
            style={{ 
              backgroundColor: '#ffffff', 
              color: '#475569', 
              border: '1px solid #cbd5e1', 
              padding: '0.4rem 0.6rem', 
              fontSize: '1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '0.5rem',
              boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
              minWidth: '40px'
            }}
          >
            {isSidebarOpen ? '◀' : '▶'}
          </button>
          <div style={{ display: 'flex', flex: 1, justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: '1.25rem', margin: 0, color: '#1e293b', fontWeight: '700' }}>
              {selectedCategory ? `${selectedCategory} ${selectedSubcategories.length > 0 ? `(${selectedSubcategories.length})` : ''}` : 'Products'}
            </h2>
            {!loading && <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{filteredProducts.length} items</span>}
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', marginTop: '4rem', color: '#64748b' }}>
             <p>Loading amazing products...</p>
          </div>
        ) : (
          <div>

            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', 
              gap: '0.75rem' 
            }}>
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
                  onClick={() => navigate(`/product/${product.id}`)}
                >
                  <div style={{ height: '140px', backgroundColor: '#f1f5f9', overflow: 'hidden', position: 'relative' }}>
                    <img 
                      src={product.imageUrls && product.imageUrls.length > 0 ? product.imageUrls[0] : ''} 
                      alt={product.name} 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
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
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginBottom: '0.3rem' }}>
                      <div style={{ display: 'flex', color: '#fbbf24', fontSize: '0.65rem' }}>
                        {[1, 2, 3, 4, 5].map((star) => (
                          <span key={star} style={{ opacity: star <= Math.round(product.averageRating || 0) ? 1 : 0.2 }}>★</span>
                        ))}
                      </div>
                      <span style={{ fontSize: '0.6rem', color: '#64748b', fontWeight: '600' }}>
                        ({product.reviewCount || 0})
                      </span>
                      <button 
                        onClick={(e) => { e.stopPropagation(); setReviewingProduct(product); }}
                        style={{ background: 'none', border: 'none', color: '#4f46e5', fontSize: '0.6rem', fontWeight: '700', cursor: 'pointer', marginLeft: 'auto', textDecoration: 'underline' }}
                      >
                        Rate
                      </button>
                    </div>

                    <div 
                      onClick={(e) => {
                        e.stopPropagation();
                        if (product.storeUniqueUrl) navigate(`/store/${product.storeUniqueUrl}`);
                      }}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                        backgroundColor: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        borderRadius: '2rem',
                        padding: '0.15rem 0.5rem 0.15rem 0.2rem',
                        cursor: product.storeUniqueUrl ? 'pointer' : 'default',
                        fontSize: '0.68rem',
                        fontWeight: '700',
                        color: '#1E3147',
                        transition: 'all 0.2s',
                        marginBottom: '0.4rem',
                        width: 'fit-content'
                      }}
                      onMouseOver={(e) => { if(product.storeUniqueUrl) { e.currentTarget.style.backgroundColor = '#1E3147'; e.currentTarget.style.color = '#ffffff'; } }}
                      onMouseOut={(e) => { e.currentTarget.style.backgroundColor = '#f8fafc'; e.currentTarget.style.color = '#1E3147'; }}
                    >
                      <div style={{ 
                        width: '16px', 
                        height: '16px', 
                        borderRadius: '50%', 
                        background: `linear-gradient(135deg, ${product.storeRibbonColor || '#4f46e5'}, ${product.storeRibbonColor || '#3b82f6'})`, 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        flexShrink: 0, 
                        overflow: 'hidden', 
                        fontSize: '0.55rem', 
                        fontWeight: '800', 
                        color: '#fff',
                        border: '1px solid rgba(255,255,255,0.2)'
                      }}>
                        {product.storeLogoUrl ? (
                          <img src={product.storeLogoUrl} alt={product.storeName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          product.storeName ? product.storeName.charAt(0).toUpperCase() : 'S'
                        )}
                      </div>
                      {product.storeName}
                    </div>


                    {product.sellerCity && (
                      <p style={{ color: '#94a3b8', fontSize: '0.75rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '-0.5rem' }}>
                        <span>📍</span> {product.sellerCity}
                      </p>
                    )}
                    <div style={{ marginTop: 'auto' }}>
                      {product.hidePrice ? (
                        <p style={{ fontWeight: '800', fontSize: '1rem', color: '#6366f1', marginBottom: '0.5rem' }}>
                          DM for Price
                        </p>
                      ) : (
                        <>
                          {product.mrp && product.mrp > product.price && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.2rem' }}>
                              <span style={{ fontSize: '0.75rem', color: '#94a3b8', textDecoration: 'line-through' }}>
                                ₹{product.mrp.toLocaleString()}
                              </span>
                              <span style={{ fontSize: '0.7rem', color: '#ef4444', fontWeight: '800', backgroundColor: '#fef2f2', padding: '0.1rem 0.4rem', borderRadius: '0.3rem' }}>
                                {Math.round(((product.mrp - product.price) / product.mrp) * 100)}% OFF
                              </span>
                            </div>
                          )}
                          <p style={{ fontWeight: '900', fontSize: '1.1rem', color: '#4f46e5', marginBottom: '0.5rem', letterSpacing: '-0.2px' }}>
                            ₹{product.price.toLocaleString()}
                          </p>
                        </>
                      )}
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
                          gap: '0.4rem',
                          padding: '0.4rem',
                          borderRadius: '0.5rem',
                          fontSize: '0.8rem'
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
      {reviewingProduct && (
        <ReviewModal 
          productId={reviewingProduct.id}
          productName={reviewingProduct.name}
          onClose={() => setReviewingProduct(null)}
          onReviewAdded={() => {
            loadProducts(); // Refresh
          }}
        />
      )}
    </div>
  );
};

export default BuyerHome;
