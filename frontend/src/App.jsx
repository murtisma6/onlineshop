import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import BuyerHome from './pages/BuyerHome';
import SellerDashboard from './pages/SellerDashboard';
import ProductDetail from './pages/ProductDetail';
import Account from './pages/Account';
import Storefront from './pages/Storefront';
import AdminDashboard from './pages/AdminDashboard';
import DigiStorePricing from './pages/DigiStorePricing';
import UserManagement from './pages/UserManagement';
import ContactUs from './pages/ContactUs';

function App() {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const handleSetUser = (userData) => {
    setUser(userData);
    if (userData) {
      localStorage.setItem('user', JSON.stringify(userData));
    } else {
      localStorage.removeItem('user');
    }
  };

  const handleLogout = () => {
    handleSetUser(null);
  };

  return (
    <Router>
      <Navbar user={user} onLogout={handleLogout} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <Routes>
            <Route path="/login" element={<Login setUser={handleSetUser} />} />
            <Route path="/register" element={<Register setUser={handleSetUser} />} />
            
            {/* Account Route */}
            <Route 
              path="/account" 
              element={
                user ? 
                <Account user={user} setUser={handleSetUser} /> : 
                <Navigate to="/login" />
              } 
            />
            
            {/* Buyer Route */}
            <Route 
              path="/" 
              element={<BuyerHome user={user} />} 
            />

            {/* Product Detail Route */}
            <Route path="/product/:id" element={<ProductDetail />} />
            
            {/* Storefront Route */}
            <Route path="/store/:uniqueUrl" element={<Storefront />} />

            {/* Contact Us Route */}
            <Route path="/contact-us" element={<ContactUs />} />

            {/* DigiStore Pricing Route */}
            <Route path="/own-your-digistore" element={<DigiStorePricing />} />
            
            {/* Protected Seller Route */}
            <Route 
              path="/seller" 
              element={
                user && user.role === 'SELLER' ? 
                <SellerDashboard user={user} /> : 
                <Navigate to="/login" />
              } 
            />
            
            {/* Protected Admin Routes */}
            <Route 
              path="/admin" 
              element={
                user && user.role === 'ADMIN' ? 
                <AdminDashboard user={user} /> : 
                <Navigate to="/" />
              } 
            />
            <Route 
              path="/admin/users" 
              element={
                user && user.role === 'ADMIN' ? 
                <UserManagement /> : 
                <Navigate to="/" />
              } 
            />
          </Routes>
        </div>
        <footer style={{ backgroundColor: '#1E3147', color: '#94a3b8', padding: '1.5rem 1rem', textAlign: 'center', borderTop: '1px solid #1e293b' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto 1rem auto' }}>
            <h3 style={{ fontSize: '0.9rem', color: '#cbd5e1', marginBottom: '0.5rem', fontWeight: 'bold' }}>Global Dawoodi Bohra Marketplace</h3>
            <p style={{ fontSize: '0.75rem', lineHeight: '1.5', margin: 0 }}>
              Empowering Bohra Businesses worldwide. Discover authentic products, unique digital storefronts, and connect with sellers from the Dawoodi Bohra Community.
            </p>
          </div>
          <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>
            &copy; copyright 2026 MCube Hive IT Solutions
          </div>
        </footer>
    </Router>
  );
}

export default App;
