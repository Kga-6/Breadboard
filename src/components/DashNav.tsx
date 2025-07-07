"use client";

import { useAuth } from "@/app/context/AuthContext";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { useState } from "react";
import ProfileMenu from "@/components/ProfileMenu";

import Image from "next/image";

export default function DashNav() {

  const { currentUser, userData } = useAuth();
  const pathname = usePathname();

  const [showProfileMenu, setShowProfileMenu] = useState(false)

  const links = [
    { href: "/app/home", label: "Home" },
    { href: `/app/bible/${currentUser?.uid}`, label: "Bible", base: "/app/bible" },
    { href: "/app/friends", label: "Friends" },
    //{ href: "/app/chat", label: "Chat" },
    { href: "/app/jam", label: "Jam" },
    //{ href: "/app/calendar", label: "Calendar" },
    //{ href: "/app/admin", label: "Admin" },
  ];

  const handleProfileMenu = () => {
    setShowProfileMenu(!showProfileMenu)
  }

  return (
    <nav className="h-full w-full bg-white border-r shadow-sm p-4 flex flex-col gap-4 justify-between">
      
      <div className="bg-white flex flex-col gap-4">
        <Link href="/" className="text-2xl font-bold">Breadboard</Link>
        {links.map(({ href, label, base }) => {
          const isActive = base
            ? pathname.startsWith(base)
            : pathname === href;

          return (
            <Link
              key={href}
              href={href}
              className={clsx(
                "font-medium px-3 py-2 rounded-md transition-colors",
                isActive
                  ? "bg-[#ebebeb] text-black font-semibold"
                  : "text-gray-700 hover:bg-gray-100"
              )}
            >
              {label}
            </Link>
          );
        })}
      </div>

      {userData && 

        <button onClick={handleProfileMenu} className={`flex items-center p-2 rounded-lg cursor-pointer ${showProfileMenu ? "bg-[#ebebeb]":"bg-white"}`}>
          <Image
            src={userData?.profilePictureUrl || "/default-avatar.jpg"}
            alt={userData?.uid || "User profile"}
            className="w-[28px] h-[28px] rounded-full"
            width={28}
            height={28}
          />
          <span className="w-full text-left ml-2">{userData?.username}</span>
        </button>

      }

      {showProfileMenu && userData && <ProfileMenu />}
    </nav>
  );
}
