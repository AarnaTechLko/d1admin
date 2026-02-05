"use client";

import React, { useState, useRef } from "react";
import imageCompression from "browser-image-compression";
import CropEasy from "@/components/crop/CropEasy";
import { Camera } from "lucide-react";
import { FaCheck, FaSpinner } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function UploadProfileImage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [profilePicFile, setProfilePicFile] = useState<File | null>(null);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [imageUrlToCrop, setImageUrlToCrop] = useState<string | null>(null);
  const [openCrop, setOpenCrop] = useState(false);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [imageError, setImageError] = useState<string>("");

  const handleCropImage = async (file: File) => {
    setProfilePicFile(file);
    setProfileImage(URL.createObjectURL(file));
    setOpenCrop(false);
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = async () => {
    setPhotoUploading(true);
    const file = fileInputRef.current?.files?.[0];
    if (!file) {
      setPhotoUploading(false);
      return;
    }

    let currentFile = file;
    const maxFinalSizeMB = 1;
    while (true) {
      const options = {
        maxSizeMB: 0.5,
        maxWidthOrHeight: 1500,
        useWebWorker: true,
      };
      const compressed = await imageCompression(currentFile, options);

      if (compressed.size / 1024 / 1024 <= maxFinalSizeMB) {
        setPhotoUploading(false);
        setImageUrlToCrop(URL.createObjectURL(compressed));
        setOpenCrop(true);
        break;
      }

      currentFile = compressed;
    }
  };

  const uploadImage = async (file: File): Promise<{ signedUrl: string; key: string }> => {
    try {
      const res = await fetch("/api/sign-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName: file.name,
          mimeType: file.type,
          folder: "coach/profile-picture",
        }),
      });
      const data = await res.json();

      const uploadRes = await fetch(data.signedUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });

      if (!uploadRes.ok) {
        throw new Error("Upload failed");
      }

      return data;
    } catch (error) {
      console.error("Upload error:", error);
      return { key: "", signedUrl: "" };
    }
  };

  const handleSubmit = async () => {
    if (!session?.user) return;

    setLoading(true);
    setImageError("");

    try {
      if (!profileImage) {
        setImageError("Please select a profile image");
        setLoading(false);
        return;
      }

      let uploadedImage = { key: "", signedUrl: "" };
      if (profilePicFile) {
        uploadedImage = await uploadImage(profilePicFile);
      }

      const response = await fetch("/api/profileimage", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key: uploadedImage.key,
          userId: session.user.id,
        }),
      });

      if (!response.ok) throw new Error("Failed to save profile image");

      // Role-based redirect
      const redirectPath = session.user.role === "Customer Support" ? "/ticket" : "/dashboard";
      router.push(redirectPath);
    } catch (error) {
      console.error(error);
      setImageError("Failed to save image. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Wait until session is loaded
  if (status === "loading") return null;

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-3xl font-bold text-gray-900">Admin Profile Image</h1>
          <p className="text-gray-600">Add your profile image to get started</p>
        </div>

        <div className="mb-8 rounded-3xl bg-white p-8 shadow-sm">
          <div className="flex flex-col items-center">
            <div
              className="mb-4 flex h-32 w-32 cursor-pointer items-center justify-center overflow-hidden rounded-full border-4 border-gray-200 bg-gray-100 transition-colors hover:border-blue-300"
              onClick={handleImageClick}
            >
              {profileImage ? (
                <img src={profileImage} alt="Profile" className="h-full w-full object-cover" />
              ) : (
                <div className="text-center text-gray-400">
                  <Camera className="mx-auto mb-2 h-8 w-8" />
                  <div className="text-sm">Add Photo</div>
                </div>
              )}
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
            <button
              type="button"
              onClick={handleImageClick}
              className="rounded-full border border-blue-200 bg-blue-50 px-6 py-2 text-sm font-medium text-blue-600 transition-colors hover:bg-blue-100"
            >
              {photoUploading ? "Uploading..." : "Upload Admin Image"}
            </button>
            {imageError && <p className="mt-2 text-sm text-red-500">{imageError}</p>}
          </div>

          <div className="flex justify-end pt-6">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center rounded-xl bg-blue-600 px-8 py-3 font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
              onClick={handleSubmit}
            >
              {loading ? (
                <>
                  <FaSpinner className="mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <FaCheck className="mr-2" />
                  Submit Profile Image
                </>
              )}
            </button>
          </div>
        </div>

        {openCrop && imageUrlToCrop && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="mx-4 w-full max-w-md rounded-3xl bg-white p-6">
              <h3 className="mb-4 text-lg font-semibold">Crop Your Image</h3>
              <CropEasy
                photoUrl={imageUrlToCrop}
                session={session?.user.id ?? null} // ✅ fixed
                setOpenCrop={setOpenCrop}
                handleCropImage={handleCropImage}
              />
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
