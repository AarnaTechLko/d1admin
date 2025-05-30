'use client';

import { useEffect, useState } from 'react';
import Swal from 'sweetalert2';

export default function ChangePasswordForm() {
  const [userId, setUserId] = useState<number | null>(null);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load user_id from sessionStorage on mount
  useEffect(() => {
    const raw = sessionStorage.getItem('user_id');

    if (raw) {
      const parsed = parseInt(raw, 10);
      if (!isNaN(parsed)) {
        setUserId(parsed);
      } else {
        Swal.fire('Error', 'Invalid user ID in session storage.', 'error');
      }
    } else {
      Swal.fire('Error', 'User not logged in.', 'error');
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (userId === null) {
      return Swal.fire('Error', 'No User ID—please log in first.', 'error');
    }

    if (!currentPassword || currentPassword.trim().length === 0) {
      return Swal.fire('Warning', 'Please enter your current password.', 'warning');
    }

    if (newPassword.length < 6) {
      return Swal.fire('Warning', 'New password must be at least 6 characters.', 'warning');
    }

    if (newPassword !== confirmPassword) {
      return Swal.fire('Warning', 'Passwords do not match.', 'warning');
    }

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/changepassword', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, currentPassword, newPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Password update failed.');
      }

      Swal.fire('Success', 'Password updated successfully.', 'success');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: unknown) {
  if (err instanceof Error) {
    Swal.fire('Error', err.message, 'error');
  } else {
    Swal.fire('Error', 'Unexpected error occurred.', 'error');
  }
} finally {
  setIsSubmitting(false);
}

  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-md mx-auto mt-8 p-6 bg-white rounded-xl shadow-md space-y-6"
    >
      <h2 className="text-2xl font-bold text-center text-gray-800">
        Change Password
      </h2>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Current Password
        </label>
        <input
          type="password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          required
          className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          New Password
        </label>
        <input
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
          className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Confirm New Password
        </label>
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <button
        type="submit"
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-md transition duration-200 disabled:opacity-50"
        disabled={userId === null || isSubmitting}
      >
        {isSubmitting ? 'Updating...' : 'Update Password'}
      </button>
    </form>
  );
}
