'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function MessageDebugPage() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState<string | null>(null);
  const [directFetchResult, setDirectFetchResult] = useState<any>(null);
  const [apiFetchResult, setApiFetchResult] = useState<any>(null);
  const [localStorageItems, setLocalStorageItems] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Load user and token from localStorage
    try {
      const storedUser = localStorage.getItem('user');
      const storedToken = localStorage.getItem('token');
      
      setUser(storedUser ? JSON.parse(storedUser) : null);
      setToken(storedToken);
      
      // Get all localStorage keys related to messages
      const messageKeys = Object.keys(localStorage).filter(
        key => key.includes('message') || key.includes('conversation')
      );
      
      const items = messageKeys.map(key => ({
        key,
        value: localStorage.getItem(key)
      }));
      
      setLocalStorageItems(items);
      
      // If we have a token, try both fetch methods
      if (storedToken) {
        fetchData(storedToken);
      } else {
        setError('No authentication token found in localStorage');
        setLoading(false);
      }
    } catch (error) {
      setError(`Error loading from localStorage: ${error instanceof Error ? error.message : String(error)}`);
      setLoading(false);
    }
  }, []);
  
  const fetchData = async (token: string) => {
    try {
      // Method 1: Direct backend fetch
      try {
        const directResponse = await fetch('http://localhost:8080/api/messages/conversations', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (directResponse.ok) {
          const data = await directResponse.json();
          setDirectFetchResult({
            status: directResponse.status,
            statusText: directResponse.statusText,
            data: data
          });
        } else {
          setDirectFetchResult({
            status: directResponse.status,
            statusText: directResponse.statusText,
            error: `HTTP error ${directResponse.status}`
          });
        }
      } catch (error) {
        setDirectFetchResult({
          error: `Error in direct fetch: ${error instanceof Error ? error.message : String(error)}`
        });
      }
      
      // Method 2: Frontend API fetch
      try {
        const apiResponse = await fetch('/api/messages/conversations');
        
        if (apiResponse.ok) {
          const data = await apiResponse.json();
          setApiFetchResult({
            status: apiResponse.status,
            statusText: apiResponse.statusText,
            data: data
          });
        } else {
          setApiFetchResult({
            status: apiResponse.status,
            statusText: apiResponse.statusText,
            error: `HTTP error ${apiResponse.status}`
          });
        }
      } catch (error) {
        setApiFetchResult({
          error: `Error in API fetch: ${error instanceof Error ? error.message : String(error)}`
        });
      }
      
      setLoading(false);
    } catch (error) {
      setError(`Error in fetch: ${error instanceof Error ? error.message : String(error)}`);
      setLoading(false);
    }
  };
  
  const refreshToken = () => {
    // For manual testing - reload the token from localStorage
    const storedToken = localStorage.getItem('token');
    setToken(storedToken);
    if (storedToken) {
      fetchData(storedToken);
    }
  };
  
  // Add function to clear a specific localStorage item
  const clearLocalStorageItem = (key: string) => {
    try {
      localStorage.removeItem(key);
      // Refresh the list of localStorage items
      const messageKeys = Object.keys(localStorage).filter(
        key => key.includes('message') || key.includes('conversation')
      );
      
      const items = messageKeys.map(key => ({
        key,
        value: localStorage.getItem(key)
      }));
      
      setLocalStorageItems(items);
    } catch (error) {
      setError(`Error clearing localStorage item: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  // Add function to clear all deletion markers
  const clearAllDeletionMarkers = () => {
    try {
      Object.keys(localStorage).forEach(key => {
        if (key.includes('_deleted')) {
          localStorage.removeItem(key);
        }
      });
      
      // Refresh the list of localStorage items
      const messageKeys = Object.keys(localStorage).filter(
        key => key.includes('message') || key.includes('conversation')
      );
      
      const items = messageKeys.map(key => ({
        key,
        value: localStorage.getItem(key)
      }));
      
      setLocalStorageItems(items);
    } catch (error) {
      setError(`Error clearing deletion markers: ${error instanceof Error ? error.message : String(error)}`);
    }
  };
  
  if (loading) {
    return <div className="p-8">Loading diagnostic data...</div>;
  }
  
  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Message System Debug</h1>
      
      {error && <div className="bg-red-100 text-red-700 p-4 mb-4 rounded">{error}</div>}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Authentication Status */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-2">Authentication</h2>
          <div>
            <p>Token: {token ? `${token.substring(0, 15)}...` : 'No token found'}</p>
            <p>User: {user ? user.username : 'No user found'}</p>
            <button 
              onClick={refreshToken}
              className="bg-blue-500 text-white px-3 py-1 mt-2 rounded"
            >
              Refresh Token
            </button>
          </div>
        </div>
        
        {/* Direct Fetch Result */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-2">Direct Backend Fetch</h2>
          {directFetchResult ? (
            directFetchResult.error ? (
              <div className="text-red-600">{directFetchResult.error}</div>
            ) : (
              <div>
                <p>Status: {directFetchResult.status} {directFetchResult.statusText}</p>
                <p>Data: {
                  directFetchResult.data ? 
                    Array.isArray(directFetchResult.data) ? 
                      `Array with ${directFetchResult.data.length} items` : 
                      `Object with keys: ${Object.keys(directFetchResult.data).join(', ')}` : 
                    'No data'
                }</p>
                <pre className="mt-2 p-2 bg-gray-100 rounded overflow-auto max-h-40 text-xs">
                  {JSON.stringify(directFetchResult.data, null, 2)}
                </pre>
              </div>
            )
          ) : (
            <div>No result</div>
          )}
        </div>
        
        {/* API Fetch Result */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-2">Frontend API Fetch</h2>
          {apiFetchResult ? (
            apiFetchResult.error ? (
              <div className="text-red-600">{apiFetchResult.error}</div>
            ) : (
              <div>
                <p>Status: {apiFetchResult.status} {apiFetchResult.statusText}</p>
                <p>Data: {
                  apiFetchResult.data ? 
                    Array.isArray(apiFetchResult.data) ? 
                      `Array with ${apiFetchResult.data.length} items` : 
                      `Object with keys: ${Object.keys(apiFetchResult.data).join(', ')}` : 
                    'No data'
                }</p>
                <pre className="mt-2 p-2 bg-gray-100 rounded overflow-auto max-h-40 text-xs">
                  {JSON.stringify(apiFetchResult.data, null, 2)}
                </pre>
              </div>
            )
          ) : (
            <div>No result</div>
          )}
        </div>
        
        {/* LocalStorage Items */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-2">LocalStorage Items</h2>
          <div className="flex gap-2 mb-3">
            <button 
              onClick={clearAllDeletionMarkers}
              className="bg-red-500 text-white px-3 py-1 text-sm rounded"
            >
              Clear All Deletion Markers
            </button>
            <button 
              onClick={() => {
                localStorage.removeItem('messages_67d43f260aa91526d1a238cc_67d2f998d751dd28c4dde713_deleted');
                clearAllDeletionMarkers();
              }}
              className="bg-orange-500 text-white px-3 py-1 text-sm rounded"
            >
              Clear Specific Deletion
            </button>
          </div>
          {localStorageItems.length === 0 ? (
            <p>No message-related items in localStorage</p>
          ) : (
            <div className="overflow-auto max-h-80">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Key</th>
                    <th className="text-left py-2">Value</th>
                    <th className="text-left py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {localStorageItems.map((item, index) => (
                    <tr key={index} className="border-b">
                      <td className="py-2 pr-4">{item.key}</td>
                      <td className="py-2 truncate max-w-[200px]">
                        {item.value ? 
                          item.value.length > 100 ? 
                            `${item.value.substring(0, 100)}...` : 
                            item.value 
                          : 'null'}
                      </td>
                      <td className="py-2">
                        <button
                          onClick={() => clearLocalStorageItem(item.key)}
                          className="text-sm bg-gray-200 hover:bg-gray-300 text-gray-800 px-2 py-1 rounded"
                        >
                          Clear
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 