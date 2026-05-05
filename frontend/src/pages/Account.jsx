import { useState, useEffect } from 'react';
import { fetchUser, sendOtp, verifyOtp } from '../api';

const Account = ({ user, setUser }) => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [verifyingField, setVerifyingField] = useState(null); // 'email' or 'phone'
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpStatus, setOtpStatus] = useState('');

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    try {
      const res = await fetchUser(user.id);
      setProfile(res.data);
      // update global user state just in case
      setUser(res.data);
    } catch (err) {
      console.error('Failed to load profile', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async (type) => {
    try {
      setOtpStatus('Sending OTP...');
      await sendOtp(user.id, type);
      setVerifyingField(type);
      setOtpSent(true);
      setOtpStatus(`OTP sent to your ${type}! (Check backend console for mock code)`);
    } catch (err) {
      setOtpStatus('Failed to send OTP.');
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    try {
      setOtpStatus('Verifying...');
      await verifyOtp(user.id, verifyingField, otp);
      setOtpStatus('Verified successfully!');
      setVerifyingField(null);
      setOtp('');
      setOtpSent(false);
      loadProfile(); // reload to get new verified status
    } catch (err) {
      setOtpStatus('Invalid OTP. Try again.');
    }
  };

  if (loading) return <div className="container" style={{ padding: '2rem 0' }}>Loading...</div>;
  if (!profile) return <div className="container" style={{ padding: '2rem 0' }}>Please log in.</div>;

  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: 'calc(100vh - 70px)', padding: '2rem 0' }}>
      <div className="container">
        <h1 style={{ fontSize: '2rem', marginBottom: '2rem', color: '#0f172a' }}>My Account</h1>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          
          <div className="glass" style={{ padding: '2rem', borderRadius: '1rem', backgroundColor: '#ffffff', boxShadow: 'var(--shadow-md)' }}>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>Personal Information</h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div><strong style={{ color: '#64748b' }}>Username:</strong> {profile.username}</div>
              <div><strong style={{ color: '#64748b' }}>Role:</strong> {profile.role}</div>
              <div><strong style={{ color: '#64748b' }}>Name:</strong> {profile.firstName} {profile.lastName}</div>
              
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem', backgroundColor: '#f8fafc', borderRadius: '0.5rem' }}>
                <div>
                  <strong style={{ color: '#64748b' }}>Email:</strong> {profile.email}
                  {profile.emailVerified ? (
                    <span style={{ marginLeft: '0.5rem', color: 'green', fontSize: '0.8rem', fontWeight: 'bold' }}>✓ Verified</span>
                  ) : (
                    <span style={{ marginLeft: '0.5rem', color: '#f59e0b', fontSize: '0.8rem', fontWeight: 'bold' }}>⚠ Verification Pending</span>
                  )}
                </div>
                {!profile.emailVerified && (
                  <button onClick={() => handleSendOtp('email')} className="btn btn-primary" style={{ padding: '0.25rem 0.75rem', fontSize: '0.8rem' }}>Verify</button>
                )}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem', backgroundColor: '#f8fafc', borderRadius: '0.5rem' }}>
                <div>
                  <strong style={{ color: '#64748b' }}>Phone No:</strong> {profile.phone}
                  {profile.phoneVerified ? (
                    <span style={{ marginLeft: '0.5rem', color: 'green', fontSize: '0.8rem', fontWeight: 'bold' }}>✓ Verified</span>
                  ) : (
                    <span style={{ marginLeft: '0.5rem', color: '#f59e0b', fontSize: '0.8rem', fontWeight: 'bold' }}>⚠ Verification Pending</span>
                  )}
                </div>
                {!profile.phoneVerified && (
                  <button onClick={() => handleSendOtp('phone')} className="btn btn-primary" style={{ padding: '0.25rem 0.75rem', fontSize: '0.8rem' }}>Verify</button>
                )}
              </div>

              <div><strong style={{ color: '#64748b' }}>WhatsApp No:</strong> {profile.whatsapp}</div>
            </div>
          </div>

          <div className="glass" style={{ padding: '2rem', borderRadius: '1rem', backgroundColor: '#ffffff', boxShadow: 'var(--shadow-md)' }}>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>Address Details</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div><strong style={{ color: '#64748b' }}>Address:</strong> {profile.address}</div>
              <div><strong style={{ color: '#64748b' }}>City:</strong> {profile.city}</div>
              <div><strong style={{ color: '#64748b' }}>State:</strong> {profile.state}</div>
              <div><strong style={{ color: '#64748b' }}>Pincode:</strong> {profile.pincode}</div>
            </div>
          </div>

        </div>

        {verifyingField && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100 }}>
            <div className="glass" style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '1rem', width: '100%', maxWidth: '400px', textAlign: 'center' }}>
              <h3>Verify {verifyingField === 'email' ? 'Email' : 'Phone'}</h3>
              <p style={{ margin: '1rem 0', color: '#64748b' }}>{otpStatus}</p>
              
              {otpSent && (
                <form onSubmit={handleVerifyOtp} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <input 
                    type="text" 
                    placeholder="Enter 6-digit OTP" 
                    className="input-field" 
                    value={otp} 
                    onChange={(e) => setOtp(e.target.value)} 
                    required 
                    maxLength={6}
                    style={{ textAlign: 'center', letterSpacing: '0.5rem', fontSize: '1.5rem' }}
                  />
                  <button type="submit" className="btn btn-primary">Submit OTP</button>
                </form>
              )}
              
              <button 
                onClick={() => { setVerifyingField(null); setOtpStatus(''); setOtpSent(false); setOtp(''); }} 
                style={{ marginTop: '1rem', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', textDecoration: 'underline' }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default Account;
