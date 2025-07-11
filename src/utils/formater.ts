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

export function formatChapterHTML(chapterData: Chapter, userData: UserTypes, selectedVerseNumbers: number[] = []): string {
  const rawHTML = chapterData.content;
  if (!rawHTML) return '';

  const parser = new DOMParser();
  const doc = parser.parseFromString(rawHTML, 'text/html');

  const formattedParagraphs: string[] = [];

  // Helper function to process and style individual nodes (words, special text)
  // This function is stateless and can be defined once.
  const processNodeToHTML = (node: ChildNode): string => {
    if (node.nodeType === Node.ELEMENT_NODE) {
      const el = node as HTMLElement;

      if (el.classList.contains('nd')) {
        return `<span class="uppercase tracking-wide font-semibold dark:text-white">${el.textContent}</span>`;
      }
      if (el.classList.contains('wj')) {
        const cleanText = el.textContent?.replace(/^¶\s*/, '') ?? '';
        return `<span class="text-red-500">${cleanText}</span>`;
      }
      if (el.classList.contains('add')) {
        return `<i class="dark:text-white">${el.textContent}</i>`;
      }
      return el.outerHTML;

    } else if (node.nodeType === Node.TEXT_NODE) {
      let text = node.textContent ?? '';
      text = text.replace(/¶/g, `<span></span>`);
      return text;
    }
    return '';
  };

  // Iterate over each source paragraph from the raw HTML
  doc.querySelectorAll('p.p').forEach((p) => {
    // These variables are reset for each paragraph
    const verses: string[] = [];
    let currentVerseContent = '';
    let currentVerseNumber = '';

    let isFirstVerseOfParagraph = true;

    // Helper to assemble and push a completed verse into the current paragraph's `verses` array
    const finalizeCurrentVerse = () => {
      if (currentVerseNumber) {
      // Check if it's the first verse to add indentation
      const displayNumber = isFirstVerseOfParagraph
        ? `&nbsp;&nbsp;&nbsp;${currentVerseNumber}`
        : currentVerseNumber;
      

      const highlightClass = userData.biblePersonalization?.[chapterData.bibleId]?.[chapterData.bookId]?.[chapterData.id]?.[currentVerseNumber] || '';
      const selectedClass = selectedVerseNumbers.includes(parseInt(currentVerseNumber, 10)) ? 'underline decoration-dotted decoration-1 decoration-gray-500' : '';

      const verseHTML =
        `<span 
          data-verse="${chapterData.bibleId}:${chapterData.bookId}:${chapterData.id}:${currentVerseNumber}" 
          class="ChapterContent_verse ${highlightClass} ${selectedClass}"
        >
          <span class="chapterContent_label text-gray-500 text-sm">${displayNumber}</span>
          <span class="chapterContent_content leading-8">${currentVerseContent.trim()}</span>
        </span>`;
      verses.push(verseHTML);
      
      // After using the flag, set it to false for subsequent verses
      isFirstVerseOfParagraph = false;
    }
    };

    // Iterate over the nodes within the current paragraph
    p.childNodes.forEach((node) => {
      if (node.nodeType === Node.ELEMENT_NODE && (node as HTMLElement).classList.contains('v')) {
        finalizeCurrentVerse();
        currentVerseNumber = (node as HTMLElement).textContent ?? '';
        currentVerseContent = '';
      } else {
        currentVerseContent += processNodeToHTML(node);
      }
    });

    // Finalize the last verse of this specific paragraph
    finalizeCurrentVerse();

    // If the paragraph contained any verses, wrap them in a div and add to the final output array
    if (verses.length > 0) {
      const paragraphHTML = `<div class="ChapterContent_p ">\n${verses.join('\n')}\n</div>`;
      formattedParagraphs.push(paragraphHTML);
    }
  });

  // Join all the completed paragraph divs into the final string
  return formattedParagraphs.join('\n');
}