"use client";

import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { Calendar, Pencil } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogTrigger,
} from "@/components/ui/dialog";
import Button from "@/components/ui/button/Button";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

interface Category {
    id: number;
    categoryName: string;
}

interface Expense {
    id: number;
    createdAt: string;
    categoryid: number;
    categoryName: string;
    amount: number;
    description: string;
    date: string;
    is_deleted: number;
}

export default function ExpensePage() {
    const [user_id, setUserId] = useState<string | null>(null);
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [search, setSearch] = useState("");
    const [startDate, setStartDate] = useState<Date | null>(null);
    const [endDate, setEndDate] = useState<Date | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
    const [categoryid, setcategoryid] = useState<number | "">("");
    const [amount, setAmount] = useState<number | "">("");
    const [description, setDescription] = useState("");
    const [loading, setLoading] = useState(false);

    const [editcategoryid, setEditcategoryid] = useState<number | "">("");
    const [editAmount, setEditAmount] = useState<number | "">("");
    const [editDescription, setEditDescription] = useState("");
    const [date, setDate] = useState<Date | null>(new Date());
    const [editDate, setEditDate] = useState<Date | null>(new Date());
    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Fetch user id
    useEffect(() => {
        const storedUserId = sessionStorage.getItem("user_id");
        setUserId(storedUserId);
    }, []);

    const fetchExpenses = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/expenses`);
            const data = await res.json();
            setExpenses(data.data || []);
        } catch (error) {
            console.error("Something went wrong:", error);
            Swal.fire("Error", "Something went wrong", "error");
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const res = await fetch("/api/expense_categories");
            const data = await res.json();
            setCategories(data.data || []);
        } catch (error) {
            console.error("Something went wrong:", error);
            Swal.fire("Error", "Something went wrong", "error");
        }
    };

    useEffect(() => {
        if (user_id) {
            fetchExpenses();
            fetchCategories();
        }
    }, [user_id]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!categoryid || !amount || !description || !user_id)
            return Swal.fire("Error", "Please fill all fields", "error");

        setLoading(true);
        try {
            const res = await fetch("/api/expenses", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    categoryid,
                    amount,
                    description,
                    date,
                    user_id: Number(user_id),
                }),
            });
            if (res.ok) {
                Swal.fire("Success!", "Expense added successfully", "success");
                setcategoryid("");
                setAmount("");
                setDescription("");
                setDate(new Date());
                setIsModalOpen(false);
                fetchExpenses();
            } else {
                const data = await res.json();
                Swal.fire("Error", data?.error || "Failed to add expense", "error");
            }
        } catch (error) {
            console.error("Something went wrong:", error);
            Swal.fire("Error", "Something went wrong", "error");
        }
        finally {
            setLoading(false);
        }
    };



    const handleEdit = (exp: Expense) => {
        setEditingExpense(exp);
        /*  setEditcategoryid(exp.categoryid);
         setEditAmount(exp.amount);
         setEditDescription(exp.description);
         setEditDate(exp.date ? new Date(exp.date) : new Date()); */

    };

    // Initialize edit modal state when editingExpense or categories change
    useEffect(() => {
        if (editingExpense && categories.length > 0) {
            // Match category ID either by ID or name
            const category = categories.find(
                (cat) =>
                    cat.id === editingExpense.categoryid ||
                    cat.categoryName === editingExpense.categoryName
            );
            setEditcategoryid(category ? category.id : "");
            setEditAmount(editingExpense.amount);
            setEditDescription(editingExpense.description);
            setEditDate(editingExpense.date ? new Date(editingExpense.date) : new Date());
        }
    }, [editingExpense, categories]);

    const saveEdit = async () => {
        if (!editingExpense || !editcategoryid || !editAmount || !editDescription)
            return Swal.fire("Error", "Please fill all fields", "error");

        setLoading(true);
        try {
            const res = await fetch(`/api/expenses/${editingExpense.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    categoryid: editcategoryid,
                    amount: editAmount,
                    description: editDescription,
                    date: editDate,
                }),
            });

            if (!res.ok) throw new Error("Failed to update");
            Swal.fire("Updated!", "Expense updated successfully.", "success");
            setEditingExpense(null);
            fetchExpenses();
        } catch (error) {
            console.error("Something went wrong:", error);
            Swal.fire("Error", "Something went wrong", "error");
        }
        finally {
            setLoading(false);
        }
    };
    // Filter expenses by category, amount, and dates
    const filteredExpenses = expenses.filter((exp) => {
        const searchLower = search.toLowerCase();
        const matchCategory = exp.categoryName.toLowerCase().includes(searchLower);
        const matchAmount = exp.amount.toString().includes(searchLower);
        const expDate = new Date(exp.createdAt);
        const matchStart = startDate ? expDate >= startDate : true;
        const matchEnd = endDate ? expDate <= endDate : true;
        return (matchCategory || matchAmount) && matchStart && matchEnd;
    });

    // Pagination
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentExpenses = filteredExpenses.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredExpenses.length / itemsPerPage);
    // inside ExpensePage component

    // ✅ Export to CSV
    const exportToCSV = () => {
        if (filteredExpenses.length === 0) {
            Swal.fire("No Data", "There are no expenses to export.", "info");
            return;
        }

        const headers = ["ID", "Date", "Category", "Amount ($)", "Description"];
        const rows = filteredExpenses.map((exp) => [
            exp.id,
            new Date(exp.createdAt).toLocaleDateString(),
            exp.categoryName,
            exp.amount,
            exp.description,
        ]);

        const csvContent =
            [headers, ...rows].map((row) => row.join(",")).join("\n");

        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", "expenses.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };
  const handleHide = async (id: number) => {
  const result = await Swal.fire({
    title: "Are you sure?",
    text: "This expense will be marked as hidden.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Yes, hide it!",
    cancelButtonText: "Cancel",
  });

  if (result.isConfirmed) {
    setLoading(true); // ✅ start loading
    try {
      const res = await fetch(`/api/expenses/hide/${id}`, { method: "PATCH" });
      if (res.ok) {
        Swal.fire("Updated!", "Expense hidden successfully.", "success");
        setExpenses((prev) =>
          prev.map((exp) =>
            exp.id === id ? { ...exp, is_deleted: 0 } : exp
          )
        );
      } else {
        Swal.fire("Error!", "Failed to hide expense.", "error");
      }
    } catch (err) {
      Swal.fire("Error!", "Something went wrong.", "error");
      console.error("Hide error:", err);
    } finally {
      setLoading(false); // ✅ stop loading no matter what
    }
  }
};

