"use client";

import { useAuth } from "@/app/context/AuthContext";
import Header from "../_components/header";
import FriendCard from "@/components/FriendCard";
import { useState } from "react";
import Searchbar from "../_components/searchbar";

export default function Friends() {
  const {friends} = useAuth();

  const [search, setSearch] = useState("");

  const filteredFriends = friends.filter((f) =>
    f.username.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-4 w-[950px] mx-auto dark:bg-[#1a1a1e] mt-16">
      <Header />
      <Searchbar search={search} setSearch={setSearch} />
      <div>
          <h2 className="text-lg font-semibold mb-3">Friends ({filteredFriends.length})</h2>
          <ul className=" grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredFriends.length > 0 ? (
            filteredFriends.map((friend) => (
              <FriendCard key={friend.id} friend={friend} friendRequest={false} myRequest={false} />
            ))
            ) : (
              <p className="text-gray-500 py-4">No results found.</p>
            )}
          </ul>
        </div>
    </div>
  );
}