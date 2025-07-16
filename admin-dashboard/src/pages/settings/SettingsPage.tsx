import React from 'react';

export const SettingsPage: React.FC = () => {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="mt-1 text-sm text-gray-500">
          Configure platform settings and preferences
        </p>
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Settings Interface
            </h3>
            <p className="text-gray-500">
              Settings configuration will be added in future iterations.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
