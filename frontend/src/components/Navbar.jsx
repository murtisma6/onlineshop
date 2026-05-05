import { useNavigate } from 'react-router-dom';

const Navbar = ({ user, onLogout }) => {
  const navigate = useNavigate();

  return (
    <nav style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '1rem 2rem',
      backgroundColor: '#0f172a', /* Professional Navy Blue */
      color: '#ffffff',
      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
      position: 'sticky',
      top: 0,
      zIndex: 1000
    }}>
      <div 
        style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#ffffff', cursor: 'pointer', letterSpacing: '0.5px' }}
        onClick={() => navigate('/')}
      >
        Shop Premium
      </div>
      <div>
        {user ? (
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <span style={{ color: '#cbd5e1', fontSize: '0.9rem' }}>Welcome, {user.username}</span>
            <button onClick={() => navigate('/account')} className="btn" style={{ backgroundColor: 'transparent', color: '#60a5fa', border: '1px solid #3b82f6' }}>My Account</button>
            {user.role === 'SELLER' && (
              <button onClick={() => navigate('/seller')} className="btn" style={{ backgroundColor: 'rgba(255,255,255,0.1)', color: '#ffffff', border: '1px solid rgba(255,255,255,0.2)' }}>Dashboard</button>
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
