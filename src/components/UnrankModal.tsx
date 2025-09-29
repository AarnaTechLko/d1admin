"use client";
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import Button from "./ui/button/Button";
import Swal from "sweetalert2";

interface UnrankModalProps {
    open: boolean | string | null; // the player id that opened it
    rankId: number;
    playerName: string;
    onClose: () => void;
    onUnrankSuccess?: () => void;
}

const UnrankModal: React.FC<UnrankModalProps> = ({ open, rankId, playerName, onClose }) => {

    const handleUnrank = async () => {
        onClose?.();

        const result = await Swal.fire({
            title: `Unrank ${playerName}?`,
            text: "This action cannot be undone.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Yes, unrank",
        });

        if (!result.isConfirmed) return; // Only proceed if confirmed

        try {
            const res = await fetch(`/api/ranking?id=${rankId}`, {
                method: "DELETE",
            });

            if (!res.ok) throw new Error("Failed to unrank player");

            // Show success message
            await Swal.fire("Success", `${playerName} has been unranked.`, "success");

            // Close your custom modal
            onClose?.();

            // Optionally reload page
            window.location.reload();
        } catch (err: unknown) {
            console.error(err);

            // Narrow the type to Error
            const errorMessage =
                err instanceof Error ? err.message : "Could not unrank player. Please try again.";

            // Show error message
            await Swal.fire("Error", errorMessage, "error");

            // Close your custom modal
            onClose?.();
        }

    };



    return (
        <Dialog open={!!open} onOpenChange={onClose}>
            <DialogContent className="max-w-sm p-6 rounded-lg bg-white shadow-lg fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <DialogHeader>
                    <DialogTitle>Player Ranking</DialogTitle>
                </DialogHeader>

                <div className="mt-4 space-y-4">
                    <p>View or unrank player: <strong>{playerName}</strong></p>
                    <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={onClose}>Close</Button>
                        <Button className="bg-red-500 text-white" onClick={handleUnrank}>
                            Unrank
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default UnrankModal;
