"use client"

import { useAuth } from "@/app/context/AuthContext";
import { useState } from "react";

type Friend = {
  id: string;
  name: string;
  username: string;
  online: boolean;
  photoURL: string | null;
};

type FriendRequest = {
  id: string;
  name: string;
  username: string;
  from: string;
  photoURL: string | null;
};

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { EllipsisVerticalIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function FriendCard( { friend, friendRequest, myRequest }: { friend: Friend | FriendRequest, friendRequest: boolean, myRequest: boolean }) {

  const {
    friends,
    sentRequests,
    receivedRequests,
    sendFriendRequest,
    respondToFriendRequest,
    cancelFriendRequest,
    removeFriend,
  } = useAuth();

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

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

  return (
    <li key={friend.id} className="bg-gray-50 dark:bg-gray-800 p-4">
      <div className="flex items-start justify-between w-full mb-4">
        <div className="flex gap-3 justify-start items-start w-full overflow-hidden">
          <Avatar className="h-18 w-18 ">
            <AvatarImage className="object-cover" src={friend.photoURL || "/default-avatar.jpg"} />
            <AvatarFallback>{friend.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col w-full h-full overflow-hidden whitespace-nowrap mr-2">
            <h2 className="text-sm font-bold text-ellipsis overflow-hidden whitespace-nowrap">{friend.name}</h2>
            <p className="text-sm text-gray-500 text-ellipsis overflow-hidden whitespace-nowrap">@{friend.username}</p>
          </div>
        </div>
        {!friendRequest && !myRequest && (
          <div className="flex gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger>
                <EllipsisVerticalIcon className="w-4 h-4 text-gray-500" />
              </DropdownMenuTrigger>
              <DropdownMenuContent>
              <DropdownMenuItem onClick={() => navigator.clipboard.writeText(friend.id)}>
                  Copy ID
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => removeFriend(friend.id)}>
                  Remove Friend
                </DropdownMenuItem>
                <DropdownMenuItem variant="destructive">
                  Block
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>
      {!friendRequest && !myRequest && (
        <div className="flex items-center gap-2">
          <Button variant="outline" className="w-full">
            Chat
          </Button>
        </div>
      )}
      {friendRequest && (
        <div className="flex flex-row gap-2 w-full">
          <Button variant="outline" className="flex-1" onClick={() => handleRequestResponse(friend.id, "accepted")}>
            Accept
          </Button>
          <Button variant="destructive" className="flex-1" onClick={() => handleRequestResponse(friend.id, "declined")}>
            Decline
          </Button>
        </div>
      )}
      {myRequest && (
        <div className="flex flex-row gap-2 w-full">
          <Button variant="outline" className="flex-1" onClick={() => cancelFriendRequest(friend.id)}>
            Cancel
          </Button>
        </div>
      )}
    </li>
  )
}