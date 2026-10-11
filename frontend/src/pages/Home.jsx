import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const API_URL = 'https://campus-lost-and-found-api-y6d2.onrender.com';

function Home() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  // Fetch items whenever any filter changes
  useEffect(() => {
    fetchItems();
  }, [typeFilter, categoryFilter]);

  const fetchItems = async () => {
    setLoading(true);
    try {
      // Build the URL with query parameters
      const params = new URLSearchParams();
      if (typeFilter) params.append('type', typeFilter);
      if (categoryFilter) params.append('category_id', categoryFilter);
      if (search) params.append('search', search);

      const response = await axios.get(`${API_URL}/api/items?${params.toString()}`);
      setItems(response.data);
    } catch (error) {
      console.error("Error fetching items:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchItems();
  };

  const handleClearFilters = () => {
    setSearch('');
    setTypeFilter('');
    setCategoryFilter('');
    // Manually fetch since state changes won't trigger useEffect immediately
    setTimeout(() => fetchItems(), 100);
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ textAlign: 'center', color: '#333' }}>🎓 Campus Lost & Found</h1>
      <p style={{ textAlign: 'center', color: '#666' }}>Find what you lost. Return what you found.</p>

      <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginBottom: '20px' }}>
        <Link to="/login" style={{ padding: '10px 20px', backgroundColor: '#007bff', color: 'white', textDecoration: 'none', borderRadius: '5px' }}>Login</Link>
        <Link to="/register" style={{ padding: '10px 20px', backgroundColor: '#6f42c1', color: 'white', textDecoration: 'none', borderRadius: '5px' }}>Register</Link>
        <Link to="/report" style={{ padding: '10px 20px', backgroundColor: '#28a745', color: 'white', textDecoration: 'none', borderRadius: '5px' }}>Report Item</Link>
      </div>

      {/* Search and Filter Bar */}
      <div style={{ background: '#f4f4f4', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
          <input 
            type="text"
            placeholder="Search by title or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ flex: 1, padding: '10px', borderRadius: '5px', border: '1px solid #ccc', fontSize: '15px' }}
          />
          <button type="submit" style={{ padding: '10px 20px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '15px' }}>
            🔍 Search
          </button>
        </form>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
          <select 
            value={typeFilter} 
            onChange={(e) => setTypeFilter(e.target.value)}
            style={{ padding: '8px', borderRadius: '5px', border: '1px solid #ccc', fontSize: '14px' }}>
            <option value="">All Types</option>
            <option value="lost">Lost</option>
            <option value="found">Found</option>
          </select>

          <select 
            value={categoryFilter} 
            onChange={(e) => setCategoryFilter(e.target.value)}
            style={{ padding: '8px', borderRadius: '5px', border: '1px solid #ccc', fontSize: '14px' }}>
            <option value="">All Categories</option>
            <option value="1">Electronics</option>
            <option value="2">Documents/IDs</option>
            <option value="3">Keys</option>
            <option value="4">Bags</option>
            <option value="5">Books</option>
            <option value="6">Others</option>
          </select>

          <button 
            onClick={handleClearFilters}
            style={{ padding: '8px 15px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '14px' }}>
            Clear Filters
          </button>
        </div>
      </div>

      <h2>Recent Items ({items.length})</h2>

      {loading ? (
        <p>Loading items from the database...</p>
      ) : items.length === 0 ? (
        <p>No items match your search.</p>
      ) : (
        <div style={{ display: 'grid', gap: '15px' }}>
          {items.map(item => (
            <Link to={`/items/${item.id}`} key={item.id} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '8px', backgroundColor: '#f9f9f9', cursor: 'pointer' }}>
                <h3 style={{ margin: '0 0 10px 0' }}>{item.title}</h3>
                {item.image_url && (
                  <img 
                    src={item.image_url} 
                    alt={item.title} 
                    style={{ width: '100%', maxHeight: '200px', objectFit: 'cover', borderRadius: '5px', marginBottom: '10px' }} 
                  />
                )}
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