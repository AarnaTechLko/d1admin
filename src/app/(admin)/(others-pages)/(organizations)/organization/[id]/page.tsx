

'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Button from '@/components/ui/button/Button';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
// import Loading from '@/components/Loading';
import { useRoleGuard } from '@/hooks/useRoleGaurd';

interface Organization {
  id: string;
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
  id: string;
  Logo: string;
  Name: string;
  Player: string;
  Coach: string;
  Type: string;
  team_year: number;
  Year: string;
  Status: string;
  is_deleted?: number;
}

interface Coach {
  id: string;
  image: string;
  Coach: string;
  Gender: string;
  Sport: string;
  Earnings: string;
  Evaluations: string;
  Status: string;
  History: string;
  is_deleted?: number;
}

interface Player {
  id: string;
  image: string;
  Player: string;
  Positions: string;
  Grade_level: string;
  Age: string;
  Height: string;
  weight: string;
  Status: string;
  History: string;
  is_deleted?: number;
}

export default function OrganizationDetailsPage() {
  useRoleGuard();

  const { id } = useParams();
  const [orgData, setOrgData] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const MySwal = withReactContent(Swal);

  useEffect(() => {
    async function fetchOrganization() {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(`/api/organization/${id}`);
        if (!res.ok) throw new Error(`Failed to fetch organization with id: ${id}`);

        const data = await res.json();
        setOrgData(data);
        setLoading(false);
      } catch (error: unknown) {
        if (error instanceof Error) {
          setError(error.message);
        } else {
          setError("Internal Server error");
        }
        setLoading(false);
      }
    }

    if (id) fetchOrganization();
  }, [id]);

  // --- Separate Hide/Revert for Team ---
  async function handleHideTeam(teamId: string) {
    const confirmResult = await Swal.fire({
      title: 'Are you sure?',
      text: 'This team will be marked as hidden.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, hide it!',
      cancelButtonText: 'Cancel',
    });
    if (!confirmResult.isConfirmed) return;

    try {
      const res = await fetch(`/api/organization/team/${teamId}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to hide team');

      setOrgData((prev) => {
        if (!prev) return prev;
        const updatedTeams = prev.teams.map((team) =>
          team.id === teamId ? { ...team, is_deleted: 0 } : team
        );
        return { ...prev, teams: updatedTeams };
      });

      await MySwal.fire('Updated!', 'Team hidden successfully.', 'success');

    } catch (error) {
      console.error('Hide team error:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: (error as Error).message || 'Failed to hide team',
      });
    }
  }

  async function handleRevertTeam(teamId: string) {
    const confirmResult = await Swal.fire({
      title: 'Are you sure?',
      text: 'This will revert the team data.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, revert it!',
      cancelButtonText: 'Cancel',
    });
    if (!confirmResult.isConfirmed) return;

    try {
      const res = await fetch(`/api/organization/team/${teamId}`, {
        method: 'PATCH',
      });
      if (!res.ok) throw new Error('Failed to revert team');

      setOrgData((prev) => {
        if (!prev) return prev;
        const updatedTeams = prev.teams.map((team) =>
          team.id === teamId ? { ...team, is_deleted: 1 } : team
        );
        return { ...prev, teams: updatedTeams };
      });

      await MySwal.fire('Updated!', 'Team reverted successfully.', 'success');

    } catch (error) {
      console.error('Revert team error:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: (error as Error).message || 'Failed to revert team',
      });
    }
  }

  // --- Separate Hide/Revert for Coach ---
  async function handleHideCoach(coachId: string) {
    const confirmResult = await Swal.fire({
      title: 'Are you sure?',
      text: 'This coach will be marked as hidden.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, hide it!',
      cancelButtonText: 'Cancel',
    });
    if (!confirmResult.isConfirmed) return;

    try {
      const res = await fetch(`/api/organization/coach/${coachId}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to hide coach');

      setOrgData((prev) => {
        if (!prev) return prev;
        const updatedCoaches = prev.coaches.map((coach) =>
          coach.id === coachId ? { ...coach, is_deleted: 0 } : coach
        );
        return { ...prev, coaches: updatedCoaches };
      });

      await MySwal.fire('Updated!', 'Coach hidden successfully.', 'success');

    } catch (error) {
      console.error('Hide coach error:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: (error as Error).message || 'Failed to hide coach',
      });
    }
  }

  async function handleRevertCoach(coachId: string) {
    const confirmResult = await Swal.fire({
      title: 'Are you sure?',
      text: 'This will revert the coach data.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, revert it!',
      cancelButtonText: 'Cancel',
    });
    if (!confirmResult.isConfirmed) return;

    try {
      const res = await fetch(`/api/organization/coach/${coachId}`, {
        method: 'PATCH',
      });
      if (!res.ok) throw new Error('Failed to revert coach');

      setOrgData((prev) => {
        if (!prev) return prev;
        const updatedCoaches = prev.coaches.map((coach) =>
          coach.id === coachId ? { ...coach, is_deleted: 1 } : coach
        );
        return { ...prev, coaches: updatedCoaches };
      });

      await MySwal.fire('Updated!', 'Coach reverted successfully.', 'success');

    } catch (error) {
      console.error('Revert coach error:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: (error as Error).message || 'Failed to revert coach',
      });
    }
  }

  // --- Separate Hide/Revert for Player ---
  async function handleHidePlayer(playerId: string) {
    const confirmResult = await Swal.fire({
      title: 'Are you sure?',
      text: 'This player will be marked as hidden.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, hide it!',
      cancelButtonText: 'Cancel',
    });
    if (!confirmResult.isConfirmed) return;

    try {
      const res = await fetch(`/api/organization/player/${playerId}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to hide player');

      setOrgData((prev) => {
        if (!prev) return prev;
        const updatedPlayers = prev.players.map((player) =>
          player.id === playerId ? { ...player, is_deleted: 0 } : player
        );
        return { ...prev, players: updatedPlayers };
      });

      await MySwal.fire('Updated!', 'Player hidden successfully.', 'success');

    } catch (error) {
      console.error('Hide player error:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: (error as Error).message || 'Failed to hide player',
      });
    }
  }

  async function handleRevertPlayer(playerId: string) {
    const confirmResult = await Swal.fire({
      title: 'Are you sure?',
      text: 'This will revert the player data.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, revert it!',
      cancelButtonText: 'Cancel',
    });
    if (!confirmResult.isConfirmed) return;

    try {
      const res = await fetch(`/api/organization/player/${playerId}`, {
        method: 'PATCH',
      });
      if (!res.ok) throw new Error('Failed to revert player');

      setOrgData((prev) => {
        if (!prev) return prev;
        const updatedPlayers = prev.players.map((player) =>
          player.id === playerId ? { ...player, is_deleted: 1 } : player
        );
        return { ...prev, players: updatedPlayers };
      });

      await MySwal.fire('Updated!', 'Player reverted successfully.', 'success');

    } catch (error) {
      console.error('Revert player error:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: (error as Error).message || 'Failed to revert player',
      });
    }
  }


  // if (loading) {
  //       return <Loading />;
  //   }

  if (error)
    return (
      <div className="p-6 text-center text-red-500">
        Error: {error}
      </div>
    );

  if (!orgData)
    return (
      <div className="p-6 text-center text-red-500">
        No organization data found.
      </div>
    );

  return (

    <div className="p-8 space-y-10 max-w-7xl mx-auto">
      {loading && (
        <div className="flex items-center justify-center gap-4 ">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          Loading...
        </div>
      )}
      <header className="text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">
          Organization History
        </h1>
        <p className="text-gray-500">
          Comprehensive view of the organization and its members
        </p>
      </header>

      {/* Organization Info */}
      <section className="bg-white p-6 rounded-2xl shadow-md border grid grid-cols-1 md:grid-cols-2 gap-4">
        <InfoItem label="Name" value={orgData.organizationName} />
        <InfoItem label="Email" value={orgData.email} />
        <InfoItem label="Country" value={orgData.country} />
        <InfoItem label="State" value={orgData.state} />
        <InfoItem label="Mobile" value={orgData.mobileNumber} />
        <div>
          <strong className="text-gray-500">Status:</strong>
          <span
            className={`ml-2 px-2 py-1 rounded-full text-white text-xs ${orgData.status === 'active' ? 'bg-green-500' : 'bg-yellow-500'
              }`}
          >
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
      <TableSection<Team>
        title="Team Details"
        data={orgData.teams}
        columns={[
          'Logo',
          'Name',
          'Player',
          'Coach',
          'Type',
          'Year',
          'Status',
          'Actions',
        ]}
        onHide={(team) => handleHideTeam(team.id)}
        onRevert={(team) => handleRevertTeam(team.id)} />

      {/* Coaches Table */}
      <TableSection<Coach>
        title="Coach Details"
        data={orgData.coaches}
        columns={[
          'image',
          'Coach',
          'Gender',
          'Sport',
          'Earnings',
          'Evaluations',
          'Status',
          'History',
          'Actions',
        ]}
        onHide={(coach) => handleHideCoach(coach.id)}
        onRevert={(coach) => handleRevertCoach(coach.id)}
      />

      {/* Players Table */}
      <TableSection<Player>
        title="Player Details"
        data={orgData.players}
        columns={[
          'image',
          'Player',
          'Positions',
          'Grade_level',
          'Age',
          'Height',
          'weight',
          'Status',
          'History',
          'Actions',
        ]}
        onHide={(player) => handleHidePlayer(player.id)}
        onRevert={(player) => handleRevertPlayer(player.id)}
      />
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
    purple: 'bg-purple-100 text-purple-800',
  }[color];

  return (
    <div className={`${bg} p-6 rounded-xl shadow-md`}>
      <div className="text-lg font-semibold">{title}</div>
      <div className="text-3xl font-bold mt-1">{count}</div>
    </div>
  );
}
type Entity = Player | Coach | Team; // Replace with your actual types

function TableSection<T extends Entity>({
  title,
  data,
  columns,
  onHide,
  onRevert,
}: {
  title: string;
  data: T[];
  columns: (keyof T | 'Actions')[];
  onHide?: (item: T) => void;
  onRevert?: (item: T) => void;
}) {
  if (!Array.isArray(data) || data.length === 0) {
    return (
      <section>
        <h2 className="text-sm font-semibold mb-2">{title}</h2>
        <p className="text-gray-500">No data available.</p>
      </section>
    );
  }

  // Determine if it's coach/player for links & actions:
  const isTeamTable = title.toLowerCase().includes('team');
  const isCoachTable = title.toLowerCase().includes('coach');
  const isPlayerTable = title.toLowerCase().includes('player');

  return (
    <section>
      <h2 className="text-2xl font-semibold mb-4">{title}</h2>
      <div className="overflow-x-auto border rounded-lg shadow-sm">
        <table className="w-full table-auto text-left border-collapse">
          <thead className="bg-gray-100 border-b">
            <tr>
              {columns.map((col) => (
                <th key={String(col)} className="px-4 py-3 text-xs font-medium text-gray-600">
                  {String(col).replace(/_/g, ' ').toUpperCase()}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((item, idx) => {
              const isDeleted = item.is_deleted === 0 || item.is_deleted === 2;
              const rowBg = isDeleted ? 'bg-red-100' : '';

              return (
                <tr key={item.id ?? idx} className={`${rowBg} border-b`}>
                  {columns.map((col, colIdx) => {
                    // if (col === 'Actions') {
                    //   return (
                    //     <td key={`actions-${colIdx}`} className="px-4 py-2">
                    //       {/* Hide button (if not deleted) */}
                    //       {onHide && !isDeleted && (
                    //         <Button
                    //           variant="outline"
                    //           size="sm"
                    //           onClick={() => onHide(item)}
                    //           title="Hide"
                    //           className="mr-2"
                    //         >
                    //           <Trash className="w-4 h-4" />
                    //         </Button>
                    //       )}

                    //       {/* Revert button (if deleted) */}
                    //       {onRevert && isDeleted && (
                    //         <Button
                    //           variant="outline"
                    //           size="sm"
                    //           onClick={() => onRevert(item)}
                    //           title="Revert"
                    //         >
                    //           Revert
                    //         </Button>
                    //       )}
                    //     </td>
                    //   );
                    // }

                    // const [loadingAction, setLoadingAction] = useState<'hide' | 'revert' | null>(null);

                    if (col === 'Actions') {
                      return (
                        <td key={`actions-${colIdx}`} className="px-4 py-2 flex gap-2">


                          {/* Hide Button (icon only) */}
                          {onHide && !isDeleted && (
                            <Button
                              onClick={async () => {
                                await onHide(item);
                              }}
                              className="text-red-600 rounded-full bg-transparent m-0 p-0 hover:bg-transparent"
                              title="Hide"
                            >
                              <span role="img" aria-label="Hide">🛑</span>
                            </Button>
                          )}

                          {/* Revert Button (icon only) */}
                          {onRevert && isDeleted && (
                            <Button
                              onClick={async () => {
                                await onRevert(item);
                              }}
                              className="text-green-600 rounded-full bg-transparent m-0 p-0 hover:bg-transparent"
                              title="Revert"
                            >
                              <span role="img" aria-label="Revert">♻️</span>
                            </Button>
                          )}
                        </td>
                      );
                    }

                    const cellValue = item[col];

                    if ((col === 'image' || col === 'Logo') && typeof cellValue === 'string') {
                      return (
                        <td key={`${item.id ?? idx}-${String(col)}-${colIdx}`} className="px-4 py-2">
                          <img
                            src={cellValue}
                            alt={col}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        </td>
                      );
                    }


                    if ((col === 'Coach' || col === 'Team' || col === 'Player') && typeof cellValue === 'string') {
                      const linkPrefix = isCoachTable ? 'coach' :
                        isTeamTable ? 'team' :
                          isPlayerTable ? 'player' : '';
                      return (
                        <td key={String(col)} className="px-4 py-2 text-blue-600 hover:underline">
                          <Link href={`/${linkPrefix}/${item.id}`}>{cellValue}</Link>
                        </td>
                      );
                    }

                    if (col === 'History') {
                      return (
                        <td key="history" className="px-4 py-2">
                          <Link
                            href={`/${title.toLowerCase().includes('coach') ? 'coach' : 'player'
                              }/${item.id}`}
                          >
                            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                              Open
                            </Button>
                          </Link>
                        </td>
                      );
                    }
                    return (
                      <td key={String(col)} className="px-4 py-2">
                        {String(cellValue)}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
