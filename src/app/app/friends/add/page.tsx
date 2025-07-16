"use client";

import { useAuth } from "@/app/context/AuthContext";
import Header from "../_components/header";
import { Button } from "@/components/ui/button";
import FriendCard from "@/components/FriendCard";
import { useEffect, useState } from "react";

export default function AddFriend() {
  const {sentRequests, sendFriendRequest} = useAuth();

  const [addFriendUsername, setAddFriendUsername] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSendRequest = async (e: React.FormEvent) => {
    if (loading) return;

    e.preventDefault();
    if (!addFriendUsername) return;
    setError("");
    setMessage("");
    setLoading(true);
    try {
      await sendFriendRequest(addFriendUsername);
      setAddFriendUsername("");
      setMessage("Friend request sent!");
    } catch (err: unknown) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Error sending friend request.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (message || error) {
      const timer = setTimeout(() => {
        setMessage("");
        setError("");
      }, 4000);
      return () => clearTimeout(timer);
    }

  }, [message, error]);

  return (
    <div className="p-4 w-[950px] mx-auto dark:bg-[#1a1a1e] mt-16">
      <Header /> 

      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
          {error}
        </div>
      )}
      {message && (
        <div className="bg-green-100 text-green-700 p-3 rounded mb-4">
          {message}
        </div>
      )}

      <div>
        <form onSubmit={handleSendRequest} className="flex flex-col gap-4 border-b-1 pb-4 mb-6">
          <label htmlFor="add-friend-email" className="font-medium text-lg">
            Add Friend
          </label>
          <p>You can add friends with their Breadboard username.</p>
          <div className="flex flex-row justify-between gap-2">
            <input
              id="add-friend-email"
              type="text"
              placeholder="You can add friends with their Breadboard username."
              value={addFriendUsername}
              onChange={(e) => setAddFriendUsername(e.target.value)}
              className="p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 w-full h-10"
            />
            <Button
              type="submit"
              disabled={!addFriendUsername}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition self-start h-10"
            >
              Send Friend Request
            </Button>
          </div>
        </form>

        <h2 className="text-lg font-semibold mb-3">Sent Requests ({sentRequests.length})</h2>
        <ul className=" grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sentRequests.length > 0 ? (
            sentRequests.map((req) => (
              <FriendCard key={req.id} friend={req} friendRequest={false} myRequest={true} />
            ))
          ) : (
            <p className="text-gray-500  py-4">
              No results found.
            </p>
          )}
        </ul>
      </div>
    </div>
  );
}