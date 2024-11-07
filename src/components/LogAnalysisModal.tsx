import React from 'react';
import { X, CheckCircle2, ArrowRight } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  analysis: string | null;
  error: string | null;
  isLoading: boolean;
  roadmap?: string[] | null;
}

export function LogAnalysisModal({ isOpen, onClose, analysis, error, isLoading, roadmap }: Props) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full mx-4 relative">
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900">AI Log Analysis</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">Analyzing logs...</span>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-md p-4 text-red-700">
              <p className="font-medium mb-1">Analysis Error</p>
              <p className="text-sm">{error}</p>
            </div>
          ) : (
            <div className="space-y-6">
              {analysis && (
                <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                  <h4 className="text-blue-900 font-medium mb-2">Analysis Result</h4>
                  <p className="text-blue-800 whitespace-pre-wrap">{analysis}</p>
                </div>
              )}

              {roadmap && roadmap.length > 0 && (
                <div className="bg-green-50 border border-green-200 rounded-md p-4">
                  <h4 className="text-green-900 font-medium mb-3">Resolution Roadmap</h4>
                  <div className="space-y-2">
                    {roadmap.map((step, index) => (
                      <div key={index} className="flex items-start space-x-2 text-green-800">
                        <div className="flex-shrink-0 mt-1">
                          {index === roadmap.length - 1 ? (
                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                          ) : (
                            <ArrowRight className="h-5 w-5 text-green-600" />
                          )}
                        </div>
                        <p className="text-sm">{step}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        
        <div className="border-t p-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}