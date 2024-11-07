import React from 'react';
import { RootCause } from '../services/rootCauseAnalysis';
import { AlertTriangle, GitBranch, Box } from 'lucide-react';

interface Props {
  rootCause: RootCause;
}

export function RootCauseAnalysis({ rootCause }: Props) {
  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4 border-b bg-red-50">
        <div className="flex items-center space-x-2">
          <AlertTriangle className="h-5 w-5 text-red-500" />
          <h2 className="text-lg font-medium text-red-900">Root Cause Analysis</h2>
        </div>
        <p className="mt-1 text-sm text-red-700">
          Automated analysis of pipeline failure
        </p>
      </div>

      <div className="p-6 space-y-6">
        <div>
          <h3 className="text-sm font-medium text-gray-500">Issue Identified</h3>
          <p className="mt-2 text-lg text-gray-900">{rootCause.issue}</p>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex-1 bg-gray-100 h-1 rounded-full">
            <div 
              className="bg-blue-600 h-1 rounded-full" 
              style={{ width: `${rootCause.confidence * 100}%` }}
            />
          </div>
          <span className="text-sm text-gray-500">
            {Math.round(rootCause.confidence * 100)}% confidence
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">Root Cause</h3>
            <div className="p-4 bg-red-50 rounded-lg border border-red-200">
              <p className="text-red-700">{rootCause.cause}</p>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">Recommended Solution</h3>
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <p className="text-green-700">{rootCause.solution}</p>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-500 mb-2">Impact Analysis</h3>
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Box className="h-5 w-5 text-blue-500" />
              <span className="text-sm text-gray-700">Dependencies Affected:</span>
              <div className="flex items-center space-x-2">
                {rootCause.dependencies.map((dep, index) => (
                  <span 
                    key={index}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                  >
                    {dep}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <GitBranch className="h-5 w-5 text-purple-500" />
              <span className="text-sm text-gray-700">Impacted Stages:</span>
              <div className="flex items-center space-x-2">
                {rootCause.impactedStages.map((stage, index) => (
                  <span 
                    key={index}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800"
                  >
                    {stage}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}