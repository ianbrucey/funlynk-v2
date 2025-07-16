import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { GeographicData } from '../../types';

interface GeographicChartProps {
  data: GeographicData[];
  metric?: 'users' | 'revenue' | 'bookings';
  height?: number;
}

export const GeographicChart: React.FC<GeographicChartProps> = ({ 
  data, 
  metric = 'revenue',
  height = 300 
}) => {
  const getMetricLabel = () => {
    switch (metric) {
      case 'users':
        return 'Users';
      case 'revenue':
        return 'Revenue';
      case 'bookings':
        return 'Bookings';
      default:
        return 'Value';
    }
  };

  const formatValue = (value: number) => {
    switch (metric) {
      case 'revenue':
        return `$${value.toLocaleString()}`;
      case 'users':
      case 'bookings':
        return value.toLocaleString();
      default:
        return value.toString();
    }
  };

  const formatTooltip = (value: any, name: string) => {
    if (name === metric) {
      return [formatValue(value), getMetricLabel()];
    }
    return [value, name];
  };

  const getBarColor = () => {
    switch (metric) {
      case 'users':
        return '#10B981'; // green
      case 'revenue':
        return '#3B82F6'; // blue
      case 'bookings':
        return '#F59E0B'; // yellow
      default:
        return '#6B7280'; // gray
    }
  };

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Geographic Distribution</h3>
        <p className="mt-1 text-sm text-gray-500">
          {getMetricLabel()} by region
        </p>
      </div>
      
      <div className="p-6">
        <ResponsiveContainer width="100%" height={height}>
          <BarChart 
            data={data} 
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            layout="horizontal"
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              type="number"
              stroke="#6b7280"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={formatValue}
            />
            <YAxis 
              type="category"
              dataKey="region"
              stroke="#6b7280"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              width={80}
            />
            <Tooltip 
              formatter={formatTooltip}
              labelStyle={{ color: '#374151' }}
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
            />
            <Bar 
              dataKey={metric}
              fill={getBarColor()}
              radius={[0, 4, 4, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      {/* Summary Stats */}
      <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-gray-900">
              {data.reduce((sum, item) => sum + item.users, 0).toLocaleString()}
            </div>
            <div className="text-sm text-gray-500">Total Users</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900">
              ${data.reduce((sum, item) => sum + item.revenue, 0).toLocaleString()}
            </div>
            <div className="text-sm text-gray-500">Total Revenue</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900">
              {data.reduce((sum, item) => sum + item.bookings, 0).toLocaleString()}
            </div>
            <div className="text-sm text-gray-500">Total Bookings</div>
          </div>
        </div>
      </div>
    </div>
  );
};
