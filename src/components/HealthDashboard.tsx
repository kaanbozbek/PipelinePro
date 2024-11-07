import React from 'react';
import { Clock, Activity, AlertTriangle, CheckCircle2, Zap, Shield } from 'lucide-react';
import { WorkflowRun, Pipeline } from '../types';

interface Props {
  workflows: WorkflowRun[];
  pipelines: Pipeline[];
}

export function HealthDashboard({ workflows, pipelines }: Props) {
  const allRuns = [...workflows, ...pipelines];
  
  // Calculate success rate based on workflow conclusion
  const successRate = workflows.length > 0
    ? (workflows.filter(run => run.conclusion === 'success').length / workflows.length) * 100
    : 0;

  // Calculate average duration
  const avgDuration = workflows.reduce((acc, run) => {
    const start = new Date(run.created_at).getTime();
    const end = new Date(run.updated_at).getTime();
    return acc + (end - start);
  }, 0) / (workflows.length || 1);

  const metrics = [
    {
      title: 'Pipeline Success',
      value: `${Math.round(successRate)}%`,
      icon: <CheckCircle2 className="h-6 w-6" />,
      color: successRate >= 80 ? 'emerald' : successRate >= 50 ? 'amber' : 'rose',
      trend: successRate >= 80 ? 'up' : 'down'
    },
    {
      title: 'Average Duration',
      value: `${Math.round(avgDuration / 1000 / 60)}m`,
      icon: <Clock className="h-6 w-6" />,
      color: 'blue',
      trend: avgDuration < 600000 ? 'up' : 'down'
    },
    {
      title: 'Failed Builds',
      value: workflows.filter(r => r.conclusion === 'failure').length,
      icon: <AlertTriangle className="h-6 w-6" />,
      color: 'rose',
      trend: 'neutral'
    },
    {
      title: 'Active Pipelines',
      value: workflows.filter(r => r.status === 'in_progress').length,
      icon: <Activity className="h-6 w-6" />,
      color: 'violet',
      trend: 'up'
    }
  ];

  const getColors = (color: string) => {
    const colors: Record<string, { bg: string; text: string; icon: string }> = {
      emerald: { bg: 'bg-emerald-50', text: 'text-emerald-700', icon: 'text-emerald-500' },
      blue: { bg: 'bg-blue-50', text: 'text-blue-700', icon: 'text-blue-500' },
      rose: { bg: 'bg-rose-50', text: 'text-rose-700', icon: 'text-rose-500' },
      violet: { bg: 'bg-violet-50', text: 'text-violet-700', icon: 'text-violet-500' },
      amber: { bg: 'bg-amber-50', text: 'text-amber-700', icon: 'text-amber-500' },
      indigo: { bg: 'bg-indigo-50', text: 'text-indigo-700', icon: 'text-indigo-500' }
    };
    return colors[color];
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((metric) => {
        const colors = getColors(metric.color);
        return (
          <div 
            key={metric.title} 
            className={`${colors.bg} rounded-xl p-6 border border-${metric.color}-200 shadow-sm hover:shadow-md transition-all duration-200`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-2 rounded-lg ${colors.bg}`}>
                <div className={colors.icon}>{metric.icon}</div>
              </div>
              <div className={`text-sm font-medium ${
                metric.trend === 'up' ? 'text-green-600' :
                metric.trend === 'down' ? 'text-red-600' :
                'text-gray-600'
              }`}>
                {metric.trend === 'up' && '↑'}
                {metric.trend === 'down' && '↓'}
                {metric.trend === 'neutral' && '→'}
              </div>
            </div>
            <h3 className={`text-sm font-medium ${colors.text}`}>{metric.title}</h3>
            <p className={`mt-2 text-2xl font-bold ${colors.text}`}>{metric.value}</p>
          </div>
        );
      })}
    </div>
  );
}