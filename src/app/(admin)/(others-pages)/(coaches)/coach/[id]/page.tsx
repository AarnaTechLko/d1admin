'use client';
import { FacebookIcon, Instagram, Youtube, Linkedin, Twitter } from "lucide-react";
import { NEXT_PUBLIC_AWS_S3_BUCKET_LINK } from '@/lib/constants';

import { FaFileAlt } from 'react-icons/fa';
// import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import Loading from "@/components/Loading";
import { useRoleGuard } from "@/hooks/useRoleGaurd";

interface Evaluation {
  id: string;
  evaluationId: number;
  player_id: string;
  playerSlug: string;
  playerFirstName: string;
  firstname: string;
  lastname: string;
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
  firstName: string;
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
  id: number;
  playerFirstName: string;
  playerLastName: string;
  playerid: string;
  evaluation_id: number;
  amount: number;
  status: number;
  currency: string;
  created_at: string;
  review_title: string;
  description: string;
  is_deleted: number;
  coach: Coach[];

}
interface Coach {
  latestLoginIp: string;
  id: string;
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

export default function CoachDetailsPage() {
  useRoleGuard();

  const { id } = useParams();
  const [coach, setCoach] = useState<Coach | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);

  const [loading, setLoading] = useState(true);
  // const ITEMSPERPAGE = 10;
  const [evaluationPage, setEvaluationPage] = useState(1);
  const [paymentPage, setPaymentPage] = useState(1);
  const evaluationsPerPage = 10;
  const paymentsPerPage = 10;
  // const router = useRouter();

  const filteredEvaluations = coach?.evaluations || [];

  const paginatedEvaluations = filteredEvaluations.slice(
    (evaluationPage - 1) * evaluationsPerPage,
    evaluationPage * evaluationsPerPage
  );

  const paginatedPayments: Payment[] = (coach?.payments ?? []).slice(
    (paymentPage - 1) * paymentsPerPage,
    paymentPage * paymentsPerPage
  );
  const totalPaymentPages = paymentsPerPage > 0
    ? Math.ceil((coach?.payments?.length ?? 0) / paymentsPerPage)
    : 0;

  const totalEvaluationPages = Math.ceil(filteredEvaluations.length / evaluationsPerPage);
  // const totalPaymentPages = Math.ceil((coach?.payments?.length??0) / paymentsPerPage);
  // const [evaluations, setEvaluations] = useState([]);
  // const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  // const pageSize = 10;
  const MySwal = withReactContent(Swal);
  // const [hiddenEvaluations, setHiddenEvaluations] = useState<Set<number>>(new Set());


