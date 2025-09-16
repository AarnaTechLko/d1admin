"use client"

import React, { useState, useRef, useEffect } from "react";
import imageCompression from 'browser-image-compression';
import CropEasy from "@/components/crop/CropEasy";
import { Camera, } from 'lucide-react';
import { FaCheck, FaSpinner } from 'react-icons/fa';


import { useRouter } from "next/navigation";

export default function UploadProfileImage() {

    const router = useRouter();
    const [profilePicFile, setProfilePicFile] = useState<File | null>(null);
    const [photoUploading, setPhotoUploading] = useState<boolean>(false);  
    const [imageUrlToCrop, setImageUrlToCrop] = useState<string | null>(null);
    const [openCrop, setOpenCrop] = useState<boolean>(false);
    const [profileImage, setProfileImage] = useState<string | null>(null);
    const [imageError, setImageError] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const [userId, setUserId] = useState<string | null>(null);

  const handleCropImage = async (file: File) => {
    setProfilePicFile(file);
    setProfileImage(URL.createObjectURL(file));
    setOpenCrop(false);
  };

  const handleImageClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleImageChange = async () => {
    setPhotoUploading(true);
    const file = fileInputRef.current?.files?.[0];
    if (!file) {
      return;
    }

    let currentFile = file;
    let currentQuality = 0.9;
    let compressed = new File([''], '');
    const maxFinalSizeMB = 1;
    while (true) {
      const options = {
        maxSizeMB: 0.5,
        maxWidthOrHeight: 1500,
        useWebWorker: true,
      };
      compressed = await imageCompression(currentFile, options);

      if (
        compressed.size / 1024 / 1024 <= maxFinalSizeMB ||
        currentQuality <= 0.2
      ) {
        break;
      }

      currentFile = compressed;
      currentQuality -= 0.1;
    }

    setPhotoUploading(false);
    setImageUrlToCrop(URL.createObjectURL(compressed));
    setOpenCrop(true);
  };

  const uploadImage = async (
    file: File,
    // options?: object,
  ): Promise<{ signedUrl: string; key: string }> => {
    try {
      //Generate a signed URL
      const keyAndUrl = await fetch('/api/sign-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: file.name,
          mimeType: file.type,
          folder: 'coach/profile-picture',
        }),
      });
      const keyAndUrlObject = await keyAndUrl.json();

      //upload file with the signedUrl
      const res = await fetch(keyAndUrlObject.signedUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': file.type,
        },
        body: file,
      });
      const data = keyAndUrlObject;
      // const data = await res.json();
      if (!res.ok) {
        console.error('Error uploading image:', data.error || 'Upload failed');
        return { key: '', signedUrl: '' };
      }

      return data;
    } catch (error) {
      console.error('Error uploading image:', error);
      return { key: '', signedUrl: '' };
    }
  };

  const handleSubmit = async () => {
    setLoading(true);

    try {

      if (!profileImage){
          setImageError("Please input user profile image");
          return;
      }

      let newProfileImage = { key: '', signedUrl: '' };

      if (profilePicFile) {
        newProfileImage = await uploadImage(profilePicFile as File);
      }


      const response = await fetch('/api/profileimage', {
        method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            key: newProfileImage.key,
            userId: userId,
          }),
      });
      if (!response.ok) {
        setLoading(false);
        throw new Error('Failed to fetch evaluation data');
      }

      // const redirectPath = data.role === "Customer Support" ? "/ticket" : "/dashboard";
      localStorage.setItem("image", newProfileImage.key);
      sessionStorage.setItem("image", newProfileImage.key);


      router.push("/ticket")

    }
    catch(error){
      console.error('Error saving image:', error);    
    }
  };

  useEffect(() => {
    const storedUserId = localStorage.getItem("user_id") || sessionStorage.getItem("user_id");
  
    console.log("ID: ", storedUserId);

    setUserId(storedUserId);
  },[])

    return (
        <div className="min-h-screen bg-gray-50 p-4">
            <div className="mx-auto max-w-6xl">
                <div className="mb-8 text-center">
                    <h1 className="mb-2 text-3xl font-bold text-gray-900">
                        Admin Profile Image
                    </h1>
                    <p className="text-gray-600">
                        Add your profile image to get started
                    </p>
                </div>

                <div className="mb-8 rounded-3xl bg-white p-8 shadow-sm">
                    <div className="flex flex-col items-center">
                        <div
                        className="mb-4 flex h-32 w-32 cursor-pointer items-center justify-center overflow-hidden rounded-full border-4 border-gray-200 bg-gray-100 transition-colors hover:border-blue-300"
                        onClick={handleImageClick}
                        >
                            {profileImage ? (
                                <img
                                src={profileImage}
                                alt="Profile"
                                className="h-full w-full object-cover"
                                />
                            ) : (
                                <div className="text-center text-gray-400">
                                <Camera className="mx-auto mb-2 h-8 w-8" />
                                <div className="text-sm">Add Photo</div>
                                </div>
                            )}
                        </div>
                        <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                        />
                        <button
                        type="button"
                        onClick={handleImageClick}
                        className="rounded-full border border-blue-200 bg-blue-50 px-6 py-2 text-sm font-medium text-blue-600 transition-colors hover:bg-blue-100"
                        >
                        {photoUploading ? 'Uploading...' : 'Upload Admin Image'}
                        </button>
                        {imageError && (
                        <p className="mt-2 text-sm text-red-500">
                            {imageError}
                        </p>
                        )}
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
                        session={userId}
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