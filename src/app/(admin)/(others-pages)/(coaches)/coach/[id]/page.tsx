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
import { FaSpinner } from "react-icons/fa"; // optional: react-icons
import axios from "axios";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";
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
  status: "captured" | "authorized" | "canceled" | "failed" | "refunded";
  currency: string;
  created_at: string;
  review_title: string;
  description: string;
  is_deleted: number;
  coach: Coach[];

}

interface Review {

  id: number,
  player_name: string,
  coach_name: string,
  rating: number,
  title: string,
  comment: string,
  created_at: string,
  evaluationId: number,
  review_status: number,
  player_id: number
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
  reviews: Review[];
}
type RecentMessage = {
  sender_id: string;
  from: string;
  methods: string[];
  id: number;
  message: string;
  created_at: string;
  position: "left" | "right"; // for UI positioning
  bgColor: "green" | "blue";  // for background color
};
export default function CoachDetailsPage() {
  useRoleGuard();

  const [loadingDeclineId, setLoadingDeclineId] = useState<number | null>(null);

  const [loadingId, setLoadingId] = useState<number | null>(null);
  const [selectedCoachid, setSelectedCoachid] = useState<number | null>(null);
  const [refundType, setRefundType] = useState<"full" | "partial" | null>(null);
  const [partialAmount, setPartialAmount] = useState<number>(0);
  const { id } = useParams();
  const [coach, setCoach] = useState<Coach | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [messageText, setMessageText] = useState("");
  const [sendEmail, setSendEmail] = useState(false);
  const [sendSMS, setSendSMS] = useState(false);
  const [sendInternal, setSendInternal] = useState(false);
  const [loading, setLoading] = useState(true);
  // const ITEMSPERPAGE = 10;
  const [evaluationPage, setEvaluationPage] = useState(1);
  const [paymentPage, setPaymentPage] = useState(1);
  const [reviewPage, setReviewPage] = useState(1);
  const [refundDialog, setRefundDialog] = useState(false);

  const [evalId, setEvalId] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeclineModalOpen, setIsDeclineModalOpen] = useState<boolean>(false);
  const [declineMessage, setDeclineMessage] = useState("");
  const [submittingDecline, setSubmittingDecline] = useState(false);
  // const [isVerified, setIsVerified] = useState(coach?.verified === 1);
  const [overallAverage, setOverallAverage] = useState<number | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);

  const [newRating, setNewRating] = useState(0);

  const evaluationsPerPage = 10;
  const paymentsPerPage = 10;
  const reviewsPerPage = 10;

  // const router = useRouter();

  const filteredEvaluations = coach?.evaluations || [];

  const paginatedEvaluations = filteredEvaluations.slice(
    (evaluationPage - 1) * evaluationsPerPage,
    evaluationPage * evaluationsPerPage
  );

  const filteredReviews = coach?.reviews || []

  const paginatedReviews = filteredReviews.slice(
    (reviewPage - 1) * reviewsPerPage,
    reviewPage * reviewsPerPage
  )

  const paginatedPayments: Payment[] = (coach?.payments ?? []).slice(
    (paymentPage - 1) * paymentsPerPage,
    paymentPage * paymentsPerPage
  );
  const totalPaymentPages = paymentsPerPage > 0
    ? Math.ceil((coach?.payments?.length ?? 0) / paymentsPerPage)
    : 0;

  const totalEvaluationPages = Math.ceil(filteredEvaluations.length / evaluationsPerPage);

  const totalReviewPages = Math.ceil(filteredReviews.length / reviewsPerPage)
  const [recentMessages, setRecentMessages] = useState<RecentMessage[]>([]);


  const MySwal = withReactContent(Swal);
  const isVerified = coach?.verified === 1;

  // Handle verify button click
  useEffect(() => {
    if (selectedCoachid) {
      (async () => {
        try {
          const res = await axios.get(`/api/messages?type=coach&id=${selectedCoachid}`);
          setRecentMessages(res.data.messages || []);
        } catch (err) {
          console.error("Error fetching messages:", err);
        }
      })();
    }
  }, [selectedCoachid]);
  const handleVerify = async () => {
    if (!coach?.id) return;

    // Ask confirmation before proceeding
    const confirmResult = await Swal.fire({
      title: "Are you sure?",
      text: "Do you want to verify this coach?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#2563eb",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, verify",
      cancelButtonText: "Cancel",
    });

    if (!confirmResult.isConfirmed) return;

    setLoading(true);

    try {
      const res = await fetch(`/api/coach/verify/${coach.id}`, {
        method: "PATCH",
        credentials: "include",
      });
      if (res.status === 403) {
        Swal.fire({
          icon: "warning",
          title: "Action Denied",
          text: "Only Executive level sub-admin can verify coaches",
          confirmButtonColor: "#2563eb",
        });
        return;
      }

      const data = await res.json();
      console.log("verify response:", data);


      if (!res.ok) throw new Error(data.error || "Failed to verify");

      setCoach((prev) => (prev ? { ...prev, verified: 1 } : prev));

      Swal.fire({
        icon: "success",
        title: "Verified!",
        text: "Coach has been verified successfully.",
        confirmButtonColor: "#2563eb",
      });

    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: (err as Error).message,
        confirmButtonColor: "#2563eb",
      });
    } finally {
      setLoading(false);
    }
  };

  // const handleRefundClick = (payment: Payment) => {
  //   setSelectedPayment(payment);
  //   setRefundDialog(true);
  //   setRefundType(null);
  //   setPartialAmount(0);
  // };

  const handleUnverify = async () => {
    if (!coach?.id) return;

    // First confirmation popup
    const firstConfirm = await Swal.fire({
      title: "Unverify Coach?",
      text: "Are you sure you want to mark this coach as unverified?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33", // red
      cancelButtonColor: "#2563eb", // blue
      confirmButtonText: "Yes, continue",
    });
    if (!firstConfirm.isConfirmed) return;

    // Second confirmation with input
    const secondConfirm = await Swal.fire({
      title: "Type UNVERIFY to confirm",
      input: "text",
      inputPlaceholder: "Type UNVERIFY here",
      inputValidator: (value) => {
        if (value !== "UNVERIFY") {
          return "You must type UNVERIFY to proceed!";
        }
        return null;
      },
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#2563eb",
      confirmButtonText: "Confirm Unverify",
    });

    if (!secondConfirm.isConfirmed || secondConfirm.value !== "UNVERIFY") return;

    setLoading(true);

    try {
      const res = await fetch(`/api/coach/unverify/${coach.id}`, {
        method: "PATCH",
        credentials: "include",
      });
      if (res.status === 403) {
        Swal.fire({
          icon: "warning",
          title: "Action Denied",
          text: "Only Executive level sub-admin can unverify coaches",
          confirmButtonColor: "#2563eb",
        });
        return;
      }
      const data = await res.json();
      console.log("unverify response:", data);
      if (!res.ok) throw new Error(data.error || "Failed to unverify");

      // ✅ Update local state
      setCoach((prev) => (prev ? { ...prev, verified: 0 } : prev));

      Swal.fire({
        icon: "success",
        title: "Unverified!",
        text: "Coach has been marked as unverified successfully.",
        confirmButtonColor: "#2563eb",
      });
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: (err as Error).message,
        confirmButtonColor: "#2563eb",
      });
    } finally {
      setLoading(false);
    }
  };




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

  // const handleEdit = (r: Review) => {
  //   const evalId = coach?.evaluations[r.player_id].evaluationId
  //   if (evalId) {
  //     setEvalId(evalId);
  //   }
  //   setNewTitle(r.title || "");
  //   setNewRating(r?.rating || 0);
  //   setNewComment(r?.comment || "");
  //   setShowModal(true);
  // };
  const handleEdit = (r: Review) => {
    const evalObj = coach?.evaluations?.find(
      (ev) => String(ev.player_id) === String(r.player_id)
    );

    console.log("Found Evaluation:", evalObj);

    const evaluationId =
      evalObj?.evaluationId ??
      evalObj?.evaluationId ??
      evalObj?.id ??
      null;

    if (evaluationId) {
      setEvalId(Number(evaluationId));
    }

    setNewTitle(r.title || "");
    setNewRating(r.rating || 0);
    setNewComment(r.comment || "");
    setShowModal(true);
  };



  const handleDelete = async (r: Review) => {
    if (!r) return;

    // console.log("Status: ", r.review_status);

    const stats = r.review_status === 0 ? 'Visible' : 'Hidden';

    const result = await Swal.fire({
      title: 'Are you sure?',
      text: r.review_status === 0 ? "This will reveal the rating" : "This will hide the rating, not delete it.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: r.review_status === 0 ? 'Yes, reveal it!' : 'Yes, hide it!',
    });

    if (result.isConfirmed) {
      const res = await fetch("/api/review/hide-rating", {
        method: 'PATCH',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: r.id,
          status: stats,
        }),


      });

      if (res.ok) {
        Swal.fire({
          icon: 'success',
          title: r.review_status === 0 ? 'Rating Revealed' : 'Rating Hidden',
          text: r.review_status === 0 ? 'The rating has been revealed successfully.' : 'The rating has been hidden successfully.',
          timer: 2000,
          showConfirmButton: false,
        });
        location.reload();

      } else {
        Swal.fire({
          icon: 'error',
          title: 'Failed to Hide',
          text: 'Failed to hide the rating. Please try again.',
        });
      }
    }
  };

  const submitEdit = async () => {
    if (!evalId) return;
    if (!newRating) {
      Swal.fire({
        icon: "warning",
        title: "Missing Rating",
        text: "Please provide a star rating before saving.",
      });
      return;
    }

    setIsSubmitting(true);

    const evaluationId = String(evalId);

    try {
      const res = await fetch(`/api/evaluationdetails/${evaluationId}/rating`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rating: newRating,
          reviewComment: newComment.trim(),
          reviewTitleCustom: newTitle.trim(),
        }),
      });

      const data = await res.json();
      console.log("PATCH response:", data);

      if (res.ok) {
        setShowModal(false);
        await Swal.fire({
          icon: "success",
          title: "Rating Updated",
          text: "The player rating has been updated successfully.",
          timer: 2000,
          showConfirmButton: false,
        });
        location.reload();
      } else {
        Swal.fire({
          icon: "error",
          title: "Update Failed",
          text: data.error || "Failed to update the rating. Please try again.",
        });
      }
    } catch (error) {
      console.error("Error while updating rating:", error);
      Swal.fire({
        icon: "error",
        title: "Update Failed",
        text: "Something went wrong. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

 
  useEffect(() => {
    async function fetchCoachData() {
      try {
        const res = await fetch(`/api/coach/${id}`);
        const data = await res.json();
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

  useEffect(() => {
    const coachId = coach?.id;
    if (!coachId) {
      setOverallAverage(null); // reset if no coach
      return;
    }

    const fetchAverage = async () => {
      try {
        console.log("Fetching average for coachId:", coachId);
        const res = await fetch(`/api/evaluations/${coachId}`);
        const json = await res.json();
        console.log("API response:", json);

        setOverallAverage(
          json.overallAverage !== undefined && json.overallAverage !== null
            ? Number(json.overallAverage)
            : null
        );
      } catch (err) {
        console.error("Error fetching overall average:", err);
        setOverallAverage(null);
      }
    };

    fetchAverage();
  }, [coach?.id]); // run only when coach.id changes


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


  const handleCoachDecline = async (
    coachId: number,
    action: "decline"
  ) => {

    try {

      setSubmittingDecline(true);

      setLoadingDeclineId(coachId); // ✅ start spinner
      const res = await fetch(`/api/coach/${coachId}/approval`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action, message: declineMessage }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Something went wrong");

      // ✅ SweetAlert
      await Swal.fire({
        icon: "success",
        title: "Coach Declined",
        text: data.message,
        confirmButtonColor: "#28a745",
      });
      window.location.reload();

      // ✅ Update state without refresh
      setCoach((prev) => {
        if (!prev) return prev;
        if (prev.id !== Number(coachId)) return prev;

        return {
          ...prev,
          approved_or_denied: 2,
        };
      });
    }
    catch (err) {

      const message =
        err instanceof Error
          ? err.message
          : typeof err === "string"
            ? err
            : "Something went wrong. Please try again.";

      console.error("Error caught:", err);

      await Swal.fire({
        icon: "error",
        title: "Error",
        text: message,
      });

    } finally {
      setLoadingDeclineId(null); // ✅ stop spinner
      setSubmittingDecline(false);
    }

  }



  const handleCoachApproval = async (
    coachId: number,
    action: "approve"
  ) => {
    try {

      setLoadingId(coachId); // ✅ start spinner
      const res = await fetch(`/api/coach/${coachId}/approval`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action, message: "You have been approved to utilize all the features that D1 Notes has to offer." }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Something went wrong");

      // ✅ SweetAlert
      await Swal.fire({
        icon: "success",
        title: "Coach Approved",
        text: data.message,
        confirmButtonColor: "#28a745",
      });
      window.location.reload();

      // ✅ Update state without refresh
      setCoach((prev) => {
        if (!prev) return prev;
        if (prev.id !== Number(coachId)) return prev;

        return {
          ...prev,
          approved_or_denied: 1,
        };
      });
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : typeof err === "string"
            ? err
            : "Something went wrong. Please try again.";

      console.error("Error caught:", err);

      await Swal.fire({
        icon: "error",
        title: "Error",
        text: message,
      });
    } finally {
      setLoadingId(null); // ✅ stop spinner
    }

  };


  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 bg-gray-50 ">
      {/* Header */} <div className="max-w-7xl mx-auto bg-white rounded-2xl shadow p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 p-4 bg-white rounded-2xl shadow">

          {/* Image */}
          <div className="flex-shrink-0 relative w-24 h-24 mx-auto md:mx-0">
            {coach.image && (
              <Image
                src={`${NEXT_PUBLIC_AWS_S3_BUCKET_LINK}/${coach.image}`}
                alt={`${coach.firstName} ${coach.lastName}`}
                width={96}
                height={96}
                className="w-24 h-24 object-cover rounded-full border-4 border-gray-200 shadow"
              />
            )}

          </div>



          {/* Name + Socials */}
          <div className="flex flex-col items-center md:items-start gap-2 md:flex-1">
            <h1 className="text-xl flex gap-2 sm:text-2xl md:text-3xl font-bold text-gray-800 text-center md:text-left">
              {isVerified && (

                <Image
                  src="/uploads/king_icon.png" // path relative to public folder
                  alt="Verified Crown"
                  width={32} //  adjust size
                  height={32} // adjust size
                  className="object-contain"
                />

              )}
              {coach.firstName} {coach.lastName}
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 text-center md:text-left">
              {coach.clubName}
            </p>

            <div className="flex gap-3 mt-2 text-lg sm:text-xl text-gray-500">
              {coach.facebook && (
                <a
                  href={`https://www.facebook.com/${coach.facebook}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700"
                >
                  <FacebookIcon className="w-6 h-6" />
                </a>
              )}
              {coach.instagram && (
                <a
                  href={'https://www.instagram.com/' + coach.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-pink-600 hover:text-red-600"
                >
                  <Instagram className="w-6 h-6" />
                </a>
              )}
              {coach.youtube && (
                <a
                  href={`https://www.youtube.com/${coach.youtube}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-red-600 hover:text-red-800"
                >
                  <Youtube className="w-6 h-6" />
                </a>
              )}
              {coach.linkedin && (
                <a
                  href={`https://www.linkedin.com/in/${coach.linkedin}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800"
                >
                  <Linkedin className="w-6 h-6" />
                </a>
              )}
              {coach.xlink && (
                <a
                  href={`https://x.com/${coach.xlink}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800"
                >
                  <Twitter className="w-6 h-6" />
                </a>
              )}
            </div>
            <button
              onClick={() => setSelectedCoachid(Number(coach.id))}
              title="Send Message"
              className="bg-blue-500 rounded p-2 m-2 text-white text-sm hover:underline"
            >
              Send Message
            </button>
          </div>
          {/* Download Buttons */}
          <div className="flex flex-col items-center sm:items-end lg:items-end space-y-2">

            <div className="flex space-x-2">
              {coach.approved_or_denied === 0 && (
                <>
                  {/* // ✅ Already approved → show Decline only */}
                  <button
                    className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition flex items-center space-x-2"
                    onClick={() => setIsDeclineModalOpen(true)}
                    disabled={loadingDeclineId === Number(coach.id) || loadingId === Number(coach.id)} // disable button while loading
                  >
                    {loadingDeclineId === Number(coach.id) && <FaSpinner className="animate-spin" />}
                    <span>Deny</span>
                  </button>
                </>
              )}
              {(coach.approved_or_denied === 0 || coach.approved_or_denied === 2) && (

                <>
                  {/* // ✅ Declined or Pending → show Approve only */}
                  <button
                    className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 transition flex items-center space-x-2"
                    onClick={() => handleCoachApproval(Number(coach.id), "approve")}
                    disabled={loadingId === Number(coach.id) || loadingDeclineId === Number(coach.id)} // disable button while loading
                  >
                    {loadingId === Number(coach.id) && <FaSpinner className="animate-spin" />}
                    <span>Approve</span>
                  </button>
                </>
              )}
            </div>

            {/* {!isVerified && (
              <button
                onClick={handleVerify}
                disabled={loading}
                className="mt-2 w-full py-1 px-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded disabled:opacity-50"
              >
                {loading ? "Verifying..." : "Verify"}
              </button>
            )}  */}

            <div className="flex justify-end">
              <div className="flex flex-col items-center justify-center bg-gradient-to-r from-blue-500 to-indigo-600 
                  text-white rounded-full shadow-md px-3 py-2 min-w-[50px]">
                <p className="text-[10px] font-semibold tracking-wide text-center">Avg</p>
                <p className="text-sm font-bold text-center">
                  {overallAverage != null ? overallAverage : "N/A"}
                </p>
              </div>
            </div>

            <button
              onClick={isVerified ? handleUnverify : handleVerify}
              disabled={loading}
              className="mt-2  py-1 px-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded
   disabled:opacity-50"
            >
              {loading ? (isVerified ? "Unverifying..." : "Verifying...") : isVerified ? "Unverify" : "Verify"}
            </button>



            {coach.cv ? (
              <a
                href={`${NEXT_PUBLIC_AWS_S3_BUCKET_LINK}/${coach.cv}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 text-sm md:text-base lg:text-sm text-gray-700 hover:text-blue-600 transition"
              >
                <FaFileAlt className="text-blue-500" />
                <span>View Resume</span>
              </a>
            ) : (
              <span className="flex items-center space-x-2 text-sm md:text-base lg:text-sm text-gray-400">
                <FaFileAlt className="text-gray-400" />
                <span>No CV uploaded</span>
              </span>
            )}
            {coach.license ? (
              <a
                href={`${NEXT_PUBLIC_AWS_S3_BUCKET_LINK}/${coach.license}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 text-sm md:text-base lg:text-sm text-gray-700 hover:text-blue-600 transition"
              >
                <FaFileAlt className="text-blue-500" />
                <span>View Coaching License</span>
              </a>
            ) : (
              <span className="flex items-center space-x-2 text-sm md:text-base lg:text-sm text-gray-400">
                <FaFileAlt className="text-gray-400" />
                <span>No license uploaded</span>
              </span>
            )}
          </div>



        </div>

      </div>


      {/* Coach Info Card */}
      <div className="bg-white shadow-md rounded-2xl p-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm border border-gray-200">
        {/* <div><strong className="text-gray-500">Name:</strong> {coach.firstName} {coach.lastName}</div> */}
        <div><strong className="text-gray-700">Email:</strong> {coach.email}</div>
        <div><strong className="text-gray-700">Phone:</strong> {coach.countrycode}{coach.phoneNumber}</div>
        <div><strong className="text-gray-700">Gender:</strong> {coach.gender}</div>
        <div><strong className="text-gray-700">Sport:</strong> {coach.sportName}</div>
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
        <div>
          <strong className="text-gray-700">Total Earnings:</strong>
          <span className='ml-2 px-2 py-1 rounded-full  text-xs bg-blue-200 '>
            ${(coach?.payments ?? []).filter((p: Payment) => p.is_deleted !== 0)
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
        <h2 className="text-2xl font-semibold">Evaluation</h2>
        <div className="text-gray-700">

          Total: {(coach?.evaluations ?? []).filter(
            (ev: Evaluation) => ev.is_deleted !== 0
          ).length}
        </div>


        <div className="overflow-x-auto bg-white shadow-md rounded-2xl border border-gray-200">
          {coach?.evaluations?.length === 0 ? (
            <p className="p-6 text-gray-600">No evaluations found.</p>
          ) : (
            <table className="w-full text-sm text-left border-collapse">
              <thead className="bg-gray-50 border-b text-gray-700 uppercase text-xs">
                <tr>
                  <th className="px-4 py-3">Coach</th>
                  <th className="px-4 py-3">Evaluation</th>
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
                {paginatedEvaluations.map((ev: Evaluation) => (
                  <tr
                    key={ev.evaluationId}
                    className={`transition-colors duration-300 ${ev.is_deleted === 0 ? "bg-red-100" : ev.is_deleted === 1 ? "bg-white" : ""
                      }`}
                  >
                    <td className="px-4 py-2 text-gray-700">
                      <Link href={`/coach/${ev.player_id}`} className="text-blue-700 hover:underline">
                        {ev.firstName}
                      </Link>
                    </td>

                    <td className="px-4 py-3">
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
                      <span
                        className={`px-2 py-1 text-xs rounded-full font-medium text-white ${ev.status === 2 ? "bg-green-500" : ev.status === 3 ? "bg-red-500" : "bg-yellow-500"
                          }`}
                      >
                        {ev.status === 2 ? "Completed" : ev.status === 3 ? "Cancelled" : "Pending"}
                      </span>
                    </td>

                    <td className="px-4 py-3">{ev.turnaroundTime} mins</td>

                    <td className="px-4 py-3">{ev.payment_status}</td>

                    <td className="px-4 py-3">
                      {new Date(ev.created_at).toLocaleDateString()}
                    </td>

                    {/* ✅ FIXED ACTION CELL — NO WHITESPACE TEXT NODES */}
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        {ev.is_deleted === 0 ? (
                          <button
                            onClick={() => handleRevert(ev.evaluationId)}
                            title="Revert Evaluation"
                            style={{ fontSize: "1.2rem" }}
                          >
                            🛑
                          </button>
                        ) : (
                          <button
                            onClick={() => handleHide(ev.evaluationId)}
                            title="Hide Evaluation"
                            style={{ fontSize: "1.2rem" }}
                          >
                            👻
                          </button>
                        )}
                      </div>
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



      < section className="p-6 max-w-7xl mx-auto space-y-8 ">

        <h2 className="text-2xl font-semibold mb-4">Reviews</h2>
        <div className='flex justify-between'>

          <div className="overflow-x-auto bg-white shadow-md rounded-2xl w-full border border-gray-200">
            {coach?.reviews?.length === 0 ? (
              <p className="p-6 text-gray-600">No reviews found.</p>
            ) : (
              <>
                <table className="w-full text-sm text-left border-collapse">
                  <thead className="bg-gray-50 border-b text-gray-700 uppercase text-xs">
                    <tr>
                      <th className="px-4 py-3">Title</th>
                      <th className="px-4 py-3">Comment</th>
                      <th className="px-4 py-3">Player Name</th>
                      <th className="px-4 py-3">Coach Name</th>
                      <th className="px-4 py-3">Rating</th>
                      <th className="px-4 py-3">Created At</th>
                      <th className="px-4 py-3">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedReviews.map((r: Review) => (
                      // <tr key={p.id} className="hover:bg-gray-50 border-b">
                      <tr
                        key={r.id}
                        className={r.review_status === 0 ? "bg-red-100" : "bg-white"}
                      >
                        <td className="px-4 py-3">{r.title}</td>
                        <td className="px-4 py-3">{r.comment}</td>
                        <td className="px-4 py-3">{r.player_name}</td>
                        <td className="px-4 py-3">{r.coach_name}</td>
                        <td>
                          <div className="flex items-center mb-3 px-4 py-6">
                            {Array.from({ length: 5 }, (_, index) => index + 1).map((star) => (
                              <svg
                                key={star}
                                className={`w-6 h-6 ${star <= (r.rating ?? 0)
                                  ? 'text-yellow-500'
                                  : 'text-gray-300'
                                  }`}
                                xmlns="http://www.w3.org/2000/svg"
                                fill="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path d="M12 .587l3.668 7.431 8.21 1.192-5.938 5.784 1.404 8.189L12 18.897l-7.344 3.866 1.404-8.189L.122 9.21l8.21-1.192L12 .587z" />
                              </svg>
                            ))}
                          </div>
                        </td>
                        <td className="px-4 py-3">{new Date(r.created_at).toLocaleDateString()}</td>
                        <td className="px-4 py-3 text-center flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleEdit(r)}
                            title="Edit Review"

                            style={{
                              fontSize: '1.2rem',
                              marginRight: '8px',
                            }}
                          >
                            📝
                          </button>
                          <button
                            onClick={() => handleDelete(r)}
                            title={r.review_status === 0 ? "Hide Review" : "Reveal Review"}
                            style={{
                              fontSize: '1.2rem',
                            }}
                          >
                            {r.review_status == 0 ? "  🛑" : "👻"}
                          </button>
                        </td>

                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Pagination Controls */}
                <div className="flex justify-between items-center p-4 border-t">
                  <button
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-sm rounded disabled:opacity-50"
                    onClick={() => setReviewPage((prev) => Math.max(prev - 1, 1))}
                    disabled={reviewPage === 1}
                  >
                    Previous
                  </button>
                  <div className="text-sm text-gray-700">
                    Page {reviewPage}
                  </div>
                  <button
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-sm rounded disabled:opacity-50"
                    onClick={() => setReviewPage((prev) => Math.min(prev + 1, totalReviewPages))}
                    disabled={reviewPage === totalReviewPages}
                  >
                    Next
                  </button>
                </div>
              </>
            )}

            {/* Edit Modal */}
            {showModal && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white p-6 rounded-lg shadow-lg w-[90%] max-w-md">
                  <h3 className="text-xl font-bold text-gray-800 mb-6 text-center">
                    Edit Feedback
                  </h3>

                  {/* Review Title */}
                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Review Title:
                    </label>
                    <input
                      type="text"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      placeholder="Enter review title..."
                      className="w-full border border-gray-300 rounded-md p-2 text-sm"
                    />
                  </div>

                  {/* Star Rating */}
                  <div className="flex justify-center gap-2 mb-4">
                    {Array.from({ length: 5 }, (_, index) => index + 1).map((star) => (
                      <svg
                        key={star}
                        onClick={() => setNewRating(star)}
                        className={`w-8 h-8 cursor-pointer transition-colors duration-200 ${star <= newRating ? "text-yellow-500" : "text-gray-300"
                          }`}
                        xmlns="http://www.w3.org/2000/svg"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 .587l3.668 7.431 8.21 1.192-5.938 5.784 1.404 8.189L12 18.897l-7.344 3.866 1.404-8.189L.122 9.21l8.21-1.192L12 .587z" />
                      </svg>
                    ))}
                  </div>

                  {/* Comment */}
                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Feedback / Comment:
                    </label>
                    <textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Write your feedback..."
                      className="w-full border border-gray-300 rounded-md p-2 text-sm resize-none"
                      rows={4}
                    />
                  </div>

                  {/* Buttons */}
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setShowModal(false)}
                      className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md text-gray-800 transition"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={submitEdit}
                      disabled={isSubmitting}
                      className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-md flex items-center justify-center gap-2 disabled:opacity-60 transition"
                    >
                      {isSubmitting && (
                        <svg
                          className="w-4 h-4 animate-spin text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8v8z"
                          />
                        </svg>
                      )}
                      {isSubmitting ? "Saving..." : "Save"}
                    </button>
                  </div>
                </div>
              </div>
            )}


          </div>
        </div>


      </section>

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
                      <th className="px-4 py-3">Coach</th>
                      <th className="px-4 py-3">Evaluation</th>
                      <th className="px-4 py-3">Amount</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Description</th>
                      <th className="px-4 py-3">Created At</th>
                      {/* <th className="px-4 py-3">Action</th> */}
                    </tr>
                  </thead>

                  <tbody>
                    {paginatedPayments.map((p: Payment) => (
                      <tr
                        key={p.evaluation_id}
                        className={`transition-colors duration-300 ${p.is_deleted === 0 ? "bg-red-100" : "bg-white"
                          }`}
                      >
                        <td className="px-4 py-3">{p.playerFirstName}</td>
                        <td className="px-4 py-3">{p.review_title}</td>
                        <td className="px-4 py-3">${p.amount}</td>
                        <td className="px-4 py-3">{p.status}</td>
                        <td className="px-4 py-3">{p.description}</td>
                        <td className="px-4 py-3">
                          {new Date(p.created_at).toLocaleDateString()}
                        </td>

                        {/* ✅ ACTION COLUMN */}
                          {/* Refund Button */}
                          {/* <td className="px-4 py-3 text-center flex items-center justify-center gap-2">
                            <Button
                              variant="outline"
                              disabled={p.status === "refunded"}
                              className={`shadow-sm rounded-lg px-3 py-1 text-xs${p.status === "refunded"
                                  ? "bg-gray-100 text-green-600 cursor-not-allowed"
                                  : "bg-red-50 text-red-700 hover:bg-red-100 hover:text-red-900"
                                }
    `}
                              onClick={() => handleRefundClick(p)}
                            >
                              {p.status === "refunded" ? "Refunded" : "Refund"}
                            </Button>
                          </td> */}

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

      <Dialog
        open={selectedCoachid === Number(coach.id)}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            setSelectedCoachid(null);
            setRecentMessages([]);
          }
        }}
      >
        <DialogContent className="max-w-md w-full bg-white rounded-2xl shadow-xl p-6 space-y-4">
          <DialogHeader className="border-b pb-2">
            <DialogTitle className="text-lg font-semibold text-gray-800">
              Send Message
            </DialogTitle>
            <p className="text-sm text-gray-500">
              Send a message to{" "}
              <span className="font-medium text-black">
                {coach.firstName} {coach.lastName}
              </span>
            </p>
          </DialogHeader>

          {/* Message Type Checkboxes */}
          <div className="flex gap-4 text-sm">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={sendEmail}
                onChange={() => setSendEmail(!sendEmail)}
              />
              Email
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={sendSMS}
                onChange={() => setSendSMS(!sendSMS)}
              />
              SMS
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={sendInternal}
                onChange={() => setSendInternal(!sendInternal)}
              />
              Internal Message
            </label>
          </div>

          {/* Message Textarea */}
          <textarea
            rows={5}
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            className="w-full border rounded-lg p-2 text-sm text-gray-800"
            placeholder="Enter your message..."
          />

          {/* Recent Messages */}
          <div className="border-t pt-3">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Recent Messages</h3>
            <div className="max-h-40 overflow-y-auto space-y-3">
              {recentMessages.length === 0 ? (
                <p className="text-xs text-gray-500">No previous messages</p>
              ) : (
                recentMessages.map((msg, idx) => {
                  // Format methods nicely (if you want uppercase labels)
                  const methodLabels = msg.methods.length
                    ? msg.methods.map((m) => m.toUpperCase()).join(", ")
                    : "N/A";

                  // Set alignment and bg color
                  const alignment =
                    msg.position === "left" ? "justify-start" : "justify-end";
                  const bgColor =
                    msg.bgColor === "green" ? "bg-green-100" : "bg-blue-100";

                  return (
                    <div
                      key={msg.id ?? idx}
                      className={`flex ${alignment}`}
                    >
                      <div className={`p-3 rounded-xl shadow-sm ${bgColor} w-full`}>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs font-semibold">
                            From: {`${coach.firstName} ${coach.lastName}`}
                          </span>
                          <span className="text-[10px] text-gray-500">
                            {new Date(msg.created_at).toLocaleString()}
                          </span>
                        </div>
                        <div className="text-xs text-gray-700">
                          <p>{msg.message}</p>
                          <p className="text-gray-500">Methods: {methodLabels}</p>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={() => setSelectedCoachid(null)}
              className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              onClick={async () => {
                if (!messageText.trim()) {
                  Swal.fire("Warning", "Please enter a message before sending.", "warning");
                  return;
                }

                if (!sendEmail && !sendSMS && !sendInternal) {
                  Swal.fire(
                    "Warning",
                    "Please select at least one method (Email, SMS, Internal).",
                    "warning"
                  );
                  return;
                }

                try {
                  // send message via POST API
                  await axios.post(`/api/geolocation/coach`, {
                    type: "coach",
                    targetIds: [coach.id],
                    message: messageText,
                    methods: {
                      email: sendEmail,
                      sms: sendSMS,
                      internal: sendInternal,
                    },
                  });

                  // ✅ Save methods to sessionStorage (per message id)
                  const methodObj = {
                    email: sendEmail,
                    sms: sendSMS,
                    internal: sendInternal,
                  };
                  sessionStorage.setItem(
                    `message-methods-${coach.id}`,
                    JSON.stringify(methodObj)
                  );

                  Swal.fire("Success", "Message sent successfully!", "success");
                  setSelectedCoachid(null);
                  setMessageText("");




                } catch (err) {
                  console.error(err);
                  setSelectedCoachid(null);
                  Swal.fire("Error", "Failed to send message.", "error");

                }
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Send
            </button>
          </div>
        </DialogContent>

      </Dialog>
      {/* Refund Dialog */}
      <Dialog open={refundDialog} onOpenChange={setRefundDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Refund Payment</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-4 mt-2">
            {/* Refund Type Selection */}
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={refundType === "full"}
                onChange={() => {
                  setRefundType("full");
                  setPartialAmount(Number(selectedPayment?.amount || 0)); // Auto-fill full amount
                }}
              />
              Full Refund
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={refundType === "partial"}
                onChange={() => {
                  setRefundType("partial");
                  setPartialAmount(0); // Reset partial amount
                }}
              />
              Partial Refund
            </label>

            {/* Amount Input */}
            {(refundType === "partial" || refundType === "full") && (
              <Input
                type="number"
                placeholder={`Enter refund amount (max $${Number(selectedPayment?.amount || 0).toFixed(2)})`}
                value={partialAmount ? partialAmount.toString() : ""}
                onChange={(e) => setPartialAmount(Number(e.target.value))}
                min={(0).toString()}
                max={Number(selectedPayment?.amount || 0).toString()}
              />
            )}

            {/* Action Buttons */}
            <div className="flex justify-end gap-2 mt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setRefundDialog(false);
                  setRefundType(null);
                  setPartialAmount(0);
                  setSelectedPayment(null);
                }}
              >
                Cancel
              </Button>

              <Button
                onClick={async () => {
                  if (!refundType || !selectedPayment) return;

                  const amountToRefund = partialAmount;

                  if (
                    !amountToRefund ||
                    amountToRefund <= 0 ||
                    amountToRefund > Number(selectedPayment.amount)
                  ) {
                    Swal.fire({
                      icon: "error",
                      title: "Invalid Amount",
                      text: "Enter a valid refund amount.",
                    });
                    return;
                  }

                  const refundData = {
                    payment_id: selectedPayment.id,
                    refund_type: refundType,
                    amount_refunded: amountToRefund,
                    remaining_amount: Number(selectedPayment.amount) - amountToRefund,
                    refund_by: "Admin",
                  };

                  try {
                    const res = await fetch("/api/refunds", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify(refundData),
                    });

                    if (!res.ok) throw new Error("Refund failed");

                    Swal.fire({
                      icon: "success",
                      title: "Refund Successful",
                      text: `Refund of $${amountToRefund.toFixed(2)} processed successfully!`,
                    });

                    // ✅ UPDATE UI (THIS IS THE KEY PART)
                    setPayments((prev: Payment[]) =>
                      prev.map((p) =>
                        p.id === selectedPayment.id
                          ? { ...p, status: "refunded" }
                          : p
                      )
                    );

                    // Reset dialog state
                    setRefundDialog(false);
                    setRefundType(null);
                    setPartialAmount(0);
                    setSelectedPayment(null);

                  } catch (error) {
                   console.error(error);
                    Swal.fire({
                      icon: "error",
                      title: "Error",
                      text: "Failed to process refund. Please try again.",
                    });
                  }
                }}
                disabled={!refundType}
              >
                Submit
              </Button>

            </div>
          </div>
        </DialogContent>
      </Dialog>
      {/* Edit Modal */}
      {isDeclineModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-[90%] max-w-md">
            <h3 className="text-xl font-bold text-gray-800 mb-6 text-center">
              Reason for being Denied
            </h3>


            {/* Comment */}
            <div className="mb-4">
              {/* <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Feedback / Comment:
                  </label> */}
              <textarea
                value={declineMessage}
                onChange={(e) => setDeclineMessage(e.target.value)}
                placeholder="Write your feedback..."
                className="w-full border border-gray-300 rounded-md p-2 text-sm resize-none"
                rows={4}
              />
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsDeclineModalOpen(false)}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md text-gray-800 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => handleCoachDecline(Number(coach.id), "decline")}
                disabled={submittingDecline}
                className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-md flex items-center justify-center gap-2 disabled:opacity-60 transition"
              >
                {submittingDecline && (
                  <svg
                    className="w-4 h-4 animate-spin text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8z"
                    />
                  </svg>
                )}
                {submittingDecline ? "Submitting..." : "Submit"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div >

  );
}
