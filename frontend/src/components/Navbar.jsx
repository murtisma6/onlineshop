import { useNavigate } from 'react-router-dom';

const Navbar = ({ user, onLogout }) => {
  const navigate = useNavigate();

  return (
    <nav style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '1rem',
      backgroundColor: '#0f172a', /* Professional Navy Blue */
      color: '#ffffff',
      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
      position: 'sticky',
      top: 0,
      zIndex: 1000
    }}>
      <div 
        style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.75rem' }}
        onClick={() => navigate('/')}
        title="Home"
      >
        <svg width="32" height="32" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M20 5L5 18V35H14V25H26V35H35V18L20 5Z" fill="#3b82f6" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M20 5L35 18M20 5L5 18" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <span style={{ fontSize: '1.25rem', fontWeight: '700', letterSpacing: '0.5px', color: '#ffffff' }}>Buyer's Home</span>
      </div>
      <div>
        {user ? (
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <span style={{ color: '#cbd5e1', fontSize: '0.9rem' }}>Welcome, {user.username}</span>
            <button onClick={() => navigate('/account')} className="btn" style={{ backgroundColor: 'transparent', color: '#60a5fa', border: '1px solid #3b82f6' }}>My Account</button>
            {user.role === 'SELLER' && (
              <button onClick={() => navigate('/seller')} className="btn" style={{ backgroundColor: 'rgba(255,255,255,0.1)', color: '#ffffff', border: '1px solid rgba(255,255,255,0.2)' }}>Dashboard</button>
            )}
            {user.role === 'ADMIN' && (
              <button onClick={() => navigate('/admin')} className="btn" style={{ backgroundColor: '#10b981', color: '#ffffff', border: '1px solid #059669', fontWeight: 'bold' }}>Admin Dashboard</button>
            )}
            <button onClick={() => { onLogout(); navigate('/'); }} className="btn" style={{ backgroundColor: 'transparent', color: '#cbd5e1', border: '1px solid #475569' }}>Logout</button>
          </div>
        ) : (
          <button onClick={() => navigate('/login')} className="btn" style={{ backgroundColor: '#ffffff', color: '#0f172a', fontWeight: 'bold' }}>Login</button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
