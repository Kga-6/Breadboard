import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { ChapterTypes, ChapterRefTypes } from "@/types";

export default function NavMenu({
  initialChapter,
  goToChapter
}: {
  initialChapter: ChapterTypes;
  goToChapter: (chapter: ChapterRefTypes) => void;
}) {
  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-4 bg-white p-2 rounded-full shadow-md dark:bg-black">
      <button
        className=" bg-white/70 p-2 rounded-full hover:bg-gray-200 disabled:opacity-20"
        disabled={!initialChapter || !initialChapter.previous}
        onClick={() => goToChapter(initialChapter?.previous as ChapterRefTypes)}
      >
        <ChevronLeftIcon className="w-8 h-8" />
      </button>

      <button
        className=" bg-white/70  p-2 rounded-full hover:bg-gray-200 disabled:opacity-20"
        disabled={!initialChapter || !initialChapter.next}
        onClick={() => goToChapter(initialChapter?.next as ChapterRefTypes)}
      >
        <ChevronRightIcon className="w-8 h-8" />
      </button>
    </div>
  )
}