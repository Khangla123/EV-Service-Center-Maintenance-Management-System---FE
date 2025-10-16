import React, { useState } from 'react';
import authService from '../services/authService';
import { getErrorMessage } from '../services/api';

const TestLogin: React.FC = () => {
  const [email, setEmail] = useState('lakhanqpro125@gmail.com');
  const [password, setPassword] = useState('456');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testLogin = async () => {
    setLoading(true);
    setResult(null);
    try {
      console.log('Attempting login with:', { email, password });
      const response = await authService.login({ email, password });
      console.log('Login response:', response);
      setResult({ success: true, data: response });
    } catch (error: any) {
      console.error('Login error:', error);
      const errorMsg = getErrorMessage(error);
      setResult({ 
        success: false, 
        error: errorMsg,
        details: error.response?.data || error.message 
      });
    } finally {
      setLoading(false);
    }
  };

  const testBackend = async () => {
    setLoading(true);
    setResult(null);
    try {
      const response = await fetch('http://localhost:8080/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password })
      });
      
      const data = await response.json();
      console.log('Backend test response:', data);
      
      // Check if response has ApiResponse structure
      const isApiResponse = data.hasOwnProperty('code') && data.hasOwnProperty('result');
      
      setResult({ 
        success: response.ok, 
        status: response.status,
        isApiResponse,
        data,
        explanation: isApiResponse 
          ? `Backend trả về ApiResponse wrapper. Code: ${data.code}, Message: ${data.message}` 
          : 'Backend trả về response trực tiếp (không có wrapper)'
      });
    } catch (error: any) {
      console.error('Backend test error:', error);
      setResult({ success: false, error: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h1>Test Login API</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <div style={{ marginBottom: '10px' }}>
          <label>Email:</label>
          <input 
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          />
        </div>
        
        <div style={{ marginBottom: '10px' }}>
          <label>Password:</label>
          <input 
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          />
        </div>
      </div>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <button 
          onClick={testLogin}
          disabled={loading}
          style={{ padding: '10px 20px', cursor: 'pointer' }}
        >
          Test with AuthService
        </button>
        
        <button 
          onClick={testBackend}
          disabled={loading}
          style={{ padding: '10px 20px', cursor: 'pointer' }}
        >
          Test with Fetch (Direct)
        </button>
      </div>

      {loading && <div>Loading...</div>}

      {result && (
        <div style={{ 
          padding: '15px', 
          backgroundColor: result.success ? '#d4edda' : '#f8d7da',
          border: `1px solid ${result.success ? '#c3e6cb' : '#f5c6cb'}`,
          borderRadius: '4px',
          marginTop: '20px'
        }}>
          <h3>{result.success ? 'Success ✓' : 'Error ✗'}</h3>
          <pre style={{ 
            overflow: 'auto', 
            backgroundColor: '#fff',
            padding: '10px',
            borderRadius: '4px'
          }}>
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}

      <div style={{ marginTop: '30px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
        <h3>Instructions:</h3>
        <ul>
          <li>Make sure backend is running on http://localhost:8080</li>
          <li>Check Network tab in DevTools for request/response</li>
          <li>Check Console for error messages</li>
        </ul>
        
        <h4>Current Config:</h4>
        <pre style={{ backgroundColor: '#fff', padding: '10px', borderRadius: '4px' }}>
API URL: {process.env.REACT_APP_API_URL || 'http://localhost:8080/api'}
        </pre>
      </div>
    </div>
  );
};

export default TestLogin;
