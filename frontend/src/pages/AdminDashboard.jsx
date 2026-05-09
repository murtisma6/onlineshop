import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchAdminDashboard, fetchAdminTraffic, createBulkUsers, createBulkStores } from '../api';

const AdminDashboard = ({ user }) => {
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [trafficData, setTrafficData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [usersJson, setUsersJson] = useState('');
  const [storesJson, setStoresJson] = useState('');
  const [bulkStatus, setBulkStatus] = useState({ type: '', message: '' });

  useEffect(() => {
    if (!user || user.role !== 'ADMIN') {
      navigate('/');
      return;
    }

    const loadData = async () => {
      setLoading(true);
      try {
        const [dashRes, trafficRes] = await Promise.all([
          fetchAdminDashboard(),
          fetchAdminTraffic()
        ]);
        setDashboardData(dashRes.data);
        setTrafficData(trafficRes.data);
        setError('');
      } catch (err) {
        console.error('Failed to load admin data', err);
        setError('Failed to load dashboard data.');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [user, navigate]);

  const refreshData = async () => {
    try {
      const [dashRes, trafficRes] = await Promise.all([
        fetchAdminDashboard(),
        fetchAdminTraffic()
      ]);
      setDashboardData(dashRes.data);
      setTrafficData(trafficRes.data);
      setBulkStatus({ type: 'success', message: 'Data refreshed successfully!' });
      setTimeout(() => setBulkStatus({ type: '', message: '' }), 3000);
    } catch (err) {
      setBulkStatus({ type: 'error', message: 'Failed to refresh data' });
    }
  };

  const handleBulkUsers = async (e) => {
    e.preventDefault();
    try {
      const parsed = JSON.parse(usersJson);
      if (!Array.isArray(parsed)) throw new Error('Input must be a JSON array');
      const res = await createBulkUsers(parsed);
      setBulkStatus({ type: 'success', message: res.data.message });
      setUsersJson('');
    } catch (err) {
      setBulkStatus({ type: 'error', message: err.message || 'Invalid JSON format or server error' });
    }
  };

  const copyUserSample = () => {
    const sample = [
      { "username": "seller1", "email": "seller1@example.com", "role": "SELLER", "passwordHash": "pass123" },
      { "username": "buyer1", "email": "buyer1@example.com", "role": "BUYER", "passwordHash": "pass123" }
    ];
    setUsersJson(JSON.stringify(sample, null, 2));
  };

  const copyStoreSample = () => {
    const sample = [
      { "sellerId": 1, "name": "Premium Gadgets" },
      { "sellerId": 2, "name": "Fashion Hub" }
    ];
    setStoresJson(JSON.stringify(sample, null, 2));
  };

  const formatUsersJson = () => {
    try {
      const parsed = JSON.parse(usersJson);
      setUsersJson(JSON.stringify(parsed, null, 2));
    } catch (e) {
      setBulkStatus({ type: 'error', message: 'Invalid JSON format' });
    }
  };

  const formatStoresJson = () => {
    try {
      const parsed = JSON.parse(storesJson);
      setStoresJson(JSON.stringify(parsed, null, 2));
    } catch (e) {
      setBulkStatus({ type: 'error', message: 'Invalid JSON format' });
    }
  };

  const handleBulkStores = async (e) => {
    e.preventDefault();
    try {
      const parsed = JSON.parse(storesJson);
      if (!Array.isArray(parsed)) throw new Error('Input must be a JSON array');
      const res = await createBulkStores(parsed);
      setBulkStatus({ type: 'success', message: res.data.message });
      setStoresJson('');
      // Reload dashboard data
      const dashRes = await fetchAdminDashboard();
      setDashboardData(dashRes.data);
    } catch (err) {
      setBulkStatus({ type: 'error', message: err.message || 'Invalid JSON format or server error' });
    }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '3rem' }}>Loading Admin Dashboard...</div>;
  if (error) return <div style={{ textAlign: 'center', padding: '3rem', color: 'red' }}>{error}</div>;

  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: 'calc(100vh - 70px)', padding: '2rem' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <h1 className="dashboard-title" style={{ fontSize: '2.5rem', color: '#1E3147', margin: 0 }}>Admin Dashboard</h1>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button 
              onClick={() => navigate('/admin/users')}
              className="btn btn-primary"
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.2rem' }}
            >
              <span>👥</span> Manage Users
            </button>
            <button 
              onClick={refreshData} 
              className="btn btn-secondary"
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.2rem' }}
            >
              <span>🔄</span> Refresh Stats
            </button>
          </div>
        </div>

        {/* System Health */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
          <div className="glass admin-card" style={{ borderRadius: '1rem', backgroundColor: '#ffffff', border: '1px solid #e2e8f0' }}>
            <h3 className="admin-stat-title">System Status</h3>
            <div className="admin-stat-value" style={{ color: dashboardData.health.status === 'UP' ? '#10b981' : '#ef4444' }}>
              {dashboardData.health.status}
            </div>
          </div>
          <div className="glass admin-card" style={{ borderRadius: '1rem', backgroundColor: '#ffffff', border: '1px solid #e2e8f0' }}>
            <h3 className="admin-stat-title">Memory Usage</h3>
            <div className="admin-stat-value" style={{ color: '#3b82f6', fontSize: '1.2rem' }}>
              {(dashboardData.health.usedMemory / 1024 / 1024).toFixed(1)}M / {(dashboardData.health.totalMemory / 1024 / 1024).toFixed(0)}M
            </div>
            <div style={{ width: '100%', backgroundColor: '#e2e8f0', height: '8px', borderRadius: '4px', marginTop: '0.5rem' }}>
              <div style={{ width: `${(dashboardData.health.usedMemory / dashboardData.health.totalMemory) * 100}%`, backgroundColor: '#3b82f6', height: '100%', borderRadius: '4px' }}></div>
            </div>
          </div>
          <div className="glass admin-card" style={{ borderRadius: '1rem', backgroundColor: '#ffffff', border: '1px solid #e2e8f0' }}>
            <h3 className="admin-stat-title">Total Stores</h3>
            <div className="admin-stat-value" style={{ color: '#8b5cf6' }}>
              {dashboardData.stores.length}
            </div>
          </div>
        </div>

        <div className="grid-2-col" style={{ marginBottom: '3rem' }}>
          {/* Stores Overview */}
          <div className="glass" style={{ padding: '2rem', borderRadius: '1rem', backgroundColor: '#ffffff', border: '1px solid #e2e8f0', maxHeight: '500px', overflowY: 'auto' }}>
            <h2 style={{ fontSize: '1.5rem', color: '#1e293b', marginBottom: '1.5rem' }}>Global Stores Overview</h2>
            <div style={{ overflowX: 'auto' }}>
              <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse', minWidth: '300px' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #e2e8f0', textAlign: 'left', color: '#64748b' }}>
                  <th style={{ padding: '0.75rem 0' }}>Store Name</th>
                  <th>Products</th>
                  <th>Total Views</th>
                  <th>Total Clicks</th>
                </tr>
              </thead>
              <tbody>
                {dashboardData.stores.map(store => (
                  <tr key={store.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '1rem 0', fontWeight: '600', color: '#1E3147' }}>{store.name}</td>
                    <td style={{ color: '#475569' }}>{store.productCount}</td>
                    <td style={{ color: '#475569' }}>👁️ {store.totalViews || 0}</td>
                    <td style={{ color: '#475569' }}>👆 {store.totalClicks || 0}</td>
                  </tr>
                ))}
                {dashboardData.stores.length === 0 && (
                  <tr><td colSpan="4" style={{ textAlign: 'center', padding: '1rem', color: '#94a3b8' }}>No stores found</td></tr>
                )}
              </tbody>
              </table>
            </div>
          </div>

          {/* Traffic Log */}
          <div className="glass" style={{ padding: '2rem', borderRadius: '1rem', backgroundColor: '#ffffff', border: '1px solid #e2e8f0', maxHeight: '500px', overflowY: 'auto' }}>
            <h2 style={{ fontSize: '1.5rem', color: '#1e293b', marginBottom: '1.5rem' }}>Recent Traffic Log</h2>
            <div style={{ overflowX: 'auto' }}>
              <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem', minWidth: '300px' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #e2e8f0', textAlign: 'left', color: '#64748b' }}>
                  <th style={{ padding: '0.75rem 0' }}>Time</th>
                  <th>Event</th>
                  <th>Store / Product</th>
                  <th>User</th>
                </tr>
              </thead>
              <tbody>
                {trafficData.map(log => (
                  <tr key={log.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '0.75rem 0', color: '#475569' }}>{new Date(log.timestamp).toLocaleString()}</td>
                    <td style={{ fontWeight: '600', color: log.eventType === 'WHATSAPP_CLICK' ? '#10b981' : '#3b82f6' }}>
                      {log.eventType === 'WHATSAPP_CLICK' ? '👆 CLICK' : '👁️ VIEW'}
                    </td>
                    <td style={{ color: '#1E3147' }}><strong>{log.storeName}</strong><br/><span style={{ color: '#64748b', fontSize: '0.8rem' }}>{log.productName}</span></td>
                    <td style={{ color: '#475569' }}>{log.username}</td>
                  </tr>
                ))}
                {trafficData.length === 0 && (
                  <tr><td colSpan="4" style={{ textAlign: 'center', padding: '1rem', color: '#94a3b8' }}>No recent traffic</td></tr>
                )}
              </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Bulk Operations */}
        <div style={{ borderTop: '2px solid #e2e8f0', paddingTop: '3rem' }}>
          <h2 style={{ fontSize: '1.8rem', color: '#1E3147', marginBottom: '1.5rem' }}>Bulk Operations</h2>
          
          {bulkStatus.message && (
            <div style={{ padding: '1rem', marginBottom: '1.5rem', borderRadius: '0.5rem', backgroundColor: bulkStatus.type === 'error' ? '#fee2e2' : '#dcfce7', color: bulkStatus.type === 'error' ? '#b91c1c' : '#16a34a', fontWeight: '600' }}>
              {bulkStatus.message}
            </div>
          )}

          <div className="grid-2-col">
            <div className="glass" style={{ padding: '2rem', borderRadius: '1rem', backgroundColor: '#ffffff', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '1.25rem', margin: 0 }}>Bulk Create Users</h3>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button onClick={copyUserSample} className="btn" style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', backgroundColor: '#f1f5f9' }}>Sample</button>
                  <button onClick={formatUsersJson} className="btn" style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', backgroundColor: '#f1f5f9' }}>Format</button>
                </div>
              </div>
              <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '1rem' }}>Paste JSON array of user objects.</p>
              <form onSubmit={handleBulkUsers} style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <textarea 
                  value={usersJson}
                  onChange={(e) => setUsersJson(e.target.value)}
                  className="admin-json-area"
                  style={{ width: '100%', flex: 1, minHeight: '150px', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1', marginBottom: '1rem', fontFamily: 'monospace' }}
                  placeholder="Paste JSON here..."
                  required
                />
                <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Create Bulk Users</button>
              </form>
            </div>

            <div className="glass" style={{ padding: '2rem', borderRadius: '1rem', backgroundColor: '#ffffff', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '1.25rem', margin: 0 }}>Bulk Create Stores</h3>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button onClick={copyStoreSample} className="btn" style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', backgroundColor: '#f1f5f9' }}>Sample</button>
                  <button onClick={formatStoresJson} className="btn" style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', backgroundColor: '#f1f5f9' }}>Format</button>
                </div>
              </div>
              <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '1rem' }}>Paste JSON array of store objects.</p>
              <form onSubmit={handleBulkStores} style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <textarea 
                  value={storesJson}
                  onChange={(e) => setStoresJson(e.target.value)}
                  className="admin-json-area"
                  style={{ width: '100%', flex: 1, minHeight: '150px', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1', marginBottom: '1rem', fontFamily: 'monospace' }}
                  placeholder="Paste JSON here..."
                  required
                />
                <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Create Bulk Stores</button>
              </form>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminDashboard;
