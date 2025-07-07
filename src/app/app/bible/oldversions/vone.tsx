'use client';

import { useEffect, useState } from 'react';
import languages from "@/data/scriptureLang.json" // using ISO 639-3
const allowed_bibles_string = "de4e12af7f28f599-01, de4e12af7f28f599-02, 01b29f4b342acc35-01, 06125adad2d5898a-01, 9879dbb7cfe39e4d-01"

const bibleId = "de4e12af7f28f599-02" // KJV
const BookId = "GEN"
const chapterId = "GEN.1"
const passages = "GEN.1.3-GEN.1.5"
const verseId = "GEN.1.4"

export default function Bible() {

  // using ISO 639-3
  const [language, setLanguage] = useState<any>("eng");
  
  const [bibles, setBibles] = useState<any>(null);
  const [bible, setBible] = useState<any>(null);

  const [books, setbooks] = useState<any>(null);
  const [book, setbook] = useState<any>(null);

  const [chapters, setChapters] = useState<any>(null);
  const [chapter, setChapter] = useState<any>(null);
  const [verses, setVerses] = useState<any>(null);

  const [passage, setPassage] = useState<any>(null);

  const [verse, setVerse] = useState<any>(null);

  useEffect(() => {
    const getBibles = async () => {
      const res = await fetch(`/api/scripture/bibles?ids=${allowed_bibles_string}`);
      const data = await res.json();
      setBibles(data);
    };

    const getBible = async () => {
      const res = await fetch(`/api/scripture/bibles/${bibleId}`);
      const data = await res.json();
      setBible(data);
    };

    const getBooks = async () => {
      const res = await fetch(`/api/scripture/bibles/${bibleId}/books`);
      const data = await res.json();
      setbooks(data);
    };

    const getBook = async () => {
      const res = await fetch(`/api/scripture/bibles/${bibleId}/books/${BookId}`);
      const data = await res.json();
      setbook(data);
    };

    const getChapters = async () => {
      const res = await fetch(`/api/scripture/bibles/${bibleId}/books/${BookId}/chapters`);
      const data = await res.json();
      setChapters(data);
      console.log(data)
    };

    const getChapter = async () => {
      const res = await fetch(`/api/scripture/bibles/${bibleId}/chapters/${chapterId}`);
      const data = await res.json();
      setChapter(data);
      console.log(data)
    };

    const getVerses = async () => {
      const res = await fetch(`/api/scripture/bibles/${bibleId}/chapters/${chapterId}/verses`);
      const data = await res.json();
      setVerses(data);
      console.log(data)
    };

    const getVerse = async () => {
      const res = await fetch(`/api/scripture/bibles/${bibleId}/verses/${verseId}`);
      const data = await res.json();
      setVerse(data);
      console.log(data)
    };


    const getPassage = async () => {
      const res = await fetch(`/api/scripture/bibles/${bibleId}/passages/${passages}`);
      const data = await res.json();
      setPassage(data);
      console.log(data)
    };



     getBibles();
    // getBible();
    // getBooks();
    // getBook();
    // getChapters();
    // getChapter();
     //getPassage()
     //getVerse()
    //getVerses()
  }, []);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-4">Bible</h1>
      <pre>{JSON.stringify(bibles, null, 2)}</pre>
      {passage ? (
        <div dangerouslySetInnerHTML={{ __html: passage.data.content }} />
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
}
