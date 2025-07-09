import { formatChapterHTML } from "@/utils/formater";
import { UserType } from "@/data/types";
import { useAuth } from "@/app/context/AuthContext";
import VerseSelectionMenu from "@/components/VerseSelectionMenu";
import { useState, useMemo } from "react";

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

export default function BibleSolo({
  chapterData,
  userData,
}: {
  chapterData: Chapter;
  userData: UserType;
}) {
  const { updateBiblePersonalization } = useAuth();
  const [selectedVerses, setSelectedVerses] = useState<number[]>([]);
  const [menuPosition, setMenuPosition] = useState<{ x: number; y: number } | null>(null);

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

        if (newSelected.length > 0 && !menuPosition) {
          setMenuPosition({ x: e.clientX, y: e.clientY });
        } else if (newSelected.length === 0) {
          setMenuPosition(null);
        }

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
    setSelectedVerses([]);
    setMenuPosition(null);
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
    setMenuPosition(null);
  };

  const handleCopy = () => {
    if (selectedVerses.length === 0) return;
    const { bookId, id: chapterId } = chapterData;
    const sortedVerses = [...selectedVerses].sort((a, b) => a - b);
    const verseText = `${bookId} ${chapterId.split(".")[1]}:${sortedVerses.join(",")}`;
    navigator.clipboard.writeText(verseText);
    setSelectedVerses([]);
    setMenuPosition(null);
  };

  const handleShowSelected = () => {
    const versesByChapter: Record<string, number[]> = {};
    const perso = userData.biblePersonalization;

    if (perso) {
        for (const bibleId in perso) {
            for (const bookId in perso[bibleId]) {
                for (const chapterId in perso[bibleId][bookId]) {
                    const verseNumbers = Object.keys(perso[bibleId][bookId][chapterId]).map(Number);
                    const key = `${bookId} ${chapterId.split('.')[1]}`;
                    if (!versesByChapter[key]) {
                        versesByChapter[key] = [];
                    }
                    versesByChapter[key].push(...verseNumbers);
                }
            }
        }
    }

    const formattedStrings = Object.entries(versesByChapter).map(([chapter, verses]) => {
        const sorted = verses.sort((a,b) => a - b);
        return `${chapter}:${sorted.join(',')}`;
    });

    alert(`Selected Verses: ${formattedStrings.join("; ")}`);
    setMenuPosition(null);
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

  return (
    <div className="p-4 max-w-2xl mx-auto" onClick={handleVerseClick}>
      {chapterData && (
        <div className="prose w-[400px] mb-30 mt-8">
          <h2 className="text-xl font-semibold text-center mb-4">
            {chapterData.reference}
          </h2>
          <div dangerouslySetInnerHTML={{ __html: chapterHTML }} />
          <div className="mt-4 text-gray-300 text-[12px]">
            {chapterData?.copyright}
          </div>
        </div>
      )}
      {menuPosition && selectedVerses.length > 0 && (
        <div
          style={{ top: menuPosition.y, left: menuPosition.x, position: "fixed" }}
          onClick={(e) => e.stopPropagation()} // Prevent clicks inside the menu from closing it
        >
          <VerseSelectionMenu
            isHighlighted={isAnyVerseHighlighted}
            onHighlight={handleHighlight}
            onRemoveHighlight={handleRemoveHighlight}
            onCopy={handleCopy}
            onShowSelected={handleShowSelected}
            onClose={() => {
              setSelectedVerses([]);
              setMenuPosition(null);
            }}
          />
        </div>
      )}
    </div>
  );
}