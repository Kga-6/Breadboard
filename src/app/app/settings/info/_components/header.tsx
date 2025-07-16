"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Edit, Loader2 } from "lucide-react";
import { useAuth } from "@/app/context/AuthContext";
import { useRef, useState } from "react";

export default function PageHeader() {

  const { userData, updateUserProfile } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleProfilePictureChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // VALIDATION: Check if the file type starts with "image/"
    if (!file.type.startsWith("image/")) {
      setMessage({ type: 'error', text: 'Invalid file type. Please select an image.' });
      return; // Stop the function here
    }

    setMessage(null);
    setIsSubmitting(true);
    try {
        await updateUserProfile({ photoFile: file });
        setMessage({ type: 'success', text: 'Profile picture updated!' });
    } catch (error: unknown) {
        setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Failed to upload image.' });
    } finally {
        setIsSubmitting(false);
    }
};
  
  return (
    <div className="flex flex-row justify-between mb-4">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-black dark:text-white">My Profile</h1>
        <p className="text-gray-500">Manage your account details and preferences.</p>
      </div>


      {isSubmitting ? (
        <div className="relative flex w-24 h-24 justify-center items-center border-1 border-gray-200 rounded-full">
          <Loader2 style={{ width: "24px", height: "24px" }} className=" animate-spin text-gray-500" />
        </div>
      ):(
        <div className="relative">
          <Avatar className="w-24 h-24" onClick={() => fileInputRef.current?.click()}>
            <AvatarImage className="object-cover" src={userData?.profilePictureUrl || "/default-avatar.jpg"} />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
          <input type="file" accept="image/*" onChange={handleProfilePictureChange} ref={fileInputRef} className="hidden" />
          <Edit className="w-7 h-7 absolute bottom-0 right-0 bg-white rounded-full p-1" onClick={() => fileInputRef.current?.click()} />
        </div>
      )}

    </div>
  );
}