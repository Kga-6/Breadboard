import { UserTypes } from "@/types";

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

const selectedVerses: Record<string, Record<string, Record<string, number[]>>> = {
  "de4e12af7f28f599-02": {    // Bible ID
    "REV": {                    // Book ID
      "REV.1": [2,4,6,7]
    }
  }
};

export function formatChapterHTML(
  chapterData: Chapter,
  userData: UserTypes,
  selectedVerseNumbers: number[] = [],
  isSharing: boolean,
  currentWordIndex: number | null
): string {
  const rawHTML = chapterData.content;
  if (!rawHTML) return '';

  let globalWordIndex = 0; 

  const parser = new DOMParser();
  const doc = parser.parseFromString(rawHTML, 'text/html');

  const formattedParagraphs: string[] = [];

  const font = !isSharing ? userData.readerSettings?.font : 'Arial';
  const fontSize = !isSharing ? userData.readerSettings?.fontSize : '18';
  const numbersAndTitles = !isSharing ? userData.readerSettings?.numbersAndTitles : true;

  const processNodeToHTML = (node: ChildNode, verseNumber: string): string => {
    if (node.nodeType === Node.ELEMENT_NODE) {
      const el = node as HTMLElement;

      if (el.classList.contains('nd')) {
        return `<span class=" mx-1.5 uppercase tracking-wide dark:text-white">${el.textContent}</span>`;
      }
      if (el.classList.contains('wj')) {
        const cleanText = el.textContent?.replace(/^¶\s*/, '') ?? '';
        return `<span class="text-red-500 mx-1.5">${cleanText}</span>`;
      }
      if (el.classList.contains('add')) {
        return `<i class="mx-1.5 dark:text-white">${el.textContent}</i>`;
      }
      return el.outerHTML;
    } else if (node.nodeType === Node.TEXT_NODE) {
      let text = node.textContent ?? '';
      text = text.replace(/¶/g, `<span></span>`);
      // Split text into words and wrap each in a span with a unique ID
      const words = text.split(/\s+/).filter(word => word.length > 0);
      return words
        .map((word) => {
          const wordId = `word-${globalWordIndex}`;
          // Check if this word's index matches the currently spoken word
          const highlightClass = globalWordIndex === currentWordIndex 
              ? 'bg-yellow-200 dark:bg-yellow-700 rounded' 
              : '';
          
          globalWordIndex++; // Increment for the next word

          // Wrap the word in a span with the unique ID and potential highlight class
          return `<span class="word ${highlightClass}" data-word-id="${wordId}">${word}</span>`;
        })
        .join(' ');

        
    }
    return '';
  };

  doc.querySelectorAll('p.p').forEach((p) => {
    const verses: string[] = [];
    let currentVerseContent = '';
    let currentVerseNumber = '';
    let isFirstVerseOfParagraph = true;

    const finalizeCurrentVerse = () => {
      if (currentVerseNumber) {
        const displayNumber = isFirstVerseOfParagraph
          ? `   ${currentVerseNumber}`
          : currentVerseNumber;

        const highlightClass =
          userData.biblePersonalization?.[chapterData.bibleId]?.[chapterData.bookId]?.[chapterData.id]?.[
            currentVerseNumber
          ] || '';
        const selectedClass = selectedVerseNumbers.includes(parseInt(currentVerseNumber, 10))
          ? 'underline decoration-dotted decoration-1 decoration-gray-500'
          : '';

        const verseHTML = `
          <span 
            data-verse="${chapterData.bibleId}:${chapterData.bookId}:${chapterData.id}:${currentVerseNumber}" 
            class="ChapterContent_verse ${highlightClass} ${selectedClass}"
          >
            <span class="chapterContent_label text-gray-500 text-sm">${
              numbersAndTitles ? displayNumber : ''
            }</span>
            <span class="chapterContent_content leading-8">${currentVerseContent.trim()}</span>
          </span>`;
        verses.push(verseHTML);
        isFirstVerseOfParagraph = false;
      }
    };

    p.childNodes.forEach((node) => {
      if (node.nodeType === Node.ELEMENT_NODE && (node as HTMLElement).classList.contains('v')) {
        finalizeCurrentVerse();
        currentVerseNumber = (node as HTMLElement).textContent ?? '';
        currentVerseContent = '';
      } else {
        currentVerseContent += processNodeToHTML(node, currentVerseNumber);
      }
    });

    finalizeCurrentVerse();

    if (verses.length > 0) {
      const paragraphHTML = `
        <div 
          class="ChapterContent_p" 
          style="font-size: ${fontSize}px; font-family: ${font};"
        >
          ${verses.join('\n')}
        </div>`;
      formattedParagraphs.push(paragraphHTML);
    }
  });

  return formattedParagraphs.join('\n');
}