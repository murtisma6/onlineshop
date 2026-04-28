import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import BuyerHome from './pages/BuyerHome';
import SellerDashboard from './pages/SellerDashboard';

function App() {
  const [user, setUser] = useState(null);

  const handleLogout = () => {
    setUser(null);
  };

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login setUser={setUser} />} />
        <Route path="/register" element={<Register setUser={setUser} />} />
        
        {/* Buyer Route */}
        <Route 
          path="/" 
          element={<BuyerHome user={user} onLogout={handleLogout} />} 
        />
        
        {/* Protected Seller Route */}
        <Route 
          path="/seller" 
          element={
            user && user.role === 'SELLER' ? 
            <SellerDashboard user={user} onLogout={handleLogout} /> : 
            <Navigate to="/login" />
          } 
        />
      </Routes>
    </Router>
  );
}

export default App;
