import { useState, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';

// Lazy-load all page components so heavy libraries (like country-state-city's
// 8.5MB dataset) are NOT downloaded/parsed on the initial home-page load.
// This is the fix for "RangeError: Maximum call stack size exceeded" on iOS Safari.
const Login           = lazy(() => import('./pages/Login'));
const Register        = lazy(() => import('./pages/Register'));
const BuyerHome       = lazy(() => import('./pages/BuyerHome'));
const SellerDashboard = lazy(() => import('./pages/SellerDashboard'));
const ProductDetail   = lazy(() => import('./pages/ProductDetail'));
const Account         = lazy(() => import('./pages/Account'));
const Storefront      = lazy(() => import('./pages/Storefront'));
const AdminDashboard  = lazy(() => import('./pages/AdminDashboard'));
const DigiStorePricing = lazy(() => import('./pages/DigiStorePricing'));
const UserManagement  = lazy(() => import('./pages/UserManagement'));
const ContactUs       = lazy(() => import('./pages/ContactUs'));

// Simple full-screen loading fallback shown while a page chunk is loading
const PageLoader = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 'calc(100vh - 70px)', backgroundColor: '#f8fafc' }}>
    <div style={{ textAlign: 'center', color: '#1E3147' }}>
      <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>⏳</div>
      <p style={{ fontSize: '1rem', color: '#64748b' }}>Loading...</p>
    </div>
  </div>
);

function App() {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (e) {
      console.error('Failed to parse user from localStorage', e);
      return null;
    }
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
          <Suspense fallback={<PageLoader />}>
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
          </Suspense>
        </div>
        <style>{`
          .footer-container {
            background-color: #1E3147;
            color: #94a3b8;
            padding: 0.75rem 1.25rem;
            text-align: center;
            border-top: 1px solid #1e293b;
          }
          .footer-description {
            font-size: 0.75rem;
            line-height: 1.4;
            margin: 0 auto 0.5rem auto;
            max-width: 1000px;
            color: #94a3b8;
          }
          .footer-copyright {
            font-size: 0.8rem;
            opacity: 0.9;
            font-weight: bold;
            color: #cbd5e1;
          }
          @media (max-width: 768px) {
            .footer-description {
              font-size: 0.75rem;
              line-height: 1.3;
            }
            .footer-container {
              padding: 1rem 1.25rem;
            }
          }
        `}</style>
        <footer className="footer-container">
          <div className="footer-description">
            Empowering Bohra Businesses worldwide. Discover authentic products, unique digital storefronts, and connect with sellers from the Dawoodi Bohra Community.
          </div>
          <div className="footer-copyright">
            &copy; copyright 2026 MCube Hive IT Solutions
          </div>
        </footer>
    </Router>
  );
}

export default App;
