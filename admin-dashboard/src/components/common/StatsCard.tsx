import React from 'react';
import { 
  UsersIcon, 
  CalendarIcon, 
  CurrencyDollarIcon, 
  ShieldCheckIcon,
  ArrowUpIcon,
  ArrowDownIcon 
} from '@heroicons/react/24/outline';

interface StatsCardProps {
  title: string;
  value: string | number;
  change: number;
  changeType: 'increase' | 'decrease';
  icon: 'users' | 'calendar' | 'currency' | 'shield';
}

const iconMap = {
  users: UsersIcon,
  calendar: CalendarIcon,
  currency: CurrencyDollarIcon,
  shield: ShieldCheckIcon,
};

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  change,
  changeType,
  icon,
}) => {
  const Icon = iconMap[icon];
  const isPositive = changeType === 'increase';

  return (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="p-5">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <Icon className="h-6 w-6 text-gray-400" aria-hidden="true" />
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">
                {title}
              </dt>
              <dd>
                <div className="text-lg font-medium text-gray-900">
                  {value}
                </div>
              </dd>
            </dl>
          </div>
        </div>
      </div>
      <div className="bg-gray-50 px-5 py-3">
        <div className="text-sm">
          <div className={`flex items-center ${
            isPositive ? 'text-green-600' : 'text-red-600'
          }`}>
            {isPositive ? (
              <ArrowUpIcon className="flex-shrink-0 h-4 w-4" />
            ) : (
              <ArrowDownIcon className="flex-shrink-0 h-4 w-4" />
            )}
            <span className="ml-1 font-medium">
              {Math.abs(change)}%
            </span>
            <span className="ml-1 text-gray-500">
              from last month
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
