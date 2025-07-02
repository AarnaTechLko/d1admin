

"use client";
export const dynamic = "force-dynamic";

import { useSearchParams } from 'next/navigation';

import React, { useEffect, useState, useRef } from 'react';
import { Evaluation } from '@/app/types/types';
import {
    Radar,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    ResponsiveContainer,
} from 'recharts';
import { format } from 'date-fns';
import Image from 'next/image';
import Loading from '@/components/Loading';
import defaultImage from '@/public/default.jpg'
import { FaFileAlt } from 'react-icons/fa';
import Swal from 'sweetalert2';


//  import parse from "html-react-parser"
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
const position = "Goalkeeper"; // or any dynamic value

const headerMetrics = ['Technical Average', 'Tactical Average', 'Distribution Average', 'Physical Average', 'Organization Average'];

const radarSkills =
    position === "Goalkeeper"
        ? [
            { label: 'Technical Average', key: 'technicalAverage' },
            { label: 'Tactical Average', key: 'tacticalAverage' },
            { label: 'Distribution Average', key: 'distributionAverage' },
            { label: 'Physical Average', key: 'physicalAverage' },
            { label: 'Organization Average', key: 'organizationAverage' }
        ]
        : [
            { label: 'Technical Average', key: 'technicalAverage' },
            { label: 'Tactical Average', key: 'tacticalAverage' },
            { label: 'Physical Average', key: 'physicalAverage' }
        ];


