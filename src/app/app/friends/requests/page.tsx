"use client";

import { useAuth } from "@/app/context/AuthContext";
import Header from "../_components/header";
import { useState } from "react";
import FriendCard from "@/components/FriendCard";

export default function Requests() {
  const {receivedRequests} = useAuth();

  return (
    <div className="p-4 w-[950px] mx-auto dark:bg-[#1a1a1e] mt-16">
      <Header />
      <div>
        <h2 className="text-lg font-semibold mb-3">Requests ({receivedRequests.length})</h2>
        <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {receivedRequests.length > 0 ? (
            receivedRequests.map((req) => (
              <FriendCard key={req.id} friend={req} friendRequest={true} myRequest={false} />
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