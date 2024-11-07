import React from 'react';
import { Recommendation } from '../services/recommendations';
import { Lightbulb, Shield, Zap, BookOpen, ChevronRight } from 'lucide-react';

interface Props {
  recommendations: Recommendation[];
}

export function RecommendationPanel({ recommendations }: Props) {
  const getIcon = (type: Recommendation['type']) => {
    switch (type) {
      case 'optimization':
        return <Zap className="h-5 w-5 text-yellow-500" />;
      case 'security':
        return <Shield className="h-5 w-5 text-red-500" />;
      case 'performance':
        return <Lightbulb className="h-5 w-5 text-green-500" />;
      default:
        return <BookOpen className="h-5 w-5 text-blue-500" />;
    }
  };

  const getImpactColor = (impact: Recommendation['impact']) => {
    switch (impact) {
      case 'high':
        return 'text-red-600 bg-red-50';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50';
      case 'low':
        return 'text-green-600 bg-green-50';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4 border-b">
        <h2 className="text-lg font-medium text-gray-900">Intelligent Recommendations</h2>
        <p className="mt-1 text-sm text-gray-500">
          AI-powered suggestions to improve your pipeline
        </p>
      </div>

      <div className="divide-y">
        {recommendations.map((rec) => (
          <div key={rec.id} className="p-4 hover:bg-gray-50 transition-colors">
            <div className="flex items-start space-x-3">
              {getIcon(rec.type)}
              <div>
                <h3 className="font-medium text-gray-900">{rec.title}</h3>
                <p className="mt-1 text-sm text-gray-500">{rec.description}</p>
                
                <div className="mt-2 flex items-center space-x-2">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getImpactColor(rec.impact)}`}>
                    {rec.impact} impact
                  </span>
                </div>

                <div className="mt-3 space-y-2">
                  {rec.actionItems.map((item, index) => (
                    <div key={index} className="flex items-center text-sm text-gray-600">
                      <ChevronRight className="h-4 w-4 text-gray-400 mr-2" />
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}

        {recommendations.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            <Lightbulb className="h-8 w-8 mx-auto mb-2 text-gray-400" />
            <p>No recommendations available at this time.</p>
          </div>
        )}
      </div>
    </div>
  );
}