  const handleHide = async (id: number) => {
    const result = await MySwal.fire({
      title: 'Are you sure?',
      text: 'This evaluation will be marked as hidden.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, hide it!',
      cancelButtonText: 'Cancel',
    });

    if (result.isConfirmed) {
      const res = await fetch(`/api/coach/${id}`, { method: 'DELETE' });
      if (res.ok) {
        // const { newStatus } = await res.json();
        MySwal.fire('Updated!', 'Evaluation status updated.', 'success');
        setCoach(prev =>
          prev
            ? {
              ...prev,
              evaluations: prev.evaluations.map(ev =>
                ev.evaluationId === id ? { ...ev, is_deleted: 0 } : ev
              ),
            }
            : null
        );
      } else {
        MySwal.fire('Error!', 'Failed to update evaluation.', 'error');
      }
    }
  };

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
      const res = await fetch(`/api/coach/${id}`, { method: 'PATCH' });
      if (res.ok) {
        // const { newStatus } = await res.json();
        MySwal.fire('Updated!', 'Evaluation status updated.', 'success');
        setCoach(prev =>
          prev
            ? {
              ...prev,
              evaluations: prev.evaluations.map(ev =>
                ev.evaluationId === id ? { ...ev, is_deleted: 1 } : ev
              ),
            }
            : null
        );
      } else {
        MySwal.fire('Error!', 'Failed to update evaluation.', 'error');
      }
    }
  };

  const handleHidePayment = async (id: number) => {
    console.log("evaluation:", id)
    const result = await MySwal.fire({
      title: 'Are you sure?',
      text: 'This payment will be marked as hidden.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, hide it!',
      cancelButtonText: 'Cancel',
    });

    if (result.isConfirmed) {
      const res = await fetch(`/api/coach/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        // const { newStatus } = await res.json();
        MySwal.fire('Updated!', 'Payment status updated.', 'success');
        window.location.reload();

        setPayments(prev =>
          prev.map(payment =>
            payment.evaluation_id === id ? { ...payment, is_deleted: 0 } : payment
          )
        );

      } else {
        MySwal.fire('Error!', 'Failed to update payment.', 'error');
      }
    }
  };


  const handleRevertPayment = async (id: number) => {
    const result = await MySwal.fire({
      title: 'Are you sure?',
      text: 'This will revert the payment status.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, revert it!',
      cancelButtonText: 'Cancel',
    });

    if (result.isConfirmed) {
      const res = await fetch(`/api/coach/${id}`, {
        method: 'PATCH',
      });

      if (res.ok) {
        // const { newStatus } = await res.json();
        MySwal.fire('Updated!', 'Payment status reverted.', 'success');
        window.location.reload();

        setPayments(prev =>
          prev.map(payment =>
            payment.evaluation_id === id ? { ...payment, is_deleted: 1 } : payment
          )
        );
      } else {
        MySwal.fire('Error!', 'Failed to revert payment.', 'error');
      }
    }
  };

  const handleDownload = async (url: string) => {
    if (!url || typeof url !== 'string') {
      return;
    }


    try {
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Failed to fetch file: ${response.statusText}`);
      }

      const blob = await response.blob();
      console.log("value:", blob)
      const blobUrl = window.URL.createObjectURL(blob);
      // Extract file extension from URL (strip query params if present)
      const urlWithoutQuery = url.split('?')[0];
      const extensionMatch = urlWithoutQuery.split('.').pop();
      const extension = extensionMatch && extensionMatch.length < 10 ? extensionMatch : 'file';
      const filename = `download.${extension}`;

      // Create and trigger download link
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Cleanup blob URL
      setTimeout(() => {
        window.URL.revokeObjectURL(blobUrl);
      }, 100);
    } catch (error) {
      console.error("Download failed:", error);
      // Optional: display error toast
      // showError("Download failed. Please try again.");
    }


  };

  useEffect(() => {
    async function fetchCoachData() {
      try {
        const res = await fetch(`/api/coach/${id}`);
        const data = await res.json();
        console.log("is_deleted", data)
        setCoach(data);
        setPayments(data.payments || []);

      } catch (err) {
        console.error('Failed to fetch coach data', err);
      } finally {
        setLoading(false);
      }
    }


    fetchCoachData();


  }, [id]);
  if (loading) {
    return <Loading />;
  }
  // if (loading) {
  //   return (
  //     <div className="flex flex-col items-center justify-center p-6 text-center space-y-4">
  //       <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
  //       <div>Loading coach data...</div>
  //     </div>
  //   );
  // }
  if (!coach) return <div className="p-6 text-center text-red-500">Coach not found.</div>;
  const view_finance = Number(sessionStorage.getItem("view_finance") || 0);