function EvaluationPage() {
    const searchParams = useSearchParams();
    const evaluationId = searchParams.get('evaluationId');
    const [headerRatings, setHeaderRatings] = useState<number[]>(Array(headerMetrics.length).fill(0));
    const [skillRatings, setSkillRatings] = useState<number[]>(Array(radarSkills.length).fill(0));
    const [isSubmitting, setIsSubmitting] = useState(false);

    // const {evaluationId } = searchParams; // Get evaluationId from searchParams
    const [evaluationData, setEvaluationData] = useState<Evaluation | null>(null); // State to store evaluation data
    const [error, setError] = useState<string | null>(null); // State to handle errors
    const [technicalScores, setTechnicalScores] = useState<{ [key: string]: string }>({});
    const [tacticalScores, setTacticalScores] = useState<{ [key: string]: string }>({});
    const [physicalScores, setPhysicalScores] = useState<{ [key: string]: string }>({});
    const [distributionScores, setDistributionScores] = useState<{ [key: string]: string }>({});
    const [organizationScores, setOrganizationScores] = useState<{ [key: string]: string }>({});
    const [loading, setLoading] = useState<boolean>(true);
    // const [userType, setUserType] = useState<string | null>(null);
    // const [playerId, setPlayerId] = useState<number>(0);
    const [data, setData] = useState<AbilityData | null>(null);
    // const [abilities, setAbilities] = useState<AbilityData[]>([]);
    const MAX_FILE_SIZE = 9 * 1024 * 1024; // 9MB

    const [showModal, setShowModal] = useState(false);
    const [newRemarks, setNewRemarks] = useState<string>(evaluationData?.remarks ?? '');

    const [newRating, setNewRating] = useState(evaluationData?.rating || 0);
    // const [isHidden, setIsHidden] = useState(false);

    // const [rating, setRating] = useState<number>(0);
    // const [hover, setHover] = useState<number>(0);
    // const [remarks, setRemarks] = useState<string>('');
    // const [isRatingSubmitted, setIsRatingSubmitted] = useState(false);

    const formattedDate = evaluationData?.updated_at ? format(new Date(evaluationData.updated_at), 'MM/dd/yyyy') : '';

    const pdfRef = useRef<HTMLDivElement>(null);

    const [formData, setFormData] = useState({

        speed: '',
        comm_persistence: '',
        comm_aggression: '',
        comm_alertness: '',
        exe_scoring: '',
        exe_receiving: '',
        exe_passing: '',
        dec_mobility: '',
        dec_anticipation: '',
        dec_pressure: '',
        soc_speedEndurance: '',
        soc_strength: '',
        soc_explosiveMovements: '',

        superStrengths: '',
        developmentAreas: '',
        idpGoals: '',
        keySkills: '',
        attacking: '',
        defending: '',
        transitionDefending: '',
        transitionAttacking: '',
    });

    // const getRatingBgClass = (value: string) => {
    //   switch (value.toLowerCase()) {
    //     case "excellent":
    //       return " text-yellow-400 rounded";
    //     case "positive":
    //       return " text-cyan-400  rounded";
    //     case "neutral":
    //       return " text-blue-300 rounded";
    //     default:
    //       return "";
    //   }
    // };

    useEffect(() => {
        if (evaluationId) {
            fetch(`/api/ability?evaluationId=${evaluationId}`)
                .then((res) => res.json())
                .then((result) => {
                    console.log("API result:", result); // Log the full response
                    if (result.ability) {
                        setData(result.ability); // If ability data exists, update the state
                    } else {
                        // alert('Unable to fetch data');
                        console.log('Unable to fetch data ');
                    }
                })
                .catch((error) => {
                    console.error('Error fetching data:', error);
                    alert('Error fetching data');
                });
        }
    }, [evaluationId]);





    const fetchEvaluationData = async () => {
        // const session = await getSession();
        // if (session) {
        //     setUserType(session.user.type);
        //     setPlayerId(Number(session.user.id)); // Assuming 'role' is stored in session
        // }
        try {
            const response = await fetch(`/api/evaluationdetails?evaluationId=${evaluationId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            if (!response.ok) {
                setLoading(false);
                throw new Error('Failed to fetch evaluation data');
            }

            const data = await response.json();
            console.log("evaluation", data);

            if (!data?.result) {
                throw new Error("No evaluation data found in response");
            }
            setEvaluationData(data.result as Evaluation); // Type assertion here
            console.log("evaliation data:", data.result as Evaluation);
            setPhysicalScores(JSON.parse(data.result.physicalScores));
            setTacticalScores(JSON.parse(data.result.tacticalScores));
            setTechnicalScores(JSON.parse(data.result.technicalScores));
            setOrganizationScores(JSON.parse(data.result.organizationScores));
            setDistributionScores(JSON.parse(data.result.distributionScores));
            setDistributionScores(JSON.parse(data.result.distributionScores));
            setFormData({
                speed: data.result.speed || "",
                comm_persistence: data.result.comm_persistence || "",
                comm_aggression: data.result.comm_aggression || "",
                comm_alertness: data.result.comm_alertness || "",
                exe_scoring: data.result.exe_scoring || "",
                exe_receiving: data.result.exe_receiving || "",
                exe_passing: data.result.exe_passing || "",
                dec_mobility: data.result.dec_mobility || "",
                dec_anticipation: data.result.dec_anticipation || "",
                dec_pressure: data.result.dec_pressure || "",
                soc_speedEndurance: data.result.soc_speedEndurance || "",
                soc_strength: data.result.soc_strength || "",
                soc_explosiveMovements: data.result.soc_explosiveMovements || "",
                // ratings: data.ratings || "",
                superStrengths: data.result.superStrengths || "",
                developmentAreas: data.result.developmentAreas || "",
                idpGoals: data.result.idpGoals || "",
                keySkills: data.result.keySkills || "",
                attacking: data.result.attacking || "",
                defending: data.result.defending || "",
                transitionDefending: data.result.transitionDefending || "",
                transitionAttacking: data.result.transitionAttacking || "",
            });
            setHeaderRatings([
                data.result.technicalAverage,

                data.result.tacticalAverage,
                data.result.distributionAverage,
                data.result.physicalAverage,
                data.result.organizationAverage,
            ]);

            setSkillRatings(radarSkills.map(skill => data.result[skill.key] || 0));

            setLoading(false);
            // Set the fetched evaluation data
        } catch (error) {
            console.error('Error fetching evaluation data:', error);
            setError('Failed to fetch evaluation data'); // Set error message
        }
    };
    const calculateAverage = (scores: Record<string, string | number>) => {
        const values = Object.values(scores)
            .map(Number)
            .filter((v) => !isNaN(v));
        if (values.length === 0) return 0;
        const avg = values.reduce((a, b) => a + b, 0) / values.length;
        return Math.round(avg * 10) / 10; // Round to 1 decimal
    };
    useEffect(() => {

        fetchEvaluationData();
    }, []);
    if (loading) {
        return <Loading />;
    }

    const chartData = radarSkills
        .filter((skill) => {
            if (position === "Goalkeeper") {
                return true; // Include all skills for Goalkeeper
            }
            // Exclude Distribution and Organization for non-Goalkeepers
            return skill.key !== "distributionAverage" && skill.key !== "organizationAverage";
        })
        .map((skill) => {
            let averageValue = 0;

            // Get the average value for each skill
            switch (skill.key) {
                case "technicalAverage":
                    averageValue = calculateAverage(technicalScores); // Use the average for technical scores
                    break;
                case "tacticalAverage":
                    averageValue = calculateAverage(tacticalScores); // Use the average for tactical scores
                    break;
                case "distributionAverage":
                    averageValue = calculateAverage(distributionScores); // Use the average for distribution scores
                    break;
                case "physicalAverage":
                    averageValue = calculateAverage(physicalScores); // Use the average for physical scores
                    break;
                case "organizationAverage":
                    averageValue = calculateAverage(organizationScores); // Use the average for organization scores
                    break;
                default:
                    averageValue = 0; // Default to 0 if no match
            }

            return {
                subject: skill.label,
                A: averageValue, // Use the calculated average value
            };
        });

    const calculateOverallAverage = () => {
        let total = 0;
        let count = 0;

        // Add averages if they exist (ensuring no undefined values)
        if (technicalScores) {
            total += calculateAverage(technicalScores);
            count += 1;
        }
        if (tacticalScores) {
            total += calculateAverage(tacticalScores);
            count += 1;
        }
        if (position === "Goalkeeper") {
            if (distributionScores) {
                total += calculateAverage(distributionScores);
                count += 1;
            }
            if (organizationScores) {
                total += calculateAverage(organizationScores);
                count += 1;
            }
        }
        if (physicalScores) {
            total += calculateAverage(physicalScores);
            count += 1;
        }

        // Calculate and return the overall average
        return count > 0 ? (total / count).toFixed(2) : "N/A";
    };
    const handleEdit = () => {
        setNewRating(evaluationData?.rating || 0);
        setNewRemarks(evaluationData?.remarks ?? '');

        setShowModal(true);
    };

    const submitEdit = async () => {
        if (!evaluationData) return;
    setIsSubmitting(true);

        const res = await fetch(`/api/evaluationdetails/${evaluationId}/rating`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                rating: newRating,
                remarks: newRemarks,

            }),
        });

        if (res.ok) {
            setShowModal(false);
            await Swal.fire({
                icon: 'success',
                title: 'Rating Updated',
                text: 'The player rating has been updated successfully.',
                timer: 2000,
                showConfirmButton: false,
            });
            location.reload();
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Update Failed',
                text: 'Failed to update the rating. Please try again.',
            });
                setIsSubmitting(true);

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
                setEvaluationData(prev => prev ? { ...prev, reviewStatus: 0 } : prev);
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
            {/* Hidden ratings section */}
            <div style={{ display: 'none' }}>
                {headerRatings.map((rating, index) => (
                    <div key={index}>
                        <h4>{headerMetrics[index]}</h4>
                        <p>Rating: {rating}</p>
                    </div>
                ))}

                {skillRatings.map((rating, index) => (
                    <div key={index}>
                        <p>Rating: {rating}</p>
                    </div>
                ))}

                {error && (
                    <div className="text-red-600 mb-4">
                        <p>Error: {error}</p>
                    </div>
                )}

                <h2>Form Data</h2>
                {Object.entries(formData).map(([key, value]) => (
                    <div key={key}>
                        <h4>{key}</h4>
                        <p>{value}</p>
                    </div>
                ))}
            </div>


            <div className="w-full  mx-auto bg-white">
                <div className="p-6 border border-gray-300 rounded-lg font-sans" >
                    {/* Evaluation Form Header - Full Width */}
                    <div className="w-full mb-0">
                        <div className="bg-white p-6 border border-gray-300 rounded-lg">
                            <div className="flex justify-between border-b border-gray-300 pb-3 mb-0 flex-wrap">
                                <h2 className="text-xl font-bold">Evaluation Form</h2>
                                <div className="flex flex-col items-end">
                                    {/* <span className="text-white bg-blue-500  px-3 py-2 rounded ">Completed</span> */}
                                    <div
                                        className=" bg-green-600 text-white text-sm w-24 h-8 leading-8 text-center rounded uppercase shadow-md cursor-pointer">
                                        Completed
                                    </div>

                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Player Information and Key Information - Side by Side */}
                    {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-4"> */}
                    {/* Player Information */}

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 sm:p-6">
                        {/* Player Information Section */}
                        {/* <div className="bg-white p-4 sm:p-6 border border-gray-300 rounded-lg md:col-span-2 relative"> */}
                        <div className="relative bg-white p-4 sm:p-6 border border-gray-300 rounded-lg md:col-span-2">

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* LEFT COLUMN */}
                                <div className="space-y-4">
                                    {/* Review Title */}
                                    <div>
                                        <h3 className="text-lg font-semibold break-words">
                                            Review Title:{" "}
                                            <span className="font-normal">
                                                {evaluationData?.reviewTitle || "N/A"}
                                            </span>

                                        </h3>
                                    </div>

                                    {/* Player Info */}
                                    <div className="flex items-center gap-3">
                                        <strong>Player:</strong>
                                        <Image
                                            src={
                                                evaluationData?.image && evaluationData?.image !== "null"
                                                    ? evaluationData?.image
                                                    : defaultImage
                                            }
                                            alt="Player Avatar"
                                            className="w-12 h-12 rounded-full object-cover"
                                            width={48}
                                            height={48}
                                        />
                                        <span className="text-gray-700 break-words">
                                            <a
                                                href={`/players/${evaluationData?.playerSlug}`}
                                                className="text-blue-700"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                {evaluationData?.first_name} {evaluationData?.last_name}
                                            </a>
                                        </span>
                                    </div>

                                    {/* Coach Info */}
                                    <div className="flex items-center gap-3">
                                        <strong>Coach:</strong>
                                        <Image
                                            src={
                                                evaluationData?.coachimage &&
                                                    evaluationData?.coachimage !== "null"
                                                    ? evaluationData?.coachimage
                                                    : defaultImage
                                            }
                                            alt="Coach Avatar"
                                            className="w-12 h-12 rounded-full object-cover"
                                            width={48}
                                            height={48}
                                        />
                                        <span className="text-gray-700 break-words">
                                            <a
                                                href={`/coach/${evaluationData?.coachSlug}`}
                                                className="text-blue-700"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                {evaluationData?.coachFirstName} {evaluationData?.coachLastName}
                                            </a>
                                        </span>
                                    </div>

                                    <div>
                                        <strong>Date Completed:</strong> <span>{formattedDate}</span>
                                    </div>

                                    {evaluationData?.document && (
                                        <div className="flex flex-wrap items-center gap-2">
                                            <strong>View / Download Additional Document:</strong>
                                            <a
                                                href={evaluationData?.document}
                                                className="text-blue-700 text-sm flex items-center gap-1"
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
                                    <div className="hidden md:block absolute top-0 right-0 m-4">
                                        <div className="flex flex-col items-center justify-center border rounded-xl p-4 bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg w-36 md:w-40">
                                            <div className="text-sm md:text-base font-semibold mb-2 text-center">Overall Average</div>
                                            <div className="bg-white text-blue-700 border-4 border-white rounded-full font-bold text-lg md:text-xl shadow-inner w-16 h-16 md:w-20 md:h-20 flex items-center justify-center">
                                                {calculateOverallAverage()}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Only shows on small screens: below Date Completed */}
                                    <div className="block md:hidden mt-4">
                                        <div className="flex flex-col items-center justify-center border rounded-xl p-4 bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg w-full max-w-xs mx-auto">
                                            <div className="text-sm font-semibold mb-2 text-center">Overall Average</div>
                                            <div className="bg-white text-blue-700 border-4 border-white rounded-full font-bold text-lg shadow-inner w-16 h-16 flex items-center justify-center">
                                                {calculateOverallAverage()}
                                            </div>
                                        </div>
                                    </div>
                                </div>


                            </div>

                            {/* Videos */}
                            <div className="mt-6 space-y-6">
                                {/* Video 1 */}
                                <fieldset className="border border-gray-300 rounded-md p-4">
                                    <legend className="text-lg font-semibold text-gray-700">Video 1</legend>
                                    <div className="mb-2 text-sm text-gray-800">
                                        <strong>Link:</strong>{" "}
                                        <a
                                            href={evaluationData?.primary_video_link}
                                            className="text-blue-500 underline"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            View Video
                                        </a>{" "}
                                        <span className="mx-1">|</span>
                                        <strong>Length:</strong> {evaluationData?.videoOneTiming} min{" "}
                                        <span className="mx-1">|</span>
                                        <strong>Jersey Color:</strong> {evaluationData?.jerseyColorOne}{" "}
                                        <span className="mx-1">|</span>
                                        <strong>Number:</strong> {evaluationData?.jerseyNumber}{" "}
                                        <span className="mx-1">|</span>
                                        <strong>Position(s):</strong> {evaluationData?.positionOne}
                                    </div>
                                    <div className="text-sm text-gray-700">
                                        <strong>Description:</strong> {evaluationData?.video_description}
                                    </div>
                                </fieldset>

                                {/* Video 2 */}
                                {evaluationData?.video_link_two && (
                                    <fieldset className="border border-gray-300 rounded-md p-4">
                                        <legend className="text-lg font-semibold text-gray-700">
                                            Video 2
                                        </legend>
                                        <div className="mb-2 text-sm text-gray-800">
                                            <strong>Link:</strong>{" "}
                                            <a
                                                href={evaluationData?.video_link_two}
                                                className="text-blue-500 underline"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                View Video
                                            </a>{" "}
                                            <span className="mx-1">|</span>
                                            <strong>Length:</strong> {evaluationData?.videoTwoTiming} min{" "}
                                            <span className="mx-1">|</span>
                                            <strong>Jersey Color:</strong> {evaluationData?.jerseyColorTwo}{" "}
                                            <span className="mx-1">|</span>
                                            <strong>Number:</strong> {evaluationData?.jerseyNumberTwo}{" "}
                                            <span className="mx-1">|</span>
                                            <strong>Position:</strong> {evaluationData?.positionTwo}
                                        </div>
                                        <div className="text-sm text-gray-700">
                                            <strong>Description:</strong> {evaluationData?.video_descriptionTwo}
                                        </div>
                                    </fieldset>
                                )}

                                {/* Video 3 */}
                                {evaluationData?.video_link_three && (
                                    <fieldset className="border border-gray-300 rounded-md p-4">
                                        <legend className="text-lg font-semibold text-gray-700">
                                            Video 3
                                        </legend>
                                        <div className="mb-2 text-sm text-gray-800">
                                            <strong>Link:</strong>{" "}
                                            <a
                                                href={evaluationData?.video_link_three}
                                                className="text-blue-500 underline"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                View Video
                                            </a>{" "}
                                            <span className="mx-1">|</span>
                                            <strong>Length:</strong> {evaluationData?.videoThreeTiming} min{" "}
                                            <span className="mx-1">|</span>
                                            <strong>Jersey Color:</strong> {evaluationData?.jerseyColorThree}{" "}
                                            <span className="mx-1">|</span>
                                            <strong>Number:</strong> {evaluationData?.jerseyNumberThree}{" "}
                                            <span className="mx-1">|</span>
                                            <strong>Position:</strong> {evaluationData?.positionThree}
                                        </div>
                                        <div className="text-sm text-gray-700">
                                            <strong>Description:</strong>{" "}
                                            {evaluationData?.video_descriptionThree}
                                        </div>
                                    </fieldset>
                                )}
                            </div>
                        </div>
                        {/* </div> */}

                        {/* Key Information */}
                        <div className="bg-white p-6 border border-gray-300 rounded-lg md:col-span-1">
                            <h4 className="text-lg font-semibold mb-3">Key</h4>
                            <ul className="list-none space-y-2">
                                <li>[1] Significantly below competition level – Needs major improvement</li>
                                <li>[2] Far below competition level – Needs substantial improvement</li>
                                <li>[3] Below competition level – Needs improvement</li>
                                <li>[4] Slightly below competition level – Shows potential but needs significant work</li>
                                <li>[5] Approaching competition level – Almost there but still inconsistent</li>
                                <li>[6] At competition level – Meets standard expectations</li>
                                <li>[7] Slightly above competition level – Consistently performs well</li>
                                <li>[8] Above competition level – Strong competitor</li>
                                <li>[9] Highly above competition level – Among the top performers</li>
                                <li>[10] Elite competition level – Exceptional, top-tier performance</li>
                            </ul>
                        </div>
                    </div>
                </div>
                {/* Body: Skills sidebar + Radar */}
                <div className="p-5 flex flex-row gap-8">
                    <div className="flex flex-col gap-2">
                        {radarSkills.map((skill, i) => (
                            <div key={i} className="flex items-center justify-center gap-2">
                                {/* Conditionally render skills based on position */}
                                {(position === "Goalkeeper" || (position !== "Goalkeeper" && skill.key !== "distributionAverage" && skill.key !== "organizationAverage")) && (
                                    <div>

                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
                <div className="radar-chart-container px-4 py-6">
                    <div
                        ref={pdfRef}
                        className="flex flex-col md:flex-row gap-8 items-stretch justify-center"
                    >
                        {/* Left: Radar Chart Column */}
                        <div className="w-full sm:w-[75%] md:w-[45%] lg:w-[50%] xl:w-[40%] h-[250px] sm:h-[300px] md:h-[400px] lg:h-[450px] xl:h-[500px] border border-gray-300 rounded-xl shadow-md bg-white flex items-center justify-center">
                            <ResponsiveContainer width="100%" height="100%">
                                <RadarChart
                                    cx="50%"
                                    cy="50%"
                                    outerRadius="50%"
                                    data={chartData}
                                >
                                    <PolarGrid />
                                    <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10 }} />
                                    <PolarRadiusAxis angle={80} domain={[0, 10]} tickCount={11} tick={{ fontSize: 10 }} />
                                    <Radar
                                        name="Player"
                                        dataKey="A"
                                        stroke="#1e40af"
                                        fill="#3b82f6"
                                        fillOpacity={0.5}
                                    />
                                </RadarChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Right: Metrics Table Column */}
                        <div className="flex-1 border border-gray-300 rounded-xl shadow-md p-6 bg-white flex flex-col items-center">
                            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-4 ">
                                {[
                                    { title: 'Technical', value: calculateAverage(technicalScores) },
                                    { title: 'Tactical', value: calculateAverage(tacticalScores) },
                                    position === 'Goalkeeper' && { title: 'Distribution', value: calculateAverage(distributionScores) },
                                    { title: 'Physical', value: calculateAverage(physicalScores) },
                                    position === 'Goalkeeper' && { title: 'Organization', value: calculateAverage(organizationScores) },
                                ]
                                    .filter((metric): metric is { title: string; value: number } => metric !== false)
                                    .map((metric, index) => (
                                        <div
                                            key={index}
                                            className="aspect-square w-[160px] h-[140px]  p-4 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex flex-col items-center justify-center shadow-md"
                                        >
                                            <div className="text-white font-semibold text-sm mb-2 text-center">
                                                {metric.title} Average
                                            </div>
                                            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white flex items-center justify-center">
                                                <span className="text-blue-700 font-bold text-lg sm:text-xl">
                                                    {metric.value}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        </div>
                    </div>


                </div>
                {/* <h1 className="p-4 text-xl font-bold mt-6 text-start text-gray-800  border-b border-gray-300">
          Goalkeeper Evaluation Form
        </h1> */}
                <div className="p-2">
                    <h1 className="p-4 text-xl font-bold mt-6 text-start text-gray-800 border-b border-gray-300">
                        {evaluationData?.position?.toString() === 'Goalkeeper'
                            ? 'Goalkeeper Evaluation Form'
                            : 'Player Evaluation Form'}
                    </h1>

                    <div className={` ${evaluationData?.position.toString() === 'Goalkeeper' ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 ' : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'} gap-4 mt-6`}>

                        {/* Technical Section */}
                        <div className="text-black border border-gray-300 rounded-md flex flex-col overflow-hidden shadow-md">
                            {/* Heading Row */}
                            <div className="bg-blue-600 text-white px-4 py-4">
                                <h1 className="text-sm">Technical</h1>
                            </div>
                            {/* Content Section with fixed height and flex column layout */}
                            <div className="p-4 flex flex-col justify-between h-auto">
                                {/* Score List */}
                                <div className="flex-grow overflow-y-auto">
                                    {technicalScores ? (
                                        <ul className="list-disc list-inside space-y-1 text-sm">
                                            {Object.entries(technicalScores).map(([key, value]) => (
                                                <li key={key}>
                                                    <span className="font-medium">{key}</span>: {value}
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p className="text-sm italic">No Technical scores available.</p>
                                    )}
                                </div>
                                {/* Comment Section */}
                                <div className="mt-4  w-full border border-gray-300 bg-white rounded-md p-3">
                                    <label htmlFor={`remarks-tech`} className="text-sm font-medium font-bold block mb-2">
                                        Comments:
                                    </label>
                                    <div className="text-sm text-gray-700">
                                        {evaluationData?.technicalRemarks || "No remarks provided."}
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* Tactical Section */}
                        <div className="text-black border border-gray-300 rounded-md flex flex-col overflow-hidden shadow-md">
                            <div className="bg-blue-600 text-white px-4 py-4">
                                <h1 className="text-sm ">Tactical</h1>
                            </div>
                            {/* Main content wrapper to push comments to bottom */}
                            <div className="p-4 flex flex-col justify-between h-auto"> {/* Adjust height as needed */}
                                <div className="flex-grow overflow-y-auto">
                                    {tacticalScores ? (
                                        <ul className="list-disc list-inside space-y-1 text-sm">
                                            {Object.entries(tacticalScores).map(([key, value]) => (
                                                <li key={key}>
                                                    <span className="font-medium">{key}</span>: {value}
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p>No Tactical scores available.</p>
                                    )}
                                </div>
                                {/* Comment section at bottom */}
                                <div className="mt-4 border border-gray-300 bg-white rounded-md p-3">
                                    <label htmlFor={`remarks-tact`} className="text-sm font-medium">Comments:</label>
                                    <div className="text-sm text-gray-700">
                                        {evaluationData?.tacticalRemarks}
                                    </div>
                                </div>
                            </div>
                        </div>
                        {evaluationData?.position.toString() === 'Goalkeeper' && (
                            <div className="text-black border border-gray-300 rounded-md flex flex-col overflow-hidden shadow-md">
                                <div className="bg-blue-600 text-white px-4 py-4">
                                    <h1 className="text-sm">Distribution</h1>
                                </div>
                                {/* Content section with consistent layout */}
                                <div className="p-4 flex flex-col justify-between h-auto">
                                    {/* Score List */}
                                    <div className="flex-grow overflow-y-auto">
                                        {distributionScores ? (
                                            <ul className="list-disc list-inside space-y-1 text-sm">
                                                {Object.entries(distributionScores).map(([key, value]) => (
                                                    <li key={key}>
                                                        <span className="font-medium">{key}</span>: {value}
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <p className="text-sm italic">No Distribution scores available.</p>
                                        )}
                                    </div>
                                    {/* Comment Section */}
                                    <div className="mt-4 border border-gray-300 bg-white rounded-md p-3">
                                        <label htmlFor={`remarks-distribution`} className="text-sm font-medium block mb-2">
                                            Comments:
                                        </label>
                                        <div className="text-sm text-gray-700">
                                            {evaluationData?.distributionRemarks || "No remarks provided."}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div className="text-black border border-gray-300 rounded-md flex flex-col overflow-hidden shadow-md">
                            <div className="bg-blue-600 text-white px-4 py-4">
                                <h1 className="text-sm">Physical</h1>
                            </div>
                            <div className="p-4 flex flex-col justify-between h-auto">
                                {/* Score List */}
                                <div className="flex-grow overflow-y-auto">
                                    {physicalScores ? (
                                        <ul className="list-disc list-inside space-y-1 text-sm">
                                            {Object.entries(physicalScores).map(([key, value]) => (
                                                <li key={key}>
                                                    <span className="font-medium">{key}</span>: {value}
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p className="text-sm italic">No physical scores available.</p>
                                    )}
                                </div>

                                {/* Comment Section */}
                                <div className="mt-4 border border-gray-300 bg-white rounded-md p-3">
                                    <label htmlFor={`remarks-tech`} className="text-sm font-medium  font-bold block mb-2">
                                        Comments:
                                    </label>
                                    <div className="text-sm text-gray-700">
                                        {evaluationData?.physicalRemarks || "No remarks provided."}
                                    </div>
                                </div>
                            </div>
                        </div>
                        {evaluationData?.position.toString() === 'Goalkeeper' && (
                            <div className="text-black border border-gray-300 rounded-md flex flex-col overflow-hidden shadow-md">
                                <div className="bg-blue-600 text-white px-4 py-4">
                                    <h1 className="text-sm">Organization</h1>
                                </div>
                                <div className="p-4 flex flex-col justify-between h-auto">
                                    {/* Score List */}
                                    <div className="flex-grow overflow-y-auto">
                                        {organizationScores ? (
                                            <ul className="list-disc list-inside space-y-1 text-sm">
                                                {Object.entries(organizationScores).map(([key, value]) => (
                                                    <li key={key}>
                                                        <span className="font-medium">{key}</span>: {value}
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <p className="text-sm italic">No Organization scores available.</p>
                                        )}
                                    </div>
                                    {/* Comment Section */}
                                    <div className="mt-4 border border-gray-300 bg-white rounded-md p-3">
                                        <label htmlFor={`remarks-org`} className="text-sm font-medium block mb-2">Comments:</label>
                                        <div className="text-sm text-gray-700">
                                            {evaluationData?.organizationalRemarks || "No remarks provided."}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>


                    {/* Final Remarks Section */}
                    <div className="mt-12 mb-4 grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="text-black p-6 border border-gray-300 rounded-lg shadow-lg">
                            <label htmlFor="final-remarks" className="text-sm font-bold text-blue-600 ">
                                Additional Comments:
                            </label>
                            <p className="text-gray-800 text-base leading-relaxed">{evaluationData?.finalRemarks}</p>
                        </div>
                        <div className="text-black p-6 border border-gray-300 rounded-lg shadow-lg">
                            <label htmlFor="final-remarks" className="text-sm font-bold text-blue-600 ">
                                Things to Work On:
                            </label>
                            <p className="text-gray-800 text-base leading-relaxed">{evaluationData?.thingsToWork}</p>
                        </div>
                    </div>
                    {data && data.files && (
                        <div className="w-full mx-auto p-4">
                            <h1 className='p-4 text-xl font-bold mt-8 mb-4 text-start text-gray-800  '> Evaluation Documents</h1>
                            <div className="space-y-4 w-full">
                                {Object.entries(data.files).map(([key, file]) =>
                                    file ? (
                                        // Check if file size is below the 9MB limit
                                        file.size && file.size > MAX_FILE_SIZE ? (
                                            <div key={key} className="grid grid-cols-1 md:grid-cols-2 gap-4 border-b p-4 rounded">
                                                <div className="text-sm flex flex-col items-start space-y-2">
                                                    <strong>Filename:</strong>
                                                    <p className="text-red-600">File size exceeds 9MB. Unable to display or download.</p>
                                                </div>
                                            </div>
                                        ) : (
                                            <div key={key} className="grid grid-cols-1 md:grid-cols-2  gap-4 border p-4 rounded">
                                                {/* Left Column: File preview + download */}
                                                <div className="text-sm flex flex-col items-start space-y-2">
                                                    <strong className="text-sm font-bold text-gray-900 ">Filename:</strong>

                                                    {file.filename.match(/\.(jpg|jpeg|png)$/i) ? (
                                                        <>
                                                            <img
                                                                src={file.filename}
                                                                alt="uploaded file"
                                                                className="w-32 h-32 object-cover border"
                                                            />
                                                            <a
                                                                href={file.filename}
                                                                download
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-green-600"
                                                            >
                                                                <i className="fas fa-download mr-2"></i> Download
                                                            </a>
                                                        </>
                                                    ) : file.filename.endsWith('.pdf') ? (
                                                        <>
                                                            <img
                                                                src="https://www.iconpacks.net/icons/2/free-pdf-download-icon-2617-thumb.png"
                                                                alt="pdf icon"
                                                                className="w-28 h-28"
                                                            />
                                                            <a
                                                                href={file.filename}
                                                                download
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-green-600"
                                                            >
                                                                <i className="fas fa-download mr-2"></i> Download
                                                            </a>
                                                            {/* <a
                      href={file.filename}
                      data-type="pdf"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hidden"
                      aria-hidden="true"
                    >
                      {file.filename}
                    </a> */}
                                                        </>
                                                    ) : file.filename.match(/\.(mp4)$/i) ? (
                                                        <>
                                                            <video controls width="200" height="auto" className="rounded border">
                                                                <source src={file.filename} type="video/mp4" />
                                                            </video>
                                                            <a
                                                                href={file.filename}
                                                                download
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-green-600"
                                                            >
                                                                <i className="fas fa-download mr-2"></i> Download
                                                            </a>
                                                        </>
                                                    ) : (
                                                        <a
                                                            href={file.filename}
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
                                                    <strong className="text-sm font-bold text-gray-900 ">Comments:</strong>
                                                    <p>{file.comments}</p>
                                                </div>
                                            </div>
                                        )
                                    ) : null
                                )}
                            </div>

                        </div>
                    )}


                    {/* {evaluationData && evaluationData.rating !== null && (

    <div className="p-4 bg-white shadow-md rounded-md max-w-md mx-auto">
            <h3 className="text-lg font-semibold mb-2">Player Feedback</h3>
            <div className="flex items-center mb-2">
                {Array.from({ length: 5 }, (_, index) => index + 1).map(star => (
                    <svg
                        key={star}
                        className={`w-6 h-6 ${star <= evaluationData.rating ? 'text-yellow-500' : 'text-gray-300'}`}
                        xmlns="http://www.w3.org/2000/svg"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path d="M12 .587l3.668 7.431 8.21 1.192-5.938 5.784 1.404 8.189L12 18.897l-7.344 3.866 1.404-8.189L.122 9.21l8.21-1.192L12 .587z" />
                    </svg>
                ))}
            </div>

            <div className="flex gap-2">
                <button onClick={handleEdit} className="bg-yellow-500 text-white px-4 py-2 rounded-md hover:bg-yellow-600">
                    Edit
                </button>
                <button onClick={handleDelete} className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600">
                    Delete
                </button>
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-md shadow-lg w-[90%] max-w-sm">
                        <h3 className="text-lg font-bold mb-4">Edit Rating</h3>
                        <div className="flex justify-center gap-2 mb-4">
                            {Array.from({ length: 5 }, (_, index) => index + 1).map(star => (
                                <svg
                                    key={star}
                                    onClick={() => setNewRating(star)}
                                    className={`w-8 h-8 cursor-pointer ${star <= newRating ? 'text-yellow-500' : 'text-gray-300'}`}
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path d="M12 .587l3.668 7.431 8.21 1.192-5.938 5.784 1.404 8.189L12 18.897l-7.344 3.866 1.404-8.189L.122 9.21l8.21-1.192L12 .587z" />
                                </svg>
                            ))}
                        </div>
                        <div className="flex justify-end gap-2">
                            <button onClick={() => setShowModal(false)} className="px-4 py-2 bg-gray-300 rounded-md">Cancel</button>
                            <button onClick={submitEdit} className="px-4 py-2 bg-green-500 text-white rounded-md">Save</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
                  )} */}


                    {/* Stars and Edit/Delete only shown if rating is not null */}
                  {evaluationData && (
  <div className="p-4 bg-gray-100 rounded-md max-w-md mx-auto">
    <h3 className="text-lg font-semibold mb-2">Player Feedback</h3>

    {/* Star Rating: Always show 5 stars */}
    <div className="flex items-center mb-3">
      {Array.from({ length: 5 }, (_, index) => index + 1).map((star) => (
        <svg
          key={star}
          className={`w-6 h-6 ${
            Number(evaluationData.review_status) === 1 &&
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
    <div className="mb-4">
      <label className="block text-sm font-semibold text-yellow-700 mb-1">Feedback:</label>
      <textarea
        className="w-full p-2 text-sm text-gray-800 border rounded-md bg-white resize-none"
        value={
          Number(evaluationData.review_status) === 1 && evaluationData.remarks
            ? evaluationData.remarks
            : ''
        }
        placeholder="No feedback submitted yet."
        readOnly
        rows={4}
      />
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
                            <div className="bg-white p-6 rounded-md shadow-lg w-[90%] max-w-sm">
                                <h3 className="text-lg font-bold mb-4">Edit Feedback</h3>

                                {/* Star Rating */}
                                <div className="flex justify-center gap-2 mb-4">
                                    {Array.from({ length: 5 }, (_, index) => index + 1).map((star) => (
                                        <svg
                                            key={star}
                                            onClick={() => setNewRating(star)}
                                            className={`w-8 h-8 cursor-pointer ${star <= newRating ? 'text-yellow-500' : 'text-gray-300'
                                                }`}
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path d="M12 .587l3.668 7.431 8.21 1.192-5.938 5.784 1.404 8.189L12 18.897l-7.344 3.866 1.404-8.189L.122 9.21l8.21-1.192L12 .587z" />
                                        </svg>
                                    ))}
                                </div>

                                {/* Textarea for Remarks */}
                                <textarea
                                    value={newRemarks}
                                    onChange={(e) => setNewRemarks(e.target.value)}
                                    placeholder="Enter feedback..."
                                    className="w-full border border-gray-300 rounded-md p-2 mb-4"
                                    rows={4}
                                />

                                {/* Buttons */}
                                <div className="flex justify-end gap-2">
                                    <button
                                        onClick={() => setShowModal(false)}
                                        className="px-4 py-2 bg-gray-300 rounded-md"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={submitEdit}
                                        disabled={isSubmitting}
                                        className="px-4 py-2 bg-green-500 text-white rounded-md flex items-center justify-center gap-2 disabled:opacity-60"
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
                                        {isSubmitting ? 'Saving...' : 'Save'}
                                    </button>

                                </div>
                            </div>
                        </div>
                    )}


                </div>

                {/* )} */}
            </div>
        </>
    );
};

export default EvaluationPage;
