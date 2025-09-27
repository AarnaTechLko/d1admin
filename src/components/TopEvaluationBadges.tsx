// // "use client";

// // import { useEffect, useState } from "react";

// // interface Evaluation {
// //     id: number;
// //     eval_average: number;
// // }

// // interface BadgeData {
// //     playerId: number;
// //     avg: number | null;
// //     evaluations: Evaluation[];
// // }

// // export default function TopEvaluationBadges() {
// //     const [badges, setBadges] = useState<BadgeData[]>([]);
// //     const [loading, setLoading] = useState(true);

// //     useEffect(() => {
// //         const fetchBadges = async () => {
// //             try {
// //                 const res = await fetch("/api/evaluations/top-averages");
// //                 if (!res.ok) throw new Error("Failed to fetch");
// //                 const data: BadgeData[] = await res.json();
// //                 setBadges(data);
// //             } catch (err) {
// //                 console.error(err);
// //             } finally {
// //                 setLoading(false);
// //             }
// //         };
// //         fetchBadges();
// //     }, []);

// //     if (loading) return <div>Loading badges…</div>;
// //     if (!badges.length) return <div>No badges found</div>;

// //     return (
// //         <div className="flex flex-wrap gap-2 p-4 bg-gray-50 rounded-lg">
// //             {badges.map((badge) => {
// //                 const avgNum = badge.avg === null ? NaN : Number(badge.avg);
// //                 const avgText = Number.isFinite(avgNum) ? avgNum.toFixed(1) : "—";

// //                 return (

// //                     <div
// //                         key={badge.playerId}
// //                         className="flex flex-col items-center justify-center w-15 h-15 rounded-full overflow-hidden shadow-lg text-white font-bold"
// //                         title={`Player ${badge.playerId} — Avg: ${avgText}`}
// //                         style={{ background: "linear-gradient(to right, #6366f1, #a855f7)" }} // Optional inline gradient
// //                     >
// //                         <span className="text-sm">{avgText}</span>
// //                         <small className="text-xs">P {badge.playerId}</small>

// //                         {/* Show individual eval_average values */}
// //                         {/* <div className="mt-2 flex flex-wrap gap-1 justify-center">
// //                             {badge.evaluations.slice(0, 3).map((e) => (
// //                                 <span
// //                                     key={e.id}
// //                                     className="px-1 py-0.5 text-[10px] bg-white/20 rounded"
// //                                 >
// //                                     {e.eval_average.toFixed(1)}
// //                                 </span>
// //                             ))}
// //                             {badge.evaluations.length > 3 && (
// //                                 <span className="text-[10px]">+{badge.evaluations.length - 3}</span>
// //                             )}
// //                         </div> */}
// //                     </div>
// //                 );
// //             })}
// //         </div>
// //     );
// // }

// "use client";

// import { useEffect, useState } from "react";

// interface Evaluation {
//   id: number;
//   eval_average: number;
// }

// interface BadgeData {
//   playerId: number;
//   avg: number | null;
//   evaluations: Evaluation[];
// }

// interface Props {
//   playerId: number;
// }

// export default function PlayerEvaluationBadges({ playerId }: Props) {
//   const [badge, setBadge] = useState<BadgeData | null>(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     if (!playerId) return;

//     const fetchPlayerEvaluations = async () => {
//       setLoading(true);
//       try {
//         const res = await fetch(`/api/evaluations/top-averages/${playerId}`);
//         if (!res.ok) throw new Error("Failed to fetch player evaluations");
//         const data: BadgeData = await res.json();
//         setBadge(data);
//       } catch (err) {
//         console.error(err);
//         setBadge(null);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchPlayerEvaluations();
//   }, [playerId]);

//   if (loading) return <div>Loading evaluations…</div>;
//   if (!badge) return <div>No evaluations found</div>;

//   const avgNum = badge.avg === null ? NaN : Number(badge.avg);
//   const avgText = Number.isFinite(avgNum) ? avgNum.toFixed(1) : "—";

//   return (
//     <div className="flex flex-col items-center gap-2 p-4 bg-gray-50 rounded-lg">
//       <div
//         className="flex flex-col items-center justify-center w-20 h-20 rounded-full overflow-hidden shadow-lg text-white font-bold"
//         style={{ background: "linear-gradient(to right, #6366f1, #a855f7)" }}
//         title={`Player ${badge.playerId} — Avg: ${avgText}`}
//       >
//         <span className="text-xl">{avgText}</span>
//         <small className="text-xs">P {badge.playerId}</small>
//       </div>

