"use client";
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import Button from "./ui/button/Button";
import Swal from "sweetalert2";

interface AddRankingModalProps {
  playerId: number;
  onSuccess: () => void;
}

const AddRankingModal: React.FC<AddRankingModalProps> = ({ playerId, onSuccess }) => {
  const [open, setOpen] = useState(false);
  const [rank, setRank] = useState<number | "">("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true); // start spinner
    try {
      const res = await fetch("/api/ranking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerId, rank }),
        credentials: "include",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to add ranking");
      }

      onSuccess?.();
      Swal.fire("Success", "Ranking added successfully!", "success");
    } catch (err) {
      Swal.fire("Error", (err as Error).message, "error");
    } finally {
      setLoading(false); // stop spinner
      setOpen(false); // close modal
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-blue-500 text-white text-xs p-2 m-2">
          Add Ranking
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-sm rounded-lg bg-white">
        <DialogHeader>
          <DialogTitle>Add Ranking</DialogTitle>
        </DialogHeader>
        <div className="mt-4">
          <input
            type="number"
            min={1}
            placeholder="Enter rank"
            value={rank}
            onChange={(e) => setRank(Number(e.target.value))}
            className="w-full p-2 border rounded"
          />
          <div className="flex justify-end mt-4 gap-2">
            <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
              Cancel
            </Button>
            <Button className="bg-blue-600 text-white flex items-center justify-center gap-2" onClick={handleSubmit} disabled={loading}>
              {loading && (
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 018 8h-4l3 3-3 3h4a8 8 0 01-8 8v-4l-3 3 3 3v-4a8 8 0 01-8-8z"></path>
                </svg>
              )}
              {loading ? "Submitting..." : "Submit"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
export default AddRankingModal;
