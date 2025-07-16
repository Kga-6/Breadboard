import { useState, useEffect, useRef } from "react";
import Cursor from "@/components/Cursor";
import BibleChapterContent from "./biblechaptercontent";

import {  useOthers, useSelf, useMyPresence } from "@liveblocks/react";

import { UserTypes, ChapterTypes, FriendTypes } from "@/types";

const COLORS = [
  "#E57373",
  "#9575CD",
  "#4FC3F7",
  "#81C784",
  "#FFF176",
  "#FF8A65",
  "#F06292",
  "#7986CB",
];

interface ParticipantTypes {
  uid: string;
  info: {
    // Example properties, for useSelf, useUser, useOthers, etc.
    uid: string;
    name: string;
    username: string
    avatar: string;
  };
};

export const BibleSharing = ({
  chapterData,
  userData,
  bibleLocalName,
  bookLocalName,
  friends,
  setParticipants,
  currentWordIndex,
}: {
  chapterData: ChapterTypes, 
  userData: UserTypes,
  bibleLocalName: string,
  bookLocalName: string,
  friends: FriendTypes[]
  setParticipants: (participants: ParticipantTypes[]) => void
  currentWordIndex: number | null
}) => {

  const [{ cursor }, updateMyPresence] = useMyPresence();
  const others = useOthers();
  const currentUser = useSelf();
  const previousOthersCount = useRef(others.length);
  
  useEffect(() => {
    const othersList = others.map(({ info }) => ({
      uid: info?.uid ?? "", // info.uid should be the Firebase user id
      info: {
        uid: info?.uid ?? "",
        name: info?.name ?? "",
        username: info?.username ?? "",
        avatar: info?.avatar ?? ""
      }
    }));
  
    if (currentUser?.info) {
      othersList.push({
        uid: currentUser.info.uid ?? "", // use the actual user id
        info: {
          uid: currentUser.info.uid ?? "",
          name: currentUser.info.name ?? "",
          username: currentUser.info.username ?? "",
          avatar: currentUser.info.avatar ?? ""
        }
      });
    }
  
    setParticipants(othersList);
  }, [others, currentUser]);

  useEffect(() => {
    // 3. Compare the current user count with the previous count.
    if (others.length > previousOthersCount.current) {
      // A user entered
      const joinSound = new Audio('/sounds/join.mp3');
      joinSound.play();
      console.log("User joined");
    } else if (others.length < previousOthersCount.current) {
      // A user left
      const leaveSound = new Audio('/sounds/leave.mp3');
      leaveSound.play();
      console.log("User left");
    }

    // 4. Update the ref with the current count for the next render.
    previousOthersCount.current = others.length;
  }, [others.length]); // This effect runs only when the number of users changes

  return (
    <BibleChapterContent
      chapterData={chapterData}
      userData={userData}
      bibleLocalName={bibleLocalName}
      bookLocalName={bookLocalName}
      friends={friends}
      currentWordIndex={currentWordIndex}
      isSharing={true} // Key difference!
      onPointerMove={(event) => {
        if (event.buttons !== 1) {
          const rect = event.currentTarget.getBoundingClientRect();
          updateMyPresence({
            chapterId: chapterData.id,
            cursor: {
              x: Math.round(event.clientX - rect.left) - 15,
              y: Math.round(event.clientY - rect.top) + 84,
            },
          });
        }
      }}
      onPointerLeave={() =>
        updateMyPresence({ chapterId: "", cursor: undefined })
      }
    >
      {/* Cursors are passed as children to be rendered as an overlay */}
      {others.map(({ connectionId, presence }) => {
        if (presence.cursor === undefined || presence.chapterId !== chapterData.id) {
          return null;
        }
        return (
          <Cursor
            key={`cursor-${connectionId}`}
            color={COLORS[connectionId % COLORS.length]}
            x={presence.cursor.x}
            y={presence.cursor.y}
          />
        );
      })}
    </BibleChapterContent>
  );
}