import React, { useState } from 'react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, AreaChart, Area,
  ComposedChart
} from 'recharts';

const EnhancedAnalytics = ({ data }) => {
  const [view, setView] = useState('24h');
  const [metric, setMetric] = useState('temperature');
  const [chartType, setChartType] = useState('line');

  // Process data for charts
  const processData = (rawData) => {
    if (!rawData || rawData.length === 0) return [];
    
    let filteredData = rawData;
    
    if (view === '7d') {
      filteredData = rawData.slice(-7);
    } else if (view === '30d') {
      filteredData = rawData.slice(-30);
    } else {
      filteredData = rawData.slice(-24);
    }

    return filteredData.map((item, index) => ({
      time: index + 1,
      label: `${index + 1}h`,
      temperature: item.temperature || 0,
      humidity: item.humidity || 0,
      pressure: item.pressure || 0,
      rainfall: item.rainfall || 0,
      light: item.light || 0,
    }));
  };

  const chartData = processData(data);

  const getYLabel = () => {
    const labels = {
      temperature: 'Temperature (°C)',
      humidity: 'Humidity (%)',
      pressure: 'Pressure (hPa)',
      rainfall: 'Rainfall (mm)',
      light: 'Light (lux)'
    };
    return labels[metric] || 'Value';
  };

  const getMetricColor = () => {
    const colors = {
      temperature: '#FF6B6B',
      humidity: '#4ECDC4',
      pressure: '#45B7D1',
      rainfall: '#96CEB4',
      light: '#FFD93D'
    };
    return colors[metric] || '#8884d8';
  };

  const renderChart = () => {
    const commonProps = {
      data: chartData,
      margin: { top: 20, right: 30, left: 20, bottom: 20 },
    };

    const color = getMetricColor();

    switch (chartType) {
      case 'bar':
        return (
          <BarChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="label" />
            <YAxis label={{ value: getYLabel(), angle: -90, position: 'insideLeft' }} />
            <Tooltip />
            <Legend />
            <Bar dataKey={metric} fill={color} />
          </BarChart>
        );
      
      case 'area':
        return (
          <AreaChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="label" />
            <YAxis label={{ value: getYLabel(), angle: -90, position: 'insideLeft' }} />
            <Tooltip />
            <Legend />
            <Area type="monotone" dataKey={metric} stroke={color} fill={color} fillOpacity={0.3} />
          </AreaChart>
        );
      
      case 'composed':
        return (
          <ComposedChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="label" />
            <YAxis label={{ value: getYLabel(), angle: -90, position: 'insideLeft' }} />
            <Tooltip />
            <Legend />
            <Bar dataKey={metric} fill={color} />
            <Line type="monotone" dataKey={metric} stroke="#8884d8" strokeWidth={2} />
          </ComposedChart>
        );
      
      default:
        return (
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="label" />
            <YAxis label={{ value: getYLabel(), angle: -90, position: 'insideLeft' }} />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey={metric} stroke={color} strokeWidth={2} dot={{ r: 4 }} />
          </LineChart>
        );
    }
  };

  const stats = {
    current: chartData[chartData.length - 1]?.[metric] || 0,
    average: chartData.reduce((acc, curr) => acc + (curr[metric] || 0), 0) / chartData.length || 0,
    min: Math.min(...chartData.map(item => item[metric] || 0)),
    max: Math.max(...chartData.map(item => item[metric] || 0)),
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">📊 Advanced Analytics</h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Time View</label>
          <select
            value={view}
            onChange={(e) => setView(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Metric</label>
          <select
            value={metric}
            onChange={(e) => setMetric(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="temperature">Temperature</option>
            <option value="humidity">Humidity</option>
            <option value="pressure">Pressure</option>
            <option value="rainfall">Rainfall</option>
            <option value="light">Light</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Chart Type</label>
          <select
            value={chartType}
            onChange={(e) => setChartType(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="line">Line Chart</option>
            <option value="bar">Bar Chart</option>
            <option value="area">Area Chart</option>
            <option value="composed">Composed Chart</option>
          </select>
        </div>

        <div className="flex items-end">
          <button
            onClick={() => {
              alert('📥 Export feature coming soon!');
            }}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-200"
          >
            📥 Export Chart
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-50 rounded-lg p-4 text-center">
          <div className="text-sm text-gray-600">Current</div>
          <div className="text-2xl font-bold" style={{ color: getMetricColor() }}>
            {stats.current.toFixed(1)}
          </div>
        </div>
        <div className="bg-gray-50 rounded-lg p-4 text-center">
          <div className="text-sm text-gray-600">Average</div>
          <div className="text-2xl font-bold text-blue-600">
            {stats.average.toFixed(1)}
          </div>
        </div>
        <div className="bg-gray-50 rounded-lg p-4 text-center">
          <div className="text-sm text-gray-600">Min</div>
          <div className="text-2xl font-bold text-green-600">
            {stats.min.toFixed(1)}
          </div>
        </div>
        <div className="bg-gray-50 rounded-lg p-4 text-center">
          <div className="text-sm text-gray-600">Max</div>
          <div className="text-2xl font-bold text-red-600">
            {stats.max.toFixed(1)}
          </div>
        </div>
      </div>

      <div className="h-96">
        <ResponsiveContainer width="100%" height="100%">
          {renderChart()}
        </ResponsiveContainer>
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-semibold text-blue-800 mb-2">💡 Insights</h3>
        <ul className="text-sm text-gray-700 space-y-1">
          <li>• Average {metric}: {stats.average.toFixed(1)}</li>
          <li>• Range: {stats.min.toFixed(1)} - {stats.max.toFixed(1)}</li>
          <li>• {stats.current > stats.average ? '⬆️ Above average' : '⬇️ Below average'}</li>
        </ul>
      </div>
    </div>
  );
};

export default EnhancedAnalytics;
