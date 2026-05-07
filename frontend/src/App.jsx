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
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Navbar user={user} onLogout={handleLogout} />
        <div style={{ flex: 1 }}>
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
            
            {/* Protected Admin Route */}
            <Route 
              path="/admin" 
              element={
                user && user.role === 'ADMIN' ? 
                <AdminDashboard user={user} /> : 
                <Navigate to="/" />
              } 
            />
          </Routes>
        </div>
        <footer style={{ backgroundColor: '#1E3147', color: '#94a3b8', padding: '0.75rem', textAlign: 'center', fontSize: '0.875rem', borderTop: '1px solid #1e293b' }}>
          &copy; copyright 2026 MCube Hive IT Solutions
        </footer>
      </div>
    </Router>
  );
}

export default App;
