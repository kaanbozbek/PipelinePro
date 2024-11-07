import React from 'react';
import { Shield, Zap, Settings, AlertCircle } from 'lucide-react';
import { PipelineAnalysis } from '../services/pipelineAnalysis';

interface Props {
  analysis: PipelineAnalysis | null;
  hasWorkflows?: boolean;
}

export function PipelineAnalytics({ analysis, hasWorkflows = false }: Props) {
  if (!hasWorkflows) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
        <AlertCircle className="h-8 w-8 text-gray-400 mx-auto mb-3" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Pipeline Data Available</h3>
        <p className="text-gray-500">
          Select a repository with workflows to view analytics and recommendations.
        </p>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-3"></div>
        <h3 className="text-lg font-medium text-gray-900">Analyzing Pipeline Data</h3>
      </div>
    );
  }

  const { healthScores, suggestions, anomalies } = analysis;

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50 border-green-200';
    if (score >= 60) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const healthMetrics = [
    {
      name: 'Security',
      score: healthScores.security,
      icon: <Shield className="h-5 w-5" />
    },
    {
      name: 'Performance',
      score: healthScores.performance,
      icon: <Zap className="h-5 w-5" />
    },
    {
      name: 'Optimization',
      score: healthScores.optimization,
      icon: <Settings className="h-5 w-5" />
    }
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        {healthMetrics.map((metric) => (
          <div
            key={metric.name}
            className={`flex items-center justify-between p-4 rounded-lg border ${getScoreColor(
              metric.score
            )}`}
          >
            <div className="flex items-center gap-3">
              {metric.icon}
              <span className="font-medium">{metric.name}</span>
            </div>
            <span className="text-lg font-semibold">{Math.round(metric.score)}%</span>
          </div>
        ))}
      </div>

      {suggestions.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h3 className="font-medium text-gray-900 mb-4">Recommendations</h3>
          <div className="space-y-4">
            {suggestions.map((suggestion) => (
              <div
                key={suggestion.id}
                className="p-4 rounded-lg border border-blue-100 bg-blue-50"
              >
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium text-blue-900">{suggestion.title}</h4>
                  <div className="flex gap-2">
                    <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                      Impact: {suggestion.impact}
                    </span>
                    <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                      Effort: {suggestion.effort}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-blue-800">{suggestion.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {anomalies.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h3 className="font-medium text-gray-900 mb-4">Detected Anomalies</h3>
          <div className="space-y-2">
            {anomalies.map((anomaly) => (
              <div
                key={anomaly.id}
                className="p-3 rounded-lg border border-yellow-100 bg-yellow-50"
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm text-yellow-800">{anomaly.description}</p>
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      anomaly.severity === 'High'
                        ? 'bg-red-100 text-red-800'
                        : anomaly.severity === 'Medium'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {anomaly.severity}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}