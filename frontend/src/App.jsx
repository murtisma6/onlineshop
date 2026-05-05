import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import BuyerHome from './pages/BuyerHome';
import SellerDashboard from './pages/SellerDashboard';
import ProductDetail from './pages/ProductDetail';
import Account from './pages/Account';

function App() {
  const [user, setUser] = useState(null);

  const handleLogout = () => {
    setUser(null);
  };

  return (
    <Router>
      <Navbar user={user} onLogout={handleLogout} />
      <Routes>
        <Route path="/login" element={<Login setUser={setUser} />} />
        <Route path="/register" element={<Register setUser={setUser} />} />
        
        {/* Account Route */}
        <Route 
          path="/account" 
          element={
            user ? 
            <Account user={user} setUser={setUser} /> : 
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
        
        {/* Protected Seller Route */}
        <Route 
          path="/seller" 
          element={
            user && user.role === 'SELLER' ? 
            <SellerDashboard user={user} /> : 
            <Navigate to="/login" />
          } 
        />
      </Routes>
    </Router>
  );
}

export default App;