const handleRevert = async (id: number) => {
  const result = await Swal.fire({
    title: "Are you sure?",
    text: "This will revert the expense status.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Yes, revert it!",
    cancelButtonText: "Cancel",
  });

  if (result.isConfirmed) {
    setLoading(true); // ✅ start loading
    try {
      const res = await fetch(`/api/expenses/revert/${id}`, { method: "PUT" });
      if (res.ok) {
        Swal.fire("Updated!", "Expense reverted successfully.", "success");
        setExpenses((prev) =>
          prev.map((exp) =>
            exp.id === id ? { ...exp, is_deleted: 1 } : exp
          )
        );
      } else {
        Swal.fire("Error!", "Failed to revert expense.", "error");
      }
    } catch (err) {
      Swal.fire("Error!", "Something went wrong.", "error");
      console.error("Revert error:", err);
    } finally {
      setLoading(false); // ✅ stop loading no matter what
    }
  }
};


    return (
        <div className="container mx-auto ">
            <div className="mx-auto py-4">
                <h1 className="text-2xl font-bold">Manage Expenses</h1>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center mb-6 gap-2 justify-between">

                <div className="flex gap-2 flex-wrap">
                    <input
                        type="text"
                        placeholder="Search by category or amount..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="border p-2 rounded-lg text-xs"
                    />
                    <DatePicker
                        selected={startDate}
                        onChange={(date) => setStartDate(date)}
                        className="border p-2 rounded-lg text-xs"
                        placeholderText="Start date"
                        dateFormat="yyyy-MM-dd"
                    />
                    <DatePicker
                        selected={endDate}
                        onChange={(date) => setEndDate(date)}
                        className="border p-2 rounded-lg text-xs"
                        placeholderText="End date"
                        dateFormat="yyyy-MM-dd"
                    />


                    <button
                        onClick={exportToCSV}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex-end text-xs"
                    >
                        Export CSV
                    </button>
                    <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                        <DialogTrigger asChild>
                            <Button className="bg-blue-600 text-white px-4 py-3 rounded-lg">
                                + Add Expense
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                            <DialogHeader>
                                <DialogTitle>Add Expense</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-4">
                                <select
                                    value={categoryid}
                                    onChange={(e) => setcategoryid(Number(e.target.value))}
                                    className="border p-2 rounded-lg text-xs"
                                    required
                                >
                                    <option value="">Select Category</option>
                                    {categories.map((cat) => (
                                        <option key={cat.id} value={cat.id}>
                                            {cat.categoryName}
                                        </option>
                                    ))}
                                </select>
                                <input
                                    type="number"
                                    placeholder="Amount"
                                    value={amount}
                                    onChange={(e) => setAmount(Number(e.target.value))}
                                    className="border p-2 rounded-lg  text-xs"
                                    required
                                />
                                <input
                                    type="text"
                                    placeholder="Description"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="border p-2 rounded-lg  text-xs"
                                    required
                                />
                                <DatePicker
                                    selected={date}
                                    onChange={(date: Date | null) => setDate(date)}
                                    className="border p-2 rounded-lg text-xs"
                                    dateFormat="yyyy-MM-dd"
                                />
                                <DialogFooter className="flex justify-end gap-3">
                                    <button
                                        type="button"
                                        className="px-4 py-2 rounded-lg border"
                                        onClick={() => setIsModalOpen(false)}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="bg-blue-600 text-white px-4 py-2 rounded-lg"
                                    >
                                        {loading ? "Saving..." : "Submit"}
                                    </button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>

                </div>
            </div>

            {/* Expenses Table */}
            <table className="w-full border rounded-lg overflow-hidden shadow text-sm">
                <thead className="bg-gray-100">
                    <tr>
                        <th className="p-3 text-left border">Date</th>
                        <th className="p-3 text-left border">Category</th>
                        <th className="p-3 text-left border">Amount ($)</th>
                        <th className="p-3 text-left border">Description</th>
                        <th className="p-3 text-left border">Action</th>
                    </tr>
                </thead>
                <tbody>
                    {loading ? (
                        <tr>
                            <td colSpan={5} className="text-center p-4">
                                <div className="flex flex-col items-center justify-center">
                                    <div className="w-8 h-8 border-4 border-gray-300 border-t-gray-500 rounded-full animate-spin mb-2"></div>
                                    <span className="text-gray-600 font-medium">Loading...</span>
                                </div>
                            </td>
                        </tr>
                    ) : currentExpenses.length === 0 ? (
                        <tr>
                            <td colSpan={5} className="text-center p-4 text-gray-500">
                                No expenses found
                            </td>
                        </tr>
                    ) : (
                        currentExpenses.map((exp) => (
                            <tr
                                key={exp.id}
                                className={`hover:bg-gray-50 transition-colors duration-300 ${exp.is_deleted === 0 ? "bg-red-100" : "bg-white"
                                    }`} >
                                <td className="p-2 text-xs border">{new Date(exp.createdAt).toLocaleDateString()}</td>
                                <td className="p-2 text-xs border">{exp.categoryName}</td>
                                <td className="p-2 text-xs border">{exp.amount}</td>
                                <td className="p-2 text-xs border">{exp.description}</td>
                                <td className="p-2 text-xs border flex gap-3">
                                    <button
                                        className="text-blue-600 hover:text-blue-800"
                                        onClick={() => handleEdit(exp)}
                                    >
                                        <Pencil size={18} />
                                    </button>
                                    {exp.is_deleted === 0 ? (
                                        <button
                                            onClick={() => handleRevert(exp.id)}
                                            title="Revert Expenses"

                                            style={{
                                                fontSize: '1rem',
                                                marginRight: '8px',
                                            }}
                                        >
                                            🛑
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => handleHide(exp.id)}
                                            title="Hide Expenses"
                                            style={{
                                                fontSize: '1rem',
                                            }}
                                        >
                                            ♻️
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex justify-center mt-4 gap-2">
                    {Array.from({ length: totalPages }, (_, i) => (
                        <button
                            key={i + 1}
                            onClick={() => setCurrentPage(i + 1)}
                            className={`px-3 py-1 border rounded ${currentPage === i + 1 ? "bg-blue-600 text-white" : "bg-white"
                                }`}
                        >
                            {i + 1}
                        </button>
                    ))}
                </div>
            )}

            {/* Edit Modal */}
            {editingExpense && (
                <Dialog open={!!editingExpense} onOpenChange={(open) => !open && setEditingExpense(null)}>
                    <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                            <DialogTitle>Edit Expense</DialogTitle>
                        </DialogHeader>

                        <div className="flex flex-col gap-2 mt-2">
                            <label className="font-medium text-sm">Category</label>
                            <select
                                value={editcategoryid}
                                onChange={(e) => setEditcategoryid(Number(e.target.value))}
                                className="border p-2 rounded"
                            >
                                <option value="">Select Category</option>
                                {categories.map((cat) => (
                                    <option key={cat.id} value={cat.id}>
                                        {cat.categoryName}
                                    </option>
                                ))}
                            </select>

                            <label className="font-medium text-sm">Amount ($)</label>
                            <input
                                type="number"
                                placeholder="Amount"
                                value={editAmount}
                                onChange={(e) => setEditAmount(Number(e.target.value))}
                                className="border p-2 rounded"
                            />

                            <label className="font-medium text-sm">Description</label>
                            <input
                                type="text"
                                placeholder="Description"
                                value={editDescription}
                                onChange={(e) => setEditDescription(e.target.value)}
                                className="border p-2 rounded"
                            />

                            <label className="font-medium text-sm">Date</label>
                            <div className="relative">
                                <DatePicker
                                    selected={editDate}
                                    onChange={(date: Date | null) => setEditDate(date)}
                                    className="border p-2 rounded w-full pl-10 cursor-pointer"
                                    dateFormat="yyyy-MM-dd"
                                    placeholderText="Select date"
                                />
                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-700" size={16} />
                            </div>
                        </div>


                        <DialogFooter className="mt-4 flex justify-end gap-2">
                            <button
                                className="px-4 py-2 bg-gray-200 rounded"
                                onClick={() => setEditingExpense(null)}
                            >
                                Cancel
                            </button>
                            <button
                                className="px-4 py-2 bg-blue-600 text-white rounded"
                                onClick={saveEdit}
                            >
                                {loading ? "Saving..." : "Update"}
                            </button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            )}
        </div>
    );
}
