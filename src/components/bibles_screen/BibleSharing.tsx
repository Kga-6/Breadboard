import { formatChapterHTML } from '@/utils/formater';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useState, useMemo } from "react";
import Cursor from "@/components/Cursor";
import { useAuth } from "@/app/context/AuthContext";
import VerseSelectionDrawer from "@/components/VerseSelectionDrawer";

import {  useOthers, useSelf, useMyPresence } from "@liveblocks/react";

import { UserTypes, ChapterTypes, FriendTypes } from "@/types";

const COLORS = [
  "#E57373",
  "#9575CD",
  "#4FC3F7",
  "#81C784",
  "#FFF176",
  "#FF8A65",
  "#F06292",
  "#7986CB",
];

export const BibleSharing = ({
  chapterData,
  userData,
  bibleLocalName,
  bookLocalName,
  friends,
}: {
  chapterData: ChapterTypes, 
  userData: UserTypes,
  bibleLocalName: string,
  bookLocalName: string,
  friends: FriendTypes[]
}) => {

  const { updateBiblePersonalization } = useAuth();
  const [selectedVerses, setSelectedVerses] = useState<number[]>([]);

  
  const [{ cursor }, updateMyPresence] = useMyPresence();
  const others = useOthers();
  const currentUser = useSelf();
  const hasMoreUsers = others.length > 3;

  console.log(others,currentUser,hasMoreUsers)

  // VerseSelected Funcs
  const handleVerseClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    const verseEl = target.closest<HTMLElement>("[data-verse]");

    if (verseEl) {
      const verseIdStr = verseEl.dataset.verse!.split(":")[3];
      const verseId = parseInt(verseIdStr);

      setSelectedVerses((prevSelected) => {
        const newSelected = prevSelected.includes(verseId)
          ? prevSelected.filter((v) => v !== verseId)
          : [...prevSelected, verseId];

        return newSelected;
      });
      console.log(selectedVerses)
    }
  };

  const handleHighlight = async (color: string) => {
    if (selectedVerses.length === 0) return;

    const { bibleId, bookId, id: chapterId } = chapterData;
    const newPersonalization = JSON.parse(JSON.stringify(userData.biblePersonalization || {}));

    selectedVerses.forEach((verseId) => {
      if (!newPersonalization[bibleId]) newPersonalization[bibleId] = {};
      if (!newPersonalization[bibleId][bookId]) newPersonalization[bibleId][bookId] = {};
      if (!newPersonalization[bibleId][bookId][chapterId]) newPersonalization[bibleId][bookId][chapterId] = {};
      newPersonalization[bibleId][bookId][chapterId][verseId] = color;
    });

    await updateBiblePersonalization(newPersonalization);
    //setSelectedVerses([]);
  };

  const handleRemoveHighlight = async () => {
    if (selectedVerses.length === 0) return;

    const { bibleId, bookId, id: chapterId } = chapterData;
    const newPersonalization = JSON.parse(JSON.stringify(userData.biblePersonalization || {}));

    selectedVerses.forEach((verseId) => {
      if (newPersonalization[bibleId]?.[bookId]?.[chapterId]?.[verseId]) {
        delete newPersonalization[bibleId][bookId][chapterId][verseId];
      }
    });

    await updateBiblePersonalization(newPersonalization);
    setSelectedVerses([]);
  };

  const handleCopy = () => {
    // use BIBLE API || /v1/bibles/{bibleId}/verses/{verseId}
    console.log("Verse copied")
    setSelectedVerses([]);
  };

  const isAnyVerseHighlighted = useMemo(() => {
    const { bibleId, bookId, id: chapterId } = chapterData;
    return selectedVerses.some(
      (verseId) => userData.biblePersonalization?.[bibleId]?.[bookId]?.[chapterId]?.[verseId]
    );
  }, [selectedVerses, userData.biblePersonalization, chapterData]);

  const chapterHTML = useMemo(() => {
      return formatChapterHTML(chapterData, userData, selectedVerses);
    }, [chapterData, userData, selectedVerses]);

  const formattedVerseReference = useMemo(() => {
    if (selectedVerses.length === 0) return "";

    const { bookId, id: chapterId, bibleId } = chapterData;
    const chapterNumber = chapterId.split(".")[1];
    const sortedVerses = [...selectedVerses].sort((a, b) => a - b);

    const parts: string[] = [];
    let i = 0;
    while (i < sortedVerses.length) {
      let start = sortedVerses[i];
      let end = start;
      while (i + 1 < sortedVerses.length && sortedVerses[i + 1] === end + 1) {
        end = sortedVerses[i + 1];
        i++;
      }
      if (start === end) {
        parts.push(start.toString());
      } else {
        parts.push(`${start}-${end}`);
      }
      i++;
    }

    return `${bookLocalName} ${chapterNumber}:${parts.join(",")} ${bibleLocalName}`;
  }, [selectedVerses, chapterData, bookLocalName, bibleLocalName]);

  return (
    <main 
      className="p-4 px-[64px] max-w-2xl mx-auto relative overflow-hidden"
      onClick={handleVerseClick}
      onPointerMove={(event) => {
        // Get the bounding rectangle of the target element (the <main> element)
        const rect = event.currentTarget.getBoundingClientRect();
        
        // Update the cursor position relative to the element
        updateMyPresence({
          chapterId: chapterData.id,
          cursor: {
            x: Math.round(event.clientX - rect.left) - 15,
            y: Math.round(event.clientY - rect.top),
          },
        });
      }}
      onPointerLeave={() =>
        // When the pointer goes out, set cursor to null
        updateMyPresence({
          chapterId: "",
          cursor: undefined,
        })
      }
    >
      {/* Cursors */}
      {others.map(({ connectionId, presence }) => {
        if (presence.cursor === undefined || presence.chapterId !== chapterData.id) {
          return null;
        }

        return (
          <Cursor
            key={`cursor-${connectionId}`}
            color={COLORS[connectionId % COLORS.length]}
            x={presence.cursor.x}
            y={presence.cursor.y}
          />
        );
      })}

      {/* Users */}
      <div className="fixed right-0 bottom-4 mr-4 select-none place-content-center place-items-center ">
        <div className="flex pl-3">

          <div className="*:data-[slot=avatar]:ring-background flex -space-x-2 *:data-[slot=avatar]:ring-2 *:data-[slot=avatar]:grayscale">
            {others.slice(0, 3).map(({ connectionId, info }) => {
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

          {hasMoreUsers && <div className="w-10 h-10 bg-gray-200 rounded-full justify-center items-center flex">+{others.length - 3}</div>}

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
      </div>

      {/* Chapter */}
      <div className="max-w-2xl mx-auto">
        {chapterData && (
          <div className="prose w-[400px] mb-30 mt-8">
            <h2 className="text-xl font-semibold text-center mb-4">{chapterData.reference}</h2>
            <div dangerouslySetInnerHTML={{ __html: chapterHTML }} />
            <div className="mt-4 text-gray-300 text-[12px]">{chapterData?.copyright}</div>
          </div>
        )}

      {/* Verse Selection Drawer */}
      {selectedVerses.length > 0 && (
        <VerseSelectionDrawer 
          isHighlighted={isAnyVerseHighlighted}
          onHighlight={handleHighlight}
          onRemoveHighlight={handleRemoveHighlight}
          formattedReference={formattedVerseReference}
          onCopy={handleCopy}
          friends={friends}
          onClose={() => {
            setSelectedVerses([]);
          }}
        />
      )}
      </div>

      
    </main>
  )
}