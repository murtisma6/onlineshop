import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchProducts, trackEvent } from '../api';

const BuyerHome = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const res = await fetchProducts();
        setProducts(res.data);
        
        // Track view events for all loaded products
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

  const handleWhatsAppClick = (e, product) => {
    e.stopPropagation();
    // Track click event
    trackEvent({
      eventType: 'WHATSAPP_CLICK',
      productId: product.id,
      userId: user ? user.id : null
    }).catch(e => console.error(e));

    // Open WhatsApp
    const waUrl = `https://wa.me/${product.sellerContact.replace(/[^0-9]/g, '')}?text=Hi, I am interested in your product: ${product.name}`;
    window.open(waUrl, '_blank');
  };

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
      {loading ? (
        <div style={{ textAlign: 'center', marginTop: '4rem', color: 'var(--text-secondary)' }}>
           <p>Loading amazing products...</p>
        </div>
      ) : (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
          gap: '2rem' 
        }}>
          {products.map(product => (
            <div 
              key={product.id} 
              className="glass" 
              style={{ 
                borderRadius: '1rem', 
                overflow: 'hidden',
                transition: 'transform 0.2s',
                cursor: 'pointer'
              }}
              onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
              onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              onClick={() => navigate(`/product/${product.id}`)}
            >
              <div style={{ height: '200px', backgroundColor: '#f1f5f9', overflow: 'hidden' }}>
                <img 
                  src={product.imageUrls && product.imageUrls.length > 0 ? product.imageUrls[0] : ''} 
                  alt={product.name} 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
              <div style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.75rem', backgroundColor: '#e2e8f0', padding: '0.2rem 0.5rem', borderRadius: '1rem', color: 'var(--text-secondary)' }}>{product.category || 'Uncategorized'}</span>
                  <span style={{ fontSize: '0.75rem', backgroundColor: '#e2e8f0', padding: '0.2rem 0.5rem', borderRadius: '1rem', color: 'var(--text-secondary)' }}>{product.subcategory || 'Uncategorized'}</span>
                </div>
                <h3 style={{ marginBottom: '0.25rem', fontSize: '1.25rem' }}>{product.name}</h3>
                <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <span style={{ fontSize: '1.2rem' }}>🏪</span> {product.storeName}
                </p>
                <p style={{ fontWeight: 'bold', fontSize: '1.5rem', color: 'var(--primary-color)', marginBottom: '1.5rem' }}>
                  ₹{product.price}
                </p>
                <button 
                  onClick={(e) => handleWhatsAppClick(e, product)}
                  className="btn btn-success" 
                  style={{ width: '100%' }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16" style={{ marginRight: '0.5rem' }}>
                    <path d="M13.601 2.326A7.854 7.854 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.933 7.933 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.898 7.898 0 0 0 13.6 2.326zM7.994 14.521a6.573 6.573 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.557 6.557 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592zm3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.729.729 0 0 0-.529.247c-.182.198-.691.677-.691 1.654 0 .977.71 1.916.81 2.049.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232z"/>
                  </svg>
                  Connect on WhatsApp
                </button>
              </div>
            </div>
          ))}
          {products.length === 0 && <p style={{ gridColumn: '1 / -1', textAlign: 'center', color: 'var(--text-secondary)' }}>No products listed yet.</p>}
        </div>
      )}
    </div>
  );
};

export default BuyerHome;
