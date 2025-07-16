"use client"

import { useMemo } from "react";
import { formatChapterHTML } from "@/utils/formater";
import { useVerseSelection } from "@/hooks/useVerseSelection";
import VerseSelectionDrawer from "@/components/VerseSelectionDrawer";
import { UserTypes, ChapterTypes, FriendTypes } from "@/types";

interface BibleChapterContentProps {
  chapterData: ChapterTypes;
  userData: UserTypes;
  bibleLocalName: string;
  bookLocalName: string;
  friends: FriendTypes[];
  isSharing: boolean; // Differentiator
  currentWordIndex: number | null;
  children?: React.ReactNode; // For cursor overlays in sharing mode
}

export default function BibleChapterContent({
  chapterData,
  userData,
  bibleLocalName,
  bookLocalName,
  friends,
  isSharing,
  currentWordIndex,
  children, // Render children (cursors)
  ...props // Pass down other props like onPointerMove
}: BibleChapterContentProps & React.HTMLAttributes<HTMLElement>) {
  
  const {
    selectedVerses,
    setSelectedVerses,
    handleVerseClick,
    handleHighlight,
    handleRemoveHighlight,
    handleCopy,
    isAnyVerseHighlighted,
    formattedVerseReference,
  } = useVerseSelection({ chapterData, userData, bookLocalName, bibleLocalName });

  const chapterHTML = useMemo(() => {
    // The `isSharing` prop now controls the output of formatChapterHTML
    return formatChapterHTML(chapterData, userData, selectedVerses, isSharing, currentWordIndex);
  }, [chapterData, userData, selectedVerses, isSharing, currentWordIndex]);

  return (
    <main
      className="p-4 px-[64px] flex items-center justify-center overflow-hidden"
      onClick={handleVerseClick}
      {...props} // Spread pointer events etc.
    >
      {children /* Render cursors here */}
      <div className="max-w-2xl mx-auto">
        <div className="prose w-[400px] mb-30 mt-8">
          <h2 className="text-xl font-semibold text-center mb-4">{chapterData.reference}</h2>
          <div dangerouslySetInnerHTML={{ __html: chapterHTML }} />
          <div className="mt-4 text-gray-300 text-[12px]">{chapterData?.copyright}</div>
        </div>

        {selectedVerses.length > 0 && (
          <VerseSelectionDrawer
            isHighlighted={isAnyVerseHighlighted}
            onHighlight={handleHighlight}
            onRemoveHighlight={handleRemoveHighlight}
            formattedReference={formattedVerseReference}
            onCopy={handleCopy}
            friends={friends}
            onClose={() => setSelectedVerses([])}
          />
        )}
      </div>
    </main>
  );
}