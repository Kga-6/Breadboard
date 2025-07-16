import { useState, useMemo } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { UserTypes, ChapterTypes } from "@/types";

interface UseVerseSelectionProps {
  chapterData: ChapterTypes;
  userData: UserTypes;
  bookLocalName: string;
  bibleLocalName: string;
}

export const useVerseSelection = ({
  chapterData,
  userData,
  bookLocalName,
  bibleLocalName,
}: UseVerseSelectionProps) => {
  const { updateBiblePersonalization } = useAuth();
  const [selectedVerses, setSelectedVerses] = useState<number[]>([]);

  const handleVerseClick = (e: React.MouseEvent<HTMLElement>) => {
    const target = e.target as HTMLElement;
    const verseEl = target.closest<HTMLElement>("[data-verse]");

    if (verseEl) {
      const verseIdStr = verseEl.dataset.verse!.split(":")[3];
      const verseId = parseInt(verseIdStr);
      setSelectedVerses((prev) =>
        prev.includes(verseId) ? prev.filter((v) => v !== verseId) : [...prev, verseId]
      );
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
    console.log("Verse copied");
    setSelectedVerses([]);
  };

  const isAnyVerseHighlighted = useMemo(() => {
    const { bibleId, bookId, id: chapterId } = chapterData;
    return selectedVerses.some(
      (verseId) => userData.biblePersonalization?.[bibleId]?.[bookId]?.[chapterId]?.[verseId]
    );
  }, [selectedVerses, userData.biblePersonalization, chapterData]);

  const formattedVerseReference = useMemo(() => {
    if (selectedVerses.length === 0) return "";
    const chapterNumber = chapterData.id.split(".")[1];
    const sortedVerses = [...selectedVerses].sort((a, b) => a - b);
    // ... (rest of the formatting logic is identical)
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

  return {
    selectedVerses,
    setSelectedVerses,
    handleVerseClick,
    handleHighlight,
    handleRemoveHighlight,
    handleCopy,
    isAnyVerseHighlighted,
    formattedVerseReference,
  };
};