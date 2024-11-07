import React, { useState, useEffect, useRef } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { searchRepositories, fetchUserRepositories } from '../services/github';

interface Props {
  onSelect: (repo: { owner: string; repo: string }) => void;
}

interface Repository {
  owner: string;
  repo: string;
  fullName: string;
}

export const RepoSelector: React.FC<Props> = ({ onSelect }) => {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Fetch user's repositories on component mount
    const loadUserRepos = async () => {
      setIsLoading(true);
      const repos = await fetchUserRepositories();
      setRepositories(repos);
      setIsLoading(false);
    };

    loadUserRepos();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = async (value: string) => {
    setInput(value);
    setIsDropdownOpen(true);
    
    if (value.length > 2) {
      setIsLoading(true);
      const results = await searchRepositories(value);
      setRepositories(results);
      setIsLoading(false);
    }
  };

  const handleSelectRepo = (repo: Repository) => {
    setInput(repo.fullName);
    setIsDropdownOpen(false);
    onSelect({ owner: repo.owner, repo: repo.repo });
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="flex items-center">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search repositories..."
            value={input}
            onChange={(e) => handleSearch(e.target.value)}
            onFocus={() => setIsDropdownOpen(true)}
            className="pl-9 pr-4 py-1.5 w-64 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
          />
        </div>
      </div>

      {isDropdownOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white rounded-md shadow-lg border border-gray-200">
          {isLoading ? (
            <div className="p-4 text-center text-gray-500">
              <Loader2 className="w-5 h-5 animate-spin inline-block" />
              <span className="ml-2">Loading...</span>
            </div>
          ) : repositories.length > 0 ? (
            <ul className="max-h-60 overflow-auto">
              {repositories.map((repo) => (
                <li
                  key={repo.fullName}
                  onClick={() => handleSelectRepo(repo)}
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm text-gray-700"
                >
                  {repo.fullName}
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-4 text-center text-gray-500 text-sm">
              No repositories found
            </div>
          )}
        </div>
      )}
    </div>
  );
};