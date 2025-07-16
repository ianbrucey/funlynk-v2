import React from 'react';
import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/solid';
import { TopItem } from '../../types';

interface TopPerformersCardProps {
  title: string;
  items: TopItem[];
  isLoading?: boolean;
}

export const TopPerformersCard: React.FC<TopPerformersCardProps> = ({ 
  title, 
  items, 
  isLoading = false 
}) => {
  if (isLoading) {
    return (
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="h-6 bg-gray-200 rounded animate-pulse w-32"></div>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center justify-between animate-pulse">
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-1"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="h-4 bg-gray-200 rounded w-8"></div>
                  <div className="h-4 bg-gray-200 rounded w-12"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const formatValue = (value: number, subtitle?: string) => {
    if (subtitle === 'rating') {
      return value.toFixed(1);
    }
    return value.toLocaleString();
  };

  const formatChange = (change: number) => {
    const isPositive = change >= 0;
    const prefix = isPositive ? '+' : '';
    return `${prefix}${change.toFixed(1)}%`;
  };

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">{title}</h3>
      </div>
      
      <div className="p-6">
        {items.length > 0 ? (
          <div className="space-y-4">
            {items.map((item, index) => {
              const isPositive = item.change >= 0;
              const rankColors = [
                'text-yellow-600 bg-yellow-100', // 1st place
                'text-gray-600 bg-gray-100',     // 2nd place
                'text-orange-600 bg-orange-100', // 3rd place
              ];
              
              return (
                <div key={item.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      rankColors[index] || 'text-gray-600 bg-gray-100'
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {item.name}
                      </div>
                      {item.subtitle && (
                        <div className="text-xs text-gray-500">
                          {item.subtitle}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">
                        {formatValue(item.value, item.subtitle)}
                      </div>
                      <div className={`flex items-center text-xs ${
                        isPositive ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {isPositive ? (
                          <ArrowUpIcon className="h-3 w-3 mr-1" />
                        ) : (
                          <ArrowDownIcon className="h-3 w-3 mr-1" />
                        )}
                        {formatChange(item.change)}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="text-gray-500 text-sm">No data available</div>
          </div>
        )}
      </div>
    </div>
  );
};
