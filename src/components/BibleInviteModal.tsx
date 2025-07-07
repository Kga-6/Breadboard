"use client";

import { useAuth } from "@/app/context/AuthContext";
import { useState } from "react";
import Image from "next/image";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const BibleInviteModal = ({ isOpen, onClose }: Props) => {
  const { userData, friends, manageBibleRoomInvite, setBibleRoomSharing } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  
  if (!isOpen || !userData) return null;

  const filteredFriends = friends.filter(friend =>
    friend.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleToggleSharing = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      await setBibleRoomSharing(e.target.checked);
    } catch (error) {
      console.error("Failed to update sharing status:", error);
      // Optionally show an error message to the user
    }
  };

  const handleInviteAction = async (friendId: string, action: 'invite' | 'uninvite') => {
     try {
       await manageBibleRoomInvite(friendId, action);
     } catch (error) {
       console.error(`Failed to ${action} friend:`, error);
     }
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex justify-center items-center">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Invite to Bible Room</h2>
          <button onClick={onClose} className="text-2xl">&times;</button>
        </div>

        {/* Sharing Toggle */}
        <div className="flex items-center justify-between p-3 bg-gray-100 rounded-lg mb-4">
          <span className="font-semibold">Share Your Room</span>
          <label className="relative inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              checked={userData.bibleRoom.sharing} 
              onChange={handleToggleSharing}
              className="sr-only peer" 
            />
            <div className="w-11 h-6 bg-gray-300 rounded-full peer peer-focus:ring-2 peer-focus:ring-blue-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>
        
        {/* Friend Search */}
        <div className="mb-4">
            <input
                type="text"
                placeholder="Search friends..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full p-2 border rounded-md"
            />
        </div>

        {/* Friends List */}
        <div className="max-h-60 overflow-y-auto">
          {filteredFriends.length > 0 ? filteredFriends.map((friend) => {
            const isInvited = userData.bibleRoom.invited.includes(friend.id);
            return (
              <div key={friend.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-md">
                <div className="flex items-center">
                <Image
                  src={friend.photoURL || "/default-avatar.jpg"}
                  alt={friend.username}
                  className="w-10 h-10 rounded-full mr-3"
                  width={40}
                  height={40}
                />
                  <span>{friend.username}</span>
                </div>
                <button 
                  onClick={() => handleInviteAction(friend.id, isInvited ? 'uninvite' : 'invite')}
                  className={`px-3 py-1 text-sm rounded-full text-white ${isInvited ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'}`}
                >
                  {isInvited ? 'Remove' : 'Invite'}
                </button>
              </div>
            );
          }) : <p className="text-center text-gray-500">No friends found.</p>}
        </div>

        {/* Close Button */}
        <div className="mt-6 flex justify-end">
            <button 
                onClick={onClose}
                className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
            >
                Done
            </button>
        </div>
      </div>
    </div>
  );
};