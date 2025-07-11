"use client"

import { useAuth } from "@/app/context/AuthContext";
import { useEffect, useState } from 'react';

import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { formatChapterHTML } from '@/utils/formater';
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
import { ChevronLeftIcon, ChevronRightIcon,LogOutIcon, UserRoundPlusIcon, SettingsIcon, BotIcon } from "lucide-react";

const allowed_bibles_string = "de4e12af7f28f599-02"//,06125adad2d5898a-01,9879dbb7cfe39e4d-01";

export default function Bible() {
  const router = useRouter();
  const params = useParams();
  const {userData, setBibleRoomSharing, friends} = useAuth();
  const searchParams = useSearchParams();
  const [isInviteModalOpen, setInviteModalOpen] = useState(false);
  const { isMobile } = useSidebar()

  const [language, setLanguage] = useState<string>("eng");
  const [bibleId, setBibleId] = useState<string>(searchParams.get('bibleId') || "de4e12af7f28f599-02");
  const [bibles, setBibles] = useState<BibleTypes[]>([]);
  const [bookId, setBookId] = useState<string>(searchParams.get('bookId') || "GEN");
  const [books, setBooks] = useState<BookTypes[]>([]);
  const [chapterId, setChapterId] = useState<string>(searchParams.get('chapterId') || "GEN.1");
  const [chapters, setChapters] = useState<ChapterRefTypes[]>([]);
  const [chapter, setChapter] = useState<ChapterTypes | null>(null);

  const [bibleLocalName, setBibleLocalName] = useState<string>("");
  const [bookLocalName, setBookLocalName] = useState<string>("");

  const uid = params.uid as string;

  const handleToggleSharing = async (value:boolean) => {
    try {
      await setBibleRoomSharing(value);
    } catch (error) {
      console.error("Failed to update sharing status:", error);
      // Optionally show an error message to the user
    }
  };

  useEffect(() => {
    const getBibles = async () => {
      const res = await fetch(`/api/scripture/bibles?ids=${allowed_bibles_string}`);
      const data = await res.json();
      setBibles(data?.data || []);
      setBibleLocalName(data?.data[0].abbreviationLocal);
      console.log(data?.data[0].abbreviationLocal);
    };

    getBibles();
  }, []);

  useEffect(() => {
    if (!bibleId) return;
    const getBooks = async () => {
      const res = await fetch(`/api/scripture/bibles/${bibleId}/books`);
      const data = await res.json();
      setBooks(data?.data || []);
      setBookLocalName(data?.data[0].name);
      console.log(data?.data[0].name);
    };

    getBooks();
  }, [bibleId, bookId]);

  useEffect(() => {
    if (!bookId || !bibleId) return;
    const getChapters = async () => {
      const res = await fetch(`/api/scripture/bibles/${bibleId}/books/${bookId}/chapters`);
      const data = await res.json();
      setChapters(data?.data || []);
    };

    getChapters();
  }, [bookId, bibleId]);

  useEffect(() => {
    if (!chapterId || !bibleId) return;
    const getChapter = async () => {
      const res = await fetch(`/api/scripture/bibles/${bibleId}/chapters/${chapterId}`);
      const data = await res.json();
      setChapter(data?.data || null);
    };

    getChapter();
  }, [chapterId, bibleId]);

  const handleChapterChange = (newChapterId: string, newBookId: string) => {
    setBookId(newBookId);
    setChapterId(newChapterId);

    // Optionally update the URL to reflect the new state
    router.push(`/app/bible/session/${uid}?bibleId=${bibleId}&bookId=${newBookId}&chapterId=${newChapterId}`);
  };

  const goToChapter = (chapter: ChapterRefTypes | undefined) => {
    if (!chapter?.id) return;
    handleChapterChange(chapter.id, chapter.bookId);
  };

  return (
    <>
      {/* Conditionally render the modal */}
      <BibleInviteModal 
        isOpen={isInviteModalOpen} 
        onClose={() => setInviteModalOpen(false)} 
      />

      <header className="flex h-[74px] shrink-0 items-center sticky top-0 bg-white dark:bg-gray-500 z-10  transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
        <div className="flex items-center gap-2 px-4">
          {isMobile && (
            <SidebarTrigger className="-ml-1" hamburgerIcon={isMobile} />
          )}
        </div>

        <div className="  flex items-center gap-4 px-4  w-full justify-center ">
          {/* <Select onValueChange={(value) => setLanguage(value)} defaultValue={language}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Language" />
            </SelectTrigger>
            <SelectContent>
              {(languages as Language[]).map((lang) => (
                <SelectItem  key={lang.id} value={lang.id}>{lang.name}</SelectItem>
              ))}
            </SelectContent>
          </Select> */}

          <Select onValueChange={(value) => setBibleId(value)} defaultValue={bibleId}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Version" />
            </SelectTrigger>
            <SelectContent >
              {bibles.filter(b => b.language.id === language).map((bible) => (
                <SelectItem onClick={() => setBibleId(bible.id)} key={bible.id} value={bible.id}>{bible.nameLocal}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select onValueChange={(value) => setBookId(value)} defaultValue={bookId}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Book" />
            </SelectTrigger>
            <SelectContent >
              {books.map((book) => (
                <SelectItem onClick={() => setBookId(book.id)} key={book.id} value={book.id}>{book.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {chapters.length > 0 && (
            <Select onValueChange={(value) => setChapterId(value)} defaultValue={chapterId}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Chapter" />
              </SelectTrigger>
              <SelectContent >
                {chapters.map((chapter) => (
                  <SelectItem onClick={() => setChapterId(chapter.id)} key={chapter.id} value={chapter.id}>{chapter.reference}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        {userData && userData.uid == uid && (
          <div className="flex items-center ">
            <div className="mr-2">
              <Button variant="outline" onClick={() => setInviteModalOpen(true)}><UserRoundPlusIcon className="w-4 h-4" /></Button>
            </div>
            <div className="mr-2">
              <Button variant="outline" onClick={() => console.log("Settings")}><SettingsIcon className="w-4 h-4" /></Button>
            </div>

          </div>
        )}
        <div className="mr-2">
            <Button variant="outline" onClick={() => console.log("AI Chat")}><BotIcon className="w-4 h-4" /></Button>
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
            disabled={!chapter || !chapter.previous}
            onClick={() => goToChapter(chapter?.previous)}
          >
            <ChevronLeftIcon className="w-8 h-8" />
          </button>

          <button
            className=" bg-white/70  p-2 rounded-full hover:bg-gray-200 disabled:opacity-20"
            disabled={!chapter || !chapter.next}
            onClick={() => goToChapter(chapter?.next)}
          >
            <ChevronRightIcon className="w-8 h-8" />
          </button>
        </div>
          
        {/* userData.bibleRoom.invited.length > 0 */}
        <main className="h-full overflow-y-auto px-16">
          {chapter && userData && (
            ( userData.bibleRoom.sharing && userData.uid == uid || (userData && uid != userData.uid)) ? (
              <BibleRoom roomId={uid}>  
                <BibleSharing chapterData={chapter} userData={userData}/>
              </BibleRoom>
            ) : (
              <BibleSolo chapterData={chapter} userData={userData} bibleLocalName={bibleLocalName} bookLocalName={bookLocalName} friends={friends}/>
            )
          )}
          
        </main>
      </div>
    </>
  );
}
