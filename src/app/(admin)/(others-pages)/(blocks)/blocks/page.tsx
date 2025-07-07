'use client';
import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';

type BlockedIP = {
  id: number;
  block_ip_address: string;
  user_count: number;
  status: "block" | "unblock"; // adjust if more statuses exist
  is_deleted: number;
};

export default function BlockIPsPage() {
const [blockedList, setBlockedList] = useState<BlockedIP[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [ipInput, setIpInput] = useState('');
    const [search, setSearch] = useState('');
    const handleHide = async (id: number) => {
        const confirm = await Swal.fire({
            title: 'Are you sure?',
            text: 'This will hide the blocked IP from the list.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            confirmButtonText: 'Yes, hide it!',
        });

        if (confirm.isConfirmed) {
            try {
                const res = await fetch(`/api/block-ip/hide/${id}`, {
                    method: 'DELETE',
                });
                const result = await res.json();

                if (res.ok) {
                    Swal.fire('Hidden!', result.message, 'success');
                    fetchBlockedIps(search); // refresh list
                } else {
                    Swal.fire('Error', result.error || 'Failed to hide IP', 'error');
                }
            } catch (error) {
                console.error('Hide Error:', error);
                Swal.fire('Error', 'Something went wrong', 'error');
            }
        }
    };

    const handleRevert = async (id: number) => {
        const confirm = await Swal.fire({
            title: 'Are you sure?',
            text: 'This will revert (show) the previously hidden IP.',
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            confirmButtonText: 'Yes, revert it!',
        });

        if (confirm.isConfirmed) {
            try {
                const res = await fetch(`/api/block-ip/revert/${id}`, {
                    method: 'PATCH',
                });
                const result = await res.json();

                if (res.ok) {
                    Swal.fire('Reverted!', result.message, 'success');
                    fetchBlockedIps(search); // refresh list
                } else {
                    Swal.fire('Error', result.error || 'Failed to revert IP', 'error');
                }
            } catch (error) {
                console.error('Revert Error:', error);
                Swal.fire('Error', 'Something went wrong', 'error');
            }
        }
    };


    const fetchBlockedIps = async (searchValue = '') => {
        try {
            const res = await fetch(`/api/block-ip${searchValue ? `?search=${searchValue}` : ''}`);
            const data = await res.json();

            if (Array.isArray(data)) {
                setBlockedList(data);
            } else {
                console.error("Expected array, got:", data);
                setBlockedList([]);
            }
        } catch (err) {
            console.error("Error fetching blocked IPs:", err);
            setBlockedList([]);
        }
    };

    const handleAddIP = async () => {
        try {
            const res = await fetch('/api/block-ip', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ipToBlock: ipInput }),
            });

            const result = await res.json();

            if (res.ok) {
                Swal.fire('Success', result.message, 'success');
                setIpInput('');
                setShowModal(false);
                fetchBlockedIps(search);
            } else {
                Swal.fire('Error', result.error || 'Failed to block IP', 'error');
            }
        } catch (error) {
            Swal.fire('Error', 'Something went wrong', 'error');
            console.error('Submit Error:', error);
        }
    };
 


    const handleSearch = () => {
        fetchBlockedIps(search);
    };

    useEffect(() => {
        fetchBlockedIps();
    }, []);

    const handleStatusChangeSwal = async (row: BlockedIP) => {
        const { value: selectedStatus } = await Swal.fire({
            title: "Change Status",
            input: "select",
            inputOptions: {
                block: "Block",
                unblock: "Unblock",
            },
            inputValue: row.status,
            showCancelButton: true,
            confirmButtonText: "Save",
            cancelButtonText: "Cancel",
            inputLabel: "Select new status",
            customClass: {
                popup: "text-sm",
            },
        });

        if (selectedStatus && selectedStatus !== row.status) {
            // Call update API
            try {
                await fetch("/api/block-ip/update-status", {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        id: row.id,
                        status: selectedStatus,
                    }),
                });

                // Update UI state
                setBlockedList((prev) =>
                    prev.map((item) =>
                        item.id === row.id ? { ...item, status: selectedStatus } : item
                    )
                );

                Swal.fire("Updated!", `Status updated to ${selectedStatus}.`, "success");
            } catch (error) {
                console.error("Status update failed:", error);
                Swal.fire("Error", "Failed to update status.", "error");
            }
        }
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Blocked IPs</h2>
                <button
                    onClick={() => setShowModal(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded shadow"
                >
                    Add Block IP
                </button>
            </div>

            {/* Search Bar */}
            <div className="mb-4 flex gap-2">
                <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="p-2 border border-gray-300 rounded w-full max-w-sm"
                    placeholder="Search by IP"
                />
                <button
                    onClick={handleSearch}
                    className="px-4 py-2 bg-blue-600 text-white rounded"
                >
                    Search
                </button>
            </div>

            {/* Data Table */}
            <table className="min-w-full bg-white border border-gray-300 text-sm">
                <thead className="bg-gray-100 text-left">
                    <tr>
                        <th className="px-4 py-2 border-b">ID</th>
                        <th className="px-4 py-2 border-b">Blocked IP</th>
                        <th className="px-4 py-2 border-b">No. of Users</th>
                        <th className="px-4 py-2 border-b">Status</th>
                        <th className="px-4 py-2 border-b">Action</th>
                    </tr>
                </thead>
                <tbody>
                    {blockedList.map((row) => (
                        <tr
                            key={row.id}
                            className={`${row.is_deleted === 0 ? "opacity-50 bg-gray-100" : ""
                                }`}
                        >
                            <td className="px-4 py-2 border-b">{row.id}</td>
                            <td className="px-4 py-2 border-b">{row.block_ip_address}</td>
                            <td className="px-4 py-2 border-b">{row.user_count}</td>
                            <td className="px-4 py-2 border-b capitalize cursor-pointer hover:underline">
                                <span
                                    onClick={() => {
                                        if (row.is_deleted !== 0) {
                                            handleStatusChangeSwal(row);
                                        } else {
                                            Swal.fire({
                                                text: "This entry is hidden and cannot be updated.",
                                                customClass: {
                                                    popup: 'text-sm', // Tailwind class or define in CSS
                                                },
                                            });
                                        }
                                    }}
                                >
                                    {row.status}
                                </span>

                            </td>
                            <td className="px-4 py-3 text-center flex items-center justify-center gap-2">


                                {row.is_deleted === 0 ? (
                                    <button
                                        onClick={() => handleRevert(row.id)}
                                        title="Revert Coach"

                                        style={{
                                            fontSize: '1.2rem',
                                            marginRight: '8px',
                                        }}
                                    >
                                        🛑
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => handleHide(row.id)}
                                        title="Hide Coach"
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


            {/* Modal */}
            {
                showModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                        <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                            <h3 className="text-lg font-bold mb-4">Add Blocked IP</h3>
                            <input
                                type="text"
                                value={ipInput}
                                onChange={(e) => setIpInput(e.target.value)}
                                className="w-full p-2 border rounded mb-4"
                                placeholder="Enter IP address"
                            />
                            <div className="flex justify-end gap-2">
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="px-4 py-2 bg-gray-300 rounded"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleAddIP}
                                    className="px-4 py-2 bg-blue-600 text-white rounded"
                                >
                                    Submit
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
}
