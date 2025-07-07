"use client";

import { useState } from "react";
import Image from "next/image";
import { useAuth } from "@/app/context/AuthContext";
import {
  UserPlus,
  Users,
  Clock,
  CircleDot,
  Check,
  X,
} from "lucide-react";

export default function Friends() {
  // All state and logic now comes from the AuthContext
  const {
    friends,
    sentRequests,
    receivedRequests,
    sendFriendRequest,
    respondToFriendRequest,
    cancelFriendRequest,
    removeFriend,
    loading,
  } = useAuth();

  const [tab, setTab] = useState<"all" | "pending" | "online" | "add">("add");
  const [search, setSearch] = useState("");
  const [addFriendUsername, setAddFriendUsername] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleSendRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addFriendUsername) return;
    setError("");
    setMessage("");
    try {
      await sendFriendRequest(addFriendUsername);
      setAddFriendUsername("");
      setMessage("Friend request sent!");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Error sending friend request.");
    }
  };

  const handleRequestResponse = async (
    requestId: string,
    response: "accepted" | "declined"
  ) => {
    try {
      await respondToFriendRequest(requestId, response);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Error responding to friend request.");
    }
  };

  const filteredFriends = friends.filter((f) =>
    f.username.toLowerCase().includes(search.toLowerCase())
  );

  const onlineFriends = filteredFriends.filter((f) => f.online);

  const renderFriendList = (list: typeof friends) => (
    <ul className="space-y-3">
      {list.length > 0 ? (
        list.map((friend) => (
          <li
            key={friend.id}
            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Image
                src={
                  friend.photoURL ||
                  `/default-avatar.jpg`
                }
                alt={friend.username}
                width={40}
                height={40}
                className="rounded-full"
              />
              <div className="flex-col">
                <div className="font-bold">{friend.name}</div>
                <div className="font-medium text-sm">@{friend.username}</div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span
                className={`text-xs font-semibold flex items-center gap-1 ${
                  friend.online ? "text-green-500" : "text-gray-400"
                }`}
              >
                <CircleDot size={12} />
                {friend.online ? "Online" : "Offline"}
              </span>
              <button
                onClick={() => removeFriend(friend.id)}
                className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-100 rounded-full transition-colors"
                title="Remove Friend"
              >
                <X size={16} />
              </button>
            </div>
          </li>
        ))
      ) : (
        <p className="text-gray-500 text-center py-4">No friends to show.</p>
      )}
    </ul>
  );

  console.log(sentRequests)

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Friends</h1>

      {/* Tabs */}
      <div className="flex mb-6">

        {onlineFriends.length > 0 &&
          <button
            onClick={() => setTab("online")}
            className={`flex items-center gap-2 px-4 py-2 font-medium transition-colors ${
              tab === "online"
                ? "border-b-2 border-blue-500 text-blue-500"
                : "text-gray-500 hover:text-blue-500"
            }`}
          >
            Online
          </button>
        }

        {friends.length > 0 &&
          <button
            onClick={() => setTab("all")}
            className={`flex items-center gap-2 px-4 py-2 font-medium transition-colors ${
              tab === "all"
                ? "border-b-2 border-blue-500 text-blue-500"
                : "text-gray-500 hover:text-blue-500"
            }`}
          >
            All Friends
          </button> 
        }

        {(receivedRequests.length > 0 || sentRequests.length > 0) &&
          <button
            onClick={() => setTab("pending")}
            className={`flex items-center gap-2 px-4 py-2 font-medium transition-colors ${
              tab === "pending"
                ? "border-b-2 border-blue-500 text-blue-500"
                : "text-gray-500 hover:text-blue-500"
            }`}
          >
            Pending
            {receivedRequests.length > 0 && (
              <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {receivedRequests.length}
              </span>
            )}
          </button>
        }
        

        <button
          onClick={() => setTab("add")}
          className={`flex items-center gap-2 px-4 py-2 font-medium transition-colors ${
            tab === "add"
              ? "border-b-2 border-blue-500 text-blue-500"
              : "text-gray-500 hover:text-blue-500"
          }`}
        >
          Add Friend
        </button>

      </div>

      {/* Message/Error Display */}
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

      {/* Content */}
      <div className="bg-white  rounded-lg">
        {tab !== "add" && (
          <input
            type="text"
            placeholder="Search friends..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full mb-6 p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        )}

        {tab === "all" && renderFriendList(filteredFriends)}
        {tab === "online" && renderFriendList(onlineFriends)}

        {tab === "pending" && (
          <>
            <h2 className="text-lg font-semibold mb-3">Received Requests</h2>
            <ul className="space-y-3 mb-6">
              {receivedRequests.length > 0 ? (
                receivedRequests.map((req) => (
                  <li
                    key={req.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <Image
                        src={
                          req.photoURL ||
                          `/default-avatar.jpg`
                        }
                        alt={req.username}
                        width={40}
                        height={40}
                        className="rounded-full"
                      />
                      <div className="flex-col">
                        <div className="font-bold">{req.name}</div>
                        <div className="font-medium text-sm">@{req.username}</div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() =>
                          handleRequestResponse(req.id, "accepted")
                        }
                        className="p-2 text-gray-500 hover:text-green-500 hover:bg-green-100 rounded-full transition-colors"
                        title="Accept"
                      >
                        <Check size={16} />
                      </button>
                      <button
                        onClick={() =>
                          handleRequestResponse(req.id, "declined")
                        }
                        className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-100 rounded-full transition-colors"
                        title="Decline"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </li>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">
                  No pending requests.
                </p>
              )}
            </ul>

            <h2 className="text-lg font-semibold mb-3">Sent Requests</h2>
            <ul className="space-y-3">
              {sentRequests.map((req) => (
                <li
                  key={req.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <Image
                      src={
                        req.photoURL ||
                        `/default-avatar.jpg`
                      }
                      alt={req.username}
                      width={40}
                      height={40}
                      className="rounded-full"
                    />
                    <div className="flex-col">
                      <div className="font-bold">{req.name}</div>
                      <div className="font-medium text-sm">@{req.username}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => cancelFriendRequest(req.id)}
                    className="text-gray-400 text-sm hover:text-red-500"
                  >
                    Cancel
                  </button>
                </li>
              ))}
            </ul>
          </>
        )}

        {tab === "add" && (
          <form onSubmit={handleSendRequest} className="flex flex-col gap-4">
            <label htmlFor="add-friend-email" className="font-medium">
              Add Friend by Username
            </label>
            <input
              id="add-friend-email"
              type="text"
              placeholder="Enter username"
              value={addFriendUsername}
              onChange={(e) => setAddFriendUsername(e.target.value)}
              className="p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition self-start"
            >
              Send Friend Request
            </button>
          </form>
        )}
      </div>
    </div>
  );
}