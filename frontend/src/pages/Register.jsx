import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const API_URL = 'https://campus-lost-and-found-api-y6d2.onrender.com';

function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      await axios.post(`${API_URL}/api/users/register`, {
        name,
        email,
        password
      });

      setSuccess('Account created successfully! Redirecting to login...');
      
      // Wait 2 seconds, then redirect to login
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Registration failed. Please try again.');
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', maxWidth: '400px', margin: '50px auto' }}>
      <h1 style={{ textAlign: 'center', color: '#333' }}>Create Account</h1>
      
      {error && <p style={{ color: 'red', textAlign: 'center', background: '#ffe6e6', padding: '10px', borderRadius: '5px' }}>{error}</p>}
      {success && <p style={{ color: 'green', textAlign: 'center', background: '#e6ffe6', padding: '10px', borderRadius: '5px' }}>{success}</p>}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        
        <div>
          <label style={{ display: 'block', marginBottom: '5px', color: '#555' }}>Full Name</label>
          <input 
            type="text" 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            required
            placeholder="e.g. Abebe Bekele"
            style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc', fontSize: '16px', boxSizing: 'border-box' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '5px', color: '#555' }}>Email</label>
          <input 
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required
            placeholder="student@campus.edu"
            style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc', fontSize: '16px', boxSizing: 'border-box' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '5px', color: '#555' }}>Password</label>
          <input 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required
            placeholder="At least 6 characters"
            minLength={6}
            style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc', fontSize: '16px', boxSizing: 'border-box' }}
          />
        </div>

        <button type="submit" style={{ padding: '12px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '5px', fontSize: '16px', cursor: 'pointer' }}>
          Create Account
        </button>
      </form>

      <p style={{ textAlign: 'center', marginTop: '20px', color: '#555' }}>
        Already have an account? <Link to="/login" style={{ color: '#007bff' }}>Log in here</Link>
      </p>

      <p style={{ textAlign: 'center', marginTop: '10px' }}>
        <Link to="/" style={{ color: '#666' }}>← Back to Home</Link>
      </p>
    </div>
  );
}

export default Register;