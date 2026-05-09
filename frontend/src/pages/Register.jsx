import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { register } from '../api';

const Register = ({ setUser }) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Check if role is forced from URL (e.g. from Own your Digistore page)
  const queryParams = new URLSearchParams(location.search);
  const forcedRole = queryParams.get('role');

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState(forcedRole || 'BUYER');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [pincode, setPincode] = useState('');
  const [state, setState] = useState('');
  const [error, setError] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const payload = { username, password, role, firstName, lastName, email, phone, whatsapp, address, city, pincode, state };
      const res = await register(payload);
      setUser(res.data);
      navigate('/account'); // redirect to account page for verification
    } catch (err) {
      setError('Registration failed. Username might exist.');
    }
  };

  return (
    <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', padding: '2rem 0' }}>
      <div className="glass" style={{ padding: '2rem', borderRadius: '1rem', width: '100%', maxWidth: '500px', textAlign: 'center' }}>
        <h2 style={{ marginBottom: '1.5rem', color: 'var(--primary-color)' }}>
          {forcedRole === 'SELLER' ? 'Seller Registration' : 'Create Account'}
        </h2>
        {error && <p style={{ color: 'red', marginBottom: '1rem' }}>{error}</p>}
        <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <input type="text" placeholder="Username" className="input-field" value={username} onChange={(e) => setUsername(e.target.value)} required />
          <input type="password" placeholder="Password" className="input-field" value={password} onChange={(e) => setPassword(e.target.value)} required />
          <div style={{ display: 'flex', gap: '1rem' }}>
            <input type="text" placeholder="First Name" className="input-field" value={firstName} onChange={(e) => setFirstName(e.target.value)} required style={{ flex: 1 }} />
            <input type="text" placeholder="Last Name" className="input-field" value={lastName} onChange={(e) => setLastName(e.target.value)} required style={{ flex: 1 }} />
          </div>
          <input type="email" placeholder="Email ID" className="input-field" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <div style={{ display: 'flex', gap: '1rem' }}>
            <input type="tel" placeholder="Phone No." className="input-field" value={phone} onChange={(e) => setPhone(e.target.value)} required style={{ flex: 1 }} />
            <input type="tel" placeholder="WhatsApp No." className="input-field" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} required style={{ flex: 1 }} />
          </div>
          <textarea placeholder="Address" className="input-field" value={address} onChange={(e) => setAddress(e.target.value)} required rows="2" />
          <div style={{ display: 'flex', gap: '1rem' }}>
            <input type="text" placeholder="City" className="input-field" value={city} onChange={(e) => setCity(e.target.value)} required style={{ flex: 1 }} />
            <input type="text" placeholder="Pincode" className="input-field" value={pincode} onChange={(e) => setPincode(e.target.value)} required style={{ flex: 1 }} />
          </div>
          <input type="text" placeholder="State" className="input-field" value={state} onChange={(e) => setState(e.target.value)} required />
          
          {!forcedRole && (
            <>
              <label style={{ textAlign: 'left', fontWeight: 'bold', marginTop: '0.5rem', fontSize: '0.9rem' }}>Account Type:</label>
              <select 
                className="input-field" 
                value={role} 
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="BUYER">Buyer</option>
                <option value="SELLER">Seller</option>
              </select>
            </>
          )}
          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.75rem' }}>Register</button>
        </form>
        <p style={{ marginTop: '1rem', fontSize: '0.875rem' }}>
          Already have an account? <a href="/login" style={{ color: 'var(--primary-color)', fontWeight: 'bold' }}>Login here</a>
        </p>
      </div>
    </div>
  );
};

export default Register;
