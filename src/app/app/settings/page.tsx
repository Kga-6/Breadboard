"use client";
import { useState, useEffect, useRef } from 'react';
import { useAuth } from "@/app/context/AuthContext";
import Image from 'next/image';

export default function Settings() {
    const { userData, updateUserProfile } = useAuth();

    const [name, setName] = useState('');
    const [username, setUsername] = useState('');
    const [dob, setDob] = useState('');

    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
      if (userData) {
        setName(userData.name || '');
        setUsername(userData.username || '');
        setDob(userData.dob || '');
      }
    }, [userData, message]);

    const handleSaveChanges = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!userData) return;

        setMessage(null);
        setIsSubmitting(true);

        // Build a payload with ONLY the fields that have changed
        const updatePayload: { [key: string]: string } = {};
        if (name !== userData.name) {
            updatePayload.name = name;
        }
        if (username !== userData.username) {
            updatePayload.newUsername = username;
        }
        if (dob !== userData.dob) {
            updatePayload.dob = dob;
        }

        // If nothing changed, don't make an API call
        if (Object.keys(updatePayload).length === 0) {
            setMessage({ type: 'success', text: 'No changes to save.' });
            setIsSubmitting(false);
            return;
        }

        try {
            await updateUserProfile(updatePayload);
            setMessage({ type: 'success', text: 'Profile updated successfully!' });
        } catch (error: unknown) {
            setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Failed to update profile.' });
        } finally {
            setIsSubmitting(false);
        }
    };

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

    return(
      <div className='max-w-2xl mx-auto'>
        <h1 className="text-3xl font-bold mb-6 text-gray-800">Settings</h1>

          {message && (
            <div className={`p-4 mb-4 text-sm rounded-lg ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {message.text}
            </div>
          )}

          <div className="mb-8 p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4 text-gray-700">Profile Picture</h2>
            <div className="flex items-center gap-4">
              <Image
                src={userData?.profilePictureUrl || '/default-avatar.jpg'}
                alt="Profile"
                className="w-20 h-20 rounded-full object-cover"
                width={80}
                height={80}
              />
              <input type="file" accept="image/*" onChange={handleProfilePictureChange} ref={fileInputRef} className="hidden" />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors disabled:bg-gray-400"
                disabled={isSubmitting}>
                {isSubmitting ? 'Uploading...' : 'Change Picture'}
              </button>
            </div>
          </div>

          <form onSubmit={handleSaveChanges} className="flex flex-col">

            {/* General Profile Information */}
            <div className='mb-8 p-6 bg-white rounded-lg shadow-md'>
              <h2 className="text-xl font-semibold mb-4 text-gray-700">General Information</h2>
              {/* Inputs for Name and DOB remain the same */}
              <div className="space-y-4">
                  <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-600">Display Name</label>
                      <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} maxLength={50} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"/>
                  </div>
                  <div>
                    <label htmlFor="dob" className="block text-sm font-medium text-gray-600">Date of Birth</label>

                    {!userData?.dobChangeCount || userData?.dobChangeCount && userData?.dobChangeCount < 2 ? (
                      <input
                        type="date"
                        id="dob"
                        value={dob}
                        onChange={(e) => setDob(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    ) : (
                      <span className="text-sm text-gray-500">{userData?.dob}</span>
                    )}
                </div>
              </div>
            </div>

            {/* Username Change */}
            <div className='mb-8 p-6 bg-white rounded-lg shadow-md'>
              <h2 className="text-xl font-semibold mb-4 text-gray-700">Change Username</h2>
              <p className="text-sm text-gray-500 mb-2">Your username must be 3–25 characters and can only contain letters, numbers, and underscores (_)</p>
              {/* Input for Username remains the same */}
              <div>
                  <label htmlFor="username" className="block text-sm font-medium text-gray-600">Username</label>
                  <input type="text" id="username" value={username} onChange={(e) => setUsername(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
              </div>
            </div>

             <div className="flex justify-end">
                <button type="submit" disabled={isSubmitting} className="px-6 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors disabled:bg-gray-400">
                  {isSubmitting ? 'Saving...' : 'Save'}
                </button>
              </div>
          </form>
      </div>
    )

    // return (
    //     <div className='max-w-2xl mx-auto'>
    //         <h1 className="text-3xl font-bold mb-6 text-gray-800">Settings</h1>

    //         {message && (
    //             <div className={`p-4 mb-4 text-sm rounded-lg ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
    //                 {message.text}
    //             </div>
    //         )}

    //         {/* Profile Picture Section */}
    //         <div className="mb-8 p-6 bg-white rounded-lg shadow-md">
    //              <h2 className="text-xl font-semibold mb-4 text-gray-700">Profile Picture</h2>
    //              <div className="flex items-center gap-4">
    //                  <img
    //                     src={userData?.profilePictureUrl || '/default-avatar.png'}
    //                     alt="Profile"
    //                     className="w-20 h-20 rounded-full object-cover"
    //                  />
    //                  <input
    //                     type="file"
    //                     accept="image/*"
    //                     onChange={handleProfilePictureChange}
    //                     ref={fileInputRef}
    //                     className="hidden"
    //                  />
    //                  <button
    //                     onClick={() => fileInputRef.current?.click()}
    //                     className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors disabled:bg-gray-400"
    //                     disabled={isSubmitting}
    //                  >
    //                     {isSubmitting ? 'Uploading...' : 'Change Picture'}
    //                  </button>
    //              </div>
    //          </div>

    //         {/* General Profile Information */}
    //         <form onSubmit={handleProfileInfoSubmit} className="mb-8 p-6 bg-white rounded-lg shadow-md">
    //             <h2 className="text-xl font-semibold mb-4 text-gray-700">General Information</h2>
    //             {/* Inputs for Name and DOB remain the same */}
    //             <div className="space-y-4">
    //                 <div>
    //                     <label htmlFor="name" className="block text-sm font-medium text-gray-600">Display Name</label>
    //                     <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} maxLength={50} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"/>
    //                 </div>
    //                 <div>
    //                   <label htmlFor="dob" className="block text-sm font-medium text-gray-600">Date of Birth</label>

    //                   {userData?.dobChangeCount && userData?.dobChangeCount < 2 ? (
    //                     <input
    //                       type="date"
    //                       id="dob"
    //                       value={dob}
    //                       onChange={(e) => setDob(e.target.value)}
    //                       className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
    //                     />
    //                   ) : (
    //                     <span className="text-sm text-gray-500">{userData?.dob}</span>
    //                   )}
    //               </div>
    //             </div>
    //             <button type="submit" disabled={isSubmitting} className="mt-6 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors disabled:bg-gray-400">
    //                 {isSubmitting ? 'Saving...' : 'Save Profile'}
    //             </button>
    //         </form>

    //         {/* Username Change */}
    //         <form onSubmit={handleUsernameSubmit} className="p-6 bg-white rounded-lg shadow-md">
    //             <h2 className="text-xl font-semibold mb-4 text-gray-700">Change Username</h2>
    //             <p className="text-sm text-gray-500 mb-2">Your username must be 3–25 characters and can only contain letters, numbers, and underscores (_)</p>
    //             {/* Input for Username remains the same */}
    //             <div>
    //                 <label htmlFor="username" className="block text-sm font-medium text-gray-600">Username</label>
    //                 <input type="text" id="username" value={username} onChange={(e) => setUsername(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
    //             </div>
    //             <button type="submit" disabled={isSubmitting} className="mt-6 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors disabled:bg-gray-400">
    //                  {isSubmitting ? 'Saving...' : 'Update Username'}
    //             </button>
    //         </form>

    //     </div>
    // );
}