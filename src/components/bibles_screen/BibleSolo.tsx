import { formatChapterHTML } from "@/utils/formater";
import { useAuth } from "@/app/context/AuthContext";
import { useState, useMemo } from "react";
import VerseSelectionDrawer from "@/components/VerseSelectionDrawer";

import { UserTypes, ChapterTypes, FriendTypes } from "@/types";

export default function BibleSolo({
  chapterData,
  userData,
  bibleLocalName,
  bookLocalName,
  friends,
}: {
  chapterData: ChapterTypes;
  userData: UserTypes;
  bibleLocalName: string;
  bookLocalName: string;
  friends: FriendTypes[];
}) {
  const { updateBiblePersonalization } = useAuth();
  const [selectedVerses, setSelectedVerses] = useState<number[]>([]);

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
    //setSelectedVerses([]);
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
    // use BIBLE API || /v1/bibles/{bibleId}/verses/{verseId}
    console.log("Verse copied")
    setSelectedVerses([]);
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

  const formattedVerseReference = useMemo(() => {
    if (selectedVerses.length === 0) return "";

    const { bookId, id: chapterId, bibleId } = chapterData;
    const chapterNumber = chapterId.split(".")[1];
    const sortedVerses = [...selectedVerses].sort((a, b) => a - b);

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

      {selectedVerses.length > 0 && (
        <VerseSelectionDrawer 
          isHighlighted={isAnyVerseHighlighted}
          onHighlight={handleHighlight}
          onRemoveHighlight={handleRemoveHighlight}
          formattedReference={formattedVerseReference}
          onCopy={handleCopy}
          friends={friends}
          onClose={() => {
            setSelectedVerses([]);
          }}
        />
      )}

    </div>
  );
}