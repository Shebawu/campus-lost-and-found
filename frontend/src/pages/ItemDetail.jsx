import { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate, Link } from 'react-router-dom';

function ItemDetail() {
  const { id } = useParams(); // Gets the item ID from the URL
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [proof, setProof] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    axios.get(`http://localhost:3000/api/items/${id}`)
      .then(response => {
        setItem(response.data);
        setLoading(false);
      })
      .catch(error => {
        console.error("Error fetching item:", error);
        setLoading(false);
      });
  }, [id]);

  const handleClaim = async (e) => {
    e.preventDefault();
    setMessage('');

    const token = localStorage.getItem('token');
    if (!token) {
      alert('You must be logged in to claim an item.');
      navigate('/login');
      return;
    }

    try {
      await axios.post(
        'http://localhost:3000/api/claims',
        {
          item_id: id,
          proof_description: proof
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setMessage('Claim submitted successfully! Wait for the owner to review it.');
      setProof('');
    } catch (err) {
      console.error(err);
      setMessage(err.response?.data?.error || 'Failed to submit claim.');
    }
  };

  if (loading) return <p style={{ textAlign: 'center', marginTop: '50px' }}>Loading item...</p>;
  if (!item) return <p style={{ textAlign: 'center', marginTop: '50px' }}>Item not found.</p>;

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', maxWidth: '600px', margin: '50px auto' }}>
      <Link to="/" style={{ color: '#666', textDecoration: 'none' }}>← Back to Home</Link>
      
      <div style={{ border: '1px solid #ddd', padding: '25px', borderRadius: '8px', marginTop: '20px', backgroundColor: '#f9f9f9' }}>
        <h1 style={{ marginTop: 0 }}>{item.title}</h1>
        <p><strong>Type:</strong> <span style={{ color: item.type === 'lost' ? 'red' : 'green', fontWeight: 'bold' }}>{item.type.toUpperCase()}</span></p>
        <p><strong>Location:</strong> {item.location}</p>
        <p><strong>Description:</strong> {item.description}</p>
        <p><strong>Date Reported:</strong> {new Date(item.date_reported).toLocaleDateString()}</p>
        <p><strong>Status:</strong> {item.status}</p>
      </div>

      {/* Only show the claim form for 'found' items */}
      {item.type === 'found' && item.status === 'open' && (
        <div style={{ marginTop: '30px', padding: '20px', border: '2px solid #007bff', borderRadius: '8px' }}>
          <h2 style={{ marginTop: 0, color: '#007bff' }}>Is this yours?</h2>
          <p style={{ color: '#555' }}>Submit a claim with proof of ownership and the finder will be notified.</p>
          
          {message && <p style={{ padding: '10px', backgroundColor: '#e6ffe6', borderRadius: '5px', color: '#006600' }}>{message}</p>}

          <form onSubmit={handleClaim} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <textarea
              value={proof}
              onChange={(e) => setProof(e.target.value)}
              placeholder="Describe the item in detail to prove it's yours (color, marks, contents...)"
              required
              rows="4"
              style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ccc', fontSize: '16px' }}
            />
            <button type="submit" style={{ padding: '12px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '5px', fontSize: '16px', cursor: 'pointer' }}>
              Submit Claim
            </button>
          </form>
        </div>
      )}
      {/* Show a message if the item is not claimable */}
      {(item.type === 'lost' || item.status !== 'open') && (
        <div style={{ marginTop: '30px', padding: '15px', backgroundColor: '#fff3cd', borderRadius: '8px', color: '#856404' }}>
          {item.type === 'lost' ? 'This is a lost item report. If you have found it, please report it as found.' : 'This item has already been claimed or resolved.'}
        </div>
      )}
    </div>
  );
}

export default ItemDetail;