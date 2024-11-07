import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { GitCommit } from 'lucide-react';
import { Commit } from '../types';

interface Props {
  commits: Commit[];
  loading: boolean;
}

export function CommitHistory({ commits, loading }: Props) {
  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center space-x-4">
            <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (commits.length === 0) {
    return (
      <div className="text-center py-6">
        <GitCommit className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No commits found</h3>
        <p className="text-gray-500">This repository doesn't have any commits yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {commits.map((commit) => (
        <div key={commit.sha} className="flex items-start space-x-4">
          <div className="flex-shrink-0">
            <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
              <GitCommit className="h-5 w-5 text-gray-500" />
            </div>
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-medium text-gray-900">
              <a href={commit.html_url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                {commit.commit.message.split('\n')[0]}
              </a>
            </div>
            <div className="mt-1 text-sm text-gray-500 flex items-center space-x-2">
              <span>{commit.commit.author.name}</span>
              <span>•</span>
              <span>{formatDistanceToNow(new Date(commit.created_at), { addSuffix: true })}</span>
            </div>
            <div className="mt-2 text-sm text-gray-500 font-mono">
              {commit.sha.substring(0, 7)}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}