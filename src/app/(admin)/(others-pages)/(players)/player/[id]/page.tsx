'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { FacebookIcon, Instagram, Youtube, Linkedin, Twitter } from "lucide-react";

import { NEXT_PUBLIC_AWS_S3_BUCKET_LINK } from '@/lib/constants';
// import { FaTwitter, FaFacebookF, FaInstagram, FaLinkedinIn, FaYoutube } from 'react-icons/fa';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import Loading from '@/components/Loading';
import { useRoleGuard } from '@/hooks/useRoleGaurd';
import TopEvaluationBadges from '@/components/TopEvaluationBadges';
// import { useRouter } from 'next/navigation';
interface Player {
    sportName: string;
    overallAverage: number;
    latestLoginIp: string;
    id: number;
    first_name: string;
    email: string;
    last_name: string;
    image: string | null;
    position: string;
    grade_level: string | null;
    location: string | null;
    height: string | null;
    weight: string | null;
    jersey: string | null;
    birthday: string;
    league: string;
    sport: string;
    gender: string;
    city: string;
    country: string;
    state: string;
    gpa: string;
    team: string;
    graduation: string | null;
    birth_year: string | null;
    age_group: string | null;
    status: string;
    coachName: string | null;
    coachLastName: string | null;
    enterpriseName: string | null;
    facebook: string,
    instagram: string,
    linkedin: string,
    xlink: string,
    youtube: string,
    countryName: string;
    countrycode: string;
    earnings: number;

}
interface Coach {
  sportName: string;
  approved_or_denied: number;
  verified: number;
  latestLoginIp: string;
  id: number;
  first_name: string;
  last_name: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  gender: string;
  country: string;
  state: string;
  city: string;
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
  clubName: string;
  license_type: string;
  facebook: string;
  instagram: string;
  linkedin: string;
  xlink: string;
  youtube: string;
  cv: string;
  license: string;
  countryName: string;
  countrycode: string;
}

interface Earnings {
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
    playerFirstName: string;
    playerLastName: string;
    review_title: string;
    player_id: string;
    evaluation_id: number;
    amount: number;
    payment_info: string;
    status: string;
    currency: string;
    description: string;
    created_at: string;
    is_deleted: number;
    payment_id: number;
}

interface Evaluation {
    id: string;
    evaluationId: number;
    player_id: number;
    playerSlug: string;
    playerFirstName: string;
    first_name: string;
    last_name: string;
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
    is_deleted: number;
    Coachname?: string;
  coachLastname?: string;
  image?: string | null;
  coachId?:number;
  coachImage?: string | null;

}

