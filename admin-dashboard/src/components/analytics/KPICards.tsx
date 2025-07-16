import React from 'react';
import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/solid';
import { KPIData } from '../../types';
import { classNames } from '../../utils/classNames';

interface KPICardsProps {
  kpis: KPIData[];
  isLoading?: boolean;
}

const MiniChart: React.FC<{ data: number[]; color: string }> = ({ data, color }) => {
  if (!data || data.length === 0) return null;

  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;

  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * 100;
    const y = 100 - ((value - min) / range) * 100;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg className="w-full h-8" viewBox="0 0 100 100" preserveAspectRatio="none">
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="2"
        points={points}
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
};

const LoadingSkeleton: React.FC = () => (
  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
    {[...Array(4)].map((_, i) => (
      <div key={i} className="bg-white overflow-hidden shadow rounded-lg animate-pulse">
        <div className="p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-6 w-6 bg-gray-200 rounded"></div>
            </div>
            <div className="ml-5 w-0 flex-1">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-6 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
          <div className="mt-4 h-8 bg-gray-200 rounded"></div>
        </div>
      </div>
    ))}
  </div>
);

export const KPICards: React.FC<KPICardsProps> = ({ kpis, isLoading = false }) => {
  const formatChange = (change: number, type: string) => {
    const isPositive = change >= 0;
    const prefix = isPositive ? '+' : '';
    
    switch (type) {
      case 'percentage':
        return `${prefix}${change.toFixed(1)}%`;
      case 'currency':
        return `${prefix}$${Math.abs(change).toLocaleString()}`;
      default:
        return `${prefix}${change.toLocaleString()}`;
    }
  };

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {kpis.map((kpi, index) => {
        const Icon = kpi.icon;
        const isPositive = kpi.change >= 0;
        
        return (
          <div key={index} className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow duration-200">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="p-2 bg-blue-100 rounded-md">
                    <Icon className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {kpi.title}
                    </dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">
                        {kpi.value}
                      </div>
                      <div className={classNames(
                        'ml-2 flex items-baseline text-sm font-semibold',
                        isPositive ? 'text-green-600' : 'text-red-600'
                      )}>
                        {isPositive ? (
                          <ArrowUpIcon className="self-center flex-shrink-0 h-4 w-4" />
                        ) : (
                          <ArrowDownIcon className="self-center flex-shrink-0 h-4 w-4" />
                        )}
                        <span className="sr-only">
                          {isPositive ? 'Increased' : 'Decreased'} by
                        </span>
                        {formatChange(kpi.change, kpi.changeType)}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
              <div className="mt-4">
                <MiniChart 
                  data={kpi.trend} 
                  color={isPositive ? '#10B981' : '#EF4444'} 
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
