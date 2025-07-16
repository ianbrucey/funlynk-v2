import React, { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { 
  XMarkIcon,
  StarIcon,
  UsersIcon,
  ClockIcon,
  CurrencyDollarIcon,
  CheckCircleIcon,
  XCircleIcon,
  PauseCircleIcon
} from '@heroicons/react/24/outline';
import { SparkProgram } from '../../types/programs';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';

interface ProgramDetailModalProps {
  program: SparkProgram | null;
  isOpen: boolean;
  onClose: () => void;
  onApprove: (programId: string) => void;
  onReject: (programId: string) => void;
  onSuspend: (programId: string) => void;
}

export const ProgramDetailModal: React.FC<ProgramDetailModalProps> = ({
  program,
  isOpen,
  onClose,
  onApprove,
  onReject,
  onSuspend,
}) => {
  if (!program) return null;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge variant="success">Approved</Badge>;
      case 'pending':
        return <Badge variant="warning">Pending Review</Badge>;
      case 'rejected':
        return <Badge variant="error">Rejected</Badge>;
      case 'suspended':
        return <Badge variant="gray">Suspended</Badge>;
      default:
        return <Badge variant="gray">{status}</Badge>;
    }
  };

  const getActionButtons = () => {
    const buttons = [];

    if (program.status === 'pending') {
      buttons.push(
        <Button
          key="approve"
          variant="primary"
          onClick={() => onApprove(program.id)}
        >
          <CheckCircleIcon className="h-4 w-4 mr-2" />
          Approve Program
        </Button>,
        <Button
          key="reject"
          variant="danger"
          onClick={() => onReject(program.id)}
        >
          <XCircleIcon className="h-4 w-4 mr-2" />
          Reject Program
        </Button>
      );
    }

    if (program.status === 'approved') {
      buttons.push(
        <Button
          key="suspend"
          variant="secondary"
          onClick={() => onSuspend(program.id)}
        >
          <PauseCircleIcon className="h-4 w-4 mr-2" />
          Suspend Program
        </Button>
      );
    }

    return buttons;
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-white text-left align-middle shadow-xl transition-all">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                  <div className="flex items-center space-x-4">
                    <Dialog.Title className="text-xl font-semibold text-gray-900">
                      {program.title}
                    </Dialog.Title>
                    {getStatusBadge(program.status)}
                  </div>
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-500 focus:outline-none"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                {/* Content */}
                <div className="p-6 max-h-96 overflow-y-auto">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Left Column */}
                    <div className="space-y-6">
                      {/* Basic Info */}
                      <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-3">Program Details</h3>
                        <div className="space-y-3">
                          <p className="text-gray-600">{program.description}</p>
                          
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="flex items-center">
                              <ClockIcon className="h-4 w-4 mr-2 text-gray-400" />
                              <span>{program.duration} minutes</span>
                            </div>
                            <div className="flex items-center">
                              <UsersIcon className="h-4 w-4 mr-2 text-gray-400" />
                              <span>Max {program.maxStudents} students</span>
                            </div>
                            <div className="flex items-center">
                              <CurrencyDollarIcon className="h-4 w-4 mr-2 text-gray-400" />
                              <span>${program.pricePerStudent} per student</span>
                            </div>
                            {program.averageRating && (
                              <div className="flex items-center">
                                <StarIcon className="h-4 w-4 mr-2 text-yellow-400" />
                                <span>{program.averageRating.toFixed(1)} ({program.totalReviews} reviews)</span>
                              </div>
                            )}
                          </div>

                          <div>
                            <span className="text-sm font-medium text-gray-700">Grade Levels: </span>
                            <span className="text-sm text-gray-600">{program.gradeLevels.join(', ')}</span>
                          </div>

                          <div>
                            <span className="text-sm font-medium text-gray-700">Category: </span>
                            <span className="text-sm text-gray-600">{program.category}</span>
                          </div>

                          <div>
                            <span className="text-sm font-medium text-gray-700">Tags: </span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {program.tags.map((tag, index) => (
                                <Badge key={index} variant="gray" size="sm">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Learning Objectives */}
                      <div>
                        <h4 className="text-md font-medium text-gray-900 mb-2">Learning Objectives</h4>
                        <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                          {program.learningObjectives.map((objective, index) => (
                            <li key={index}>{objective}</li>
                          ))}
                        </ul>
                      </div>

                      {/* Materials */}
                      <div>
                        <h4 className="text-md font-medium text-gray-900 mb-2">Required Materials</h4>
                        <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                          {program.materials.map((material, index) => (
                            <li key={index}>{material}</li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-6">
                      {/* Teacher Info */}
                      <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-3">Teacher Information</h3>
                        <div className="bg-gray-50 rounded-lg p-4">
                          <div className="flex items-center space-x-3 mb-3">
                            <div className="h-10 w-10 bg-gray-300 rounded-full flex items-center justify-center">
                              <span className="text-sm font-medium text-gray-700">
                                {program.teacher.name.charAt(0)}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{program.teacher.name}</p>
                              <p className="text-sm text-gray-600">{program.teacher.email}</p>
                            </div>
                          </div>
                          
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center justify-between">
                              <span className="text-gray-600">Rating:</span>
                              <div className="flex items-center">
                                <StarIcon className="h-4 w-4 text-yellow-400 mr-1" />
                                <span className="font-medium">{program.teacher.rating.toFixed(1)}</span>
                              </div>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-gray-600">Total Programs:</span>
                              <span className="font-medium">{program.teacher.totalPrograms}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-gray-600">Verified:</span>
                              <span className={`font-medium ${program.teacher.isVerified ? 'text-green-600' : 'text-red-600'}`}>
                                {program.teacher.isVerified ? 'Yes' : 'No'}
                              </span>
                            </div>
                          </div>

                          <div className="mt-3">
                            <p className="text-sm font-medium text-gray-700 mb-1">Qualifications:</p>
                            <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                              {program.teacher.qualifications.map((qual, index) => (
                                <li key={index}>{qual}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>

                      {/* Performance Stats (if approved) */}
                      {program.status === 'approved' && (
                        <div>
                          <h4 className="text-md font-medium text-gray-900 mb-3">Performance</h4>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="bg-blue-50 rounded-lg p-3 text-center">
                              <p className="text-2xl font-bold text-blue-600">{program.totalBookings}</p>
                              <p className="text-blue-600">Total Bookings</p>
                            </div>
                            <div className="bg-green-50 rounded-lg p-3 text-center">
                              <p className="text-2xl font-bold text-green-600">${program.revenue.toLocaleString()}</p>
                              <p className="text-green-600">Revenue</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Rejection Reason */}
                      {program.rejectionReason && (
                        <div>
                          <h4 className="text-md font-medium text-gray-900 mb-2">Rejection Reason</h4>
                          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                            <p className="text-sm text-red-800">{program.rejectionReason}</p>
                          </div>
                        </div>
                      )}

                      {/* Timestamps */}
                      <div>
                        <h4 className="text-md font-medium text-gray-900 mb-2">Timeline</h4>
                        <div className="space-y-2 text-sm text-gray-600">
                          <div>
                            <span className="font-medium">Created:</span> {new Date(program.createdAt).toLocaleString()}
                          </div>
                          <div>
                            <span className="font-medium">Last Updated:</span> {new Date(program.updatedAt).toLocaleString()}
                          </div>
                          {program.approvedAt && (
                            <div>
                              <span className="font-medium">Approved:</span> {new Date(program.approvedAt).toLocaleString()}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
                  <Button variant="ghost" onClick={onClose}>
                    Close
                  </Button>
                  {getActionButtons()}
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};
