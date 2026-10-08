import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

function Home() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('https://campus-lost-and-found-api-y6d2.onrender.com/api/items')
      .then(response => {
        setItems(response.data);
        setLoading(false);
      })
      .catch(error => {
        console.error("Error fetching items:", error);
        setLoading(false);
      });
  }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ textAlign: 'center', color: '#333' }}>🎓 Campus Lost & Found</h1>
      <p style={{ textAlign: 'center', color: '#666' }}>Find what you lost. Return what you found.</p>

      <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginBottom: '30px' }}>
        <Link to="/login" style={{ padding: '10px 20px', backgroundColor: '#007bff', color: 'white', textDecoration: 'none', borderRadius: '5px' }}>Login</Link>
        <Link to="/report" style={{ padding: '10px 20px', backgroundColor: '#28a745', color: 'white', textDecoration: 'none', borderRadius: '5px' }}>Report Item</Link>
      </div>

      <h2>Recent Items</h2>
      
      {loading ? (
        <p>Loading items from the database...</p>
      ) : items.length === 0 ? (
        <p>No items have been reported yet.</p>
      ) : (
        
        <div style={{ display: 'grid', gap: '15px' }}>
           {items.map(item => (
           <Link to={`/items/${item.id}`} key={item.id} style={{ textDecoration: 'none', color: 'inherit' }}>
             <div style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '8px', backgroundColor: '#f9f9f9', cursor: 'pointer' }}>
                 <h3 style={{ margin: '0 0 10px 0' }}>{item.title}</h3>
                 <p style={{ margin: '5px 0' }}><strong>Type:</strong> <span style={{ color: item.type === 'lost' ? 'red' : 'green' }}>{item.type.toUpperCase()}</span></p>
                 <p style={{ margin: '5px 0' }}><strong>Location:</strong> {item.location}</p>
                 <p style={{ margin: '5px 0' }}><strong>Description:</strong> {item.description}</p>
                </div>
            </Link>
        ))}
        </div>
        )}
    </div>
    );
}

export default Home;