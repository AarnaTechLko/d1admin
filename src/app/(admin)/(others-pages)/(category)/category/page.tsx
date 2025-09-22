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
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Fetch categories
    const fetchCategories = async () => {
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
            console.log("data",data);
            setCategories(data.data || []);
        } catch (error) {
            console.error("Error fetching categories:", error);
            Swal.fire({
                icon: "error",
                title: "Error",
                text: "Something went wrong while fetching categories.",
            });
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
                setIsModalOpen(false); // Close modal

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

    // Filtered categories
  const filteredCategories = categories.filter((cat) =>
    cat.categoryName.toLowerCase().includes(search.toLowerCase()) ||
    cat.createdAt.toLowerCase().includes(search.toLowerCase())
);


// const filteredCategories = categories.filter((cat) => {
//   const categoryName = (cat?.name ?? "").toString(); // always safe
//   return categoryName.toLowerCase().includes(search.toLowerCase());
// });


    const handleEdit = async (category: Category) => {
        const { value: newName } = await Swal.fire({
            title: "Edit Category",
            input: "text",
            inputLabel: "Category name",
            inputValue: category.name,
            showCancelButton: true,
        });

        if (newName && newName !== category.name) {
            try {
                const res = await fetch(`/api/expense_categories/${category.id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ name: newName }),
                });

                if (res.ok) {
                    fetchCategories();
                    Swal.fire("Updated!", "Category updated successfully", "success");
                } else {
                    Swal.fire("Error", "Failed to update category", "error");
                }
            } catch (error) {
                Swal.fire("Error", "Something went wrong", "error");
            }
        }
    };

    // Delete category
    const handleDelete = async (category: Category) => {
        const result = await Swal.fire({
            title: "Are you sure?",
            text: `Delete ${category.name}?`,
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
            } catch (error) {
                Swal.fire("Error", "Something went wrong", "error");
            }
        }
    };



    return (
        <div className="container mx-auto py-8">
            {/* Header with Search + Add Button */}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Manage Expense Categories</h1>
                <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>

                    <DialogTrigger asChild>
                        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg">
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

            {/* Search bar */}
            <div className="mb-6 max-w-sm">
                <input
                    type="text"
                    placeholder="Search categories..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full border p-2 rounded-lg"
                />
            </div>

            {/* Table */}
            <table className="w-full border rounded-lg overflow-hidden shadow text-sm">
                <thead className="bg-gray-100">
                    <tr>
                        <th className="p-3 text-left border">Name</th>
                        <th className="p-3 text-left border">Expense</th>
                        <th className="p-3 text-left border">Created At</th>
                        <th className="p-3 text-left border">Action</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredCategories.length === 0 ? (
                        <tr>
                            <td colSpan={4} className="text-center p-4 text-gray-500">
                                No categories found
                            </td>
                        </tr>
                    ) : (
                        filteredCategories.map((cat) => (
                            <tr key={cat.id} className="hover:bg-gray-50">
                                <td className="p-3 border">{cat.categoryName}</td>
                                <td className="p-3 border">{cat.totalAmount || '0 expense'}</td>
                                <td className="p-3 border">
                                    {new Date(cat.createdAt).toLocaleDateString()}
                                </td>
                                <td className="p-3 border flex gap-3">
                                    <button
                                        className="text-blue-600 hover:text-blue-800"
                                        onClick={() => handleEdit(cat)}
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
        </div>
    );
}
