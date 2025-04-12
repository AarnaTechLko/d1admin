'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';

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
  
  interface EvaluationResult {
    id: string;
    finalRemarks?: string;
    sport?: string;
    physicalScores: number;
    technicalScores: number;
    tacticalScores: number;
    created_at: string;
  }
  
  interface Payment {
    id: string;
    player_id: string;
    evaluation_id: string;
    amount: number;
    status: string;
    currency: string;
    created_at: string;
  }
  
  interface Coach {
    id: string;
    first_name: string;
    last_name: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    sport: string;
    status: string;
    qualifications: string;
    consumeLicenseCount: number;
    assignedLicenseCount: number;
    earnings: number;
    image?: string;
    evaluations: Evaluation[];
    evaluationResults: EvaluationResult[];
    payments: Payment[];
  }
  

export default function CoachDetailsPage() {
    const { id } = useParams();
    const [coach, setCoach] = useState<Coach | null>(null);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 10;

    const paginatedPayments = coach?.payments?.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    ) ?? [];

    const totalPages = Math.ceil(coach?.payments?.length ?? 0 / ITEMS_PER_PAGE) || 1;
    const EVALUATIONS_PER_PAGE = 10;
    const RESULTS_PER_PAGE = 10;

    const [evaluationPage, setEvaluationPage] = useState(1);
    const [resultsPage, setResultsPage] = useState(1);

    const paginatedEvaluations = coach?.evaluations?.slice(
        (evaluationPage - 1) * EVALUATIONS_PER_PAGE,
        evaluationPage * EVALUATIONS_PER_PAGE
    ) ?? [];

    const paginatedResults = coach?.evaluationResults?.slice(
        (resultsPage - 1) * RESULTS_PER_PAGE,
        resultsPage * RESULTS_PER_PAGE
    ) ?? [];

    const totalEvaluationPages = Math.ceil(coach?.evaluations?.length ?? 0 / EVALUATIONS_PER_PAGE) || 1;
    const totalResultsPages = Math.ceil(coach?.evaluationResults?.length ?? 0 / RESULTS_PER_PAGE) || 1;



    useEffect(() => {
        async function fetchCoachData() {
            try {
                const res = await fetch(`/api/coach/${id}`);
                const data = await res.json();
                setCoach(data);
            } catch (err) {
                console.error('Failed to fetch coach data', err);
            } finally {
                setLoading(false);
            }
        }

        fetchCoachData();
    }, [id]);

    if (loading) return <div className="p-6 text-center">Loading coach data...</div>;
    if (!coach) return <div className="p-6 text-center text-red-500">Coach not found.</div>;

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-8">
            {/* Header */}
            <div className="p-6 max-w-7xl mx-auto space-y-8">
                <div className="flex items-center gap-6 p-6 bg-white rounded-2xl shadow mb-6 ">
                    {coach.image && (
                        <Image
                            src={coach.image}
                            alt={`${coach.first_name} ${coach.last_name}`}
                            width={96} // 24 * 4 (tailwind w-24 = 6rem = 96px)
                            height={96}
                            className="w-24 h-24 object-cover rounded-full border-4 border-gray-200 shadow"
                        />
                    )}
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">Player History</h1>
                        <p className="text-xl font-medium text-gray-600">
                            {coach.firstName} {coach.lastName}
                        </p>
                    </div>
                </div>
                {/* Coach Info Card */}
                <div className="bg-white shadow-md rounded-2xl p-6 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm border border-gray-200">
                    {/* <div><strong className="text-gray-500">Name:</strong> {coach.firstName} {coach.lastName}</div> */}
                    <div><strong className="text-gray-500">Email:</strong> {coach.email}</div>
                    <div><strong className="text-gray-500">Phone:</strong> {coach.phoneNumber}</div>
                    <div><strong className="text-gray-500">Sport:</strong> {coach.sport}</div>
                    <div><strong className="text-gray-500">Status:</strong>
                        <span className={`ml-2 px-2 py-1 rounded-full text-white text-xs ${coach.status === 'active' ? 'bg-green-500' : 'bg-yellow-500'}`}>
                            {coach.status}
                        </span>
                    </div>
                    <div><strong className="text-gray-500">Qualifications:</strong> {coach.qualifications}</div>
                    <div><strong className="text-gray-500">Consumed Licenses:</strong> {coach.consumeLicenseCount}</div>
                    <div><strong className="text-gray-500">Assigned Licenses:</strong> {coach.assignedLicenseCount}</div>
                    <div><strong className="text-gray-500">Total Earnings:</strong> ${coach.earnings}</div>
                </div>
            </div>

            {/* Evaluations */}
            <section className="p-6 max-w-7xl mx-auto space-y-8">
                <h2 className="text-2xl font-semibold mb-4">Evaluations</h2>
                <div className="overflow-x-auto bg-white shadow-md rounded-2xl border border-gray-200">
                    {coach.evaluations.length === 0 ? (
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
                                {paginatedEvaluations.map((ev: Evaluation) => (
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
                                            <span className={`px-2 py-1 text-xs rounded-full font-medium text-white ${ev.status === 2 ? 'bg-green-500' : 'bg-gray-400'
                                                }`}>
                                                {ev.status === 2 ? 'Completed' : 'Pending'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">{ev.turnaroundTime} mins</td>
                                        <td className="px-4 py-3">{ev.payment_status}</td>
                                        <td className="px-4 py-3">{ev.rating ?? '—'}</td>
                                        <td className="px-4 py-3">{ev.remarks ?? '—'}</td>
                                        <td className="px-4 py-3">{new Date(ev.created_at).toLocaleDateString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                            </table>
                    )}
                            <div className="flex justify-between items-center p-4 border-t">
                                <button
                                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-sm rounded disabled:opacity-50"
                                    onClick={() => setEvaluationPage((prev) => Math.max(prev - 1, 1))}
                                    disabled={evaluationPage === 1}
                                >
                                    Previous
                                </button>

                                <div className="text-sm text-gray-700">
                                    Page {evaluationPage} of {totalEvaluationPages}
                                </div>
                                <button
                                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-sm rounded disabled:opacity-50"
                                    onClick={() => setEvaluationPage((prev) => Math.min(prev + 1, totalEvaluationPages))}
                                    disabled={evaluationPage === totalEvaluationPages}
                                >
                                    Next
                                </button>
                            </div>

                    
                </div>
            </section>

            {/* Evaluation Results */}
            <section className="p-6 max-w-7xl mx-auto space-y-8">
                <h2 className="text-2xl font-semibold mb-4">Evaluation Results</h2>
                <div className="overflow-x-auto bg-white shadow-md rounded-2xl border border-gray-200">
                    {coach.evaluationResults.length === 0 ? (
                        <p className="p-6 text-gray-600">No evaluation results found.</p>
                    ) : (
                        <table className="w-full text-sm text-left border-collapse">
                            <thead className="bg-gray-50 border-b text-gray-700 uppercase text-xs">
                                <tr>
                                    <th className="px-4 py-3">Final Remarks</th>
                                    <th className="px-4 py-3">Sport</th>
                                    <th className="px-4 py-3">Physical</th>
                                    <th className="px-4 py-3">Technical</th>
                                    <th className="px-4 py-3">Tactical</th>
                                    <th className="px-4 py-3">Created</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedResults.map((r: EvaluationResult) => (
                                    <tr key={r.id} className="hover:bg-gray-50 border-b">
                                        <td className="px-4 py-3">{r.finalRemarks ?? '—'}</td>
                                        <td className="px-4 py-3">{r.sport ?? '—'}</td>
                                        <td className="px-4 py-3">{r.physicalScores}</td>
                                        <td className="px-4 py-3">{r.technicalScores}</td>
                                        <td className="px-4 py-3">{r.tacticalScores}</td>
                                        <td className="px-4 py-3">{new Date(r.created_at).toLocaleDateString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                            </table>
                    )}
                            <div className="flex justify-between items-center p-4 border-t">
                                <button
                                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-sm rounded disabled:opacity-50"
                                    onClick={() => setResultsPage((prev) => Math.max(prev - 1, 1))}
                                    disabled={resultsPage === 1}
                                >
                                    Previous
                                </button>
                                <div className="text-sm text-gray-700 text-center">
                                    Page {resultsPage} of {totalResultsPages}
                                </div>
                                <button
                                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-sm rounded disabled:opacity-50"
                                    onClick={() => setResultsPage((prev) => Math.min(prev + 1, totalResultsPages))}
                                    disabled={resultsPage === totalResultsPages}
                                >
                                    Next
                                </button>
                            </div>

                        
                </div>
            </section>


            {/* Payments */}
            <section className="p-6 max-w-7xl mx-auto space-y-8">
                <h2 className="text-2xl font-semibold mb-4">Payments</h2>
                <div className="overflow-x-auto bg-white shadow-md rounded-2xl border border-gray-200">
                    {coach.payments.length === 0 ? (
                        <p className="p-6 text-gray-600">No payments found.</p>
                    ) : (
                        <>
                            <table className="w-full text-sm text-left border-collapse">
                                <thead className="bg-gray-50 border-b text-gray-700 uppercase text-xs">
                                    <tr>
                                        <th className="px-4 py-3">Player ID</th>
                                        <th className="px-4 py-3">Evaluation</th>
                                        <th className="px-4 py-3">Amount</th>
                                        <th className="px-4 py-3">Status</th>
                                        <th className="px-4 py-3">Currency</th>
                                        <th className="px-4 py-3">Created</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {paginatedPayments.map((p: Payment) => (
                                        <tr key={p.id} className="hover:bg-gray-50 border-b">
                                            <td className="px-4 py-3">{p.player_id}</td>
                                            <td className="px-4 py-3">{p.evaluation_id}</td>
                                            <td className="px-4 py-3">${p.amount}</td>
                                            <td className="px-4 py-3">{p.status}</td>
                                            <td className="px-4 py-3">{p.currency}</td>
                                            <td className="px-4 py-3">{new Date(p.created_at).toLocaleDateString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {/* Pagination Controls */}
                            <div className="flex justify-between items-center p-4 border-t">
                                <button
                                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-sm rounded disabled:opacity-50"
                                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                                    disabled={currentPage === 1}
                                >
                                    Previous
                                </button>
                                <div className="text-sm text-gray-700">
                                    Page {currentPage} of {totalPages}
                                </div>
                                <button
                                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-sm rounded disabled:opacity-50"
                                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                                    disabled={currentPage === totalPages}
                                >
                                    Next
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </section>
        </div>
    );
}