const handleCoachApproval = async (coachId: number, isApproved: boolean) => {
  try {
    const response = await fetch(`/api/coach/${coachId}/approval`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ approved: isApproved }),
    });

    if (!response.ok) throw new Error("Failed to update coach status");

    const result = await response.json();

    Swal.fire({
      icon: "success",
      title: "Success",
      text: result.message,
      timer: 2000,
      showConfirmButton: false,
    });

    // Optional: update UI locally
  } catch (error) {
    console.error(error);
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "Something went wrong while updating the coach status.",
    });
  }
};



  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen">
      {/* Header */} <div className="max-w-7xl mx-auto bg-white rounded-2xl shadow p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 p-4 bg-white rounded-2xl shadow">

          {/* Image */}
          <div className="flex-shrink-0">
            {coach.image && (
              <Image
                src={`${NEXT_PUBLIC_AWS_S3_BUCKET_LINK}/${coach.image}`}
                alt={`${coach.firstName} ${coach.lastName}`}
                width={96}
                height={96}
                className="w-30 h-30 object-cover rounded-full border-4 border-gray-200 shadow mx-auto md:mx-0"
              />
            )}
          </div>

          {/* Name + Socials */}
          <div className="flex flex-col items-center md:items-start gap-2 md:flex-1">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 text-center md:text-left">
              {coach.firstName} {coach.lastName}
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 text-center md:text-left">
              {coach.clubName}
            </p>

            <div className="flex gap-3 mt-2 text-lg sm:text-xl text-gray-500">
              <a
                href={coach.facebook || "#"}
                target="_blank"
                rel="noopener noreferrer"
                className={!coach.facebook ? "text-gray-400 cursor-default" : "text-blue-600 hover:text-blue-700"}
              >
                <FacebookIcon className="w-6 h-6" />
              </a>
              <a
                href={coach.instagram || "#"}
                target="_blank"
                rel="noopener noreferrer"
                className={!coach.instagram ? "text-gray-400 cursor-default" : "text-pink-600 hover:text-red-600"}
              >
                <Instagram className="w-6 h-6" />
              </a>
              <a
                href={coach.youtube || "#"}
                target="_blank"
                rel="noopener noreferrer"
                className={!coach.youtube ? "text-gray-400 cursor-default" : "text-red-600 hover:text-red-800"}
              >
                <Youtube className="w-6 h-6" />
              </a>
              <a
                href={coach.linkedin || "#"}
                target="_blank"
                rel="noopener noreferrer"
                className={!coach.linkedin ? "text-gray-400 cursor-default" : "text-blue-600 hover:text-blue-800"}
              >
                <Linkedin className="w-6 h-6" />
              </a>
              <a
                href={coach.xlink || "#"}
                target="_blank"
                rel="noopener noreferrer"
                className={!coach.xlink ? "text-gray-400 cursor-default" : "text-blue-600 hover:text-blue-800"}
              >
                <Twitter className="w-6 h-6" />
              </a>
            </div>
          </div>

          {/* Download Buttons */}
          <div className="flex flex-col items-center sm:items-end lg:items-end space-y-2">
            <div className="flex space-x-2">
              <button
                className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 transition"
                onClick={() => handleCoachApproval(Number(coach.id), true)}
              >
                Approve
              </button>
              <button
                className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition"
                onClick={() => handleCoachApproval(Number(coach.id), false)}
              >
                Decline
              </button>
            </div>
            <button
              className="flex items-center space-x-2 text-sm md:text-base lg:text-sm text-gray-700 hover:text-blue-600 transition"
              onClick={() => handleDownload(coach.cv)}
            >
              <FaFileAlt className="text-blue-500" />
              <span>Download CV</span>
            </button>
            <button
              className="flex items-center space-x-2 text-sm md:text-base lg:text-sm text-gray-700 hover:text-blue-600 transition"
              onClick={() => handleDownload(coach.license)}
            >
              <FaFileAlt className="text-blue-500" />
              <span>Download Coaching License</span>
            </button>
          </div>



        </div>

      </div>


      {/* Coach Info Card */}
      <div className="bg-white shadow-md rounded-2xl p-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm border border-gray-200">
        {/* <div><strong className="text-gray-500">Name:</strong> {coach.firstName} {coach.lastName}</div> */}
        <div><strong className="text-gray-700">Email:</strong> {coach.email}</div>
        <div><strong className="text-gray-700">Phone:</strong> {coach.countrycode}{coach.phoneNumber}</div>
        <div><strong className="text-gray-700">Gender:</strong> {coach.gender}</div>
        <div><strong className="text-gray-700">Sport:</strong> {coach.sport}</div>
        <div><strong className="text-gray-700">City:</strong> {coach.city}</div>
        <div><strong className="text-gray-700">State:</strong> {coach.state}</div>
        <div><strong className="text-gray-700">Country:</strong> {coach.countryName}</div>
        <div><strong className="text-gray-700">Status:</strong>
          <span className={`ml-2 px-2 py-1 rounded-full text-white text-xs ${coach.status === 'active' ? 'bg-green-500' : 'bg-yellow-500'}`}>
            {coach.status}
          </span>
        </div>
        <div><strong className="text-gray-700">Coaching License Type:</strong> {coach.license_type}</div>
        {/* <div><strong className="text-gray-500">Consumed Licenses:</strong> {coach.consumeLicenseCount}</div> */}
        {/* <div><strong className="text-gray-500">Assigned Licenses:</strong> {coach.assignedLicenseCount}</div> */}
        <div><strong className="text-gray-700">Total Earnings:</strong><span className='ml-2 px-2 py-1 rounded-full  text-xs bg-blue-200 '>
          ${coach.payments.filter((p: Payment) => p.is_deleted !== 0)
            .reduce((sum, p) => sum + Number(p.amount), 0)
            .toFixed(2)}</span></div>
        <div><strong className="text-gray-700">Qualifications:</strong> {coach.qualifications}</div>
        {coach?.latestLoginIp && (
          <div className="mb-2">
            <strong className="text-gray-700">Latest Login IP:</strong>{" "}
            <span className="text-black">{coach.latestLoginIp}</span>
          </div>
        )}
      </div>
      <div>  <h2 className="text-lg font-semibold mt-5  bg-customBlue text-black p-4 rounded-lg">
        Background
      </h2>
        <section className="bg-white p-6 border mb-4 rounded-lg shadow-md transform transition-all duration-300 hover:shadow-lg animate-fadeInDelay">

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* First Column: Qualifications */}
            <div>
              {/* <h3 className="text-lg font-semibold mb-2">Background</h3> */}
              <p className="text-gray-700">
                {coach.qualifications}
              </p>
            </div>
            <div>
              {/* <h3 className="text-lg font-semibold mb-2">Background</h3> */}

            </div>
          </div>

          {/* Modal */}

        </section>
      </div>




      {/* Evaluations */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Evaluations</h2>
        <div className="text-gray-700">


          Total: {coach.evaluations.filter((ev: Evaluation) => ev.is_deleted !== 0).length}

        </div>


        <div className="overflow-x-auto bg-white shadow-md rounded-2xl border border-gray-200">
          {coach.evaluations.length === 0 ? (
            <p className="p-6 text-gray-600">No evaluations found.</p>
          ) : (
            <table className="w-full text-sm text-left border-collapse">
              <thead className="bg-gray-50 border-b text-gray-700 uppercase text-xs">
                <tr>
                  <th className="px-4 py-3">coach</th>
                  <th className="px-4 py-3">Title</th>
                  <th className="px-4 py-3">Video</th>
                  <th className="px-4 py-3">Jersey</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Turnaround</th>
                  <th className="px-4 py-3">Payment</th>
                  <th className="px-4 py-3">Created At</th>
                  <th className="px-4 py-3 text-center">Action</th>

                </tr>
              </thead>
              <tbody>
                {paginatedEvaluations
                  //  .filter((ev: Evaluation) => ev.status !== 0) 
                  .map((ev: Evaluation) => (
                    <tr
                      key={ev.evaluationId}
                      className={`transition-colors duration-300 ${ev.is_deleted === 0 ? 'bg-red-100' : ev.is_deleted === 1 ? 'bg-white' : ''}`}

                    >


                      <td className="px-4 py-2 text-gray-700">
                        <Link href={`/coach/${ev.player_id}`} className="text-blue-700 hover:underline">

                          {/* <Link href={`/coach/${ev.player_id}`} target="_blank" className="text-blue-700 hover:underline"> */}
                          {ev.firstName}
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        {/* <Link href={`/coach/${ev.player_id}`} className="text-blue-700 hover:underline"> */}
                        {/* <a onClick={() => handleEvaluationDetails(ev)} href='#' className=' text-blue-700'>{ev.review_title}</a> */}

                        <Link
                          href={`/evaluationdetails?evaluationId=${ev.evaluationId}`}
                          className="text-blue-700"
                        >
                          {ev.review_title}
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        <a href={ev.primary_video_link} className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">
                          Watch
                        </a>
                      </td>
                      <td className="px-4 py-3">{ev.jerseyNumber}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 text-xs rounded-full font-medium text-white ${ev.status === 2 ? 'bg-green-500' : 'bg-gray-400'}`}>
                          {ev.status === 2 ? 'Completed' : 'Pending'}
                        </span>
                      </td>
                      <td className="px-4 py-3">{ev.turnaroundTime} mins</td>
                      <td className="px-4 py-3">{ev.payment_status}</td>
                      <td className="px-4 py-3">{new Date(ev.created_at).toLocaleDateString()}</td>
                      <td className="px-4 py-3 text-center flex items-center justify-center gap-2">


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
      </section >

      {/* Payments */}


      {view_finance === 1 && payments.length > 0 && (

        < section className="p-6 max-w-7xl mx-auto space-y-8" >

          <h2 className="text-2xl font-semibold mb-4">Payments</h2>
          <div className='flex justify-between'>
            <div className="text-gray-700">Total: {coach.payments.filter((p: Payment) => p.is_deleted !== 0).length}</div>
            {/* Total: {coach.evaluations.filter((ev: Evaluation) => ev.is_deleted !== 0).length} */}


            <div className="text-gray-700">
              Total Earnings: $
              {coach.payments
                .filter((p: Payment) => p.is_deleted !== 0)
                .reduce((sum, p) => sum + Number(p.amount), 0)
                .toFixed(2)}
            </div>            </div>
          <div className="overflow-x-auto bg-white shadow-md rounded-2xl border border-gray-200">
            {coach.payments.length === 0 ? (
              <p className="p-6 text-gray-600">No payments found.</p>
            ) : (
              <>
                <table className="w-full text-sm text-left border-collapse">
                  <thead className="bg-gray-50 border-b text-gray-700 uppercase text-xs">
                    <tr>
                      <th className="px-4 py-3">coach</th>
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
                      // <tr key={p.id} className="hover:bg-gray-50 border-b">
                      <tr
                        key={p.evaluation_id}
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
                              title="Hide Payment"
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
