"use client";

import { useState } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { Button } from "@/components/ui/button";
import FriendCard from "@/components/FriendCard";

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
  } = useAuth();

  const [tab, setTab] = useState<"all" | "requests" | "add">("add");
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
    } catch (err: unknown) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Error sending friend request.");
    }
  };

  const handleRequestResponse = async (
    requestId: string,
    response: "accepted" | "declined"
  ) => {
    try {
      await respondToFriendRequest(requestId, response);
    } catch (err: unknown) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Error responding to friend request.");
    }
  };

  const filteredFriends = friends.filter((f) =>
    f.username.toLowerCase().includes(search.toLowerCase())

  );

  const filteredReceivedRequests = receivedRequests.filter((f) =>
    f.username.toLowerCase().includes(search.toLowerCase())
  );

  // const onlineFriends = filteredFriends.filter((f) => f.online);

  const renderFriendList = (list: typeof friends) => (
    <>
     <h2 className="text-lg font-semibold mb-3">Friends ({list.length})</h2>
     <ul className=" grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {list.length > 0 ? (
        list.map((friend) => (
          <FriendCard key={friend.id} friend={friend} friendRequest={false} myRequest={false} />
        ))
        ) : (
          <p className="text-gray-500 py-4">No results found.</p>
        )}
      </ul>
    </>
  );

  console.log(sentRequests)

  return (
    <div className="p-4 w-[950px] mx-auto dark:bg-[#1a1a1e]">
      <h1 className="text-3xl font-bold mb-6 text-black dark:text-white">My Friends</h1>

      {/* Tabs */}
      <div className="flex mb-6">
{/* 
        {onlineFriends.length >= 0 &&
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
        } */}

        {friends.length >= 0 &&
          <button
            onClick={() => setTab("all")}
            className={`flex items-center gap-2 px-4 py-2 font-medium transition-colors ${
              tab === "all"
                ? "border-b-2 border-blue-500 text-blue-500"
                : "text-gray-500 hover:text-blue-500"
            }`}
          >
            Friends
          </button> 
        }

        {(receivedRequests.length >= 0 || sentRequests.length >= 0) &&
          <button
            onClick={() => setTab("requests")}
            className={`flex items-center gap-2 px-4 py-2 font-medium transition-colors ${
              tab === "requests"
                ? "border-b-2 border-blue-500 text-blue-500"
                : "text-gray-500 hover:text-blue-500"
            }`}
          >
            Requests
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
      <div className="bg-white  rounded-lg dark:bg-transparent">
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
        {/* {tab === "online" && renderFriendList(onlineFriends)} */}

        {tab === "requests" && (
          <>
            <h2 className="text-lg font-semibold mb-3">Requests ({filteredReceivedRequests.length})</h2>
            <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {filteredReceivedRequests.length > 0 ? (
                filteredReceivedRequests.map((req) => (
                  <FriendCard key={req.id} friend={req} friendRequest={true} myRequest={false} />
                ))
              ) : (
                <p className="text-gray-500  py-4">
                  No results found.
                </p>
              )}
            </ul>

            
          </>
        )}

        {tab === "add" && (
          <>
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
          </>
        )}
      </div>
    </div>
  );
}