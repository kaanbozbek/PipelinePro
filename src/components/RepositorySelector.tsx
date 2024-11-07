import React, { useState, useEffect } from 'react';
import { Repository } from '../types';
import { fetchUserRepositories, searchRepositories } from '../services/github';
import { fetchAzureProjects } from '../services/azure';
import { Search, AlertCircle } from 'lucide-react';
import { config } from '../config';

interface RepositorySelectorProps {
  provider: 'github' | 'azure';
  onSelectRepository: (repo: Repository) => void;
}

export function RepositorySelector({ provider, onSelectRepository }: RepositorySelectorProps) {
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadRepositories();
  }, [provider]);

  const loadRepositories = async () => {
    setLoading(true);
    setError(null);
    try {
      if (provider === 'github') {
        if (!config.githubToken) {
          setError('GitHub token not configured. Please check your environment variables.');
          return;
        }
        const repos = await fetchUserRepositories();
        setRepositories(repos);
      } else {
        if (!config.azurePat) {
          setError('Azure PAT not configured. Please check your environment variables.');
          return;
        }
        const projects = await fetchAzureProjects();
        setRepositories(projects);
      }
    } catch (error) {
      console.error('Error loading repositories:', error);
      setError('Failed to load repositories. Please try again.');
    }
    setLoading(false);
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setLoading(true);
    setError(null);
    try {
      if (provider === 'github') {
        const results = await searchRepositories(searchQuery);
        setRepositories(results);
      } else {
        const projects = await fetchAzureProjects();
        const filtered = projects.filter(project => 
          project.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setRepositories(filtered);
      }
    } catch (error) {
      console.error('Error searching repositories:', error);
      setError('Failed to search repositories. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={provider === 'github' ? "Search repositories..." : "Search projects..."}
            className="w-full px-4 py-2 pl-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
        </div>
        <button
          type="submit"
          className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Search
        </button>
      </form>

      {loading ? (
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <ul className="space-y-2">
          {repositories.map((repo) => (
            <li key={repo.id || repo.fullName}>
              <button
                onClick={() => onSelectRepository(repo)}
                className="w-full p-4 text-left border rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-blue-500"
              >
                <h3 className="font-medium">{repo.name || repo.fullName}</h3>
                {repo.description && (
                  <p className="text-sm text-gray-500 mt-1">{repo.description}</p>
                )}
              </button>
            </li>
          ))}
          {repositories.length === 0 && !error && (
            <li className="text-center py-4 text-gray-500">
              No {provider === 'github' ? 'repositories' : 'projects'} found
            </li>
          )}
        </ul>
      )}
    </div>
  );
}