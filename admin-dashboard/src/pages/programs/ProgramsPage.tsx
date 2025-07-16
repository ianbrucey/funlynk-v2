import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  loadPrograms,
  filterPrograms,
  loadProgramStats,
  approveProgram,
  rejectProgram,
  suspendProgram,
  setSelectedProgram,
  clearFilters
} from '../../store/slices/programsSlice';
import { ProgramStats } from '../../components/programs/ProgramStats';
import { ProgramFilters } from '../../components/programs/ProgramFilters';
import { ProgramList } from '../../components/programs/ProgramList';
import { ProgramDetailModal } from '../../components/programs/ProgramDetailModal';
import { SparkProgram } from '../../types/programs';
import type { RootState, AppDispatch } from '../../store/store';

export const ProgramsPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const {
    programs,
    stats,
    filters,
    pagination,
    isLoading,
    error,
    selectedProgram
  } = useSelector((state: RootState) => state.programs);

  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    dispatch(loadPrograms({ page: 1 }));
    dispatch(loadProgramStats());
  }, [dispatch]);

  const handleFiltersChange = (newFilters: any) => {
    dispatch(filterPrograms(newFilters));
  };

  const handleClearFilters = () => {
    dispatch(clearFilters());
    dispatch(loadPrograms({ page: 1 }));
  };

  const handleViewProgram = (program: SparkProgram) => {
    dispatch(setSelectedProgram(program));
    setShowDetailModal(true);
  };

  const handleCloseModal = () => {
    setShowDetailModal(false);
    dispatch(setSelectedProgram(null));
  };

  const handleApproveProgram = async (programId: string) => {
    try {
      await dispatch(approveProgram({ programId })).unwrap();
      // Refresh the programs list
      dispatch(loadPrograms({ page: pagination.currentPage }));
      dispatch(loadProgramStats());
      setShowDetailModal(false);
    } catch (error) {
      console.error('Failed to approve program:', error);
    }
  };

  const handleRejectProgram = async (programId: string) => {
    const reason = prompt('Please provide a reason for rejection:');
    if (!reason) return;

    try {
      await dispatch(rejectProgram({ programId, reason })).unwrap();
      // Refresh the programs list
      dispatch(loadPrograms({ page: pagination.currentPage }));
      dispatch(loadProgramStats());
      setShowDetailModal(false);
    } catch (error) {
      console.error('Failed to reject program:', error);
    }
  };

  const handleSuspendProgram = async (programId: string) => {
    const reason = prompt('Please provide a reason for suspension:');
    if (!reason) return;

    try {
      await dispatch(suspendProgram({ programId, reason })).unwrap();
      // Refresh the programs list
      dispatch(loadPrograms({ page: pagination.currentPage }));
      dispatch(loadProgramStats());
      setShowDetailModal(false);
    } catch (error) {
      console.error('Failed to suspend program:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Programs</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage and moderate Spark educational programs
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="text-red-800">{error}</div>
        </div>
      )}

      {/* Program Statistics */}
      <ProgramStats stats={stats} />

      {/* Filters */}
      <ProgramFilters
        filters={filters}
        onFiltersChange={handleFiltersChange}
        onClearFilters={handleClearFilters}
      />

      {/* Program List */}
      <ProgramList
        programs={programs}
        isLoading={isLoading}
        onViewProgram={handleViewProgram}
        onApproveProgram={handleApproveProgram}
        onRejectProgram={handleRejectProgram}
        onSuspendProgram={handleSuspendProgram}
      />

      {/* Program Detail Modal */}
      <ProgramDetailModal
        program={selectedProgram}
        isOpen={showDetailModal}
        onClose={handleCloseModal}
        onApprove={handleApproveProgram}
        onReject={handleRejectProgram}
        onSuspend={handleSuspendProgram}
      />
    </div>
  );
};
