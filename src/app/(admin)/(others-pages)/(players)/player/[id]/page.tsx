'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';

interface Player {
    id: number;
    first_name: string;
    last_name: string;
    image: string | null;
    position: string;
    grade_level: string | null;
    location: string | null;
    height: string | null;
    weight: string | null;
    jersey: string | null;
    birthday: string;
    graduation: string | null;
    birth_year: string | null;
    age_group: string | null;
    status: string;
    coachName: string | null;
    coachLastName: string | null;
    enterpriseName: string | null;
}

interface Earnings{
    id: string;
    review_title: string;
    evaluation_title: string;
    jerseyColorOne: string;
    company_amount: number;
    commision_rate: number;
    commision_amount: number;
    discount_amount: number;
    coupon: string;
   status: string;
    created_at: string;
}

interface EvaluationResult {
    id: string;
    finalRemarks?: string;
    sport?: string;
    physicalScores: number;
    technicalScores: number;
    tacticalScores: number;
    distributionScores: number;
    organizationScores: number;
    thingsToWork: string;
    created_at: string;
  }
  
  interface Payment {
    id: string;
    player_id: string;
    evaluation_id: string;
    amount: number;
    payment_info: string;
    status: string;
    currency: string;
    description: string;
    created_at: string;
  }

interface Evaluation {
    id: string;
    review_title: string;
    primary_video_link: string;
    jerseyNumber: string;
    jerseyColorOne: string;
    positionOne: string;
    status: number;
    turnaroundTime: number;
    payment_status: string;
    rating?: number;
    remarks?: string;
    created_at: string;
  }

