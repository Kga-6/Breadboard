import BibleChapterContent from "./biblechaptercontent";
import { UserTypes, ChapterTypes, FriendTypes } from "@/types";

export default function BibleSolo({
  chapterData,
  userData,
  bibleLocalName,
  bookLocalName,
  friends,
  currentWordIndex,
}: {
  chapterData: ChapterTypes;
  userData: UserTypes;
  bibleLocalName: string;
  bookLocalName: string;
  friends: FriendTypes[];
  currentWordIndex: number | null;
}) {
  return (
    <BibleChapterContent
      chapterData={chapterData}
      userData={userData}
      bibleLocalName={bibleLocalName}
      bookLocalName={bookLocalName}
      friends={friends}
      currentWordIndex={currentWordIndex}
      isSharing={false}
    />
  );
}