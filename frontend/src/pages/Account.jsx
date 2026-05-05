import { useState, useEffect } from 'react';
import { fetchUser, sendOtp, verifyOtp } from '../api';

const Account = ({ user, setUser }) => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({});
  const [updateStatus, setUpdateStatus] = useState('');
  
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
      setFormData(res.data);
      // update global user state just in case
      setUser(res.data);
    } catch (err) {
      console.error('Failed to load profile', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      setUpdateStatus('Updating...');
      const res = await updateUser(user.id, formData);
      setProfile(res.data);
      setFormData(res.data);
      setUser(res.data);
      setUpdateStatus('Profile updated successfully!');
      setEditMode(false);
      setTimeout(() => setUpdateStatus(''), 3000);
    } catch (err) {
      setUpdateStatus('Failed to update profile.');
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2rem', color: '#0f172a', margin: 0 }}>My Account</h1>
          <button 
            onClick={() => { setEditMode(!editMode); setFormData(profile); }} 
            className="btn" 
            style={{ backgroundColor: editMode ? '#94a3b8' : '#4f46e5', color: 'white' }}
          >
            {editMode ? 'Cancel' : 'Edit Profile'}
          </button>
        </div>

        {updateStatus && (
          <div style={{ padding: '1rem', marginBottom: '1rem', borderRadius: '0.5rem', backgroundColor: updateStatus.includes('successfully') ? '#dcfce7' : '#fee2e2', color: updateStatus.includes('successfully') ? '#166534' : '#991b1b' }}>
            {updateStatus}
          </div>
        )}
        
        <form onSubmit={handleUpdateProfile}>
          <div className="grid-2-col">
            
            <div className="glass" style={{ padding: '2rem', borderRadius: '1rem', backgroundColor: '#ffffff', boxShadow: 'var(--shadow-md)' }}>
              <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>Personal Information</h2>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div><strong style={{ color: '#64748b' }}>Username:</strong> {profile.username}</div>
                <div><strong style={{ color: '#64748b' }}>Role:</strong> {profile.role}</div>
                
                <div className="grid-inner">
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: '#64748b' }}>First Name</label>
                    <input type="text" name="firstName" value={editMode ? formData.firstName : profile.firstName} onChange={handleInputChange} readOnly={!editMode} className="input-field" style={{ backgroundColor: !editMode ? '#f8fafc' : 'white' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: '#64748b' }}>Last Name</label>
                    <input type="text" name="lastName" value={editMode ? formData.lastName : profile.lastName} onChange={handleInputChange} readOnly={!editMode} className="input-field" style={{ backgroundColor: !editMode ? '#f8fafc' : 'white' }} />
                  </div>
                </div>
                
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <label style={{ fontSize: '0.8rem', color: '#64748b' }}>Email</label>
                    {profile.emailVerified ? (
                      <span style={{ color: 'green', fontSize: '0.7rem', fontWeight: 'bold' }}>✓ Verified</span>
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ color: '#f59e0b', fontSize: '0.7rem', fontWeight: 'bold' }}>⚠ Unverified</span>
                        {!editMode && <button type="button" onClick={() => handleSendOtp('email')} style={{ fontSize: '0.7rem', border: 'none', background: '#4f46e5', color: 'white', padding: '2px 5px', borderRadius: '3px', cursor: 'pointer' }}>Verify</button>}
                      </div>
                    )}
                  </div>
                  <input 
                    type="email" 
                    name="email" 
                    value={editMode ? formData.email : profile.email} 
                    onChange={handleInputChange} 
                    readOnly={!editMode || profile.emailVerified} 
                    className="input-field" 
                    style={{ backgroundColor: (!editMode || profile.emailVerified) ? '#f8fafc' : 'white', cursor: profile.emailVerified ? 'not-allowed' : 'text' }} 
                  />
                </div>

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <label style={{ fontSize: '0.8rem', color: '#64748b' }}>Phone No</label>
                    {profile.phoneVerified ? (
                      <span style={{ color: 'green', fontSize: '0.7rem', fontWeight: 'bold' }}>✓ Verified</span>
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ color: '#f59e0b', fontSize: '0.7rem', fontWeight: 'bold' }}>⚠ Unverified</span>
                        {!editMode && <button type="button" onClick={() => handleSendOtp('phone')} style={{ fontSize: '0.7rem', border: 'none', background: '#4f46e5', color: 'white', padding: '2px 5px', borderRadius: '3px', cursor: 'pointer' }}>Verify</button>}
                      </div>
                    )}
                  </div>
                  <input 
                    type="text" 
                    name="phone" 
                    value={editMode ? formData.phone : profile.phone} 
                    onChange={handleInputChange} 
                    readOnly={!editMode || profile.phoneVerified} 
                    className="input-field" 
                    style={{ backgroundColor: (!editMode || profile.phoneVerified) ? '#f8fafc' : 'white', cursor: profile.phoneVerified ? 'not-allowed' : 'text' }} 
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#64748b' }}>WhatsApp No</label>
                  <input type="text" name="whatsapp" value={editMode ? formData.whatsapp : profile.whatsapp} onChange={handleInputChange} readOnly={!editMode} className="input-field" style={{ backgroundColor: !editMode ? '#f8fafc' : 'white' }} />
                </div>
              </div>
            </div>

            <div className="glass" style={{ padding: '2rem', borderRadius: '1rem', backgroundColor: '#ffffff', boxShadow: 'var(--shadow-md)' }}>
              <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>Address Details</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#64748b' }}>Address</label>
                  <textarea name="address" value={editMode ? formData.address : profile.address} onChange={handleInputChange} readOnly={!editMode} className="input-field" style={{ backgroundColor: !editMode ? '#f8fafc' : 'white', minHeight: '80px' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#64748b' }}>City</label>
                  <input type="text" name="city" value={editMode ? formData.city : profile.city} onChange={handleInputChange} readOnly={!editMode} className="input-field" style={{ backgroundColor: !editMode ? '#f8fafc' : 'white' }} />
                </div>
                <div className="grid-inner">
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: '#64748b' }}>State</label>
                    <input type="text" name="state" value={editMode ? formData.state : profile.state} onChange={handleInputChange} readOnly={!editMode} className="input-field" style={{ backgroundColor: !editMode ? '#f8fafc' : 'white' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: '#64748b' }}>Pincode</label>
                    <input type="text" name="pincode" value={editMode ? formData.pincode : profile.pincode} onChange={handleInputChange} readOnly={!editMode} className="input-field" style={{ backgroundColor: !editMode ? '#f8fafc' : 'white' }} />
                  </div>
                </div>
              </div>
            </div>

          </div>
          
          {editMode && (
            <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'center' }}>
              <button type="submit" className="btn btn-primary" style={{ padding: '1rem 3rem', fontSize: '1.1rem' }}>Save Changes</button>
            </div>
          )}
        </form>

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
