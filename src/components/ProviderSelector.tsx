import React from 'react';
import { Github } from 'lucide-react';

interface Props {
  currentProvider: 'github' | 'azure' | 'jenkins';
  onProviderChange: (provider: 'github' | 'azure' | 'jenkins') => void;
}

export function ProviderSelector({ currentProvider, onProviderChange }: Props) {
  const providers = [
    {
      name: 'github' as const,
      label: 'GitHub',
      icon: <Github className="h-5 w-5" />,
      description: 'GitHub Actions workflows and repositories'
    },
    {
      name: 'azure' as const,
      label: 'Azure DevOps',
      icon: (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none">
          <path
            d="M0 8.877L2.247 5.91l8.405-3.416V.022l7.37 5.393L2.966 8.338v8.225L0 15.707V8.877zm24 .975l-2.247 2.966-8.405 3.416v2.472l-7.37-5.393 15.056-2.923V1.165L24 2.021v7.831z"
            fill="currentColor"
          />
        </svg>
      ),
      description: 'Azure DevOps pipelines and projects'
    },
    {
      name: 'jenkins' as const,
      label: 'Jenkins',
      icon: (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none">
          <path
            d="M3.34 8.262c-1.12 1.691-.95 3.875.396 5.423 1.346 1.547 3.53 1.71 5.222.589 1.691-1.12 1.953-3.304.607-4.851-1.346-1.548-4.534-.469-6.225.839zm17.32.838c-1.346-1.547-4.534-.469-6.225.839-1.12 1.691-.95 3.875.396 5.423 1.346 1.547 3.53 1.71 5.222.589 1.691-1.12 1.953-3.304.607-4.851zM12 4c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm0 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z"
            fill="currentColor"
          />
        </svg>
      ),
      description: 'Jenkins pipelines and jobs'
    }
  ];

  return (
    <div className="mb-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {providers.map((provider) => (
          <button
            key={provider.name}
            onClick={() => onProviderChange(provider.name)}
            className={`relative flex flex-col items-center p-6 rounded-xl transition-all duration-200 ${
              currentProvider === provider.name
                ? 'bg-blue-600 text-white shadow-lg scale-105'
                : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            <div className={`p-3 rounded-full mb-3 ${
              currentProvider === provider.name
                ? 'bg-blue-500'
                : 'bg-gray-100'
            }`}>
              {provider.icon}
            </div>
            <h3 className="text-lg font-semibold mb-2">{provider.label}</h3>
            <p className={`text-sm text-center ${
              currentProvider === provider.name
                ? 'text-blue-100'
                : 'text-gray-500'
            }`}>
              {provider.description}
            </p>
            {currentProvider === provider.name && (
              <div className="absolute -top-2 -right-2">
                <span className="flex h-4 w-4">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-4 w-4 bg-blue-500"></span>
                </span>
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}