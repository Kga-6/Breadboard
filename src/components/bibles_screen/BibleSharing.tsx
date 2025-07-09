import { formatChapterHTML } from '@/utils/formater';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

import { RoomProvider, useOthers, useSelf } from "@liveblocks/react";
import { useRouter } from "next/router";

import { UserType } from "@/data/types";

interface ChapterRef {
  id: string;
  bookId: string;
  reference: string;
}

interface Chapter {
  id: string;
  bibleId: string;
  bookId: string;
  reference: string;
  content: string;
  verseCount: number;
  previous?: ChapterRef;
  next?: ChapterRef;
  copyright?: string;
}

export const BibleSharing = ({chapterData, userData}: {chapterData: Chapter, userData: UserType}) => {

  const users = useOthers();
  const currentUser = useSelf();
  const hasMoreUsers = users.length > 3;

  console.log(users,currentUser,hasMoreUsers)


  return (
    <div className="p-4 max-w-2xl mx-auto">

      <main className="fixed right-0 bottom-4 mr-4 select-none place-content-center place-items-center">
        <div className="flex pl-3">

          <div className="*:data-[slot=avatar]:ring-background flex -space-x-2 *:data-[slot=avatar]:ring-2 *:data-[slot=avatar]:grayscale">
            {users.slice(0, 3).map(({ connectionId, info }) => {
              return (
                <Tooltip key={connectionId}>
                  <TooltipTrigger asChild>
                    <Avatar className="w-10 h-10">  
                      <AvatarImage src={info.avatar} className="object-cover" />
                      <AvatarFallback>CN</AvatarFallback>
                    </Avatar>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{info.name}</p>
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </div>

          {hasMoreUsers && <div className="w-10 h-10 bg-gray-200 rounded-full justify-center items-center flex">+{users.length - 3}</div>}

          {currentUser && (
            <div className="relative ml-4 first:ml-0">
              <Tooltip>
               <TooltipTrigger asChild>
                <Avatar className="w-10 h-10">
                  <AvatarImage  src={currentUser.info.avatar} className="object-cover" />
                  <AvatarFallback>CN</AvatarFallback>
                </Avatar>
              </TooltipTrigger>
               <TooltipContent>
                  <p>{currentUser.info.name}</p>
                </TooltipContent>
              </Tooltip>
            </div>
          )}
        </div>
      </main>

      <div className="p-4 max-w-2xl mx-auto">
        {chapterData && (
          <div className="prose w-[400px] mb-30 mt-8">
            <h2 className="text-xl font-semibold text-center mb-4">{chapterData.reference}</h2>
            <div dangerouslySetInnerHTML={{ __html: formatChapterHTML(chapterData, userData) }} />
            <div className="mt-4 text-gray-300 text-[12px]">{chapterData?.copyright}</div>
          </div>
        )}
      </div>
    </div>
  )
}