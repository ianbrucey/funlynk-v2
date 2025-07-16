import React from 'react';
import { StarIcon, TrendingUpIcon, TrendingDownIcon } from '@heroicons/react/24/solid';
import { ProgramPerformanceData } from '../../types';
import { Badge } from '../common/Badge';

interface ProgramPerformanceTableProps {
  programs: ProgramPerformanceData[];
  isLoading?: boolean;
}

export const ProgramPerformanceTable: React.FC<ProgramPerformanceTableProps> = ({ 
  programs, 
  isLoading = false 
}) => {
  if (isLoading) {
    return (
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="h-6 bg-gray-200 rounded animate-pulse w-48"></div>
        </div>
        <div className="divide-y divide-gray-200">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="px-6 py-4 animate-pulse">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
                <div className="flex space-x-4">
                  <div className="h-4 bg-gray-200 rounded w-16"></div>
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                  <div className="h-4 bg-gray-200 rounded w-12"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const getCategoryBadgeVariant = (category: string) => {
    switch (category.toLowerCase()) {
      case 'science':
        return 'info';
      case 'mathematics':
        return 'success';
      case 'language arts':
        return 'warning';
      case 'social studies':
        return 'gray';
      default:
        return 'gray';
    }
  };

  const formatCompletionRate = (rate: number) => {
    const isHigh = rate >= 90;
    const isMedium = rate >= 75;
    
    return (
      <div className="flex items-center">
        {isHigh ? (
          <TrendingUpIcon className="h-4 w-4 text-green-500 mr-1" />
        ) : isMedium ? (
          <TrendingUpIcon className="h-4 w-4 text-yellow-500 mr-1" />
        ) : (
          <TrendingDownIcon className="h-4 w-4 text-red-500 mr-1" />
        )}
        <span className={`font-medium ${
          isHigh ? 'text-green-600' : 
          isMedium ? 'text-yellow-600' : 
          'text-red-600'
        }`}>
          {rate}%
        </span>
      </div>
    );
  };

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Program Performance</h3>
        <p className="mt-1 text-sm text-gray-500">
          Top performing programs by bookings and revenue
        </p>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Program
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Bookings
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Revenue
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Rating
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Completion Rate
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {programs.map((program, index) => (
              <tr key={program.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {program.name}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Badge variant={getCategoryBadgeVariant(program.category)} size="sm">
                    {program.category}
                  </Badge>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {program.bookings.toLocaleString()}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    ${program.revenue.toLocaleString()}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <StarIcon className="h-4 w-4 text-yellow-400 mr-1" />
                    <span className="text-sm font-medium text-gray-900">
                      {program.rating.toFixed(1)}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {formatCompletionRate(program.completionRate)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {programs.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-500">No program performance data available</div>
        </div>
      )}
    </div>
  );
};
