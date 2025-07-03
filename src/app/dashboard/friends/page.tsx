'use client';

import { useState } from 'react';

type Friend = {
  id: string;
  username: string;
  online: boolean;
};

type FriendRequest = {
  id: string;
  username: string;
};

export default function Friends() {
  const [tab, setTab] = useState<'all' | 'pending' | 'online' | 'add'>('all');
  const [search, setSearch] = useState('');

  // Fake data
  const allFriends: Friend[] = [
    { id: '1', username: 'john_doe', online: true },
    { id: '2', username: 'jane_smith', online: false },
    { id: '3', username: 'mark123', online: true },
  ];

  const sentRequests: FriendRequest[] = [
    { id: '4', username: 'alice_pending' },
  ];

  const receivedRequests: FriendRequest[] = [
    { id: '5', username: 'bob_sent_you' },
  ];

  const filteredFriends = allFriends.filter((f) =>
    f.username.toLowerCase().includes(search.toLowerCase())
  );

  const onlineFriends = filteredFriends.filter((f) => f.online);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Friends</h1>

      {/* Tabs */}
      <div className="flex gap-3 mb-4">
        <button
          onClick={() => setTab('online')}
          className={`px-4 py-2 rounded-lg ${
            tab === 'online'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200 text-gray-800'
          }`}
        >
          Online
        </button>
        <button
          onClick={() => setTab('all')}
          className={`px-4 py-2 rounded-lg ${
            tab === 'all'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200 text-gray-800'
          }`}
        >
          All
        </button>
        <button
          onClick={() => setTab('pending')}
          className={`px-4 py-2 rounded-lg ${
            tab === 'pending'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200 text-gray-800'
          }`}
        >
          Pending
        </button>
        <button
          onClick={() => setTab('add')}
          className={`px-4 py-2 rounded-lg ${
            tab === 'add'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200 text-gray-800'
          }`}
        >
          Add Friend
        </button>
      </div>

      {/* Content */}
      <div className="bg-white rounded-lg">
        {/* Search bar */}
        {tab !== 'add' && (
          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full mb-4 p-2 border rounded"
          />
        )}

        {/* All Friends */}
        {tab === 'all' && (
          <ul className="space-y-2">
            {filteredFriends.map((friend) => (
              <li key={friend.id} className="flex justify-between">
                <span>{friend.username}</span>
                <span
                  className={`text-sm ${
                    friend.online ? 'text-green-500' : 'text-gray-400'
                  }`}
                >
                  {friend.online ? 'Online' : 'Offline'}
                </span>
              </li>
            ))}
          </ul>
        )}

        {/* Online Friends */}
        {tab === 'online' && (
          <ul className="space-y-2">
            {onlineFriends.map((friend) => (
              <li key={friend.id} className="flex justify-between">
                <span>{friend.username}</span>
                <span className="text-green-500 text-sm">Online</span>
              </li>
            ))}
            {onlineFriends.length === 0 && (
              <p className="text-gray-500">No friends online.</p>
            )}
          </ul>
        )}

        {/* Pending Requests */}
        {tab === 'pending' && (
          <>
            <h2 className="text-lg font-semibold mb-2">Sent Requests</h2>
            <ul className="space-y-2 mb-4">
              {sentRequests.map((req) => (
                <li key={req.id} className="flex justify-between">
                  <span>{req.username}</span>
                  <button className="text-red-500 text-sm hover:underline">
                    Cancel
                  </button>
                </li>
              ))}
            </ul>

            <h2 className="text-lg font-semibold mb-2">Received Requests</h2>
            <ul className="space-y-2">
              {receivedRequests.map((req) => (
                <li key={req.id} className="flex justify-between">
                  <span>{req.username}</span>
                  <div className="space-x-2">
                    <button className="text-green-500 text-sm hover:underline">
                      Accept
                    </button>
                    <button className="text-red-500 text-sm hover:underline">
                      Decline
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}

        {/* Add Friend */}
        {tab === 'add' && (
          <form className="flex flex-col gap-4">
            <input
              type="text"
              placeholder="Enter username"
              className="p-2 border rounded"
            />
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
            >
              Send Friend Request
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
