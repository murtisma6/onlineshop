import { useState, useEffect } from 'react';
import { fetchAllUsers, adminCreateUser, adminUpdateUser, adminDeleteUser, adminResetPassword } from '../api';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // Modal states
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  
  // Form states
  const [formData, setFormData] = useState({
    username: '',
    role: 'BUYER',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    whatsapp: '',
    city: '',
    state: ''
  });
  const [newPassword, setNewPassword] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const res = await fetchAllUsers();
      setUsers(res.data);
    } catch (err) {
      setError("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (user) => {
    setSelectedUser(user);
    setFormData({
      username: user.username,
      role: user.role,
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email || '',
      phone: user.phone || '',
      whatsapp: user.whatsapp || '',
      city: user.city || '',
      state: user.state || ''
    });
    setIsEditModalOpen(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      if (selectedUser?.id) {
        await adminUpdateUser(selectedUser.id, formData);
        setSuccess("User updated successfully");
      } else {
        await adminCreateUser(formData);
        setSuccess("User created successfully");
      }
      setIsEditModalOpen(false);
      loadUsers();
    } catch (err) {
      setError(err.response?.data || "Operation failed");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await adminDeleteUser(id);
        setSuccess("User deleted successfully");
        loadUsers();
      } catch (err) {
        setError("Failed to delete user");
      }
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    try {
      await adminResetPassword(selectedUser.id, newPassword);
      setSuccess("Password reset successfully");
      setIsResetModalOpen(false);
      setNewPassword('');
    } catch (err) {
      setError("Failed to reset password");
    }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '5rem' }}><h2>Loading Users...</h2></div>;

  return (
    <div style={{ backgroundColor: '#f1f5f9', minHeight: '100vh' }}>
      <style>{`
        @media (max-width: 768px) {
          .user-mgmt-header { flex-direction: column; align-items: flex-start !important; gap: 1rem; }
          .user-mgmt-header h1 { font-size: 1.5rem !important; }
          .user-mgmt-table thead { display: none; }
          .user-mgmt-table tr { 
            display: block; 
            background: white; 
            margin-bottom: 1rem; 
            padding: 1rem; 
            border-radius: 0.75rem;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          }
          .user-mgmt-table td { 
            display: flex; 
            justify-content: space-between; 
            padding: 0.5rem 0 !important; 
            border: none !important;
            font-size: 0.9rem;
          }
          .user-mgmt-table td::before { 
            content: attr(data-label); 
            font-weight: 700; 
            color: #64748b;
          }
          .user-mgmt-actions { 
            flex-direction: column; 
            width: 100%; 
            margin-top: 0.5rem;
          }
          .user-mgmt-actions button { width: 100%; justify-content: center; }
          .modal-content { padding: 1.5rem !important; width: 95% !important; }
          .form-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
      
      <main style={{ maxWidth: '1200px', margin: '2rem auto', padding: '0 1rem' }}>
        <div className="user-mgmt-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: '800', color: '#1e293b' }}>User Management</h1>
          <button 
            onClick={() => { setSelectedUser(null); setFormData({ username: '', role: 'BUYER', firstName: '', lastName: '', email: '', phone: '', whatsapp: '', city: '', state: '' }); setIsEditModalOpen(true); }}
            className="btn btn-primary"
            style={{ padding: '0.75rem 1.5rem', fontWeight: '700' }}
          >
            + Add New User
          </button>
        </div>

        {error && <div style={{ backgroundColor: '#fee2e2', color: '#dc2626', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1rem', border: '1px solid #fecaca' }}>{error}</div>}
        {success && <div style={{ backgroundColor: '#dcfce7', color: '#16a34a', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1rem', border: '1px solid #bbf7d0' }}>{success}</div>}

        <div style={{ backgroundColor: 'transparent', borderRadius: '1rem', overflow: 'hidden' }}>
          <table className="user-mgmt-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead style={{ backgroundColor: 'white' }}>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                <th style={{ padding: '1rem', color: '#64748b', fontSize: '0.85rem' }}>Username</th>
                <th style={{ padding: '1rem', color: '#64748b', fontSize: '0.85rem' }}>Name</th>
                <th style={{ padding: '1rem', color: '#64748b', fontSize: '0.85rem' }}>Email</th>
                <th style={{ padding: '1rem', color: '#64748b', fontSize: '0.85rem' }}>Role</th>
                <th style={{ padding: '1rem', color: '#64748b', fontSize: '0.85rem' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id} style={{ backgroundColor: 'white', borderBottom: '1px solid #f1f5f9' }}>
                  <td data-label="Username" style={{ padding: '1rem', fontWeight: '600', color: '#1e293b' }}>{user.username}</td>
                  <td data-label="Name" style={{ padding: '1rem', color: '#475569' }}>{user.firstName} {user.lastName}</td>
                  <td data-label="Email" style={{ padding: '1rem', color: '#475569' }}>{user.email}</td>
                  <td data-label="Role" style={{ padding: '1rem' }}>
                    <span style={{ 
                      padding: '0.25rem 0.6rem', 
                      borderRadius: '1rem', 
                      fontSize: '0.75rem', 
                      fontWeight: '700',
                      backgroundColor: user.role === 'ADMIN' ? '#fee2e2' : user.role === 'SELLER' ? '#e0e7ff' : '#f1f5f9',
                      color: user.role === 'ADMIN' ? '#ef4444' : user.role === 'SELLER' ? '#4f46e5' : '#64748b'
                    }}>
                      {user.role}
                    </span>
                  </td>
                  <td data-label="Actions" className="user-mgmt-actions" style={{ padding: '1rem', display: 'flex', gap: '0.5rem' }}>
                    <button onClick={() => handleEditClick(user)} className="btn" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', backgroundColor: '#f1f5f9' }}>Edit</button>
                    <button onClick={() => { setSelectedUser(user); setIsResetModalOpen(true); }} className="btn" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', backgroundColor: '#fef3c7', color: '#d97706' }}>Reset Pass</button>
                    <button onClick={() => handleDelete(user.id)} className="btn" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', backgroundColor: '#fee2e2', color: '#dc2626' }}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>

      {/* Edit/Create Modal */}
      {isEditModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="modal-content" style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '1rem', width: '90%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 style={{ marginBottom: '1.5rem', fontSize: '1.25rem', fontWeight: '800' }}>{selectedUser ? 'Edit User' : 'Create User'}</h2>
            <form onSubmit={handleUpdate}>
              <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#64748b', marginBottom: '0.25rem' }}>Username</label>
                  <input type="text" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} readOnly={!!selectedUser} style={{ width: '100%', padding: '0.6rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0', fontSize: '0.9rem' }} required />
                </div>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#64748b', marginBottom: '0.25rem' }}>Role</label>
                  <select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} style={{ width: '100%', padding: '0.6rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0', fontSize: '0.9rem' }}>
                    <option value="BUYER">BUYER</option>
                    <option value="SELLER">SELLER</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                </div>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#64748b', marginBottom: '0.25rem' }}>First Name</label>
                  <input type="text" value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} style={{ width: '100%', padding: '0.6rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0', fontSize: '0.9rem' }} />
                </div>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#64748b', marginBottom: '0.25rem' }}>Last Name</label>
                  <input type="text" value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} style={{ width: '100%', padding: '0.6rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0', fontSize: '0.9rem' }} />
                </div>
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#64748b', marginBottom: '0.25rem' }}>Email</label>
                <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} style={{ width: '100%', padding: '0.6rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0', fontSize: '0.9rem' }} />
              </div>
              <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#64748b', marginBottom: '0.25rem' }}>Phone</label>
                  <input type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} style={{ width: '100%', padding: '0.6rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0', fontSize: '0.9rem' }} />
                </div>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#64748b', marginBottom: '0.25rem' }}>WhatsApp</label>
                  <input type="text" value={formData.whatsapp} onChange={e => setFormData({...formData, whatsapp: e.target.value})} style={{ width: '100%', padding: '0.6rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0', fontSize: '0.9rem' }} />
                </div>
              </div>
              <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#64748b', marginBottom: '0.25rem' }}>City</label>
                  <input type="text" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} style={{ width: '100%', padding: '0.6rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0', fontSize: '0.9rem' }} />
                </div>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#64748b', marginBottom: '0.25rem' }}>State</label>
                  <input type="text" value={formData.state} onChange={e => setFormData({...formData, state: e.target.value})} style={{ width: '100%', padding: '0.6rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0', fontSize: '0.9rem' }} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1, padding: '0.75rem', fontWeight: '700' }}>{selectedUser ? 'Update' : 'Create'}</button>
                <button type="button" onClick={() => setIsEditModalOpen(false)} className="btn" style={{ flex: 1, padding: '0.75rem', backgroundColor: '#f1f5f9', fontWeight: '700' }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {isResetModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="modal-content" style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '1rem', width: '90%', maxWidth: '400px' }}>
            <h2 style={{ marginBottom: '0.5rem', fontSize: '1.25rem', fontWeight: '800' }}>Reset Password</h2>
            <p style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '1.5rem' }}>Resetting for <strong>{selectedUser?.username}</strong></p>
            <form onSubmit={handleResetPassword}>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#64748b', marginBottom: '0.5rem' }}>New Password</label>
                <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Enter new password" style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0', fontSize: '0.9rem' }} required />
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1, padding: '0.75rem', fontWeight: '700' }}>Reset</button>
                <button type="button" onClick={() => { setIsResetModalOpen(false); setNewPassword(''); }} className="btn" style={{ flex: 1, padding: '0.75rem', backgroundColor: '#f1f5f9', fontWeight: '700' }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
