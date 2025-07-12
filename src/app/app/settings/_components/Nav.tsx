"use client";

import { Button } from "@/components/ui/button";
import { useRouter, usePathname } from "next/navigation";

export default function Nav() {
  const router = useRouter();
  const pathname = usePathname();
  const isActive = (path: string) => pathname === path;

  return (
    <div className="w-[200px]">
      <h1 className="text-2xl font-bold mb-4 text-black dark:text-white border-b-1 border-gray-200 pb-4">Settings</h1>
      <div className="flex flex-col gap-2 " >
        <Button variant="ghost" className={`w-full text-left items-start justify-start ${isActive("/app/settings/info") ? "bg-gray-100" : ""}`} onClick={() => router.push("/app/settings/info")}> My Profile </Button>
        <Button disabled={true} variant="ghost" className={`w-full text-left items-start justify-start ${isActive("/app/settings/security") ? "bg-gray-100" : ""}`} onClick={() => router.push("/app/settings/security")}> Security </Button>
        <Button disabled={true} variant="ghost" className={`w-full text-left items-start justify-start ${isActive("/app/settings/notifications") ? "bg-gray-100" : ""}`} onClick={() => router.push("/app/settings/notifications")}> Notifications </Button>
        <Button disabled={true} variant="ghost" className={`w-full text-left items-start justify-start ${isActive("/app/settings/payment-methods") ? "bg-gray-100" : ""}`} onClick={() => router.push("/app/settings/payment-methods")}> Payment Methods </Button>
      </div>
    </div>
  );
}