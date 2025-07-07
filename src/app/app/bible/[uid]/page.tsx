"use client"

import { useAuth } from "@/app/context/AuthContext";
import { useEffect, useState } from 'react';
import languages from "@/data/scriptureLang.json";
import { useParams } from 'next/navigation';
import { formatChapterHTML } from '@/utils/formater';
import { BibleRoom } from '@/components/BibleRoom';
import { useRouter } from "next/navigation";
import { BibleInviteModal } from '@/components/BibleInviteModal'; // Import the new modal


interface Language {
  id: string;
  name: string;
}

interface Bible {
  id: string;
  nameLocal: string;
  language: {
    id: string;
  };
}

interface Book {
  id: string;
  name: string;
}

interface ChapterRef {
  id: string;
  bookId: string;
  reference: string;
}

interface Chapter {
  id: string;
  reference: string;
  content: string;
  previous?: ChapterRef;
  next?: ChapterRef;
}

const allowed_bibles_string = "de4e12af7f28f599-02,06125adad2d5898a-01,9879dbb7cfe39e4d-01";

export default function Bible() {

  const router = useRouter();
  const {currentUser, userData, setBibleRoomSharing} = useAuth();

  const [isInviteModalOpen, setInviteModalOpen] = useState(false);

  const [language, setLanguage] = useState<string>("eng");
  const [bibles, setBibles] = useState<Bible[]>([]);
  const [bibleId, setBibleId] = useState<string>("de4e12af7f28f599-02");
  const [books, setBooks] = useState<Book[]>([]);
  const [bookId, setBookId] = useState<string>("GEN");
  const [chapters, setChapters] = useState<ChapterRef[]>([]);
  const [chapterId, setChapterId] = useState<string>("GEN.1");
  const [chapter, setChapter] = useState<Chapter | null>(null);
  
  const params = useParams();
  const uid = params.uid as string;

  useEffect(() => {
    const getBibles = async () => {
      const res = await fetch(`/api/scripture/bibles?ids=${allowed_bibles_string}`);
      const data = await res.json();
      setBibles(data?.data || []);
    };
    getBibles();
  }, []);

  useEffect(() => {
    if (!bibleId) return;
    const getBooks = async () => {
      const res = await fetch(`/api/scripture/bibles/${bibleId}/books`);
      const data = await res.json();
      setBooks(data?.data || []);
    };
    getBooks();
  }, [bibleId]);

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

  const goToChapter = (chapter: ChapterRef | undefined) => {
    if (!chapter?.id) return;
    setBookId(chapter.bookId)
    setChapterId(chapter.id);
  };

  const renderBible = (sharedRoom:boolean) => {
    return(
      <div className="p-4 max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">{`Bible`}</h1>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="border p-2 rounded"
          >
            {(languages as Language[]).map((lang) => (
              <option key={lang.id} value={lang.id}>{lang.name}</option>
            ))}
          </select>

          <select
            value={bibleId}
            onChange={(e) => setBibleId(e.target.value)}
            className="border p-2 rounded"
          >
            <option value="">Select Bible</option>
            {bibles.filter(b => b.language.id === language).map((bible) => (
              <option key={bible.id} value={bible.id}>{bible.nameLocal}</option>
            ))}
          </select>

          <select
            value={bookId}
            onChange={(e) => setBookId(e.target.value)}
            className="border p-2 rounded"
          >
            <option value="">Select Book</option>
            {books.map((book) => (
              <option key={book.id} value={book.id}>{book.name}</option>
            ))}
          </select>

          {chapters.length > 0 && (
            <select
              value={chapterId}
              onChange={(e) => setChapterId(e.target.value)}
              className="border p-2 rounded"
            >
              <option value="">Select Chapter</option>
              {chapters.map((chapter) => (
                <option key={chapter.id} value={chapter.id}>{chapter.reference}</option>
              ))}
            </select>
          )}
          
        </div>
        
        {currentUser &&
          (<div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
            { userData?.uid == uid &&
              <button 
                onClick={() => setInviteModalOpen(true)} 
                className='border p-2 rounded bg-gray-50 px-4'
              >
                {`Invite`}
              </button>
            }

            {sharedRoom && userData?.uid == uid &&
              <button onClick={()=>{setBibleRoomSharing(false)}} className='border p-2 rounded text-white bg-red-500'>{`Stop sharing`}</button>
            }
            
            {sharedRoom && userData?.uid != uid  &&
              (<button onClick={()=>{router.push(`/app/bible/${userData?.uid}`)}} className='border p-2 text-white rounded bg-red-500'>Leave</button>)
            }
          </div>)
        }

        {chapter && (
          <div className="prose max-w-none">
            <h2 className="text-xl font-semibold mb-2">{chapter.reference}</h2>
            <div dangerouslySetInnerHTML={{ __html: formatChapterHTML(chapter.content) }} />

            <div className="flex justify-between mt-6">
              <button
                className="px-4 py-2 bg-gray-200 rounded"
                disabled={!chapter.previous}
                onClick={() => goToChapter(chapter.previous)}
              >
                ◀ Prev
              </button>
              <button
                className="px-4 py-2 bg-gray-200 rounded"
                disabled={!chapter.next}
                onClick={() => goToChapter(chapter.next)}
              >
                Next ▶
              </button>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <>
      {/* Conditionally render the modal */}
      <BibleInviteModal 
        isOpen={isInviteModalOpen} 
        onClose={() => setInviteModalOpen(false)} 
      />

      {(userData?.bibleRoom?.sharing || uid != userData?.uid) ? (
        <BibleRoom roomId={uid}>
          {renderBible(true)}
        </BibleRoom>
      ) : (
        renderBible(false)
      )}
    </>
  );
}
