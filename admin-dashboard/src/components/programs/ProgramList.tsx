import React from 'react';
import {
  EyeIcon,
  CheckCircleIcon,
  XCircleIcon,
  PauseCircleIcon,
  StarIcon,
  UsersIcon,
  CurrencyDollarIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';
import { SparkProgram } from '../../types/programs';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';

interface ProgramListProps {
  programs: SparkProgram[];
  isLoading: boolean;
  onViewProgram: (program: SparkProgram) => void;
  onApproveProgram: (programId: string) => void;
  onRejectProgram: (programId: string) => void;
  onSuspendProgram: (programId: string) => void;
}

export const ProgramList: React.FC<ProgramListProps> = ({
  programs,
  isLoading,
  onViewProgram,
  onApproveProgram,
  onRejectProgram,
  onSuspendProgram,
}) => {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge variant="success">Approved</Badge>;
      case 'pending':
        return <Badge variant="warning">Pending</Badge>;
      case 'rejected':
        return <Badge variant="error">Rejected</Badge>;
      case 'suspended':
        return <Badge variant="gray">Suspended</Badge>;
      default:
        return <Badge variant="gray">{status}</Badge>;
    }
  };

  const getActionButtons = (program: SparkProgram) => {
    const buttons = [
      <Button
        key="view"
        variant="ghost"
        size="sm"
        onClick={() => onViewProgram(program)}
      >
        <EyeIcon className="h-4 w-4 mr-1" />
        View
      </Button>
    ];

    if (program.status === 'pending') {
      buttons.push(
        <Button
          key="approve"
          variant="primary"
          size="sm"
          onClick={() => onApproveProgram(program.id)}
        >
          <CheckCircleIcon className="h-4 w-4 mr-1" />
          Approve
        </Button>,
        <Button
          key="reject"
          variant="danger"
          size="sm"
          onClick={() => onRejectProgram(program.id)}
        >
          <XCircleIcon className="h-4 w-4 mr-1" />
          Reject
        </Button>
      );
    }

    if (program.status === 'approved') {
      buttons.push(
        <Button
          key="suspend"
          variant="secondary"
          size="sm"
          onClick={() => onSuspendProgram(program.id)}
        >
          <PauseCircleIcon className="h-4 w-4 mr-1" />
          Suspend
        </Button>
      );
    }

    return buttons;
  };

  if (isLoading) {
    return (
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="divide-y divide-gray-200">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="p-6 animate-pulse">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="h-5 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
                <div className="flex space-x-2">
                  <div className="h-8 w-16 bg-gray-200 rounded"></div>
                  <div className="h-8 w-20 bg-gray-200 rounded"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (programs.length === 0) {
    return (
      <div className="bg-white shadow rounded-lg">
        <div className="text-center py-12">
          <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No programs found</h3>
          <p className="mt-1 text-sm text-gray-500">
            Try adjusting your search or filter criteria.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">
          Programs ({programs.length})
        </h3>
      </div>
      <div className="divide-y divide-gray-200">
        {programs.map((program) => (
          <div key={program.id} className="p-6 hover:bg-gray-50">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-3 mb-2">
                  <h4 className="text-lg font-medium text-gray-900 truncate">
                    {program.title}
                  </h4>
                  {getStatusBadge(program.status)}
                </div>
                
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {program.description}
                </p>

                <div className="flex items-center space-x-6 text-sm text-gray-500 mb-3">
                  <div className="flex items-center">
                    <UsersIcon className="h-4 w-4 mr-1" />
                    <span>Max {program.maxStudents} students</span>
                  </div>
                  <div className="flex items-center">
                    <CurrencyDollarIcon className="h-4 w-4 mr-1" />
                    <span>${program.pricePerStudent}/student</span>
                  </div>
                  <div className="flex items-center">
                    <span>{program.duration} minutes</span>
                  </div>
                  {program.averageRating && (
                    <div className="flex items-center">
                      <StarIcon className="h-4 w-4 mr-1 text-yellow-400" />
                      <span>{program.averageRating.toFixed(1)}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span>By {program.teacher.name}</span>
                    <span>•</span>
                    <span>{program.category}</span>
                    <span>•</span>
                    <span>Grades {program.gradeLevels.join(', ')}</span>
                  </div>
                  
                  {program.status === 'approved' && (
                    <div className="flex items-center space-x-4 text-sm">
                      <span className="text-green-600 font-medium">
                        {program.totalBookings} bookings
                      </span>
                      <span className="text-green-600 font-medium">
                        ${program.revenue.toLocaleString()} revenue
                      </span>
                    </div>
                  )}
                </div>

                {program.rejectionReason && (
                  <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-sm text-red-800">
                      <strong>Rejection reason:</strong> {program.rejectionReason}
                    </p>
                  </div>
                )}
              </div>

              <div className="flex-shrink-0 ml-6">
                <div className="flex space-x-2">
                  {getActionButtons(program)}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
