import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

function ReportItem() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('lost');
  const [location, setLocation] = useState('');
  const [categoryId, setCategoryId] = useState(1);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Check if the user is logged in when the page loads
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('You must be logged in to report an item.');
      navigate('/login');
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const token = localStorage.getItem('token');

    try {
      await axios.post(
        'https://campus-lost-and-found-api-y6d2.onrender.com/api/items',
        {
          title,
          description,
          type,
          location,
          category_id: parseInt(categoryId),
          image_url: null
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      alert('Item reported successfully!');
      navigate('/');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Failed to report item. Please try again.');
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', maxWidth: '500px', margin: '50px auto' }}>
      <h1 style={{ textAlign: 'center', color: '#333' }}>Report an Item</h1>
      
      {error && <p style={{ color: 'red', textAlign: 'center', background: '#ffe6e6', padding: '10px', borderRadius: '5px' }}>{error}</p>}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        
        <div>
          <label style={{ display: 'block', marginBottom: '5px', color: '#555' }}>Item Type</label>
          <select value={type} onChange={(e) => setType(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc', fontSize: '16px' }}>
            <option value="lost">I Lost This Item</option>
            <option value="found">I Found This Item</option>
          </select>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '5px', color: '#555' }}>Title</label>
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="e.g. Black iPhone 13" style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc', fontSize: '16px' }} />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '5px', color: '#555' }}>Description</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} required rows="4" placeholder="Describe the item, any distinguishing features..." style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc', fontSize: '16px' }} />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '5px', color: '#555' }}>Location</label>
          <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} required placeholder="e.g. Main Library" style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc', fontSize: '16px' }} />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '5px', color: '#555' }}>Category</label>
          <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc', fontSize: '16px' }}>
            <option value="1">Electronics</option>
            <option value="2">Documents/IDs</option>
            <option value="3">Keys</option>
            <option value="4">Bags</option>
            <option value="5">Books</option>
            <option value="6">Others</option>
          </select>
        </div>

        <button type="submit" style={{ padding: '12px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '5px', fontSize: '16px', cursor: 'pointer' }}>
          Submit Report
        </button>
      </form>

      <p style={{ textAlign: 'center', marginTop: '20px' }}>
        <Link to="/" style={{ color: '#666' }}>← Back to Home</Link>
      </p>
    </div>
  );
}

export default ReportItem;