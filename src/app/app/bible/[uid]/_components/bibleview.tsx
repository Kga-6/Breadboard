'use client';

import { useAuth } from "@/app/context/AuthContext";
import { useEffect, useState } from 'react';
import languages from "@/data/scriptureLang.json";
import { useParams } from 'next/navigation';
import { formatChapterHTML } from '@/utils/formater';
import Link from "next/link";

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

interface BibleViewProps {
  sharedRoom: boolean;
}

export default function BibleView({ sharedRoom }: BibleViewProps) {

  const {currentUser, userData} = useAuth();

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

  const handleInvite = async () =>{
    
  }

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

  return(
    <div className="p-4 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">{`Bible Reader [${sharedRoom}]`}</h1>

      <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 mb-6">
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

        <button className='border p-2 rounded bg-amber-100 font-bold'>{`Invite [${userData?.bibleRoom?.sharing}]`}</button>
        
      </div>

      {sharedRoom &&
        (<Link href={`/app/bible/${userData?.uid}`} className='border p-2 rounded bg-red-500 font-bold'>Leave</Link>)
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
