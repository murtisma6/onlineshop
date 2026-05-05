import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { fetchProductById } from '../api';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const fromStore = location.state?.fromStore;
  const storeName = location.state?.storeName;
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const loadProduct = async () => {
      try {
        const res = await fetchProductById(id);
        setProduct(res.data);
      } catch (err) {
        console.error('Failed to load product', err);
      } finally {
        setLoading(false);
      }
    };
    loadProduct();
  }, [id]);

  const handleWhatsAppClick = () => {
    if (!product) return;
    const waUrl = `https://wa.me/${product.sellerContact.replace(/[^0-9]/g, '')}?text=Hi, I am interested in your product: ${product.name}`;
    window.open(waUrl, '_blank');
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc' }}>
        <h2 style={{ color: '#64748b' }}>Loading product details...</h2>
      </div>
    );
  }

  if (!product) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc' }}>
        <h2 style={{ color: '#64748b', marginBottom: '1rem' }}>Product not found</h2>
        <button onClick={() => navigate('/')} className="btn btn-primary">Back to Home</button>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: 'calc(100vh - 70px)' }}>
      <div style={{ backgroundColor: '#0f172a', padding: '1rem 0' }}>
        <div className="container">
          <button 
            onClick={() => fromStore ? navigate(`/store/${fromStore}`) : navigate('/')} 
            className="btn" 
            style={{ backgroundColor: 'transparent', color: '#cbd5e1', border: '1px solid #475569', padding: '0.5rem 1rem' }}
          >
            &larr; {fromStore ? `Back to ${storeName || 'Store'}` : 'Back to Gallery'}
          </button>
        </div>
      </div>

      <div className="container" style={{ padding: '3rem 2rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '4rem', alignItems: 'start' }}>
          
          {/* Image Gallery */}
          <div className="glass" style={{ padding: '1rem', borderRadius: '1rem', backgroundColor: '#ffffff', boxShadow: 'var(--shadow-lg)' }}>
            <div style={{ width: '100%', height: '400px', backgroundColor: '#f1f5f9', borderRadius: '0.5rem', overflow: 'hidden', marginBottom: '1rem', position: 'relative' }}>
              {product.imageUrls && product.imageUrls.length > 0 ? (
                <>
                  <img 
                    src={product.imageUrls[currentImageIndex]} 
                    alt={product.name} 
                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                  />
                  {product.imageUrls.length > 1 && (
                    <div style={{ position: 'absolute', bottom: '10px', left: '0', right: '0', display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
                      {product.imageUrls.map((_, idx) => (
                        <div 
                          key={idx} 
                          onClick={() => setCurrentImageIndex(idx)}
                          style={{ 
                            width: '10px', height: '10px', borderRadius: '50%', cursor: 'pointer',
                            backgroundColor: idx === currentImageIndex ? '#4f46e5' : '#cbd5e1',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                          }} 
                        />
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
                  No Image Available
                </div>
              )}
            </div>
            
            {/* Thumbnail Row */}
            {product.imageUrls && product.imageUrls.length > 1 && (
              <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
                {product.imageUrls.map((url, idx) => (
                  <div 
                    key={idx} 
                    onClick={() => setCurrentImageIndex(idx)}
                    style={{ 
                      width: '60px', height: '60px', flexShrink: 0, borderRadius: '0.25rem', overflow: 'hidden', cursor: 'pointer',
                      border: idx === currentImageIndex ? '2px solid #4f46e5' : '1px solid #e2e8f0',
                      opacity: idx === currentImageIndex ? 1 : 0.6
                    }}
                  >
                    <img src={url} alt={`Thumbnail ${idx+1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Product Details */}
          <div>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.85rem', backgroundColor: '#eef2ff', padding: '0.25rem 0.75rem', borderRadius: '1rem', color: '#4f46e5', fontWeight: 600 }}>{product.category || 'Uncategorized'}</span>
              <span style={{ fontSize: '0.85rem', backgroundColor: '#eef2ff', padding: '0.25rem 0.75rem', borderRadius: '1rem', color: '#4f46e5', fontWeight: 600 }}>{product.subcategory || 'Uncategorized'}</span>
            </div>
            
            <h1 style={{ fontSize: '2.5rem', color: '#0f172a', marginBottom: '0.5rem', lineHeight: 1.2 }}>{product.name}</h1>
            
            <div style={{ color: '#64748b', fontSize: '1.1rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '1.5rem' }}>🏪</span> Sold by {' '}
              <strong 
                onClick={() => {
                  if (product.storeUniqueUrl) navigate(`/store/${product.storeUniqueUrl}`);
                }}
                style={{ 
                  color: product.storeUniqueUrl ? '#3b82f6' : '#1e293b', 
                  cursor: product.storeUniqueUrl ? 'pointer' : 'default',
                  textDecoration: product.storeUniqueUrl ? 'underline' : 'none',
                  transition: 'color 0.2s'
                }}
                onMouseOver={(e) => product.storeUniqueUrl ? e.currentTarget.style.color = '#2563eb' : null}
                onMouseOut={(e) => product.storeUniqueUrl ? e.currentTarget.style.color = '#3b82f6' : null}
                title={product.storeUniqueUrl ? "Visit Store" : ""}
              >
                {product.storeName}
              </strong>
              {product.sellerCity && (
                <span style={{ fontSize: '0.9rem', backgroundColor: '#f1f5f9', padding: '0.2rem 0.6rem', borderRadius: '1rem', color: '#64748b', marginLeft: '0.5rem' }}>
                  📍 {product.sellerCity}
                </span>
              )}
            </div>
            
            <div style={{ borderTop: '2px solid #f1f5f9', borderBottom: '2px solid #f1f5f9', padding: '1.5rem 0', marginBottom: '2rem' }}>
              <p style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#4f46e5', margin: 0 }}>
                ₹{product.price}
              </p>
            </div>

            <div style={{ marginBottom: '2.5rem' }}>
              <h3 style={{ fontSize: '1.25rem', color: '#1e293b', marginBottom: '1rem' }}>Product Description</h3>
              <p style={{ color: '#475569', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
                {product.description || 'No description provided by the seller.'}
              </p>
            </div>

            <button 
              onClick={handleWhatsAppClick}
              className="btn" 
              style={{ 
                width: '100%', 
                padding: '1.25rem', 
                fontSize: '1.1rem', 
                fontWeight: 'bold', 
                backgroundColor: '#25D366', 
                color: 'white',
                boxShadow: '0 10px 15px -3px rgba(37, 211, 102, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem'
              }}
            >
              <span style={{ fontSize: '1.5rem' }}>💬</span> Connect on WhatsApp
            </button>
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
