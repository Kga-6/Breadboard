"use client"

import { useAuth } from "@/app/context/AuthContext";
import { useState } from 'react';

import { useRouter } from 'next/navigation';
import { BibleRoom } from '@/components/BibleRoom';
import { BibleInviteModal } from '@/components/BibleInviteModal';
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { BibleSharing } from "@/components/bibles_screen/BibleSharing";
import BibleSolo from "@/components/bibles_screen/BibleSolo";
import { BibleTypes, BookTypes, ChapterTypes, ChapterRefTypes } from "@/types";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ChevronLeftIcon, ChevronRightIcon,LogOutIcon, UserRoundPlusIcon, SettingsIcon, BotIcon, Volume2 } from "lucide-react";

export default function BibleView({
  uid,
  initialBibles,
  initialBooks,
  initialChapters,
  initialChapter,
  initialBibleId,
  initialBookId,
  initialChapterId
}: {
  uid: string;
  initialBibles: BibleTypes[];
  initialBooks: BookTypes[];
  initialChapters: ChapterRefTypes[];
  initialChapter: ChapterTypes;
  initialBibleId: string;
  initialBookId: string;
  initialChapterId: string;
}) {
  const router = useRouter();

  const {userData, setBibleRoomSharing, friends} = useAuth();
  const [isInviteModalOpen, setInviteModalOpen] = useState(false);
  const { isMobile } = useSidebar()

  const [language, setLanguage] = useState<string>("eng");

  const [bibleLocalName, setBibleLocalName] = useState<string>(initialBibles.find(b => b.id === initialBibleId)?.abbreviationLocal || "");
  const [bookLocalName, setBookLocalName] = useState<string>(initialBooks.find(b => b.id === initialBookId)?.name || "");

  console.log(bibleLocalName, bookLocalName)

  const handleToggleSharing = async (value:boolean) => {
    try {
      await setBibleRoomSharing(value);
    } catch (error) {
      console.error("Failed to update sharing status:", error);
    }
  };

  const handleSelectionChange = (type: 'bibleId' | 'bookId' | 'chapterId', value: string) => {
    const params = new URLSearchParams({
      bibleId: initialBibleId,
      bookId: initialBookId,
      chapterId: initialChapterId,
    });
    params.set(type, value);

    // If we change the bible, we should reset the book and chapter to avoid mismatches.
    // This is a more robust approach but is omitted here for simplicity.

    router.push(`/app/bible/session/${uid}?${params.toString()}`);
  };

  const goToChapter = (chapter: ChapterRefTypes | undefined) => {
  if (!chapter?.id) return;
  // This also just becomes a navigation event
  router.push(`/app/bible/session/${uid}?bibleId=${initialBibleId}&bookId=${chapter.bookId}&chapterId=${chapter.id}`);
};

  return (
    <>
      {/* Conditionally render the modal */}
      <BibleInviteModal 
        isOpen={isInviteModalOpen} 
        onClose={() => setInviteModalOpen(false)} 
      />

      <header className="flex h-[74px] shrink-0 items-center sticky top-0 bg-white dark:bg-gray-500 z-10  transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
        {isMobile && (
          <div className="flex items-center gap-2 px-4">
            {isMobile && (
              <SidebarTrigger className="-ml-1" hamburgerIcon={isMobile} />
            )}
          </div>
        )}
        

        <div className="flex items-center gap-2 px-4 w-full justify-start">
          {/* Selects now use the new handler and render directly from props */}
          {/* <Select onValueChange={(value) => handleSelectionChange('bibleId', value)} defaultValue={initialBibleId}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Version" />
            </SelectTrigger>
            <SelectContent>
              {initialBibles.filter(b => b.language.id === language).map((bible) => (
                <SelectItem key={bible.id} value={bible.id}>{bible.nameLocal}</SelectItem>
              ))}
            </SelectContent>
          </Select> */}

          <Select onValueChange={(value) => handleSelectionChange('bookId', value)} defaultValue={initialBookId}>
            <SelectTrigger>
              <SelectValue placeholder="Book" />
            </SelectTrigger>
            <SelectContent className="max-h-[400px] overflow-y-auto">
              {initialBooks.map((book) => (
                <SelectItem key={book.id} value={book.id}>{book.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {initialChapters.length > 0 && (
            <Select onValueChange={(value) => handleSelectionChange('chapterId', value)} defaultValue={initialChapterId}>
              <SelectTrigger>
                <SelectValue placeholder="Chapter" />
              </SelectTrigger>
              <SelectContent className="max-h-[400px] overflow-y-auto">
                {initialChapters.map((chapter) => (
                  <SelectItem key={chapter.id} value={chapter.id}>{chapter.number}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>


        {userData && userData.uid == uid && (
          <div className="flex items-center ">
            <div className="mr-2">
              <Button className="rounded-full h-10 w-10" variant="outline" onClick={() => setInviteModalOpen(true)}><UserRoundPlusIcon className="w-4 h-4" /></Button>
            </div>
            <div className="mr-2">
              <Button className="rounded-full h-10 w-10" variant="outline" onClick={() => console.log("Settings")}><SettingsIcon className="w-4 h-4" /></Button>
            </div>

          </div>
        )}
        <div className="mr-2">
            <Button className="rounded-full h-10 w-10" variant="outline" onClick={() => console.log("AI Chat")}><BotIcon className="w-4 h-4" /></Button>
        </div>
        <div className="mr-2">
            <Button className="rounded-full h-10 w-10" variant="outline" onClick={() => console.log("AI Chat")}><Volume2 className="w-4 h-4" /></Button>
        </div>
        {userData && userData.uid == uid && userData.bibleRoom.sharing && (
          <div className="mr-2">
            <Button variant="destructive" onClick={() => {
              handleToggleSharing(false);
            }}>End Session</Button>
          </div>
        )}
        {userData && userData.uid != uid && (
          <div className="mr-2">
            <Button variant="destructive" onClick={() => {
              router.push(`/app/bible/session/${userData.uid}`);
            }}><LogOutIcon className="w-4 h-4" /></Button>
          </div>
        )}
      </header>


      <div className="flex flex-row items-center justify-center">


        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-4 bg-white p-2 rounded-full shadow-md">
          <button
            className=" bg-white/70 p-2 rounded-full hover:bg-gray-200 disabled:opacity-20"
            disabled={!initialChapter || !initialChapter.previous}
            onClick={() => goToChapter(initialChapter?.previous)}
          >
            <ChevronLeftIcon className="w-8 h-8" />
          </button>

          {/* <span className="text-sm text-gray-500">{initialChapter?.number}</span> */}

          <button
            className=" bg-white/70  p-2 rounded-full hover:bg-gray-200 disabled:opacity-20"
            disabled={!initialChapter || !initialChapter.next}
            onClick={() => goToChapter(initialChapter?.next)}
          >
            <ChevronRightIcon className="w-8 h-8" />
          </button>
        </div>
          
        {/* userData.bibleRoom.invited.length > 0 */}
        <main className="h-full overflow-y-auto px-16">
          {initialChapter && userData ? (
             (userData.bibleRoom.sharing && userData.uid === uid) || (userData && uid !== userData.uid) ? (
              <BibleRoom roomId={uid}>
                <BibleSharing chapterData={initialChapter} userData={userData} bibleLocalName={bibleLocalName} bookLocalName={bookLocalName} friends={friends}/>
              </BibleRoom>
            ) : (
              <BibleSolo chapterData={initialChapter} userData={userData} friends={friends} bibleLocalName={bibleLocalName} bookLocalName={bookLocalName}/>
            )
          ) : (
            <div>Loading chapter...</div> // Or some other placeholder
          )}
        </main>
      </div>
    </>
  );
}
