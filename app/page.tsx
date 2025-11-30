'use client';

import { useState, useMemo } from 'react';
import centresData from '../data/centres-list.json';
import { ThemeToggle } from '@/components/theme-toggle';

export default function Home() {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedState, setSelectedState] = useState('all');
  const [selectedCentre, setSelectedCentre] = useState('all');

  // Get unique states from centres data
  const states = useMemo(() => {
    const uniqueStates = [...new Set(centresData.map(c => c.state))].sort();
    return uniqueStates.filter(s => s !== 'Unknown');
  }, []);

  // Filter centres by selected state
  const filteredCentres = useMemo(() => {
    if (selectedState === 'all') return centresData;
    return centresData.filter(c => c.state === selectedState);
  }, [selectedState]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setAnswer('');

    try {
      const response = await fetch('/api/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, centre: selectedCentre }),
      });

      const data = await response.json();
      setAnswer(data.answer || data.error);
    } catch (error) {
      setAnswer('Error: Failed to get response');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen p-8 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">Leisure Centre Assistant</h1>
        <ThemeToggle />
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex gap-4">
          <div className="w-1/4">
            <label htmlFor="state" className="block text-lg font-medium mb-2">
              State:
            </label>
            <select
              id="state"
              value={selectedState}
              onChange={(e) => {
                setSelectedState(e.target.value);
                setSelectedCentre('all'); // Reset centre selection when state changes
              }}
              className="w-full p-3 border rounded-lg bg-white dark:bg-gray-800 text-black dark:text-white dark:border-gray-700"
              disabled={loading}
            >
              <option value="all">All</option>
              {states.map(state => (
                <option key={state} value={state}>{state}</option>
              ))}
            </select>
          </div>

          <div className="flex-1">
            <label htmlFor="centre" className="block text-lg font-medium mb-2">
              Select Centre:
            </label>
            <select
              id="centre"
              value={selectedCentre}
              onChange={(e) => setSelectedCentre(e.target.value)}
              className="w-full p-3 border rounded-lg bg-white dark:bg-gray-800 text-black dark:text-white dark:border-gray-700"
              disabled={loading}
            >
              <option value="all">All Centres</option>
              {filteredCentres.map(centre => (
                <option key={centre.id} value={centre.id}>
                  {centre.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="question" className="block text-lg font-medium mb-2">
            Ask a question:
          </label>
          <input
            id="question"
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="What time does the pool open?"
            className="w-full p-3 border rounded-lg bg-white dark:bg-gray-800 text-black dark:text-white dark:border-gray-700"
            disabled={loading}
          />
        </div>

        <button
          type="submit"
          disabled={loading || !question}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
        >
          {loading ? 'Searching...' : 'Ask Question'}
        </button>
      </form>

      {answer && (
        <div className="mt-8 p-6 bg-gray-100 dark:bg-gray-800 rounded-lg border dark:border-gray-700">
          <h2 className="text-xl font-semibold mb-2 text-black dark:text-white">Answer:</h2>
          <p className="text-gray-800 dark:text-gray-200">{answer}</p>
        </div>
      )}
    </main>
  );
}
