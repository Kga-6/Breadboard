"use client"

import { useAuth } from "@/app/context/AuthContext";
import { useState, useEffect } from 'react';

import { useRouter } from 'next/navigation';
import { BibleRoom } from '@/components/BibleRoom';
import BibleShareRoomModal from './bibleshareroomModal';
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { BibleSharing } from "./BibleSharing";
import BibleSolo from "./BibleSolo";
import { BibleTypes, BookTypes, ChapterTypes, ChapterRefTypes } from "@/types";
import { LogOutIcon, Volume2 } from "lucide-react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import ReaderSettings from "./readersettings";
import Sidebar from "./sidebar";
import NavMenu from "./navmenu";

interface ParticipantTypes {
  uid: string;
  info: {
    // Example properties, for useSelf, useUser, useOthers, etc.
    name: string;
    username: string
    avatar: string;
  };
};

interface SpeechMarkChunk {
  type: string;
  start: number;
  end: number;
  start_time: number;
  end_time: number;
  value: string;
}

const chapterTextToSpeechTestContent = "The elder unto the wellbeloved Gaius, whom I love in the truth. Beloved, I wish above all things that thou mayest prosper and be in health, even as thy soul prospereth."

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
  initialChapters: ChapterTypes[];
  initialChapter: ChapterTypes;
  initialBibleId: string;
  initialBookId: string;
  initialChapterId: string;
}) {
  const router = useRouter();

  const {userData, setBibleRoomSharing, friends, updateReaderSettings} = useAuth();
  const { isMobile } = useSidebar()

  const bibleLocalName = initialBibles.find(b => b.id === initialBibleId)?.abbreviationLocal || "";
  const bookLocalName = initialBooks.find(b => b.id === initialBookId)?.name || "";

  const [sideSelected, setSideSelected] = useState<"Settings" | "Chat" | "AI" | "Participants" | "Notes" | null>(null);
  const [participants, setParticipants] = useState<ParticipantTypes[]>([]);

  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
  const [speechMarks, setSpeechMarks] = useState<SpeechMarkChunk[]>([]);
  const [currentWordIndex, setCurrentWordIndex] = useState<number | null>(null);

  const [isLiveblocksConnected, setIsLiveblocksConnected] = useState(false);

  const handleSideSelected = (side: "Settings" | "Chat" | "AI" | "Participants" | "Notes" | null) => {
    if(sideSelected === side) {
      setSideSelected(null);
    } else {
      setSideSelected(side);  
    }
  }

  const handleToggleSharing = async (value:boolean) => {
    try {
      setIsLiveblocksConnected(false);
      await setBibleRoomSharing(value);
    } catch (error) {
      console.error("Failed to update sharing status:", error);
    }
    handleSideSelected(null);
  };

  const handleSelectionChange = (type: 'bibleId' | 'bookId' | 'chapterId', value: string) => {
    const params = new URLSearchParams({
      bibleId: initialBibleId,
      bookId: initialBookId,
      chapterId: initialChapterId,
    });
    params.set(type, value);
    router.push(`/app/bible/session/${uid}?${params.toString()}`);
  };

  useEffect(() => {
    if (!audio) return;

    const handleTimeUpdate = () => {
      const currentTimeMs = audio.currentTime * 1000;
      const activeMarkIndex = speechMarks.findIndex(
        (mark) => currentTimeMs >= mark.start_time && currentTimeMs < mark.end_time
      );
      
      if (activeMarkIndex !== -1) {
        setCurrentWordIndex(activeMarkIndex);
      }
    };

    const handleAudioEnded = () => {
      setCurrentWordIndex(null);
      setSpeechMarks([]);
      setAudio(null);
    };

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("ended", handleAudioEnded);

    // Cleanup function to remove listeners
    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("ended", handleAudioEnded);
      audio.pause();
    };
  }, [audio, speechMarks]);

  const handleTextToSpeech = async () => {
    // If audio is already playing, stop it
    if (audio) {
      audio.pause();
      setCurrentWordIndex(null);
      setAudio(null);
      return;
    }
    
    // Get the plain text content from the current chapter
    const text = chapterTextToSpeechTestContent
    if (!text) return;

    try {
      const response = await fetch("/api/speechify", {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) throw new Error(`API call failed: ${response.status}`);
      
      const data = await response.json();
      
      if (data.audio_data && data.speech_marks?.chunks) {
        const audioSrc = `data:audio/wav;base64,${data.audio_data}`;
        const newAudio = new Audio(audioSrc);
        
        setSpeechMarks(data.speech_marks.chunks);
        setAudio(newAudio); // Set the audio object to state
        newAudio.play();   // Play the audio
      } else {
        console.error("No audio data or speech marks in response.");
      }
    } catch (error) {
      console.error("Error fetching or playing speech audio:", error);
    }
  };

  const goToChapter = (chapter: ChapterRefTypes | undefined) => {
    if (!chapter?.id) return;
    // This also just becomes a navigation event
    router.push(`/app/bible/session/${uid}?bibleId=${initialBibleId}&bookId=${chapter.bookId}&chapterId=${chapter.id}`);
  };

  return (
    <div className="dark:bg-[#1a1a1e] h-screen flex flex-col overflow-hidden">

      {/* Header */}
      <header className="flex h-[74px]  mx-2 shrink-0 items-center sticky top-0 bg-white dark:bg-[#1a1a1e] z-10  transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 ">
        {isMobile && (
          <div className="flex items-center gap-2 px-4">
            {isMobile && (
              <SidebarTrigger className="-ml-1" hamburgerIcon={isMobile} />
            )}
          </div>
        )}
        
        <div className="flex items-center gap-2   w-full justify-start">
          
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

          {userData && (
            <ReaderSettings userData={userData} updateReaderSettings={updateReaderSettings} />
          )}

          <div className="mr-2">
            <Button className="rounded-full h-10 w-10" variant="outline" onClick={() => handleTextToSpeech()}><Volume2 className="w-4 h-4" /></Button>
          </div>
          
        </div>

        {isLiveblocksConnected && userData && userData.uid == uid && userData.bibleRoom.sharing && (
          <div className="mr-2">
            <Button variant="destructive" onClick={() => {handleToggleSharing(false)}} className="rounded-full">End Session</Button>
          </div>
        )}

        {userData && userData.uid == uid && (
          <div className="flex items-center ">
            <div className="mr-2">
              {/* <Button className="rounded-full h-10 w-10" variant="outline" onClick={() => setInviteModalOpen(true)}><UserRoundPlusIcon className="w-4 h-4" /></Button> */}
              <BibleShareRoomModal />
            </div>
          </div>
        )}

        
        {isLiveblocksConnected && userData && userData.uid != uid && (
          <div className="mr-2">
            <Button variant="destructive" onClick={() => {router.push(`/app/bible/session/${userData.uid}`);}} className="rounded-full">Leave</Button>
          </div>
          // <div className="mr-2">
          //   <Button variant="destructive" onClick={() => {
          //     router.push(`/app/bible/session/${userData.uid}`);
          //   }}><LogOutIcon className="w-4 h-4" /></Button>
          // </div>
        )}
      </header>

      {/* Main */}
      <div className="flex flex-row w-full flex-1 min-h-0 overflow-hidden">

        {/* content */}
        <div className="flex-1 flex-col items-center justify-center min-h-0 overflow-hidden">

          {/* userData.bibleRoom.invited.length > 0 */}
          <div className="h-full overflow-y-auto">
            {initialChapter && userData ? (
              (userData.bibleRoom.sharing && userData.uid === uid) || (userData && uid !== userData.uid) ? (
                <BibleRoom roomId={uid} onConnectionChange={setIsLiveblocksConnected}>
                  {isLiveblocksConnected ? (
                    <BibleSharing setParticipants={setParticipants} chapterData={initialChapter} userData={userData} bibleLocalName={bibleLocalName} bookLocalName={bookLocalName} friends={friends} currentWordIndex={currentWordIndex}/>
                  ):(
                    <span>Loading bible sharing...</span>
                  )}
                </BibleRoom>
              ) : (
                <BibleSolo chapterData={initialChapter} userData={userData} friends={friends} bibleLocalName={bibleLocalName} bookLocalName={bookLocalName} currentWordIndex={currentWordIndex}/>
              )
            ) : (
              <div>Loading the word of God...</div>
            )}
          </div>

          <NavMenu initialChapter={initialChapter} goToChapter={goToChapter} />
        </div>
            
        {/* sidebar */}
        {userData && (
          <Sidebar isLiveblocksConnected={isLiveblocksConnected} sideSelected={sideSelected} handleSideSelected={handleSideSelected} userData={userData} uid={uid} participants={participants} />
        )}
        
      </div>
    </div>
  );
}
