"use client";

import { useAuth } from "@/app/context/AuthContext";
import Image from "next/image";
import { useState, useRef } from "react";

const CompleteProfilePicture = ({ handleProfilePictureChange }: { handleProfilePictureChange: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void> }) => {
  //
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  return (
    <div>
      <h1 className="text-lg font-bold mb-2">Pick a profile picture</h1>
      <p className="text-sm text-gray-500 mb-8">Have a picture in mind? Upload it below.</p>
      <div className="flex flex-col justify-center items-center gap-2">
        <Image
          src={
            `/default-avatar.jpg`
          }
          alt={"Profile Picture"}
          width={120}
          height={120}
          className="rounded-full"
          onClick={() => fileInputRef.current?.click()}
        />
        <input className="hidden" type="file" onChange={handleProfilePictureChange} ref={fileInputRef} />
      </div>
    </div>
  )
}

const CompleteProfileUsername = () => {
  // TODO: Add username input
  // TODO: Add username validation
  // TODO: Add username availability check
  // TODO: Add username change confirmation
  // TODO: Add username change success message
  // TODO: Add username change error message
  // TODO: Add username change loading state
  // TODO: Add username change submit button
  return (
    <div>
      <h1 className="text-lg font-bold mb-2">Choose a username</h1>
      <p className="text-sm text-gray-500 mb-8"></p>
    </div>
  )
}

export default function OnboardingDisplay(){
  const { currentUser, userData, updateUserProfile } = useAuth();
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);


  const handleProfilePictureChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

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
    <div className="bg-[#ebebeb] p-4 rounded-lg">
      <h1 className="text-sm text-red-400 mb-2">Testing</h1>
      <CompleteProfilePicture handleProfilePictureChange={handleProfilePictureChange} />

      <button className="text-blue-400 text-center w-full py-2 rounded-md mt-4">Skip for now</button>
    </div>
  )
}