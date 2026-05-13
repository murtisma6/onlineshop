import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchAllPromotions, savePromotion, deletePromotion, API_URL } from '../api';

const PromotionManagement = ({ user }) => {
  const navigate = useNavigate();
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  
  // Form state
  const [editingId, setEditingId] = useState(null);
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [buttonText, setButtonText] = useState('Shop Now');
  const [buttonLink, setButtonLink] = useState('/');
  const [backgroundColor, setBackgroundColor] = useState('#1E3147');
  const [textColor, setTextColor] = useState('#ffffff');
  const [active, setActive] = useState(true);
  const [orderIndex, setOrderIndex] = useState(0);
  const [image, setImage] = useState(null);

  useEffect(() => {
    if (!user || user.role !== 'ADMIN') {
      navigate('/');
      return;
    }
    loadPromotions();
  }, [user, navigate]);

  const loadPromotions = async () => {
    try {
      const res = await fetchAllPromotions();
      setPromotions(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Failed to load promotions', err);
      setPromotions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    if (editingId) formData.append('id', editingId);
    formData.append('title', title);
    formData.append('subtitle', subtitle);
    formData.append('buttonText', buttonText);
    formData.append('buttonLink', buttonLink);
    formData.append('backgroundColor', backgroundColor);
    formData.append('textColor', textColor);
    formData.append('active', active);
    formData.append('orderIndex', orderIndex);
    if (image) formData.append('image', image);

    try {
      setStatus('Saving...');
      await savePromotion(formData);
      setStatus('Saved successfully!');
      resetForm();
      loadPromotions();
      setTimeout(() => setStatus(''), 3000);
    } catch (err) {
      setStatus('Failed to save promotion.');
    }
  };

  const handleEdit = (promo) => {
    setEditingId(promo.id);
    setTitle(promo.title);
    setSubtitle(promo.subtitle);
    setButtonText(promo.buttonText);
    setButtonLink(promo.buttonLink);
    setBackgroundColor(promo.backgroundColor);
    setTextColor(promo.textColor);
    setActive(promo.active);
    setOrderIndex(promo.orderIndex);
    setImage(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this promotion?')) {
      try {
        await deletePromotion(id);
        loadPromotions();
      } catch (err) {
        alert('Failed to delete.');
      }
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setTitle('');
    setSubtitle('');
    setButtonText('Shop Now');
    setButtonLink('/');
    setBackgroundColor('#1E3147');
    setTextColor('#ffffff');
    setActive(true);
    setOrderIndex(0);
    setImage(null);
  };

  if (loading) return <div style={{ padding: '2rem' }}>Loading Promotions...</div>;

  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: 'calc(100vh - 70px)', padding: '2rem' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <button onClick={() => navigate('/admin')} style={{ marginBottom: '1rem', background: 'none', border: 'none', color: '#4f46e5', cursor: 'pointer', fontWeight: 'bold' }}>&larr; Back to Dashboard</button>
        <h1 style={{ fontSize: '2rem', color: '#1E3147', marginBottom: '2rem' }}>Promotion Management</h1>

        {/* Form Card */}
        <div className="glass" style={{ padding: '2rem', borderRadius: '1rem', backgroundColor: '#ffffff', border: '1px solid #e2e8f0', marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>{editingId ? 'Edit Promotion' : 'Add New Promotion'}</h2>
          {status && <div style={{ padding: '1rem', marginBottom: '1rem', borderRadius: '0.5rem', backgroundColor: status.includes('successfully') ? '#dcfce7' : '#fee2e2', color: status.includes('successfully') ? '#166534' : '#b91c1c' }}>{status}</div>}
          
          <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div style={{ gridColumn: 'span 2' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Title</label>
              <input type="text" className="input-field" value={title} onChange={(e) => setTitle(e.target.value)} required />
            </div>
            <div style={{ gridColumn: 'span 2' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Subtitle</label>
              <textarea className="input-field" value={subtitle} onChange={(e) => setSubtitle(e.target.value)} rows="2" />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Button Text</label>
              <input type="text" className="input-field" value={buttonText} onChange={(e) => setButtonText(e.target.value)} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Button Link (Path)</label>
              <input type="text" className="input-field" value={buttonLink} onChange={(e) => setButtonLink(e.target.value)} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>BG Color</label>
              <input type="color" value={backgroundColor} onChange={(e) => setBackgroundColor(e.target.value)} style={{ width: '100%', height: '40px' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Text Color</label>
              <input type="color" value={textColor} onChange={(e) => setTextColor(e.target.value)} style={{ width: '100%', height: '40px' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Promotion Image</label>
              <input type="file" onChange={(e) => setImage(e.target.files[0])} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Order Index</label>
              <input type="number" className="input-field" value={orderIndex} onChange={(e) => setOrderIndex(e.target.value)} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} />
              <label>Active</label>
            </div>
            <div style={{ gridColumn: 'span 2', display: 'flex', gap: '1rem' }}>
              <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>{editingId ? 'Update' : 'Create'}</button>
              {editingId && <button type="button" onClick={resetForm} className="btn" style={{ flex: 1, backgroundColor: '#f1f5f9' }}>Cancel</button>}
            </div>
          </form>
        </div>

        {/* List Card */}
        <div className="glass" style={{ padding: '2rem', borderRadius: '1rem', backgroundColor: '#ffffff', border: '1px solid #e2e8f0' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>Existing Promotions</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {Array.isArray(promotions) && promotions.map(promo => (
              <div key={promo.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', border: '1px solid #f1f5f9', borderRadius: '0.5rem' }}>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <div style={{ width: '60px', height: '40px', backgroundColor: promo.backgroundColor, borderRadius: '4px', overflow: 'hidden' }}>
                    {promo.id && <img src={`${API_URL}/promotions/image/${promo.id}`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                  </div>
                  <div>
                    <div style={{ fontWeight: 'bold' }}>{promo.title}</div>
                    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Order: {promo.orderIndex} | {promo.active ? 'Active' : 'Inactive'}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button onClick={() => handleEdit(promo)} className="btn" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', backgroundColor: '#eef2ff', color: '#4f46e5' }}>Edit</button>
                  <button onClick={() => handleDelete(promo.id)} className="btn" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', backgroundColor: '#fef2f2', color: '#ef4444' }}>Delete</button>
                </div>
              </div>
            ))}
            {promotions.length === 0 && <div style={{ textAlign: 'center', color: '#94a3b8' }}>No promotions configured.</div>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PromotionManagement;
