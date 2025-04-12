'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

interface Organization{
  organizationName: string;
  email: string;
  country: string;
  state: string;
  mobileNumber: string;
  status: string;
  totalPlayers: number;
  totalCoaches: number;
  totalTeams: number;
  teams: Team[];
  coaches: Coach[];
  players: Player[];


}
interface Team { 
  [key: string]: unknown;
  id: string;
  team_name: string;
  created_by: string;
  creator_id: string;
  team_type: string;
  team_year: number;
  city: string;
  status: string;
}

interface Coach {
  [key: string]: unknown;
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  city: string;
  sport: string;
  status: string;
}

interface Player {
  [key: string]: unknown;
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  team: string;
  city: string;
  sport: string;
  status: string;
}

export default function OrganizationDetailsPage() {
  const { id } = useParams();
  const [orgData, setOrgData] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(`/api/organization/${id}`);
        const data = await res.json();
        setOrgData(data);
      } catch (err) {
        console.error('Error fetching organization:', err);
      } finally {
        setLoading(false);
      }
    }

    if (id) fetchData();
  }, [id]);

  if (loading)
    return <div className="p-6 text-center text-gray-500 animate-pulse">Loading...</div>;

  if (!orgData)
    return <div className="p-6 text-center text-red-500">No organization data found.</div>;

  return (
    <div className="p-8 space-y-10 max-w-7xl mx-auto">
      <header className="text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">Organization History</h1>
        <p className="text-gray-500">Comprehensive view of the organization and its members</p>
      </header>

      {/* Organization Info */}
      <section className="bg-white p-6 rounded-2xl shadow-md border grid grid-cols-1 md:grid-cols-2 gap-4">
        <InfoItem label="Name" value={orgData.organizationName} />
        <InfoItem label="Email" value={orgData.email} />
        <InfoItem label="Country" value={orgData.country} />
        <InfoItem label="State" value={orgData.state} />
        <InfoItem label="Mobile" value={orgData.mobileNumber} />
        <div><strong className="text-gray-500">Status:</strong>
                        <span className={`ml-2 px-2 py-1 rounded-full text-white text-xs ${orgData.status === 'active' ? 'bg-green-500' : 'bg-yellow-500'}`}>
                            {orgData.status}
                        </span>
                    </div>
      </section>

      {/* Summary Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <SummaryCard color="blue" title="Total Players" count={orgData.totalPlayers} />
        <SummaryCard color="green" title="Total Coaches" count={orgData.totalCoaches} />
        <SummaryCard color="purple" title="Total Teams" count={orgData.totalTeams} />
      </section>

      {/* Team Details Table */}
      <TableSection<Team> title="Team Details" data={orgData.teams} columns={[
        'id', 'team_name', 'created_by', 'creator_id', 'team_type', 'team_year', 'city', 'status'
      ]} />

      {/* Coaches Table */}
      <TableSection<Coach> title="Coach Details" data={orgData.coaches} columns={[
        'id', 'firstName', 'lastName', 'email', 'phoneNumber', 'city', 'sport', 'status'
      ]} />

      {/* Players Table */}
      <TableSection<Player> title="Player Details" data={orgData.players} columns={[
        'id', 'first_name', 'last_name', 'email', 'team', 'city', 'sport', 'status'
      ]} />
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="font-medium text-gray-800">{value || '-'}</p>
    </div>
  );
}

function SummaryCard({ color, title, count }: { color: string; title: string; count: number }) {
  const bg = {
    blue: 'bg-blue-100 text-blue-800',
    green: 'bg-green-100 text-green-800',
    purple: 'bg-purple-100 text-purple-800'
  }[color];

  return (
    <div className={`${bg} p-6 rounded-xl shadow-md`}>
      <div className="text-lg font-semibold">{title}</div>
      <div className="text-3xl font-bold mt-1">{count}</div>
    </div>
  );
}

function TableSection<T extends Record<string, unknown>>({
  title,
  data,
  columns
}: {
  title: string;
  data: T[];
  columns: (keyof T)[]; 
}) {
  if (!Array.isArray(data) || data.length === 0) {
    return (
      <section>
        <h2 className="text-2xl font-semibold mb-2">{title}</h2>
        <p className="text-gray-500">No data available.</p>
      </section>
    );
  }

  return (
    <section>
      <h2 className="text-2xl font-semibold mb-4">{title}</h2>
      <div className="overflow-x-auto rounded-xl border shadow-sm">
        <table className="w-full text-sm text-left bg-white">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              {columns.map((col) => (
                <th key={String(col)} className="px-4 py-3 capitalize">
                  {String(col).replace(/_/g, ' ')}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((item, idx) => (
              <tr key={idx} className="border-t">
                {columns.map((col) => (
                  <td key={String(col)} className="px-4 py-2">
                    {String(item[col]) ?? '-'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
