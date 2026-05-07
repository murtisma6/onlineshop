import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Navbar = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <nav style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '0.75rem 1.5rem',
      backgroundColor: '#1E3147', /* Brand Navy Blue */
      color: '#ffffff',
      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
      position: 'sticky',
      top: 0,
      zIndex: 1000,
      height: '70px'
    }}>
      <div 
        style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.75rem' }}
        onClick={() => navigate('/')}
        title="Home"
      >
        <svg className="nav-logo-svg" width="36" height="36" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M20 5L5 18V35H14V25H26V35H35V18L20 5Z" fill="#3b82f6" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M20 5L35 18M20 5L5 18" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <span className="nav-title" style={{ fontSize: '1.35rem', fontWeight: '700', letterSpacing: '0.5px', color: '#ffffff' }}>{user ? "Buyers Digital Store" : "Digital Store"}</span>
      </div>
      <div>
        {user ? (
          <div style={{ position: 'relative' }} ref={dropdownRef}>
            <button 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)} 
              className="btn btn-nav" 
              style={{ 
                backgroundColor: 'rgba(255,255,255,0.1)', 
                color: '#ffffff', 
                border: '1px solid rgba(255,255,255,0.2)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem 1rem',
                borderRadius: '0.5rem',
                fontWeight: '600',
                transition: 'all 0.2s'
              }}
            >
              <span>👤 My Account</span>
              <span style={{ fontSize: '0.7rem', transform: isDropdownOpen ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }}>▼</span>
            </button>

            {isDropdownOpen && (
              <div style={{
                position: 'absolute',
                top: 'calc(100% + 0.5rem)',
                right: 0,
                backgroundColor: '#ffffff',
                color: '#1e293b',
                borderRadius: '0.75rem',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                minWidth: '200px',
                padding: '0.5rem',
                zIndex: 1001,
                border: '1px solid #e2e8f0',
                overflow: 'hidden'
              }}>
                <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid #f1f5f9', marginBottom: '0.25rem' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#1E3147' }}>{user.username}</div>
                  <div style={{ fontSize: '0.7rem', color: '#64748b' }}>{user.role} Account</div>
                </div>

                <button 
                  onClick={() => { navigate('/account'); setIsDropdownOpen(false); }}
                  style={{ width: '100%', textAlign: 'left', padding: '0.6rem 1rem', backgroundColor: 'transparent', border: 'none', borderRadius: '0.4rem', cursor: 'pointer', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <span>⚙️</span> Profile Settings
                </button>

                {user.role === 'SELLER' && (
                  <button 
                    onClick={() => { navigate('/seller'); setIsDropdownOpen(false); }}
                    style={{ width: '100%', textAlign: 'left', padding: '0.6rem 1rem', backgroundColor: 'transparent', border: 'none', borderRadius: '0.4rem', cursor: 'pointer', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <span>📊</span> Seller Dashboard
                  </button>
                )}

                {user.role === 'ADMIN' && (
                  <button 
                    onClick={() => { navigate('/admin'); setIsDropdownOpen(false); }}
                    style={{ width: '100%', textAlign: 'left', padding: '0.6rem 1rem', backgroundColor: 'transparent', border: 'none', borderRadius: '0.4rem', cursor: 'pointer', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <span>🛡️</span> Admin Dashboard
                  </button>
                )}

                <div style={{ height: '1px', backgroundColor: '#f1f5f9', margin: '0.25rem 0' }}></div>

                <button 
                  onClick={() => { onLogout(); navigate('/'); setIsDropdownOpen(false); }}
                  style={{ width: '100%', textAlign: 'left', padding: '0.6rem 1rem', backgroundColor: 'transparent', border: 'none', borderRadius: '0.4rem', cursor: 'pointer', fontSize: '0.9rem', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#fef2f2'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <span>🚪</span> Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          <button onClick={() => navigate('/login')} className="btn btn-nav" style={{ backgroundColor: '#ffffff', color: '#1E3147', fontWeight: 'bold', padding: '0.5rem 1.5rem', borderRadius: '0.5rem' }}>Login</button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
