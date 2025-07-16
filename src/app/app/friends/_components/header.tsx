import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Header() {

  const pathname = usePathname();

  const isActive = (url: string) => pathname === url;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 text-black dark:text-white">My Friends</h1>
      <div className="flex mb-6">

        <Link
          href="/app/friends/friends"
          className={`flex-1 text-center text-md h-[44px] rounded-none items-center gap-2 px-4 py-2 font-medium transition-colors hover:border-b-2 hover:border-b-gray-300 ${isActive("/app/friends/friends") && "border-b-2 border-b-black"}`}
        >
          Friends
        </Link> 

        <Link
          href="/app/friends/requests"
          className={`flex-1 text-center text-md h-[44px] rounded-none items-center gap-2 px-4 py-2 font-medium transition-colors hover:border-b-2 hover:border-b-gray-300 ${isActive("/app/friends/requests") && "border-b-2 border-b-black"}`}
        >
          Requests
        </Link>
        

        <Link
          href="/app/friends/add"
          className={`flex-1 text-center text-md h-[44px] rounded-none items-center gap-2 px-4 py-2 font-medium transition-colors hover:border-b-2 hover:border-b-gray-300 ${isActive("/app/friends/add") && "border-b-2 border-b-black"}`}
        >
          Add Friend
        </Link>

      </div>
    </div>
  );
}