import { CircleX, Highlighter, Copy, X, Share, Bot } from "lucide-react";
import { Button } from "./ui/button"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { FriendTypes } from "@/types";

interface VerseSelectionMenuProps {
  isHighlighted: boolean;
  onHighlight: (color: string) => void;
  onRemoveHighlight: () => void;
  onCopy: () => void;
  onClose: () => void;
  formattedReference: string;
  friends: FriendTypes[];
}

export default function VerseSelectionDrawer({
  isHighlighted,
  onHighlight,
  onRemoveHighlight,
  onCopy,
  onClose,
  formattedReference,
  friends,
}: VerseSelectionMenuProps) {
  return(

    <div className="fixed flex-col bottom-0 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 bg-white p-8 rounded-t-lg shadow-2xl w-[450px]">
      <header className="flex w-full justify-between">
        <div>
          <h1 className="text-xs font-bold text-gray-500 mb-1">Currently Selected:</h1>
          <p className="text-md text-black font-medium whitespace-nowrap overflow-hidden text-ellipsis w-[200px] ">{formattedReference}</p>
        </div>
        <Button className=" w-10 h-10 rounded-full" onClick={onClose} variant="outline"><X className="w-[24px] h-[24px] " /></Button>
      </header>
      <div className="flex flex-col w-full">
        <div className="flex flex-row justify-between items-center py-4 border-b">
          <div className="flex flex-row gap-2 items-center">
            <Highlighter className="w-6 h-6" />
            <p className="text-md font-medium">Highlight</p>
          </div>
          <div className="flex flex-row gap-2">
            {isHighlighted && (
              <Button onClick={onRemoveHighlight} variant="outline" className="bg-gray-200 w-10 h-10 rounded-full"><CircleX className="w-[15px] h-[15px] " /></Button>
            )}
            <button onClick={() => onHighlight("bg-red-200")} className="bg-red-200 w-10 h-10 rounded-full hover:default:"/>
            <button onClick={() => onHighlight("bg-green-200")} className="bg-green-200 w-10 h-10 rounded-full"/>
            <button onClick={() => onHighlight("bg-blue-200")} className="bg-blue-200 w-10 h-10 rounded-full"/>
          </div>
        </div>
        <div className="flex flex-row justify-between items-center py-4 border-b">
          <button onClick={onCopy} className="flex flex-row gap-2 items-center  w-full">
            <Bot className="w-6 h-6" />
            <p className="text-md font-medium">Ask AI</p>
          </button>
        </div>
        <div className="flex flex-row justify-between items-center py-4 border-b">
          <button onClick={onCopy} className="flex flex-row gap-2 items-center  w-full">
            <Copy className="w-6 h-6" />
            <p className="text-md font-medium">Copy</p>
          </button>
        </div>
        <div className="flex flex-row justify-between items-center py-4">
          <button  className="flex flex-row gap-2 items-center  w-full">
            <Share className="w-6 h-6" />
            <p className="text-md font-medium">Share</p>
          </button>
          <div className="flex flex-row gap-2">

            {friends.slice(0, 3).map((friend) => (
              <Tooltip key={friend.id}>
                <TooltipTrigger asChild>
                  <Avatar className="w-10 h-10 border-1 shadow-md">
                    <AvatarImage  src={friend.photoURL || "/default-avatar.jpg"} className="object-cover" />
                    <AvatarFallback>CN</AvatarFallback>
                  </Avatar>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{friend.name}</p>
                </TooltipContent>
             </Tooltip>
            ))}
          </div>
        </div>
      </div>
    </div>

  )
}