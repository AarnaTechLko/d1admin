'use client';

import { useState } from 'react';
import Swal from 'sweetalert2';
import { useSession } from 'next-auth/react';
import { Eye, EyeOff } from 'lucide-react';

export default function ChangePasswordForm() {
  const { data: session } = useSession();
  const userId = session?.user?.id;

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userId) {
      return Swal.fire('Error', 'User not logged in.', 'error');
    }

    if (!currentPassword.trim()) {
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
        body: JSON.stringify({
          userId,
          currentPassword: currentPassword.trim(),
          newPassword: newPassword.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Password update failed.');
      }

      Swal.fire('Success', 'Password updated successfully.', 'success');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      Swal.fire(
        'Error',
        err instanceof Error ? err.message : 'Unexpected error occurred.',
        'error'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-md mx-auto mt-8 p-6 bg-white rounded-xl shadow-md space-y-6"
    >
      <h2 className="text-2xl font-bold text-center">Change Password</h2>

      {/* Current Password */}
      <div className="relative">
        <label className="block mb-1">Current Password</label>
        <input
          type={showCurrent ? 'text' : 'password'}
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          className="w-full border px-4 py-2 rounded"
          required
        />
        <span
          onClick={() => setShowCurrent(!showCurrent)}
          className="absolute right-3 top-9 cursor-pointer"
        >
          {showCurrent ? <EyeOff /> : <Eye />}
        </span>
      </div>

      {/* New Password */}
      <div className="relative">
        <label className="block mb-1">New Password</label>
        <input
          type={showNew ? 'text' : 'password'}
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="w-full border px-4 py-2 rounded"
          required
        />
        <span
          onClick={() => setShowNew(!showNew)}
          className="absolute right-3 top-9 cursor-pointer"
        >
          {showNew ? <EyeOff /> : <Eye />}
        </span>
      </div>

      {/* Confirm Password */}
      <div className="relative">
        <label className="block mb-1">Confirm New Password</label>
        <input
          type={showConfirm ? 'text' : 'password'}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="w-full border px-4 py-2 rounded"
          required
        />
        <span
          onClick={() => setShowConfirm(!showConfirm)}
          className="absolute right-3 top-9 cursor-pointer"
        >
          {showConfirm ? <EyeOff /> : <Eye />}
        </span>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-blue-600 text-white py-2 rounded"
      >
        {isSubmitting ? 'Updating...' : 'Update Password'}
      </button>
    </form>
  );
}
