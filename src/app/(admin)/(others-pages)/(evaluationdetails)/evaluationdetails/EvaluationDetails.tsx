'use client';
import '@fortawesome/fontawesome-free/css/all.min.css';

import React, { useEffect, useState } from 'react';
import { Evaluation } from '@/app/types/types';

import Loading from '@/components/Loading';
import { format } from 'date-fns';
import Image from 'next/image';
// import { getSession } from 'next-auth/react';
// import defaultImage from '../../public/default.jpg';
import defaultImage from '@/public/default.jpg'
import { FaFileAlt, FaSpinner } from 'react-icons/fa';
import { Category } from '@/app/types/types';

import EvaluationPolarCharts from '@/components/coach/EvaluationPolarCharts';
/* import { PolarChartValues } from '@/app/types/types' */
import { useSearchParams } from 'next/navigation';
import { Clock } from 'lucide-react';
import { NEXT_PUBLIC_AWS_S3_BUCKET_LINK } from '@/lib/constants';
///import { Category } from '@mui/icons-material';
import PitcherComponent from '@/components/coach/pitcherComponent';
import { useRoleGuard } from '@/hooks/useRoleGaurd';
import Swal from 'sweetalert2';

// type EvaluationPageProps = {
//   searchParams: {
//     evaluationId: string;
//   };
// };
type FileData = {
  filename: string;
  comments: string;
  size?: number; // Add size as an optional property
};
type TimeInterval = {
  start: string;
  end: string;
  description: string;
};
type AbilityData = {
  evaluationId: string;
  files: {
    file1?: FileData;
    file2?: FileData;
    file3?: FileData;
    file4?: FileData;
    file5?: FileData;
  };
};

// type RadarSkill = {
//   label: string;
//   key:
//   | 'technicalAverage'
//   | 'tacticalAverage'
//   | 'distributionAverage'
//   | 'physicalAverage'
//   | 'organizationAverage';
// };

// 2. Pre-define each set for clarity:
// const goalkeeperRadarSkills: RadarSkill[] = [
//   { label: 'Technical Average', key: 'technicalAverage' },
//   { label: 'Tactical Average', key: 'tacticalAverage' },
//   { label: 'Distribution Average', key: 'distributionAverage' },
//   { label: 'Physical Average', key: 'physicalAverage' },
//   { label: 'Organization Average', key: 'organizationAverage' },
// ];

// const outfieldRadarSkills: RadarSkill[] = [
//   { label: 'Technical Average', key: 'technicalAverage' },
//   { label: 'Tactical Average', key: 'tacticalAverage' },
//   { label: 'Physical Average', key: 'physicalAverage' },
// ];

// type sectionScoreResults = {
//   avg: number;
//   count: number;
// };
interface Attribute {
  id: number;
  name: string;
}

/* interface Category {
  id: number;
  name: string;
  attributes: Attribute[] | null;
} */

