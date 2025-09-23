"use client";

import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { Pencil, Trash2 } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogTrigger,
} from "@/components/ui/dialog";

interface Category {
    amount: number;
    totalAmount: number;
    categoryName: string;
    id: number;
    name: string;
    createdAt: string;
}

export default function CategoryPage() {
    const [name, setName] = useState("");
    const [search, setSearch] = useState("");
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(false);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Add Category modal
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    // Edit Category modal
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
    const [newName, setNewName] = useState("");

    // Fetch categories
    const fetchCategories = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/expense_categories");
            if (!res.ok) {
                Swal.fire({
                    icon: "error",
                    title: "Failed to Fetch",
                    text: "Could not load categories. Please try again later.",
                });
                return;
            }
            const data = await res.json();
            setCategories(data.data || []);
        } catch (error) {
            console.error("Error fetching categories:", error);
            Swal.fire({
                icon: "error",
                title: "Error",
                text: "Something went wrong while fetching categories.",
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    // Add new category
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name) return;

        setLoading(true);
        try {
            const res = await fetch("/api/expense_categories", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name }),
            });

            if (res.ok) {
                setName("");
                fetchCategories();
                Swal.fire({
                    icon: "success",
                    title: "Category Added",
                    text: "Your new expense category has been added successfully!",
                    timer: 2000,
                    showConfirmButton: false,
                });
                setIsAddModalOpen(false); // Close modal
            } else {
                Swal.fire({
                    icon: "error",
                    title: "Failed",
                    text: "Failed to add category. Please try again.",
                });
            }
        } catch (error) {
            console.error("Error submitting category:", error);
            Swal.fire({
                icon: "error",
                title: "Error",
                text: "Something went wrong while submitting the category.",
            });
        } finally {
            setLoading(false);
        }
    };

    // Open Edit Modal
    const openEditModal = (cat: Category) => {
        setSelectedCategory(cat);
        setNewName(cat.categoryName); // prefill input
        setIsEditModalOpen(true);
    };

    // Save Edit
    const handleEditSave = async () => {
        if (!selectedCategory || !newName) return;

        try {
            const res = await fetch(`/api/expense_categories/${selectedCategory.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: newName }),
            });

            if (res.ok) {
                fetchCategories();
                setIsEditModalOpen(false);
                Swal.fire("Updated!", "Category updated successfully", "success");
            } else {
                Swal.fire("Error", "Failed to update category", "error");
            }
        } catch (error) {
    console.error("Something went wrong:", error);
    Swal.fire("Error", "Something went wrong", "error");
}

    };

    // Delete category
    const handleDelete = async (category: Category) => {
        const result = await Swal.fire({
            title: "Are you sure?",
            text: `Delete ${category.categoryName}?`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Yes, delete it!",
        });

        if (result.isConfirmed) {
            try {
                const res = await fetch(`/api/expense_categories/${category.id}`, {
                    method: "DELETE",
                });

                if (res.ok) {
                    fetchCategories();
                    Swal.fire("Deleted!", "Category deleted successfully", "success");
                } else {
                    Swal.fire("Error", "Failed to delete category", "error");
                }
            }catch (error) {
    console.error("Something went wrong:", error);
    Swal.fire("Error", "Something went wrong", "error");
}

        }
    };

    // Filter categories
    const filteredCategories = categories.filter((cat) => {
        const searchLower = search.toLowerCase();

        // category name
        const categoryMatch = cat.categoryName?.toLowerCase().includes(searchLower);

        // expense (amount or totalAmount)
        const expenseMatch = String(cat.amount || cat.totalAmount || 0)
            .toLowerCase()
            .includes(searchLower);

        // created date
        const createdDate = new Date(cat.createdAt);
        const formattedDate = createdDate.toLocaleDateString("en-GB");
        const formattedMonthYear = createdDate.toLocaleDateString("en-US", {
            month: "short",
            year: "numeric",
        });

        const createdAtMatch =
            cat.createdAt.toLowerCase().includes(searchLower) ||
            formattedDate.toLowerCase().includes(searchLower) ||
            formattedMonthYear.toLowerCase().includes(searchLower);

        return categoryMatch || expenseMatch || createdAtMatch;
    });

    // Pagination logic
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentCategories = filteredCategories.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredCategories.length / itemsPerPage);

    // Total expense calculation
    const totalExpense = filteredCategories.reduce(
        (acc, cat) => acc + Number(cat.totalAmount || 0),
        0
    );
    const exportToCSV = () => {
        if (filteredCategories.length === 0) {
            Swal.fire("No Data", "There are no categories to export.", "info");
            return;
        }

        const headers = ["ID", "Category Name", "Total Expense", "Created At"];
        const rows = filteredCategories.map((cat) => [
            cat.id,
            cat.categoryName,
            cat.totalAmount || 0,
            new Date(cat.createdAt).toLocaleDateString(),
        ]);

        const csvContent =
            [headers, ...rows].map((row) => row.join(",")).join("\n");

        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", "categories.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };
    return (
        <div className="container mx-auto py-4">
            {/* Header with Search + Add Button */}



            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">Manage Expense Categories</h1>

                {/* Total Expense */}
                <div className="text-lg font-medium text-sm">
                    Total Expenses: ${Number(totalExpense || 0).toFixed(2)}
                </div>

            </div>

            {/* Search + Add Button */}
            <div className="flex justify-between items-center mb-6">
                <div className=" max-w-lg">
                    <input
                        type="text"
                        placeholder="Search categories..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className=" border p-2 rounded-lg text-xs"
                    />
                </div>
            <div className="flex gap-2 flex-wrap">
                <button
                    onClick={exportToCSV}
                    className="bg-green-600  text-xs text-white px-4 py-2 rounded-lg hover:bg-green-700 flex-end"
                >
                    Export CSV
                </button>
                <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                    <DialogTrigger asChild>
                        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-xs">
                            + Add Category
                        </button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>Add New Category</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-4">
                            <input
                                type="text"
                                placeholder="Enter category name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="border p-2 rounded-lg"
                                required
                            />
                            <DialogFooter className="flex justify-end gap-3">
                                <button
                                    type="button"
                                    className="px-4 py-2 rounded-lg border"
                                    onClick={() => setIsAddModalOpen(false)}
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

            {/* Loading Indicator */}

            {/* Table */}
            <table className="w-full border rounded-lg overflow-hidden shadow text-sm">
                <thead className="bg-gray-100">
                    <tr>
                        <th className="p-3 text-left border">Name</th>
                        <th className="p-3 text-left border">Total Expense ($)</th>
                        <th className="p-3 text-left border">Created At</th>
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
                    ) : currentCategories.length === 0 ? (
                        <tr>
                            <td colSpan={5} className="text-center p-4 text-gray-500">
                                No categories found
                            </td>
                        </tr>
                    ) : (
                        currentCategories.map((cat) => (
                            <tr key={cat.id} className="hover:bg-gray-50">
                                <td className="p-2 text-xs border">{cat.categoryName}</td>
                                <td className="p-2 text-xs border">${cat.totalAmount || 0}</td>
                                <td className="p-2 text-xs border">
                                    {new Date(cat.createdAt).toLocaleDateString()}
                                </td>
                                <td className="p-2 text-xs border flex gap-3">
                                    <button
                                        className="text-blue-600 hover:text-blue-800"
                                        onClick={() => openEditModal(cat)}
                                    >
                                        <Pencil size={18} />
                                    </button>
                                    <button
                                        className="text-red-600 hover:text-red-800"
                                        onClick={() => handleDelete(cat)}
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>

            </table>

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-4">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`px-3 py-1 border rounded ${currentPage === page ? "bg-blue-600 text-white" : ""
                                }`}
                        >
                            {page}
                        </button>
                    ))}
                </div>
            )}

            {/* Edit Category Dialog */}
            <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Edit Category</DialogTitle>
                    </DialogHeader>
                    <div className="flex flex-col gap-4 mt-4">
                        <input
                            type="text"
                            placeholder="Enter category name"
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            className="border p-2 rounded-lg"
                            required
                        />
                        <DialogFooter className="flex justify-end gap-3">
                            <button
                                type="button"
                                className="px-4 py-2 rounded-lg border"
                                onClick={() => setIsEditModalOpen(false)}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleEditSave}
                                className="bg-blue-600 text-white px-4 py-2 rounded-lg"
                            >
                                Save
                            </button>
                        </DialogFooter>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
