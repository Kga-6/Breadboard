"use client";

import Link from "next/link";
import { useAuth } from "@/app/context/AuthContext";

export default function ProfileMenu() {
  const { userData, logout } = useAuth();

  return (
    <div className="absolute bottom-20 left-4 bg-white rounded-lg shadow-lg w-fit p-2 z-50 border">
      <div className="px-3 py-2 text-xs text-gray-800 border-b">{userData?.email}</div>
      <Link
        href="/app/settings"
        className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
      >
        Settings
      </Link>
      <button
        className="block w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
        onClick={() => alert("Toggle theme logic here")}
      >
        Theme
      </button>
      <button
        onClick={logout}
        className="block w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-100 rounded-md"
      >
        Logout
      </button>
    </div>
  );
}
