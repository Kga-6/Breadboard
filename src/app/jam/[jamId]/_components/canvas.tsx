"use client"

import Info from "./info"
import Participants from "./participants"
import Toolbar from "./toolbar"

interface CanvasProps{
  jamId:string;
}

import { useOthers, useSelf } from "@liveblocks/react/suspense";

export function CollaborativeApp() {
  const others = useOthers();
  const userCount = others.length;
  return <div>There are {userCount} other user(s) online</div>;
}

export default function Canvas({jamId}:CanvasProps){

  const { name, avatar, username } = useSelf((me) => me.info);

  console.log(name, avatar, username, jamId)

  return(
    <main
      className="h-full w-full relative bg-neutral-100 touch-none"
    >
      <Info/>
      <Participants/>
      <CollaborativeApp/>
      <Toolbar/>
    </main>
  )
}