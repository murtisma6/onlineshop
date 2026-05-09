import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { fetchProductById, fetchReviews } from '../api';
import ReviewModal from '../components/ReviewModal';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const fromStore = location.state?.fromStore;
  const storeName = location.state?.storeName;
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [reviews, setReviews] = useState([]);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  useEffect(() => {
    const loadProductAndReviews = async () => {
      try {
        const [productRes, reviewsRes] = await Promise.all([
          fetchProductById(id),
          fetchReviews(id)
        ]);
        setProduct(productRes.data);
        setReviews(reviewsRes.data);
      } catch (err) {
        console.error('Failed to load product or reviews', err);
      } finally {
        setLoading(false);
      }
    };
    loadProductAndReviews();
  }, [id]);

  const handleWhatsAppClick = () => {
    if (!product) return;
    const productImage = product.imageUrls && product.imageUrls.length > 0 ? product.imageUrls[0] : '';
    const message = `Hi, I am interested in your product:
*Name:* ${product.name}
*Price:* ₹${product.price}
*Details:* ${product.description || 'No description provided'}
${productImage ? `*Image:* ${productImage}` : ''}`;
    
    const waUrl = `https://wa.me/${product.sellerContact.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`;
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
      <div style={{ backgroundColor: '#1E3147', padding: '1rem 0' }}>
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
            
            <h1 style={{ fontSize: '2.5rem', color: '#1E3147', marginBottom: '0.5rem', lineHeight: 1.2 }}>{product.name}</h1>
            
            {/* Rating Summary */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', color: '#fbbf24', fontSize: '1.2rem' }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <span key={star} style={{ opacity: star <= Math.round(product.averageRating || 0) ? 1 : 0.2 }}>★</span>
                ))}
              </div>
              <span style={{ fontSize: '1rem', color: '#64748b', fontWeight: '700' }}>
                {product.averageRating ? product.averageRating.toFixed(1) : '0.0'} ({product.reviewCount || 0} reviews)
              </span>
              <button 
                onClick={() => setIsReviewModalOpen(true)}
                style={{ background: 'none', border: 'none', color: '#4f46e5', fontSize: '0.9rem', fontWeight: '700', cursor: 'pointer', textDecoration: 'underline' }}
              >
                Rate this product
              </button>
            </div>
            
            <div style={{ color: '#64748b', fontSize: '1rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              <span style={{ fontWeight: '600' }}>Sold by</span>
              <div 
                onClick={(e) => {
                  e.stopPropagation();
                  if (product.storeUniqueUrl) navigate(`/store/${product.storeUniqueUrl}`);
                }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '2rem',
                  padding: '0.3rem 0.8rem 0.3rem 0.35rem',
                  cursor: product.storeUniqueUrl ? 'pointer' : 'default',
                  fontSize: '0.85rem',
                  fontWeight: '700',
                  color: '#1E3147',
                  transition: 'all 0.2s',
                  boxShadow: '0 1px 2px 0 rgba(0,0,0,0.05)'
                }}
                onMouseOver={(e) => { if(product.storeUniqueUrl) { e.currentTarget.style.backgroundColor = '#1E3147'; e.currentTarget.style.color = '#ffffff'; } }}
                onMouseOut={(e) => { e.currentTarget.style.backgroundColor = '#f8fafc'; e.currentTarget.style.color = '#1E3147'; }}
              >
                <div style={{ 
                  width: '24px', 
                  height: '24px', 
                  borderRadius: '50%', 
                  background: `linear-gradient(135deg, ${product.storeRibbonColor || '#4f46e5'}, ${product.storeRibbonColor || '#3b82f6'})`, 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  flexShrink: 0, 
                  overflow: 'hidden', 
                  fontSize: '0.75rem', 
                  fontWeight: '800', 
                  color: '#fff',
                  border: '1px solid rgba(255,255,255,0.3)'
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
                <span style={{ fontSize: '0.9rem', backgroundColor: '#f1f5f9', padding: '0.2rem 0.6rem', borderRadius: '1rem', color: '#64748b', marginLeft: '0.5rem' }}>
                  📍 {product.sellerCity}
                </span>
              )}
            </div>
            
            <div style={{ borderTop: '2px solid #f1f5f9', borderBottom: '2px solid #f1f5f9', padding: '1.5rem 0', marginBottom: '2rem' }}>
              {product.hidePrice ? (
                <p style={{ fontSize: '2.5rem', fontWeight: '800', color: '#6366f1', margin: 0 }}>
                  DM for Price
                </p>
              ) : (
                <>
                  {product.mrp && product.mrp > product.price && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                      <span style={{ fontSize: '1.25rem', color: '#94a3b8', textDecoration: 'line-through' }}>
                        ₹{product.mrp.toLocaleString()}
                      </span>
                      <span style={{ fontSize: '1.1rem', color: '#ef4444', fontWeight: '800', backgroundColor: '#fef2f2', padding: '0.2rem 0.75rem', borderRadius: '0.5rem' }}>
                        {Math.round(((product.mrp - product.price) / product.mrp) * 100)}% OFF
                      </span>
                    </div>
                  )}
                  <p style={{ fontSize: '3rem', fontWeight: 'bold', color: '#4f46e5', margin: 0 }}>
                    ₹{product.price.toLocaleString()}
                  </p>
                </>
              )}
            </div>

            <div style={{ marginBottom: '2.5rem' }}>
              <h3 style={{ fontSize: '1.25rem', color: '#1e293b', marginBottom: '1rem' }}>Product Description</h3>
              <p style={{ color: '#475569', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
                {product.description || 'No description provided by the seller.'}
              </p>
            </div>

            <button 
              onClick={handleWhatsAppClick}
              className="whatsapp-btn" 
              style={{ 
                width: '100%', 
                padding: '1.1rem', 
                fontSize: '1.1rem', 
                fontWeight: '700', 
                backgroundColor: '#25D366', 
                color: 'white',
                boxShadow: '0 12px 24px -6px rgba(37, 211, 102, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.75rem',
                border: 'none',
                borderRadius: '1rem',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.937 3.659 1.432 5.631 1.434h.005c6.505 0 11.84-5.335 11.843-11.892a11.85 11.85 0 00-3.47-8.414z"/>
              </svg>
              <span>Connect on WhatsApp</span>
              <style>{`
                @keyframes pulse-whatsapp {
                  0% { transform: scale(1); box-shadow: 0 12px 24px -6px rgba(37, 211, 102, 0.4); }
                  50% { transform: scale(1.02); box-shadow: 0 15px 30px -4px rgba(37, 211, 102, 0.5); }
                  100% { transform: scale(1); box-shadow: 0 12px 24px -6px rgba(37, 211, 102, 0.4); }
                }
                .whatsapp-btn:hover {
                  transform: translateY(-2px);
                  background-color: #20ba5a !important;
                }
                .whatsapp-btn {
                  animation: pulse-whatsapp 2s infinite ease-in-out;
                }
              `}</style>
            </button>
          </div>
          
        </div>

        {/* Reviews Section */}
        <div style={{ marginTop: '5rem', borderTop: '2px solid #e2e8f0', paddingTop: '3rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#1e293b' }}>Customer Reviews</h2>
            <button 
              onClick={() => setIsReviewModalOpen(true)}
              className="btn"
              style={{ backgroundColor: '#ffffff', color: '#4f46e5', border: '2px solid #4f46e5', padding: '0.6rem 1.2rem', fontWeight: '700' }}
            >
              Write a Review
            </button>
          </div>

          {reviews.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem 2rem', backgroundColor: '#ffffff', borderRadius: '1.5rem', border: '1px dashed #cbd5e1', color: '#64748b' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⭐</div>
              <p style={{ fontSize: '1.1rem', fontWeight: '500' }}>No reviews yet. Be the first to share your experience!</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
              {reviews.map((review) => (
                <div key={review.id} style={{ 
                  backgroundColor: '#ffffff', 
                  padding: '1.75rem', 
                  borderRadius: '1.25rem', 
                  boxShadow: '0 10px 20px -5px rgba(0,0,0,0.04)', 
                  border: '1px solid #f1f5f9',
                  transition: 'transform 0.3s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ 
                      width: '44px', 
                      height: '44px', 
                      borderRadius: '50%', 
                      backgroundColor: '#f1f5f9', 
                      color: '#4f46e5',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 'bold',
                      fontSize: '1rem',
                      border: '2px solid #eef2ff'
                    }}>
                      {(review.userName?.charAt(0) || 'U').toUpperCase()}
                    </div>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: '700', color: '#1e293b' }}>
                        {review.userName || 'Verified Customer'}
                      </h4>
                      <div style={{ display: 'flex', color: '#fbbf24', fontSize: '0.85rem' }}>
                        {[1, 2, 3, 4, 5].map((star) => (
                          <span key={star} style={{ opacity: star <= review.rating ? 1 : 0.2 }}>★</span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <p style={{ color: '#475569', lineHeight: 1.6, margin: 0, fontSize: '0.95rem', fontStyle: 'italic' }}>
                    "{review.comment || 'No comment provided.'}"
                  </p>
                  <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid #f8fafc', fontSize: '0.75rem', color: '#94a3b8', fontWeight: '500' }}>
                    {new Date(review.createdAt || Date.now()).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {isReviewModalOpen && (
        <ReviewModal 
          productId={product.id}
          productName={product.name}
          onClose={() => setIsReviewModalOpen(false)}
          onReviewAdded={async () => {
            const res = await fetchReviews(id);
            setReviews(res.data);
            // Also refresh product for average rating
            const prodRes = await fetchProductById(id);
            setProduct(prodRes.data);
          }}
        />
      )}
    </div>
  );
};

export default ProductDetail;
