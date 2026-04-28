import { useState } from 'react';
import { uploadProduct } from '../api';

const SellerDashboard = ({ user, onLogout }) => {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [sellerContact, setSellerContact] = useState('');
  const [image, setImage] = useState(null);
  const [status, setStatus] = useState('');

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!image) {
      setStatus('Please select an image');
      return;
    }

    const formData = new FormData();
    formData.append('name', name);
    formData.append('price', price);
    formData.append('sellerContact', sellerContact);
    formData.append('sellerId', user.id);
    formData.append('image', image);

    try {
      setStatus('Uploading...');
      await uploadProduct(formData);
      setStatus('Product uploaded successfully!');
      setName('');
      setPrice('');
      setSellerContact('');
      setImage(null);
      e.target.reset();
    } catch (err) {
      setStatus('Upload failed.');
    }
  };

  return (
    <div className="container" style={{ paddingTop: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ color: 'var(--primary-color)' }}>Seller Dashboard</h1>
        <button onClick={onLogout} className="btn" style={{ border: '1px solid var(--border)' }}>Logout</button>
      </div>
      
      <div className="glass" style={{ padding: '2rem', borderRadius: '1rem', maxWidth: '600px', margin: '0 auto' }}>
        <h2 style={{ marginBottom: '1.5rem' }}>List a New Product</h2>
        {status && <p style={{ marginBottom: '1rem', color: status.includes('successfully') ? 'green' : 'red' }}>{status}</p>}
        
        <form onSubmit={handleUpload} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Product Name</label>
            <input type="text" className="input-field" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Price ($)</label>
            <input type="number" step="0.01" className="input-field" value={price} onChange={(e) => setPrice(e.target.value)} required />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>WhatsApp Number</label>
            <input type="text" placeholder="+1234567890" className="input-field" value={sellerContact} onChange={(e) => setSellerContact(e.target.value)} required />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Product Image</label>
            <input type="file" accept="image/*" className="input-field" onChange={(e) => setImage(e.target.files[0])} required />
          </div>
          
          <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem', padding: '0.75rem' }}>Upload Product</button>
        </form>
      </div>
    </div>
  );
};

export default SellerDashboard;
