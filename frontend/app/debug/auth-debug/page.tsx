'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function AuthDebugPage() {
  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState<string | null>(null);
  const [tokenDetails, setTokenDetails] = useState<any>(null);
  const [testResults, setTestResults] = useState<any[]>([]);
  
  useEffect(() => {
    // Load user and token from localStorage
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');
    
    setUser(storedUser ? JSON.parse(storedUser) : null);
    setToken(storedToken);
    
    // Attempt to parse JWT token if it exists
    if (storedToken) {
      try {
        const parts = storedToken.split('.');
        if (parts.length === 3) {
          const payload = JSON.parse(atob(parts[1]));
          setTokenDetails(payload);
        }
      } catch (e) {
        console.error("Failed to parse JWT token:", e);
      }
    }
  }, []);
  
  const testEndpoint = async (url: string, description: string) => {
    try {
      setTestResults(prev => [...prev, { url, description, status: 'testing' }]);
      
      // Test the endpoint with the current token
      const response = await axios.get(url, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      
      setTestResults(prev => prev.map(test => 
        test.url === url ? { 
          ...test, 
          status: 'success', 
          statusCode: response.status,
          data: response.data
        } : test
      ));
    } catch (error: any) {
      setTestResults(prev => prev.map(test => 
        test.url === url ? { 
          ...test, 
          status: 'error', 
          statusCode: error.response?.status,
          error: error.message,
          data: error.response?.data
        } : test
      ));
    }
  };
  
  const refreshToken = () => {
    const storedToken = localStorage.getItem('token');
    setToken(storedToken);
  };
  
  const clearToken = () => {
    localStorage.removeItem('token');
    setToken(null);
    setTokenDetails(null);
  };
  
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Authentication Debug</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* User Info */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-2">User Information</h2>
          {user ? (
            <div>
              <p><span className="font-medium">Username:</span> {user.username}</p>
              <p><span className="font-medium">Name:</span> {user.name || 'N/A'}</p>
              <p><span className="font-medium">ID:</span> {user.id}</p>
              <p><span className="font-medium">Roles:</span> {user.roles ? user.roles.join(', ') : 'N/A'}</p>
            </div>
          ) : (
            <p className="text-red-500">No user found in localStorage</p>
          )}
        </div>
        
        {/* Token Info */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-2">Token Information</h2>
          {token ? (
            <div>
              <p className="mb-2"><span className="font-medium">Token:</span> <span className="break-all">{token.substring(0, 20)}...{token.substring(token.length - 5)}</span></p>
              
              {tokenDetails ? (
                <div className="mt-2">
                  <p><span className="font-medium">Subject:</span> {tokenDetails.sub}</p>
                  {tokenDetails.exp && (
                    <p>
                      <span className="font-medium">Expires:</span> {new Date(tokenDetails.exp * 1000).toLocaleString()}
                      {' '}
                      ({new Date(tokenDetails.exp * 1000) < new Date() ? (
                        <span className="text-red-500">Expired</span>
                      ) : (
                        <span className="text-green-500">Valid</span>
                      )})
                    </p>
                  )}
                  {tokenDetails.iat && (
                    <p><span className="font-medium">Issued at:</span> {new Date(tokenDetails.iat * 1000).toLocaleString()}</p>
                  )}
                </div>
              ) : (
                <p className="text-amber-500">Could not parse token payload</p>
              )}
              
              <div className="flex gap-2 mt-4">
                <button 
                  onClick={refreshToken}
                  className="px-4 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Refresh
                </button>
                <button 
                  onClick={clearToken}
                  className="px-4 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  Clear Token
                </button>
              </div>
            </div>
          ) : (
            <p className="text-red-500">No token found in localStorage</p>
          )}
        </div>
      </div>
      
      {/* API Tests */}
      <div className="bg-white p-4 rounded-lg shadow mb-8">
        <h2 className="text-lg font-semibold mb-4">API Tests</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <button 
            onClick={() => testEndpoint('/api/messages/conversations', 'Message Conversations')}
            className="px-4 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
          >
            Test /conversations
          </button>
          
          <button 
            onClick={() => testEndpoint('/api/messages/unread-count', 'Unread Message Count')}
            className="px-4 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
          >
            Test /unread-count
          </button>
          
          <button 
            onClick={() => testEndpoint('http://localhost:8080/api/messages/conversations', 'Direct Backend Call')}
            className="px-4 py-2 bg-purple-100 text-purple-700 rounded hover:bg-purple-200"
          >
            Test Direct Backend
          </button>
          
          <button 
            onClick={() => testEndpoint('/api/users/username/' + (user?.username || 'current'), 'Current User')}
            className="px-4 py-2 bg-green-100 text-green-700 rounded hover:bg-green-200"
          >
            Test User API
          </button>
        </div>
        
        {/* Test Results */}
        <div className="space-y-4">
          {testResults.map((test, index) => (
            <div key={index} className={`p-3 rounded ${
              test.status === 'testing' ? 'bg-blue-50 border border-blue-200' :
              test.status === 'success' ? 'bg-green-50 border border-green-200' :
              'bg-red-50 border border-red-200'
            }`}>
              <div className="flex justify-between">
                <h3 className="font-medium">{test.description} ({test.url})</h3>
                <span className={`px-2 py-0.5 text-xs rounded-full ${
                  test.status === 'testing' ? 'bg-blue-100 text-blue-800' :
                  test.status === 'success' ? 'bg-green-100 text-green-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {test.status === 'testing' ? 'Testing...' : 
                   test.status === 'success' ? `Success (${test.statusCode})` : 
                   `Error (${test.statusCode || 'unknown'})`}
                </span>
              </div>
              
              {test.status !== 'testing' && (
                <div className="mt-2">
                  {test.status === 'error' && (
                    <p className="text-red-700 mb-1">{test.error}</p>
                  )}
                  <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto max-h-40">
                    {JSON.stringify(test.data || test.error, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 