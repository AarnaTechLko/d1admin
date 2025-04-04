"use client";
import React from "react";
import { Pencil, Trash } from "lucide-react";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../ui/table";
// import Badge from "../ui/badge/Badge";
import Image from "next/image";
import d1 from "@/public/images/signin/d1.png";


interface Player {
  id: string;
  first_name: string;
  last_name: string;
  image: string;
  position: string;
  height: string;
  jersey: string;
  weight: string;
  graduation: string;
  sport: string;
  status: string;
  earnings: number;
  age_group: string;
  grade_level: string;
}

interface PlayerTableProps {
  data: Player[];
  currentPage: number;
  totalPages: number;
  setCurrentPage: (page: number) => void;
}

const PlayerTable: React.FC<PlayerTableProps> = ({ data = [],
  currentPage = 1,
  totalPages = 1,
  setCurrentPage = () => { }, }) => {
  const handleEdit = (playerId: string) => {
    console.log("Edit player with ID:", playerId);
  };

  const handleDelete = async (playerId: string) => {
    if (!window.confirm("Are you sure you want to delete this player?")) return;

    try {
      const response = await fetch(`/api/player?id=${playerId}`, { method: "DELETE" });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete player");
      }

      // Refresh page after deletion
      window.location.reload();
    } catch (error) {
      console.error("Error deleting player:", error);
    }
  };

  return (
    <>
      <div className="flex justify-end items-center gap-2 p-2">
   
        {[...Array(totalPages)].map((_, index) => {
          const pageNumber = index + 1;
          return (
            <button
              key={pageNumber}
              onClick={() => setCurrentPage(pageNumber)}
              className={`px-3 py-2 rounded-md ${currentPage === pageNumber
                ? "bg-blue-500 text-white"
                : "text-blue-500 hover:bg-gray-200"
                }`}
            >
              {pageNumber}
            </button>
          );
        })}

       
      </div>
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="max-w-full overflow-x-auto">
          <div className="min-w-[1000px]">
            <Table>
              <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                <TableRow>
                  <TableCell className="px-5 py-3 font-medium text-gray-500 text-start dark:text-gray-400">
                    Player
                  </TableCell>
                  <TableCell className="px-5 py-3 font-medium text-gray-500 text-start dark:text-gray-400">
                    Positions
                  </TableCell>
                  <TableCell className="px-5 py-3 font-medium text-gray-500 text-start dark:text-gray-400">
                    Grade Level
                  </TableCell>
                  <TableCell className="px-5 py-3 font-medium text-gray-500 text-start dark:text-gray-400">
                    Age
                  </TableCell>
                  <TableCell className="px-5 py-3 font-medium text-gray-500 text-start dark:text-gray-400">
                    Height
                  </TableCell>
                  <TableCell className="px-5 py-3 font-medium text-gray-500 text-start dark:text-gray-400">
                    Weight
                  </TableCell>
                  <TableCell className="px-5 py-3 font-medium text-gray-500 text-start dark:text-gray-400">
                    Jersey
                  </TableCell>
                  <TableCell className="px-5 py-3 font-medium text-gray-500 text-start dark:text-gray-400">
                    Graduation
                  </TableCell>




                  <TableCell className="px-5 py-3 font-medium text-gray-500 text-start dark:text-gray-400">
                    Actions
                  </TableCell>
                </TableRow>
              </TableHeader>

              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {data.map((player) => (
                  <TableRow key={player.id}>
                    <TableCell className="px-5 py-4 sm:px-6 text-start">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 overflow-hidden ">
                          <Image
                            width={50}
                            height={50}
                            className="rounded-full"
                            src={player.image && player.image.startsWith("http") ? player.image : d1}
                            alt={`${player.first_name} ${player.last_name}`}
                            onError={(e) => (e.currentTarget.src = "/images/default-avatar.png")} // Fallback image
                          />

                        </div>
                        <div>
                          <span className="block font-medium text-gray-800 dark:text-white/90">
                            {player.first_name} {player.last_name}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 dark:text-gray-400">{player.position}</TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 dark:text-gray-400">{player.grade_level}</TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 dark:text-gray-400">{player.age_group}</TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 dark:text-gray-400">{player.height}</TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 dark:text-gray-400">{player.weight}</TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 dark:text-gray-400">{player.jersey}</TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 dark:text-gray-400">{player.graduation}</TableCell>





                    <TableCell className="px-4 py-3 text-gray-500 dark:text-gray-400">
                      <div className="flex gap-3">
                        <button onClick={() => handleEdit(player.id)} className="p-2 text-green-500 hover:text-green-600">
                          <Pencil size={18} />
                        </button>
                        <button onClick={() => handleDelete(player.id)} className="p-2 text-red-500 hover:text-red-600">
                          <Trash size={18} />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="flex justify-end items-center gap-2 p-4 border-t border-gray-200 dark:border-white/[0.05]">
 
  {[...Array(totalPages)].map((_, index) => {
    const pageNumber = index + 1;
    return (
      <button
        key={pageNumber}
        onClick={() => setCurrentPage(pageNumber)}
        className={`px-3 py-1 rounded-md ${
          currentPage === pageNumber
            ? "bg-blue-500 text-white"
            : "text-blue-500 hover:bg-gray-200"
        }`}
      >
        {pageNumber}
      </button>
    );
  })}

 
</div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PlayerTable;
