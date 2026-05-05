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
    </Router>
  );
}

export default App;
