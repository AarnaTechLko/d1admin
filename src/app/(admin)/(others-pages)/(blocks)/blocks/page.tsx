'use client';
import { useRoleGuard } from '@/hooks/useRoleGaurd';
import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';

type BlockedIP = {
  id: number;
  block_ip_address: string;
  block_type: string;
  user_count: number;
  status: "block" | "unblock"; // adjust if more statuses exist
  is_deleted: number;
};

export default function BlockIPsPage() {
        useRoleGuard();
  
const [blockedList, setBlockedList] = useState<BlockedIP[]>([]);
   
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
const [selectedTab, setSelectedTab] = useState('IP Address');
const [ipInput, setIpInput] = useState('');
const [country, setCountry] = useState('');
const [city, setCity] = useState('');
const [region, setRegion] = useState('');

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
        console.log("Fetched IPs:", data); // ADD THIS

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

    // const handleAddIP = async () => {
    //     try {
    //         const res = await fetch('/api/block-ip', {
    //             method: 'POST',
    //             headers: { 'Content-Type': 'application/json' },
    //             body: JSON.stringify({ ipToBlock: ipInput }),
    //         });

    //         const result = await res.json();

    //         if (res.ok) {
    //             Swal.fire('Success', result.message, 'success');
    //             setIpInput('');
    //             setShowModal(false);
    //             fetchBlockedIps(search);
    //         } else {
    //             Swal.fire('Error', result.error || 'Failed to block IP', 'error');
    //         }
    //     } catch (error) {
    //         Swal.fire('Error', 'Something went wrong', 'error');
    //         console.error('Submit Error:', error);
    //     }
    // };
 

const handleAddIP = async () => {
  let value = "";

  // Determine value based on selected tab
  switch (selectedTab) {
    case "IP Address":
      value = ipInput.trim();
      break;
    case "Country":
      value = country.trim();
      break;
    case "City":
      value = city.trim();
      break;
    case "Region":
      value = region.trim();
      break;
    default:
      Swal.fire("Error", "Invalid block type selected.", "error");
      return;
  }

  if (!value) {
    Swal.fire("Warning", `Please enter a value for ${selectedTab}.`, "warning");
    return;
  }

  try {
    const res = await fetch("/api/block-ip", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ selectedTab, value }),
    });

    const data = await res.json();

    if (res.ok) {
      Swal.fire("Success", data.message, "success");
      setShowModal(false);
      setIpInput("");
      setCountry("");
      setCity("");
      setRegion("");
         fetchBlockedIps();
    } else {
      Swal.fire("Error", data.error || "Something went wrong.", "error");
    }
  } catch (error) {
    console.error("Request failed:", error);
    Swal.fire("Error", "Failed to submit. Please try again.", "error");
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
                        <th className="px-4 py-2 border-b">Blocked </th>
                        <th className="px-4 py-2 border-b">Block Type </th>
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
                            <td className="px-4 py-2 border-b">{row.block_type}</td>
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
     {showModal && (
<div className="fixed inset-0 bg-black/20 backdrop-blur-[1px] flex justify-center items-center z-50">
    <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md transition-all">
      <h3 className="text-xl font-semibold text-gray-800 mb-6 text-center">
        🚫 Add to Block List
      </h3>

      {/* Tabs */}
      <div className="flex justify-center gap-2 mb-6">
        {["IP Address", "Country", "City", "Region"].map((tab) => (
          <button
            key={tab}
            onClick={() => setSelectedTab(tab)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
              selectedTab === tab
                ? "bg-blue-600 text-white shadow"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Dynamic Inputs */}
      {selectedTab === "IP Address" && (
        <input
          type="text"
          value={ipInput}
          onChange={(e) => setIpInput(e.target.value)}
          placeholder="Enter IP address"
          className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
        />
      )}

      {selectedTab === "Country" && (
        <select
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
        >
          <option value="">-- Select Country Code --</option>
          {[
            "IN", "US", "GB", "AU", "CA", "DE", "FR", "JP", "BR", "RU",
            "CN", "KR", "ZA", "MX", "IT", "ES", "NL", "SG", "ID", "NG",
          ].map((code) => (
            <option key={code} value={code}>
              {code}
            </option>
          ))}
        </select>
      )}

      {selectedTab === "City" && (
        <input
          type="text"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="Enter city"
          className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
        />
      )}

      {selectedTab === "Region" && (
        <input
          type="text"
          value={region}
          onChange={(e) => setRegion(e.target.value)}
          placeholder="Enter region"
          className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
        />
      )}

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-2">
        <button
          onClick={() => setShowModal(false)}
          className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 transition-all"
        >
          Cancel
        </button>
        <button
          onClick={handleAddIP}
          className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 shadow-sm transition-all"
        >
          Submit
        </button>
      </div>
    </div>
  </div>
)}


        </div >
    );
}
