import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../api';

const Login = ({ setUser }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await login({ username, password });
      setUser(res.data);
      if (res.data.role === 'SELLER') {
        navigate('/seller');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError('Invalid credentials');
    }
  };

  return (
    <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <div className="glass" style={{ padding: '2rem', borderRadius: '1rem', width: '100%', maxWidth: '400px', textAlign: 'center' }}>
        <h2 style={{ marginBottom: '1.5rem', color: 'var(--primary-color)' }}>Welcome Back</h2>
        {error && <p style={{ color: 'red', marginBottom: '1rem' }}>{error}</p>}
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
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
          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.75rem' }}>Login</button>
        </form>
        <p style={{ marginTop: '1rem', fontSize: '0.875rem' }}>
          Don't have an account? <a href="/register" style={{ color: 'var(--primary-color)', fontWeight: 'bold' }}>Register here</a>
        </p>
      </div>
    </div>
  );
};

export default Login;
