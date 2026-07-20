import React, { useState, useEffect } from 'react';
import EnhancedAnalytics from '../components/EnhancedAnalytics';

const Analytics = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      // Generate mock data for demo
      const mockData = Array.from({ length: 100 }, (_, i) => ({
        temperature: 20 + Math.random() * 10,
        humidity: 50 + Math.random() * 30,
        pressure: 1000 + Math.random() * 20,
        rainfall: Math.random() * 5,
        light: 100 + Math.random() * 900,
        timestamp: new Date(Date.now() - i * 3600000).toISOString()
      }));
      setData(mockData);
    } catch (err) {
      setError('Failed to load analytics data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-600 p-4">
        <p>{error}</p>
        <button 
          onClick={fetchAnalytics}
          className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <EnhancedAnalytics data={data} />
    </div>
  );
};

export default Analytics;