//       {/* Show individual eval_average values */}
//   <div
//         className="flex flex-col items-center justify-center w-20 h-20 rounded-full overflow-hidden shadow-lg text-white font-bold"
//         style={{ background: "linear-gradient(to right, #6366f1, #a855f7)" }}
//         title={`Player ${badge.playerId} — Avg: ${avgText}`}
//       >        {badge.evaluations.map((e) => (
//           <span
//             key={e.id}
//             className="px-1 py-0.5 text-[10px] bg-white/20 rounded"
//           >
//             {e.eval_average.toFixed(1)}
//           </span>
//         ))}
//       </div>
//     </div>
//   );
// }


"use client";

import { useEffect, useState } from "react";
import Image from "next/image"; // ✅ Make sure to import from next/image

interface Evaluation {
  id: number;
  eval_average: number;
}

interface BadgeData {
  firstName: string;
  lastName: string;
  playerId: number;
  avg: number | null;
  evaluations: Evaluation[];
}

interface Props {
  playerId: number;
}

export default function PlayerEvaluationBadges({ playerId }: Props) {
  const [badge, setBadge] = useState<BadgeData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!playerId) return;

    const fetchPlayerEvaluations = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/evaluations/top-averages/${playerId}`);
        if (!res.ok) throw new Error("Failed to fetch player evaluations");
        const data: BadgeData = await res.json();
        setBadge(data);
      } catch (err) {
        console.error(err);
        setBadge(null);
      } finally {
        setLoading(false);
      }
    };

    fetchPlayerEvaluations();
  }, [playerId]);

  if (loading) return <div>Loading evaluations…</div>;
  if (!badge) return <div>No evaluations found</div>;


  return (
    // <div className="flex flex-wrap gap-4">
    //   {(badge.evaluations ?? []).map((e) => (
    //     <div
    //       key={e.id}
    //       className="flex flex-col items-center w-20"
    //       title={`Evaluation ${e.id} — Avg: ${e.eval_average.toFixed(1)}`}
    //     >
    //       {/* Star emoji as icon */}
    //       <div
    //         className="relative w-20 h-20 flex items-center justify-center
    //          transform transition duration-300 hover:scale-110 hover:shadow-2xl"
    //       >
    //         {/* Crown Image */}
    //         <span className="absolute">
    //           <Image
    //             src="/uploads/badge.png" // path relative to public folder
    //             alt="Verified Crown"
    //             width={90} // adjust size as needed
    //             height={90} // adjust size as needed
    //             className="object-contain"
    //           />
    //         </span>

    //         {/* Average value on top */}
    //         <span className="absolute text-sm font-bold text-white">
    //           {e.eval_average.toFixed(1)}
    //         </span>
    //       </div>


    //       {/* Name below the star */}
    //       <p className="text-xs font-semibold text-gray-800 text-center">
    //         {badge.firstName} {badge.lastName}
    //       </p>
    //     </div>
    //   ))}
    // </div>


<div className="flex flex-wrap gap-4">
  {(badge.evaluations ?? []).map((e) => (
    <div
      key={e.id}
      className="flex flex-col items-center w-24" // slightly bigger for circle
      title={`Evaluation ${e.id} — Avg: ${e.eval_average.toFixed(1)}`}
    >
      {/* Grey Circle wrapper */}
      <div
        className="relative w-20 h-20 rounded-full border-2 border-gray-200
          flex flex-col items-center justify-center
          transform transition duration-300 hover:scale-110 hover:shadow-2xl"
      >
        {/* Badge Image */}
        <Image
          src="/uploads/badge.png" // path relative to public folder
          alt="Verified Badge"
          width={80} // adjust as needed
          height={50}
          className="object-contain"
        />

        {/* Average value */}
        <span className="absolute  text-xs font-bold text-white">
          {e.eval_average.toFixed(1)}
        </span>

        {/* Player Name inside the circle */}
        <span className="absolute bottom-1 text-xs font-semibold text-gray-800  text-center">
          {badge.firstName} {badge.lastName}
        </span>
      </div>
    </div>
  ))}
</div>


  );
}

