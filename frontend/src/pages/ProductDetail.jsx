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
            <div style={{ textAlign: 'center', padding: '3rem', backgroundColor: '#ffffff', borderRadius: '1rem', border: '1px dashed #cbd5e1' }}>
              <p style={{ color: '#64748b' }}>No reviews yet. Be the first to share your experience!</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '1.5rem' }}>
              {reviews.map((review) => (
                <div key={review.id} style={{ backgroundColor: '#ffffff', padding: '1.5rem', borderRadius: '1rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', border: '1px solid #f1f5f9' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                    <div>
                      <div style={{ display: 'flex', color: '#fbbf24', fontSize: '0.9rem', marginBottom: '0.25rem' }}>
                        {[1, 2, 3, 4, 5].map((star) => (
                          <span key={star} style={{ opacity: star <= review.rating ? 1 : 0.2 }}>★</span>
                        ))}
                      </div>
                      <strong style={{ color: '#1e293b', fontSize: '1rem' }}>{review.userName}</strong>
                    </div>
                    <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                      {new Date(review.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p style={{ color: '#475569', lineHeight: 1.6, margin: 0 }}>{review.comment || 'No comment provided.'}</p>
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
