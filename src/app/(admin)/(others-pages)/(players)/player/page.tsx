
// "use client";
// import React, { useState, useEffect } from "react";
// import PageBreadcrumb from "@/components/common/PageBreadCrumb";
// import PlayerTable from "@/components/tables/PlayerTable";
// import { Player } from "@/app/types/types";
// import { useRoleGuard } from "@/hooks/useRoleGaurd";

// interface Ranking {
//   playerId: string;
//   rank: number;
// }

// const PlayersPage = () => {
//   useRoleGuard();

//   const [searchQuery, setSearchQuery] = useState("");
//   const [players, setPlayers] = useState<Player[]>([]);
//   const [ranking, setRanking] = useState<Ranking[]>([]);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [totalPages, setTotalPages] = useState(1);
//   const [loading, setLoading] = useState<boolean>(true);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     const fetchPlayersAndRanking = async () => {
//       setLoading(true);
//       setError(null);
//       try {
//         // Fetch players
//         const response = await fetch(
//           `/api/player?search=${searchQuery}&page=${currentPage}&limit=10`
//         );
//         if (!response.ok) throw new Error("Failed to fetch players");
//         const playerData = await response.json();
//         const fetchedPlayers: Player[] = playerData.player;

//         // Fetch ranking
//         const rankingRes = await fetch("/api/ranking");
//         if (!rankingRes.ok) throw new Error("Failed to fetch ranking");
//         const rankingData = await rankingRes.json();
//         const fetchedRanking: Ranking[] = rankingData.data;

//         // Merge ranking into players
//         const mergedPlayers = fetchedPlayers.map((player) => {
//           const playerRank = fetchedRanking.find(
//             (r) => r.playerId.toString().trim() === player.id.toString().trim()
//           );
//           console.log("rankdata:", playerRank);
//           return {
//             ...player,
//             rank: playerRank?.rank ?? null,
//           };
//         });


//         setPlayers(mergedPlayers);
//         setTotalPages(playerData.totalPages);
//         setRanking(fetchedRanking);
//       } catch (err) {
//         setError((err as Error).message);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchPlayersAndRanking();
//   }, [searchQuery, currentPage]);

//   return (
//     <div>
//       <PageBreadcrumb pageTitle="Players" onSearch={setSearchQuery} />

//       {loading && (
//         <div className="flex items-center justify-center gap-4">
//           <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
//           Loading...
//         </div>
//       )}

//       {error && <p className="text-center py-5 text-red-500">{error}</p>}

//       {!loading && !error && (
//         <PlayerTable
//           data={players}
//           currentPage={currentPage}
//           totalPages={totalPages}
//           setCurrentPage={setCurrentPage}
//         />
//       )}
//     </div>
//   );
// };

// export default PlayersPage;

// "use client";
// import React, { useState, useEffect } from "react";
// import PageBreadcrumb from "@/components/common/PageBreadCrumb";
// import PlayerTable from "@/components/tables/PlayerTable";
// import { Player } from "@/app/types/types";
// import { useRoleGuard } from "@/hooks/useRoleGaurd";

// interface Ranking {
//   playerId: string;
//   rank: number;
// }

// const PlayersPage = () => {
//   useRoleGuard();

//   const [searchQuery, setSearchQuery] = useState("");
//   const [players, setPlayers] = useState<Player[]>([]);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [totalPages, setTotalPages] = useState(1);
//   const [loading, setLoading] = useState<boolean>(true);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     const fetchPlayersAndRanking = async () => {
//       setLoading(true);
//       setError(null);
//       try {
//         // Fetch players
//         const response = await fetch(
//           `/api/player?search=${searchQuery}&page=${currentPage}&limit=10`
//         );
//         if (!response.ok) throw new Error("Failed to fetch players");
//         const playerData = await response.json();
//         const fetchedPlayers: Player[] = playerData.player;

//         // Fetch ranking
//         const rankingRes = await fetch("/api/ranking");
//         if (!rankingRes.ok) throw new Error("Failed to fetch ranking");
//         const rankingData = await rankingRes.json();
//         const fetchedRanking: Ranking[] = rankingData.data;

//         // Merge ranking into players
//         const mergedPlayers = fetchedPlayers.map((player) => {
//           const playerRank = fetchedRanking.find(
//             (r) => r.playerId.toString().trim() === player.id.toString().trim()
//           );
//           return {
//             ...player,
//             rank: playerRank?.rank ?? null,
//           };
//         });

//         setPlayers(mergedPlayers);
//         setTotalPages(playerData.totalPages);
//       } catch (err) {
//         setError((err as Error).message);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchPlayersAndRanking();
//   }, [searchQuery, currentPage]);

//   return (
//     <div>
//       <PageBreadcrumb pageTitle="Players" onSearch={setSearchQuery} />

//       {loading && (
//         <div className="flex items-center justify-center gap-4">
//           <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
//           Loading...
//         </div>
//       )}

//       {error && <p className="text-center py-5 text-red-500">{error}</p>}

//       {!loading && !error && (
//         <PlayerTable
//           data={players}
//           currentPage={currentPage}
//           totalPages={totalPages}
//           setCurrentPage={setCurrentPage}
//         />
//       )}
//     </div>
//   );
// };

// export default PlayersPage;


"use client";
import React, { useState, useEffect } from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import PlayerTable from "@/components/tables/PlayerTable";
import { Player } from "@/app/types/types";
import { useRoleGuard } from "@/hooks/useRoleGaurd";

interface Ranking {
  playerId: string;
  rank: number;
}

const PlayersPage = () => {
  useRoleGuard();

  const [searchQuery, setSearchQuery] = useState("");
  const [players, setPlayers] = useState<Player[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPlayersAndRanking = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch players
        const response = await fetch(
          `/api/player?search=${searchQuery}&page=${currentPage}&limit=10`
        );
        if (!response.ok) throw new Error("Failed to fetch players");
        const playerData = await response.json();
        const fetchedPlayers: Player[] = playerData.player;

        // Fetch ranking
        const rankingRes = await fetch("/api/ranking");
        if (!rankingRes.ok) throw new Error("Failed to fetch ranking");
        const rankingData = await rankingRes.json();
        const fetchedRanking: Ranking[] = rankingData.data;

        // Merge ranking into players
        const mergedPlayers = fetchedPlayers.map((player) => {
          const playerRank = fetchedRanking.find(
            (r) => r.playerId.toString().trim() === player.id.toString().trim()
          );
          return {
            ...player,
            rank: playerRank?.rank ?? 0,
          };
        });

        setPlayers(mergedPlayers);
        setTotalPages(playerData.totalPages);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchPlayersAndRanking();
  }, [searchQuery, currentPage]);

  return (
    <div>
      <PageBreadcrumb pageTitle="Players" onSearch={setSearchQuery} />

      {loading && (
        <div className="flex items-center justify-center gap-4 py-10">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          Loading...
        </div>
      )}

      {error && <p className="text-center py-5 text-red-500">{error}</p>}

      {!loading && !error && (
        <PlayerTable
          data={players}
          currentPage={currentPage}
          totalPages={totalPages}
          setCurrentPage={setCurrentPage}
        />
      )}
    </div>
  );
};

export default PlayersPage;