interface EvaluationTemplateItem {
  sport: string;
  position: string;
  categories: Category[] | null;
}
function EvaluationPage() {
  useRoleGuard();
  const [evaluationData, setEvaluationData] = useState<Evaluation | null>(null); // State to store evaluation data

  // const [position, setPosition] = useState<string>();
  // const [headerMetrics, setHeaderMetrics] = useState<string[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [newTitle, setNewTitle] = useState(evaluationData?.reviewTitleCustom || "");
  const [newComment, setNewComment] = useState(evaluationData?.reviewComment || "");

  const [newRating, setNewRating] = useState(evaluationData?.rating || 0);

  const searchParams = useSearchParams();
  const evaluationId = searchParams.get('evaluationId');


  //   const { evaluationId } = searchParams; // Get evaluationId from searchParams
  const [evaluationTemplateData, setEvaluationTemplateData] =
    useState<EvaluationTemplateItem | null>(null);

  const [loading, setLoading] = useState<boolean>(true);

  const [downloadingPDF, setDownloadingPDF] = useState<boolean>(false);

  const [data, setData] = useState<AbilityData | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  //These statehooks are for retrieving the averages from each section of the evaluation form
  const [evaluationAverage, setEvaluationAverage] = useState<number>(0);
  
  const MAX_FILE_SIZE = 9 * 1024 * 1024; // 9MB

  const [videoOneTimeStamps, setVideoOneTimeStamps] = useState<TimeInterval[]>([
    { start: '', end: '', description: '' },
  ]);
  const [videoTwoTimeStamps, setVideoTwoTimeStamps] = useState<TimeInterval[]>([
    { start: '', end: '', description: '' },
  ]);

  const formattedDate = evaluationData?.updated_at
    ? format(new Date(evaluationData.updated_at), 'MM/dd/yyyy')
    : '';


  const [pitcherCategories, setPitcherCategories] = useState<Category[]>([]);
  const [isPitcherPosition, setIsPitcherPosition] = useState(false);

  // const getRatingBgClass = (value: string) => {
  //   switch (value.toLowerCase()) {
  //     case 'excellent':
  //       return ' text-yellow-400 rounded';
  //     case 'positive':
  //       return ' text-cyan-400  rounded';
  //     case 'neutral':
  //       return ' text-blue-300 rounded';
  //     default:
  //       return '';
  //   }
  // };

  //Generates the PDF
  const downloadPDF = async () => {
    // console.log("Evaluation Id: ", evaluationId);

    setDownloadingPDF(true);

    setDownloadingPDF(true);

    const payload = JSON.stringify({
      evaluationData: evaluationData,
      evaluationAverage: evaluationAverage,
      evaluationTemplateData: evaluationTemplateData,
    });



    const response = await fetch(
      `/api/generatepdf?evaluationId=${evaluationId}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: payload,
      },
    );
    if (!response.ok) {
      setDownloadingPDF(false);
      throw new Error('Error occurred when generating PDF');
    }

    const { path } = await response.json();

    // console.log("Path: ", path);

    // Create a download link that automatically gets pressed
    const link = document.createElement('a');
    link.href = `${NEXT_PUBLIC_AWS_S3_BUCKET_LINK}/${path}`;
    link.download = 'Evaluation Form';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setDownloadingPDF(false);
    // Revoke object URL to free memory
    // setTimeout(() => window.URL.revokeObjectURL(blobUrl), 100);
  };

  useEffect(() => {
    if (evaluationId) {
      fetch(`/api/ability?evaluationId=${evaluationId}`)
        .then(res => res.json())
        .then(result => {
          // console.log('API result:', result); // Log the full response
          if (result.ability) {
            setData(result.ability); // If ability data exists, update the state
          } else {
            // alert('Unable to fetch data');
            console.log('Unable to fetch data ');
          }
        })
        .catch(error => {
          console.error('Error fetching data:', error);
          // alert('Error fetching data');
        });
    }
  }, [evaluationId]);

  useEffect(() => {
    if (evaluationTemplateData?.categories) {
      const pitcherCats = evaluationTemplateData.categories.filter(
        cat => cat.id === 122 || cat.id === 125
      );
      setPitcherCategories(pitcherCats);
      setIsPitcherPosition(pitcherCats.length > 0);
    }
  }, [evaluationTemplateData]);



  // const handleSubmitRating = async () => {
  //   if (rating <= 0) {
  //     showError('Please select rating');
  //     return;
  //   }
  //   try {
  //     const response = await fetch('/api/submitRating', {
  //       method: 'PUT',
  //       headers: {
  //         'Content-Type': 'application/json',
  //       },
  //       body: JSON.stringify({ evaluationId, rating, remarks, playerId }),
  //     });

  //     if (!response.ok) {
  //       throw new Error('Failed to submit rating');
  //     }

  //     setIsRatingSubmitted(true);
  //   } catch (error) {
  //     console.error('Error submitting rating:', error);
  //     // Handle error, e.g., show an error message
  //   }
  // };

  const fetchEvaluationData = async () => {
    // const session = await getSession();



    try {
      const response = await fetch(
        `/api/evaluationdetails?evaluationId=${evaluationId}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );
      if (!response.ok) {
        setLoading(false);
        throw new Error('Failed to fetch evaluation data');
      }

      const data = await response.json();
      console.log("data", data);
      const evalTemplateResponse = await fetch(
        `/api/evaluationDetailsTemplate?position=${data.result.position}&sport_id=${data.result.sport}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );
      const evalTemplate = await evalTemplateResponse.json();
      console.log("evaluation", evalTemplate);

      setEvaluationTemplateData(evalTemplate[0]);
      setEvaluationData(data.result as Evaluation); // Type assertion here
      // setRating(data.result.rating);
      // setPosition(data.position);
      // setPhysicalScores(JSON.parse(data.result.physicalScores));
      // setTacticalScores(JSON.parse(data.result.tacticalScores));
      // setTechnicalScores(JSON.parse(data.result.technicalScores));
      // setOrganizationScores(JSON.parse(data.result.organizationScores));
      // setDistributionScores(JSON.parse(data.result.distributionScores));
      // setDistributionScores(JSON.parse(data.result.distributionScores));

      setEvaluationAverage(data.result.evalAverage);
      // setTechnicalAverage(data.result.techAverage);
      // setTacticalAverage(data.result.tactAverage);
      // setDistributionAverage(data.result.distAverage);
      // setPhysicalAverage(data.physAverage);
      // setOrganizationAverage(data.result.orgAverage);

      // setData()
      // setFormData({
      //     speed: data.result.speed || '',
      //     comm_persistence: data.result.comm_persistence || '',
      //     comm_aggression: data.result.comm_aggression || '',
      //     comm_alertness: data.result.comm_alertness || '',
      //     exe_scoring: data.result.exe_scoring || '',
      //     exe_receiving: data.result.exe_receiving || '',
      //     exe_passing: data.result.exe_passing || '',
      //     dec_mobility: data.result.dec_mobility || '',
      //     dec_anticipation: data.result.dec_anticipation || '',
      //     dec_pressure: data.result.dec_pressure || '',
      //     soc_speedEndurance: data.result.soc_speedEndurance || '',
      //     soc_strength: data.result.soc_strength || '',
      //     soc_explosiveMovements: data.result.soc_explosiveMovements || '',
      //     // ratings: data.ratings || "",
      //     superStrengths: data.result.superStrengths || '',
      //     developmentAreas: data.result.developmentAreas || '',
      //     idpGoals: data.result.idpGoals || '',
      //     keySkills: data.result.keySkills || '',
      //     attacking: data.result.attacking || '',
      //     defending: data.result.defending || '',
      //     transitionDefending: data.result.transitionDefending || '',
      //     transitionAttacking: data.result.transitionAttacking || '',
      // });
      // setHeaderMetrics(
      //   position === 'Goalkeeper'
      //     ? [
      //       'Technical Average',
      //       'Tactical Average',
      //       'Distribution Average',
      //       'Physical Average',
      //       'Organization Average',
      //     ]
      //     : ['Technical Average', 'Tactical Average', 'Physical Average'],
      // );

      // setRadarSkills(
      //   position === 'Goalkeeper'
      //     ? [
      //         { label: 'Technical Average', key: 'technicalAverage' },
      //         { label: 'Tactical Average', key: 'tacticalAverage' },
      //         { label: 'Distribution Average', key: 'distributionAverage' },
      //         { label: 'Physical Average', key: 'physicalAverage' },
      //         { label: 'Organization Average', key: 'organizationAverage' },
      //       ]
      //     : [
      //         { label: 'Technical Average', key: 'technicalAverage' },
      //         { label: 'Tactical Average', key: 'tacticalAverage' },
      //         { label: 'Physical Average', key: 'physicalAverage' },
      //       ],
      // );

      // console.log("Position baby: ", data.result.position);

      // setRadarSkills(
      //     data.result.position === 'Goalkeeper'
      //         ? goalkeeperRadarSkills
      //         : outfieldRadarSkills,
      // );

      // setHeaderRatings([
      //     data.result.technicalAverage,
      //     data.result.tacticalAverage,
      //     data.result.distributionAverage,
      //     data.result.physicalAverage,
      //     data.result.organizationAverage,
      // ]);

      // setSkillRatings(radarSkills.map(skill => data.result[skill.key] || 0));

      setLoading(false);
      if (data?.result.videoOneTiming) {
        const parsed = JSON.parse(data.result.videoOneTiming);
        setVideoOneTimeStamps(parsed);
      }
      if (data?.result.videoTwoTiming) {
        const parsed = JSON.parse(data.result.videoTwoTiming);
        setVideoTwoTimeStamps(parsed);
      }
      // Set the fetched evaluation data
    } catch (error) {
      console.error('Error fetching evaluation data:', error);
    }
  };
  // const calculateAverage = (scores: Record<string, string | number>): sectionScoreResults => {
  //   const values = Object.values(scores)
  //     .map(Number)
  //     .filter(v => !isNaN(v));
  //   if (values.length === 0) return {avg: 0, count: 0};
  //   const avg = values.reduce((a, b) => a + b, 0) / values.length;
  //   return {avg: Math.round(avg * 100) / 100, count: values.length}; // Round to 2 decimal
  // };
  useEffect(() => {
    fetchEvaluationData();
  }, []); // Dependency array includes evaluationId
  if (loading) {
    return <Loading />; // Loading indicator
  }

  //USED for smaller screens (not needed but will keep in case of future use )
  // const sectionChartDataSmallScreen = (type: string) => {
  //   if (type === 'tech') {
  //     const chartData = Object.values(technicalScores).map((value, index) => ({
  //       subject: String(index),
  //       scores: Number(value) ? Number(value) : 0,
  //     }));

  //     return chartData;
  //   } else if (type === 'tact') {
  //     const chartData = Object.values(tacticalScores).map((value, index) => ({
  //       subject: String(index),
  //       scores: Number(value) ? Number(value) : 0,
  //     }));

  //     return chartData;
  //   } else {
  //     const chartData = Object.values(physicalScores).map((value, index) => ({
  //       subject: String(index),
  //       scores: Number(value) ? Number(value) : 0,
  //     }));

  //     return chartData;
  //   }
  // };

  //Formats the data from each section to be used for polar charts
  const sectionChartData = (
    category: Category,
    values: Record<number, string | number | null>
  ) => {
    const filteredAttributes = category.attributes?.filter(
      attr =>
        !attr.name.toLowerCase().includes('avgscore') &&
        !attr.name.toLowerCase().includes('commentary')
    ) ?? [];

    const labelsPolar = filteredAttributes.map(attr => attr.name);
    const scoresPolar = filteredAttributes.map(attr => Number(values[attr.id]) || 0);

    return {
      data: scoresPolar,
      labels: labelsPolar,
      enableHover: true,
    };
  };

  const handleEdit = () => {
    setNewTitle(evaluationData?.reviewTitleCustom || "");
    setNewRating(Number(evaluationData?.rating) || 0);
    setNewComment(evaluationData?.reviewComment || "");
    setShowModal(true);
  };

  const submitEdit = async () => {
    if (!evaluationId) return;
    if (!newRating) {
      Swal.fire({
        icon: "warning",
        title: "Missing Rating",
        text: "Please provide a star rating before saving.",
      });
      return;
    }

    setIsSubmitting(true);

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


  const handleDelete = async () => {
    if (!evaluationData) return;

    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "This will hide the rating, not delete it.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, hide it!',
    });

    if (result.isConfirmed) {
      const res = await fetch(`/api/evaluationdetails/${evaluationId}/hide-rating`, {
        method: 'PATCH',
      });

      if (res.ok) {
        setEvaluationData(prev => prev ? { ...prev, review_status: 0 } : prev);
        Swal.fire({
          icon: 'success',
          title: 'Rating Hidden',
          text: 'The rating has been hidden successfully.',
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

  const handleRevert = async () => {
    if (!evaluationData) return;

    const result = await Swal.fire({
      title: 'Revert Rating Visibility',
      text: 'Are you sure you want to make the rating visible again?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, revert it',
    });

    if (!result.isConfirmed) return;

    const res = await fetch(`/api/evaluationdetails/${evaluationId}/revert`, {
      method: 'PATCH',
    });

    if (res.ok) {
      setEvaluationData(prev => prev ? { ...prev, reviewStatus: 1 } : prev);
      Swal.fire({
        icon: 'success',
        title: 'Rating Reverted',
        text: 'The rating is now visible again.',
        timer: 2000,
        showConfirmButton: false,
      });
      location.reload();

    } else {
      const { error } = await res.json();
      Swal.fire({
        icon: 'error',
        title: 'Failed to Revert',
        text: error || 'Could not revert rating visibility.',
      });
    }
  };
  return (
    <>
      <div className="rounded-lg border border-gray-300 p-6 font-sans">
        <button
          onClick={downloadPDF}
          className="mt-4 rounded bg-blue-500 p-2 text-white"
          disabled={downloadingPDF}
        >
          {downloadingPDF ? (
            <span>
              Downloading
              <FaSpinner className="mr-2 inline-block animate-spin" />{' '}
            </span>
          ) : (
            <>Download PDF</>
          )}
        </button>
      </div>
      <div className="mx-auto w-full bg-white">
        <div className="rounded-lg border border-gray-300 p-6 font-sans">
          {/* Evaluation Form Header - Full Width */}
          <div className="mb-0 w-full">
            <div className="rounded-lg border border-gray-300 bg-white p-6">
              <div className="mb-0 flex flex-wrap justify-between border-b border-gray-300 pb-3">
                <h2 className="text-xl font-bold">Evaluation Form</h2>
                <div className="flex flex-col items-end">
                  {/* <span className="text-white bg-blue-500  px-3 py-2 rounded ">Completed</span> */}
                  <div className="h-8 w-24 rounded bg-green-600 text-center text-sm uppercase leading-8 text-white shadow-md">
                    Completed
                  </div>
                </div>
              </div>
              <b>NOTE: </b>
              <p>
                All scores are meant for your viewing purposes only so that you
                can have some reference point of your performance. Scoring is
                always subjective depending on the coach (one coach may be
                “easy” and another may be “hard”) so treat whatever scores you
                receive as a baseline for tracking improvement over time, not
                the “end all be all” of your play.
              </p>

              <p className="mt-2">
                If a coach enters an “N/A” for a category in your evaluation,
                that category will not be counted when averaging scores; thus,
                your scores will only reflect what a coach could actually
                evaluate from your game film. Have fun with this feature as
                seeking any improvement over time is what matters!
              </p>
            </div>
          </div>

          {/* Player Information and Key Information - Side by Side */}
          {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-4"> */}
          {/* Player Information */}

          <div className="grid grid-cols-1 gap-4 p-4 sm:p-6 md:grid-cols-3">
            {/* Player Information Section */}
            {/* <div className="bg-white p-4 sm:p-6 border border-gray-300 rounded-lg md:col-span-2 relative"> */}
            <div className="relative rounded-lg border border-gray-300 bg-white p-4 sm:p-6 md:col-span-2">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {/* LEFT COLUMN */}
                <div className="space-y-4">
                  {/* Review Title */}
                  <div>
                    <h3 className="break-words text-lg font-semibold">
                      Review Title:{' '}
                      <span className="font-normal">
                        {evaluationData?.reviewTitle || 'N/A'}
                      </span>
                    </h3>
                  </div>

                  {/* Player Info */}
                  <div className="flex items-center gap-3">
                    <strong>Player:</strong>
                    <Image
                      src={
                        evaluationData?.image &&
                          evaluationData?.image !== 'null'
                          ? evaluationData.player_status === 'Deactivated'
                            ? defaultImage
                            : `${NEXT_PUBLIC_AWS_S3_BUCKET_LINK}/${evaluationData?.image}`
                          : defaultImage
                      }
                      alt="Player Avatar"
                      className="h-12 w-12 rounded-full object-cover"
                      width={48}
                      height={48}
                    />
                    <span className="break-words text-gray-700">
                      {evaluationData?.player_status === 'Deactivated' ? (
                        <div>
                          {evaluationData?.first_name}{' '}
                          {evaluationData?.last_name}
                        </div>
                      ) : (
                        <a
                          href={`/players/${evaluationData?.playerSlug}`}
                          className="text-blue-700"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {evaluationData?.first_name}{' '}
                          {evaluationData?.last_name}
                        </a>
                      )}
                    </span>
                  </div>

                  {/* Coach Info */}
                  <div className="flex items-center gap-3">
                    <strong>Coach:</strong>
                    <Image
                      src={
                        evaluationData?.coachimage &&
                          evaluationData?.coachimage !== 'null'
                          ? evaluationData.coach_status === 'Deactivated'
                            ? defaultImage
                            : `${NEXT_PUBLIC_AWS_S3_BUCKET_LINK}/${evaluationData?.coachimage}`
                          : defaultImage
                      }
                      alt="Coach Avatar"
                      className="h-12 w-12 rounded-full object-cover"
                      width={48}
                      height={48}
                    />
                    <span className="break-words text-gray-700">
                      {evaluationData?.coach_status === 'Deactivated' ? (
                        <div>
                          {evaluationData?.coachFirstName}{' '}
                          {evaluationData?.coachLastName}
                        </div>
                      ) : (
                        <a
                          href={`/coach/${evaluationData?.coachSlug}`}
                          className="text-blue-700"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {evaluationData?.coachFirstName}{' '}
                          {evaluationData?.coachLastName}
                        </a>
                      )}
                    </span>
                  </div>

                  <div>
                    <strong>Date Completed:</strong>{' '}
                    <span>{formattedDate}</span>
                  </div>

                  {evaluationData?.document && (
                    <div className="flex flex-wrap items-center gap-2">
                      <strong>View / Download Additional Document:</strong>
                      <a
                        href={evaluationData?.document}
                        className="flex items-center gap-1 text-sm text-blue-700"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <FaFileAlt />
                        <span>Download</span>
                      </a>
                    </div>
                  )}
                </div>

                {/* RIGHT COLUMN - Score Box */}
                {/* RIGHT COLUMN */}
                <div className="md:relative">
                  {/* Only shows at md and up: top-right */}
                  <div className="absolute right-0 top-0 m-4 hidden md:block">
                    <div className="flex w-36 flex-col items-center justify-center rounded-xl border bg-gradient-to-br from-blue-500 to-indigo-600 p-4 text-white shadow-lg md:w-40">
                      <div className="mb-2 text-center text-sm font-semibold md:text-base">
                        Overall Average
                      </div>
                      <div className="flex h-16 w-16 items-center justify-center rounded-full border-4 border-white bg-white text-lg font-bold text-blue-700 shadow-inner md:h-20 md:w-20 md:text-xl">
                        {evaluationAverage}
                      </div>
                    </div>
                  </div>

                  {/* Only shows on small screens: below Date Completed */}
                  <div className="mt-4 block md:hidden">
                    <div className="mx-auto flex w-full max-w-xs flex-col items-center justify-center rounded-xl border bg-gradient-to-br from-blue-500 to-indigo-600 p-4 text-white shadow-lg">
                      <div className="mb-2 text-center text-sm font-semibold">
                        Overall Average
                      </div>
                      <div className="flex h-16 w-16 items-center justify-center rounded-full border-4 border-white bg-white text-lg font-bold text-blue-700 shadow-inner">
                        {evaluationAverage}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Videos */}
              <div className="mt-6 space-y-6">
                {/* Video 1 */}
                <fieldset className="rounded-md border border-gray-300 p-4">
                  <legend className="text-lg font-semibold text-gray-700">
                    Video 1
                  </legend>
                  <div className="mb-2 text-sm text-gray-800">
                    <strong>Link:</strong>{' '}
                    <a
                      href={evaluationData?.primary_video_link}
                      className="text-blue-500 underline"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      View Video
                    </a>{' '}
                    <span className="mx-1">|</span>
                    <strong>Jersey Color:</strong>{' '}
                    {evaluationData?.jerseyColorOne}{' '}
                    <span className="mx-1">|</span>
                    <strong>Number:</strong> {evaluationData?.jerseyNumber}{' '}
                    <span className="mx-1">|</span>
                    <strong>Position(s):</strong> {evaluationData?.positionOne}
                  </div>
                  <div className="max-h-24 w-full overflow-y-auto break-words text-sm text-gray-700">
                    <strong>Description:</strong>{' '}
                    {evaluationData?.video_description}
                  </div>
                  <div className="mx-auto w-full max-w-4xl p-3 sm:p-6">
                    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg">
                      {/* Header */}
                      <div className="bg-gradient-to-br from-blue-500 to-indigo-600 px-4 py-3 sm:px-6 sm:py-4">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <Clock className="h-5 w-5 text-white sm:h-6 sm:w-6" />
                          <h2 className="text-lg font-semibold text-white sm:text-xl">
                            Video Timeline
                          </h2>
                        </div>
                      </div>

                      {/* Desktop Table - Hidden on mobile */}
                      <div className="hidden overflow-x-auto md:block">
                        <div className="max-h-60 overflow-y-auto">
                          <table className="w-full">
                            <thead>
                              <tr className="border-b border-gray-200 bg-gray-50">
                                <th className="w-24 px-6 py-4 text-left text-sm font-semibold text-gray-900">
                                  Start Time
                                </th>
                                <th className="w-24 px-6 py-4 text-left text-sm font-semibold text-gray-900">
                                  End Time
                                </th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                                  Description
                                </th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                              {evaluationData?.videoOneTiming === '' ? (
                                <tr>
                                  <td
                                    colSpan={3}
                                    className="px-6 py-4 text-center text-sm text-gray-600"
                                  >
                                    Player played the full game.
                                  </td>
                                </tr>
                              ) : (
                                videoOneTimeStamps.map((interval, index) => (
                                  <tr
                                    key={index}
                                    className="group transition-colors duration-150 hover:bg-gray-50"
                                  >
                                    <td className="whitespace-nowrap px-6 py-4">
                                      <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800">
                                        {interval.start}
                                      </span>
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4">
                                      <span className="inline-flex items-center rounded-full bg-purple-100 px-3 py-1 text-xs font-medium text-purple-800">
                                        {interval.end}
                                      </span>
                                    </td>
                                    <td className="px-6 py-4">
                                      <p className="text-sm leading-relaxed text-gray-900">
                                        {interval.description}
                                      </p>
                                    </td>
                                  </tr>
                                ))
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* Mobile Card Layout - Visible only on mobile */}
                      <div className="max-h-60 divide-y divide-gray-200 overflow-y-auto md:hidden">
                        {evaluationData?.videoOneTiming === '' ? (
                          <div className="p-4 text-center text-sm text-gray-600">
                            Player played the full game.
                          </div>
                        ) : (
                          videoOneTimeStamps.map((interval, index) => (
                            <div
                              key={index}
                              className="p-4 transition-colors duration-150 hover:bg-gray-50"
                            >
                              <div className="mb-3 flex items-start justify-between gap-3">
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">
                                    {interval.start}
                                  </span>
                                  <span className="text-xs text-gray-400">
                                    →
                                  </span>
                                  <span className="inline-flex items-center rounded-full bg-purple-100 px-2 py-1 text-xs font-medium text-purple-800">
                                    {interval.end}
                                  </span>
                                </div>
                              </div>
                              <p className="text-sm leading-relaxed text-gray-900">
                                {interval.description}
                              </p>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                </fieldset>

                {/* Video 2 */}
                {evaluationData?.video_link_two && (
                  <fieldset className="rounded-md border border-gray-300 p-4">
                    <legend className="text-lg font-semibold text-gray-700">
                      Video 2
                    </legend>
                    <div className="mb-2 text-sm text-gray-800">
                      <strong>Link:</strong>{' '}
                      <a
                        href={evaluationData?.video_link_two}
                        className="text-blue-500 underline"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        View Video
                      </a>{' '}
                      <span className="mx-1">|</span>
                      <strong>Jersey Color:</strong>{' '}
                      {evaluationData?.jerseyColorTwo}{' '}
                      <span className="mx-1">|</span>
                      <strong>Number:</strong> {evaluationData?.jerseyNumberTwo}{' '}
                      <span className="mx-1">|</span>
                      <strong>Position:</strong> {evaluationData?.positionTwo}
                    </div>
                    <div className="max-h-24 w-full overflow-y-auto break-words text-sm text-gray-700">
                      <strong>Description:</strong>{' '}
                      {evaluationData?.video_descriptionTwo}
                    </div>
                    <div className="mx-auto w-full max-w-4xl p-3 sm:p-6">
                      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg">
                        {/* Header */}
                        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 px-4 py-3 sm:px-6 sm:py-4">
                          <div className="flex items-center gap-2 sm:gap-3">
                            <Clock className="h-5 w-5 text-white sm:h-6 sm:w-6" />
                            <h2 className="text-lg font-semibold text-white sm:text-xl">
                              Video Timeline 2
                            </h2>
                          </div>
                        </div>

                        {/* Desktop Table - Hidden on mobile */}
                        <div className="hidden overflow-x-auto md:block">
                          <div className="max-h-60 overflow-y-auto">
                            <table className="w-full">
                              <thead>
                                <tr className="border-b border-gray-200 bg-gray-50">
                                  <th className="w-24 px-6 py-4 text-left text-sm font-semibold text-gray-900">
                                    Start Time
                                  </th>
                                  <th className="w-24 px-6 py-4 text-left text-sm font-semibold text-gray-900">
                                    End Time
                                  </th>
                                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                                    Description
                                  </th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-200">
                                {evaluationData?.videoTwoTiming === '' ? (
                                  <tr>
                                    <td
                                      colSpan={3}
                                      className="px-6 py-4 text-center text-sm text-gray-600"
                                    >
                                      Player played the full game.
                                    </td>
                                  </tr>
                                ) : (
                                  videoTwoTimeStamps.map((interval, index) => (
                                    <tr
                                      key={index}
                                      className="group transition-colors duration-150 hover:bg-gray-50"
                                    >
                                      <td className="whitespace-nowrap px-6 py-4">
                                        <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800">
                                          {interval.start}
                                        </span>
                                      </td>
                                      <td className="whitespace-nowrap px-6 py-4">
                                        <span className="inline-flex items-center rounded-full bg-purple-100 px-3 py-1 text-xs font-medium text-purple-800">
                                          {interval.end}
                                        </span>
                                      </td>
                                      <td className="px-6 py-4">
                                        <p className="text-sm leading-relaxed text-gray-900">
                                          {interval.description}
                                        </p>
                                      </td>
                                    </tr>
                                  ))
                                )}
                              </tbody>
                            </table>
                          </div>
                        </div>

                        {/* Mobile Card Layout - Visible only on mobile */}
                        <div className="max-h-60 divide-y divide-gray-200 overflow-y-auto md:hidden">
                          {evaluationData?.videoTwoTiming === '' ? (
                            <div className="p-4 text-center text-sm text-gray-600">
                              Player played the full game.
                            </div>
                          ) : (
                            videoTwoTimeStamps.map((interval, index) => (
                              <div
                                key={index}
                                className="p-4 transition-colors duration-150 hover:bg-gray-50"
                              >
                                <div className="mb-3 flex items-start justify-between gap-3">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">
                                      {interval.start}
                                    </span>
                                    <span className="text-xs text-gray-400">
                                      →
                                    </span>
                                    <span className="inline-flex items-center rounded-full bg-purple-100 px-2 py-1 text-xs font-medium text-purple-800">
                                      {interval.end}
                                    </span>
                                  </div>
                                </div>
                                <p className="text-sm leading-relaxed text-gray-900">
                                  {interval.description}
                                </p>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </div>
                  </fieldset>
                )}

                {/* Video 3 */}
                {evaluationData?.video_link_three && (
                  <fieldset className="rounded-md border border-gray-300 p-4">
                    <legend className="text-lg font-semibold text-gray-700">
                      Video 3
                    </legend>
                    <div className="mb-2 text-sm text-gray-800">
                      <strong>Link:</strong>{' '}
                      <a
                        href={evaluationData?.video_link_three}
                        className="text-blue-500 underline"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        View Video
                      </a>{' '}
                      <span className="mx-1">|</span>
                      <strong>Length:</strong>{' '}
                      {evaluationData?.videoThreeTiming} min{' '}
                      <span className="mx-1">|</span>
                      <strong>Jersey Color:</strong>{' '}
                      {evaluationData?.jerseyColorThree}{' '}
                      <span className="mx-1">|</span>
                      <strong>Number:</strong>{' '}
                      {evaluationData?.jerseyNumberThree}{' '}
                      <span className="mx-1">|</span>
                      <strong>Position:</strong> {evaluationData?.positionThree}
                    </div>
                    <div className="max-h-24 w-full overflow-y-auto break-words text-sm text-gray-700">
                      <strong>Description:</strong>{' '}
                      {evaluationData?.video_descriptionThree}
                    </div>
                  </fieldset>
                )}
              </div>
            </div>
            {/* </div> */}

            {/* Key Information */}
            <div className="rounded-lg border border-gray-300 bg-white p-6 md:col-span-1">
              <h4 className="mb-3 text-lg font-semibold">Key</h4>
              <ul className="list-none space-y-2">
                <li>[N/A] Not enough information</li>
                <li>
                  [1] Significantly below competition level – Needs major
                  improvement
                </li>
                <li>
                  [2] Far below competition level – Needs substantial
                  improvement
                </li>
                <li>[3] Below competition level – Needs improvement</li>
                <li>
                  [4] Slightly below competition level – Shows potential but
                  needs significant work
                </li>
                <li>
                  [5] Approaching competition level – Almost there but still
                  inconsistent
                </li>
                <li>[6] At competition level – Meets standard expectations</li>
                <li>
                  [7] Slightly above competition level – Consistently performs
                  well
                </li>
                <li>[8] Above competition level – Strong competitor</li>
                <li>
                  [9] Highly above competition level – Among the top performers
                </li>
                <li>
                  [10] Elite competition level – Exceptional, top-tier
                  performance
                </li>
              </ul>
            </div>
          </div>
          {isPitcherPosition && pitcherCategories.length > 0 && (
  <PitcherComponent
    categories={pitcherCategories}
    evaluationResponses={
      evaluationData?.coachInput
        ? (JSON.parse(evaluationData.coachInput) as Record<
            string,
            Record<string, string | number>
          >)
        : {}
    }
    onScoreChange={() => {}}
  />
)}
        </div>

        {/* <h1 className="p-4 text-xl font-bold mt-6 text-start text-gray-800  border-b border-gray-300">
          Goalkeeper Evaluation Form
        </h1> */}
        <div className="p-2">
          <h1 className="mt-6 border-b border-gray-300 p-4 text-start text-xl font-bold text-gray-800">
            {evaluationData?.position?.toString() === 'Goalkeeper'
              ? 'Goalkeeper Evaluation Form'
              : 'Player Evaluation Form'}
          </h1>

          {/* <div
                        className={`grid grid-cols-1 ${evaluationData?.position.toString() === 'Goalkeeper' ? 'md:grid-cols-3 xl:grid-cols-5' : 'md:grid-cols-3'} mt-6 gap-4`}
                    > */}
          {evaluationTemplateData?.categories
            ?.filter((category: Category) => category.id !== 122 && category.id !== 125)
            .map((category: Category) => {
              // Properly typed values for the category
              const valuesForCategory: Record<number, string | number | null> =
                evaluationData?.coachInput?.[category.id] ?? {};

              if (!category.attributes) return null;

              // Get average score
              const avgScoreAttribute = category.attributes.find(
                (attribute: Attribute) => attribute.name.toLowerCase() === 'avgscore'
              );
              const avgScoreValue = avgScoreAttribute
                ? valuesForCategory[avgScoreAttribute.id]
                : null;

              // Get commentary
              const commentaryAttribute = category.attributes.find((attribute: Attribute) =>
                attribute.name.toLowerCase().includes('commentary')
              );
              const commentary = commentaryAttribute
                ? valuesForCategory[commentaryAttribute.id]
                : null;

              return (
                <div key={category.id} className="mt-6 grid grid-cols-1 gap-4">
                  <div className="flex flex-col gap-16 overflow-hidden rounded-md border border-gray-300 p-4 text-black shadow-md lg:flex-row">
                    {/* Left Column: Score List */}
                    <div className="flex-[3_1_0%] flex-col rounded-md border border-gray-300 p-4 text-black">
                      <div className="bg-blue-600 px-4 py-4 text-white">
                        <h1 className="text-sm">{category.name}</h1>
                      </div>
                      <div className="flex h-auto flex-col justify-between p-4">
                        <div className="flex-grow overflow-y-auto">
                          {category.attributes.length > 0 ? (
                            <ul className="list-inside list-disc space-y-1 text-sm">
                              {category.attributes.map((attribute: Attribute, index: number) => {
                                const value = valuesForCategory[attribute.id];

                                // Skip avgscore and commentary
                                if (
                                  attribute.name.toLowerCase().includes('avgscore') ||
                                  attribute.name.toLowerCase().includes('commentary')
                                ) {
                                  return null;
                                }

                                return (
                                  <li key={attribute.id ?? index}>
                                    <span className="font-medium">
                                      <span className="md:hidden">({index + 1}) </span>
                                      {attribute.name}
                                    </span>
                                    : {value ?? 'N/A'}
                                  </li>
                                );
                              })}
                            </ul>
                          ) : (
                            <p className="text-sm italic">No scores available.</p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Middle Column: Radar Chart */}
                    <div className="flex h-full min-h-64 min-w-0 flex-[5_1_0%] flex-row items-center overflow-visible md:min-h-96">
                      <div className="hidden h-full w-full min-w-0 lg:block">
                        <EvaluationPolarCharts
                          chartData={sectionChartData(category, valuesForCategory)}
                        />
                      </div>
                      <div className="h-full w-full min-w-0 lg:hidden">
                        <EvaluationPolarCharts
                          chartData={sectionChartData(category, valuesForCategory)}
                        />
                      </div>
                    </div>

                    {/* Right Column: Average Score */}
                    <div className="m-auto flex h-[250px] flex-[2_1_0%] flex-col items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-gray-300 text-center shadow-md">
                      <div className="mb-2 text-xl font-semibold text-white lg:text-2xl">
                        {category.name} Average
                      </div>
                      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white lg:h-24 lg:w-24">
                        <span className="text-2xl font-bold text-black lg:text-3xl">
                          {avgScoreValue ?? 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Commentary Section */}
                  <div className="mt-auto w-full rounded-md border border-gray-300 bg-white p-3">
                    <label htmlFor={`remarks-${category.id}`} className="mb-2 block text-sm font-bold">
                      {category.name} Comments:
                    </label>
                    <div className="max-h-24 w-full overflow-y-auto break-words text-sm text-gray-700">
                      {commentary ?? 'No remarks provided.'}
                    </div>
                  </div>
                </div>
              );
            })}




          {/* Final Remarks Section */}
          <div className="mb-4 mt-12 grid grid-cols-2 gap-6">
            <div className="rounded-lg border border-gray-300 p-6 text-black shadow-lg">
              <label
                htmlFor="final-remarks"
                className="text-sm font-bold text-blue-600"
              >
                Additional Comments:
              </label>
              <p className="max-h-48 w-full overflow-y-auto break-words text-base leading-relaxed text-gray-800">
                {evaluationData?.finalRemarks}
              </p>
            </div>
            <div className="rounded-lg border border-gray-300 p-6 text-black shadow-lg">
              <label
                htmlFor="final-remarks"
                className="text-sm font-bold text-blue-600"
              >
                Things to Work On:
              </label>
              <p className="max-h-48 w-full overflow-y-auto break-words text-base leading-relaxed text-gray-800">
                {evaluationData?.thingsToWork}
              </p>
            </div>
          </div>
          {data && data.files && (
            <div className="mx-auto w-full p-4">
              <h1 className="mb-4 mt-8 p-4 text-start text-xl font-bold text-gray-800">
                {' '}
                Additional Documents
              </h1>
              <div className="w-full space-y-4">
                {Object.entries(data.files).map(([key, file]) =>
                  file ? (
                    // Check if file size is below the 9MB limit
                    file.size && file.size > MAX_FILE_SIZE ? (
                      <div
                        key={key}
                        className="grid grid-cols-2 gap-4 rounded border-b p-4"
                      >
                        <div className="flex flex-col items-start space-y-2 text-sm">
                          <strong>Filename:</strong>
                          <p className="text-red-600">
                            File size exceeds 9MB. Unable to display or
                            download.
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div
                        key={key}
                        className="grid grid-cols-2 gap-4 rounded border p-4"
                      >
                        {/* Left Column: File preview + download */}
                        <div className="flex flex-col items-start space-y-2 text-sm">
                          <strong className="text-sm font-bold text-gray-900">
                            Filename:
                          </strong>

                          {file.filename.match(/\.(jpg|jpeg|png)$/i) ? (
                            <>
                              <img
                                src={`${NEXT_PUBLIC_AWS_S3_BUCKET_LINK}/${file.filename}`}
                                alt="uploaded file"
                                className="h-32 w-32 border object-cover"
                              />
                              <a
                                href={`${NEXT_PUBLIC_AWS_S3_BUCKET_LINK}/${file.filename}`}
                                download
                                target="_blank"
                                rel="noopener noreferrer"
                                className="rounded bg-blue-500 px-2 py-1 text-white hover:bg-green-600"
                              >
                                <i className="fas fa-download mr-2"></i>{' '}
                                Download
                              </a>
                            </>
                          ) : file.filename.endsWith('.pdf') ? (
                            <>
                              <img
                                src="https://www.iconpacks.net/icons/2/free-pdf-download-icon-2617-thumb.png"
                                alt="pdf icon"
                                className="h-28 w-28"
                              />
                              <a
                                href={`${NEXT_PUBLIC_AWS_S3_BUCKET_LINK}/${file.filename}`}
                                download
                                target="_blank"
                                rel="noopener noreferrer"
                                className="rounded bg-blue-500 px-2 py-1 text-white hover:bg-green-600"
                              >
                                <i className="fas fa-download mr-2"></i>{' '}
                                Download
                              </a>
                            </>
                          ) : file.filename.match(/\.(mp4)$/i) ? (
                            <>
                              <video
                                controls
                                width="200"
                                height="auto"
                                className="rounded border"
                              >
                                <source
                                  src={`${NEXT_PUBLIC_AWS_S3_BUCKET_LINK}/${file.filename}`}
                                  type="video/mp4"
                                />
                              </video>
                              <a
                                href={`${NEXT_PUBLIC_AWS_S3_BUCKET_LINK}/${file.filename}`}
                                download
                                target="_blank"
                                rel="noopener noreferrer"
                                className="rounded bg-blue-500 px-2 py-1 text-white hover:bg-green-600"
                              >
                                <i className="fas fa-download mr-2"></i>{' '}
                                Download
                              </a>
                            </>
                          ) : (
                            <a
                              href={`${NEXT_PUBLIC_AWS_S3_BUCKET_LINK}/${file.filename}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 underline"
                            >
                              {file.filename}
                            </a>
                          )}
                        </div>
                        {/* Right Column: Comments */}
                        <div className="text-sm">
                          <strong className="text-sm font-bold text-gray-900">
                            Comments:
                          </strong>
                          <p className="max-h-48 w-full overflow-y-auto break-words">
                            {file.comments}
                          </p>
                        </div>
                      </div>
                    )
                  ) : null,
                )}
              </div>
            </div>
          )}
          {/* Stars and Edit/Delete only shown if rating is not null */}
          {evaluationData && (
            <div className="p-4 bg-gray-100 rounded-md max-w-md mx-auto">
              <h3 className="text-lg font-semibold mb-2">Player Feedback</h3>

              {/* Star Rating: Always show 5 stars */}
              <div className="flex items-center mb-3">
                {Array.from({ length: 5 }, (_, index) => index + 1).map((star) => (
                  <svg
                    key={star}
                    className={`w-6 h-6 ${Number(evaluationData.review_status) === 1 &&
                      star <= (evaluationData.rating ?? 0)
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

              {/* Feedback Textarea: Always show, filled or empty */}
              <div className="mb-4 p-4 bg-white border rounded-md shadow-sm">
                {/* Review Title */}
                {evaluationData.reviewTitleCustom && Number(evaluationData.review_status) === 1 && (
                  <div className="mb-3">
                    <label className="block text-sm font-semibold text-yellow-700 mb-1">
                      Review Title:
                    </label>
                    <input
                      type="text"
                      className="w-full p-2 text-sm text-gray-800 border rounded-md bg-gray-50"
                      value={evaluationData.reviewTitleCustom}
                      readOnly
                    />
                  </div>
                )}

                {/* Review Comment */}
                <div>
                  <label className="block text-sm font-semibold text-yellow-700 mb-1">
                    Feedback / Comment:
                  </label>
                  <textarea
                    className="w-full p-2 text-sm text-gray-800 border rounded-md bg-gray-50 resize-none"
                    value={
                      Number(evaluationData.review_status) === 1 && evaluationData.reviewComment
                        ? evaluationData.reviewComment
                        : ''
                    }
                    placeholder="No feedback submitted yet."
                    readOnly
                    rows={4}
                  />
                </div>
              </div>


              {/* Action Buttons */}
              <div className="flex gap-2">
                {Number(evaluationData.review_status) === 1 ? (
                  <>
                    <button
                      onClick={handleEdit}
                      className="bg-yellow-500 text-white px-4 py-2 rounded-md hover:bg-yellow-600"
                    >
                      Edit
                    </button>
                    <button
                      onClick={handleDelete}
                      className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
                    >
                      Hide
                    </button>
                  </>
                ) : Number(evaluationData.review_status) === 0 ? (
                  <button
                    onClick={handleRevert}
                    className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
                  >
                    Revert
                  </button>
                ) : null}
              </div>
            </div>
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
    </>
  );
};

export default EvaluationPage;
