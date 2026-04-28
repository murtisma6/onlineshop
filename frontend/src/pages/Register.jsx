import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { register } from '../api';

const Register = ({ setUser }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('BUYER');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const res = await register({ username, password, role });
      setUser(res.data);
      if (res.data.role === 'SELLER') {
        navigate('/seller');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError('Registration failed. Username might exist.');
    }
  };

  return (
    <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <div className="glass" style={{ padding: '2rem', borderRadius: '1rem', width: '100%', maxWidth: '400px', textAlign: 'center' }}>
        <h2 style={{ marginBottom: '1.5rem', color: 'var(--primary-color)' }}>Create Account</h2>
        {error && <p style={{ color: 'red', marginBottom: '1rem' }}>{error}</p>}
        <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <input 
            type="text" 
            placeholder="Username" 
            className="input-field" 
            value={username} 
            onChange={(e) => setUsername(e.target.value)} 
            required 
          />
          <input 
            type="password" 
            placeholder="Password" 
            className="input-field" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required 
          />
          <select 
            className="input-field" 
            value={role} 
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="BUYER">Buyer</option>
            <option value="SELLER">Seller</option>
          </select>
          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.75rem' }}>Register</button>
        </form>
        <p style={{ marginTop: '1rem', fontSize: '0.875rem' }}>
          Already have an account? <a href="/login" style={{ color: 'var(--primary-color)' }}>Login here</a>
        </p>
      </div>
    </div>
  );
};

export default Register;
