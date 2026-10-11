import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const API_URL = 'https://campus-lost-and-found-api-y6d2.onrender.com';

function MyDashboard() {
  const [myItems, setMyItems] = useState([]);
  const [myClaims, setMyClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = JSON.parse(localStorage.getItem('user') || '{}');

    if (!token) {
      alert('You must be logged in to view this page.');
      navigate('/login');
      return;
    }

    setUser(storedUser);

    const fetchData = async () => {
      try {
        const [itemsRes, claimsRes] = await Promise.all([
          axios.get(`${API_URL}/api/users/me/items`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get(`${API_URL}/api/users/me/claims`, {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);
        setMyItems(itemsRes.data);
        setMyClaims(claimsRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const handleDelete = async (itemId) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;

    const token = localStorage.getItem('token');
    try {
      await axios.delete(`${API_URL}/api/items/${itemId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMyItems(myItems.filter(i => i.id !== itemId));
      alert('Item deleted successfully.');
    } catch (err) {
      console.error(err);
      alert('Failed to delete item.');
    }
  };

  const getStatusColor = (status) => {
    if (status === 'approved' || status === 'resolved') return { background: '#d4edda', color: '#155724' };
    if (status === 'rejected') return { background: '#f8d7da', color: '#721c24' };
    return { background: '#fff3cd', color: '#856404' };
  };

  if (loading) return <p style={{ textAlign: 'center', marginTop: '50px' }}>Loading your dashboard...</p>;

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>👤 My Dashboard</h1>
        <Link to="/" style={{ color: '#007bff', textDecoration: 'none' }}>← Back to Home</Link>
      </div>

      <p style={{ color: '#666', marginBottom: '30px' }}>Welcome back, <strong>{user?.name}</strong>! Here's what you've been up to.</p>

      {/* My Reported Items */}
      <h2>📦 My Reported Items ({myItems.length})</h2>

      {myItems.length === 0 ? (
        <p style={{ color: '#666', padding: '15px', background: '#f9f9f9', borderRadius: '8px' }}>
          You haven't reported any items yet. <Link to="/report" style={{ color: '#007bff' }}>Report one now</Link>.
        </p>
      ) : (
        <div style={{ display: 'grid', gap: '12px', marginBottom: '30px' }}>
          {myItems.map(item => (
            <div key={item.id} style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '15px', background: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '15px', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', gap: '15px', alignItems: 'center', flex: 1 }}>
                {item.image_url && (
                  <img src={item.image_url} alt={item.title} style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '6px' }} />
                )}
                <div>
                  <h3 style={{ margin: '0 0 5px 0' }}>{item.title}</h3>
                  <p style={{ margin: '3px 0', fontSize: '14px', color: '#666' }}>
                    <strong>Type:</strong> <span style={{ color: item.type === 'lost' ? 'red' : 'green' }}>{item.type.toUpperCase()}</span>
                    {' | '}<strong>Category:</strong> {item.category_name || 'N/A'}
                  </p>
                  <p style={{ margin: '3px 0', fontSize: '14px' }}>
                    <strong>Status:</strong>{' '}
                    <span style={{ padding: '2px 8px', borderRadius: '10px', fontSize: '12px', ...getStatusColor(item.status) }}>
                      {item.status.toUpperCase()}
                    </span>
                  </p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '5px' }}>
                <Link to={`/items/${item.id}`} style={{ padding: '6px 12px', background: '#007bff', color: 'white', textDecoration: 'none', borderRadius: '4px', fontSize: '13px' }}>View</Link>
                <button onClick={() => handleDelete(item.id)} style={{ padding: '6px 12px', background: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '13px' }}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* My Claims */}
      <h2>📋 My Claims ({myClaims.length})</h2>

      {myClaims.length === 0 ? (
        <p style={{ color: '#666', padding: '15px', background: '#f9f9f9', borderRadius: '8px' }}>You haven't submitted any claims yet.</p>
      ) : (
        <div style={{ display: 'grid', gap: '12px' }}>
          {myClaims.map(claim => (
            <div key={claim.id} style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '15px', background: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '15px', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', gap: '15px', alignItems: 'center', flex: 1 }}>
                {claim.item_image && (
                  <img src={claim.item_image} alt={claim.item_title} style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '6px' }} />
                )}
                <div>
                  <h3 style={{ margin: '0 0 5px 0' }}>{claim.item_title}</h3>
                  <p style={{ margin: '3px 0', fontSize: '14px', color: '#666' }}>
                    <strong>Proof:</strong> {claim.proof_description.substring(0, 60)}{claim.proof_description.length > 60 ? '...' : ''}
                  </p>
                  <p style={{ margin: '3px 0', fontSize: '14px' }}>
                    <strong>Status:</strong>{' '}
                    <span style={{ padding: '2px 8px', borderRadius: '10px', fontSize: '12px', ...getStatusColor(claim.status) }}>
                      {claim.status.toUpperCase()}
                    </span>
                  </p>
                </div>
              </div>
              <Link to={`/items/${claim.item_id}`} style={{ padding: '6px 12px', background: '#007bff', color: 'white', textDecoration: 'none', borderRadius: '4px', fontSize: '13px' }}>View Item</Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MyDashboard;