export default function PlayerDetailPage() {
    useRoleGuard();

    const { id } = useParams();
    const [data, setData] = useState<{
        view_finance: number;
        player: Player;
        coach:Coach;
        evaluations: Evaluation[];
        earnings: Earnings[];
        payments: Payment[];
        evaluationResults: EvaluationResult[];
        latestLoginIp: string | null;

    } | null>(null);
    // const [isHiding, setIsHiding] = useState(false);
    // const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [evaluationPage, setEvaluationPage] = useState(1);
    const [paymentPage, setPaymentPage] = useState(1);
    const evaluationsPerPage = 10;
    const paymentsPerPage = 10;
    // const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
    const MySwal = withReactContent(Swal);
    //   const [payments, setPayments] = useState<Payment[]>([]);
    const [overallAverage, setOverallAverage] = useState<number | null>(null);

    useEffect(() => {
        const playerId = data?.player?.id;
        console.log("playerId:", playerId);

        // Agar playerId undefined/null hai to return
        if (!playerId) {
            setOverallAverage(null); // reset previous value
            return;
        }

        const fetchAverage = async () => {
            try {
                const res = await fetch(`/api/evaluations/overallaverage/${playerId}`);
                const json = await res.json();

                if (json.overallAverage !== undefined && json.overallAverage !== null) {
                    setOverallAverage(Number(json.overallAverage));
                } else {
                    setOverallAverage(null);
                }
            } catch (err) {
                console.error("Error fetching overall average:", err);
                setOverallAverage(null);
            }
        };

        fetchAverage();
    }, [data?.player]);


    const filteredEvaluations = data?.evaluations || [];
    const paginatedEvaluations = filteredEvaluations.slice(
        (evaluationPage - 1) * evaluationsPerPage,
        evaluationPage * evaluationsPerPage
    );

    const paginatedPayments: Payment[] = (data?.payments ?? []).slice(
        (paymentPage - 1) * paymentsPerPage,
        paymentPage * paymentsPerPage
    );
    const totalPaymentPages = paymentsPerPage > 0
        ? Math.ceil((data?.payments?.length ?? 0) / paymentsPerPage)
        : 0;

    const totalEvaluationPages = Math.ceil(filteredEvaluations.length / evaluationsPerPage);


    const handleHide = async (id: number) => {
        const result = await MySwal.fire({
            title: 'Are you sure?',
            text: 'This evaluation will be hidden.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, hide it!',
            cancelButtonText: 'Cancel',
        });
        if (result.isConfirmed) {

            if (result.isConfirmed) {
                const res = await fetch(`/api/player/${id}`, { method: 'DELETE' });
                if (res.ok) {
                    const { newStatus } = await res.json();

                    MySwal.fire('Hidden!', 'Evaluation has been hidden.', 'success');
                    setData(prev => prev ? {
                        ...prev,
                        evaluations: prev.evaluations.map(ev => ev.evaluationId === id ? { ...ev, is_deleted: newStatus } : ev)
                    } : null);
                } else {
                    MySwal.fire('Error!', 'Failed to hide evaluation.', 'error');
                }
            }
        };
    }
    const handleRevert = async (id: number) => {
        const result = await MySwal.fire({
            title: 'Are you sure?',
            text: 'This will revert the evaluation status.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, revert it!',
            cancelButtonText: 'Cancel',
        });

        if (result.isConfirmed) {
            const res = await fetch(`/api/player/${id}`, { method: 'PATCH' });
            if (res.ok) {
                const { newStatus } = await res.json();

                MySwal.fire('Reverted!', 'Evaluation has been reverted.', 'success');
                setData(prev => prev ? {
                    ...prev,
                    evaluations: prev.evaluations.map(ev => ev.evaluationId === id ? { ...ev, is_deleted: newStatus } : ev)
                } : null);
            } else {
                MySwal.fire('Error!', 'Failed to revert evaluation.', 'error');
            }
        }
    };

    const handleHidePayment = async (id: number) => {
        console.log("evaluation :", id);
        const result = await MySwal.fire({
            title: 'Are you sure?',
            text: 'This payment will be marked as hidden.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, hide it!',
            cancelButtonText: 'Cancel',
        });

        if (result.isConfirmed) {
            try {
                const res = await fetch(`/api/player/${id}`, {
                    method: 'DELETE',
                });

                if (!res.ok) {
                    throw new Error('Failed to hide payment.');
                }

                const { newStatus } = await res.json();

                await MySwal.fire('Hidden!', 'Payment has been hidden.', 'success');
                // window.location.reload();

                setData(prev =>
                    prev
                        ? {
                            ...prev,
                            payments: prev.payments.map(payment =>
                                payment.evaluation_id === id
                                    ? { ...payment, is_deleted: newStatus }
                                    : payment
                            ),
                        }
                        : null
                );
            } catch (error) {
                console.error(error);
                MySwal.fire('Error!', 'Failed to hide payment.', 'error');
            }
        }
    };


    const handleRevertPayment = async (id: number) => {
        console.log("evaluation", id)

        // Ask for confirmation using SweetAlert
        const result = await MySwal.fire({
            title: 'Are you sure?',
            text: 'This will revert the payment status.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, revert it!',
            cancelButtonText: 'Cancel',
        });

        // If confirmed, proceed with API call
        if (result.isConfirmed) {
            try {
                const res = await fetch(`/api/player/${id}`, { method: 'PATCH' });

                if (!res.ok) {
                    throw new Error('Failed to revert payment.');
                }

                const { newStatus } = await res.json();

                // Notify success
                await MySwal.fire('Reverted!', 'Payment status has been reverted.', 'success');
                // window.location.reload();

                // Update local state
                setData(prev =>
                    prev
                        ? {
                            ...prev,
                            payments: prev.payments.map(payment =>
                                payment.evaluation_id === id
                                    ? { ...payment, is_deleted: newStatus }
                                    : payment
                            ),
                        }
                        : null
                );
            } catch (error) {
                console.error(error);
                MySwal.fire('Error!', 'Failed to revert payment.', 'error');
            }
        }
    };


    // const handleEvaluationDetails = (evaluation: Evaluation) => {
    //     router.push(`/evaluationdetails?evaluationId=${evaluation.evaluationId}`);
    // };


    useEffect(() => {
        if (!id) return;

        const fetchPlayerData = async () => {
            try {
                const res = await fetch(`/api/player/${id}`);
                const json = await res.json();
                console.log("playerdata", json);
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

    if (loading) {
        return <Loading />;
    } if (error) return <p className="p-4 text-red-500">{error}</p>;
    if (!data) return <p className="p-4">Player not found.</p>;

    const { player } = data;
//console.log('all palayer data:',data?.player.id);
    const view_finance = Number(sessionStorage.getItem("view_finance") || 0);

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-8">
            <div className="flex flex-col sm:flex-row items-start gap-6 p-4 bg-white rounded-2xl shadow mb-6">
                {player.image && (
                    <Image
                        src={`${NEXT_PUBLIC_AWS_S3_BUCKET_LINK}/${player.image}`}
                        alt={`${player.first_name} ${player.last_name}`}
                        width={96}
                        height={96}
                        className="w-24 h-24 object-cover rounded-full border-4 border-gray-200 shadow"
                    />
                )}
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 whitespace-nowrap">
                        {player.first_name} {player.last_name}
                    </h1>
                    <div className="flex gap-3 mt-2 text-xl text-gray-500">
                        {player.facebook && (
                            <a
                                href={`https://www.facebook.com/${player.facebook}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-700"
                            >
                                <FacebookIcon className="w-6 h-6" />
                            </a>
                        )}
                        {player.instagram && (
                            <a
                                href={`https://www.instagram.com/${player.instagram}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-pink-600 hover:text-red-600"
                            >
                                <Instagram className="w-6 h-6" />
                            </a>
                        )}
                        {player.youtube && (
                            <a
                                href={`https://www.youtube.com/${player.youtube}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-red-600 hover:text-red-800"
                            >
                                <Youtube className="w-6 h-6" />
                            </a>
                        )}
                        {player.linkedin && (
                            <a
                                href={`https://www.linkedin.com/in/${player.linkedin}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800"
                            >
                                <Linkedin className="w-6 h-6" />
                            </a>
                        )}
                        {player.xlink && (
                            <a
                                href={`https://x.com/${player.xlink}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800"
                            >
                                <Twitter className="w-6 h-6" />
                            </a>
                        )}
                    </div>
                </div>
                <div className="w-full flex justify-end ">
                    <div className="flex flex-col items-center bg-gradient-to-r from-blue-500 to-indigo-600 
                    text-white rounded-xl shadow-lg p-4">
                        <p className="text-sm font-medium tracking-wide text-center">Overall Avg</p>
                        <p className="text-2xl font-extrabold text-center">
                            {overallAverage != null ? overallAverage : "N/A"}
                        </p>
                    </div>
                </div>
            </div>


            {/* Player Info Card */}
            <div className="p-6 max-w-7xl mx-auto space-y-8">
                <div className="bg-white shadow-md rounded-2xl p-6 border border-gray-200
                        grid 
                        grid-cols-1       
                        sm:grid-cols-2      
                        md:grid-cols-3     
                        gap-4
                        text-sm">                    {/* <div>
          <strong className="text-gray-500">Name:</strong> {player.first_name} {player.last_name}
        </div> */}
                    <div>
                        <strong className="text-gray-700">Email:</strong> {player.email}
                    </div>
                    <div>
                        <strong className="text-gray-700">Position:</strong> {player.position}
                    </div>
                    <div>
                        <strong className="text-gray-700">Grade Level:</strong> {player.grade_level || 'N/A'}
                    </div>
                    <div>
                        <strong className="text-gray-700">Sport(s):</strong> {player.sportName || 'N/A'}
                    </div>
                    <div>
                        <strong className="text-gray-700">Height:</strong> {player.height || 'N/A'}
                    </div>
                    <div>
                        <strong className="text-gray-700">Weight:</strong> {player.weight || 'N/A'}
                    </div>
                    <div>
                        <strong className="text-gray-700">Jersey Number:</strong> {player.jersey || 'N/A'}
                    </div>
                    <div>
                        <strong className="text-gray-700">Team Name:</strong> {player.team || 'N/A'}
                    </div>
                    <div>
                        <strong className="text-gray-700">League:</strong> {player.league || 'N/A'}
                    </div>

                    <div>
                        <strong className="text-gray-700">GPA:</strong> {player.gpa || 'N/A'}
                    </div>
                    <div>
                        <strong className="text-gray-700">Gender:</strong> {player.gender || 'N/A'}
                    </div>
                    <div>
                        <strong className="text-gray-700">Nationality(ies):</strong> {player.countryName || 'N/A'}
                    </div>
                    <div>
                        <strong className="text-gray-700">State:</strong> {player.state || 'N/A'}
                    </div>
                    <div>
                        <strong className="text-gray-700">City:</strong> {player.city || 'N/A'}
                    </div>
                    <div>
                        <strong className="text-gray-700">Birthday:</strong> {new Date(player.birthday).toLocaleDateString()}
                    </div>
                    <div>
                        <strong className="text-gray-700">Graduation:</strong> {player.graduation || 'N/A'}
                    </div>
                    <div>
                        <strong className="text-gray-700">Birth Year:</strong> {player.birth_year || 'N/A'}
                    </div>
                    <div>
                        <strong className="text-gray-700">Age Group:</strong> {player.age_group || 'N/A'}
                    </div>
                    <div>
                        <strong className="text-gray-700">Status:</strong>
                        <span className={`ml-2 px-2 py-1 rounded-full text-white text-xs ${player.status === 'Active' ? 'bg-green-500' : 'bg-yellow-500'}`}>
                            {player.status}
                        </span>
                    </div>
                    {data?.latestLoginIp && (
                        <div className="mb-2">
                            <strong className="text-gray-700">Latest Login IP:</strong>{" "}
                            <span className="text-black">{data.latestLoginIp}</span>
                        </div>
                    )}

                    {/* <div>
                        <strong className="text-gray-500">Coach:</strong>{' '}
                        {player.coachName ? `${player.coachName} ${player.coachLastName}` : '—'}
                    </div>
                    <div>
                        <strong className="text-gray-500">Enterprise:</strong> {player.enterpriseName || '—'}
                    </div> */}
                </div>
            </div>
            {/* Evaluations */}
            <section className="p-4 max-w-7xl mx-auto space-y-4">
                <h2 className="text-2xl font-semibold mb-4">Evaluation</h2>
                <div className="text-gray-700">


                    Total: {data.evaluations.filter((ev: Evaluation) => ev.status !== 0).length}

                </div>
                <div className="overflow-x-auto bg-white shadow-md rounded-2xl border border-gray-200">
                    {data.evaluations.length === 0 ? (
                        <p className="p-6 text-gray-600">No evaluations found.</p>
                    ) : (
                        <table className="w-full text-sm text-left border-collapse">
                            <thead className="bg-gray-50 border-b text-gray-700 uppercase text-xs">
                                <tr>
                                    <th className="px-4 py-3">Player</th>
                                    <th className="px-4 py-3">Evaluation</th>
                                    <th className="px-4 py-3">Video</th>
                                    <th className="px-4 py-3">Jersey</th>
                                    <th className="px-4 py-3">Status</th>
                                    <th className="px-4 py-3">Turnaround</th>
                                    <th className="px-4 py-3">Payment</th>
                                    <th className="px-4 py-3">Created At</th>
                                    <th className="px-4 py-3">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedEvaluations
                                    // .filter((ev: Evaluation) => ev.status !== 0)
                                    .map((ev: Evaluation) => (

                                        <tr

                                            key={ev.evaluationId}
                                            className={`transition-colors duration-300 ${ev.is_deleted === 0 ? 'bg-red-100' : 'bg-white'
                                                }`}
                                        >
                                            <td className="px-4 py-2 text-gray-700">

                                                <Link href={`/player/${ev.player_id}`} className="text-blue-700 hover:underline">
                                                    {ev.playerFirstName}
                                                </Link>
                                            </td>

                                            <td className="px-4 py-3">
                                                {/* <a onClick={() => handleEvaluationDetails(ev)} href='#' className=' text-blue-700'>{ev.review_title}</a> */}
                                                <Link
                                                    href={`/evaluationdetails?evaluationId=${ev.evaluationId}`}
                                                    className="text-blue-700"
                                                >
                                                    {ev.review_title}
                                                </Link>

                                            </td>
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
                                            <td className="px-4 py-3">
                                                <span className={`px-2 py-1 text-xs rounded-full font-medium text-white ${ev.status === 2 ? 'bg-green-500' : 'bg-yellow-500'
                                                    }`}>
                                                    {ev.status === 2 ? 'Completed' : 'Pending'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">{ev.turnaroundTime}</td>
                                            <td className="px-4 py-3">{ev.payment_status}</td>

                                            <td className="px-4 py-3">{new Date(ev.created_at).toLocaleDateString()}</td>
                                            <td className="px-4 py-3 text-center">


                                                {ev.is_deleted === 0 ? (
                                                    <button
                                                        onClick={() => handleRevert(ev.evaluationId)}
                                                        title="Revert Evaluation"

                                                        style={{
                                                            fontSize: '1.2rem',
                                                            marginRight: '8px',
                                                        }}
                                                    >
                                                        🛑
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => handleHide(ev.evaluationId)}
                                                        title="Hide Evaluation"
                                                        style={{
                                                            fontSize: '1.2rem',
                                                        }}
                                                    >
                                                        ♻️
                                                    </button>
                                                )}

                                            </td>
                                        </tr>
                                    ))}
                            </tbody>
                        </table>
                    )}
                    {/* Pagination */}
                    <div className="flex justify-between items-center p-4 border-t">
                        <button
                            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-sm rounded disabled:opacity-50"
                            onClick={() => setEvaluationPage((prev) => Math.max(prev - 1, 1))}
                            disabled={evaluationPage === 1}
                        >
                            Previous
                        </button>
                        <div className="text-sm text-gray-700">
                            Page {evaluationPage}
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
                <div className="p-2">
                    <h2 className="text-xl font-semibold mb-4">🏅 Top 10 Evaluation Badges</h2>
                    {data?.player?.id && (
  <TopEvaluationBadges playerId={data.player?.id} />
)}

                </div>
            </section>
            {/* Payments */}

            {view_finance === 1 && (

                <section className="p-6 max-w-7xl mx-auto">
                    <h2 className="text-2xl font-semibold mb-4">Payments</h2>
                    <div className='flex justify-between'>

                        <div className="text-gray-700">Total: {data.payments.length}</div>
                        {/* <div className="text-gray-700">
                    Total Earnings: $
                    {coach.payments
                        .filter((p: Payment) => p.is_deleted !== 0)
                        .reduce((sum, p) => sum + Number(p.amount), 0)
                        .toFixed(2)}
                </div> */}
                    </div>
                    <div className="overflow-x-auto bg-white shadow-md rounded-2xl border border-gray-200">
                        {data.payments.length === 0 ? (
                            <p className="p-6 text-gray-600">No payments found.</p>
                        ) : (
                            <>
                                <table className="w-full text-sm text-left border-collapse">
                                    <thead className="bg-gray-50 border-b text-gray-700 uppercase text-xs">
                                        <tr>
                                            <th className="px-4 py-3">Player</th>
                                            <th className="px-4 py-3">Evaluation</th>
                                            <th className="px-4 py-3">Amount</th>
                                            <th className="px-4 py-3">Status</th>
                                            <th className="px-4 py-3">Description</th>
                                            <th className="px-4 py-3">Created At</th>
                                            <th className="px-4 py-3">Action</th>

                                        </tr>
                                    </thead>
                                    <tbody>
                                        {paginatedPayments.map((p: Payment) => (
                                            <tr
                                                key={p.id}
                                                className={`transition-colors duration-300 ${p.is_deleted === 0 ? 'bg-red-100' : 'bg-white'
                                                    }`}
                                            >
                                                <td className="px-4 py-3">{p.playerFirstName}</td>
                                                <td className="px-4 py-3">{p.review_title}</td>
                                                <td className="px-4 py-3">${p.amount}</td>
                                                <td className="px-4 py-3">{p.status}</td>
                                                <td className="px-4 py-3">{p.description}</td>
                                                <td className="px-4 py-3">{new Date(p.created_at).toLocaleDateString()}</td>
                                                <td className="px-4 py-3 text-center flex items-center justify-center gap-2">
                                                    {p.is_deleted === 0 ? (
                                                        <button
                                                            onClick={() => handleRevertPayment(p.evaluation_id)}
                                                            title="Revert Payment"

                                                            style={{
                                                                fontSize: '1.2rem',
                                                                marginRight: '8px',
                                                            }}
                                                        >
                                                            🛑
                                                        </button>
                                                    ) : (
                                                        <button
                                                            onClick={() => handleHidePayment(p.evaluation_id)}
                                                            title="Refund Payment"
                                                            style={{
                                                                fontSize: '1.2rem',
                                                            }}
                                                        >
                                                            ♻️
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {/* Pagination Controls */}
                                <div className="flex justify-between items-center p-4 border-t">
                                    <button
                                        className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-sm rounded disabled:opacity-50"
                                        onClick={() => setPaymentPage((prev) => Math.max(prev - 1, 1))}
                                        disabled={paymentPage === 1}
                                    >
                                        Previous
                                    </button>
                                    <div className="text-sm text-gray-700">
                                        Page {paymentPage}
                                    </div>
                                    <button
                                        className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-sm rounded disabled:opacity-50"
                                        onClick={() => setPaymentPage((prev) => Math.min(prev + 1, totalPaymentPages))}
                                        disabled={paymentPage === totalPaymentPages}
                                    >
                                        Next
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </section >
            )}

        </div >
    );
}
