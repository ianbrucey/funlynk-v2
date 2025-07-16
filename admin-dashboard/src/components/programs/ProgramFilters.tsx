import React, { useState } from 'react';
import { MagnifyingGlassIcon, FunnelIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { ProgramFilters as ProgramFiltersType } from '../../types/programs';
import { Button } from '../common/Button';

interface ProgramFiltersProps {
  filters: ProgramFiltersType;
  onFiltersChange: (filters: ProgramFiltersType) => void;
  onClearFilters: () => void;
}

const statusOptions = [
  { value: 'pending', label: 'Pending Review' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'suspended', label: 'Suspended' },
];

const gradeLevelOptions = [
  { value: 'K', label: 'Kindergarten' },
  { value: '1', label: '1st Grade' },
  { value: '2', label: '2nd Grade' },
  { value: '3', label: '3rd Grade' },
  { value: '4', label: '4th Grade' },
  { value: '5', label: '5th Grade' },
  { value: '6', label: '6th Grade' },
  { value: '7', label: '7th Grade' },
  { value: '8', label: '8th Grade' },
];

const categoryOptions = [
  { value: 'Science', label: 'Science' },
  { value: 'Mathematics', label: 'Mathematics' },
  { value: 'Language Arts', label: 'Language Arts' },
  { value: 'Social Studies', label: 'Social Studies' },
  { value: 'Arts & Crafts', label: 'Arts & Crafts' },
  { value: 'Physical Education', label: 'Physical Education' },
  { value: 'Music', label: 'Music' },
  { value: 'Technology', label: 'Technology' },
];

const sortOptions = [
  { value: 'createdAt', label: 'Date Created' },
  { value: 'title', label: 'Title' },
  { value: 'rating', label: 'Rating' },
  { value: 'bookings', label: 'Bookings' },
  { value: 'revenue', label: 'Revenue' },
];

export const ProgramFilters: React.FC<ProgramFiltersProps> = ({
  filters,
  onFiltersChange,
  onClearFilters,
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFiltersChange({
      ...filters,
      search: e.target.value,
    });
  };

  const handleStatusChange = (status: string) => {
    const currentStatus = filters.status || [];
    const newStatus = currentStatus.includes(status)
      ? currentStatus.filter(s => s !== status)
      : [...currentStatus, status];
    
    onFiltersChange({
      ...filters,
      status: newStatus,
    });
  };

  const handleGradeLevelChange = (gradeLevel: string) => {
    const currentGradeLevels = filters.gradeLevels || [];
    const newGradeLevels = currentGradeLevels.includes(gradeLevel)
      ? currentGradeLevels.filter(g => g !== gradeLevel)
      : [...currentGradeLevels, gradeLevel];
    
    onFiltersChange({
      ...filters,
      gradeLevels: newGradeLevels,
    });
  };

  const handleCategoryChange = (category: string) => {
    const currentCategories = filters.categories || [];
    const newCategories = currentCategories.includes(category)
      ? currentCategories.filter(c => c !== category)
      : [...currentCategories, category];
    
    onFiltersChange({
      ...filters,
      categories: newCategories,
    });
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFiltersChange({
      ...filters,
      sortBy: e.target.value as any,
    });
  };

  const handleSortOrderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFiltersChange({
      ...filters,
      sortOrder: e.target.value as 'asc' | 'desc',
    });
  };

  const handlePriceRangeChange = (field: 'min' | 'max', value: string) => {
    const numValue = value === '' ? undefined : parseInt(value);
    onFiltersChange({
      ...filters,
      priceRange: {
        min: filters.priceRange?.min,
        max: filters.priceRange?.max,
        [field]: numValue,
      },
    });
  };

  const hasActiveFilters = !!(
    filters.search ||
    (filters.status && filters.status.length > 0) ||
    (filters.gradeLevels && filters.gradeLevels.length > 0) ||
    (filters.categories && filters.categories.length > 0) ||
    filters.priceRange?.min ||
    filters.priceRange?.max
  );

  return (
    <div className="bg-white shadow rounded-lg mb-6">
      <div className="p-6">
        {/* Search and Sort Row */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0 sm:space-x-4 mb-4">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search programs, teachers, or categories..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              value={filters.search || ''}
              onChange={handleSearchChange}
            />
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">Sort by:</label>
              <select
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                value={filters.sortBy || 'createdAt'}
                onChange={handleSortChange}
              >
                {sortOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <select
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                value={filters.sortOrder || 'desc'}
                onChange={handleSortOrderChange}
              >
                <option value="desc">Descending</option>
                <option value="asc">Ascending</option>
              </select>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAdvanced(!showAdvanced)}
            >
              <FunnelIcon className="h-4 w-4 mr-1" />
              Filters
            </Button>
            
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClearFilters}
              >
                <XMarkIcon className="h-4 w-4 mr-1" />
                Clear
              </Button>
            )}
          </div>
        </div>

        {/* Advanced Filters */}
        {showAdvanced && (
          <div className="border-t border-gray-200 pt-4 space-y-4">
            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <div className="flex flex-wrap gap-2">
                {statusOptions.map(option => (
                  <label key={option.value} className="inline-flex items-center">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                      checked={(filters.status || []).includes(option.value)}
                      onChange={() => handleStatusChange(option.value)}
                    />
                    <span className="ml-2 text-sm text-gray-700">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Grade Levels Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Grade Levels
              </label>
              <div className="flex flex-wrap gap-2">
                {gradeLevelOptions.map(option => (
                  <label key={option.value} className="inline-flex items-center">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                      checked={(filters.gradeLevels || []).includes(option.value)}
                      onChange={() => handleGradeLevelChange(option.value)}
                    />
                    <span className="ml-2 text-sm text-gray-700">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Categories Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Categories
              </label>
              <div className="flex flex-wrap gap-2">
                {categoryOptions.map(option => (
                  <label key={option.value} className="inline-flex items-center">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                      checked={(filters.categories || []).includes(option.value)}
                      onChange={() => handleCategoryChange(option.value)}
                    />
                    <span className="ml-2 text-sm text-gray-700">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Price Range Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price Range (per student)
              </label>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">$</span>
                  <input
                    type="number"
                    placeholder="Min"
                    className="w-20 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                    value={filters.priceRange?.min || ''}
                    onChange={(e) => handlePriceRangeChange('min', e.target.value)}
                  />
                </div>
                <span className="text-gray-500">to</span>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">$</span>
                  <input
                    type="number"
                    placeholder="Max"
                    className="w-20 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                    value={filters.priceRange?.max || ''}
                    onChange={(e) => handlePriceRangeChange('max', e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
