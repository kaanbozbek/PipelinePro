import React from 'react';
import { Activity, GitCommit, Clock, CheckCircle2 } from 'lucide-react';
import { WorkflowRun, Commit } from '../types';
import { formatDistanceToNow } from 'date-fns';

interface Props {
  workflows: WorkflowRun[];
  commits: Commit[];
}

export function MetricsGrid({ workflows, commits }: Props) {
  const successRate = workflows.length
    ? (workflows.filter(w => w.conclusion === 'success').length / workflows.length) * 100
    : 0;

  const lastActivity = [...workflows, ...commits]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];

  const metrics = [
    {
      name: 'Success Rate',
      value: `${Math.round(successRate)}%`,
      icon: <CheckCircle2 className="h-5 w-5 text-green-500" />,
      color: 'text-green-600',
      bg: 'bg-green-50',
    },
    {
      name: 'Active Workflows',
      value: workflows.filter(w => w.status === 'in_progress').length,
      icon: <Activity className="h-5 w-5 text-blue-500" />,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      name: 'Recent Commits',
      value: commits.length,
      icon: <GitCommit className="h-5 w-5 text-purple-500" />,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
    },
    {
      name: 'Last Activity',
      value: lastActivity ? formatDistanceToNow(new Date(lastActivity.created_at), { addSuffix: true }) : 'N/A',
      icon: <Clock className="h-5 w-5 text-indigo-500" />,
      color: 'text-indigo-600',
      bg: 'bg-indigo-50',
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {metrics.map((metric) => (
        <div
          key={metric.name}
          className={`${metric.bg} rounded-lg shadow-sm border border-gray-200 p-4 transition-all duration-200 hover:shadow-md`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{metric.name}</p>
              <p className={`text-2xl font-semibold ${metric.color} mt-1`}>
                {metric.value}
              </p>
            </div>
            <div className="p-2 rounded-full bg-white shadow-sm">
              {metric.icon}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}