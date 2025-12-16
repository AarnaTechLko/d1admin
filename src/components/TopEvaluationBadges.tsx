// "use client";
// import { useEffect, useState } from "react";
// import Image from "next/image"; // ✅ Make sure to import from next/image
// import { NEXT_PUBLIC_AWS_S3_BUCKET_LINK } from "@/lib/constants";
// interface Evaluation {
//   id: number;
//   eval_average: number;
//   firstName: string;
//   lastName: string;
//   image: string | null;
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
//     //console.log("playeid:",playerId);
//     const fetchPlayerEvaluations = async () => {
//       setLoading(true);
//       try {
//         const res = await fetch(`/api/evaluations/top-averages/${playerId}`);
//         if (!res.ok) throw new Error("Failed to fetch player evaluations");
//         const data: BadgeData = await res.json();
//         setBadge(data);
//         console.log("all evail:", data);
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


//   return (

//   <div className="grid grid-cols-6 gap-4">
//   {(badge.evaluations ?? []).map((e) => (
//     <div
//       key={e.id}
//       className="flex flex-col items-center border rounded-xl w-28 p-2 shadow-md bg-gray-100"
//       title={`Evaluation ${e.id} — Avg: ${e.eval_average.toFixed(1)}`}
//     >
//       {/* Grey Circle wrapper */}
//       <div className="relative w-24 h-24 rounded-full border-2 border-green-800 flex items-center justify-center">
//         {/* Badge Image (larger) */}
//         <Image
//           src="/uploads/badge.png"
//           alt="Verified Badge"
//           width={96}
//           height={96}
//           className="object-contain rounded-full"
//         />

//         {/* Coach Image (smaller, centered) */}
//         {e.image && (
//           <span className="absolute flex  left-[28px] -top-0.3  justify-center rounded-full">
//             <Image
//               src={`${NEXT_PUBLIC_AWS_S3_BUCKET_LINK}/${e.image}`}
//               alt={`${e.firstName} ${e.lastName}`}
//               width={40}  // ✅ smaller width
//               height={40} // ✅ smaller height
//               className="object-cover rounded-full border-2 border-gray-200 shadow"
//             />
//           </span>
//         )}
//       </div>

//       {/* Coach Name + Eval Average */}
//       <span className="mt-2 text-xs font-semibold bg-green-800 text-white px-2 py-1 rounded-full shadow-sm text-center">
//         {e.eval_average.toFixed(1)} {e.firstName} {e.lastName}
//       </span>
//     </div>
//   ))}
// </div>



//   );
// }

"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { NEXT_PUBLIC_AWS_S3_BUCKET_LINK } from "@/lib/constants";

interface Evaluation {
  id: number;
  eval_average: number;
  firstName: string;
  lastName: string;
  image: string | null;
}

interface BadgeData {
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
  const router = useRouter();

  useEffect(() => {
    if (!playerId) return;
    const fetchPlayerEvaluations = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/evaluations/top-averages/${playerId}`);
        // if (!res.ok) throw new Error("No evaluations found");
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
    <div className="grid grid-cols-6 gap-4">
      {(badge.evaluations ?? []).map((e) => (
        <button
          key={e.id}
          onClick={() => router.push(`/evaluationdetails/${e.id}`)}
          className="flex flex-col items-center border rounded-xl w-28 p-2 shadow-md bg-gray-100 cursor-pointer hover:scale-105 transition-transform"
          title={`Evaluation ${e.id} — Avg: ${e.eval_average.toFixed(1)}`}
        >
          {/* Grey Circle wrapper */}
          <div className="relative w-24 h-24 rounded-full border-2 border-green-800 flex items-center justify-center">
            {/* Badge Image */}
            <Image
              src="/uploads/badge.png"
              alt="Verified Badge"
              width={96}
              height={96}
              className="object-contain rounded-full"
            />

            {/* Coach Image (small, centered) */}
            {e.image && (
              <span className="absolute left-[28px] -top-0.3 pointer-events-none">
                <Image
                  src={`${NEXT_PUBLIC_AWS_S3_BUCKET_LINK}/${e.image}`}
                  alt={`${e.firstName} ${e.lastName}`}
                  width={40}
                  height={40}
                  className="object-cover rounded-full border-2 border-gray-200 shadow"
                />
              </span>
            )}
          </div>

          {/* Coach Name + Eval Average */}
          <span className="mt-2 text-xs font-semibold bg-green-800 text-white px-2 py-1 rounded-full shadow-sm text-center">
            {e.eval_average.toFixed(1)} {e.firstName} {e.lastName}
          </span>
        </button>
      ))}
    </div>
  );
}
