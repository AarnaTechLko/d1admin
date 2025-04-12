'use client';

import { useState } from 'react';
// import { ChevronDown, ChevronUp } from 'lucide-react';

type Player = {
  id: number;
  first_name: string;
  last_name: string;
  image: string;
  position: string;
  grade_level: string;
  location: string;
  height: string;
  weight: string;
  jersey: string;
  birthday: string;
  graduation: string;
  birth_year: string;
  age_group: string;
  status: string;
  coachName?: string;
  coachLastName?: string;
  enterpriseName?: string;
};

export default function PlayerSearchPage() {
  const [playerId, setPlayerId] = useState('');
  const [data, setData] = useState<null | {
    player: Player;
    // evaluations: any[];
    // earnings: any[];
    // payments: any[];
    // evaluationResults: any[];
  }>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // const [expandedSection, setExpandedSection] = useState<string | null>(null);

  // const toggleSection = (section: string) => {
  //   setExpandedSection((prev) => (prev === section ? null : section));
  // };

  const handleSearch = async () => {
    setError(null);
    setLoading(true);
    setData(null);
    try {
      const res = await fetch(`/api/player/${playerId}`);
      if (!res.ok) throw new Error(`Player not found (ID: ${playerId})`);
      const result = await res.json();
      setData(result);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto font-sans">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">🔍 Search Player By ID</h1>

      <div className="flex gap-4 items-center mb-6">
        <input
          type="number"
          placeholder="Enter Player ID"
          value={playerId}
          onChange={(e) => setPlayerId(e.target.value)}
          className="border border-gray-300 px-4 py-2 rounded-lg w-64 shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
        <button
          onClick={handleSearch}
          className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          Search
        </button>
      </div>

      {loading && <p className="text-blue-600 font-medium">Loading...</p>}
      {error && <p className="text-red-600 font-medium">{error}</p>}

      {data?.player && (
        <div className="bg-white shadow-xl rounded-2xl p-6">
          <div className="flex items-center gap-6 mb-4">
            <img
              src={data.player.image || '/default-avatar.png'}
              alt="Player"
              className="w-32 h-32 object-cover rounded-xl border"
            />
            <div>
              <h2 className="text-2xl font-semibold text-gray-800">
                {data.player.first_name} {data.player.last_name}
              </h2>
              <p className="text-gray-600">{data.player.position} · Grade {data.player.grade_level}</p>
              <p className="text-sm text-gray-500">Status: {data.player.status}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm text-gray-700">
            <p><strong>Location:</strong> {data.player.location}</p>
            <p><strong>Height:</strong> {data.player.height} cm</p>
            <p><strong>Weight:</strong> {data.player.weight} kg</p>
            <p><strong>Jersey:</strong> #{data.player.jersey}</p>
            <p><strong>Birthday:</strong> {data.player.birthday}</p>
            <p><strong>Graduation:</strong> {data.player.graduation}</p>
            <p><strong>Age Group:</strong> {data.player.age_group}</p>
            <p><strong>Birth Year:</strong> {data.player.birth_year}</p>
            <p><strong>Coach:</strong> {data.player.coachName} {data.player.coachLastName}</p>
            <p><strong>Enterprise:</strong> {data.player.enterpriseName}</p>
          </div>

          {/* Collapsible Sections
          {['evaluations', 'earnings', 'payments', 'evaluationResults'].map((section) => (
            <div key={section} className="mt-6">
              <button
                onClick={() => toggleSection(section)}
                className="flex justify-between items-center w-full text-left text-lg font-medium text-blue-600 hover:text-blue-800 transition"
              >
                {section === 'evaluationResults'
                  ? 'Evaluation Results'
                  : section.charAt(0).toUpperCase() + section.slice(1)}
                {expandedSection === section ? <ChevronUp /> : <ChevronDown />}
              </button>
              {expandedSection === section && (
                <pre className="mt-2 p-4 bg-gray-100 rounded-xl overflow-auto text-sm max-h-64">
                  {JSON.stringify((data as any)[section], null, 2)}
                </pre>
              )}
            </div>
          ))} */}
        </div>
      )}
    </div>
  );
}