export default function PlayerDetailPage() {
    const { id } = useParams();
    const [data, setData] = useState<{
        player: Player;
        evaluations: Evaluation[];
        earnings: Earnings[];
        payments: Payment[];
        evaluationResults: EvaluationResult[];
      } | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!id) return;

        const fetchPlayerData = async () => {
            try {
                const res = await fetch(`/api/player/${id}`);
                const json = await res.json();
                if (res.ok) {
                    setData(json);
                } else {
                    setError(json.message || 'Failed to fetch player data');
                }
            } catch (err) {
                console.log(err);
                setError('An unexpected error occurred.');
            } finally {
                setLoading(false);
            }
        };

        fetchPlayerData();
    }, [id]);

    if (loading) return <p className="p-4">Loading...</p>;
    if (error) return <p className="p-4 text-red-500">{error}</p>;
    if (!data) return <p className="p-4">Player not found.</p>;

    const { player, payments, evaluationResults, evaluations, earnings } = data;

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-8">
            <div className="flex items-center gap-6 p-6 bg-white rounded-2xl shadow mb-6 ">
                {player.image && (
                    <Image
                        src={player.image}
                        alt={`${player.first_name} ${player.last_name}`}
                        width={96} // 24 * 4 (tailwind w-24 = 6rem = 96px)
                        height={96}
                        className="w-24 h-24 object-cover rounded-full border-4 border-gray-200 shadow"
                    />
                )}
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Player History</h1>
                    <p className="text-xl font-medium text-gray-600">
                        {player.first_name} {player.last_name}
                    </p>
                </div>
            </div>

            {/* Player Info Card */}
            <div className="p-6 max-w-7xl mx-auto space-y-8">


                <div className="bg-white shadow-md rounded-2xl p-6 grid grid-cols-2 md:grid-cols-2 gap-4 text-sm border border-gray-200">
                    {/* <div>
          <strong className="text-gray-500">Name:</strong> {player.first_name} {player.last_name}
        </div> */}
                    <div>
                        <strong className="text-gray-500">Position:</strong> {player.position}
                    </div>
                    <div>
                        <strong className="text-gray-500">Grade Level:</strong> {player.grade_level || 'N/A'}
                    </div>
                    <div>
                        <strong className="text-gray-500">Location:</strong> {player.location || 'N/A'}
                    </div>
                    <div>
                        <strong className="text-gray-500">Height:</strong> {player.height || 'N/A'}
                    </div>
                    <div>
                        <strong className="text-gray-500">Weight:</strong> {player.weight || 'N/A'}
                    </div>
                    <div>
                        <strong className="text-gray-500">Jersey Number:</strong> {player.jersey || 'N/A'}
                    </div>
                    <div>
                        <strong className="text-gray-500">Birthday:</strong> {new Date(player.birthday).toLocaleDateString()}
                    </div>
                    <div>
                        <strong className="text-gray-500">Graduation:</strong> {player.graduation || 'N/A'}
                    </div>
                    <div>
                        <strong className="text-gray-500">Birth Year:</strong> {player.birth_year || 'N/A'}
                    </div>
                    <div>
                        <strong className="text-gray-500">Age Group:</strong> {player.age_group || 'N/A'}
                    </div>
                    <div>
                        <strong className="text-gray-500">Status:</strong>
                        <span className={`ml-2 px-2 py-1 rounded-full text-white text-xs ${player.status === 'Active' ? 'bg-green-500' : 'bg-yellow-500'}`}>
                            {player.status}
                        </span>
                    </div>
                    <div>
                        <strong className="text-gray-500">Coach:</strong>{' '}
                        {player.coachName ? `${player.coachName} ${player.coachLastName}` : '—'}
                    </div>
                    <div>
                        <strong className="text-gray-500">Enterprise:</strong> {player.enterpriseName || '—'}
                    </div>
                </div>
            </div>
            {/* Evaluations */}
            <section className="p-6 max-w-7xl mx-auto space-y-8">
                <h2 className="text-2xl font-semibold mb-4">Evaluations</h2>
                <div className="overflow-x-auto bg-white shadow-md rounded-2xl border border-gray-200">
                    {evaluations.length === 0 ? (
                        <p className="p-6 text-gray-600">No evaluations found.</p>
                    ) : (
                        <table className="w-full text-sm text-left border-collapse">
                            <thead className="bg-gray-50 border-b text-gray-700 uppercase text-xs">
                                <tr>
                                    <th className="px-4 py-3">Title</th>
                                    <th className="px-4 py-3">Video</th>
                                    <th className="px-4 py-3">Jersey</th>
                                    <th className="px-4 py-3">Color</th>
                                    <th className="px-4 py-3">Position</th>
                                    <th className="px-4 py-3">Status</th>
                                    <th className="px-4 py-3">Turnaround</th>
                                    <th className="px-4 py-3">Payment</th>
                                    <th className="px-4 py-3">Rating</th>
                                    <th className="px-4 py-3">Remarks</th>
                                    <th className="px-4 py-3">Created At</th>
                                </tr>
                            </thead>
                            <tbody>
                                {evaluations.map((ev: Evaluation) => (
                                    <tr key={ev.id} className="hover:bg-gray-50 border-b">
                                        <td className="px-4 py-3">{ev.review_title}</td>
                                        <td className="px-4 py-3">
                                            <a
                                                href={ev.primary_video_link}
                                                className="text-blue-600 hover:underline"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                Watch
                                            </a>
                                        </td>
                                        <td className="px-4 py-3">{ev.jerseyNumber}</td>
                                        <td className="px-4 py-3">{ev.jerseyColorOne}</td>
                                        <td className="px-4 py-3">{ev.positionOne}</td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-1 text-xs rounded-full font-medium text-white ${ev.status === 2 ? 'bg-green-500' : 'bg-yellow-500'
                                                }`}>
                                                {ev.status === 2 ? 'Completed' : 'Pending'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">{ev.turnaroundTime}</td>
                                        <td className="px-4 py-3">{ev.payment_status}</td>
                                        <td className="px-4 py-3">{ev.rating ?? 'N/A'}</td>
                                        <td className="px-4 py-3">{ev.remarks ?? '—'}</td>
                                        <td className="px-4 py-3">{new Date(ev.created_at).toLocaleDateString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </section>

            {/* Earnings */}
            <section className="p-6 max-w-7xl mx-auto space-y-8">
                <h2 className="text-2xl font-semibold mb-4">Earnings</h2>
                <div className="overflow-x-auto bg-white shadow-md rounded-2xl border border-gray-200">
                    {earnings.length === 0 ? (
                        <p className="p-6 text-gray-600">No earnings found.</p>
                    ) : (
                        <table className="w-full text-sm text-left border-collapse">
                            <thead className="bg-gray-50 border-b text-gray-700 uppercase text-xs">
                                <tr>
                                    <th className="px-4 py-3">Title</th>
                                    <th className="px-4 py-3">Amount</th>
                                    <th className="px-4 py-3">Commission</th>
                                    <th className="px-4 py-3">Discount</th>
                                    <th className="px-4 py-3">Coupon</th>
                                    <th className="px-4 py-3">Status</th>
                                    <th className="px-4 py-3">Created</th>
                                </tr>
                            </thead>
                            <tbody>
                                {earnings.map((e: Earnings) => (
                                    <tr key={e.id} className="hover:bg-gray-50 border-b">
                                        <td className="px-4 py-3">{e.evaluation_title}</td>
                                        <td className="px-4 py-3">${e.company_amount}</td>
                                        <td className="px-4 py-3">${e.commision_amount} ({e.commision_rate}%)</td>
                                        <td className="px-4 py-3">${e.discount_amount}</td>
                                        <td className="px-4 py-3">{e.coupon}</td>
                                        <td className="px-4 py-3">{e.status}</td>
                                        <td className="px-4 py-3">{new Date(e.created_at).toLocaleDateString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </section>

            {/* Payments */}
            <section className="p-6 max-w-7xl mx-auto space-y-8">
                <h2 className="text-2xl font-semibold mb-4">Payments</h2>
                <div className="overflow-x-auto bg-white shadow-md rounded-2xl border border-gray-200">
                    {payments.length === 0 ? (
                        <p className="p-6 text-gray-600">No payments found.</p>
                    ) : (
                        <table className="w-full text-sm text-left border-collapse">
                            <thead className="bg-gray-50 border-b text-gray-700 uppercase text-xs">
                                <tr>
                                    <th className="px-4 py-3">Amount</th>
                                    <th className="px-4 py-3">Status</th>
                                    <th className="px-4 py-3">Currency</th>
                                    <th className="px-4 py-3">Info</th>
                                    <th className="px-4 py-3">Description</th>
                                    <th className="px-4 py-3">Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {payments.map((p: Payment) => (
                                    <tr key={p.id} className="hover:bg-gray-50 border-b">
                                        <td className="px-4 py-3">${p.amount}</td>
                                        <td className="px-4 py-3">{p.status}</td>
                                        <td className="px-4 py-3">{p.currency}</td>
                                        <td className="px-4 py-3">{p.payment_info}</td>
                                        <td className="px-4 py-3">{p.description}</td>
                                        <td className="px-4 py-3">{new Date(p.created_at).toLocaleDateString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </section>

            {/* Evaluation Results */}
            <section className="p-6 max-w-7xl mx-auto space-y-8">
                <h2 className="text-2xl font-semibold text-gray-800">Evaluation Results</h2>
                <div className="overflow-x-auto bg-white shadow-md rounded-2xl border border-gray-200">
                    {evaluationResults.length === 0 ? (
                        <p className="p-6 text-gray-600">No evaluation results found.</p>
                    ) : (
                        <table className="w-full text-sm text-left border-collapse">
                            <thead className="bg-gray-50 border-b text-gray-700 uppercase text-xs">
                                <tr>
                                    <th className="px-4 py-3">Final Remarks</th>
                                    <th className="px-4 py-3">Physical</th>
                                    <th className="px-4 py-3">Technical</th>
                                    <th className="px-4 py-3">Tactical</th>
                                    <th className="px-4 py-3">Distribution</th>
                                    <th className="px-4 py-3">Organization</th>
                                    <th className="px-4 py-3">Work On</th>
                                    <th className="px-4 py-3">Sport</th>
                                    <th className="px-4 py-3">Created At</th>
                                </tr>
                            </thead>
                            <tbody>
                                {evaluationResults.map((r: EvaluationResult) => (
                                    <tr key={r.id} className="hover:bg-gray-50 border-b">
                                        <td className="px-4 py-3">{r.finalRemarks ?? '—'}</td>
                                        <td className="px-4 py-3">{r.physicalScores ?? '—'}</td>
                                        <td className="px-4 py-3">{r.technicalScores ?? '—'}</td>
                                        <td className="px-4 py-3">{r.tacticalScores ?? '—'}</td>
                                        <td className="px-4 py-3">{r.distributionScores ?? '—'}</td>
                                        <td className="px-4 py-3">{r.organizationScores ?? '—'}</td>
                                        <td className="px-4 py-3">{r.thingsToWork ?? '—'}</td>
                                        <td className="px-4 py-3">
                                            <span className="inline-block bg-blue-100 text-blue-700 text-xs font-medium px-2 py-1 rounded-full">
                                                {r.sport ?? '—'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">{new Date(r.created_at).toLocaleDateString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </section>


        </div>
    );
}
