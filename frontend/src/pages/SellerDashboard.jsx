import { useState, useEffect } from 'react';
import { uploadProduct, fetchStoreProducts, deleteProduct, fetchSellerStores, createStore, updateProduct, deleteStore, updateStore, deleteStoreLogo } from '../api';

const SellerDashboard = ({ user }) => {
  // Store Selection State
  const [stores, setStores] = useState([]);
  const [selectedStore, setSelectedStore] = useState(null);
  const [newStoreName, setNewStoreName] = useState('');
  const [storeStatus, setStoreStatus] = useState('');
  
  // Product Management State
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [subcategory, setSubcategory] = useState('');
  const [sellerContact, setSellerContact] = useState(user?.whatsapp || '');
  const [images, setImages] = useState([]);
  const [status, setStatus] = useState('');
  const [myProducts, setMyProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingProductId, setEditingProductId] = useState(null);
  const [existingImages, setExistingImages] = useState([]);

  // Store Settings State
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [editStoreName, setEditStoreName] = useState('');
  const [editRibbonColor, setEditRibbonColor] = useState('#4f46e5');
  const [editTagline, setEditTagline] = useState('');
  const [storeLogo, setStoreLogo] = useState(null);
  const [updateStoreStatus, setUpdateStoreStatus] = useState('');


  // Category State
  const [categoryMap, setCategoryMap] = useState({});
  const SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/1cndRBsDSs3t9CEJuX7oDeFY68mSVZ38r92RInHsLriY/export?format=csv';

  useEffect(() => {
    loadStores();
    loadCategories();
  }, [user]);

  // Keep WhatsApp in sync with user profile
  useEffect(() => {
    setSellerContact(user?.whatsapp || '');
  }, [user?.whatsapp]);

  // When category changes, reset subcategory
  useEffect(() => {
    setSubcategory('');
  }, [category]);

  const loadStores = async () => {
    try {
      const res = await fetchSellerStores(user.id);
      setStores(res.data);
    } catch (err) {
      console.error('Failed to load stores', err);
    }
  };

  const handleCreateStore = async (e) => {
    e.preventDefault();
    if (!newStoreName) return;
    try {
      await createStore({ name: newStoreName, sellerId: user.id });
      setNewStoreName('');
      setStoreStatus('Store created successfully!');
      loadStores();
    } catch (err) {
      setStoreStatus('Failed to create store.');
    }
  };

  const loadMyProducts = async (storeId) => {
    try {
      setLoading(true);
      const res = await fetchStoreProducts(storeId);
      setMyProducts(res.data);
    } catch (err) {
      console.error('Failed to load my products', err);
    } finally {
      setLoading(false);
    }
  };

  const selectStore = (store) => {
    setSelectedStore(store);
    setEditStoreName(store.name);
    setEditRibbonColor(store.ribbonColor || '#4f46e5');
    setEditTagline(store.headerTagline || 'Welcome to our store! Browse our collection below.');
    setStoreLogo(null);
    setIsSettingsOpen(false); // Reset settings view
    loadMyProducts(store.id);
  };

  const handleUpdateStore = async (e) => {
    e.preventDefault();
    try {
      setUpdateStoreStatus('Updating...');
      const formData = new FormData();
      formData.append('name', editStoreName);
      formData.append('ribbonColor', editRibbonColor);
      formData.append('headerTagline', editTagline);
      if (storeLogo) {
        if (storeLogo.size > 300 * 1024) {
          setUpdateStoreStatus('Logo file size exceeds 300KB limit');
          return;
        }
        formData.append('logo', storeLogo);
      }

      const res = await updateStore(selectedStore.id, formData);
      setSelectedStore(res.data);
      setUpdateStoreStatus('Settings updated successfully!');
      loadStores(); // Refresh the list
      setTimeout(() => {
        setUpdateStoreStatus('');
        setIsSettingsOpen(false);
      }, 2000);
    } catch (err) {
      console.error('Update Store Error:', err);
      setUpdateStoreStatus('Failed to update settings.');
    }
  };

  const handleDeleteLogo = async () => {
    if (window.confirm('Are you sure you want to delete the store logo?')) {
      try {
        setUpdateStoreStatus('Deleting logo...');
        const res = await deleteStoreLogo(selectedStore.id);
        setSelectedStore(res.data);
        setUpdateStoreStatus('Logo deleted successfully!');
        loadStores();
        setTimeout(() => setUpdateStoreStatus(''), 2000);
      } catch (err) {
        console.error('Delete Logo Error:', err);
        setUpdateStoreStatus('Failed to delete logo.');
      }
    }
  };


  const handleDeleteStore = async (store, e) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this store? All listed products from this store will be permanently deleted from the database.')) {
      try {
        setStoreStatus('Deleting store...');
        await deleteStore(store.id);
        setStoreStatus('Store deleted successfully');
        loadStores();
      } catch (err) {
        setStoreStatus('Failed to delete store');
      }
    }
  };

  const loadCategories = async () => {
    try {
      const res = await fetch(SHEET_CSV_URL);
      const text = await res.text();
      const rows = text.split('\n').slice(1);
      const map = {};
      rows.forEach(row => {
        if (!row.trim()) return;
        const [cat, subcat] = row.split(',').map(s => s.trim());
        if (!map[cat]) map[cat] = [];
        if (subcat && !map[cat].includes(subcat)) {
          map[cat].push(subcat);
        }
      });
      setCategoryMap(map);
    } catch (err) {
      console.error("Failed to load categories from sheet", err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await deleteProduct(id);
        setStatus('Product deleted successfully');
        loadMyProducts(selectedStore.id);
      } catch (err) {
        setStatus('Failed to delete product');
      }
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!editingProductId && (!images || images.length === 0)) {
      setStatus('Please select at least one image');
      return;
    }
    const totalImages = existingImages.length + (images ? images.length : 0);
    if (totalImages > 5) {
      setStatus('Maximum 5 images allowed in total');
      return;
    }

    // Check file sizes
    if (images && images.length > 0) {
      for (let i = 0; i < images.length; i++) {
        if (images[i].size > 300 * 1024) {
          setStatus(`Image "${images[i].name}" exceeds 300KB limit`);
          return;
        }
      }
    }

    const formData = new FormData();
    formData.append('name', name);
    formData.append('price', price);
    formData.append('description', description);
    formData.append('category', category);
    formData.append('subcategory', subcategory);
    formData.append('sellerContact', sellerContact);
    formData.append('storeId', selectedStore.id);
    for (let i = 0; i < existingImages.length; i++) {
      formData.append('retainedImageIds', existingImages[i].id);
    }
    for (let i = 0; i < images.length; i++) {
      formData.append('images', images[i]);
    }

    try {
      setStatus(editingProductId ? 'Updating...' : 'Uploading...');
      if (editingProductId) {
        await updateProduct(editingProductId, formData);
        setStatus('Product updated successfully!');
      } else {
        await uploadProduct(formData);
        setStatus('Product uploaded successfully!');
      }
      
      cancelEdit();
      e.target.reset();
      loadMyProducts(selectedStore.id);
    } catch (err) {
      setStatus(editingProductId ? 'Update failed.' : 'Upload failed.');
    }
  };

  const handleEdit = (product) => {
    setEditingProductId(product.id);
    setName(product.name);
    setPrice(product.price);
    setDescription(product.description || '');
    setCategory(product.category || '');
    setSubcategory(product.subcategory || '');
    setSellerContact(user?.whatsapp || '');
    
    if (product.imageUrls) {
      const parsedImages = product.imageUrls.map(url => ({
        id: url.split('/').pop(),
        url: url
      }));
      setExistingImages(parsedImages);
    } else {
      setExistingImages([]);
    }
    
    setImages([]); // clear new images array
    setStatus('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditingProductId(null);
    setName('');
    setPrice('');
    setDescription('');
    setCategory('');
    setSubcategory('');
    setSellerContact(user?.whatsapp || '');
    setImages([]);
    setExistingImages([]);
    setStatus('');
  };

  if (!selectedStore) {
    return (
      <div style={{ backgroundColor: '#f8fafc', minHeight: 'calc(100vh - 70px)' }}>
        <div style={{ backgroundColor: '#0f172a', padding: '1.5rem 0', marginBottom: '1rem' }}>
          <div style={{ maxWidth: '1600px', margin: '0 auto', padding: '0 1rem', textAlign: 'left' }}>
            <h1 className="dashboard-title" style={{ color: '#ffffff', fontSize: '2rem', marginBottom: '0.5rem' }}>My Stores</h1>
            <p className="dashboard-subtitle" style={{ color: '#cbd5e1' }}>Select a store to manage inventory or create a new one.</p>
          </div>
        </div>
        
        <div className="container" style={{ position: 'relative', zIndex: 10, paddingTop: '2rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem' }}>
            
            {/* Create Store Card */}
            <div className="glass" style={{ padding: '2rem', borderRadius: '1rem', backgroundColor: '#ffffff', border: '1px solid #e2e8f0', boxShadow: 'var(--shadow-lg)' }}>
              <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Create New Store</h2>
              {storeStatus && <p style={{ color: storeStatus.includes('successfully') ? 'green' : 'red', marginBottom: '1rem' }}>{storeStatus}</p>}
              <form onSubmit={handleCreateStore} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <input 
                  type="text" 
                  className="input-field" 
                  placeholder="Enter store name..." 
                  value={newStoreName} 
                  onChange={(e) => setNewStoreName(e.target.value)} 
                  required 
                />
                <button type="submit" className="btn btn-primary">Create Store</button>
              </form>
            </div>

            {/* Existing Stores */}
            {stores.map(store => (
              <div 
                key={store.id} 
                className="glass" 
                style={{ position: 'relative', padding: '2rem', borderRadius: '1rem', backgroundColor: '#ffffff', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)', cursor: 'pointer', transition: 'all 0.2s', ':hover': { transform: 'translateY(-5px)', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' } }}
                onClick={() => selectStore(store)}
              >
                <button 
                  onClick={(e) => handleDeleteStore(store, e)}
                  style={{ position: 'absolute', top: '1rem', right: '1rem', backgroundColor: '#fee2e2', color: '#b91c1c', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '0.25rem', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', zIndex: 10 }}
                >
                  Delete Store
                </button>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem', marginTop: '0.5rem' }}>
                  <h2 style={{ fontSize: '1.5rem', margin: 0 }}>{store.name}</h2>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
                  <div style={{ color: '#64748b', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ backgroundColor: '#f0fdf4', color: '#16a34a', padding: '0.2rem 0.6rem', borderRadius: '1rem', fontWeight: 'bold', fontSize: '0.8rem' }}>
                      {store.productCount}
                    </span>
                    <span>Active Products Listed</span>
                  </div>
                  <div style={{ color: '#64748b', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <span style={{ fontSize: '1.2rem' }}>👁️</span>
                      <strong>{store.totalViews || 0}</strong> Views
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <span style={{ fontSize: '1.2rem' }}>👆</span>
                      <strong>{store.totalClicks || 0}</strong> Clicks
                    </div>
                  </div>
                </div>
                
                {store.uniqueUrl && (
                  <div style={{ marginTop: '1rem' }} onClick={(e) => e.stopPropagation()}>
                    <button 
                      onClick={() => {
                        const url = `${window.location.origin}/store/${store.uniqueUrl}`;
                        if (navigator.clipboard && window.isSecureContext) {
                          navigator.clipboard.writeText(url).then(() => {
                            alert('Store link copied to clipboard!');
                          }).catch(err => {
                            console.error('Failed to copy: ', err);
                          });
                        } else {
                          // Fallback for non-HTTPS/older browsers
                          const textArea = document.createElement("textarea");
                          textArea.value = url;
                          document.body.appendChild(textArea);
                          textArea.select();
                          try {
                            document.execCommand('copy');
                            alert('Store link copied to clipboard!');
                          } catch (err) {
                            console.error('Fallback copy failed', err);
                          }
                          document.body.removeChild(textArea);
                        }
                      }}
                      style={{ 
                        backgroundColor: '#f1f5f9', 
                        color: '#334155', 
                        border: '1px solid #cbd5e1', 
                        padding: '0.4rem 0.8rem', 
                        borderRadius: '0.25rem', 
                        fontSize: '0.8rem', 
                        fontWeight: 600, 
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                        transition: 'all 0.2s'
                      }}
                      onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#e2e8f0'}
                      onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'}
                      title="Copy public store link for buyers"
                    >
                      <span>🔗</span> Copy Store Link
                    </button>
                  </div>
                )}

                <div style={{ marginTop: '1.5rem', color: '#4f46e5', fontWeight: 600, fontSize: '0.9rem', display: 'flex', alignItems: 'center' }}>
                  Manage Inventory &rarr;
                </div>
              </div>
            ))}
            
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: 'calc(100vh - 70px)' }}>
      <div style={{ backgroundColor: '#0f172a', padding: '1.5rem 0', marginBottom: '1rem' }}>
        <div style={{ maxWidth: '1600px', margin: '0 auto', padding: '0 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 className="dashboard-title" style={{ color: '#ffffff', fontSize: '2rem', marginBottom: '0.5rem' }}>{selectedStore.name}</h1>
            <p className="dashboard-subtitle" style={{ color: '#cbd5e1' }}>Manage your inventory and list new products.</p>
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button 
              onClick={() => setIsSettingsOpen(!isSettingsOpen)} 
              className="btn" 
              style={{ backgroundColor: isSettingsOpen ? '#3b82f6' : 'rgba(255,255,255,0.1)', color: '#ffffff', border: '1px solid rgba(255,255,255,0.2)' }}
            >
              {isSettingsOpen ? '✕ Close Settings' : '⚙ Store Settings'}
            </button>
            <button onClick={() => setSelectedStore(null)} className="btn" style={{ backgroundColor: 'rgba(255,255,255,0.1)', color: '#ffffff', border: '1px solid rgba(255,255,255,0.2)' }}>
              &larr; Back to Stores
            </button>
          </div>
        </div>
      </div>

      {isSettingsOpen && (
        <div className="container" style={{ marginBottom: '2rem' }}>
          <div className="glass" style={{ padding: window.innerWidth < 768 ? '1.5rem' : '2.5rem', borderRadius: '1rem', backgroundColor: '#ffffff', border: '1px solid #e2e8f0', boxShadow: 'var(--shadow-lg)' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '2px solid #f1f5f9', paddingBottom: '1rem' }}>
              <span style={{ fontSize: '1.5rem', marginRight: '0.75rem' }}>⚙</span>
              <h2 style={{ fontSize: '1.5rem', color: '#1e293b', margin: 0 }}>Store Customization</h2>
            </div>
            
            {updateStoreStatus && (
              <div style={{ padding: '1rem', marginBottom: '1.5rem', borderRadius: '0.5rem', backgroundColor: updateStoreStatus.includes('successfully') ? '#dcfce7' : '#fee2e2', color: updateStoreStatus.includes('successfully') ? '#166534' : '#991b1b', fontWeight: 500 }}>
                {updateStoreStatus}
              </div>
            )}
            
            <form onSubmit={handleUpdateStore} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#475569', fontSize: '0.9rem' }}>Store Display Name</label>
                <input 
                  type="text" 
                  className="input-field" 
                  value={editStoreName} 
                  onChange={(e) => setEditStoreName(e.target.value)} 
                  required 
                  style={{ border: '1px solid #cbd5e1', backgroundColor: '#f8fafc' }}
                />
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#475569', fontSize: '0.9rem' }}>Header Ribbon Color</label>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                  <input 
                    type="color" 
                    value={editRibbonColor} 
                    onChange={(e) => setEditRibbonColor(e.target.value)} 
                    style={{ width: '50px', height: '42px', padding: '2px', borderRadius: '8px', border: '1px solid #cbd5e1', cursor: 'pointer', backgroundColor: '#ffffff' }}
                  />
                  <input 
                    type="text" 
                    className="input-field" 
                    value={editRibbonColor} 
                    onChange={(e) => setEditRibbonColor(e.target.value)} 
                    style={{ width: '100px', fontSize: '0.9rem', fontFamily: 'monospace', flexShrink: 0 }}
                  />
                  <div style={{ 
                    flex: 1, 
                    minWidth: '100px',
                    height: '42px', 
                    backgroundColor: editRibbonColor, 
                    borderRadius: '8px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    color: '#ffffff',
                    fontWeight: 'bold',
                    fontSize: '0.85rem',
                    textShadow: '0 1px 2px rgba(0,0,0,0.3)',
                    border: '1px solid rgba(0,0,0,0.1)',
                    boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.1)'
                  }}>
                    Preview
                  </div>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#475569', fontSize: '0.9rem' }}>Header Tagline / Welcome Message</label>
                <textarea 
                  className="input-field" 
                  value={editTagline} 
                  onChange={(e) => setEditTagline(e.target.value)} 
                  placeholder="Enter a catchy welcome message for your store header..."
                  style={{ width: '100%', minHeight: '80px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', padding: '0.75rem', borderRadius: '0.5rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#475569', fontSize: '0.9rem' }}>Store Logo</label>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0', flexWrap: 'wrap' }}>
                  {(selectedStore.logoUrl || storeLogo) ? (
                    <div style={{ position: 'relative' }}>
                      <img 
                        src={storeLogo ? URL.createObjectURL(storeLogo) : selectedStore.logoUrl} 
                        alt="Store Logo" 
                        style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #3b82f6', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }} 
                      />
                      {selectedStore.logoUrl && !storeLogo && (
                        <button 
                          type="button"
                          onClick={handleDeleteLogo}
                          style={{ position: 'absolute', top: '-5px', right: '-5px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '50%', width: '24px', height: '24px', cursor: 'pointer', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}
                          title="Delete Logo"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ) : (
                    <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: '1.5rem', border: '2px dashed #cbd5e1' }}>
                      🖼️
                    </div>
                  )}
                  
                  <div style={{ flex: 1 }}>
                    <input 
                      type="file" 
                      id="logo-upload"
                      accept="image/*"
                      onChange={(e) => setStoreLogo(e.target.files[0])}
                      style={{ display: 'none' }}
                    />
                    <label 
                      htmlFor="logo-upload" 
                      className="btn" 
                      style={{ display: 'inline-block', backgroundColor: '#ffffff', color: '#1e293b', border: '1px solid #cbd5e1', padding: '0.5rem 1rem', fontSize: '0.85rem', cursor: 'pointer', borderRadius: '0.4rem', fontWeight: 600 }}
                    >
                      {selectedStore.logoUrl ? 'Change Logo' : 'Upload Logo'}
                    </label>
                    {storeLogo && (
                      <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontSize: '0.75rem', color: '#3b82f6', fontWeight: 500 }}>Selected: {storeLogo.name}</span>
                        <button type="button" onClick={() => setStoreLogo(null)} style={{ border: 'none', background: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '0.8rem' }}>Cancel</button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1, minWidth: '200px', height: '42px', fontWeight: 'bold' }}>
                  Update Store Settings
                </button>
                <button type="button" onClick={(e) => handleDeleteStore(selectedStore, e)} className="btn" style={{ backgroundColor: '#fee2e2', color: '#b91c1c', border: '1px solid #fecaca', flex: 1, minWidth: '200px' }}>
                  Delete Store
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      
      <div style={{ maxWidth: '1600px', margin: '0 auto', padding: '0 1rem', position: 'relative', zIndex: 10, paddingTop: '2rem' }}>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', 
          gap: '2rem',
          alignItems: 'start' 
        }}>
          
          {/* Left Column: Form */}
          <div className="glass" style={{ padding: '2.5rem', borderRadius: '1rem', border: '1px solid #e2e8f0', boxShadow: 'var(--shadow-lg)', backgroundColor: '#ffffff' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '2rem', borderBottom: '2px solid #f1f5f9', paddingBottom: '1rem' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: '#eef2ff', color: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '1rem', fontWeight: 'bold', fontSize: '1.2rem' }}>
                {editingProductId ? '✎' : '+'}
              </div>
              <h2 style={{ fontSize: '1.5rem', color: '#1e293b', margin: 0 }}>{editingProductId ? 'Edit Product' : 'List New Product'}</h2>
            </div>
            
            {status && (
              <div style={{ 
                padding: '1rem', 
                marginBottom: '1.5rem', 
                borderRadius: '0.5rem', 
                backgroundColor: status.includes('successfully') ? '#dcfce7' : '#fee2e2',
                color: status.includes('successfully') ? '#166534' : '#991b1b',
                fontWeight: 500
              }}>
                {status}
              </div>
            )}
            
            <form onSubmit={handleUpload} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#475569', fontSize: '0.9rem' }}>Product Name</label>
                <input type="text" placeholder="e.g. Premium Watch" className="input-field" value={name} onChange={(e) => setName(e.target.value)} required style={{ border: '1px solid #cbd5e1', backgroundColor: '#f8fafc' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#475569', fontSize: '0.9rem' }}>Category</label>
                  <select 
                    className="input-field" 
                    value={category} 
                    onChange={(e) => setCategory(e.target.value)} 
                    required 
                    style={{ border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', width: '100%' }}
                  >
                    <option value="" disabled>Select Category</option>
                    {Object.keys(categoryMap).map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#475569', fontSize: '0.9rem' }}>Subcategory</label>
                  <select 
                    className="input-field" 
                    value={subcategory} 
                    onChange={(e) => setSubcategory(e.target.value)} 
                    required 
                    style={{ border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', width: '100%' }}
                    disabled={!category || !categoryMap[category]}
                  >
                    <option value="" disabled>Select Subcategory</option>
                    {category && categoryMap[category] && categoryMap[category].map(sub => (
                      <option key={sub} value={sub}>{sub}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#475569', fontSize: '0.9rem' }}>Price (₹)</label>
                  <input type="number" step="0.01" placeholder="0.00" className="input-field" value={price} onChange={(e) => setPrice(e.target.value)} required style={{ border: '1px solid #cbd5e1', backgroundColor: '#f8fafc' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#475569', fontSize: '0.9rem' }}>WhatsApp Contact</label>
                  <input 
                    type="text" 
                    placeholder="+1234567890" 
                    className="input-field" 
                    value={sellerContact} 
                    onChange={(e) => setSellerContact(e.target.value)} 
                    required 
                    readOnly
                    style={{ border: '1px solid #cbd5e1', backgroundColor: '#f1f5f9', cursor: 'not-allowed' }} 
                    title="WhatsApp number is pulled from your account settings"
                  />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#475569', fontSize: '0.9rem' }}>Product Description</label>
                <textarea 
                  placeholder="Describe your product..." 
                  className="input-field" 
                  value={description} 
                  onChange={(e) => setDescription(e.target.value)} 
                  required 
                  style={{ border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', minHeight: '100px', resize: 'vertical' }} 
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#475569', fontSize: '0.9rem' }}>
                  Product Images (Max 5) {editingProductId && <span style={{ fontWeight: 'normal', color: '#94a3b8' }}>(You can keep or replace existing images)</span>}
                </label>
                <div style={{ border: '2px dashed #cbd5e1', borderRadius: '0.5rem', padding: '1.5rem', textAlign: 'center', backgroundColor: '#f8fafc', cursor: 'pointer' }}>
                  <input 
                    type="file" 
                    accept="image/*" 
                    multiple 
                    onChange={(e) => {
                      const newFiles = Array.from(e.target.files);
                      setImages(prev => {
                        const availableSlots = 5 - existingImages.length;
                        const combined = [...prev, ...newFiles];
                        return combined.slice(0, availableSlots); // Keep max 5 total
                      });
                    }} 
                    style={{ width: '100%', marginBottom: '0.5rem' }} 
                    required={!editingProductId && existingImages.length === 0}
                  />
                  <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
                    {existingImages.length + images.length} / 5 images total
                  </div>
                  {(existingImages.length > 0 || images.length > 0) && (
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem', flexWrap: 'wrap' }}>
                      {existingImages.map((img, idx) => (
                        <div key={`existing-${idx}`} style={{ position: 'relative', width: '60px', height: '60px', borderRadius: '0.25rem', overflow: 'hidden', border: '2px solid #4f46e5' }}>
                          <img src={img.url} alt={`existing ${idx}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          <button 
                            type="button"
                            onClick={() => setExistingImages(prev => prev.filter((_, i) => i !== idx))}
                            style={{ position: 'absolute', top: 0, right: 0, background: 'rgba(255,0,0,0.7)', color: 'white', border: 'none', borderRadius: '0 0 0 0.25rem', cursor: 'pointer', padding: '2px 4px', fontSize: '0.7rem' }}
                            title="Remove existing image"
                          >
                            X
                          </button>
                        </div>
                      ))}
                      {images.map((file, idx) => (
                        <div key={`new-${idx}`} style={{ position: 'relative', width: '60px', height: '60px', borderRadius: '0.25rem', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                          <img src={URL.createObjectURL(file)} alt={`preview ${idx}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          <button 
                            type="button"
                            onClick={() => setImages(prev => prev.filter((_, i) => i !== idx))}
                            style={{ position: 'absolute', top: 0, right: 0, background: 'rgba(255,0,0,0.7)', color: 'white', border: 'none', borderRadius: '0 0 0 0.25rem', cursor: 'pointer', padding: '2px 4px', fontSize: '0.7rem' }}
                            title="Remove new image"
                          >
                            X
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1, padding: '1rem', fontSize: '1rem', fontWeight: 'bold', backgroundColor: '#4f46e5', boxShadow: '0 4px 14px 0 rgba(79, 70, 229, 0.39)' }}>
                  {editingProductId ? 'Update Product' : 'Publish Product'}
                </button>
                {editingProductId && (
                  <button type="button" onClick={cancelEdit} className="btn" style={{ padding: '1rem', fontSize: '1rem', fontWeight: 'bold', backgroundColor: '#e2e8f0', color: '#475569' }}>
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Right Column: List */}
          <div className="glass" style={{ padding: '2.5rem', borderRadius: '1rem', border: '1px solid #e2e8f0', boxShadow: 'var(--shadow-lg)', backgroundColor: '#ffffff', minHeight: '600px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', borderBottom: '2px solid #f1f5f9', paddingBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: '#f0fdf4', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '1rem', fontWeight: 'bold', fontSize: '1.2rem' }}>
                  ☰
                </div>
                <h2 style={{ fontSize: '1.5rem', color: '#1e293b', margin: 0 }}>Active Inventory</h2>
              </div>
              <span style={{ backgroundColor: '#eef2ff', color: '#4f46e5', padding: '0.25rem 0.75rem', borderRadius: '1rem', fontWeight: 'bold', fontSize: '0.9rem' }}>
                {myProducts.length} Items
              </span>
            </div>

            {loading ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                <p>Loading your inventory...</p>
              </div>
            ) : myProducts.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '4rem 2rem', backgroundColor: '#f8fafc', borderRadius: '0.5rem', border: '1px dashed #cbd5e1' }}>
                <p style={{ color: '#64748b', fontSize: '1.1rem', marginBottom: '1rem' }}>Your inventory is empty</p>
                <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Use the form to list your first product.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '600px', overflowY: 'auto', paddingRight: '0.5rem' }}>
                {myProducts.map(product => (
                  <div key={product.id} className="inventory-card">
                    <div className="inventory-card-image">
                      <img 
                        src={product.imageUrls && product.imageUrls.length > 0 ? product.imageUrls[0] : ''} 
                        alt={product.name} 
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </div>
                    <div style={{ padding: '1rem', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <h3 style={{ fontSize: '1.1rem', color: '#0f172a', margin: '0 0 0.25rem 0' }}>{product.name}</h3>
                          <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.75rem', color: '#64748b' }}>
                            <span>{product.category || 'Uncategorized'}</span>
                            <span>&bull;</span>
                            <span>{product.subcategory || 'Uncategorized'}</span>
                          </div>
                          <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', fontSize: '0.8rem', color: '#475569', fontWeight: 600 }}>
                            <span title="Total Views">👁️ {product.views || 0}</span>
                            <span title="WhatsApp Clicks">👆 {product.clicks || 0}</span>
                          </div>
                        </div>
                        <p style={{ color: '#4f46e5', fontWeight: 'bold', fontSize: '1.2rem', margin: 0 }}>₹{product.price}</p>
                      </div>
                      <div style={{ marginTop: 'auto', paddingTop: '0.75rem', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                        <button 
                          onClick={() => handleEdit(product)} 
                          style={{ backgroundColor: '#eef2ff', color: '#4f46e5', border: 'none', padding: '0.4rem 1rem', borderRadius: '0.25rem', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', transition: 'background 0.2s' }}
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => handleDelete(product.id)} 
                          style={{ backgroundColor: '#fee2e2', color: '#b91c1c', border: 'none', padding: '0.4rem 1rem', borderRadius: '0.25rem', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', transition: 'background 0.2s' }}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerDashboard;
