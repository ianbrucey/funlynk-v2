import React from 'react';
import { 
  TableCellsIcon, 
  CalendarDaysIcon,
  Squares2X2Icon,
  ListBulletIcon 
} from '@heroicons/react/24/outline';
import { classNames } from '../../utils/classNames';

interface ViewToggleOption {
  value: string;
  label: string;
  icon: 'table' | 'calendar' | 'grid' | 'list';
}

interface ViewToggleProps {
  options: ViewToggleOption[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

const iconMap = {
  table: TableCellsIcon,
  calendar: CalendarDaysIcon,
  grid: Squares2X2Icon,
  list: ListBulletIcon,
};

export const ViewToggle: React.FC<ViewToggleProps> = ({
  options,
  value,
  onChange,
  className,
}) => {
  return (
    <div className={classNames('inline-flex rounded-md shadow-sm', className)}>
      {options.map((option, index) => {
        const Icon = iconMap[option.icon];
        const isSelected = value === option.value;
        const isFirst = index === 0;
        const isLast = index === options.length - 1;

        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={classNames(
              'relative inline-flex items-center px-3 py-2 text-sm font-medium',
              'border border-gray-300 focus:z-10 focus:outline-none focus:ring-2 focus:ring-blue-500',
              'transition-colors duration-200',
              isFirst && 'rounded-l-md',
              isLast && 'rounded-r-md',
              !isFirst && '-ml-px',
              isSelected
                ? 'bg-blue-600 text-white border-blue-600 z-10'
                : 'bg-white text-gray-700 hover:bg-gray-50 hover:text-gray-900'
            )}
            title={option.label}
          >
            <Icon className="h-4 w-4" />
            <span className="ml-2 hidden sm:inline">{option.label}</span>
          </button>
        );
      })}
    </div>
  );
};
