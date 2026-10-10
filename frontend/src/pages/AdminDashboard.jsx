import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const API_URL = 'https://campus-lost-and-found-api-y6d2.onrender.com';
function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    // Check if user is logged in and is an admin
    if (!token) {
      alert('You must be logged in.');
      navigate('/login');
      return;
    }

    if (user.role !== 'admin') {
      alert('Access denied. Admin privileges required.');
      navigate('/');
      return;
    }

    // Fetch stats and claims
    const fetchData = async () => {
      try {
        const [statsRes, claimsRes] = await Promise.all([
          axios.get(`${API_URL}/api/admin/stats`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get(`${API_URL}/api/admin/claims`, {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);

        setStats(statsRes.data);
        setClaims(claimsRes.data);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError('Failed to load dashboard data.');
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const handleClaimAction = async (claimId, status) => {
    const token = localStorage.getItem('token');
    try {
      await axios.put(
        `${API_URL}/api/admin/claims/${claimId}`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Update the claim in local state
      setClaims(claims.map(c => 
        c.id === claimId ? { ...c, status } : c
      ));

      alert(`Claim ${status} successfully!`);
    } catch (err) {
      console.error(err);
      alert('Failed to update claim.');
    }
  };

  if (loading) return <p style={{ textAlign: 'center', marginTop: '50px' }}>Loading dashboard...</p>;

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', maxWidth: '1100px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>🛡️ Admin Dashboard</h1>
        <Link to="/" style={{ color: '#007bff', textDecoration: 'none' }}>← Back to Home</Link>
      </div>

      {error && <p style={{ color: 'red', background: '#ffe6e6', padding: '10px', borderRadius: '5px' }}>{error}</p>}

      {/* Stats Cards */}
      {stats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '15px', marginBottom: '30px' }}>
          <StatCard label="Total Items" value={stats.totalItems} color="#007bff" />
          <StatCard label="Lost Items" value={stats.lostItems} color="#dc3545" />
          <StatCard label="Found Items" value={stats.foundItems} color="#28a745" />
          <StatCard label="Pending Claims" value={stats.pendingClaims} color="#ffc107" />
          <StatCard label="Returned" value={stats.returnedItems} color="#6f42c1" />
        </div>
      )}

      {/* Claims Table */}
      <h2>Claim Requests ({claims.length})</h2>

      {claims.length === 0 ? (
        <p style={{ color: '#666', padding: '20px', background: '#f9f9f9', borderRadius: '8px' }}>No claims submitted yet.</p>
      ) : (
        <div style={{ overflowX: 'auto', background: 'white', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
            <thead>
              <tr style={{ background: '#f4f4f4', textAlign: 'left' }}>
                <th style={{ padding: '12px' }}>Item</th>
                <th style={{ padding: '12px' }}>Claimant</th>
                <th style={{ padding: '12px' }}>Proof</th>
                <th style={{ padding: '12px' }}>Status</th>
                <th style={{ padding: '12px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {claims.map(claim => (
                <tr key={claim.id} style={{ borderTop: '1px solid #eee' }}>
                  <td style={{ padding: '12px', fontWeight: 'bold' }}>{claim.item_title}</td>
                  <td style={{ padding: '12px' }}>
                    <div>{claim.claimant_name}</div>
                    <div style={{ fontSize: '12px', color: '#666' }}>{claim.claimant_email}</div>
                  </td>
                  <td style={{ padding: '12px', maxWidth: '250px', fontSize: '13px' }}>{claim.proof_description}</td>
                  <td style={{ padding: '12px' }}>
                    <span style={{
                      padding: '4px 10px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      background: claim.status === 'approved' ? '#d4edda' : claim.status === 'rejected' ? '#f8d7da' : '#fff3cd',
                      color: claim.status === 'approved' ? '#155724' : claim.status === 'rejected' ? '#721c24' : '#856404'
                    }}>
                      {claim.status.toUpperCase()}
                    </span>
                  </td>
                  <td style={{ padding: '12px' }}>
                    {claim.status === 'pending' ? (
                      <>
                        <button 
                          onClick={() => handleClaimAction(claim.id, 'approved')}
                          style={{ padding: '6px 12px', background: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', marginRight: '5px', fontSize: '13px' }}>
                          ✅ Approve
                        </button>
                        <button 
                          onClick={() => handleClaimAction(claim.id, 'rejected')}
                          style={{ padding: '6px 12px', background: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '13px' }}>
                          ❌ Reject
                        </button>
                      </>
                    ) : (
                      <span style={{ color: '#666', fontSize: '13px' }}>Reviewed</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// Small helper component for the stat cards
function StatCard({ label, value, color }) {
  return (
    <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', borderLeft: `4px solid ${color}` }}>
      <div style={{ fontSize: '32px', fontWeight: 'bold', color }}>{value}</div>
      <div style={{ fontSize: '14px', color: '#666', marginTop: '5px' }}>{label}</div>
    </div>
  );
}

export default AdminDashboard;